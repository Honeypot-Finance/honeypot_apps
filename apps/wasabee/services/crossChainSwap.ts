import { makeAutoObservable, runInAction } from 'mobx';
import { Token, wallet, Network, networks } from '@honeypot/shared';
import { BigNumber } from 'bignumber.js';
import { universalAccountService } from './universalAccountService';
import { SUPPORTED_PRIMARY_TOKENS } from '@particle-network/universal-account-sdk';
import { zeroAddress } from 'viem';

interface SwapQuote {
  toAmount: string;
  priceImpact: number;
  estimatedTime: number;
  route: string[];
  feeInUSD?: string;
}

class CrossChainSwapService {
  fromChain: Network | null = null;
  toChain: Network | null = null;
  fromToken: Token | null = null;
  toToken: Token | null = null;
  slippage: number = 1; // 1%

  constructor() {
    makeAutoObservable(this);
    
    // Initialize chains after universal account service loads
    setTimeout(() => {
      this.initializeChains();
    }, 100);
  }

  initializeChains = () => {
    if (!this.fromChain || !this.toChain) {
      // Use chains from universal account service
      const supportedChains = universalAccountService.availableChains;
      if (supportedChains.length > 0) {
        runInAction(() => {
          this.fromChain = this.fromChain || supportedChains[0];
          this.toChain = this.toChain || (supportedChains[1] || supportedChains[0]);
        });
      }
    }
  }

  get universalAccountBalance() {
    return wallet.universalAccount?.accountUsdValue || 0;
  }

  // Get user's wallet token balance - for regular token use (same chain only)
  async getUserTokenBalance(token: Token): Promise<string> {
    if (!token) {
      return '0';
    }

    try {
      // If wallet is on same chain as token, get the actual balance
      if (wallet.isInit && wallet.account && wallet.currentChainId.toString() === token.chainId) {
        // Force reinitialize the token to ensure it has the correct contract instance
        token.isInit = false;
        await token.init(true, {
          loadBalance: true,
          loadName: false,
          loadSymbol: false,
          loadDecimals: false,
          loadLogoURI: false,
        });
        
        return token.balanceFormatted;
      }
      
      // If wallet is on different chain, we can't get balance
      return '0';
    } catch (err) {
      console.error('Failed to get user token balance:', err);
      return '0';
    }
  }

  // Get cross-chain token balance - specifically for cross-chain swap page
  async getCrossChainTokenBalance(token: Token): Promise<string> {
    if (!token || !wallet.account) {
      return '0';
    }

    try {
      console.log(`getCrossChainTokenBalance called for ${token.symbol} on chain ${token.chainId}`);

      // Get the network for this token
      const network = networks.find(n => n.chainId.toString() === token.chainId);
      if (!network) {
        console.warn(`Network not found for chain ${token.chainId}`);
        return '0';
      }

      // Create a public client for the token's chain
      const { createPublicClient, http } = await import('viem');
      const publicClient = createPublicClient({
        chain: network.chain,
        transport: http(network.chain.rpcUrls.default.http[0])
      });

      let balance: bigint;
      
      if (token.isNative || token.address === zeroAddress) {
        // Get native token balance
        balance = await publicClient.getBalance({
          address: wallet.account as `0x${string}`,
        });
      } else {
        // Get ERC20 token balance using minimal ABI
        const minimalERC20ABI = [
          {
            name: 'balanceOf',
            type: 'function',
            stateMutability: 'view',
            inputs: [{ name: 'account', type: 'address' }],
            outputs: [{ name: 'balance', type: 'uint256' }],
          },
        ] as const;
        
        balance = await publicClient.readContract({
          address: token.address as `0x${string}`,
          abi: minimalERC20ABI,
          functionName: 'balanceOf',
          args: [wallet.account as `0x${string}`],
        }) as bigint;
      }

      // Update token balance
      token.balanceWithoutDecimals = new BigNumber(balance.toString());
      
      console.log(`Cross-chain balance loaded for ${token.symbol}:`, token.balanceFormatted);
      
      return token.balanceFormatted;
    } catch (err) {
      console.error('Failed to get cross-chain token balance:', err);
      return '0';
    }
  }

