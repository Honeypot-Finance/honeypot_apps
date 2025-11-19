/**
 * RocketX Cross-Chain Swap Service
 *
 * This service provides a high-level interface for cross-chain swaps using RocketX API.
 * It integrates with the existing wallet infrastructure and maintains compatibility
 * with the current UI components.
 *
 * Architecture:
 * - Uses MobX for reactive state management
 * - Lazy-loads dependencies to optimize bundle size
 * - Maintains token balance caching with TTL
 * - Integrates with existing tRPC price feeds for quote calculation
 */

import { makeObservable, observable, action, runInAction, toJS } from 'mobx';
import { BigNumber } from 'bignumber.js';
import { zeroAddress } from 'viem';
import { createRocketXClient, getRocketXClient } from '@/lib/rocketx/client';
import type {
  RocketXToken,
  RocketXQuoteRequest,
  RocketXQuoteResponse,
  RocketXSwapRequest,
  RocketXTransactionStatus,
} from '@/lib/rocketx/types';

// Define types locally to avoid static imports from lazy-loaded library
type Token = any;
type Network = any;

// Lazy load the shared library
let sharedLib: any = null;
let cachedWallet: any = null;
let cachedNetworks: any = null;

const getSharedLib = async () => {
  if (!sharedLib) {
    sharedLib = await import('@honeypot/shared');
    cachedWallet = sharedLib.wallet;
    cachedNetworks = sharedLib.networks;
  }
  return sharedLib;
};

const getWallet = () => {
  if (!cachedWallet && sharedLib) {
    cachedWallet = sharedLib.wallet;
  }
  return cachedWallet;
};

const getNetworks = () => {
  if (!cachedNetworks && sharedLib) {
    cachedNetworks = sharedLib.networks;
  }
  return cachedNetworks;
};

// ============================================================================
// Interfaces
// ============================================================================

export interface SwapQuote {
  toAmount: string;
  priceImpact: number;
  estimatedTime: number;
  route: string[];
  feeInUSD?: string;
  minReceived?: string;
}

interface BalanceCache {
  balance: string;
  timestamp: number;
}

// ============================================================================
// Main Service Class
// ============================================================================

class RocketXSwapService {
  // State
  fromChain: Network | null = null;
  toChain: Network | null = null;
  fromToken: Token | null = null;
  toToken: Token | null = null;
  slippage: number = 1; // 1% default slippage
  isLoadingQuote: boolean = false;
  lastQuote: SwapQuote | null = null;

  // Private state
  private balanceCache = new Map<string, BalanceCache>();
  private readonly CACHE_DURATION = 30000; // 30 seconds
  private supportedChains: Network[] = [];
  private supportedTokensCache = new Map<number, Token[]>();
  private isInitialized = false;

  constructor() {
    makeObservable(this, {
      // Observable state
      fromChain: observable,
      toChain: observable,
      fromToken: observable,
      toToken: observable,
      slippage: observable,
      isLoadingQuote: observable,
      lastQuote: observable,
      // Actions
      setFromChain: action,
      setToChain: action,
      setFromToken: action,
      setToToken: action,
      setSlippage: action,
      swapChains: action,
      getQuote: action,
      executeSwap: action,
    });

    // Load shared library and initialize
    getSharedLib()
      .then(() => this.initialize())
      .catch(console.error);
  }

  // ============================================================================
  // Initialization
  // ============================================================================

  private async initialize() {
    try {
      // Initialize RocketX client with API key from environment
      const apiKey = process.env.NEXT_PUBLIC_ROCKETX_API_KEY ||
                     process.env.ROCKETX_API_KEY ||
                     '432f1254-1443-4bcf-8526-57e44bc31db1'; // Fallback

      createRocketXClient({ apiKey });

      // Load supported chains from RocketX
      await this.loadSupportedChains();

      // Initialize default chains
      this.initializeChains();

      runInAction(() => {
        this.isInitialized = true;
      });
    } catch (error) {
      console.error('Failed to initialize RocketX Swap Service:', error);
    }
  }

