import { orbiterBridgeService } from '@/services/orbiterBridge';
import { wallet } from '@honeypot/shared/lib/wallet';
import { useEffect, useState } from 'react';
import { TokenSelector } from '@honeypot/shared/components/TokenSelector';
import { Token } from '@honeypot/shared/lib/contract/token/token';
import { observer } from 'mobx-react-lite';

export const OrbiterBridgeSelectToken = observer(() => {
  const [tokens, setTokens] = useState<Token[]>([]);

  useEffect(() => {
    if (wallet.currentChainId && orbiterBridgeService.orbiter) {
      const tokens = orbiterBridgeService.getAvailableTokens(
        wallet.currentChainId.toString()
      );
      setTokens(tokens);
      if (tokens.length > 0) {
        handleTokenSelect(tokens[0]);
      }
      console.log(tokens);
    }
  }, [wallet.currentChainId, orbiterBridgeService.orbiter]);

  useEffect(() => {
    if (orbiterBridgeService.selectedToken) {
      orbiterBridgeService.selectedToken.getBalance();
    }
  }, [orbiterBridgeService.selectedToken, wallet.currentChainId]);

  const handleTokenSelect = (token: Token) => {
    orbiterBridgeService.setSelectedToken(token);
    token.getBalance();
  };

  return (
    <div className="flex gap-2 justify-between items-center">
      <TokenSelector
        staticTokenList={tokens}
        disableSearch={true}
        value={orbiterBridgeService.selectedToken}
        onSelect={async (token) => {
          await token.init();
          handleTokenSelect(token);
        }}
      />
      <div className="text-sm text-gray-500">
        Balance: {orbiterBridgeService.selectedToken?.balanceFormatted}
      </div>
    </div>
  );
});