  // Get available chains from Universal Account SDK
  get availableChains() {
    return universalAccountService.availableChains;
  }

  // Get tokens for the current chains from Universal Account SDK
  getAvailableTokensForChain(chainId: number): Token[] {
    // Get the SDK tokens from Universal Account
    const sdkTokens = SUPPORTED_PRIMARY_TOKENS.filter(
      token => token.chainId === chainId
    );
    
    console.log('SDK tokens for chain', chainId, ':', sdkTokens);
    
    const tokens: Token[] = [];
    const network = networks.find(n => n.chainId === chainId);
    
    // Convert to our Token format
    sdkTokens.forEach(sdkToken => {
      // Check if it's a native token
      const isNative = sdkToken.address.toLowerCase() === zeroAddress.toLowerCase();
      
      // For native tokens, add both native and wrapped versions
      if (isNative && network) {
        // Add native token
        const nativeToken = Token.getToken({
          address: zeroAddress,
          chainId: chainId.toString(),
          isNative: true,
          name: network.nativeToken.name,
          symbol: network.nativeToken.symbol,
          decimals: network.nativeToken.decimals,
          logoURI: network.nativeToken.logoURI
        });
        nativeToken.balanceWithoutDecimals = new BigNumber(0);
        tokens.push(nativeToken);
        
        // Add wrapped native token if available
        if (network.wrappedNativeToken) {
          const wrappedToken = Token.getToken({
            address: network.wrappedNativeToken.address,
            chainId: chainId.toString(),
            isNative: false,
            name: network.wrappedNativeToken.name,
            symbol: network.wrappedNativeToken.symbol,
            decimals: network.wrappedNativeToken.decimals,
            logoURI: network.wrappedNativeToken.logoURI || network.nativeToken.logoURI
          });
          wrappedToken.balanceWithoutDecimals = new BigNumber(0);
          tokens.push(wrappedToken);
        }
      } else if (!isNative) {
        // For non-native tokens, generate metadata from SDK token type
        const tokenData: any = {
          address: sdkToken.address,
          chainId: chainId.toString(),
          isNative: false,
          decimals: sdkToken.realDecimals || sdkToken.decimals || 18,
        };
        
        // Generate name and symbol from SDK token type/assetId
        const tokenMetadata = this.getTokenMetadataFromType(sdkToken.type || sdkToken.assetId);
        tokenData.name = tokenMetadata.name;
        tokenData.symbol = tokenMetadata.symbol;
        tokenData.logoURI = tokenMetadata.logoURI;
        
        console.log('Creating token with data:', tokenData);
        
        const token = Token.getToken(tokenData);
        token.balanceWithoutDecimals = new BigNumber(0);
        tokens.push(token);
      }
    });
    
    console.log(`Created ${tokens.length} tokens for chain ${chainId}`);
    
    return tokens;
  }

  setFromChain = (chain: Network) => {
    this.fromChain = chain;
    // Reset from token when chain changes
    this.fromToken = null;
  }

  setToChain = (chain: Network) => {
    this.toChain = chain;
    // Reset to token when chain changes
    this.toToken = null;
  }

  setFromToken = async (token: Token) => {
    this.fromToken = token;
    // For cross-chain swap, we can only get balance if wallet is on the same chain
    if (token && wallet.isInit && wallet.account && wallet.currentChainId.toString() === token.chainId) {
      try {
        // Initialize token to get balance
        if (!token.isInit) {
          await token.init(false, {
            loadBalance: true,
            loadName: true,
            loadSymbol: true,
            loadDecimals: true,
            loadLogoURI: false,
          });
        } else {
          // Just refresh balance
          await token.getBalance();
        }
      } catch (err) {
        console.warn('Failed to load token balance:', err);
      }
    }
  }