  private async loadSupportedChains() {
    // RocketX doesn't expose public chain list endpoints
    // Use our configured networks directly - these are comprehensive and always work
    const networks = getNetworks() || [];

    runInAction(() => {
      this.supportedChains = networks;
    });

    /*
    // Note: This code is disabled because RocketX API doesn't have public chain endpoints
    // Using our network config is actually better as it's instant and always up-to-date

    try {
      const client = getRocketXClient();
      const response = await client.getSupportedChains();

      if (response.success && response.data) {
        // Map RocketX chains to our Network format
        const networks = getNetworks();
        runInAction(() => {
          this.supportedChains = response.data!.chains
            .map((rocketChain) => {
              // Find matching network in our config
              return networks.find(
                (n: any) => n.chainId === rocketChain.chainId
              );
            })
            .filter(Boolean);
        });
        console.log(`Loaded ${this.supportedChains.length} supported chains from RocketX`);
      }
    } catch (error) {
      console.error('Failed to load supported chains:', error);
      // Fallback to using all configured networks
      runInAction(() => {
        this.supportedChains = getNetworks() || [];
      });
    }
    */
  }

  initializeChains = () => {
    if (!this.fromChain || !this.toChain) {
      const chains = this.supportedChains.length > 0
        ? this.supportedChains
        : (getNetworks() || []);

      if (chains.length > 0) {
        runInAction(() => {
          // Default to BNB Chain (chainId 56) if available, otherwise use first chain
          const bnbChain = chains.find((c: any) => c.chainId === 56);
          const defaultFromChain = bnbChain || chains[0];
          const defaultToChain = chains.find((c: any) => c !== defaultFromChain) || chains[0];

          this.fromChain = this.fromChain || defaultFromChain;
          this.toChain = this.toChain || defaultToChain;
        });
      }
    }
  };

  // ============================================================================
  // Wallet Integration
  // ============================================================================

  isWalletConnected = () => {
    const wallet = getWallet();
    return wallet?.account ? true : false;
  };

  get userAddress(): string | null {
    return getWallet()?.account || null;
  }

  // ============================================================================
  // Chain and Token Selection
  // ============================================================================

  setFromChain = (chain: Network) => {
    this.fromChain = chain;
    this.fromToken = null;
    this.clearBalanceCache();
  };

  setToChain = (chain: Network) => {
    this.toChain = chain;
    this.toToken = null;
    this.clearBalanceCache();
  };

  setFromToken = (token: Token) => {
    this.fromToken = token;
    this.clearBalanceCache();
  };

  setToToken = (token: Token) => {
    this.toToken = token;
  };

  swapChains = () => {
    const tempChain = this.fromChain;
    const tempToken = this.fromToken;

    runInAction(() => {
      this.fromChain = this.toChain;
      this.toChain = tempChain;
      this.fromToken = this.toToken;
      this.toToken = tempToken;
    });

    this.clearBalanceCache();
  };

  setSlippage = (slippage: number) => {
    this.slippage = slippage;
  };

  // ============================================================================
  // Available Chains and Tokens
  // ============================================================================

  get availableChains(): Network[] {
    return this.supportedChains.length > 0
      ? this.supportedChains
      : (getNetworks() || []);
  }

  async getAvailableTokensForChain(chainId: number): Promise<Token[]> {
    // Check cache first
    if (this.supportedTokensCache.has(chainId)) {
      return this.supportedTokensCache.get(chainId)!;
    }

    try {
      const client = getRocketXClient();
      const response = await client.getSupportedTokens({ chainId });

      if (response.success && response.data) {
        // RocketX API returns: { tokens: [...] }
        let tokensArray: any[] = [];

        // Try different response structures (API may vary)
        const responseData: any = response.data;
        if (Array.isArray(responseData)) {
          tokensArray = responseData;
        } else if (responseData.data && Array.isArray(responseData.data)) {
          tokensArray = responseData.data;
        } else if (responseData.tokens && Array.isArray(responseData.tokens)) {
          tokensArray = responseData.tokens;
        }

        if (tokensArray.length > 0) {
          // Convert RocketX tokens to our Token format
          const tokens = await this.convertRocketXTokensToLocalFormat(
            tokensArray,
            chainId
          );

          // Cache the result
          this.supportedTokensCache.set(chainId, tokens);
          return tokens;
        }
      }
    } catch (error) {
      // Silent fail, use fallback
    }

    // Fallback: Use Particle Network token list if RocketX API fails
    return this.getFallbackTokensForChain(chainId);
  }

