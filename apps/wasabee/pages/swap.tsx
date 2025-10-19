import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { chart } from '@honeypot/shared/services';
import { observer } from 'mobx-react-lite';
import { wallet } from '@honeypot/shared/lib/wallet';
import { useSearchParams } from 'next/navigation';
import { itemPopUpVariants } from '@/lib/animation';
import { DarkContainer } from '@/components/CardContianer';
import KlineChart from './launch-detail/components/KlineChart';
import { LoadingDisplay } from '@/components/LoadingDisplay/LoadingDisplay';
import SwapTransactionHistory from '@/components/SwapTransactionHistory';
import SwapCardMultichainDesign from '@/components/multichain-design/swap/SwapCard';
import LimitOrder from '@/components/LimitOrder/LimitOrder';
import LimitOrderHistory from '@/components/LimitOrder/LimitOrderHistory';
import * as Tabs from '@radix-ui/react-tabs';

const SwapPage = observer(() => {
  const searchParams = useSearchParams();
  const urlInputCurrency = searchParams?.get('inputCurrency');
  const urlOutputCurrency = searchParams?.get('outputCurrency');

  const [inputCurrency, setInputCurrency] = useState<string | undefined>(
    undefined
  );
  const [outputCurrency, setOutputCurrency] = useState<string | undefined>(
    undefined
  );
  const [activeTab, setActiveTab] = useState<string>('swap');

  const isInit = wallet.isInit;

  const defaultOutputToken = wallet.currentChain?.validatedTokens?.find(
    (token) => token.isStableCoin
  )?.address;

  // Handle URL parameters and localStorage fallback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedInputToken = localStorage.getItem('swapInputToken');
      const storedOutputToken = localStorage.getItem('swapOutputToken');

      // Set input currency: URL param takes priority, then localStorage, then undefined
      if (urlInputCurrency) {
        setInputCurrency(urlInputCurrency);
      } else if (storedInputToken) {
        setInputCurrency(storedInputToken);
      } else {
        setInputCurrency(undefined);
      }

      // Set output currency: URL param takes priority, then localStorage, then default
      if (urlOutputCurrency) {
        setOutputCurrency(urlOutputCurrency);
      } else if (storedOutputToken) {
        setOutputCurrency(storedOutputToken);
      } else {
        // Only set default if no input token is stored
        setOutputCurrency(defaultOutputToken);
      }
    }
  }, [urlInputCurrency, urlOutputCurrency, defaultOutputToken]);
  const [klineRefreshKey, setKlineRefreshKey] = useState(0);
  const [limitOrderRefreshKey, setLimitOrderRefreshKey] = useState(0);

  if (!wallet.currentChain?.supportDEX) {
    return (
      <div className="w-full flex items-center justify-center pb-6 sm:pb-12 overflow-x-hidden">
        <div className="text-center">
          <p className="text-lg">DEX is not supported on this chain</p>
        </div>
      </div>
    );
  }

  return isInit ? (
    <div className="w-full flex items-center justify-center pb-6 sm:pb-12 pt-8">
      <div className="w-full xl:mx-auto xl:max-w-[1200px] 2xl:max-w-[1500px] px-2 sm:px-4 md:px-8 xl:px-0 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        {chart.showChart && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={itemPopUpVariants}
            transition={{ duration: 0.5 }}
            className="w-full col-span-2 lg:col-span-1"
          >
            <DarkContainer>
              <KlineChart height={479} refreshKey={klineRefreshKey} />
            </DarkContainer>
          </motion.div>
        )}

        <motion.div
          variants={itemPopUpVariants}
          initial="hidden"
          animate="visible"
          className="relative w-full flex flex-col items-center justify-start col-span-2 lg:col-span-1 overflow-visible"
        >
          <Tabs.Root
            defaultValue="swap"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <Tabs.List className="flex w-full mb-4 bg-gray-900/50 rounded-lg p-1">
              <Tabs.Trigger
                value="swap"
                className="flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-gray-800 data-[state=active]:text-white data-[state=inactive]:text-gray-400 hover:text-white"
              >
                Swap
              </Tabs.Trigger>
              <Tabs.Trigger
                value="limit"
                className="flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-gray-800 data-[state=active]:text-white data-[state=inactive]:text-gray-400 hover:text-white"
              >
                Limit Order
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="swap" className="w-full">
              <SwapCardMultichainDesign
                bordered={false}
                fromTokenAddress={inputCurrency ?? undefined}
                toTokenAddress={outputCurrency ?? undefined}
                isInputNative={!inputCurrency}
                isOutputNative={!outputCurrency}
                isUpdatingPriceChart={true}
                onSwapSuccess={() => setKlineRefreshKey((k) => k + 1)}
              />
            </Tabs.Content>

            <Tabs.Content value="limit" className="w-full">
              <LimitOrder
                fromTokenAddress={inputCurrency ?? undefined}
                toTokenAddress={outputCurrency ?? undefined}
                isInputNative={!inputCurrency}
                isOutputNative={!outputCurrency}
                onOrderPlaced={() => setLimitOrderRefreshKey((k) => k + 1)}
              />
            </Tabs.Content>
          </Tabs.Root>
        </motion.div>

        <motion.div
          variants={itemPopUpVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5 }}
          className="w-full col-span-2 h-full"
        >
          {activeTab === 'limit' ? (
            <LimitOrderHistory
              ownerAddress={wallet.account}
              refreshKey={limitOrderRefreshKey}
            />
          ) : (
            <SwapTransactionHistory />
          )}
        </motion.div>
      </div>
    </div>
  ) : (
    <LoadingDisplay />
  );
});

export default SwapPage;
