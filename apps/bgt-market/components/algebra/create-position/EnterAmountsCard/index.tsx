import { Input } from '@/components/algebra/ui/input';
import { Currency, CurrencyAmount } from '@cryptoalgebra/sdk';
import { useCallback, useMemo } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { Address } from 'viem';
import { formatCurrency } from '@/lib/algebra/utils/common/formatCurrency';

import { Token } from '@honeypot/shared';
import { TokenLogo } from '@honeypot/shared';
import { wallet } from '@honeypot/shared/lib/wallet';
import { cn } from '@/lib/utils';

interface EnterAmountsCardProps {
  currency: Currency | undefined;
  value: string;
  needApprove: boolean;
  error: string | undefined;
  valueForApprove: CurrencyAmount<Currency> | undefined;
  handleChange: (value: string) => void;
}

const EnterAmountCard = ({
  currency,
  value,
  handleChange,
}: EnterAmountsCardProps) => {
  const { address: account } = useAccount();

  const { data: balance, isLoading } = useBalance({
    address: account,
    token: currency?.isNative
      ? undefined
      : (currency?.wrapped.address as Address),
    // watch: true,
  });

  const balanceString = useMemo(() => {
    if (isLoading || !balance) return 'Loading...';

    return formatCurrency.format(Number(balance.formatted));
  }, [balance, isLoading]);

  const handleInput = useCallback((value: string) => {
    if (value === '.') value = '0.';
    handleChange(value);
  }, []);

  function setMax() {
    handleChange(balance?.formatted || '0');
  }

  return (
    <div className="w-full rounded-2xl border bg-white shadow-[0px_332px_93px_0px_rgba(0,0,0,0.00),0px_212px_85px_0px_rgba(0,0,0,0.01),0px_119px_72px_0px_rgba(0,0,0,0.05),0px_53px_53px_0px_rgba(0,0,0,0.09),0px_13px_29px_0px_rgba(0,0,0,0.10)] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {currency && (
            <TokenLogo
              addtionalClasses="w-8 h-8"
              token={Token.getToken({
                address: currency.wrapped.address,
                chainId: wallet.currentChainId.toString(),
              })}
            />
          )}
          <span className="font-medium text-black">
            {currency ? currency.symbol : 'Select a token'}
          </span>
        </div>

        <div className="flex flex-col items-end gap-1">
          <Input
            value={value}
            id={`amount-${currency?.symbol}`}
            onUserInput={(v: string) => handleInput(v)}
            placeholder={'0.00'}
            maxDecimals={currency?.decimals}
            className={cn(
              'text-right',
              '!bg-transparent',
              '[&_*]:!bg-transparent',
              'data-[invalid=true]:!bg-transparent',
              'border-none',
              'text-black',
              'text-xl',
              'font-medium',
              'w-[160px]'
            )}
            classNames={{
              inputWrapper: cn(
                '!bg-transparent',
                'border-none',
                'shadow-none',
                '!transition-none',
                'data-[invalid=true]:!bg-transparent',
                'group-data-[invalid=true]:!bg-transparent',
                'pr-5'
              ),
              input: cn(
                '!bg-transparent',
                '!text-[#202020]',
                'text-right',
                'text-xl',
                '!pr-0',
                '[appearance:textfield]',
                '[&::-webkit-outer-spin-button]:appearance-none',
                '[&::-webkit-inner-spin-button]:appearance-none',
                'data-[invalid=true]:!bg-transparent'
              ),
            }}
          />
          {currency && account && (
            <div className="flex items-center gap-2 text-sm text-[#202020]">
              <span>Balance: {balanceString}</span>
              <button
                onClick={setMax}
                className="text-[#FFCD4D] hover:text-[#ffd666] font-medium transition-colors"
              >
                Max
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnterAmountCard;