  /**
   * Fallback method to get tokens when API is unavailable
   * Uses the same logic as the old crossChainSwapService
   */
  private async getFallbackTokensForChain(chainId: number): Promise<Token[]> {
    try {
      // Import the old service's token list logic
      const { SUPPORTED_PRIMARY_TOKENS, SUPPORTED_TOKEN_TYPE } = await import(
        '@particle-network/universal-account-sdk'
      );

      const network = getNetworks().find((n: any) => n.chainId === chainId);
      if (!network) {
        console.warn(`Network not found for chain ${chainId}`);
        return [];
      }

      // Get SDK tokens filtered by chain
      const sdkTokens = SUPPORTED_PRIMARY_TOKENS.filter(
        (token: any) => token.chainId === chainId
      );

      // Convert to our Token format
      const { Token: TokenClass } = await getSharedLib();
      const tokens = sdkTokens.map((sdkToken: any) => {
        return new TokenClass({
          address: sdkToken.address,
          symbol: sdkToken.symbol,
          name: sdkToken.name || sdkToken.symbol,
          decimals: sdkToken.decimals,
          chainId: sdkToken.chainId.toString(),
          logoURI: sdkToken.logoURI,
          isNative: sdkToken.address === zeroAddress,
          network,
        });
      });

      // Cache the fallback tokens
      this.supportedTokensCache.set(chainId, tokens);
      console.log(`✅ Loaded ${tokens.length} fallback tokens for chain ${chainId}`);

      return tokens;
    } catch (error) {
      console.error(`Failed to load fallback tokens for chain ${chainId}:`, error);
      return [];
    }
  }

  private async convertRocketXTokensToLocalFormat(
    rocketTokens: any[],
    chainId: number
  ): Promise<Token[]> {
    // Import Token class from shared library
    const { Token: TokenClass } = await getSharedLib();
    const network = getNetworks().find((n: any) => n.chainId === chainId);

    if (!network) {
      console.warn(`Network not found for chain ${chainId}`);
      return [];
    }

    // First, deduplicate native tokens - RocketX returns both 0xeeee... and 0x0000... for native tokens
    const uniqueTokens = new Map<string, any>();

    rocketTokens.forEach((rt) => {
      const tokenData = rt.token || rt;
      const address = tokenData.contract_address || tokenData.address || tokenData.tokenAddress;
      const symbol = tokenData.token_symbol || tokenData.symbol || tokenData.ticker;
      const isNative = tokenData.is_native_token === 1 ||
                      tokenData.isNative ||
                      address === zeroAddress ||
                      address?.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

      // For native tokens, use the symbol as the key to deduplicate
      // For regular tokens, use the address
      const key = isNative ? `native_${symbol}` : address?.toLowerCase();

      if (!uniqueTokens.has(key)) {
        uniqueTokens.set(key, rt);
      } else if (isNative && address?.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
        // Prefer 0xeeee... over 0x0000... for native tokens
        uniqueTokens.set(key, rt);
      }
    });

    const converted = Array.from(uniqueTokens.values())
      .filter((rt) => {
        // RocketX uses contract_address, not address
        const addr = rt.contract_address || rt.address || rt.tokenAddress;
        if (!addr) {
          console.warn('⚠️ Skipping token without address:', rt);
          return false;
        }
        return true;
      })
      .map((rt) => {
        // RocketX API format:
        // - contract_address (not address!)
        // - token_name, token_symbol (with underscores)
        // - token_decimals
        // - icon_url
        // - is_native_token
        const tokenData = rt.token || rt;

        const address = tokenData.contract_address || tokenData.address || tokenData.tokenAddress;
        const symbol = tokenData.token_symbol || tokenData.symbol || tokenData.ticker;
        const name = tokenData.token_name || tokenData.name || tokenData.tokenName || symbol;
        const decimals = tokenData.token_decimals || tokenData.decimals || tokenData.decimal || 18;
        const logoURI = tokenData.icon_url || tokenData.logoURI || tokenData.logo || tokenData.image;
        const networkId = tokenData.network_id || tokenData.networkId; // CRITICAL for quotes!
        const isNative = tokenData.is_native_token === 1 ||
                        tokenData.isNative ||
                        address === zeroAddress ||
                        address?.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

        // Normalize the address for native tokens
        const normalizedAddress = isNative ? '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' : address;

        const token = new TokenClass({
          address: normalizedAddress,
          symbol,
          name,
          decimals,
          chainId: chainId.toString(),
          logoURI,
          isNative,
          network,
        });

        // Store network_id as a custom property - this is CRITICAL for RocketX quotes!
        if (networkId) {
          (token as any).network_id = networkId;
        }

        return token;
      });

    console.log(`✅ Successfully converted ${converted.length} tokens`);
    return converted;
  }

  // ============================================================================
  // Balance Management
  // ============================================================================

