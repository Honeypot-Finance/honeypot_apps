import { HoneyContainer } from '@/components/CardContianer';
import { xSwap } from '@/services/xswap';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { wallet } from '@/services/wallet';

const TestPage = observer(() => {
  return (
    <div className="w-full px-4 py-4 flex gap-4 justify-start items-start ">
      <HoneyContainer className="w-full max-w-[1240px] mx-auto">
        <div className="w-full flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          <div className="text-lg font-bold mb-2">
            Wallet Status: {wallet.isInit ? 'Connected' : 'Not Connected'}
          </div>
          <div className="text-lg font-bold mb-2">
            Account: {wallet.account || 'Not Connected'}
          </div>
          <div className="text-lg font-bold mb-2">
            Tokens: {xSwap.xSwapTokens?.length || 0}
          </div>
          <div className="text-lg font-bold mb-4">Token Balances:</div>

          {xSwap.xSwapTokens?.map((token, idx) => (
            <div key={idx} className="p-2 border rounded">
              <div className="font-semibold">{token.symbol}</div>
              <div>Address: {token.address}</div>
              <div>Balance: {token.balance.toString() || '0'}</div>
              <div>
                Balance (raw): {token.balanceWithoutDecimals.toString()}
              </div>
              <div>Decimals: {token.decimals}</div>
            </div>
          ))}
        </div>
      </HoneyContainer>
    </div>
  );
});

export default TestPage;
