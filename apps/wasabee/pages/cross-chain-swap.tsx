import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { wallet } from '@honeypot/shared/lib/wallet';
import { LoadingDisplay } from '@/components/LoadingDisplay/LoadingDisplay';
import CrossChainSwapLayout from '@/components/cross-chain-swap/CrossChainSwapLayout';
import { useAccount } from 'wagmi';

const CrossChainSwapPage = observer(() => {
  const { address } = useAccount();
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

  if (!address) {
    return (
      <div className="w-full min-h-[80vh] flex items-center justify-center pb-6 sm:pb-12 overflow-x-hidden">
        <div className="bg-[#1a1a1a] rounded-3xl border border-[#2a2a2a] shadow-2xl p-8 max-w-[600px] mx-auto">
          <div className="text-center">
            <p className="text-xl font-bold mb-4 text-white">Connect Wallet</p>
            <p className="text-base text-gray-300">
              Please connect your wallet to use cross-chain swap.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <CrossChainSwapLayout />;
});

export default CrossChainSwapPage;
