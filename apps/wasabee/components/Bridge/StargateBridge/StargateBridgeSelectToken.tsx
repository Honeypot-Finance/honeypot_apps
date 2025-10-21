import { stargateBridgeService } from '@/services/stargateBridge';
import { wallet } from '@honeypot/shared/lib/wallet';
import { useEffect, useState } from 'react';
import { TokenSelector } from '@honeypot/shared/components/TokenSelector';

import { Token } from '@honeypot/shared/lib/contract/token/token';
import { Currency } from '@cryptoalgebra/sdk';

export default function StargateBridgeSelectToken() {
  const [tokens, setTokens] = useState<Token[]>([]);

  useEffect(() => {
    if (wallet.currentChainId) {
      const tokens = stargateBridgeService.getAvailableTokens();
      setTokens(tokens);
      stargateBridgeService.setSelectedToken(tokens[0]);
    }
  }, [wallet.currentChainId]);

  const handleTokenSelect = (token: Token) => {
    stargateBridgeService.setSelectedToken(token);
  };

  return (
    <TokenSelector
      staticTokenList={tokens}
      disableSearch={true}
      value={stargateBridgeService.selectedToken}
      onSelect={async (token) => {
        await token.init();
        handleTokenSelect(token);
      }}
    />
  );
}
