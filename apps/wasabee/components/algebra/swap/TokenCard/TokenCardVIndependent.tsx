import { Input } from '@/components/algebra/ui/input';
import { formatBalance } from '@/lib/algebra/utils/common/formatBalance';
import { formatUSD } from '@/lib//algebra/utils/common/formatUSD';
import { Currency, Native, Percent } from '@cryptoalgebra/sdk';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useAccount, useBalance, useWatchBlockNumber } from 'wagmi';
import { Address, zeroAddress } from 'viem';
import { TokenSelector } from '@/components/TokenSelector/v3';
import { Token as AlgebraToken } from '@cryptoalgebra/sdk';
import { wallet } from '@/services/wallet';
import { Token } from '@/services/contract/token';
import { Slider } from '@nextui-org/react';
import { debounce } from 'lodash';
import NativeCurrency from '@cryptoalgebra/sdk/dist/entities/NativeCurrency';
import {
  ItemSelect,
  SelectState,
  SelectItem,
} from '@/components/ItemSelect/v3';
import { WNATIVE_EXTENDED } from '@/config/algebra/routing';
import { cn } from '@/lib/tailwindcss';
import { Button } from '@/components/algebra/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/algebra/ui/popover';
import { Separator } from '@/components/algebra/ui/separator';
import { Switch } from '@/components/algebra/ui/switch';
import CardContianer from '@/components/CardContianer/CardContianer';
import { useUserState } from '@/lib/algebra/state/userStore';
import { SettingsIcon } from 'lucide-react';
import BigNumber from 'bignumber.js';
import { useMediaQuery } from '@/lib/algebra/hooks/common/useMediaQuery';

// Settings Component
const Settings = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={'icon'} size={'icon'}>
          <SettingsIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="z-[9999]">
        <CardContianer addtionalClassName="flex-col gap-2">
          <div className="text-md font-bold">Transaction Settings</div>
          <Separator orientation={'horizontal'} className="bg-border" />
          <SlippageTolerance />
          <TransactionDeadline />
          <Multihop />
          <ExpertMode />
        </CardContianer>
      </PopoverContent>
    </Popover>
  );
};

