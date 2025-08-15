import Loader from "@/components/algebra/common/Loader";
import { Button } from "@/components/algebra/ui/button";
import { useApproveCallbackFromTrade } from "@/lib/algebra/hooks/common/useApprove";
import { useSwapCallback } from "@/lib/algebra/hooks/swap/useSwapCallback";
import useWrapCallback, {
  WrapType,
} from "@/lib/algebra/hooks/swap/useWrapCallback";
import {
  useSwapState,
  useDerivedSwapInfo,
} from "@/lib/algebra/state/swapStore";
import { useUserState } from "@/lib/algebra/state/userStore";
import {
  computeRealizedLPFeePercent,
  warningSeverity,
} from "@/lib/algebra/utils/swap/prices";
import { ApprovalState } from "@/types/algebra/types/approve-state";
import { SwapField } from "@/types/algebra/types/swap-field";
import { TradeState } from "@/types/algebra/types/trade-state";
import { useCallback, useMemo } from "react";

const SwapButton = () => {
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

  const {
    wrapType,
    execute: onWrap,
    loading: isWrapLoading,
    inputError: wrapInputError,
  } = useWrapCallback(
    currencies[SwapField.INPUT],
    currencies[SwapField.OUTPUT],
    typedValue
  );

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
    parsedAmounts[independentField as keyof typeof parsedAmounts]?.greaterThan("0")
  );

  const routeNotFound = !trade?.route;
  const isLoadingRoute = TradeState.LOADING === tradeState.state;

  const { approvalState, approvalCallback } = useApproveCallbackFromTrade(
    trade,
    allowedSlippage
  );

  const priceImpactSeverity = useMemo(() => {
    if (!trade) return 4;
    const realizedLpFeePercent = computeRealizedLPFeePercent(trade);
    const priceImpact = trade.priceImpact.subtract(realizedLpFeePercent);
    return warningSeverity(priceImpact);
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
  } = useSwapCallback(trade, allowedSlippage, approvalState);

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
      <Button onClick={() => onWrap && onWrap()}>
        {isWrapLoading ? (
          <Loader />
        ) : wrapType === WrapType.WRAP ? (
          "Wrap"
        ) : (
          "Unwrap"
        )}
      </Button>
    );

  if (routeNotFound && userHasSpecifiedInputOutput)
    return (
      <Button disabled>
        {isLoadingRoute ? <Loader /> : "Insufficient liquidity for this trade."}
      </Button>
    );

  if (showApproveFlow)
    return (
      <Button
        disabled={approvalState !== ApprovalState.NOT_APPROVED}
        onClick={() => approvalCallback && approvalCallback()}
      >
        {approvalState === ApprovalState.PENDING ? (
          <Loader />
        ) : approvalState === ApprovalState.APPROVED ? (
          "Approved"
        ) : (
          `Approve ${currencies[SwapField.INPUT]?.symbol}`
        )}
      </Button>
    );

  return (
    <>
      <Button
        onClick={() => handleSwap()}
        disabled={
          !isValid || priceImpactTooHigh || !!swapCallbackError || isSwapLoading
        }
      >
        {isSwapLoading ? (
          <Loader />
        ) : swapInputError ? (
          swapInputError
        ) : priceImpactTooHigh ? (
          "Price Impact Too High"
        ) : priceImpactSeverity > 2 ? (
          "Swap Anyway"
        ) : (
          "Swap"
        )}
      </Button>
    </>
  );
};

export default SwapButton;
