import { useUSDCValue } from '@/lib/algebra/hooks/common/useUSDCValue';
import {
  computePoolAddress,
  Currency,
  CurrencyAmount,
  ExtendedNative,
  maxAmountSpend,
  tryParseAmount,
  WNATIVE,
} from '@cryptoalgebra/sdk';
import { useCallback, useMemo, useEffect } from 'react';
import { ArrowLeftRight, ChevronsUpDownIcon } from 'lucide-react';
import useWrapCallback, {
  WrapType,
} from '@/lib/algebra/hooks/swap/useWrapCallback';
import {
  useDerivedSwapInfo,
  useSwapState,
  useSwapActionHandlers,
} from '@/lib/algebra/state/swapStore';
import { SwapField, SwapFieldType } from '@/types/algebra/types/swap-field';
import TokenCardV3 from '../TokenCard/TokenCardV3';
import { ExchangeSvg } from '@/components/svg/exchange';
import { chart } from '@honeypot/shared/services';

import { Token } from '@honeypot/shared';
import { Token as AlgebraToken } from '@cryptoalgebra/sdk';
import { wallet } from '@honeypot/shared/lib/wallet';
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

  const handleInputSelect = useCallback(
    (inputCurrency: Currency) => {
      onCurrencySelection(SwapField.INPUT, inputCurrency);
      // Save input token address to localStorage
      if (typeof window !== 'undefined' && inputCurrency) {

        if(inputCurrency?.wrapped?.address){
        localStorage.setItem('swapInputToken', inputCurrency?.wrapped?.address);
      }
        else
        {
          localStorage.removeItem('swapInputToken')
        }
      }
    },
    [onCurrencySelection]
  );

  const handleOutputSelect = useCallback(
    (outputCurrency: Currency) => {
      onCurrencySelection(SwapField.OUTPUT, outputCurrency);
      // Save output token address to localStorage
      if (typeof window !== 'undefined' && outputCurrency) {

        if(outputCurrency?.wrapped?.address){
          localStorage.setItem('swapOutputToken', outputCurrency?.wrapped?.address)
        }else
        {
          localStorage.removeItem('swapOutputToken')
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
  const showMaxButton = Boolean(
    maxInputAmount?.greaterThan(0) &&
      !parsedAmounts[SwapField.INPUT]?.equalTo(maxInputAmount)
  );

  const handleMaxInput = useCallback(() => {
    maxInputAmount && onUserInput(SwapField.INPUT, maxInputAmount.toExact());
  }, [maxInputAmount, onUserInput]);

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
          }

          handleInputSelect(
            Object.assign(
              new AlgebraToken(
                Number(wallet.currentChainId),
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
          }
          handleOutputSelect(
            Object.assign(
              new AlgebraToken(
                Number(wallet.currentChainId),
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
      }
    };

    initializeTokens();
  }, [fromTokenAddress, toTokenAddress]);

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
      Token.getToken({
        address: baseCurrency.wrapped.address,
        chainId: wallet.currentChainId.toString(),
      })
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
      console.log('baseCurrency', baseCurrency);
      console.log('WNATIVE', WNATIVE);
      Token.getToken({
        address: baseCurrency.wrapped.address,
        chainId: wallet.currentChainId.toString(),
      })
        .init()
        .then((token) => {
          chart.setCurrencyCode('USD');
          chart.setChartTarget(token);
        });
    } else if (quoteCurrency) {
      chart.setChartLabel(`${quoteCurrency.symbol}`);
      Token.getToken({
        address: quoteCurrency.wrapped.address,
        chainId: wallet.currentChainId.toString(),
      })
        .init()
        .then((token) => {
          chart.setCurrencyCode('USD');
          chart.setChartTarget(token);
        });
    }
  }, [baseCurrency, quoteCurrency, isUpdatingPriceChart]);

  return (
    <div className="flex flex-col gap-1 relative bg-white custom-dashed px-[18px] py-6 w-full">
      <TokenCardV3
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

      <TokenCardV3
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

export default SwapPairV3;
