import Loader from '@/components/algebra/common/Loader';
import { useApproveCallbackFromTrade } from '@/lib/algebra/hooks/common/useApprove';
import { useSwapCallback } from '@/lib/algebra/hooks/swap/useSwapCallback';
import useWrapCallback, {
  WrapType,
} from '@/lib/algebra/hooks/swap/useWrapCallback';
import {
  useSwapState,
  useDerivedSwapInfo,
  useSwapActionHandlers,
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
import { TradeState } from '@/types/algebra/types/trade-state';
import { useCallback, useEffect, useMemo } from 'react';

const SwapButtonV3 = ({ onSwapSuccess }: { onSwapSuccess?: () => void }) => {
  const { isExpertMode } = useUserState();
  const { independentField, typedValue } = useSwapState();
  const {
    tradeState,
    toggledTrade: trade,
    allowedSlippage,
    parsedAmount,
    currencies,
    inputError: swapInputError,
  } = useDerivedSwapInfo();

  const { onSwitchTokens, onCurrencySelection, onUserInput } =
    useSwapActionHandlers();

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
    callback: swapCallback,
    error: swapCallbackError,
    isLoading: isSwapLoading,
    isSuccess: isSwapSuccess,
  } = useSwapCallback(trade, allowedSlippage, approvalState);

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

  // Render the button with consistent styling
  const renderButton = (text: string, onClick?: () => void, disabled = false, loading = false) => (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
        disabled || loading
          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
          : 'bg-gradient-to-r from-[#F59E0B] to-[#EF6B08] hover:from-[#DC8A09] hover:to-[#D65A08] text-black cursor-pointer'
      }`}
    >
      {loading ? <Loader /> : text}
    </button>
  );

  // Handle different button states
  if (!currencies[SwapField.INPUT] || !currencies[SwapField.OUTPUT]) {
    return renderButton('Select a token', undefined, true);
  }

  if (!parsedAmounts[SwapField.INPUT] || parsedAmounts[SwapField.INPUT]?.equalTo('0')) {
    return renderButton('Enter an amount', undefined, true);
  }

  if (showWrap && wrapInputError) {
    return renderButton(wrapInputError, undefined, true);
  }

  if (showWrap) {
    return renderButton(
      wrapType === WrapType.WRAP ? 'Wrap' : 'Unwrap',
      () => onWrap && onWrap(),
      false,
      isWrapLoading
    );
  }

  if (routeNotFound && userHasSpecifiedInputOutput) {
    return renderButton(
      isLoadingRoute ? 'Finding best route...' : 'Insufficient liquidity',
      undefined,
      true,
      isLoadingRoute
    );
  }

  if (showApproveFlow) {
    return renderButton(
      approvalState === ApprovalState.PENDING
        ? 'Approving...'
        : approvalState === ApprovalState.APPROVED
        ? 'Approved'
        : `Approve ${currencies[SwapField.INPUT]?.symbol}`,
      () => approvalCallback && approvalCallback(),
      approvalState !== ApprovalState.NOT_APPROVED,
      approvalState === ApprovalState.PENDING
    );
  }

  return renderButton(
    swapInputError
      ? swapInputError
      : priceImpactTooHigh
      ? 'Price Impact Too High'
      : priceImpactSeverity > 2
      ? 'Swap Anyway'
      : 'Swap',
    handleSwap,
    !isValid || priceImpactTooHigh || !!swapCallbackError,
    isSwapLoading
  );
};

export default SwapButtonV3;