import { Input } from '@/components/algebra/ui/input';
import { formatBalance } from '@/lib/algebra/utils/common/formatBalance';
import { formatUSD } from '@/lib//algebra/utils/common/formatUSD';
import { Currency, Percent } from '@cryptoalgebra/sdk';
import { useCallback, useMemo } from 'react';
import { useAccount, useBalance, useWatchBlockNumber } from 'wagmi';
import { Address } from 'viem';
import { TokenSelector } from '@honeypot/shared';
import { Token as AlgebraToken } from '@cryptoalgebra/sdk';
import { wallet } from '@honeypot/shared/lib/wallet';

import { Token } from '@honeypot/shared';

interface TokenSwapCardProps {
  handleTokenSelection: (currency: Currency) => void;
  handleValueChange?: (value: string) => void;
  handleMaxValue?: () => void;
  value: string;
  currency: Currency | null | undefined;
  otherCurrency: Currency | null | undefined;
  fiatValue?: number;
  priceImpact?: Percent;
  showMaxButton?: boolean;
  showBalance?: boolean;
  showNativeToken?: boolean;
  disabled?: boolean;
  showInput?: boolean;
}

const TokenCard = ({
  handleTokenSelection,
  handleValueChange,
  handleMaxValue,
  value,
  currency,
  otherCurrency,
  fiatValue,
  showMaxButton,
  showBalance = true,
  showNativeToken,
  disabled,
  showInput = true,
}: TokenSwapCardProps) => {
  const { address: account } = useAccount();
  useWatchBlockNumber({
    onBlockNumber: () => {
      refetch();
    },
  });

  const {
    data: balance,
    isLoading,
    refetch,
  } = useBalance({
    address: account,
    token: currency?.isNative
      ? undefined
      : (currency?.wrapped.address as Address),
    //watch: true,
  });

  const balanceString = useMemo(() => {
    if (isLoading || !balance) return 'Loading...';

    return formatBalance(balance.formatted);
  }, [balance, isLoading]);

  const handleInput = useCallback((value: string) => {
    if (value === '.') value = '0.';
    handleValueChange?.(value);
  }, []);

  const handleTokenSelect = (newCurrency: Currency) => {
    handleTokenSelection(newCurrency);
  };

  return (
    <div className="flex w-full px-4 py-6 bg-card-dark rounded-2xl justify-center items-center">
      <div className="flex w-full gap-2">
        <TokenSelector
          value={
            currency?.wrapped.address
              ? Token.getToken({
                chainId: wallet.currentChainId.toString(),
                  address: currency?.wrapped.address,
                })
              : undefined
          }
          onSelect={(token) => {
            handleTokenSelect(
              new AlgebraToken(
                wallet.currentChainId,
                token.address,
                Number(token.decimals),
                token.symbol,
                token.name
              )
            );
          }}
        />
        {currency && account && (
          <div className={'flex text-sm whitespace-nowrap'}>
            {showBalance && (
              <div>
                <span className="font-semibold">Balance: </span>
                <span>{balanceString}</span>
              </div>
            )}
            {showMaxButton && (
              <button className="ml-2 text-[#63b4ff]" onClick={handleMaxValue}>
                Max
              </button>
            )}
          </div>
        )}
      </div>
      {showInput && (
        <div className="flex flex-col items-end w-full">
          <Input
            disabled={disabled}
            type={'text'}
            value={value}
            id={`amount-${currency?.symbol}`}
            onUserInput={(v: string) => handleInput(v)}
            className={`text-right border border-[rgba(225,138,32,0.40)] bg-[rgba(225,138,32,0.40)] placeholder:text-[#9E9DA3] text-xl font-bold w-9/12 p-2 disabled:cursor-default disabled:text-white`}
            placeholder={'0.0'}
            maxDecimals={currency?.decimals}
          />
          {showBalance && (
            <div className="text-sm">
              {fiatValue && formatUSD.format(fiatValue)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TokenCard;
