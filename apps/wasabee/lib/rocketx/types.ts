/**
 * RocketX API Types and Interfaces
 *
 * This file contains all type definitions for the RocketX cross-chain swap API
 */

// ============================================================================
// Chain and Token Types
// ============================================================================

export interface RocketXChain {
  chainId: string; // Hex format: "0x1", "0xa4b1", etc.
  chainIdDecimal: number; // Decimal format: 1, 42161, etc.
  network_id: string; // RocketX network identifier: "ethereum", "Base Chain", etc.
  name: string;
  symbol: string;
  logoURI?: string;
  rpcUrl?: string;
  enabled?: boolean;
}

export interface RocketXToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  chainId: number;
  network_id?: string; // RocketX network identifier from API
  logoURI?: string;
  isNative?: boolean;
}

// ============================================================================
// Quote Request/Response Types
// ============================================================================

export interface RocketXQuoteRequest {
  fromChainId: number;
  toChainId: number;
  fromTokenAddress: string;
  toTokenAddress: string;
  fromAmount: string; // Amount in human-readable format (e.g., "1.5")
  slippage?: number; // Slippage tolerance in percentage (e.g., 1 for 1%)
  userAddress?: string; // User wallet address for better quote accuracy
}

export interface RocketXQuoteResponse {
  success: boolean;
  data?: {
    fromToken: RocketXToken;
    toToken: RocketXToken;
    fromAmount: string;
    toAmount: string;
    estimatedGas: string;
    estimatedTime: number; // in seconds
    route: RocketXRouteStep[];
    priceImpact: number; // in percentage
    fees: {
      gasFee: string; // in USD
      protocolFee: string; // in USD
      totalFee: string; // in USD
    };
    minReceivedAmount: string; // Minimum amount after slippage
    tx?: RocketXTransaction; // Transaction data for execution
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface RocketXRouteStep {
  protocol: string;
  type: 'swap' | 'bridge';
  fromToken: RocketXToken;
  toToken: RocketXToken;
  fromAmount: string;
  toAmount: string;
}

// ============================================================================
// Transaction Types
// ============================================================================

export interface RocketXTransaction {
  to: string; // Contract address to send transaction to
  from: string; // User wallet address
  data: string; // Encoded transaction data
  value: string; // Native token value to send (in wei)
  chainId: number;
  gasLimit?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}

export interface RocketXSwapRequest {
  userAddress: string;
  destinationAddress?: string; // Optional: different receiving address
  exchangeId: number; // From quote response
  slippage: number;
  fromTokenId: number; // From quote response
  toTokenId: number; // From quote response
  amount: number; // Amount to swap (numeric)
  fee?: number; // Platform fee (default 1)
  disableEstimate?: boolean; // Skip gas estimation
}

export interface RocketXSwapResponse {
  success: boolean;
  data?: {
    transaction: RocketXTransaction;
    quote: RocketXQuoteResponse['data'];
    swapId: string; // Unique identifier for tracking
  };
  error?: {
    code: string;
    message: string;
  };
}

// ============================================================================
// Transaction Status Types
// ============================================================================

export enum RocketXTransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export interface RocketXStatusRequest {
  requestId: string; // RocketX request ID from swap response
  txId?: string; // Transaction hash (API expects "txId" not "txHash")
}

export interface RocketXStatusResponse {
  success: boolean;
  data?: {
    swapId: string;
    status: RocketXTransactionStatus;
    fromTxHash?: string;
    toTxHash?: string;
    fromAmount: string;
    toAmount: string;
    estimatedTime: number;
    elapsedTime: number;
    steps: {
      name: string;
      status: RocketXTransactionStatus;
      txHash?: string;
      timestamp?: number;
    }[];
    // Additional fields from actual API response
    originTransactionHash?: string;
    destinationTransactionHash?: string;
    originTransactionUrl?: string;
    destinationTransactionUrl?: string;
    actualAmount?: number;
    transactionTime?: string;
    subState?: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

// ============================================================================
// Supported Assets Types
// ============================================================================

export interface RocketXSupportedChainsResponse {
  success: boolean;
  data?: {
    chains: RocketXChain[];
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface RocketXSupportedTokensRequest {
  chainId?: number; // Optional: filter tokens by chain
}

export interface RocketXSupportedTokensResponse {
  success: boolean;
  data?: {
    tokens: RocketXToken[];
  };
  error?: {
    code: string;
    message: string;
  };
}

// ============================================================================
// API Configuration
// ============================================================================

export interface RocketXConfig {
  apiKey: string;
  baseURL?: string; // Default: https://api.rocketx.exchange
  timeout?: number; // Request timeout in milliseconds
  retries?: number; // Number of retry attempts
}

// ============================================================================
// Error Codes
// ============================================================================

export enum RocketXErrorCode {
  INVALID_PARAMS = 'INVALID_PARAMS',
  INSUFFICIENT_LIQUIDITY = 'INSUFFICIENT_LIQUIDITY',
  PRICE_IMPACT_TOO_HIGH = 'PRICE_IMPACT_TOO_HIGH',
  UNSUPPORTED_TOKEN = 'UNSUPPORTED_TOKEN',
  UNSUPPORTED_CHAIN = 'UNSUPPORTED_CHAIN',
  AMOUNT_TOO_LOW = 'AMOUNT_TOO_LOW',
  AMOUNT_TOO_HIGH = 'AMOUNT_TOO_HIGH',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
}

// ============================================================================
// Utility Types
// ============================================================================

export type RocketXApiResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: {
    code: string;
    message: string;
  };
};
