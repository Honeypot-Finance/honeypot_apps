import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'framer-motion';
import CrossChainSwapCard from './CrossChainSwapCard';
import CrossChainKlineChart from './CrossChainKlineChart';
import CrossChainTransactionHistory from './CrossChainTransactionHistory';
import { itemPopUpVariants } from '@/lib/animation';

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

          {/* Transaction History Section - Table Style Design */}
          <motion.div
            variants={itemPopUpVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <CrossChainTransactionHistory inModal={false} />
          </motion.div>
        </div>
      </div>
    </div>
  );
});

export default CrossChainSwapLayout;
