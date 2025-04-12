import { Token } from '@/services/contract/token';
import { SwapFieldType } from '@/types/algebra/types/swap-field';
import { SwapField } from '@/types/algebra/types/swap-field';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ADDRESS_ZERO, Currency, Native } from '@cryptoalgebra/sdk';
import {
  SwapCallEstimate,
  useSwapCallback,
} from '@/lib/algebra/hooks/swap/useSwapCallback';
import { SuccessfulCall } from '@/lib/algebra/hooks/swap/useSwapCallback';
import XSwapPair from './xswap/xSwapPair';
import { XChildSwap, xSwap } from '@/services/xswap';
import { Address, zeroAddress } from 'viem';
import { useDerivedSwapInfoWithoutSwapState } from '@/lib/algebra/state/swapStore';
import { useApproveCallbackFromTrade } from '@/lib/algebra/hooks/common/useApprove';
import { Token as AlgebraToken } from '@cryptoalgebra/sdk';
import { wallet } from '@/services/wallet';

interface V3SwapCardProps {
  fromToken: Token;
  toToken: Token;
  disableSelection?: boolean;
  disableFromSelection?: boolean;
  disableToSelection?: boolean;
  bordered?: boolean;
  borderHeight?: string;
  onSwapSuccess?: () => void;
  isUpdatingPriceChart?: boolean;
  staticFromTokenList?: Token[];
  staticToTokenList?: Token[];
  isInputNative?: boolean;
  isOutputNative?: boolean;
}

export function XSwapCard({
  disableSelection,
  bordered = true,
  isUpdatingPriceChart = false,
  staticFromTokenList,
  staticToTokenList,
  isInputNative,
  isOutputNative,
  disableFromSelection,
  disableToSelection,
  fromToken,
  toToken,
}: V3SwapCardProps) {
  const [independentField, setIndependentField] = useState<SwapFieldType>(
    SwapField.INPUT
  );
  const [inputCurrency, setInputCurrency] = useState<Currency | undefined>(
    fromToken.isNative
      ? Native.onChain(
          wallet.currentChainId,
          wallet.currentChain.nativeToken.symbol,
          wallet.currentChain.nativeToken.name
        )
      : new AlgebraToken(
          wallet.currentChainId,
          fromToken.address as Address,
          fromToken.decimals,
          fromToken.symbol,
          fromToken.name
        )
  );
  const [outputCurrency, setOutputCurrency] = useState<Currency | undefined>(
    toToken.isNative
      ? Native.onChain(
          wallet.currentChainId,
          wallet.currentChain.nativeToken.symbol,
          wallet.currentChain.nativeToken.name
        )
      : new AlgebraToken(
          wallet.currentChainId,
          toToken.address as Address,
          toToken.decimals,
          toToken.symbol,
          toToken.name
        )
  );
  const [typedValue, setTypedValue] = useState<string>('');

  const [isSelected, setIsSelected] = useState(false);

  const {
    toggledTrade: trade,
    currencyBalances,
    parsedAmount,
    currencies,
    allowedSlippage,
  } = useDerivedSwapInfoWithoutSwapState({
    inputCurrencyId: fromToken.address as Address,
    outputCurrencyId: toToken.address as Address,
    independentField: independentField,
    typedValue: typedValue,
  });

  const { approvalState, approvalCallback } = useApproveCallbackFromTrade(
    trade,
    allowedSlippage
  );

  const {
    bestCall,
    swapConfig,
    callback: swapCallback,
    error: swapCallbackError,
    isLoading: isSwapLoading,
    isSuccess: isSwapSuccess,
  } = useSwapCallback(trade, allowedSlippage, approvalState);

  const onUserInput = useCallback(
    (field: SwapFieldType, value: string) => {
      setTypedValue(value);
      if (field === SwapField.INPUT) {
        setIndependentField(SwapField.INPUT);
      } else {
        setIndependentField(SwapField.OUTPUT);
      }
    },
    [setIndependentField]
  );

  useEffect(() => {
    const swap: XChildSwap = {
      fromToken: fromToken,
      toToken: toToken,
      typedValue: typedValue,
      setTypedValue: setTypedValue,
      onUserInput: onUserInput,
      isSelected: isSelected,
      setIsSelected: setIsSelected,
      trade: trade,
      bestCall: bestCall,
      approvalState: approvalState,
    };

    console.log({
      approvalState: approvalState,
      swap: swap,
    });

    if (xSwap.swaps.find((s) => s.fromToken.address === fromToken.address)) {
      xSwap.swaps = xSwap.swaps.filter(
        (s) => s.fromToken.address !== fromToken.address
      );
    }

    xSwap.swaps.push(swap);
  }, [
    isSelected,
    typedValue,
    toToken,
    fromToken,
    isInputNative,
    onUserInput,
    setIsSelected,
    setTypedValue,
    bestCall,
    approvalState,
  ]);

  return (
    <div className="w-full">
      <XSwapPair
        isSelected={isSelected}
        setIsSelected={setIsSelected}
        fromTokenAddress={
          inputCurrency?.isNative
            ? zeroAddress
            : inputCurrency?.wrapped?.address
        }
        toTokenAddress={
          outputCurrency?.isNative
            ? zeroAddress
            : outputCurrency?.wrapped?.address
        }
        disableSelection={disableSelection}
        isUpdatingPriceChart={isUpdatingPriceChart}
        staticFromTokenList={staticFromTokenList}
        staticToTokenList={staticToTokenList}
        isInputNative={isInputNative}
        isOutputNative={isOutputNative}
        disableFromSelection={disableFromSelection}
        disableToSelection={disableToSelection}
        independentField={independentField}
        setIndependentField={setIndependentField}
        typedValue={typedValue}
        setTypedValue={setTypedValue}
        inputCurrency={inputCurrency}
        outputCurrency={outputCurrency}
        setInputCurrency={setInputCurrency}
        setOutputCurrency={setOutputCurrency}
        onUserInput={onUserInput}
      />
    </div>
  );
}

export default XSwapCard;
