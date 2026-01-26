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

// Clear stale WalletConnect session data that might cause auto-modal popup
function clearStaleWalletConnectSessions() {
  if (typeof window === 'undefined') return;

  try {
    // Get all localStorage keys
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
  } catch (e) {
    // Ignore errors
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retryDelay: 1000,
      retry: 3,
      gcTime: 1000 * 60,
      staleTime: 1000 * 5,
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

  useEffect(() => {
    // Clear any stale WalletConnect sessions before initializing
    clearStaleWalletConnectSessions();
    setConfig(createWagmiConfig());
    setMounted(true);
  }, []);

  // Don't render until client-side mounted
  if (!mounted || !config) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] font-sans">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-white">Loading...</div>
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
