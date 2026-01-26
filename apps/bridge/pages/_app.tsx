import '@/styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import type { AppProps } from 'next/app';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { AvatarComponent, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { createWagmiConfig } from '@/config/wagmi';
import { NextUIProvider } from '@nextui-org/react';
import Image from 'next/image';
import { NextLayoutPage } from '@/types/nextjs';
import { Layout } from '@/components/layout';
import { useState, useEffect } from 'react';
import { rainbowkitTheme } from '@/config/rainbowkitTheme';
import { QUERY_CONFIG, THEME_COLORS } from '@/config/constants';

/**
 * Clear stale WalletConnect session data that might cause auto-modal popup.
 * This prevents the WalletConnect modal from appearing automatically on page load
 * when there's a stale or incomplete session from a previous connection attempt.
 */
function clearStaleWalletConnectSessions(): void {
  if (typeof window === 'undefined') return;

  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      // WalletConnect v2 uses keys starting with 'wc@2:'
      if (key.startsWith('wc@2:')) {
        keysToRemove.push(key);
      }
      // Also clear any WalletConnect-related wagmi state
      if (key.includes('walletConnect') || key.includes('WalletConnect')) {
        keysToRemove.push(key);
      }
    }
    // Remove stale WalletConnect data
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // If the last used connector was WalletConnect, clear it to prevent auto-connect
    const recentConnector = localStorage.getItem('wagmi.recentConnectorId');
    if (recentConnector && recentConnector.toLowerCase().includes('walletconnect')) {
      localStorage.removeItem('wagmi.recentConnectorId');
    }
  } catch (error) {
    // Log in development only - helps debug WalletConnect issues
    if (process.env.NODE_ENV === 'development') {
      console.warn('[clearStaleWalletConnectSessions] Failed to clear sessions:', error);
    }
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retryDelay: QUERY_CONFIG.RETRY_DELAY_MS,
      retry: QUERY_CONFIG.RETRY_COUNT,
      gcTime: QUERY_CONFIG.GC_TIME_MS,
      staleTime: QUERY_CONFIG.STALE_TIME_MS,
    },
  },
});

const CustomAvatar: AvatarComponent = ({ size }) => {
  return (
    <Image
      src="/honeypot-icon.svg"
      alt="User avatar"
      width={size}
      height={size}
      style={{ borderRadius: 999 }}
    />
  );
};

export default function App({
  Component,
  pageProps,
}: AppProps & {
  Component: NextLayoutPage;
}) {
  const ComponentLayout = Component.Layout || Layout;
  const [mounted, setMounted] = useState(false);
  const [config, setConfig] = useState<ReturnType<typeof createWagmiConfig> | null>(null);
  // Note: config type is Config from wagmi - the SSR mock is cast to Config in createWagmiConfig

  useEffect(() => {
    // Clear any stale WalletConnect sessions before initializing
    clearStaleWalletConnectSessions();
    setConfig(createWagmiConfig());
    setMounted(true);
  }, []);

  // Don't render until client-side mounted
  if (!mounted || !config) {
    return (
      <div
        className="min-h-screen font-sans"
        style={{ backgroundColor: THEME_COLORS.backgroundDark }}
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse" style={{ color: THEME_COLORS.text }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider avatar={CustomAvatar} theme={rainbowkitTheme}>
          <NextUIProvider>
            <ComponentLayout className="font-sans">
              <Component {...pageProps} />
            </ComponentLayout>
          </NextUIProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