  async getCrossChainTokenBalance(token: Token): Promise<string> {
    if (!token || !getWallet().account) {
      return '0';
    }

    try {
      // Check cache
      const cacheKey = `${token.chainId}-${token.address}-${getWallet().account}`;
      const cached = this.balanceCache.get(cacheKey);
      const now = Date.now();

      if (cached && now - cached.timestamp < this.CACHE_DURATION) {
        return cached.balance;
      }

      // Fetch balance using viem
      const network = getNetworks().find(
        (n: any) => n.chainId.toString() === token.chainId
      );
      if (!network) {
        console.warn(`Network not found for chain ${token.chainId}`);
        return '0';
      }

      const { createPublicClient, http, formatUnits } = await import('viem');
      const publicClient = createPublicClient({
        chain: network.chain,
        transport: http(network.chain.rpcUrls.default.http[0]),
      });

      let tokenBalance: bigint;

      if (token.isNative || token.address === zeroAddress) {
        tokenBalance = await publicClient.getBalance({
          address: getWallet().account as `0x${string}`,
        });
      } else {
        const minimalERC20ABI = [
          {
            name: 'balanceOf',
            type: 'function',
            stateMutability: 'view',
            inputs: [{ name: 'account', type: 'address' }],
            outputs: [{ name: 'balance', type: 'uint256' }],
          },
        ] as const;

        tokenBalance = (await publicClient.readContract({
          address: token.address as `0x${string}`,
          abi: minimalERC20ABI,
          functionName: 'balanceOf',
          args: [getWallet().account as `0x${string}`],
        })) as bigint;
      }

      const decimals = token.decimals || 18;
      const formattedBalance = formatUnits(tokenBalance, decimals);
      const balanceNumber = parseFloat(formattedBalance);

      // Format balance based on magnitude
      let displayBalance = '0';
      if (balanceNumber > 0) {
        if (balanceNumber < 0.000001) {
          displayBalance = balanceNumber.toFixed(18).replace(/\.?0+$/, '');
        } else if (balanceNumber < 0.01) {
          displayBalance = balanceNumber.toFixed(6).replace(/\.?0+$/, '');
        } else if (balanceNumber < 1) {
          displayBalance = balanceNumber.toFixed(4).replace(/\.?0+$/, '');
        } else {
          displayBalance = balanceNumber.toFixed(2).replace(/\.?0+$/, '');
        }
      }

      // Cache the result
      this.balanceCache.set(cacheKey, {
        balance: displayBalance,
        timestamp: now,
      });

      return displayBalance;
    } catch (error) {
      // Silent fail for rate limit errors to avoid console spam
      const errorMessage = error instanceof Error ? error.message : '';
      const isRateLimitError = errorMessage.includes('limit exceeded') ||
                                errorMessage.includes('rate limit') ||
                                errorMessage.includes('too many requests');

      if (!isRateLimitError) {
        console.error('Failed to get cross-chain token balance:', error);
      }
      return '0';
    }
  }

  clearBalanceCache = () => {
    this.balanceCache.clear();
  };

  // ============================================================================
  // Quote Generation
  // ============================================================================

