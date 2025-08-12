import { Input } from './../algebra/ui/input';
import { Currency, Percent } from '@cryptoalgebra/sdk';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useAccount, useBalance, useWatchBlockNumber } from 'wagmi';
import { Address, zeroAddress } from 'viem';
import { TokenSelector } from '../TokenSelector';
import { Token as AlgebraToken } from '@cryptoalgebra/sdk';
import { wallet } from './../../lib/wallet';
import { Token } from './../../lib/contract/token/token';
import { Slider } from '@nextui-org/react';
import { debounce } from 'lodash';
import { ItemSelect, SelectState, SelectItem } from './../ItemSelect/v3';
import { cn } from '@nextui-org/react';
import BigNumber from 'bignumber.js';
import { DynamicFormatAmount } from '../../lib/utils';
import { observer } from 'mobx-react-lite';

interface TokenSwapCardProps {
  handleTokenSelection: (currency: Currency) => void;
  handleValueChange?: (value: string) => void;
  handleMaxValue?: () => void;
  value: string;
  currency: Currency | null | undefined;
  otherCurrency: Currency | null | undefined;
  fiatValue?: ReactNode;
  priceImpact?: Percent;
  showMaxButton?: boolean;
  showBalance?: boolean;
  showNativeToken?: boolean;
  disabled?: boolean;
  label?: string;
  disableSelection?: boolean;
  showInput?: boolean;
  showSettings?: boolean;
  staticTokenList?: Token[];
  showAdvancedInput?: boolean;
  classNames?: {
    textColors?: {
      all?: string;
      maxButton?: string;
      balance?: string;
    };
  };
}