  setToToken = async (token: Token) => {
    this.toToken = token;
    // For cross-chain swap, we can only get balance if wallet is on the same chain
    if (token && wallet.isInit && wallet.account && wallet.currentChainId.toString() === token.chainId) {
      try {
        // Initialize token to get balance
        if (!token.isInit) {
          await token.init(false, {
            loadBalance: true,
            loadName: true,
            loadSymbol: true,
            loadDecimals: true,
            loadLogoURI: false,
          });
        } else {
          // Just refresh balance
          await token.getBalance();
        }
      } catch (err) {
        console.warn('Failed to load token balance:', err);
      }
    }
  }

  swapChains = () => {
    const tempChain = this.fromChain;
    const tempToken = this.fromToken;
    
    this.fromChain = this.toChain;
    this.toChain = tempChain;
    
    this.fromToken = this.toToken;
    this.toToken = tempToken;
  }

  getQuote = async (fromAmount: string): Promise<SwapQuote> => {
    if (!this.fromToken || !this.toToken || !fromAmount || parseFloat(fromAmount) === 0 || !wallet.universalAccount || !this.toChain) {
      return {
        toAmount: '',
        priceImpact: 0,
        estimatedTime: 0,
        route: [],
        feeInUSD: undefined
      };
    }

    try {
      // Try to get a preview using the Universal Account
      // This will give us more accurate quotes including fees
      
      // First, we need to estimate the USD value
      // In production, this should use actual price feeds
      const tokenPrices: Record<string, number> = {
        'ETH': 3000,
        'WETH': 3000,
        'BNB': 600,
        'WBNB': 600,
        'USDT': 1,
        'USDC': 1,
        'BTC': 60000,
        'WBTC': 60000,
        'MATIC': 0.8,
        'AVAX': 35,
        'SOL': 150,
        'BERA': 0.5,
      };

      const fromTokenPrice = tokenPrices[this.fromToken.symbol.toUpperCase()] || 1;
      const toTokenPrice = tokenPrices[this.toToken.symbol.toUpperCase()] || 1;
      
      // Calculate USD value
      const fromAmountBN = new BigNumber(fromAmount);
      const usdValue = fromAmountBN.multipliedBy(fromTokenPrice);
      
      let toAmount: BigNumber;
      let feeInUSD: string | undefined;
      let priceImpact = 1; // Default 1% fee
      
      try {
        // Try to get accurate preview from Universal Account
        const preview = await this.getTransactionPreview(usdValue.toFixed(2));
        
        if (preview) {
          // Extract fee information
          feeInUSD = preview.feeInUSD;
          
          // Calculate actual amount after fees
          const feeAmount = new BigNumber(feeInUSD || '0');
          const usdValueAfterFees = usdValue.minus(feeAmount);
          toAmount = usdValueAfterFees.dividedBy(toTokenPrice);
          
          // Calculate price impact based on fees
          if (usdValue.gt(0)) {
            priceImpact = feeAmount.dividedBy(usdValue).multipliedBy(100).toNumber();
          }
        } else {
          // Fallback calculation
          const feePercentage = 0.01; // 1% fee
          const usdValueAfterFees = usdValue.multipliedBy(1 - feePercentage);
          toAmount = usdValueAfterFees.dividedBy(toTokenPrice);
          priceImpact = feePercentage * 100;
        }
      } catch (previewError) {
        console.warn('Failed to get transaction preview, using estimate:', previewError);
        // Fallback calculation
        const feePercentage = 0.01; // 1% fee
        const usdValueAfterFees = usdValue.multipliedBy(1 - feePercentage);
        toAmount = usdValueAfterFees.dividedBy(toTokenPrice);
        priceImpact = feePercentage * 100;
      }
      
      // Estimate time based on chain combination
      const estimatedTime = this.fromChain?.chainId === this.toChain?.chainId ? 30 : 180;
      
      // Build route description
      const route = [
        `Convert ${this.fromToken.symbol} to Universal Account`,
        `USD value: $${usdValue.toFixed(2)}`,
        feeInUSD ? `Network fee: $${parseFloat(feeInUSD).toFixed(2)}` : `Estimated fee: ${priceImpact.toFixed(1)}%`,
        `Receive ${this.toToken.symbol} on ${this.toChain?.displayName || this.toChain?.chain.name}`,
      ];

      console.log('Quote calculated:', {
        fromAmount,
        fromToken: this.fromToken.symbol,
        toAmount: toAmount.toFixed(6),
        toToken: this.toToken.symbol,
        usdValue: usdValue.toFixed(2),
        priceImpact,
        feeInUSD
      });
      
      return {
        toAmount: toAmount.toFixed(6),
        priceImpact,
        estimatedTime,
        route,
        feeInUSD
      };
    } catch (error) {
      console.error('Failed to get quote:', error);
      return {
        toAmount: '',
        priceImpact: 0,
        estimatedTime: 0,
        route: [],
        feeInUSD: undefined
      };
    }
  }