const SlippageTolerance = () => {
  const {
    slippage,
    actions: { setSlippage },
  } = useUserState();

  const [slippageInput, setSlippageInput] = useState('');
  const [slippageError, setSlippageError] = useState<boolean>(false);

  function parseSlippageInput(value: string) {
    setSlippageInput(value);
    setSlippageError(false);

    if (value.length === 0) {
      setSlippage('auto');
    } else {
      const parsed = Math.floor(Number.parseFloat(value) * 100);

      if (!Number.isInteger(parsed) || parsed < 0 || parsed > 5000) {
        setSlippage('auto');
        if (value !== '.') {
          setSlippageError(true);
        }
      } else {
        setSlippage(new Percent(parsed, 10_000));
      }
    }
  }

  const tooLow =
    slippage !== 'auto' && slippage.lessThan(new Percent(5, 10_000));
  const tooHigh =
    slippage !== 'auto' && slippage.greaterThan(new Percent(1, 100));

  const slippageString = slippage !== 'auto' ? slippage.toFixed(2) : 'auto';

  return (
    <div className="flex flex-col gap-2">
      <div className="text-md font-semibold">Slippage Tolerance</div>
      <div className="flex gap-2">
        <Button
          variant={slippageString === 'auto' ? 'iconActive' : 'icon'}
          size={'sm'}
          onClick={() => parseSlippageInput('')}
        >
          Auto
        </Button>
        <Button
          variant={slippageString === '0.10' ? 'iconActive' : 'icon'}
          size={'sm'}
          onClick={() => parseSlippageInput('0.10')}
        >
          0.1%
        </Button>
        <Button
          variant={slippageString === '0.50' ? 'iconActive' : 'icon'}
          size={'sm'}
          onClick={() => parseSlippageInput('0.5')}
        >
          0.5%
        </Button>
        <Button
          variant={slippageString === '1.00' ? 'iconActive' : 'icon'}
          size={'sm'}
          onClick={() => parseSlippageInput('1')}
        >
          1%
        </Button>
        <div className="flex">
          <Input
            value={
              slippageInput.length > 0
                ? slippageInput
                : slippage === 'auto'
                ? ''
                : slippage.toFixed(2)
            }
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              parseSlippageInput(e.target.value)
            }
            onBlur={() => {
              setSlippageInput('');
              setSlippageError(false);
            }}
            className={`text-right border-none text-md font-semibold bg-card-dark rounded-l-xl rounded-r-none w-[70px]`}
            placeholder={'0.0'}
          />
          <div className="bg-card-dark text-sm p-2 pt-2.5 rounded-r-xl select-none">
            %
          </div>
        </div>
      </div>
      {slippageError || tooLow || tooHigh ? (
        <div>
          {slippageError ? (
            <div className="bg-red-900 text-red-200 px-2 py-1 rounded-xl">
              Enter a valid slippage percentage
            </div>
          ) : (
            <div className="bg-yellow-900 text-yellow-200 px-2 py-1 rounded-xl">
              {tooLow
                ? 'Your transaction may fail'
                : 'Your transaction may be frontrun'}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

const TransactionDeadline = () => {
  const {
    txDeadline,
    actions: { setTxDeadline },
  } = useUserState();

  const [deadlineInput, setDeadlineInput] = useState('');
  const [deadlineError, setDeadlineError] = useState<boolean>(false);

  function parseCustomDeadline(value: string) {
    setDeadlineInput(value);
    setDeadlineError(false);

    if (value.length === 0) {
      setTxDeadline(60 * 30);
    } else {
      try {
        const parsed: number = Math.floor(Number.parseFloat(value) * 60);
        if (!Number.isInteger(parsed) || parsed < 60 || parsed > 180 * 60) {
          setDeadlineError(true);
        } else {
          setTxDeadline(parsed);
        }
      } catch (error) {
        setDeadlineError(true);
      }
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="text-md font-semibold">Transaction Deadline</div>
      <div className="flex">
        <Input
          placeholder={'30'}
          value={
            deadlineInput.length > 0
              ? deadlineInput
              : txDeadline === 180
              ? ''
              : (txDeadline / 60).toString()
          }
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            parseCustomDeadline(e.target.value)
          }
          onBlur={() => {
            setDeadlineInput('');
            setDeadlineError(false);
          }}
          color={deadlineError ? 'red' : ''}
          className={`text-left border-none text-md font-semibold bg-card-dark rounded-l-xl rounded-r-none w-full`}
        />
        <div className="bg-card-dark text-sm p-2 pt-2.5 rounded-r-xl select-none">
          minutes
        </div>
      </div>
    </div>
  );
};

const ExpertMode = () => {
  const {
    isExpertMode,
    actions: { setIsExpertMode },
  } = useUserState();

  return (
    <div className="flex flex-col gap-2 max-w-[332px]">
      <div className="flex justify-between items-center gap-2 text-md font-semibold">
        <label htmlFor="expert-mode">Expert mode</label>
        <Switch
          id="expert-mode"
          checked={isExpertMode}
          onCheckedChange={setIsExpertMode}
        />
      </div>
      <p className="whitespace-break-spaces">
        Advanced control over swap parameters such as price setting and gas
        management.
      </p>
    </div>
  );
};

const Multihop = () => {
  const {
    isMultihop,
    actions: { setIsMultihop },
  } = useUserState();

  return (
    <div className="flex flex-col gap-2 max-w-[332px]">
      <div className="flex justify-between items-center gap-2 text-md font-semibold">
        <label htmlFor="multihop">Multihop</label>
        <Switch
          id="multihop"
          checked={isMultihop}
          onCheckedChange={setIsMultihop}
        />
      </div>
      <p className="whitespace-break-spaces">
        Optimized trades across multiple liquidity pools.
      </p>
    </div>
  );
};

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
}

const TokenCardV3Independent = ({
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
  label,
  showInput = true,
  showSettings = true,
  disableSelection,
  staticTokenList,
}: TokenSwapCardProps) => {
  const { address: account } = useAccount();
  useWatchBlockNumber({
    onBlockNumber: () => {
      refetch();
    },
  });
  const [storedValue, setStoredValue] = useState(value);

  // console.log('disableSelection', disableSelection);

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

  const balanceString = useMemo(() => {
    if (isLoading || !balance) return 'Loading...';
    return formatBalance(balance.formatted);
  }, [balance, isLoading]);

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
    <div className="flex-1 w-full flex flex-col gap-y-3">
      <div className="text-black flex items-center justify-between px-2">
        <span>{label}</span>
        <div className="flex items-center gap-x-2">
          {currency && account && showBalance && (
            <div className="flex items-center gap-x-2">
              <div>
                <span>Balance: </span>
                <span>{balanceString}</span>
              </div>
              {showMaxButton && (
                <button
                  className="cursor-pointer text-[#63b4ff]"
                  onClick={handleMaxValue}
                >
                  Max
                </button>
              )}
            </div>
          )}
          {showInput && showSettings && <Settings />}
        </div>
      </div>

      <div className="w-full  rounded-2xl border bg-card-dark shadow-[0px_332px_93px_0px_rgba(0,0,0,0.00),0px_212px_85px_0px_rgba(0,0,0,0.01),0px_119px_72px_0px_rgba(0,0,0,0.05),0px_53px_53px_0px_rgba(0,0,0,0.09),0px_13px_29px_0px_rgba(0,0,0,0.10)] flex items-center justify-between px-4 py-2.5 gap-x-2">
        <div className="grid grid-cols-[max-content_auto] w-full">
          <div className="flex-grow">
            <TokenSelector
              staticTokenList={staticTokenList}
              value={
                currency?.wrapped.address
                  ? Token.getToken({
                      address: currency?.wrapped.address,
                      isNative: currency.isNative,
                    })
                  : undefined
              }
              disableSelection={disableSelection}
              onSelect={async (token) => {
                await token.init();
                handleTokenSelect(
                  token.isNative
                    ? Native.onChain(
                        wallet.currentChainId,
                        wallet.currentChain.nativeToken.symbol,
                        wallet.currentChain.nativeToken.name
                      )
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

      {showInput && label?.toLowerCase() !== 'to' && (
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
};

export { Settings };
export default TokenCardV3Independent;
