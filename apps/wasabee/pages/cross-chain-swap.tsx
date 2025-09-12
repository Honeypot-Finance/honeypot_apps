import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { wallet } from '@honeypot/shared/lib/wallet';
import { LoadingDisplay } from '@/components/LoadingDisplay/LoadingDisplay';
import CrossChainSwapLayout from '@/components/cross-chain-swap/CrossChainSwapLayout';
import { useAccount } from 'wagmi';
import { Button } from '@nextui-org/react';
import { universalAccountService } from '@/services/universalAccountService';

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

  // Check if Universal Account service is still loading
  if (universalAccountService.isLoading) {
    return (
      <div className="w-full min-h-[80vh] flex items-center justify-center">
        <div className="bg-[#1a1a1a] rounded-3xl border border-[#2a2a2a] shadow-2xl p-8">
          <LoadingDisplay />
          <p className="text-center text-gray-400 mt-4">
            Loading supported chains...
          </p>
        </div>
      </div>
    );
  }

  // Check if current chain supports Universal Account
  // const isCurrentChainSupported = universalAccountService.isChainSupported(
  //   wallet.currentChain?.chainId || 0
  // );

  // if (
  //   !isCurrentChainSupported &&
  //   universalAccountService.availableChains.length > 0
  // ) {
  //   return (
  //     <div className="w-full min-h-[80vh] flex items-center justify-center pb-6 sm:pb-12 overflow-x-hidden">
  //       <div className="bg-[#1a1a1a] rounded-3xl border border-[#2a2a2a] shadow-2xl p-8 max-w-[600px] mx-auto">
  //         <div className="text-center">
  //           <p className="text-xl font-bold mb-4 text-white">
  //             Cross-Chain Swap Not Available
  //           </p>
  //           <p className="text-base text-gray-300">
  //             Universal Account is not supported on this chain.
  //           </p>
  //           <p className="text-sm mt-2 text-gray-400">
  //             Please switch to one of these supported chains:
  //           </p>
  //           <div className="flex flex-wrap justify-center gap-2 mt-3">
  //             {universalAccountService.availableChains.map((chain) => (
  //               <Button
  //                 key={chain.chainId}
  //                 size="sm"
  //                 variant="flat"
  //                 className="bg-[#2a2a2a] text-white"
  //                 onPress={() => wallet.changeChain(chain.chainId)}
  //               >
  //                 {chain.chain.name}
  //               </Button>
  //             ))}
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

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