  // Helper method to generate token metadata from SDK type
  private getTokenMetadataFromType(type: string): { name: string; symbol: string; logoURI: string } {
    const typeUpperCase = type.toUpperCase();
    
    const tokenMetadataMap: Record<string, { name: string; symbol: string; logoURI: string }> = {
      'ETH': {
        name: 'Ethereum',
        symbol: 'ETH',
        logoURI: 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png'
      },
      'USDT': {
        name: 'Tether USD',
        symbol: 'USDT',
        logoURI: 'https://assets.coingecko.com/coins/images/325/standard/Tether.png'
      },
      'USDC': {
        name: 'USD Coin',
        symbol: 'USDC',
        logoURI: 'https://assets.coingecko.com/coins/images/6319/standard/usdc.png'
      },
      'BTC': {
        name: 'Bitcoin',
        symbol: 'BTC',
        logoURI: 'https://assets.coingecko.com/coins/images/1/standard/bitcoin.png'
      },
      'SOL': {
        name: 'Solana',
        symbol: 'SOL',
        logoURI: 'https://assets.coingecko.com/coins/images/4128/standard/solana.png'
      },
      'BNB': {
        name: 'BNB',
        symbol: 'BNB',
        logoURI: 'https://assets.coingecko.com/coins/images/825/standard/bnb-icon2_2x.png'
      },
      'MATIC': {
        name: 'Polygon',
        symbol: 'MATIC',
        logoURI: 'https://assets.coingecko.com/coins/images/4713/standard/polygon.png'
      },
      'AVAX': {
        name: 'Avalanche',
        symbol: 'AVAX',
        logoURI: 'https://assets.coingecko.com/coins/images/12559/standard/Avalanche_Circle_RedWhite_Trans.png'
      },
      'CFX': {
        name: 'Conflux',
        symbol: 'CFX',
        logoURI: 'https://assets.coingecko.com/coins/images/13079/standard/3vuYMbjN.png'
      },
      'S': {
        name: 'Sonic',
        symbol: 'S',
        logoURI: 'https://assets.coingecko.com/coins/images/33720/standard/SonicLabs.jpg'
      },
      'BERA': {
        name: 'Berachain',
        symbol: 'BERA',
        logoURI: 'https://cdn.prod.website-files.com/633c67ced5457aa4dec572be/67b845abe842d21521095c26_667ac3022260a22071b3cf37_u_b_f51944d0-b527-11ee-be26-a5e0a0cc15ce.png'
      }
    };
    
    return tokenMetadataMap[typeUpperCase] || {
      name: type,
      symbol: type.toUpperCase(),
      logoURI: ''
    };
  }

