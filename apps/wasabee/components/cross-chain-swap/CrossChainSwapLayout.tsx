import React from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'framer-motion';
import CrossChainSwapCard from './CrossChainSwapCard';
import CrossChainTransactionHistory from './CrossChainTransactionHistory';
import { itemPopUpVariants } from '@/lib/animation';

const CrossChainSwapLayout: React.FC = observer(() => {

  return (
    <div className="w-full flex flex-col pb-4 sm:pb-8">
      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-6 max-w-7xl flex flex-col gap-4 sm:gap-6">
          {/* Swap and Transaction History Section */}
          <div className="flex flex-col lg:flex-row gap-4 lg:items-start">
            {/* Swap Card - Left side on desktop, top on mobile */}
            <motion.div
              variants={itemPopUpVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5 }}
              className="order-1 flex justify-center lg:justify-start w-full lg:w-auto"
            >
              <CrossChainSwapCard />
            </motion.div>

            {/* Transaction History - Right side on desktop, below on mobile */}
            <motion.div
              variants={itemPopUpVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5 }}
              className="order-2 lg:flex-1 w-full h-full min-w-0"
            >
              <div className="h-full overflow-hidden">
                <CrossChainTransactionHistory inModal={false} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default CrossChainSwapLayout;
