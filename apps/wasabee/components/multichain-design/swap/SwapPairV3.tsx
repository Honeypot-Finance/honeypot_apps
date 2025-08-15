import { useCallback, useMemo, useEffect, useState } from 'react';
import { ChevronDown, Settings } from 'lucide-react';
import Image from 'next/image';
import {
  Currency,
  CurrencyAmount,
  ExtendedNative,
  maxAmountSpend,
  tryParseAmount,
} from '@cryptoalgebra/sdk';
import { Token as AlgebraToken } from '@cryptoalgebra/sdk';
import useWrapCallback, {
  WrapType,
} from '@/lib/algebra/hooks/swap/useWrapCallback';
import {
  useDerivedSwapInfo,
  useSwapState,
  useSwapActionHandlers,
} from '@/lib/algebra/state/swapStore';
import { SwapField, SwapFieldType } from '@/types/algebra/types/swap-field';
import { wallet } from '@honeypot/shared/lib/wallet';
import { Token, TokenSelector } from '@honeypot/shared';
import { formatBalance } from '@/lib/algebra/utils/common/formatBalance';
import { useUSDCValue } from '@/lib/algebra/hooks/common/useUSDCValue';
import { useAccount, useBalance, useWatchBlockNumber } from 'wagmi';
import { Address } from 'viem';
import { chart } from '@honeypot/shared/services';
import { computePoolAddress } from '@cryptoalgebra/sdk';
import { AlgebraPoolContract } from '@/services/contract/algebra/algebra-pool-contract';

interface SwapPairV3Props {
  fromTokenAddress?: string;
  toTokenAddress?: string;
  disableSelection?: boolean;
  isUpdatingPriceChart?: boolean;
  staticFromTokenList?: Token[];
  staticToTokenList?: Token[];
  isInputNative?: boolean;
  isOutputNative?: boolean;
  disableFromSelection?: boolean;
  disableToSelection?: boolean;
}

