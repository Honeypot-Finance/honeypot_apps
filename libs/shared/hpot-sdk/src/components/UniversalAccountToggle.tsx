'use client';
import { observer } from 'mobx-react-lite';
import { Switch, Tooltip } from '@nextui-org/react';
import { wallet } from '../lib/wallet';
import { zeroAddress } from 'viem';

export const UniversalAccountToggle = observer(() => {
  const canUseUniversalAccount =
    wallet.isInit &&
    wallet.account &&
    wallet.account !== zeroAddress &&
    wallet.universalAccount &&
    wallet.currentChain.supportUniversalAccount;

  if (!canUseUniversalAccount) {
    return null;
  }

  return (
    <Tooltip
      content={
        <div className="p-2 max-w-xs">
          <div className="font-semibold text-sm mb-1">Universal Account</div>
          <div className="text-xs text-gray-600">
            {wallet.useUniversalAccount
              ? 'All transactions will be processed through your Universal Account'
              : 'Switch to Universal Account for cross-chain functionality and enhanced features'}
          </div>
          {wallet.useUniversalAccount && wallet.universalAccount && (
            <div className="text-xs text-green-600 mt-1">
              Balance: ${wallet.universalAccount.accountUsdValue.toFixed(2)}
            </div>
          )}
        </div>
      }
      placement="bottom"
    >
      <div className="relative">
        <Switch
          size="lg"
          isSelected={wallet.useUniversalAccount}
          onValueChange={(value) => {
            console.log(
              '🔄 UniversalAccountToggle - Setting UA mode to:',
              value
            );
            wallet.setUniversalAccountMode(value);
            console.log(
              '🔄 UniversalAccountToggle - New wallet.useUniversalAccount:',
              wallet.useUniversalAccount
            );
          }}
          classNames={{
            base: 'inline-flex',
            wrapper:
              'p-0 h-6 w-12 overflow-visible bg-gray-300 group-data-[selected=true]:bg-primary-500',
            thumb:
              'w-5 h-5 border-2 shadow-lg bg-white group-data-[hover=true]:border-primary group-data-[selected=true]:ml-6 group-data-[pressed=true]:w-6 group-data-[selected]:group-data-[pressed]:ml-5',
          }}
        />
        {/* UA text overlay on the toggle - positioned on the inactive side */}
        <div className="absolute inset-0 flex items-center pointer-events-none">
          <span
            className={`text-[13px] font-bold transition-all duration-200 ${
              wallet.useUniversalAccount
                ? 'text-white ml-1'
                : 'text-gray-700 ml-6'
            }`}
          >
            UA
          </span>
        </div>
      </div>
    </Tooltip>
  );
});