const TokenCard = observer(
  ({
    handleTokenSelection,
    handleValueChange,
    handleMaxValue,
    value,
    currency,
    fiatValue,
    showMaxButton,
    showBalance = true,
    showNativeToken,
    disabled,
    label,
    showInput = true,
    disableSelection,
    staticTokenList,
    showAdvancedInput = true,
    classNames,
  }: TokenSwapCardProps) => {
    const { address: account } = useAccount();
    useWatchBlockNumber({
      onBlockNumber: () => {
        refetch();
      },
    });
    const [storedValue, setStoredValue] = useState(value);

    const {
      data: balance,
      isLoading,
      refetch,
    } = useBalance({
      address: account,
      token: currency?.isNative
        ? undefined
        : (currency?.wrapped.address as Address),
    });

    useEffect(() => {
      setStoredValue(value);
    }, [value]);

    const handleInput = useMemo(
      () =>
        debounce((value: string) => {
          if (value === '.') value = '0.';
          console.log('value', value);
          handleValueChange?.(value);
        }, 200),
      []
    );

    const handleTokenSelect = (newCurrency: Currency) => {
      handleTokenSelection(newCurrency);
    };

    return (
      <div className="flex-1 w-full flex flex-col gap-y-3 ">
        <div className="text-black flex items-center justify-between px-2">
          <span>{label}</span>
          <div className="flex items-center gap-x-2">
            {currency && account && showBalance && (
              <div className={cn('flex items-center gap-x-2')}>
                <div className={cn(classNames?.textColors?.balance)}>
                  <span>Balance: </span>
                  <span>
                    {DynamicFormatAmount({
                      amount: new BigNumber(balance?.value ?? 0)
                        .div(10 ** (balance?.decimals ?? 18))
                        .toFixed(18),
                      decimals: 5,
                      endWith: currency.symbol,
                    })}
                  </span>
                </div>
                {showMaxButton && (
                  <button
                    className={cn(
                      'cursor-pointer text-[#63b4ff]',
                      classNames?.textColors?.maxButton
                    )}
                    onClick={handleMaxValue}
                  >
                    Max
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="w-full  rounded-2xl border bg-card-dark shadow-[0px_332px_93px_0px_rgba(0,0,0,0.00),0px_212px_85px_0px_rgba(0,0,0,0.01),0px_119px_72px_0px_rgba(0,0,0,0.05),0px_53px_53px_0px_rgba(0,0,0,0.09),0px_13px_29px_0px_rgba(0,0,0,0.10)] flex items-center justify-between px-4 py-2.5 gap-x-2">
          <div className="grid grid-cols-[max-content_auto] w-full">
            <div className="flex-grow">
              <TokenSelector
                staticTokenList={staticTokenList}
                value={
                  currency?.wrapped?.address
                    ? Token.getToken({
                        address: currency?.wrapped.address,
                        isNative: currency.isNative,
                        chainId: wallet.currentChainId.toString(),
                      })
                    : undefined
                }
                disableSelection={disableSelection}
                onSelect={async (token) => {
                  await token.init();
                  handleTokenSelect(
                    token.isNative
                      ? new AlgebraToken(
                          wallet.currentChainId,
                          zeroAddress,
                          wallet.currentChain.nativeToken.decimals,
                          wallet.currentChain.nativeToken.symbol,
                          wallet.currentChain.nativeToken.name
                        ) && ({ isNative: true } as Currency)
                      : new AlgebraToken(
                          wallet.currentChainId,
                          token.address,
                          Number(token.decimals),
                          token.symbol,
                          token.name
                        )
                  );
                }}
              />
            </div>
            {showInput && (
              <div className="flex flex-col items-end">
                <Input
                  disabled={disabled}
                  type="text"
                  value={storedValue}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setStoredValue(e.target.value);
                    handleInput(e.target.value);
                  }}
                  className={cn(
                    'text-right',
                    '!bg-transparent',
                    '[&_*]:!bg-transparent',
                    'data-[invalid=true]:!bg-transparent'
                  )}
                  classNames={{
                    inputWrapper: cn(
                      '!bg-transparent',
                      'border-none',
                      'shadow-none',
                      '!transition-none',
                      'data-[invalid=true]:!bg-transparent',
                      'group-data-[invalid=true]:!bg-transparent'
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
                    clearButton: cn(
                      'opacity-70',
                      'hover:opacity-100',
                      '!text-black',
                      '!p-0',
                      'end-0 start-auto'
                    ),
                  }}
                  placeholder="0.0"
                  maxDecimals={currency?.decimals ?? 0 + 2}
                />
                {showBalance && fiatValue && (
                  <div className="text-sm">{fiatValue}</div>
                )}
              </div>
            )}
          </div>
        </div>

        {showInput && showAdvancedInput && label?.toLowerCase() !== 'to' && (
          <div className="p-2 space-y-4">
            <Slider
              className="w-full"
              size="sm"
              maxValue={Number(balance?.formatted)}
              minValue={0}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(value: any) => {
                if (isNaN(value)) return;
                const maxValue = BigNumber(balance?.value.toString() ?? 0).div(
                  10 ** (balance?.decimals ?? 18)
                );
                if (maxValue.lt(value.toString())) {
                  handleInput(maxValue.toString());
                  setStoredValue(maxValue.toString());
                } else {
                  setStoredValue(value.toString());
                  handleInput(value.toString());
                }
              }}
              value={Number(storedValue)}
              step={Math.pow(0.1, 18)}
            />

            <ItemSelect
              selectState={
                new SelectState({
                  value: Number(storedValue),
                  onSelectChange: (value) => {
                    if (value == 1) {
                      handleInput(
                        BigNumber(balance?.value.toString() ?? 0)
                          .div(10 ** (balance?.decimals ?? 18))
                          .toString()
                      );
                    } else {
                      handleInput(
                        BigNumber(balance?.value.toString() ?? 0)
                          .div(10 ** (balance?.decimals ?? 18))
                          .times(value)
                          .toString()
                      );
                    }
                  },
                })
              }
              className="grid grid-cols-2 lg:grid-cols-4 gap-[16px] justify-around w-full"
            >
              <SelectItem className="rounded-[30px] px-[24px]" value={0.25}>
                25%
              </SelectItem>
              <SelectItem className="rounded-[30px] px-[24px]" value={0.5}>
                50%
              </SelectItem>
              <SelectItem className="rounded-[30px] px-[24px]" value={0.75}>
                75%
              </SelectItem>
              <SelectItem className="rounded-[30px] px-[24px]" value={1}>
                100%
              </SelectItem>
            </ItemSelect>
          </div>
        )}
      </div>
    );
  }
);

export default TokenCard;