  // Get a preview of the transaction including fees
  async getTransactionPreview(amountInUSD: string) {
    if (!wallet.universalAccount || !this.toToken || !this.toChain) {
      return null;
    }

    try {
      // For now, return a simulated preview
      // In production, this would call the actual Universal Account API
      // when createBuyTransaction is available
      
      // Simulate fee calculation (0.5-1% of transaction value)
      const feePercentage = 0.01;
      const feeInUSD = (parseFloat(amountInUSD) * feePercentage).toFixed(2);
      
      return {
        transaction: null,
        feeInUSD,
        estimatedGas: '0',
        route: []
      };
    } catch (error) {
      console.error('Failed to get transaction preview:', error);
      return null;
    }
  }

  // Create a universal transaction for cross-chain swap
  async createSwapTransaction(fromAmount: string, toAmount: string) {
    if (!wallet.universalAccount || !this.fromToken || !this.toToken || !this.toChain) {
      throw new Error('Missing required parameters for swap');
    }

    try {
      // Determine the token type for Universal Account
      const getTokenType = (symbol: string): string => {
        // Map common token symbols to SUPPORTED_TOKEN_TYPE
        const tokenTypeMap: Record<string, string> = {
          'USDT': 'USDT',
          'USDC': 'USDC',
          'ETH': 'ETH',
          'WETH': 'ETH',
          'BNB': 'BNB',
          'WBNB': 'BNB',
          'BTC': 'BTC',
          'WBTC': 'BTC',
          'MATIC': 'MATIC',
          'AVAX': 'AVAX',
          'SOL': 'SOL',
          'BERA': 'BERA',
        };
        
        return tokenTypeMap[symbol.toUpperCase()] || symbol.toUpperCase();
      };

      const toTokenType = getTokenType(this.toToken.symbol);
      
      console.log('Creating universal transaction:', {
        chainId: this.toChain.chainId,
        expectToken: toTokenType,
        amount: toAmount
      });

      // Check if the method exists
      if (typeof wallet.universalAccount.createUniversalTransaction !== 'function') {
        console.warn('createUniversalTransaction not available, using fallback');
        // Return a mock transaction for development
        return {
          rootHash: '0x' + Math.random().toString(16).substr(2, 64),
          chainId: this.toChain.chainId,
          expectTokens: [{
            type: toTokenType,
            amount: toAmount,
          }],
          transactions: []
        };
      }

      // Create the universal transaction
      const transaction = await wallet.universalAccount.createUniversalTransaction({
        chainId: this.toChain.chainId,
        expectTokens: [
          {
            type: toTokenType,
            amount: toAmount,
          },
        ],
        transactions: [], // No follow-up transactions needed for simple swap
      });

      return transaction;
    } catch (error) {
      console.error('Failed to create swap transaction:', error);
      throw error;
    }
  }

  // Send the signed transaction
  async sendSwapTransaction(transaction: any, signature: string) {
    if (!wallet.universalAccount) {
      throw new Error('Universal Account not available');
    }

    try {
      // Check if the method exists
      if (typeof wallet.universalAccount.sendTransaction !== 'function') {
        console.warn('sendTransaction not available, using fallback');
        // Return a mock result for development
        return {
          transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
          hash: '0x' + Math.random().toString(16).substr(2, 64),
          status: 'success'
        };
      }

      const result = await wallet.universalAccount.sendTransaction({
        transaction,
        signature
      });

      return result;
    } catch (error) {
      console.error('Failed to send swap transaction:', error);
      throw error;
    }
  }

  executeSwap = async (fromAmount: string, toAmount: string) => {
    if (!wallet.universalAccount || !this.fromToken || !this.toToken) {
      throw new Error('Missing required parameters for swap');
    }

    // Create the universal transaction
    const transaction = await this.createSwapTransaction(fromAmount, toAmount);
    
    // The signing and sending will be handled by the component
    return {
      transaction,
      fromAmount,
      toAmount,
      fromToken: this.fromToken,
      toToken: this.toToken,
      fromChain: this.fromChain,
      toChain: this.toChain
    };
  }
}

export const crossChainSwapService = new CrossChainSwapService();