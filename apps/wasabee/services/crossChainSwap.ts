import { makeAutoObservable, runInAction } from 'mobx';
import { Token, wallet, Network, networks } from '@honeypot/shared';
import { BigNumber } from 'bignumber.js';
import { universalAccountService } from './universalAccountService';
import { SUPPORTED_PRIMARY_TOKENS } from '@particle-network/universal-account-sdk';
import { zeroAddress } from 'viem';
import { getUniversalTokenMetadata } from '../config/universalTokenMetadata';

interface SwapQuote {
  toAmount: string;
  priceImpact: number;
  estimatedTime: number;
  route: string[];
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
    
    // Convert to our Token format
    return sdkTokens.map(sdkToken => {
      // Check if it's a native token
      const isNative = sdkToken.address.toLowerCase() === zeroAddress.toLowerCase();
      
      // For native tokens, use chain's native token info
      if (isNative) {
        const network = networks.find(n => n.chainId === chainId);
        if (network) {
          return Token.getToken({
            address: zeroAddress,
            chainId: chainId.toString(),
            isNative: true,
            name: network.nativeToken.name,
            symbol: network.nativeToken.symbol,
            decimals: network.nativeToken.decimals,
            logoURI: network.nativeToken.logoURI
          });
        }
      }
      
      // For non-native tokens, try to get metadata from our config first
      const metadata = getUniversalTokenMetadata(chainId, sdkToken.address);
      
      const tokenData: any = {
        address: sdkToken.address,
        chainId: chainId.toString(),
        isNative: false,
      };
      
      // Use metadata if available
      if (metadata) {
        if (metadata.name) tokenData.name = metadata.name;
        if (metadata.symbol) tokenData.symbol = metadata.symbol;
        if (metadata.decimals) tokenData.decimals = metadata.decimals;
        if (metadata.logoURI) tokenData.logoURI = metadata.logoURI;
      }
      
      // Fall back to SDK properties if they exist
      if (!tokenData.name && 'name' in sdkToken) tokenData.name = (sdkToken as any).name;
      if (!tokenData.symbol && 'symbol' in sdkToken) tokenData.symbol = (sdkToken as any).symbol;
      if (!tokenData.decimals && 'decimals' in sdkToken) tokenData.decimals = (sdkToken as any).decimals;
      if (!tokenData.logoURI && 'logoURI' in sdkToken) tokenData.logoURI = (sdkToken as any).logoURI;
      
      console.log('Creating token with data:', tokenData);
      
      const token = Token.getToken(tokenData);
      
      // Only initialize if we don't have name/symbol and not from metadata
      if ((!token.symbol || !token.name) && !metadata) {
        // For now, skip initialization to avoid contract errors
        // We'll need to handle this differently
        console.log('Token missing name/symbol, would need initialization:', token.address);
      }
      
      return token;
    });
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

  setFromToken = (token: Token) => {
    this.fromToken = token;
  }

  setToToken = (token: Token) => {
    this.toToken = token;
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
    if (!this.fromToken || !this.toToken || !fromAmount || parseFloat(fromAmount) === 0) {
      return {
        toAmount: '',
        priceImpact: 0,
        estimatedTime: 0,
        route: []
      };
    }

    // Simulate quote calculation
    // In real implementation, this would call the Universal Account API
    const fromValue = new BigNumber(fromAmount).multipliedBy(1); // Placeholder: 1 USD per token
    const toTokenPrice = 1; // Placeholder: 1 USD per token
    
    // Apply a small fee/slippage simulation
    const fee = 0.003; // 0.3% fee
    const toAmount = fromValue.multipliedBy(1 - fee).dividedBy(toTokenPrice);
    
    // Calculate price impact (simulated)
    const priceImpact = Math.random() * 2; // 0-2%
    
    // Estimate time based on whether it's cross-chain
    const estimatedTime = this.fromChain?.chainId === this.toChain?.chainId ? 30 : 180; // seconds
    
    return {
      toAmount: toAmount.toFixed(6),
      priceImpact,
      estimatedTime,
      route: [
        `Deposit ${this.fromToken.symbol} to Universal Account`,
        `Swap via Particle Network`,
        `Withdraw ${this.toToken.symbol} from Universal Account`
      ]
    };
  }

  executeSwap = async (fromAmount: string, toAmount: string) => {
    if (!wallet.universalAccount || !this.fromToken || !this.toToken) {
      throw new Error('Missing required parameters for swap');
    }

    // The actual swap execution is handled in the component
    // This method could be extended to handle the full flow if needed
    return {
      success: true,
      txHash: '0x...',
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