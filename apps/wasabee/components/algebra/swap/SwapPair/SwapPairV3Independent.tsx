import { useUSDCValue } from '@/lib/algebra/hooks/common/useUSDCValue';
import {
  computePoolAddress,
  Currency,
  CurrencyAmount,
  maxAmountSpend,
  tryParseAmount,
} from '@cryptoalgebra/sdk';
import { useCallback, useMemo, useEffect } from 'react';
import TokenCard from '../TokenCard';
import { ArrowLeftRight, ChevronsUpDownIcon } from 'lucide-react';
import useWrapCallback, {
  WrapType,
} from '@/lib/algebra/hooks/swap/useWrapCallback';
import {
  useDerivedSwapInfo,
  useSwapState,
  useSwapActionHandlers,
  useDerivedSwapInfoWithoutSwapState,
} from '@/lib/algebra/state/swapStore';
import { SwapField, SwapFieldType } from '@/types/algebra/types/swap-field';
import TokenCardV3 from '../TokenCard/TokenCardV3';
import { ExchangeSvg } from '@/components/svg/exchange';
import { chart } from '@/services/chart';
import { Token } from '@/services/contract/token';
import { PairContract } from '@/services/contract/dex/liquidity/pair-contract';
import { Token as AlgebraToken } from '@cryptoalgebra/sdk';
import { wallet } from '@/services/wallet';
import { AlgebraPoolContract } from '@/services/contract/algebra/algebra-pool-contract';
import { Address } from 'viem';
import TokenCardV3Independent from '../TokenCard/TokenCardVIndependent';

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
  inputCurrency?: Currency;
  outputCurrency?: Currency;
  independentField: SwapFieldType;
  setInputCurrency: (currency: Currency | undefined) => void;
  setOutputCurrency: (currency: Currency | undefined) => void;
  setIndependentField: (field: SwapFieldType) => void;
  typedValue: string;
  setTypedValue: (value: string) => void;
  onUserInput: (field: SwapFieldType, value: string) => void;
}

