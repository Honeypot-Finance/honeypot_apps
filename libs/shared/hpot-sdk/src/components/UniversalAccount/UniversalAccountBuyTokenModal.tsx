'use client';
import { observer } from 'mobx-react-lite';
import { DynamicFormatAmount, wallet } from '@honeypot/shared';
import { NotConnected } from './AccountStatus/NotConnected';
import { zeroAddress } from 'viem';
import { useMemo } from 'react';
import { BuyTokenSelection } from './BuyTokenSelection';
import buyWithUniversalAccountService from '../../services/particleUniversalAccount/buyWithUniversalAccountService';
import { Button } from '../button';
import { ChainNotSupport } from './AccountStatus/ChainNotSupport';
export const UniversalAccountBuyTokenModal = observer(() => {
  const notConnected = useMemo(() => {
    const isNotConnected =
      !wallet.isInit ||
      !wallet.account ||
      wallet.account === zeroAddress ||
      !wallet.universalAccount;

    return isNotConnected;
  }, [
    wallet.isInit,
    wallet.account,
    wallet.universalAccount,
    wallet.universalAccount?.accountUsdValue,
  ]);

  if (!wallet.currentChain.supportUniversalAccount) {
    return <ChainNotSupport />;
  }

  if (notConnected) {
    return <NotConnected />;
  }

  return (
    <div className="flex flex-col relative bg-white custom-dashed px-[18px] py-6 w-full gap-y-4">
      <div className="w-full flex items-center justify-between gap-x-2">
        <h2 className="font-bold">Buy Token with Universal Account</h2>
        <span className="text-sm font-semibold">
          Balance: {DynamicFormatAmount({
            amount: wallet.universalAccount?.accountUsdValue ?? 0,
            decimals: 2,
            endWith: '$',
          })}
        </span>
      </div>
      <BuyTokenSelection />
      <div className="text-red-500">
        {buyWithUniversalAccountService.errorText}
      </div>
      <Button
        disabled={!!buyWithUniversalAccountService.errorText}
        isDisabled={!!buyWithUniversalAccountService.errorText}
        onPress={() =>
          buyWithUniversalAccountService.buyToken &&
          wallet.universalAccount?.buyToken(
            buyWithUniversalAccountService.buyToken,
            buyWithUniversalAccountService.accountSpendAmountUSD
          )
        }
      >
        Buy Token
      </Button>
    </div>
  );
});
