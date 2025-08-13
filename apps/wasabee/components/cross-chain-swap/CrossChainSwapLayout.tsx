import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'framer-motion';
import { Tab, Tabs } from '@nextui-org/react';
import CrossChainSwapCard from './CrossChainSwapCard';
import CrossChainKlineChart from './CrossChainKlineChart';
import CrossChainTransactionHistory from './CrossChainTransactionHistory';
import { itemPopUpVariants } from '@/lib/animation';
import { cn } from '@/lib/tailwindcss';

const CrossChainSwapLayout: React.FC = observer(() => {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="w-full flex flex-col pb-4 sm:pb-8">
      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-6 max-w-7xl flex flex-col gap-4 sm:gap-6">
          {/* Swap and Chart Section */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Chart - Hidden on mobile, visible on larger screens */}
            <motion.div
              variants={itemPopUpVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5 }}
              className="hidden sm:flex order-2 lg:order-1 lg:flex-1 flex-col h-[300px] sm:h-[400px]"
            >
              <div className="flex-1 w-full">
                <CrossChainKlineChart refreshKey={refreshKey} />
              </div>
            </motion.div>

            {/* Swap Card - Full width on mobile */}
            <motion.div
              variants={itemPopUpVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5 }}
              className="order-1 lg:order-2 flex justify-center lg:justify-end w-full lg:w-auto"
            >
              <CrossChainSwapCard
                onSwapSuccess={() => {
                  setRefreshKey((k) => k + 1);
                }}
              />
            </motion.div>
          </div>

          {/* Transaction History Section - Responsive height */}
          <motion.div
            variants={itemPopUpVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5 }}
            className="w-full h-[400px] sm:h-[350px]"
          >
            <div className="bg-[#140D06] rounded-xl sm:rounded-2xl border border-[#333333] p-2 sm:p-4 h-full flex flex-col overflow-hidden">
              <Tabs
                classNames={{
                  tabList: cn(
                    'bg-transparent rounded-none p-0 gap-6 flex-shrink-0',
                    'border-b border-[#333333]'
                  ),
                  cursor: 'bg-transparent shadow-none',
                  tab: cn(
                    'bg-transparent px-0 h-12',
                    'data-[selected=true]:bg-transparent',
                    'data-[selected=true]:border-b-2 data-[selected=true]:border-[#F59E0B]',
                    'data-[hover-unselected=true]:opacity-70'
                  ),
                  tabContent: cn(
                    'text-gray-400 group-data-[selected=true]:text-white',
                    'text-base font-medium'
                  ),
                  panel: 'flex-1 overflow-hidden flex flex-col pt-4 min-h-0',
                }}
                variant="underlined"
              >
                <Tab key="history" title="Transaction History">
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
                    <CrossChainTransactionHistory inModal={false} />
                  </div>
                </Tab>
              </Tabs>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
});

export default CrossChainSwapLayout;