const SwapPairV3Independent = ({
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
  inputCurrency,
  outputCurrency,
  independentField,
  typedValue,
  setInputCurrency,
  setOutputCurrency,
  setIndependentField,
  setTypedValue,
  onUserInput,
}: SwapPairV3Props) => {
  const {
    toggledTrade: trade,
    currencyBalances,
    parsedAmount,
    currencies,
  } = useDerivedSwapInfoWithoutSwapState({
    inputCurrencyId: fromTokenAddress as Address,
    outputCurrencyId: toTokenAddress as Address,
    independentField: independentField,
    typedValue: typedValue,
  });

  const baseCurrency = currencies[SwapField.INPUT];
  const quoteCurrency = currencies[SwapField.OUTPUT];

  const dependentField: SwapFieldType =
    independentField === SwapField.INPUT ? SwapField.OUTPUT : SwapField.INPUT;

  const handleInputSelect = useCallback(
    (inputCurrency: Currency) => {
      setInputCurrency(inputCurrency);
    },
    [setInputCurrency]
  );

  const handleOutputSelect = useCallback(
    (outputCurrency: Currency) => {
      setOutputCurrency(outputCurrency);
    },
    [setOutputCurrency]
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

  const onSwitchTokens = useCallback(() => {
    const tempInputCurrency = inputCurrency;
    const tempOutputCurrency = outputCurrency;
    setInputCurrency(tempOutputCurrency);
    setOutputCurrency(tempInputCurrency);
    setIndependentField(
      independentField === SwapField.INPUT ? SwapField.OUTPUT : SwapField.INPUT
    );
    setTypedValue('');
  }, [
    independentField,
    setIndependentField,
    setTypedValue,
    inputCurrency,
    outputCurrency,
  ]);

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
  const showMaxButton = Boolean(
    maxInputAmount?.greaterThan(0) &&
      !parsedAmounts[SwapField.INPUT]?.equalTo(maxInputAmount)
  );

  const handleMaxInput = useCallback(() => {
    console.log('maxInputAmount', maxInputAmount);
    maxInputAmount && onUserInput(SwapField.INPUT, maxInputAmount.toExact());
  }, [maxInputAmount, onUserInput]);

  console.log('parsedAmounts', parsedAmounts);
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
        Math.floor(
          (parsedAmounts[SwapField.OUTPUT]?.currency.decimals || 6) / 2
        )
      ),
      quoteCurrency
    )
  );

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[
          independentField as keyof typeof parsedAmounts
        ]?.toExact() ?? ''
      : parsedAmounts[dependentField as keyof typeof parsedAmounts]?.toFixed(
          Math.floor(
            (parsedAmounts[dependentField as keyof typeof parsedAmounts]
              ?.currency.decimals || 6) / 2
          )
        ) ?? '',
  };

  useEffect(() => {
    const initializeTokens = async () => {
      if (fromTokenAddress) {
        const token = Token.getToken({
          address: fromTokenAddress,
          isNative: isInputNative,
        });
        // await token.init(false, {
        //   loadIndexerTokenData: true,
        //   loadLogoURI: true,
        // });

        if (!token) {
          return;
        }

        handleInputSelect(
          Object.assign(
            new AlgebraToken(
              wallet.currentChainId,
              token.address,
              Number(token.decimals),
              token.symbol,
              token.name
            ),
            {
              isNative: isInputNative,
              isToken: !isInputNative,
            }
          )
        );
      }

      if (toTokenAddress) {
        const token = Token.getToken({
          address: toTokenAddress,
          isNative: isOutputNative,
        });
        // await token.init(false, {
        //   loadIndexerTokenData: true,
        //   loadLogoURI: true,
        // });
        if (!token) {
          return;
        }

        handleOutputSelect(
          Object.assign(
            new AlgebraToken(
              wallet.currentChainId,
              token.address,
              Number(token.decimals),
              token.symbol,
              token.name
            ),
            {
              isNative: isOutputNative,
              isToken: !isOutputNative,
            }
          )
        );
      }
    };

    initializeTokens();
  }, [
    fromTokenAddress,
    handleInputSelect,
    handleOutputSelect,
    isInputNative,
    isOutputNative,
    toTokenAddress,
  ]);

  useEffect(() => {
    if (!isUpdatingPriceChart) {
      return;
    }
    if (
      baseCurrency &&
      quoteCurrency &&
      (baseCurrency?.isNative || quoteCurrency?.isNative) &&
      baseCurrency?.wrapped.address == quoteCurrency?.wrapped.address
    ) {
      chart.setChartLabel(`${baseCurrency.wrapped.symbol}`);
      Token.getToken({ address: baseCurrency.wrapped.address })
        .init()
        .then((token) => {
          chart.setChartTarget(token);
          chart.setCurrencyCode('USD');
        });
    } else if (baseCurrency && quoteCurrency) {
      const pairContract = new AlgebraPoolContract({
        address: computePoolAddress({
          tokenA: baseCurrency.wrapped,
          tokenB: quoteCurrency.wrapped,
        }),
      });
      pairContract.init().then((pair) => {
        chart.setChartLabel(`${baseCurrency.symbol}/${quoteCurrency.symbol}`);
        chart.setCurrencyCode('TOKEN');
        chart.setTokenNumber(
          baseCurrency.wrapped.address.toLowerCase() ===
            pair?.token0.value?.address.toLowerCase()
            ? 0
            : 1
        );
        chart.setChartTarget(pairContract);
      });
    } else if (baseCurrency) {
      chart.setChartLabel(`${baseCurrency.symbol}`);
      Token.getToken({ address: baseCurrency.wrapped.address })
        .init()
        .then((token) => {
          chart.setCurrencyCode('USD');
          chart.setChartTarget(token);
        });
    } else if (quoteCurrency) {
      chart.setChartLabel(`${quoteCurrency.symbol}`);
      Token.getToken({ address: quoteCurrency.wrapped.address })
        .init()
        .then((token) => {
          chart.setCurrencyCode('USD');
          chart.setChartTarget(token);
        });
    }
  }, [baseCurrency, quoteCurrency, isUpdatingPriceChart]);

  return (
    <div className="flex flex-col gap-1 relative bg-white custom-dashed px-[18px] py-6 w-full">
      <TokenCardV3Independent
        staticTokenList={staticFromTokenList}
        value={formattedAmounts[SwapField.INPUT] || ''}
        currency={baseCurrency}
        otherCurrency={quoteCurrency}
        handleTokenSelection={handleInputSelect}
        handleValueChange={handleTypeInput}
        handleMaxValue={handleMaxInput}
        fiatValue={fiatValueInputFormatted}
        showMaxButton={showMaxButton}
        showBalance={true}
        label="From"
        disableSelection={disableSelection || disableFromSelection}
      />

      <div className="flex w-full items-center gap-[5px]">
        <div className=" h-px flex-[1_0_0] bg-[#363636]/30 rounded-[100px]"></div>
        <div
          className=" cursor-pointer hover:rotate-180 transition-all rounded-[10px] bg-[#FFCD4D] border border-black text-black p-2.5 shadow-[1.25px_2.5px_0px_0px_#000]"
          onClick={onSwitchTokens}
        >
          <ArrowLeftRight className="size-5" />
        </div>
        <div className=" h-px flex-[1_0_0] bg-[#363636]/30 rounded-[100px]"></div>
      </div>

      <TokenCardV3Independent
        staticTokenList={staticToTokenList}
        value={formattedAmounts[SwapField.OUTPUT] || ''}
        currency={quoteCurrency}
        otherCurrency={baseCurrency}
        handleTokenSelection={handleOutputSelect}
        handleValueChange={handleTypeOutput}
        fiatValue={fiatValueOutputFormatted ?? undefined}
        showBalance={true}
        label="To"
        disableSelection={disableSelection || disableToSelection}
        showSettings={false}
      />
    </div>
  );
};

export default SwapPairV3Independent;
