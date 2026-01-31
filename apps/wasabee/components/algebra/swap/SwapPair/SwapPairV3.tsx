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

import { Token } from '@honeypot/shared/lib/contract/token/token';
import { Token as AlgebraToken } from '@cryptoalgebra/sdk';
import { wallet } from '@honeypot/shared/lib/wallet';
import { AlgebraPoolContract } from '@/services/contract/algebra/algebra-pool-contract';
import Image from 'next/image';

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

  return (
    <div className="flex flex-col gap-1 relative rounded-xl px-[18px] py-6 w-full">
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
          className=" cursor-pointer hover:rotate-180 transition-all rounded-[10px] border border-black text-black p-2.5 shadow-[1.25px_2.5px_0px_0px_#000]"
          onClick={onSwitchTokens}
        >
          <Image
            src={'/images/icons/swap_arrow.png'}
            alt="switch tokens"
            width={50}
            height={50}
          />
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