  getQuote = async (fromAmount: string): Promise<SwapQuote> => {
    if (
      !this.fromToken ||
      !this.toToken ||
      !this.fromChain ||
      !this.toChain ||
      !fromAmount ||
      parseFloat(fromAmount) === 0
    ) {
      return {
        toAmount: '',
        priceImpact: 0,
        estimatedTime: 0,
        route: [],
        feeInUSD: undefined,
      };
    }

    runInAction(() => {
      this.isLoadingQuote = true;
    });

    try {
      const client = getRocketXClient();

      // Extract network_id from tokens - this is CRITICAL!
      // The network_id comes from the RocketX API when we loaded the tokens
      const fromNetworkId = (this.fromToken as any).network_id;
      const toNetworkId = (this.toToken as any).network_id;

      if (!fromNetworkId || !toNetworkId) {
        console.error('❌ Tokens are missing network_id!', {
          fromToken: this.fromToken.symbol,
          fromNetworkId,
          toToken: this.toToken.symbol,
          toNetworkId,
        });
        return {
          toAmount: '',
          priceImpact: 0,
          estimatedTime: 0,
          route: ['Error: Token network_id not found. Please reload tokens.'],
          feeInUSD: undefined,
        };
      }

      // Prepare quote request
      const quoteRequest: RocketXQuoteRequest = {
        fromChainId: this.fromChain.chainId,
        toChainId: this.toChain.chainId,
        fromTokenAddress: this.fromToken.address || zeroAddress,
        toTokenAddress: this.toToken.address || zeroAddress,
        fromAmount,
        slippage: this.slippage,
        userAddress: this.userAddress || undefined,
      };

      console.log('🔍 Fetching RocketX quote:', quoteRequest);
      console.log('📡 Using network IDs:', { fromNetworkId, toNetworkId });

      const response = await client.getQuote(quoteRequest, fromNetworkId, toNetworkId);

      if (!response.success || !response.data) {
        const errorMsg = response.error?.message || 'Quote unavailable';
        console.warn('⚠️ Failed to get quote from RocketX:', response.error);
        console.error('🚨 THROWING ERROR TO USER:', errorMsg);
        // Throw error so it's properly caught and displayed to user
        throw new Error(errorMsg);
      }

      const { data } = response;

      // RocketX API returns: { quotes: [...], alternateRoute: [...], platformToken: {...} }
      // Pick the best quote (first one is usually the best)
      const dataAny: any = data;
      const bestQuote = dataAny.quotes && dataAny.quotes.length > 0 ? dataAny.quotes[0] : null;

      if (!bestQuote) {
        console.warn('⚠️ RocketX returned empty quotes');
        // Throw error so it's properly caught and displayed to user
        throw new Error('No quotes available for this pair');
      }

      console.log('📊 Best quote from RocketX:', bestQuote);

      // CHECK: Individual quote can have an error!
      // RocketX returns errors inside the quote object:
      // - { err: "Pair is inactive", code: 489 }
      // - { err: "Min. Amount: 0.04 ETH", code: 455 }
      // - { err: "Invalid amount...", code: 489 }
      if (bestQuote.err || bestQuote.error) {
        const errorMessage = bestQuote.err || bestQuote.error || 'Quote not available';
        console.warn('⚠️ Quote has error:', errorMessage);
        // Throw error so it's properly caught and displayed to user
        throw new Error(errorMessage);
      }

      // Parse the quote data
      // RocketX format: { toAmount, steps: [...], totalGasFee, estimatedTime, etc. }
      const toAmount = bestQuote.toAmount || bestQuote.outputAmount || '0';
      const estimatedTime = bestQuote.estimatedTime || bestQuote.time || 60; // seconds

      // Build route description from steps
      const route = bestQuote.steps?.map((step: any) => {
        return step.protocol || step.name || 'Unknown';
      }) || ['Direct swap'];

      // Calculate fees
      const gasFee = bestQuote.totalGasFee || bestQuote.gasFee || '0';
      const protocolFee = bestQuote.protocolFee || '0';
      const totalFee = parseFloat(gasFee) + parseFloat(protocolFee);

      // Price impact (if available)
      const priceImpact = bestQuote.priceImpact || 0;

      const quote: SwapQuote = {
        toAmount: toAmount.toString(),
        priceImpact,
        estimatedTime,
        route,
        feeInUSD: totalFee > 0 ? totalFee.toFixed(2) : undefined,
        minReceived: bestQuote.minReceived || bestQuote.minOutputAmount,
      };

      // Extract swap-specific data IMMEDIATELY to avoid MobX Proxy issues
      // RocketX API structure: exchangeInfo.id, fromTokenInfo.id, toTokenInfo.id
      // IMPORTANT: Store OUTSIDE runInAction to prevent MobX from wrapping it
      this.lastQuoteData = {
        exchangeId: bestQuote.exchangeInfo?.id,
        fromTokenId: bestQuote.fromTokenInfo?.id,
        toTokenId: bestQuote.toTokenInfo?.id,
      };

      console.log('🔑 Extracted swap data:', this.lastQuoteData);

      runInAction(() => {
        this.lastQuote = quote;
      });

      console.log('✅ RocketX quote:', quote);

      return quote;
    } catch (error) {
      console.error('Failed to get quote:', error);
      // Re-throw the error so it can be caught by the UI component
      // This allows specific error messages to be displayed to the user
      throw error;
    } finally {
      runInAction(() => {
        this.isLoadingQuote = false;
      });
    }
  };

  /**
   * Get transaction preview with fee estimates
   * This uses the last quote data to provide fee information
   */
  getTransactionPreview = async () => {
    // For RocketX, the fee information is already in the quote
    // We just return the last quote's fee data
    if (this.lastQuote && this.lastQuote.feeInUSD) {
      return {
        feeInUSD: this.lastQuote.feeInUSD,
        estimatedTime: this.lastQuote.estimatedTime,
      };
    }

    // If we don't have quote data, return null
    return null;
  };

