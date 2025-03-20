import '@/styles/globals.css';
import '@/styles/overrides/reactjs-popup.css';
import '@/styles/overrides/toastify.css';
//@ts-ignore
import type { AppProps } from 'next/app';
import { Layout } from '@/components/layout';
import { NextLayoutPage } from '@/types/nextjs';
import { WagmiProvider, useWalletClient } from 'wagmi';
import { AvatarComponent, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import '@rainbow-me/rainbowkit/styles.css';
import { NextUIProvider } from '@nextui-org/react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { config } from '@/config/wagmi';
import { trpc, trpcQueryClient } from '../lib/trpc';
import { useEffect, useMemo, useState } from 'react';
import { wallet } from '@/services/wallet';
import { chain } from '@/services/chain';
import { DM_Sans, Inter } from 'next/font/google';
import { Inspector, InspectParams } from 'react-dev-inspector';
import { Analytics } from '@vercel/analytics/react';
// import { capsuleClient, capsuleModalProps } from "@/config/wagmi/capsualWallet";
import { ApolloProvider } from '@apollo/client';
import { infoClient } from '@/lib/algebra/graphql/clients';
import Image from 'next/image';
import SafeProvider from '@safe-global/safe-apps-react-sdk';
import { berachainNetworkTestnet } from '@/services/network';
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
    if (walletClient) {
      wallet.initWallet(walletClient);

      if (walletClient.chain?.id) {
        chain.initChain(walletClient.chain.id);
      }
    }
  }, [walletClient]);

  // Initial chain setup - will use default chain if wallet not connected
  useEffect(() => {
    chain.initChain();
  }, []);

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
  const ComponentLayout = Component.Layout || Layout;

  // const [isEthereum, setIsEthereum] = useState(false);

  // useEffect(() => {
  //   if (typeof window !== "undefined" && window.ethereum) {
  //     setIsEthereum(true);
  //   }
  // }, []);

  // if (!isEthereum)
  //   return (
  //     <div className="flex h-screen w-screen items-center justify-center">
  //       <div className="text-2xl font-bold">No wallet found</div>
  //     </div>
  //   );

  return (
    <trpc.Provider client={trpcQueryClient} queryClient={queryClient}>
      <Analytics />
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          <SafeProvider>
            <RainbowKitProvider
              avatar={CustomAvatar}
              initialChain={berachainNetworkTestnet.chain}
              // capsule={capsuleClient}
              // capsuleIntegratedProps={capsuleModalProps}
            >
              {' '}
              <ApolloProvider client={infoClient}>
                <NextUIProvider>
                  <Provider>
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
                  <ToastContainer></ToastContainer>
                </NextUIProvider>
              </ApolloProvider>
            </RainbowKitProvider>
          </SafeProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
