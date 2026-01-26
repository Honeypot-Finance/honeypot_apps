// API URLs
export const API_URLS = {
  NAVBAR: process.env.NEXT_PUBLIC_NAVBAR_API_URL || 'https://honeypotfinance.xyz/api/navbar',
} as const;

// WalletConnect Project ID - get from https://cloud.walletconnect.com/
export const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '23b1ff4e22147bdf7cab13c0ee4bed90';

// Chain IDs
export const CHAIN_IDS = {
  ETHEREUM: 1,
  BASE: 8453,
  ARBITRUM: 42161,
  OPTIMISM: 10,
  POLYGON: 137,
} as const;

// Query client configuration
export const QUERY_CONFIG = {
  RETRY_DELAY_MS: 1000,
  RETRY_COUNT: 3,
  GC_TIME_MS: 60 * 1000, // 1 minute
  STALE_TIME_MS: 5 * 1000, // 5 seconds
} as const;

// Theme colors - shared across widgets
export const THEME_COLORS = {
  // Primary colors
  primary: '#F59E0B',
  primaryEmphasis: '#D97706',
  primaryMuted: '#FCD34D',
  // Background colors
  background: '#140D06',
  backgroundSubtle: '#271A0C',
  backgroundEmphasized: '#2a2a2a',
  backgroundMuted: '#141414',
  backgroundDark: '#0a0a0a',
  backgroundCard: '#1A0F06',
  backgroundHeader: '#0D0703',
  backgroundMenu: '#1a1410',
  // Text colors
  text: '#ffffff',
  textMuted: '#9ca3af',
  textSubtle: '#6b7280',
  textDim: '#999999',
  textGray: '#666666',
  // Border colors
  border: '#333333',
  borderSubtle: '#1a1a1a',
  borderEmphasized: '#333333',
  borderDim: '#2a2522',
  borderCard: '#2a2318',
  // Status colors
  success: '#22c55e',
  error: '#ef4444',
  errorBright: '#FF494A',
  warning: '#f59e0b',
  info: '#3b82f6',
  standby: '#FFD641',
  connected: '#4BB543',
  // Interactive colors
  hover: 'rgba(255, 255, 255, 0.05)',
  hoverLight: 'rgba(255, 255, 255, 0.1)',
  backdrop: 'rgba(0, 0, 0, 0.7)',
} as const;

// Bridge widget theme
export const BRIDGE_WIDGET_THEME = {
  primaryColor: THEME_COLORS.primary,
  secondaryColor: THEME_COLORS.primaryEmphasis,
  backgroundColor: 'transparent',
  cardBackgroundColor: THEME_COLORS.backgroundSubtle,
  textColor: THEME_COLORS.text,
  mutedTextColor: THEME_COLORS.textMuted,
  borderColor: THEME_COLORS.border,
  successColor: THEME_COLORS.success,
  errorColor: THEME_COLORS.error,
  hoverColor: THEME_COLORS.hover,
  borderRadius: 12,
} as const;
