import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'framer-motion';
import { wallet } from '@honeypot/shared/lib/wallet';
import { itemPopUpVariants } from '@/lib/animation';
import { LoadingDisplay } from '@/components/LoadingDisplay/LoadingDisplay';
import CrossChainSwapCard from '@/components/cross-chain-swap/CrossChainSwapCard';
import TransactionHistoryModal from '@/components/cross-chain-swap/TransactionHistoryModal';
import { useAccount } from 'wagmi';
import { Button } from '@nextui-org/react';
import { History } from 'lucide-react';
import { universalAccountService } from '@/services/universalAccountService';

const CrossChainSwapPage = observer(() => {
  const { address } = useAccount();
  const [refreshKey, setRefreshKey] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const isInit = wallet.isInit;

  // Set dark background for this page
  useEffect(() => {
    document.body.style.backgroundColor = '#0a0a0a';
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);

  if (!isInit) {
    return <LoadingDisplay />;
  }

  // Check if Universal Account service is still loading
  if (universalAccountService.isLoading) {
    return (
      <div className="w-full min-h-[80vh] flex items-center justify-center">
        <div className="bg-[#1a1a1a] rounded-3xl border border-[#2a2a2a] shadow-2xl p-8">
          <LoadingDisplay />
          <p className="text-center text-gray-400 mt-4">Loading supported chains...</p>
        </div>
      </div>
    );
  }

  // Check if current chain supports Universal Account
  const isCurrentChainSupported = universalAccountService.isChainSupported(wallet.currentChain?.chainId || 0);
  
  if (!isCurrentChainSupported && universalAccountService.availableChains.length > 0) {
    return (
      <div className="w-full min-h-[80vh] flex items-center justify-center pb-6 sm:pb-12 overflow-x-hidden">
        <div className="bg-[#1a1a1a] rounded-3xl border border-[#2a2a2a] shadow-2xl p-8 max-w-[600px] mx-auto">
          <div className="text-center">
            <p className="text-xl font-bold mb-4 text-white">Cross-Chain Swap Not Available</p>
            <p className="text-base text-gray-300">Universal Account is not supported on this chain.</p>
            <p className="text-sm mt-2 text-gray-400">
              Please switch to one of these supported chains:
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-3">
              {universalAccountService.availableChains.map(chain => (
                <Button
                  key={chain.chainId}
                  size="sm"
                  variant="flat"
                  className="bg-[#2a2a2a] text-white"
                  onPress={() => wallet.changeChain(chain.chainId)}
                >
                  {chain.chain.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="w-full min-h-[80vh] flex items-center justify-center pb-6 sm:pb-12 overflow-x-hidden">
        <div className="bg-[#1a1a1a] rounded-3xl border border-[#2a2a2a] shadow-2xl p-8 max-w-[600px] mx-auto">
          <div className="text-center">
            <p className="text-xl font-bold mb-4 text-white">Connect Wallet</p>
            <p className="text-base text-gray-300">Please connect your wallet to use cross-chain swap.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[80vh] flex flex-col items-center justify-center pb-6 sm:pb-12 pt-8">
      <div className="w-full max-w-[500px] px-2 sm:px-4">
        <motion.div
          variants={itemPopUpVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5 }}
          className="relative w-full flex flex-col items-center"
        >
          <CrossChainSwapCard
            onSwapSuccess={() => {
              setRefreshKey((k) => k + 1);
              // Optionally open history after successful swap
              setShowHistory(true);
            }}
          />
          
          {/* Transaction History Button */}
          <Button
            variant="flat"
            size="lg"
            className="mt-6 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white border border-[#2a2a2a] px-6"
            startContent={<History className="w-5 h-5" />}
            onPress={() => setShowHistory(true)}
          >
            View Transaction History
          </Button>
        </motion.div>
      </div>

      {/* Transaction History Modal */}
      <TransactionHistoryModal 
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
      />
    </div>
  );
});

export default CrossChainSwapPage;