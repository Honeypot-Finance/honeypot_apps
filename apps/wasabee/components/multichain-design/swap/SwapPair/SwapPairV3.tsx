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
import Image from 'next/image';
import TokenCardMultichain from '../TokenCard/TokenCardMultichain';

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
        if (inputCurrency.isNative) {
          // For native tokens, remove from localStorage (will use ADDRESS_ZERO)
          localStorage.removeItem('swapInputToken');
        } else if (inputCurrency.isToken && inputCurrency.address) {
          // For regular tokens, save the address
          localStorage.setItem('swapInputToken', inputCurrency.address);
        } else {
          localStorage.removeItem('swapInputToken');
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
        if (outputCurrency.isNative) {
          // For native tokens, remove from localStorage (will use ADDRESS_ZERO)
          localStorage.removeItem('swapOutputToken');
        } else if (outputCurrency.isToken && outputCurrency.address) {
          // For regular tokens, save the address
          localStorage.setItem('swapOutputToken', outputCurrency.address);
        } else {
          localStorage.removeItem('swapOutputToken');
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
          } else {
            // Check if this is the wrapped native token
            const isWrappedNative =
              token.address?.toLowerCase() ===
              wallet.currentChain?.wrappedNativeToken?.address?.toLowerCase();
            const tokenSymbol =
              isWrappedNative && wallet.currentChain?.wrappedNativeToken?.symbol
                ? wallet.currentChain.wrappedNativeToken.symbol
                : token.symbol;
            const tokenName =
              isWrappedNative && wallet.currentChain?.wrappedNativeToken?.name
                ? wallet.currentChain.wrappedNativeToken.name
                : token.name;

            handleInputSelect(
              new AlgebraToken(
                Number(wallet.currentChainId),
                token.address,
                Number(token.decimals),
                tokenSymbol,
                tokenName
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
            // Check if this is the wrapped native token
            const isWrappedNative =
              token.address?.toLowerCase() ===
              wallet.currentChain?.wrappedNativeToken?.address?.toLowerCase();
            const tokenSymbol =
              isWrappedNative && wallet.currentChain?.wrappedNativeToken?.symbol
                ? wallet.currentChain.wrappedNativeToken.symbol
                : token.symbol;
            const tokenName =
              isWrappedNative && wallet.currentChain?.wrappedNativeToken?.name
                ? wallet.currentChain.wrappedNativeToken.name
                : token.name;

            handleOutputSelect(
              new AlgebraToken(
                Number(wallet.currentChainId),
                token.address,
                Number(token.decimals),
                tokenSymbol,
                tokenName
              )
            );
          }
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
      (baseCurrency?.wrapped || baseCurrency)?.address ==
        (quoteCurrency?.wrapped || quoteCurrency)?.address
    ) {
      const wrappedToken = baseCurrency.wrapped || baseCurrency;
      chart.setChartLabel(`${wrappedToken.symbol}`);
      Token.getToken({
        address: wrappedToken.address,
        chainId: wallet.currentChainId.toString(),
      })
        .init()
        .then((token) => {
          chart.setChartTarget(token);
          chart.setCurrencyCode('USD');
        });
    } else if (baseCurrency && quoteCurrency) {
      // Get the actual tokens for pool computation
      let tokenA, tokenB;

      if (baseCurrency.isNative) {
        if (!baseCurrency.wrapped) {
          return;
        }
        tokenA = baseCurrency.wrapped;
      } else if (baseCurrency.isToken) {
        tokenA = baseCurrency;
      } else {
        return;
      }

      if (quoteCurrency.isNative) {
        if (!quoteCurrency.wrapped) {
          return;
        }
        tokenB = quoteCurrency.wrapped;
      } else if (quoteCurrency.isToken) {
        tokenB = quoteCurrency;
      } else {
        return;
      }

      // Skip if tokens don't have addresses
      if (!tokenA?.address || !tokenB?.address) {
        return;
      }

      const pairContract = new AlgebraPoolContract({
        address: computePoolAddress({
          tokenA: tokenA,
          tokenB: tokenB,
          initCodeHashManualOverride:
            wallet.currentChain.contracts.algebraPoolInitCodeHash,
          poolDeployer: wallet.currentChain.contracts.algebraPoolDeployer,
        }),
      });

      pairContract.init().then((pair) => {
        chart.setChartLabel(`${baseCurrency.symbol}/${quoteCurrency.symbol}`);
        chart.setCurrencyCode('TOKEN');
        chart.setTokenNumber(
          tokenA.address.toLowerCase() ===
            pair?.token0.value?.address.toLowerCase()
            ? 0
            : 1
        );
        chart.setChartTarget(pairContract);
      });
    } else if (baseCurrency) {
      chart.setChartLabel(`${baseCurrency.symbol}`);
      const tokenAddress =
        baseCurrency.wrapped?.address ||
        (baseCurrency.isToken ? baseCurrency.address : null);
      if (!tokenAddress) return;

      Token.getToken({
        address: tokenAddress,
        chainId: wallet.currentChainId.toString(),
      })
        .init()
        .then((token) => {
          chart.setCurrencyCode('USD');
          chart.setChartTarget(token);
        });
    } else if (quoteCurrency) {
      chart.setChartLabel(`${quoteCurrency.symbol}`);
      const tokenAddress =
        quoteCurrency.wrapped?.address ||
        (quoteCurrency.isToken ? quoteCurrency.address : null);
      if (!tokenAddress) return;

      Token.getToken({
        address: tokenAddress,
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
    <div className="flex flex-col gap-1 relative rounded-xl w-full">
      <TokenCardMultichain
        staticTokenList={staticFromTokenList}
        value={formattedAmounts[SwapField.INPUT] || ''}
        currency={baseCurrency}
        otherCurrency={quoteCurrency}
        handleTokenSelection={handleInputSelect}
        handleValueChange={handleTypeInput}
        handleMaxValue={handleMaxInput}
        fiatValue={fiatValueInputFormatted}
        showMaxButton={true}
        showBalance={true}
        label="From"
        disableSelection={disableSelection || disableFromSelection}
      />

      <div className="h-1 flex w-full items-center justify-center z-10">
        <div className=" cursor-pointer " onClick={onSwitchTokens}>
          <Image
            src={'/images/icons/swap_arrow.png'}
            alt="switch tokens"
            width={50}
            height={50}
          />
        </div>
      </div>
      <TokenCardMultichain
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
