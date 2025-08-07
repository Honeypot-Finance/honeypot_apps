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
    <div className="w-full h-screen overflow-hidden flex flex-col">
      {/* Main content area with fixed height */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="container mx-auto px-4 py-6 max-w-7xl flex-1 flex flex-col">
          {/* Swap and Chart Section - Takes up most vertical space */}
          <div className="flex-1 flex flex-col lg:flex-row gap-4 mb-6 min-h-0">
            {/* Chart - Takes remaining horizontal and vertical space */}
            <motion.div
              variants={itemPopUpVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5 }}
              className="order-2 lg:order-1 lg:flex-1 flex flex-col min-h-[300px] lg:min-h-0"
            >
              <div className="flex-1 w-full">
                <CrossChainKlineChart refreshKey={refreshKey} />
              </div>
            </motion.div>

            {/* Swap Card - Fixed width and height */}
            <motion.div
              variants={itemPopUpVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5 }}
              className="order-1 lg:order-2 flex justify-center lg:justify-end lg:w-auto"
            >
              <CrossChainSwapCard
                onSwapSuccess={() => {
                  setRefreshKey((k) => k + 1);
                }}
              />
            </motion.div>
          </div>

          {/* Transaction History Section - Fixed height with scrollable content */}
          <motion.div
            variants={itemPopUpVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5 }}
            className="w-full h-[400px]"
          >
            <div className="bg-[#140D06] rounded-2xl border border-[#333333] p-4 h-full flex flex-col">
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
                  panel: 'flex-1 overflow-hidden flex flex-col pt-4',
                }}
                variant="underlined"
              >
                <Tab key="history" title="Transaction History">
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
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
