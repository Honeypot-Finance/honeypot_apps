import '@/styles/globals.css';
import '@/styles/overrides/reactjs-popup.css';
import '@/styles/overrides/toastify.css';
//@ts-ignore
import type { AppProps } from 'next/app';
import { Layout } from '@/components/layout';
import { NextLayoutPage } from '@/types/nextjs';
import { WagmiProvider, useWalletClient } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import {
  AvatarComponent,
  darkTheme,
  RainbowKitProvider,
  Theme,
} from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { trpc, trpcQueryClient } from '../lib/trpc';
import { useEffect, useState } from 'react';
import { wallet } from '@honeypot/shared/lib/wallet';
import { DM_Sans, Bebas_Neue } from 'next/font/google';
import { inter } from '@/components/Fonts';
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
import { merge } from 'lodash';

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

const bebasNeue = Bebas_Neue({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--bebas-neue',
  display: 'swap',
});

const Provider = ({ children }: { children: React.ReactNode }) => {
  const { data: walletClient } = useWalletClient({
    config,
  });

  useEffect(() => {
    wallet.initWallet(walletClient);
  }, [walletClient]);

  useEffect(() => {
    wallet.initWallet();
  }, []);

  return children;
};

const myTheme: Theme = merge(darkTheme(), {
  colors: {
    modalBackground: '#271A0C',
    modalText: '#ffffff',
    modalTextSecondary: '#999999',
    profileForeground: '#140D06',
    accentColor: '#F59E0B',
    accentColorForeground: '#ffffff',
    actionButtonBorder: '#333333',
    actionButtonBorderMobile: '#333333',
    actionButtonSecondaryBackground: '#1a1410',
    closeButton: '#666666',
    closeButtonBackground: '#271A0C',
    connectButtonBackground: '#271A0C',
    connectButtonBackgroundError: '#FF494A',
    connectButtonInnerBackground: '#1a1410',
    connectButtonText: '#ffffff',
    connectButtonTextError: '#ffffff',
    connectionIndicator: '#4BB543',
    downloadBottomCardBackground: '#140D06',
    downloadTopCardBackground: '#271A0C',
    error: '#FF494A',
    generalBorder: '#333333',
    generalBorderDim: '#2a2522',
    menuItemBackground: '#1a1410',
    modalBackdrop: 'rgba(0, 0, 0, 0.7)',
    modalBorder: '#333333',
    modalTextDim: '#999999',
    profileAction: '#271A0C',
    profileActionHover: '#1a1410',
    selectedOptionBorder: '#F59E0B',
    standby: '#FFD641',
  },
  radii: {
    actionButton: '12px',
    connectButton: '12px',
    menuButton: '12px',
    modal: '20px',
    modalMobile: '20px',
  },
  shadows: {
    connectButton: '0 4px 12px rgba(0, 0, 0, 0.4)',
    dialog: '0 8px 32px rgba(0, 0, 0, 0.5)',
    profileDetailsAction: '0 2px 6px rgba(0, 0, 0, 0.3)',
    selectedOption: '0 2px 6px rgba(0, 0, 0, 0.3)',
    selectedWallet: '0 2px 6px rgba(0, 0, 0, 0.3)',
    walletLogo: '0 2px 16px rgba(0, 0, 0, 0.3)',
  },
});

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
                <RainbowKitProvider avatar={CustomAvatar} theme={myTheme}>
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
                      <ComponentLayout
                        className={`${dmSans.className} ${bebasNeue.variable} ${inter.variable}`}
                      >
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
