import '@/styles/globals.css';
import '@/styles/overrides/reactjs-popup.css';
import '@/styles/overrides/toastify.css';
//@ts-ignore
import type { AppProps } from 'next/app';
import { Layout } from '@/components/layout';
import { NextLayoutPage } from '@/types/nextjs';
import { WagmiProvider, useWalletClient } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { AvatarComponent, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { trpc, trpcQueryClient } from '../lib/trpc';
import { useEffect, useState } from 'react';
import { wallet } from '@honeypot/shared/lib/wallet';
import { DM_Sans, Inter } from 'next/font/google';
import { Inspector, InspectParams } from 'react-dev-inspector';
import { Analytics } from '@vercel/analytics/react';
import { ApolloProvider } from '@apollo/client';
import Image from 'next/image';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import ErrorBoundary from '@/components/ErrorBoundary';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { deserialize, serialize } from 'wagmi';
import { useSubgraphClient } from '@honeypot/shared';
import { createWagmiConfig } from '@honeypot/shared/config/wagmi';
import { NextUIProvider } from '@nextui-org/react';

const config = createWagmiConfig();

// enableStaticRendering(true)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retryDelay: 1000,
      retry: 12,
      gcTime: 1000 * 60,
      staleTime: 1000 * 5,
    },
  },
});

const dmSans = DM_Sans({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin', 'latin-ext'],
  variable: '--dm_sans',
});

const Provider = ({ children }: { children: React.ReactNode }) => {
  const { data: walletClient } = useWalletClient({
    config,
  });

  useEffect(() => {
    wallet.initWallet(walletClient);
  }, [walletClient]);



  return children;
};

const CustomAvatar: AvatarComponent = ({ address, ensImage, size }) => {
  return (
    <Image
      src={'/images/empty-logo.png'}
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
  const infoClient = useSubgraphClient('algebra_info');
  const ComponentLayout = Component.Layout || Layout;
  const persister = createSyncStoragePersister({
    serialize,
    storage: undefined,
    deserialize,
  });

  return (
    <ErrorBoundary>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister }}
          >
            <ApolloProvider client={infoClient}>
              <trpc.Provider client={trpcQueryClient} queryClient={queryClient}>
                <RainbowKitProvider avatar={CustomAvatar}>
                  <NextUIProvider>
                    <ToastContainer />
                    <Provider>
                      {' '}
                      <Inspector
                        keys={['Ctrl', 'Shift', 'Z']}
                        onClickElement={({ codeInfo }: InspectParams) => {
                          if (!codeInfo) {
                            return;
                          }
                          window.open(
                            `cursor://file/${codeInfo.absolutePath}:${codeInfo.lineNumber}:${codeInfo.columnNumber}`,
                            '_blank'
                          );
                        }}
                      ></Inspector>
                      <ComponentLayout className={`${dmSans.className}`}>
                        <Component {...pageProps} />
                      </ComponentLayout>
                    </Provider>
                  </NextUIProvider>
                </RainbowKitProvider>
              </trpc.Provider>
            </ApolloProvider>
          </PersistQueryClientProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  );
}
