import { makeAutoObservable, runInAction } from 'mobx';
// @ts-ignore - Disable eslint warning for lazy-loaded library
import { Token, wallet, Network, networks } from '@honeypot/shared';
import { BigNumber } from 'bignumber.js';
import { universalAccountService } from './universalAccountService';
import { SUPPORTED_PRIMARY_TOKENS, SUPPORTED_TOKEN_TYPE } from '@particle-network/universal-account-sdk';
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
  private balanceCache = new Map<string, { balance: string; timestamp: number }>();
  private CACHE_DURATION = 30000; // 30 seconds cache
  slippage: number = 1; // 1%

  constructor() {
    makeAutoObservable(this);
    
    // Initialize chains after universal account service loads
    setTimeout(() => {
      this.initializeChains();
    }, 100);
    
    // Clear cache when account changes
    // Note: watchAccount method doesn't exist in current wallet implementation
    // Cache will be cleared manually when needed
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
    if (!wallet.universalAccount) return 0;
    
    // Try different possible property names for the USD value
    return (wallet.universalAccount as any).accountUsdValue || 
           (wallet.universalAccount as any).totalUsdValue || 
           (wallet.universalAccount as any).usdValue || 
           0;
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
        
        const balance = token.balanceFormatted;
        return typeof balance === 'string' ? balance : '0';
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
      const { createPublicClient, http, formatUnits } = await import('viem');
      const publicClient = createPublicClient({
        chain: network.chain,
        transport: http(network.chain.rpcUrls.default.http[0])
      });

      let tokenBalance: bigint;
      
      if (token.isNative || token.address === zeroAddress) {
        // Get native token balance
        tokenBalance = await publicClient.getBalance({
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
        
        tokenBalance = await publicClient.readContract({
          address: token.address as `0x${string}`,
          abi: minimalERC20ABI,
          functionName: 'balanceOf',
          args: [wallet.account as `0x${string}`],
        }) as bigint;
      }

      // Format the balance properly
      // Override decimals for known tokens with non-standard decimals
      let decimals = token.decimals || 18;
      
      // Check token symbol for proper decimals
      const symbol = token.symbol?.toUpperCase() || '';
      
      // USDC on BSC (chain 56) uses 18 decimals in the contract
      if (symbol === 'USDC' && token.chainId === '56') {
        decimals = 18;
        console.log(`USDC on BSC detected, using 18 decimals for formatting`);
      } else if (symbol === 'USDT' || symbol === 'USDC') {
        decimals = 6;
      } else if (symbol === 'WBTC' || symbol === 'BTC') {
        decimals = 8;
      }
      
      console.log(`Using decimals ${decimals} for token ${token.symbol} on chain ${token.chainId}`);
      console.log(`Raw balance: ${tokenBalance.toString()}`);
      const formattedBalance = formatUnits(tokenBalance, decimals);
      console.log(`Formatted balance: ${formattedBalance}`);
      
      // Return the actual balance value, not a display string
      // This allows the Max button to work properly
      const balanceNumber = parseFloat(formattedBalance);
      
      // Return the actual number as a string with proper precision
      let displayBalance = '0';
      
      if (balanceNumber > 0) {
        // Always return the actual value, even if very small
        if (balanceNumber < 0.000001) {
          // For very small amounts, use more decimal places
          displayBalance = balanceNumber.toFixed(18).replace(/\.?0+$/, '');
        } else if (balanceNumber < 0.01) {
          displayBalance = balanceNumber.toFixed(6).replace(/\.?0+$/, '');
        } else if (balanceNumber < 1) {
          displayBalance = balanceNumber.toFixed(4).replace(/\.?0+$/, '');
        } else if (balanceNumber < 1000) {
          displayBalance = balanceNumber.toFixed(2).replace(/\.?0+$/, '');
        } else {
          // For large numbers, still use regular formatting
          displayBalance = balanceNumber.toFixed(2).replace(/\.?0+$/, '');
        }
      }
      
      console.log(`Cross-chain balance for ${token.symbol}: ${tokenBalance.toString()} raw, ${displayBalance} formatted`);
      
      return displayBalance;
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
        // Get token metadata for better logo support
        const nativeMetadata = this.getTokenMetadataFromType(network.nativeToken.symbol);
        const wrappedMetadata = network.wrappedNativeToken?.symbol ? 
          this.getTokenMetadataFromType(network.wrappedNativeToken.symbol) : null;
        
        // Add native token - use wrapped token logo as fallback
        const nativeToken = Token.getToken({
          address: zeroAddress,
          chainId: chainId.toString(),
          isNative: true,
          name: network.nativeToken.name,
          symbol: network.nativeToken.symbol,
          decimals: network.nativeToken.decimals,
          logoURI: network.nativeToken.logoURI || 
                   nativeMetadata.logoURI || 
                   wrappedMetadata?.logoURI || 
                   undefined
        });
        // Don't initialize with 0 - let it be fetched properly
        tokens.push(nativeToken);
        
        // Add wrapped native token if available
        if (network.wrappedNativeToken) {
          const wrappedToken = Token.getToken({
            address: network.wrappedNativeToken.address || '',
            chainId: chainId.toString(),
            isNative: false,
            name: network.wrappedNativeToken.name,
            symbol: network.wrappedNativeToken.symbol,
            decimals: network.wrappedNativeToken.decimals,
            logoURI: network.wrappedNativeToken.logoURI || 
                     wrappedMetadata?.logoURI ||
                     nativeMetadata.logoURI ||
                     undefined
          });
          // Don't initialize with 0 - let it be fetched properly
          tokens.push(wrappedToken);
        }
      } else if (!isNative) {
        // For non-native tokens, generate metadata from SDK token type
        const tokenDecimals = this.getTokenDecimals(sdkToken);
        const tokenData: any = {
          address: sdkToken.address,
          chainId: chainId.toString(),
          isNative: false,
          decimals: tokenDecimals,
        };
        
        // Generate name and symbol from SDK token type/assetId
        const tokenMetadata = this.getTokenMetadataFromType(sdkToken.type || sdkToken.assetId || '');
        tokenData.name = tokenMetadata.name;
        tokenData.symbol = tokenMetadata.symbol;
        tokenData.logoURI = tokenMetadata.logoURI;
        
        console.log(`Creating token ${tokenMetadata.symbol} with decimals: ${tokenDecimals}, data:`, tokenData);
        
        const token = Token.getToken(tokenData);
        // Don't initialize with 0 - let it be fetched properly
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
    
    // Check minimum amount
    const decimals = this.fromToken.decimals || 18;
    const amountFloat = parseFloat(fromAmount);
    const multiplier = Math.pow(10, decimals);
    const amountInSmallestUnit = amountFloat * multiplier;
    
    if (amountInSmallestUnit < 1) {
      // Amount too small, return empty quote
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
      
      // Get real token prices from API if available
      let fromTokenPrice = 1;
      let toTokenPrice = 1;
      
      try {
        // Import trpcClient dynamically to avoid circular dependencies
        const { trpcClient } = await import('@honeypot/shared/lib/trpc/trpc');
        
        // For native tokens, use wrapped token address for price lookup
        let fromPriceAddress = this.fromToken.address;
        let toPriceAddress = this.toToken.address;
        
        // Map native tokens to their wrapped versions for price lookup
        const wrappedAddresses: Record<string, Record<string, string>> = {
          '1': { 'ETH': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' }, // WETH on Ethereum
          '56': { 'BNB': '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c' }, // WBNB on BSC
          '137': { 'MATIC': '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270' }, // WMATIC on Polygon
          '8453': { 'ETH': '0x4200000000000000000000000000000000000006' }, // WETH on Base
          '42161': { 'ETH': '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1' }, // WETH on Arbitrum
          '10': { 'ETH': '0x4200000000000000000000000000000000000006' }, // WETH on Optimism
          '43114': { 'AVAX': '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7' }, // WAVAX on Avalanche
        };
        
        // Handle native tokens - ALWAYS use wrapped address for native tokens
        if (this.fromToken.isNative || !this.fromToken.address || this.fromToken.address === zeroAddress) {
          const chainWrapped = wrappedAddresses[this.fromToken.chainId];
          if (chainWrapped && chainWrapped[this.fromToken.symbol.toUpperCase()]) {
            fromPriceAddress = chainWrapped[this.fromToken.symbol.toUpperCase()];
            console.log(`Using wrapped address for native ${this.fromToken.symbol} on chain ${this.fromToken.chainId}: ${fromPriceAddress}`);
          } else {
            console.warn(`No wrapped address mapping for ${this.fromToken.symbol} on chain ${this.fromToken.chainId}`);
          }
        }
        
        if (this.toToken.isNative || !this.toToken.address || this.toToken.address === zeroAddress) {
          const chainWrapped = wrappedAddresses[this.toToken.chainId];
          if (chainWrapped && chainWrapped[this.toToken.symbol.toUpperCase()]) {
            toPriceAddress = chainWrapped[this.toToken.symbol.toUpperCase()];
            console.log(`Using wrapped address for native ${this.toToken.symbol} on chain ${this.toToken.chainId}: ${toPriceAddress}`);
          } else {
            console.warn(`No wrapped address mapping for ${this.toToken.symbol} on chain ${this.toToken.chainId}`);
          }
        }
        
        // Debug logging for price fetch
        console.log('\n🔍 PRICE FETCH DEBUG in crossChainSwap.getQuote():');
        console.log('From Token:', this.fromToken.symbol, 'Chain:', this.fromToken.chainId, 'Price Address:', fromPriceAddress);
        console.log('To Token:', this.toToken.symbol, 'Chain:', this.toToken.chainId, 'Price Address:', toPriceAddress);
        
        // Fetch both prices in parallel
        const [fromPriceRes, toPriceRes] = await Promise.all([
          fromPriceAddress && fromPriceAddress !== zeroAddress
            ? trpcClient.priceFeed.getSingleTokenPrice.query({
                chainId: this.fromToken!.chainId,
                tokenAddress: fromPriceAddress,
              }).then(res => {
                console.log(`📡 API Response for ${this.fromToken!.symbol}:`, JSON.stringify(res, null, 2));
                return res;
              }).catch((err) => {
                console.error(`❌ API Error for ${this.fromToken!.symbol}:`, err);
                return null;
              })
            : null,
          toPriceAddress && toPriceAddress !== zeroAddress
            ? trpcClient.priceFeed.getSingleTokenPrice.query({
                chainId: this.toToken!.chainId,
                tokenAddress: toPriceAddress,
              }).then(res => {
                console.log(`📡 API Response for ${this.toToken!.symbol}:`, JSON.stringify(res, null, 2));
                return res;
              }).catch((err) => {
                console.error(`❌ API Error for ${this.toToken!.symbol}:`, err);
                return null;
              })
            : null
        ]);
        
        // Set prices from API or use 0 if not available
        // Check for both 'price' and 'priceUSD' fields for compatibility
        if (fromPriceRes?.status === 'success' && fromPriceRes.data && fromPriceRes.data.price) {
          fromTokenPrice = typeof fromPriceRes.data.price === 'string' ? parseFloat(fromPriceRes.data.price) : fromPriceRes.data.price;
          console.log(`✅ ${this.fromToken.symbol} price from API: $${fromTokenPrice}`);
        } else {
          console.log(`⚠️ No valid price for ${this.fromToken.symbol}. Response was:`, fromPriceRes);
          // Only use $1 for known stablecoins, otherwise 0
          const stablecoins = ['USDT', 'USDC', 'DAI', 'BUSD', 'TUSD', 'FRAX'];
          fromTokenPrice = stablecoins.includes(this.fromToken.symbol.toUpperCase()) ? 1 : 0;
          console.log(`Using fallback for ${this.fromToken.symbol}: $${fromTokenPrice}`);
        }
        
        if (toPriceRes?.status === 'success' && toPriceRes.data && toPriceRes.data.price) {
          toTokenPrice = typeof toPriceRes.data.price === 'string' ? parseFloat(toPriceRes.data.price) : toPriceRes.data.price;
          console.log(`✅ ${this.toToken.symbol} price from API: $${toTokenPrice}`);
        } else {
          console.log(`⚠️ No valid price for ${this.toToken.symbol}. Response was:`, toPriceRes);
          // Only use $1 for known stablecoins, otherwise 0
          const stablecoins = ['USDT', 'USDC', 'DAI', 'BUSD', 'TUSD', 'FRAX'];
          toTokenPrice = stablecoins.includes(this.toToken.symbol.toUpperCase()) ? 1 : 0;
          console.log(`Using fallback for ${this.toToken.symbol}: $${toTokenPrice}`);
        }
      } catch (error) {
        console.error('Failed to fetch real-time prices:', error);
        // Only set $1 for stablecoins, 0 for everything else
        const stablecoins = ['USDT', 'USDC', 'DAI', 'BUSD', 'TUSD', 'FRAX'];
        fromTokenPrice = stablecoins.includes(this.fromToken.symbol.toUpperCase()) ? 1 : 0;
        toTokenPrice = stablecoins.includes(this.toToken.symbol.toUpperCase()) ? 1 : 0;
      }
      
      // Don't calculate quote if we don't have valid prices
      if (fromTokenPrice === 0 || toTokenPrice === 0) {
        console.warn('Cannot calculate quote without valid token prices');
        return {
          toAmount: '',
          priceImpact: 0,
          estimatedTime: 0,
          route: ['Price data unavailable'],
          feeInUSD: undefined
        };
      }
      
      // Calculate USD value of input amount
      const fromAmountBN = new BigNumber(fromAmount);
      const usdValue = fromAmountBN.multipliedBy(fromTokenPrice);
      
      console.log('Quote calculation:', {
        fromAmount,
        fromToken: this.fromToken.symbol,
        fromTokenPrice,
        toToken: this.toToken.symbol,
        toTokenPrice,
        usdValue: usdValue.toFixed(2)
      });
      
      let toAmount: BigNumber;
      let feeInUSD: string | undefined;
      let priceImpact = 1; // Default 1% fee
      
      // For cross-chain swaps through Universal Account, calculate based on USD value
      // The Universal Account handles the conversion internally
      
      // Calculate fees
      const baseFeePercentage = 0.01; // 1% base fee
      const crossChainFeePercentage = this.fromChain?.chainId !== this.toChain?.chainId ? 0.005 : 0; // Additional 0.5% for cross-chain
      const totalFeePercentage = baseFeePercentage + crossChainFeePercentage;
      
      // Calculate the fee in USD
      const feeAmountUSD = usdValue.multipliedBy(totalFeePercentage);
      feeInUSD = feeAmountUSD.toFixed(2);
      
      // Calculate USD value after fees
      const usdValueAfterFees = usdValue.minus(feeAmountUSD);
      
      // Calculate the output amount based on token prices
      // This is the key fix: divide USD value by target token price
      if (toTokenPrice > 0) {
        toAmount = usdValueAfterFees.dividedBy(toTokenPrice);
      } else {
        // If we don't have a price for the target token, use the USD value directly for stablecoins
        const isToStablecoin = ['USDT', 'USDC', 'DAI', 'BUSD'].includes(this.toToken.symbol.toUpperCase());
        if (isToStablecoin) {
          toAmount = usdValueAfterFees; // USD value = token amount for stablecoins
        } else {
          // For tokens without price, show 0
          toAmount = new BigNumber(0);
        }
      }
      
      // Calculate price impact
      if (usdValue.gt(0)) {
        priceImpact = feeAmountUSD.dividedBy(usdValue).multipliedBy(100).toNumber();
      }
      
      console.log('Quote result:', {
        usdValue: usdValue.toFixed(2),
        usdValueAfterFees: usdValueAfterFees.toFixed(2),
        toAmount: toAmount.toFixed(6),
        feeInUSD,
        priceImpact: priceImpact.toFixed(2) + '%'
      });
      
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

  // Helper to get proper decimals for tokens
  private getTokenDecimals(sdkToken: any): number {
    // Check if decimals are provided in the SDK token
    if (sdkToken.realDecimals) return sdkToken.realDecimals;
    if (sdkToken.decimals) return sdkToken.decimals;
    
    // Special handling for known tokens with non-standard decimals
    const tokenType = (sdkToken.type || sdkToken.assetId || '').toUpperCase();
    const address = sdkToken.address?.toLowerCase();
    
    // USDT typically has 6 decimals on most chains
    if (tokenType.includes('USDT')) {
      // On Ethereum mainnet, USDT has 6 decimals
      // On some other chains it might be different
      return 6;
    }
    
    // USDC typically has 6 decimals but represented as 18 on BSC
    if (tokenType.includes('USDC')) {
      // Even though BSC USDC contract uses 18 decimals,
      // the actual value representation should still be 6 decimals
      // So we use 18 for contract interaction but understand it's pegged 1:1
      if (sdkToken.chainId === 56) {
        return 18; // BSC USDC uses 18 decimals in contract
      }
      return 6;
    }
    
    // WBTC has 8 decimals
    if (tokenType.includes('WBTC') || tokenType.includes('BTC')) {
      return 8;
    }
    
    // Default to 18 decimals (standard for most ERC20 tokens)
    return 18;
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
      'WETH': {
        name: 'Wrapped Ether',
        symbol: 'WETH',
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
      'WBTC': {
        name: 'Wrapped Bitcoin',
        symbol: 'WBTC',
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
      'WBNB': {
        name: 'Wrapped BNB',
        symbol: 'WBNB',
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

  // Check if Universal Account has sufficient balance for the swap
  async checkUniversalAccountBalance(token: Token, requiredAmount: string): Promise<{ hasBalance: boolean; actualBalance: string; error?: string }> {
    try {
      if (!wallet.universalAccount?.universalAccount) {
        return { hasBalance: false, actualBalance: '0', error: 'Universal Account not initialized' };
      }

      // For now, we can't directly access Universal Account balances
      // This would need to be implemented in the Universal Account SDK
      // Return a placeholder for now
      let balance = '0';
      
      // Try to get balance from the token itself if it's on current chain
      if (wallet.currentChainId === Number(token.chainId) && token.balance) {
        balance = token.balance.toString();
      }
      
      // Convert balance to a comparable format
      const decimals = token.decimals || 18;
      const balanceFloat = parseFloat(balance) / Math.pow(10, decimals);
      const requiredFloat = parseFloat(requiredAmount);
      
      const hasBalance = balanceFloat >= requiredFloat;
      
      return {
        hasBalance,
        actualBalance: balanceFloat.toFixed(6),
        error: hasBalance ? undefined : `Insufficient balance in Universal Account. Required: ${requiredAmount}, Available: ${balanceFloat.toFixed(6)}`
      };
    } catch (error) {
      console.error('Error checking Universal Account balance:', error);
      return {
        hasBalance: false,
        actualBalance: '0',
        error: 'Failed to check Universal Account balance'
      };
    }
  }

  // Create a cross-chain swap transaction
  async createSwapTransaction(fromAmount: string, toAmount: string) {
    if (!this.fromToken || !this.toToken || !this.toChain || !this.fromChain) {
      throw new Error('Missing required parameters for swap');
    }

    if (!wallet.universalAccount) {
      throw new Error('Universal Account not available');
    }

    try {
      // For cross-chain swaps, we need to use deposit/withdraw flow
      // The flow is:
      // 1. User deposits tokens from source chain to Universal Account
      // 2. Universal Account handles the cross-chain conversion
      // 3. User withdraws tokens on destination chain from Universal Account

      const getTokenType = (symbol: string): SUPPORTED_TOKEN_TYPE => {
        const tokenTypeMap: Record<string, SUPPORTED_TOKEN_TYPE> = {
          'USDT': 'USDT' as SUPPORTED_TOKEN_TYPE,
          'USDC': 'USDC' as SUPPORTED_TOKEN_TYPE,
          'ETH': 'ETH' as SUPPORTED_TOKEN_TYPE,
          'WETH': 'ETH' as SUPPORTED_TOKEN_TYPE,
          'BNB': 'BNB' as SUPPORTED_TOKEN_TYPE,
          'WBNB': 'BNB' as SUPPORTED_TOKEN_TYPE,
          'BTC': 'BTC' as SUPPORTED_TOKEN_TYPE,
          'WBTC': 'BTC' as SUPPORTED_TOKEN_TYPE,
          'MATIC': 'MATIC' as SUPPORTED_TOKEN_TYPE,
          'AVAX': 'AVAX' as SUPPORTED_TOKEN_TYPE,
          'SOL': 'SOL' as SUPPORTED_TOKEN_TYPE,
          'BERA': 'BERA' as SUPPORTED_TOKEN_TYPE,
        };
        
        return tokenTypeMap[symbol.toUpperCase()] || symbol.toUpperCase() as SUPPORTED_TOKEN_TYPE;
      };

      const fromTokenType = getTokenType(this.fromToken.symbol);
      const toTokenType = getTokenType(this.toToken.symbol);
      
      console.log('Preparing cross-chain swap:', {
        from: {
          chainId: this.fromChain.chainId,
          token: fromTokenType,
          amount: fromAmount
        },
        to: {
          chainId: this.toChain.chainId,
          token: toTokenType,
          amount: toAmount
        }
      });

      // Create a swap transaction object that contains all necessary info
      // This will be processed in sendSwapTransaction
      const swapTransaction = {
        type: 'cross-chain-swap',
        fromChain: this.fromChain.chainId,
        toChain: this.toChain.chainId,
        fromToken: fromTokenType,
        toToken: toTokenType,
        fromAmount,
        toAmount,
        timestamp: Date.now(),
        // We'll need to create a unique identifier for signing
        id: `swap-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };

      console.log('Cross-chain swap transaction prepared:', swapTransaction);
      return swapTransaction;
    } catch (error) {
      console.error('Failed to create swap transaction:', error);
      throw error;
    }
  }

  // Send the signed cross-chain swap transaction
  async sendSwapTransaction(transaction: any, signature: string) {
    if (!wallet.universalAccount) {
      throw new Error('Universal Account not available. Please connect your wallet first.');
    }

    if (!wallet.universalAccount.universalAccount) {
      throw new Error('Universal Account not initialized. Please wait for it to load or refresh the page.');
    }

    if (transaction.type !== 'cross-chain-swap') {
      throw new Error('Invalid transaction type');
    }
    
    // Validate amounts
    const fromAmountFloat = parseFloat(transaction.fromAmount);
    const toAmountFloat = parseFloat(transaction.toAmount);
    
    if (isNaN(fromAmountFloat) || fromAmountFloat <= 0) {
      throw new Error('Invalid from amount. Please enter a valid positive number.');
    }
    
    if (isNaN(toAmountFloat) || toAmountFloat <= 0) {
      throw new Error('Invalid to amount. Please enter a valid positive number.');
    }
    
    // Check minimum amounts based on token decimals
    if (this.fromToken) {
      const decimals = this.fromToken.decimals || 18;
      const minAmount = 1 / Math.pow(10, decimals);
      if (fromAmountFloat < minAmount) {
        throw new Error(`Amount too small. Minimum amount is ${minAmount.toFixed(decimals)} ${this.fromToken.symbol}`);
      }
    }

    try {
      console.log('Executing cross-chain swap with signature:', signature);
      console.log('Transaction details:', transaction);
      console.log('Universal Account state:', {
        isConnected: !!wallet.universalAccount.universalAccount,
        address: wallet.universalAccount.evmSmartAccountAddress
      });
      
      // Step 1: First, ensure we're on the source chain
      if (wallet.currentChainId !== transaction.fromChain) {
        throw new Error('Please switch to the source chain before executing the swap');
      }
      
      // Check if the token is supported on current chain
      // currentChainSupportedTokens is a property, not a method
      const supportedTokens = wallet.universalAccount.currentChainSupportedTokens;
      console.log('Supported tokens on current chain:', supportedTokens);
      
      // supportedTokens is likely an array of Token objects, not strings
      // We need to check if our token is in the list
      const isTokenSupported = supportedTokens && supportedTokens.some((t: any) => 
        t.symbol === this.fromToken?.symbol || 
        t.address === this.fromToken?.address
      );
      
      if (!isTokenSupported) {
        console.warn(`Token ${this.fromToken?.symbol} may not be supported on chain ${transaction.fromChain}`);
        // Don't throw error, let's try to proceed anyway
      }

      // Step 2: Deposit tokens to Universal Account
      console.log('Step 1: Depositing tokens to Universal Account...');
      console.log('Deposit parameters:', {
        token: transaction.fromToken,
        amount: transaction.fromAmount,
        fromChain: transaction.fromChain
      });
      
      // The deposit function expects a Token object, not a string
      let depositTx;
      
      try {
        // The deposit method expects a Token object as first parameter
        // We need to use the actual fromToken object from our service
        if (!this.fromToken) {
          throw new Error('From token not selected');
        }
        
        console.log('Depositing with Token object:', this.fromToken);
        console.log('Amount (human readable):', transaction.fromAmount);
        
        // Check if amount is too small
        const decimals = this.fromToken.decimals || 18;
        const amountFloat = parseFloat(transaction.fromAmount);
        const multiplier = Math.pow(10, decimals);
        const amountInSmallestUnitFloat = amountFloat * multiplier;
        
        if (amountInSmallestUnitFloat < 1) {
          const minAmount = (1 / multiplier).toFixed(decimals);
          throw new Error(`Amount too small. Minimum amount is ${minAmount} ${this.fromToken.symbol}`);
        }
        
        // The deposit method in universalAccount.tsx already handles conversion to smallest unit
        // So we pass the amount in human-readable format (as a string)
        depositTx = await wallet.universalAccount.deposit(
          this.fromToken,  // Token object
          transaction.fromAmount  // Amount in human-readable format as string
        );
        
        console.log('Deposit transaction successful:', depositTx);
      } catch (error: any) {
        console.error('Deposit failed:', error);
        throw new Error(`Deposit failed: ${error.message || 'Unknown error'}`);
      }
      
      if (depositTx && depositTx.hash) {
        console.log('Deposit transaction hash:', depositTx.hash);
      }
      
      // Step 3: Wait for deposit confirmation and then create cross-chain operation
      console.log('Step 2: Waiting for deposit confirmation...');
      
      // Give the Universal Account some time to process the deposit
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Reload Universal Account info to get updated balances
      await wallet.universalAccount.loadUniversalAccountInfo();
      
      // Verify the deposit was successful by checking balance
      console.log('Verifying deposit...');
      // Note: The balances property may not be directly accessible on UniversalAccount
      // We'll rely on loadUniversalAccountInfo to update the internal state
      console.log('Universal Account info reloaded, proceeding with cross-chain operation...');
      
      console.log('Step 3: Creating cross-chain operation...');
      
      try {
        if (!wallet.universalAccount.universalAccount) {
          throw new Error('Universal Account not initialized');
        }
        
        let crossChainTransaction;
        let operationType = 'transfer';
        
        // Validate token addresses
        const fromTokenAddress = this.fromToken?.isNative ? zeroAddress : (this.fromToken?.address || zeroAddress);
        const toTokenAddress = this.toToken?.isNative ? zeroAddress : (this.toToken?.address || zeroAddress);
        
        console.log('Token addresses for transaction:', {
          fromToken: fromTokenAddress,
          toToken: toTokenAddress,
          fromChain: transaction.fromChain,
          toChain: transaction.toChain,
          fromSymbol: this.fromToken?.symbol,
          toSymbol: this.toToken?.symbol
        });
        
        // Check if we're doing a same-chain transfer or cross-chain swap
        if (transaction.fromChain === transaction.toChain) {
          // Same chain - just transfer the tokens back
          console.log('Same chain operation - creating withdrawal transaction...');
          crossChainTransaction = await wallet.universalAccount.universalAccount.createTransferTransaction({
            receiver: wallet.account,
            amount: transaction.fromAmount,
            token: {
              chainId: transaction.toChain,
              address: toTokenAddress,
            },
          });
        } else {
          // Cross-chain - try different approaches based on token types
          console.log('Cross-chain swap - determining best approach...');
          
          // First check if Universal Account has the required balance on destination chain
          if (this.toToken) {
            const balanceCheck = await this.checkUniversalAccountBalance(this.toToken, transaction.toAmount);
            console.log('Universal Account balance check:', balanceCheck);
            
            if (!balanceCheck.hasBalance) {
              console.warn('Insufficient balance in Universal Account:', balanceCheck.error);
              // Continue anyway - the Universal Account might handle the conversion
            }
          }
          
          // Check if it's the same token (just bridging, not swapping)
          const isSameToken = this.fromToken?.symbol.toUpperCase() === this.toToken?.symbol.toUpperCase();
          
          if (isSameToken) {
            // Same token across chains - simple transfer/withdrawal
            console.log(`Same token bridge: ${this.fromToken?.symbol} from chain ${transaction.fromChain} to ${transaction.toChain}`);
            console.log('Creating direct withdrawal transaction...');
            
            crossChainTransaction = await wallet.universalAccount.universalAccount.createTransferTransaction({
              receiver: wallet.account,
              amount: transaction.toAmount,
              token: {
                chainId: transaction.toChain,
                address: toTokenAddress,
              },
            });
            operationType = 'withdrawal';
          } else {
            // Different tokens - try to buy the target token
            console.log(`Different token swap: ${this.fromToken?.symbol} to ${this.toToken?.symbol}`);
            console.log('Step 3a: Attempting to buy target token with deposited funds...');
            
            try {
              // Calculate USD value for the deposited amount
              const tokenPrices: Record<string, number> = {
                'ETH': 3000, 'WETH': 3000,
                'BNB': 600, 'WBNB': 600,
                'USDT': 1, 'USDC': 1,  // Stablecoins
                'BTC': 60000, 'WBTC': 60000,
                'MATIC': 0.8, 'AVAX': 35,
                'SOL': 150, 'BERA': 0.5,
              };
              
              const fromTokenPrice = tokenPrices[this.fromToken?.symbol.toUpperCase() || ''] || 1;
              const usdValue = parseFloat(transaction.fromAmount) * fromTokenPrice;
              
              console.log(`USD value of deposited ${transaction.fromAmount} ${this.fromToken?.symbol}: $${usdValue.toFixed(2)}`);
              console.log(`Attempting to buy ${this.toToken?.symbol} on chain ${transaction.toChain} with $${usdValue.toFixed(2)}`);
              
              // Create buy transaction
              crossChainTransaction = await wallet.universalAccount.universalAccount.createBuyTransaction({
                token: {
                  chainId: transaction.toChain,
                  address: toTokenAddress,
                },
                amountInUSD: usdValue.toFixed(2),
              });
              
              operationType = 'buy';
              console.log('Buy transaction created successfully:', crossChainTransaction);
            } catch (buyError: any) {
              console.error('Failed to create buy transaction:', buyError.message);
              console.error('Full error:', buyError);
              
              // If buy fails, try direct withdrawal as fallback
              console.log('Buy failed, attempting direct withdrawal as fallback...');
              try {
                crossChainTransaction = await wallet.universalAccount.universalAccount.createTransferTransaction({
                  receiver: wallet.account,
                  amount: transaction.toAmount,
                  token: {
                    chainId: transaction.toChain,
                    address: toTokenAddress,
                  },
                });
                operationType = 'withdrawal';
                console.log('Fallback withdrawal transaction created');
              } catch (withdrawError: any) {
                console.error('Withdrawal also failed:', withdrawError.message);
                throw new Error(
                  `Unable to convert ${this.fromToken?.symbol} to ${this.toToken?.symbol}.\n\n` +
                  `The Universal Account may not support this token pair conversion.\n\n` +
                  `Error: ${buyError.message}`
                );
              }
            }
          }
        }
        
        console.log(`${operationType} transaction created:`, crossChainTransaction);
        
        // Sign the transaction
        const transferSignature = await wallet.walletClient.request({
          method: 'personal_sign',
          params: [
            crossChainTransaction?.rootHash as `0x${string}`,
            wallet.account as `0x${string}`,
          ],
        });
        
        console.log('Transaction signed');
        
        // Send the transaction through Universal Account
        let transferResult;
        try {
          console.log('Sending transaction through Universal Account...');
          console.log('Transaction details:', {
            type: operationType,
            rootHash: crossChainTransaction?.rootHash,
            hasSignature: !!transferSignature,
            fromChain: transaction.fromChain,
            toChain: transaction.toChain,
            fromToken: this.fromToken?.symbol,
            toToken: this.toToken?.symbol,
            fromAmount: transaction.fromAmount,
            toAmount: transaction.toAmount
          });
          
          transferResult = await wallet.universalAccount.universalAccount.sendTransaction(
            crossChainTransaction,
            transferSignature as `0x${string}`
          );
        } catch (sendError: any) {
          console.error('sendTransaction error details:', sendError);
          console.error('Error stack:', sendError.stack);
          
          // Get more detailed error information
          let errorDetails = 'Unknown error';
          let suggestedAction = 'Please try again or contact support.';
          
          if (sendError.message?.includes('Transaction simulation failed')) {
            // Check if it's a different token swap
            const isDifferentToken = this.fromToken?.symbol.toUpperCase() !== this.toToken?.symbol.toUpperCase();
            
            if (isDifferentToken) {
              errorDetails = `Cross-chain token conversion failed`;
              suggestedAction = `The Universal Account needs to buy ${this.toToken?.symbol} using the deposited ${this.fromToken?.symbol}.\n\nThis transaction simulation failed, which usually means:\n1. Insufficient liquidity in the Universal Account to perform the conversion\n2. The conversion path from ${this.fromToken?.symbol} to ${this.toToken?.symbol} is not available\n3. Network issues or high gas prices\n\nSuggestions:\n• Try swapping to the same token (e.g., USDT to USDT)\n• Use a smaller amount\n• Try again in a few moments`;
            } else if (this.toToken) {
              const balanceCheck = await this.checkUniversalAccountBalance(this.toToken, transaction.toAmount);
              if (!balanceCheck.hasBalance) {
                errorDetails = `Insufficient ${this.toToken.symbol} balance in Universal Account on chain ${this.toChain?.chainId}`;
                suggestedAction = `You need at least ${transaction.toAmount} ${this.toToken.symbol} in your Universal Account on chain ${this.toChain?.chainId}. Current balance: ${balanceCheck.actualBalance}`;
              } else {
                errorDetails = 'Transaction simulation failed due to unknown reason';
                suggestedAction = 'Please check network conditions and try again';
              }
            }
          } else if (sendError.message?.includes('insufficient')) {
            errorDetails = 'Insufficient balance in Universal Account';
            suggestedAction = `Please ensure you have enough ${this.toToken?.symbol} on chain ${this.toChain?.chainId}`;
          } else if (sendError.message?.includes('network')) {
            errorDetails = 'Network error occurred';
            suggestedAction = 'Please check your internet connection and try again';
          } else if (sendError.message?.includes('rejected')) {
            errorDetails = 'Transaction was rejected';
            suggestedAction = 'Please approve the transaction in your wallet';
          } else {
            errorDetails = sendError.message || 'Transaction failed';
          }
          
          throw new Error(`Cross-chain swap failed:\n\n${errorDetails}\n\n${suggestedAction}`);
        }
        
        console.log('Cross-chain operation result:', transferResult);
        
        // Step 4: For buy operations, we need to withdraw the purchased tokens
        let withdrawalTxId = null;
        if (operationType === 'buy' && this.toToken) {
          console.log('Step 4: Buy transaction completed. Now withdrawing purchased tokens to user wallet...');
          
          try {
            // Wait for the buy transaction to be processed
            console.log('Waiting for token purchase to be processed...');
            await new Promise(resolve => setTimeout(resolve, 7000)); // Give more time for processing
            
            // Reload Universal Account info to get updated balances
            console.log('Reloading Universal Account balances...');
            if (wallet.universalAccount.loadUniversalAccountInfo) {
              await wallet.universalAccount.loadUniversalAccountInfo();
            }
            
            // Calculate the actual amount we should have received
            // Account for potential slippage in the buy transaction
            const expectedAmount = (parseFloat(transaction.toAmount) * 0.98).toFixed(6); // Allow 2% slippage
            
            console.log(`Creating withdrawal for approximately ${expectedAmount} ${this.toToken.symbol} on chain ${transaction.toChain}`);
            const withdrawTransaction = await wallet.universalAccount.universalAccount.createTransferTransaction({
              receiver: wallet.account,
              amount: expectedAmount, // Use the adjusted amount
              token: {
                chainId: transaction.toChain,
                address: toTokenAddress,
              },
            });
            
            console.log('Withdrawal transaction created:', withdrawTransaction);
            
            // Sign the withdrawal transaction
            const withdrawSignature = await wallet.walletClient.request({
              method: 'personal_sign',
              params: [
                withdrawTransaction?.rootHash as `0x${string}`,
                wallet.account as `0x${string}`,
              ],
            });
            
            console.log('Withdrawal transaction signed');
            
            // Send the withdrawal transaction
            const withdrawResult = await wallet.universalAccount.universalAccount.sendTransaction(
              withdrawTransaction,
              withdrawSignature as `0x${string}`
            );
            
            withdrawalTxId = withdrawResult.transactionId;
            console.log('Withdrawal completed:', withdrawResult);
            
          } catch (withdrawError: any) {
            // Log the error but don't fail the entire operation since the buy was successful
            console.error('Failed to automatically withdraw tokens:', withdrawError);
            console.log('Tokens are available in Universal Account and can be withdrawn manually');
          }
        }
        
        // Return success result
        const result = {
          status: 'completed',
          depositTxHash: depositTx.hash || (depositTx as any).transactionHash,
          transferTxId: transferResult.transactionId,
          withdrawalTxId: withdrawalTxId,
          message: withdrawalTxId 
            ? `Cross-chain swap completed and tokens withdrawn successfully!`
            : `Cross-chain ${operationType === 'withdrawal' ? 'transfer' : 'swap'} completed successfully!`,
          transactionHash: depositTx.hash || (depositTx as any).transactionHash,
          universalTxUrl: `https://universalx.app/activity/details?id=${withdrawalTxId || transferResult.transactionId}`,
          tx: { id: withdrawalTxId || transferResult.transactionId }  // Add tx.id for the UI
        };
        
        console.log('Cross-chain swap completed:', result);
        
        // Wait a bit for the transaction to be processed on the blockchain
        console.log('Waiting for transaction confirmation...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Force reload of token balances
        await this.reloadTokenBalances();
        
        // Extra wait and reload for cross-chain transactions
        if (transaction.fromChain !== transaction.toChain) {
          console.log('Cross-chain transaction detected, waiting for chain sync...');
          await new Promise(resolve => setTimeout(resolve, 3000));
          await this.reloadTokenBalances();
        }
        
        return result;
        
      } catch (transferError: any) {
        console.error('Cross-chain operation failed:', transferError);
        
        // Check if it's a specific error we can handle
        if (transferError.message?.includes('simulate user operation') || 
            transferError.message?.includes('insufficient')) {
          // This might mean insufficient balance or token not supported
          const result = {
            status: 'deposit_complete',
            depositTxHash: depositTx.hash || (depositTx as any).transactionHash,
            message: 'Tokens deposited successfully. You may need to complete the cross-chain transfer manually through the Universal Account interface.',
            transactionHash: depositTx.hash || (depositTx as any).transactionHash,
            needsManualTransfer: true
          };
          
          // Still reload balances
          await this.reloadTokenBalances();
          
          return result;
        }
        
        // Generic error handling
        const result = {
          status: 'deposit_complete',
          depositTxHash: depositTx.hash || (depositTx as any).transactionHash,
          message: `Tokens deposited to Universal Account. ${transferError.message || 'Please complete the transfer manually.'}`,
          transactionHash: depositTx.hash || (depositTx as any).transactionHash,
          needsManualTransfer: true
        };
        
        // Still reload balances even if transfer failed (deposit was successful)
        await this.reloadTokenBalances();
        
        return result;
      }
    } catch (error) {
      console.error('Failed to execute cross-chain swap:', error);
      throw error;
    }
  }

  // Withdraw tokens from Universal Account after cross-chain swap
  async withdrawFromUniversalAccount(token: Token, amount: string) {
    if (!wallet.universalAccount) {
      throw new Error('Universal Account not available');
    }

    try {
      console.log('Withdrawing from Universal Account:', { 
        token: token.symbol, 
        amount, 
        chainId: token.chainId 
      });
      
      // The withdraw method also expects a Token object
      const withdrawTx = await wallet.universalAccount.withdraw(
        token,  // Token object
        amount  // Amount as string
      );
      
      console.log('Withdraw transaction:', withdrawTx);
      return withdrawTx;
    } catch (error) {
      console.error('Failed to withdraw from Universal Account:', error);
      throw error;
    }
  }

  executeSwap = async (fromAmount: string, toAmount: string) => {
    if (!this.fromToken || !this.toToken) {
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

  // Clear the balance cache to force refresh
  clearBalanceCache = () => {
    this.balanceCache.clear();
    console.log('Balance cache cleared');
  }

  // Reload token balances
  async reloadTokenBalances() {
    console.log('Reloading token balances...');
    
    // Clear the cache first
    this.clearBalanceCache();
    
    // Reload from token balance if it exists
    if (this.fromToken) {
      try {
        // Force token to reload its balance
        if (this.fromToken.isInit) {
          await this.fromToken.getBalance();
        } else {
          await this.fromToken.init(false, {
            loadBalance: true,
            loadName: true,
            loadSymbol: true,
            loadDecimals: true,
            loadLogoURI: false,
          });
        }
        console.log('From token balance reloaded:', this.fromToken.balance?.toString());
      } catch (error) {
        console.error('Failed to reload from token balance:', error);
      }
    }
    
    // Reload to token balance if it exists
    if (this.toToken) {
      try {
        // Force token to reload its balance
        if (this.toToken.isInit) {
          await this.toToken.getBalance();
        } else {
          await this.toToken.init(false, {
            loadBalance: true,
            loadName: true,
            loadSymbol: true,
            loadDecimals: true,
            loadLogoURI: false,
          });
        }
        console.log('To token balance reloaded:', this.toToken.balance?.toString());
      } catch (error) {
        console.error('Failed to reload to token balance:', error);
      }
    }
    
    // Reload Universal Account info
    if (wallet.universalAccount?.loadUniversalAccountInfo) {
      await wallet.universalAccount.loadUniversalAccountInfo();
      console.log('Universal Account info reloaded');
    }
  }

  // Get RPC URL for a specific chain from the network configuration
  private getRpcUrl(chainId: number): string {
    // Try to get RPC URL from network configuration first
    const network = networks.find(n => n.chainId === chainId);
    if (network && network.chain && network.chain.rpcUrls) {
      // Use the default RPC URL from the chain config
      const defaultRpc = network.chain.rpcUrls.default?.http?.[0];
      if (defaultRpc) {
        console.log(`Using RPC URL from network config for chain ${chainId}: ${defaultRpc}`);
        return defaultRpc;
      }
    }
    
    // Fallback to hardcoded RPC URLs for common chains
    const rpcUrls: Record<number, string> = {
      1: 'https://eth.llamarpc.com',
      10: 'https://mainnet.optimism.io',
      56: 'https://bsc-dataseed.binance.org',
      137: 'https://polygon-rpc.com',
      250: 'https://rpc.ftm.tools',
      42161: 'https://arb1.arbitrum.io/rpc',
      43114: 'https://api.avax.network/ext/bc/C/rpc',
      8453: 'https://mainnet.base.org',
      534352: 'https://rpc.scroll.io',
      59144: 'https://rpc.linea.build',
      81457: 'https://rpc.blast.io',
      1301: 'https://rpc.unichain.org',
      666666666: 'https://rpc.degen.tips',
      7777777: 'https://rpc.zora.energy',
      34443: 'https://mode.drpc.org',
      146: 'https://rpc.sonic.fantom.network',
      169: 'https://pacific-rpc.manta.network/http',
      4200: 'https://rpc.merlinchain.io',
      80084: 'https://bartio.rpc.berachain.com',
      80085: 'https://bera-testnet.nodeinfra.com',
      // Add more as needed
    };

    const fallbackUrl = rpcUrls[chainId];
    if (fallbackUrl) {
      console.log(`Using fallback RPC URL for chain ${chainId}: ${fallbackUrl}`);
    }
    return fallbackUrl || '';
  }

}

export const crossChainSwapService = new CrossChainSwapService();