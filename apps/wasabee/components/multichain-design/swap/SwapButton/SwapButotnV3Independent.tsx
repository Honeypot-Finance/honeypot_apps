import Loader from '@/components/algebra/common/Loader';
import { Button } from '@/components/button';
import { useApproveCallbackFromTrade } from '@/lib/algebra/hooks/common/useApprove';
import {
  SwapCallEstimate,
  SuccessfulCall,
  useSwapCallback,
} from '@/lib/algebra/hooks/swap/useSwapCallback';
import useWrapCallback, {
  WrapType,
} from '@/lib/algebra/hooks/swap/useWrapCallback';
import {
  useSwapState,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useDerivedSwapInfoWithoutSwapState,
} from '@/lib/algebra/state/swapStore';
import { useUserState } from '@/lib/algebra/state/userStore';
import {
  computeRealizedLPFeePercent,
  warningSeverity,
} from '@/lib/algebra/utils/swap/prices';
import { useToastify } from '@/lib/hooks/useContractToastify';

import { Token } from '@honeypot/shared';
import { wallet } from '@honeypot/shared/lib/wallet';
import { ApprovalState } from '@/types/algebra/types/approve-state';
import { SwapField } from '@/types/algebra/types/swap-field';
import { SwapFieldType } from '@/types/algebra/types/swap-field';
import { TradeState } from '@/types/algebra/types/trade-state';
import { useCallback, useEffect, useMemo } from 'react';
import { Address } from 'viem';
import { Currency } from '@cryptoalgebra/sdk';
const SwapButtonV3Independent = ({
  onSwapSuccess,
  inputCurrency,
  outputCurrency,
  independentField,
  typedValue,
  onUserInput,
  setBestCall,
}: {
  onSwapSuccess?: () => void;
  inputCurrency?: Currency;
  outputCurrency?: Currency;
  independentField: SwapFieldType;
  typedValue: string;
  onUserInput: (field: SwapFieldType, value: string) => void;
  setBestCall: (
    bestCall: SuccessfulCall | SwapCallEstimate | undefined
  ) => void;
}) => {
  const { isExpertMode } = useUserState();
  const {
    tradeState,
    toggledTrade: trade,
    allowedSlippage,
    parsedAmount,
    currencies,
    inputError: swapInputError,
  } = useDerivedSwapInfoWithoutSwapState({
    inputCurrencyId: inputCurrency?.wrapped?.address as Address,
    outputCurrencyId: outputCurrency?.wrapped?.address as Address,
    independentField: independentField,
    typedValue: typedValue,
  });

  const {
    wrapType,
    execute: onWrap,
    loading: isWrapLoading,
    inputError: wrapInputError,
    isSuccess: isWrapSuccess,
  } = useWrapCallback(
    currencies[SwapField.INPUT],
    currencies[SwapField.OUTPUT],
    typedValue
  );

  const wrapToast = useToastify({
    title: wrapType === WrapType.WRAP ? 'Wrap' : 'Unwrap',
    message: isWrapLoading
      ? ' Pending'
      : isWrapSuccess
      ? ' Success'
      : ' Failed',
    isError: false,
    isLoading: isWrapLoading ?? false,
    isSuccess: isWrapSuccess ?? false,
  });

  const showWrap = wrapType !== WrapType.NOT_APPLICABLE;

  const parsedAmountA =
    independentField === SwapField.INPUT ? parsedAmount : trade?.inputAmount;

  const parsedAmountB =
    independentField === SwapField.OUTPUT ? parsedAmount : trade?.outputAmount;

  const parsedAmounts = useMemo(
    () => ({
      [SwapField.INPUT]: parsedAmountA,
      [SwapField.OUTPUT]: parsedAmountB,
    }),
    [parsedAmountA, parsedAmountB]
  );

  const userHasSpecifiedInputOutput = Boolean(
    currencies[SwapField.INPUT] &&
      currencies[SwapField.OUTPUT] &&
      parsedAmounts[
        independentField as keyof typeof parsedAmounts
      ]?.greaterThan('0')
  );

  const routeNotFound = !trade?.route;
  const isLoadingRoute = TradeState.LOADING === tradeState.state;

  const { approvalState, approvalCallback } = useApproveCallbackFromTrade(
    trade,
    allowedSlippage
  );

  const priceImpactSeverity = useMemo(() => {
    try {
      if (!trade || !trade.priceImpact) return 4;
      const realizedLpFeePercent = computeRealizedLPFeePercent(trade);
      const priceImpact = trade?.priceImpact?.subtract(realizedLpFeePercent);
      return warningSeverity(priceImpact);
    } catch (error) {
      console.error('Error calculating price impact:', error);
      return 4;
    }
  }, [trade]);

  const showApproveFlow =
    !swapInputError &&
    (approvalState === ApprovalState.NOT_APPROVED ||
      approvalState === ApprovalState.PENDING) &&
    !(priceImpactSeverity > 3 && !isExpertMode);

  const {
    bestCall,
    swapConfig,
    callback: swapCallback,
    error: swapCallbackError,
    isLoading: isSwapLoading,
    isSuccess: isSwapSuccess,
  } = useSwapCallback(trade, allowedSlippage, approvalState);

  useEffect(() => {
    if (swapCallback) {
      setBestCall(bestCall);
    }
  }, [bestCall]);

  const isSwapSuccessMemo = useMemo(() => {
    return isSwapSuccess;
  }, [isSwapSuccess]);

  const isWrapSuccessMemo = useMemo(() => {
    return isWrapSuccess;
  }, [isWrapSuccess]);

  useEffect(() => {
    if (isWrapSuccessMemo) {
      Token.getToken({
        address: wallet.currentChain.nativeToken.address,
        chainId: wallet.currentChainId.toString(),
      }).getBalance();
    }
  }, [isWrapSuccessMemo]);

  useEffect(() => {
    if (isSwapSuccessMemo) {
      trade?.inputAmount.currency.wrapped.address &&
        Token.getToken({
          address: trade?.inputAmount.currency.wrapped.address,
          chainId: wallet.currentChainId.toString(),
        }).getBalance();
      trade?.outputAmount.currency.wrapped.address &&
        Token.getToken({
          address: trade?.outputAmount.currency.wrapped.address,
          chainId: wallet.currentChainId.toString(),
        }).getBalance();

      if (onSwapSuccess) {
        onSwapSuccess();
      }
    }
  }, [isSwapSuccessMemo, onSwapSuccess, onUserInput]);

  const swapToast = useToastify({
    title: `Swap ${trade?.inputAmount.toSignificant()} ${
      trade?.inputAmount.currency.symbol
    }`,
    message: 'Swap',
    isError: !!swapCallback && swapCallbackError != null,
    isLoading: isSwapLoading,
    isSuccess: isSwapSuccess,
  });

  const handleSwap = useCallback(async () => {
    if (!swapCallback) return;
    try {
      await swapCallback();
    } catch (error) {
      return new Error(`Swap Failed ${error}`);
    }
  }, [swapCallback]);

  const isValid = !swapInputError;

  const priceImpactTooHigh = priceImpactSeverity > 3 && !isExpertMode;

  if (showWrap && wrapInputError)
    return <Button disabled>{wrapInputError}</Button>;

  if (showWrap)
    return (
      <Button onPress={() => onWrap && onWrap()}>
        {isWrapLoading ? (
          <Loader />
        ) : wrapType === WrapType.WRAP ? (
          'Wrap'
        ) : (
          'Unwrap'
        )}
      </Button>
    );

  if (routeNotFound && userHasSpecifiedInputOutput)
    return (
      <Button disabled>
        {isLoadingRoute ? <Loader /> : 'Insufficient liquidity for this trade.'}
      </Button>
    );

  if (showApproveFlow)
    return (
      <>
        <Button
          isDisabled={approvalState !== ApprovalState.NOT_APPROVED}
          disabled={approvalState !== ApprovalState.NOT_APPROVED}
          onPress={() => approvalCallback && approvalCallback()}
        >
          {approvalState === ApprovalState.PENDING ? (
            <Loader />
          ) : approvalState === ApprovalState.APPROVED ? (
            'Approved'
          ) : (
            `Approve ${currencies[SwapField.INPUT]?.symbol}`
          )}
        </Button>
      </>
    );

  return (
    <>
      <Button
        onPress={() => handleSwap()}
        disabled={
          !isValid || priceImpactTooHigh || !!swapCallbackError || isSwapLoading
        }
        isDisabled={
          !isValid || priceImpactTooHigh || !!swapCallbackError || isSwapLoading
        }
      >
        {isSwapLoading ? (
          <Loader />
        ) : swapInputError ? (
          swapInputError
        ) : priceImpactTooHigh ? (
          'Price Impact Too High'
        ) : priceImpactSeverity > 2 ? (
          'Swap Anyway'
        ) : (
          'Swap'
        )}
      </Button>
    </>
  );
};

export default SwapButtonV3Independent;