  // ============================================================================
  // Swap Execution
  // ============================================================================

  // Store the extracted swap data (exchangeId, fromTokenId, toTokenId)
  private lastQuoteData: {
    exchangeId: number;
    fromTokenId: number;
    toTokenId: number;
  } | null = null;

  executeSwap = async (fromAmount: string, toAmount: string) => {
    if (!this.fromToken || !this.toToken || !this.fromChain || !this.toChain) {
      throw new Error('Missing required parameters for swap');
    }

    if (!this.userAddress) {
      throw new Error('Wallet not connected');
    }

    // We need the last quote data with exchange and token IDs
    if (!this.lastQuoteData) {
      throw new Error('No quote available. Please get a quote first.');
    }

    try {
      const client = getRocketXClient();

      console.log('📊 Swap data:', this.lastQuoteData);
      console.log('📊 Using for swap:', {
        exchangeId: this.lastQuoteData.exchangeId,
        fromTokenId: this.lastQuoteData.fromTokenId,
        toTokenId: this.lastQuoteData.toTokenId,
        amount: parseFloat(fromAmount),
      });

      // Prepare swap request using RocketX format
      const swapRequest: RocketXSwapRequest = {
        userAddress: this.userAddress,
        destinationAddress: this.userAddress, // Same as user address
        exchangeId: this.lastQuoteData.exchangeId,
        slippage: this.slippage,
        fromTokenId: this.lastQuoteData.fromTokenId,
        toTokenId: this.lastQuoteData.toTokenId,
        amount: parseFloat(fromAmount),
        fee: 1, // Platform fee
        disableEstimate: true, // Skip gas estimation
      };

      console.log('🚀 Executing RocketX swap:', swapRequest);

      const response = await client.getSwapTransaction(swapRequest);

      if (!response.success || !response.data) {
        throw new Error(
          response.error?.message || 'Failed to get swap transaction'
        );
      }

      console.log('✅ RocketX swap response received:', response.data);

      // RocketX has two types of responses:
      // 1. DEX swaps: { transaction: {...}, swapId: "..." }
      // 2. CEX swaps: { swap: { tx: {...}, depositAddress: "..." }, requestId: "..." }

      const data = response.data;
      const dataAny: any = data; // Runtime API structure may vary

      // Check if it's a DEX swap (has transaction at top level)
      const isDexSwap = !!dataAny.transaction;

      // Check if it's a CEX swap (has swap.tx)
      const isCexSwap = !!dataAny.swap?.tx;

      if (isDexSwap) {
        // DEX swap - has transaction at top level
        console.log('✅ DEX swap - transaction ready to sign');
        return {
          transaction: dataAny.transaction,
          swapId: dataAny.swapId,
          fromAmount,
          toAmount,
          fromToken: this.fromToken,
          toToken: this.toToken,
          fromChain: this.fromChain,
          toChain: this.toChain,
        };
      } else if (isCexSwap) {
        // CEX swap - transaction nested under swap.tx
        console.log('✅ CEX swap - sending to deposit address');

        // For CEX swaps, the transaction might be missing the 'to' field
        // We need to set it to the deposit address
        const cexTransaction = dataAny.swap.tx;
        if (!cexTransaction.to && dataAny.swap.depositAddress) {
          cexTransaction.to = dataAny.swap.depositAddress;
          console.log('⚠️ Added missing "to" field to CEX transaction:', cexTransaction.to);
        }

        return {
          transaction: cexTransaction,
          swapId: dataAny.requestId || dataAny.txId?.toString(),
          fromAmount,
          toAmount,
          fromToken: this.fromToken,
          toToken: this.toToken,
          fromChain: this.fromChain,
          toChain: this.toChain,
          depositAddress: dataAny.swap.depositAddress, // Include deposit address for reference
        };
      } else {
        throw new Error('Unknown swap response format from RocketX');
      }
    } catch (error) {
      console.error('Failed to execute swap:', error);
      throw error;
    }
  };

  // ============================================================================
  // Transaction Status Tracking
  // ============================================================================

  async getSwapStatus(requestId: string, txId?: string) {
    try {
      const client = getRocketXClient();
      const response = await client.getSwapStatus({ requestId, txId });

      if (response.success && response.data) {
        return response.data;
      }

      return null;
    } catch (error) {
      console.error('Failed to get swap status:', error);
      return null;
    }
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export const rocketxSwapService = new RocketXSwapService();
