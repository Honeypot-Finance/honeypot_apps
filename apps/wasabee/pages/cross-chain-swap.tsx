import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { wallet } from '@honeypot/shared/lib/wallet';
import { LoadingDisplay } from '@/components/LoadingDisplay/LoadingDisplay';
import CrossChainSwapLayout from '@/components/cross-chain-swap/CrossChainSwapLayout';

const CrossChainSwapPage = observer(() => {
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

  return <CrossChainSwapLayout />;
});

export default CrossChainSwapPage;
