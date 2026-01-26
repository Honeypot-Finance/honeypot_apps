// API URLs
export const API_URLS = {
  NAVBAR: process.env.NEXT_PUBLIC_NAVBAR_API_URL || 'https://honeypotfinance.xyz/api/navbar',
} as const;

// Chain IDs
export const CHAIN_IDS = {
  ETHEREUM: 1,
  BASE: 8453,
  ARBITRUM: 42161,
  OPTIMISM: 10,
  POLYGON: 137,
} as const;

// Theme colors - shared across widgets
export const THEME_COLORS = {
  primary: '#F59E0B',
  primaryEmphasis: '#D97706',
  primaryMuted: '#FCD34D',
  background: '#140D06',
  backgroundSubtle: '#271A0C',
  backgroundEmphasized: '#2a2a2a',
  backgroundMuted: '#141414',
  text: '#ffffff',
  textMuted: '#9ca3af',
  textSubtle: '#6b7280',
  border: '#333333',
  borderSubtle: '#1a1a1a',
  borderEmphasized: '#333333',
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  hover: 'rgba(255, 255, 255, 0.05)',
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
