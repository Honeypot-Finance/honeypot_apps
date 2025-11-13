/**
 * RocketX API Client
 *
 * This module provides a low-level HTTP client for interacting with the RocketX API.
 * It handles request/response formatting, error handling, and retries.
 */

import type {
  RocketXConfig,
  RocketXQuoteRequest,
  RocketXQuoteResponse,
  RocketXSwapRequest,
  RocketXSwapResponse,
  RocketXStatusRequest,
  RocketXStatusResponse,
  RocketXSupportedChainsResponse,
  RocketXSupportedTokensRequest,
  RocketXSupportedTokensResponse,
  RocketXChain,
} from './types';

// RocketX API base URL - v1 endpoints
const DEFAULT_BASE_URL = 'https://api.rocketx.exchange/v1';
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_RETRIES = 3;

export class RocketXApiClient {
  private apiKey: string;
  private baseURL: string;
  private timeout: number;
  private retries: number;

  constructor(config: RocketXConfig) {
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL || DEFAULT_BASE_URL;
    this.timeout = config.timeout || DEFAULT_TIMEOUT;
    this.retries = config.retries || DEFAULT_RETRIES;
  }

  /**
   * Generic HTTP request method with retry logic
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);

      // Retry on network errors or 5xx errors
      if (retryCount < this.retries) {
        const isRetryable =
          error instanceof Error &&
          (error.name === 'AbortError' ||
            error.message.includes('network') ||
            error.message.includes('50'));

        if (isRetryable) {
          console.warn(
            `RocketX API request failed, retrying (${retryCount + 1}/${
              this.retries
            })...`
          );
          // Exponential backoff: 1s, 2s, 4s
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, retryCount) * 1000)
          );
          return this.request<T>(endpoint, options, retryCount + 1);
        }
      }

      throw error;
    }
  }

  /**
   * Get a quote for a cross-chain swap
   * Endpoint: GET /quotation
   *
   * RocketX API uses network names (ethereum, binance, etc.) not chainIds
   * Example: /quotation?fromToken=0x...&fromNetwork=ethereum&toToken=0x...&toNetwork=binance&amount=100&slippage=1
   *
   * IMPORTANT: fromNetwork and toNetwork must come from the token's network_id field!
   */
  async getQuote(
    request: RocketXQuoteRequest,
    fromNetworkId?: string,
    toNetworkId?: string
  ): Promise<RocketXQuoteResponse> {
    try {
      // Network IDs MUST be provided - they come from the token's network_id field
      if (!fromNetworkId || !toNetworkId) {
        throw new Error(
          "fromNetworkId and toNetworkId are required. These must come from the token's network_id field from the API."
        );
      }

      const fromNetwork = fromNetworkId;
      const toNetwork = toNetworkId;

      // RocketX uses "null" string for native tokens instead of 0xeee...
      const fromToken =
        request.fromTokenAddress.toLowerCase() ===
        '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
          ? 'null'
          : request.fromTokenAddress;

      const toToken =
        request.toTokenAddress.toLowerCase() ===
        '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
          ? 'null'
          : request.toTokenAddress;

      const queryParams = new URLSearchParams({
        fromToken,
        fromNetwork,
        toToken,
        toNetwork,
        amount: request.fromAmount,
        slippage: (request.slippage || 1).toString(),
      });

      const endpoint = `/quotation?${queryParams.toString()}`;
      console.log('🔍 Fetching quote from:', `${this.baseURL}${endpoint}`);

      const response = await this.request<any>(endpoint, {
        method: 'GET',
      });

      console.log('✅ Quote response:', response);

      // Check if RocketX returned an error in the response body
      // RocketX returns errors like: { err: "Pair is inactive", code: 489, ... }
      const hasError =
        response.err ||
        response.error ||
        (response.code && response.code === 489);

      if (hasError) {
        const errorMessage = response.err || response.error || 'Unknown error';
        const errorCode = response.code || 'UNKNOWN';

        console.warn('⚠️ RocketX API returned error:', {
          message: errorMessage,
          code: errorCode,
          fromToken: response.fromTokenInfo?.token_symbol,
          toToken: response.toTokenInfo?.token_symbol,
        });

        // Return error response - this tells the service there's an error
        return {
          success: false,
          error: {
            code: errorCode.toString(),
            message: errorMessage,
          },
        };
      }

      // Check if quotes array exists and is not empty
      if (!response.quotes || response.quotes.length === 0) {
        console.warn('⚠️ RocketX returned empty quotes');
        return {
          success: false,
          error: {
            code: 'NO_QUOTES',
            message: 'No quotes available for this pair',
          },
        };
      }
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error('❌ RocketX getQuote error:', error);
      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get swap transaction data
   * Endpoint: POST /swap
   *
   * RocketX API expects chainIds in HEX format
   */
  async getSwapTransaction(
    request: RocketXSwapRequest
  ): Promise<RocketXSwapResponse> {
    try {
      console.log('🔍 Creating swap transaction:', request);

      const response = await this.request<any>('/swap', {
        method: 'POST',
        body: JSON.stringify(request),
      });

      console.log('✅ Swap transaction response:', response);
      console.log('📋 Response keys:', Object.keys(response));
      console.log('📋 Transaction field:', response.transaction);
      console.log('📋 SwapId field:', response.swapId);
      console.log('📋 TxId field:', response.txId);
      console.log('📋 RequestId field:', response.requestId);
      console.log('📋 DepositAddress field:', response.depositAddress);
      console.log('📋 DepositAmount field:', response.depositAmount);
      console.log('📋 PayinAddress field:', response.payinAddress);
      if (response.swap) {
        console.log('📋 Swap object:', response.swap);
        console.log('📋 Swap.tx:', response.swap.tx);
        console.log('📋 Swap.depositAddress:', response.swap.depositAddress);
      }

      // Check if RocketX returned an error in the response body
      if (response.err || response.error || response.code === 400) {
        const errorMessage =
          response.err || response.error || 'Swap request failed';
        console.error('❌ RocketX API returned error:', {
          message: errorMessage,
          code: response.code,
          response,
        });

        return {
          success: false,
          error: {
            code: response.code?.toString() || 'API_ERROR',
            message: errorMessage,
          },
        };
      }

      // RocketX has different response formats:
      // 1. DEX swaps: returns { transaction: {...}, swapId: "..." }
      // 2. CEX/walletLess swaps: returns { txId: number, requestId: "...", depositAddress: "..." }

      // For now, accept the response if it has either format
      const hasDexFormat = response.transaction && response.swapId;
      const hasCexFormat = response.txId || response.requestId;

      if (!hasDexFormat && !hasCexFormat) {
        console.error('❌ Invalid response from RocketX:', response);
        return {
          success: false,
          error: {
            code: 'INVALID_RESPONSE',
            message:
              'RocketX API returned invalid response. Missing required fields.',
          },
        };
      }

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error('❌ RocketX getSwapTransaction error:', error);
      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Check the status of a swap transaction
   * Endpoint: GET /status
   */
  async getSwapStatus(
    request: RocketXStatusRequest
  ): Promise<RocketXStatusResponse> {
    try {
      const queryParams = new URLSearchParams({
        requestId: request.requestId,
        ...(request.txId && { txId: request.txId }),
      });

      const endpoint = `/status?${queryParams.toString()}`;
      console.log(
        '🔍 Fetching swap status from:',
        `${this.baseURL}${endpoint}`
      );

      const response = await this.request<any>(endpoint, {
        method: 'GET',
      });

      console.log('✅ Status response:', response);

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error('❌ RocketX getSwapStatus error:', error);
      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get list of supported chains
   * Endpoint: GET /chains
   *
   * Returns array of chains with their network_id values that are used in the quotation endpoint
   */
  async getSupportedChains(): Promise<RocketXSupportedChainsResponse> {
    try {
      console.log('🔍 Fetching chains from:', `${this.baseURL}/chains`);

      const response = await this.request<any[]>('/chains', {
        method: 'GET',
      });

      console.log('✅ Chains response:', response);

      // Transform the response to our format
      const chains: RocketXChain[] = response.map((chain: any) => ({
        chainId: chain.chainId || chain.chain_id, // Hex format from API
        chainIdDecimal: parseInt(chain.chainId || chain.chain_id, 16), // Convert hex to decimal
        network_id: chain.network_id || chain.networkId, // This is the key field for quotes!
        name: chain.name || chain.chain_name,
        symbol: chain.symbol || chain.native_currency?.symbol,
        logoURI: chain.logo_url || chain.icon_url,
        enabled: chain.enabled !== false,
      }));

      return {
        success: true,
        data: { chains },
      };
    } catch (error) {
      console.error('❌ RocketX getSupportedChains error:', error);
      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get list of supported tokens
   * Endpoint: GET /tokens?chainId=0xHEX&page=1&perPage=100&keyword=All
   *
   * RocketX API expects:
   * - chainId in hex format (0x1, 0xa4b1, etc.)
   * - pagination parameters
   * - keyword filter
   */
  async getSupportedTokens(
    request?: RocketXSupportedTokensRequest
  ): Promise<RocketXSupportedTokensResponse> {
    try {
      // Convert decimal chainId to hex format (0x1, 0xa4b1, etc.)
      const chainIdHex = request?.chainId
        ? `0x${request.chainId.toString(16)}`
        : '0x1'; // Default to Ethereum

      // Build query params with RocketX expected format
      const queryParams = new URLSearchParams({
        chainId: chainIdHex,
        page: '1',
        perPage: '100',
        keyword: 'All', // Get all tokens
      });

      const endpoint = `/tokens?${queryParams.toString()}`;

      console.log('🔍 Fetching tokens from:', `${this.baseURL}${endpoint}`);

      const response = await this.request<any>(endpoint, {
        method: 'GET',
      });

      console.log('✅ Tokens response:', response);

      // Ensure we preserve the network_id from the response
      // This is critical for the quote endpoint!
      if (Array.isArray(response)) {
        response.forEach((token: any) => {
          if (!token.network_id && token.networkId) {
            token.network_id = token.networkId;
          }
        });
      }

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error('❌ RocketX getSupportedTokens error:', error);
      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
}

/**
 * Create a singleton instance of the RocketX API client
 */
let clientInstance: RocketXApiClient | null = null;

export function createRocketXClient(config: RocketXConfig): RocketXApiClient {
  if (!clientInstance) {
    clientInstance = new RocketXApiClient(config);
  }
  return clientInstance;
}

export function getRocketXClient(): RocketXApiClient {
  if (!clientInstance) {
    throw new Error(
      'RocketX client not initialized. Call createRocketXClient() first.'
    );
  }
  return clientInstance;
}
