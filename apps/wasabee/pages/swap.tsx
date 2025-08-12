import React, { useEffect, useState } from 'react';
import { observe } from 'mobx';
import { motion } from 'framer-motion';
import { chart } from '@honeypot/shared/services';
import { observer } from 'mobx-react-lite';
import { wallet } from '@honeypot/shared/lib/wallet';
import { useSearchParams } from 'next/navigation';
import { itemPopUpVariants } from '@/lib/animation';
import { DarkContainer } from '@/components/CardContianer';
import V3SwapCard from '@/components/algebra/swap/V3SwapCard';
import KlineChart from './launch-detail/components/KlineChart';
import { LoadingDisplay } from '@/components/LoadingDisplay/LoadingDisplay';
import SwapTransactionHistory from '@/components/SwapTransactionHistory';
import { Tab, Tabs } from '@nextui-org/react';
import { cn } from '@/lib/tailwindcss';
import { UniversalAccountBuyTokenModal } from '@honeypot/shared';

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
          <Tabs
            destroyInactiveTabPanel={false}
            classNames={{
              tab: 'px-2 sm:px-3 sm:h-10 text-xs sm:text-sm text-gray-400 data-[selected=true]:text-[#F59E0B]',
              base: 'relative w-full',
              cursor: 'bg-transparent border-b-2 border-[#F59E0B]',
              tabList:
                'flex rounded-[16px] border border-[#333333] bg-[#271A0C] p-2 sm:p-3 absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 max-w-[90%] sm:max-w-none',
              panel: cn(
                'flex flex-col h-full w-full gap-y-4 items-center bg-[#140D06] rounded-2xl text-white',
                'px-4 sm:px-8 pt-[70px] pb-[70px]',
                'border border-[#333333]',
                '!mt-0',
                'h-auto'
              ),
              tabContent: 'text-inherit text-sm sm:text-base',
            }}
          >
            <Tab key="swap" title="Swap">
              <V3SwapCard
                bordered={false}
                fromTokenAddress={inputCurrency ?? undefined}
                toTokenAddress={outputCurrency ?? undefined}
                isInputNative={!inputCurrency}
                isOutputNative={!outputCurrency}
                isUpdatingPriceChart={true}
                onSwapSuccess={() => setKlineRefreshKey((k) => k + 1)}
              />
            </Tab>
            <Tab key="universal" title="Universal Account">
              <UniversalAccountBuyTokenModal />
            </Tab>
          </Tabs>
        </motion.div>

        <motion.div
          variants={itemPopUpVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5 }}
          className="w-full col-span-2 h-full"
        >
          <SwapTransactionHistory />
        </motion.div>
      </div>
    </div>
  ) : (
    <LoadingDisplay />
  );
});

export default SwapPage;