const SwapPairV3 = ({
  fromTokenAddress,
  toTokenAddress,
  disableSelection,
  isUpdatingPriceChart,
  staticFromTokenList,
  staticToTokenList,
  isInputNative,
  isOutputNative,
  disableFromSelection,
  disableToSelection,
}: SwapPairV3Props) => {
  const { address: account } = useAccount();
  const [sliderValue, setSliderValue] = useState(0);
  
  const {
    toggledTrade: trade,
    currencyBalances,
    parsedAmount,
    currencies,
  } = useDerivedSwapInfo();

  const baseCurrency = currencies[SwapField.INPUT];
  const quoteCurrency = currencies[SwapField.OUTPUT];

  const { independentField, typedValue } = useSwapState();
  const dependentField: SwapFieldType =
    independentField === SwapField.INPUT ? SwapField.OUTPUT : SwapField.INPUT;

  const { onSwitchTokens, onCurrencySelection, onUserInput } =
    useSwapActionHandlers();

  // Fetch balances
  const { data: fromBalance, refetch: refetchFromBalance } = useBalance({
    address: account,
    token: baseCurrency?.isNative
      ? undefined
      : (baseCurrency?.wrapped.address as Address),
  });

  const { data: toBalance, refetch: refetchToBalance } = useBalance({
    address: account,
    token: quoteCurrency?.isNative
      ? undefined
      : (quoteCurrency?.wrapped.address as Address),
  });

  useWatchBlockNumber({
    onBlockNumber: () => {
      refetchFromBalance();
      refetchToBalance();
    },
  });

  const handleInputSelect = useCallback(
    (inputCurrency: Currency) => {
      onCurrencySelection(SwapField.INPUT, inputCurrency);
      // Save to localStorage
      if (typeof window !== 'undefined' && inputCurrency) {
        if (inputCurrency.isNative) {
          localStorage.removeItem('swapInputToken');
        } else if (inputCurrency.isToken && inputCurrency.address) {
          localStorage.setItem('swapInputToken', inputCurrency.address);
        }
      }
    },
    [onCurrencySelection]
  );

  const handleOutputSelect = useCallback(
    (outputCurrency: Currency) => {
      onCurrencySelection(SwapField.OUTPUT, outputCurrency);
      // Save to localStorage
      if (typeof window !== 'undefined' && outputCurrency) {
        if (outputCurrency.isNative) {
          localStorage.removeItem('swapOutputToken');
        } else if (outputCurrency.isToken && outputCurrency.address) {
          localStorage.setItem('swapOutputToken', outputCurrency.address);
        }
      }
    },
    [onCurrencySelection]
  );

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(SwapField.INPUT, value);
    },
    [onUserInput]
  );

  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(SwapField.OUTPUT, value);
    },
    [onUserInput]
  );

  const { wrapType } = useWrapCallback(
    currencies[SwapField.INPUT],
    currencies[SwapField.OUTPUT],
    typedValue
  );

  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE;

  const parsedAmountA =
    independentField === SwapField.INPUT ? parsedAmount : trade?.inputAmount;

  const parsedAmountB =
    independentField === SwapField.OUTPUT ? parsedAmount : trade?.outputAmount;

  const parsedAmounts = useMemo(
    () =>
      showWrap
        ? {
            [SwapField.INPUT]: parsedAmount,
            [SwapField.OUTPUT]: parsedAmount,
          }
        : {
            [SwapField.INPUT]: parsedAmountA,
            [SwapField.OUTPUT]: parsedAmountB,
          },
    [parsedAmount, showWrap, parsedAmountA, parsedAmountB]
  );

  const maxInputAmount: CurrencyAmount<Currency> | undefined = maxAmountSpend(
    currencyBalances[SwapField.INPUT]
  );

  const handleMaxInput = useCallback(() => {
    maxInputAmount && onUserInput(SwapField.INPUT, maxInputAmount.toExact());
  }, [maxInputAmount, onUserInput]);

  const handlePercentageClick = (percentage: number) => {
    if (maxInputAmount) {
      const amount = maxInputAmount.multiply(percentage).divide(100);
      onUserInput(SwapField.INPUT, amount.toExact());
      setSliderValue(percentage);
    }
  };

  const fiatValueInputFormatted = useUSDCValue(
    tryParseAmount(
      parsedAmounts[SwapField.INPUT]?.toSignificant(
        Math.floor((parsedAmounts[SwapField.INPUT]?.currency.decimals || 6) / 2)
      ),
      baseCurrency
    )
  );

  const fiatValueOutputFormatted = useUSDCValue(
    tryParseAmount(
      parsedAmounts[SwapField.OUTPUT]?.toSignificant(
        Math.floor((parsedAmounts[SwapField.OUTPUT]?.currency.decimals || 6) / 2)
      ),
      quoteCurrency
    )
  );

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField as keyof typeof parsedAmounts]?.toExact() ?? ''
      : parsedAmounts[dependentField as keyof typeof parsedAmounts]?.toFixed(
          Math.floor(
            (parsedAmounts[dependentField as keyof typeof parsedAmounts]?.currency.decimals || 6) / 2
          )
        ) ?? '',
  };

  // Initialize tokens on mount
  useEffect(() => {
    const initializeTokens = async () => {
      if (fromTokenAddress) {
        const token = Token.getToken({
          address: fromTokenAddress,
          isNative: isInputNative,
          chainId: wallet.currentChainId.toString(),
        });

        if (token) {
          if (isInputNative) {
            handleInputSelect(
              ExtendedNative.onChain(
                Number(wallet.currentChainId),
                wallet.currentChain.nativeToken.symbol,
                wallet.currentChain.nativeToken.name
              )
            );
          } else {
            handleInputSelect(
              new AlgebraToken(
                Number(wallet.currentChainId),
                token.address,
                Number(token.decimals),
                token.symbol,
                token.name
              )
            );
          }
        }
      }

      if (toTokenAddress) {
        const token = Token.getToken({
          address: toTokenAddress,
          isNative: isOutputNative,
          chainId: wallet.currentChainId.toString(),
        });
        if (token) {
          if (isOutputNative) {
            handleOutputSelect(
              ExtendedNative.onChain(
                Number(wallet.currentChainId),
                wallet.currentChain.nativeToken.symbol,
                wallet.currentChain.nativeToken.name
              )
            );
          } else {
            handleOutputSelect(
              new AlgebraToken(
                Number(wallet.currentChainId),
                token.address,
                Number(token.decimals),
                token.symbol,
                token.name
              )
            );
          }
        }
      }
    };

    initializeTokens();
  }, [fromTokenAddress, toTokenAddress]);

  // Update chart when currencies change
  useEffect(() => {
    if (!isUpdatingPriceChart) return;
    
    // Chart update logic here (simplified for brevity)
    if (baseCurrency && quoteCurrency) {
      chart.setChartLabel(`${baseCurrency.symbol}/${quoteCurrency.symbol}`);
    }
  }, [baseCurrency, quoteCurrency, isUpdatingPriceChart]);

  return (
    <div className="flex flex-col gap-2">
      {/* From Section */}
      <div className="bg-[#271A0C] rounded-2xl p-4 border border-[#333333]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-400">From</span>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Balance:</span>
            <span className="text-white">
              {fromBalance ? formatBalance(fromBalance.formatted) : '0'}
            </span>
            <button className="text-gray-400 hover:text-gray-300">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <input
            type="text"
            value={formattedAmounts[SwapField.INPUT]}
            onChange={(e) => handleTypeInput(e.target.value)}
            placeholder="0.980"
            className="bg-transparent text-3xl font-medium text-white outline-none w-[45%]"
          />
          
          <button
            className="flex items-center gap-2 bg-[#3A2F24] hover:bg-[#4A3F34] px-3 py-2 rounded-full transition-colors"
            onClick={() => {/* Token selector logic */}}
            disabled={disableSelection || disableFromSelection}
          >
            {baseCurrency && (
              <>
                <div className="w-6 h-6 bg-purple-500 rounded-full" />
                <span className="text-white font-medium">{baseCurrency.symbol || 'BERA'}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </>
            )}
            {!baseCurrency && (
              <>
                <span className="text-white">Select token</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </>
            )}
          </button>
        </div>

        <div className="text-sm text-gray-400">
          ${fiatValueInputFormatted || '3,000.48'}
        </div>

        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs text-gray-400">0.001ETH</span>
          <button
            onClick={handleMaxInput}
            className="text-xs text-gray-400 hover:text-white ml-auto"
          >
            Max
          </button>
        </div>

        {/* Percentage Slider */}
        <div className="mt-4">
          <input
            type="range"
            min="0"
            max="100"
            value={sliderValue}
            onChange={(e) => {
              const value = Number(e.target.value);
              setSliderValue(value);
              handlePercentageClick(value);
            }}
            className="w-full h-2 bg-[#3A2F24] rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between mt-2">
            {[25, 50, 75, 100].map((percent) => (
              <button
                key={percent}
                onClick={() => handlePercentageClick(percent)}
                className="px-3 py-1 text-xs bg-[#3A2F24] hover:bg-[#4A3F34] rounded-full text-gray-300 hover:text-white transition-colors"
              >
                {percent}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Swap Button */}
      <div className="flex justify-center -my-2 relative z-10">
        <button
          className="bg-[#F59E0B] hover:bg-[#DC8A09] p-3 rounded-full transition-colors"
          onClick={onSwitchTokens}
        >
          <Image
            src="/images/icons/swap_arrow.png"
            alt="swap"
            width={24}
            height={24}
            className="rotate-90"
          />
        </button>
      </div>

      {/* To Section */}
      <div className="bg-[#271A0C] rounded-2xl p-4 border border-[#333333]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-400">To</span>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Balance:</span>
            <span className="text-white">
              {toBalance ? formatBalance(toBalance.formatted) : '0.026'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <input
            type="text"
            value={formattedAmounts[SwapField.OUTPUT]}
            onChange={(e) => handleTypeOutput(e.target.value)}
            placeholder="0.980"
            className="bg-transparent text-3xl font-medium text-white outline-none w-[45%]"
            readOnly={independentField === SwapField.INPUT}
          />
          
          <button
            className="flex items-center gap-2 bg-[#3A2F24] hover:bg-[#4A3F34] px-3 py-2 rounded-full transition-colors"
            onClick={() => {/* Token selector logic */}}
            disabled={disableSelection || disableToSelection}
          >
            {quoteCurrency && (
              <>
                <div className="w-6 h-6 bg-yellow-500 rounded-full" />
                <span className="text-white font-medium">{quoteCurrency.symbol || 'HONEY'}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </>
            )}
            {!quoteCurrency && (
              <>
                <span className="text-white">Select token</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </>
            )}
          </button>
        </div>

        <div className="text-sm text-gray-400">
          ${fiatValueOutputFormatted || '3,000.48'}
        </div>

        <div className="text-xs text-gray-400 mt-3">
          0.001ETH
        </div>
      </div>
    </div>
  );
};

export default SwapPairV3;