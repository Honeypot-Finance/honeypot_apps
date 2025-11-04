import { Input } from '@/components/algebra/ui/input';
import { Currency, CurrencyAmount, WNATIVE } from '@cryptoalgebra/sdk';
import { useCallback, useMemo } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { Address } from 'viem';
import { formatCurrency } from '@/lib/algebra/utils/common/formatCurrency';

import { Token } from '@honeypot/shared/lib/contract/token/token';
import { TokenLogo } from '@honeypot/shared/components/TokenLogo/TokenLogo';
import { cn } from '@/lib/utils';
import { HiOutlineSwitchHorizontal, HiSwitchVertical } from 'react-icons/hi';
import { wallet } from '@honeypot/shared/lib/wallet';

interface EnterAmountsCardProps {
  currency: Currency | undefined;
  value: string;
  needApprove: boolean;
  error: string | undefined;
  valueForApprove: CurrencyAmount<Currency> | undefined;
  handleChange: (value: string) => void;
  useNative: boolean;
  setUseNative: (useNative: boolean) => void;
}

const EnterAmountCard = ({
  currency,
  value,
  handleChange,
  useNative,
  setUseNative,
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
    <div className="w-full rounded-lg border bg-[#1F150A] py-3 px-4 border-[#3B2712]">
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
          <span className="font-medium text-white font-gliker text-lg">
            {currency
              ? currency.wrapped.address.toLowerCase() ===
                wallet.currentChain.nativeToken.address.toLowerCase()
                ? useNative
                  ? wallet.currentChain.nativeToken.symbol
                  : `W${wallet.currentChain.nativeToken.symbol}`
                : currency.symbol
              : 'Select a token'}
          </span>
          {currency?.wrapped.address ===
            wallet.currentChain.nativeToken.address && (
            <HiOutlineSwitchHorizontal
              className="w-5 h-5 text-white cursor-pointer min-w-5 min-h-5 z-10 hover:text-[#FDB500] transition-colors"
              onClick={() => setUseNative(!useNative)}
            />
          )}
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
              'text-white',
              'text-lg',
              'font-medium',
              'w-[160px]',
              'font-gliker',
              'h-[28px]'
            )}
            classNames={{
              inputWrapper: cn(
                '!bg-transparent',
                'border-none',
                'shadow-none',
                '!transition-none',
                'data-[invalid=true]:!bg-transparent',
                'group-data-[invalid=true]:!bg-transparent',
                'pr-3'
              ),
              input: cn(
                '!bg-transparent',
                '!text-white',
                'text-right',
                'text-lg',
                '!pr-0',
                '[appearance:textfield]',
                '[&::-webkit-outer-spin-button]:appearance-none',
                '[&::-webkit-inner-spin-button]:appearance-none',
                'data-[invalid=true]:!bg-transparent'
              ),
            }}
          />
          {currency && account && (
            <div className="flex items-center gap-2 text-sm font-gliker">
              <span className="text-gray-400">
                Balance: {balanceString}
              </span>
              <button
                onClick={setMax}
                className="text-[#FDB500] hover:text-[#FFD666] font-medium transition-colors"
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
