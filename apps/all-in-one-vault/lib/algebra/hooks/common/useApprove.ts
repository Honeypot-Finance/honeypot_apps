import { formatBalance } from "@/lib/algebra/utils/common/formatBalance";
import {
  Currency,
  CurrencyAmount,
  Percent,
  Trade,
  TradeType,
} from "@cryptoalgebra/sdk";
import { useNeedAllowance } from "./useNeedAllowance";
import { useMemo } from "react";
import { useTransactionAwait } from "./useTransactionAwait";
import { ALGEBRA_ROUTER } from "@/config/algebra/addresses";
import {
  ApprovalStateType,
  ApprovalState,
} from "@/types/algebra/types/approve-state";
import { Address, maxInt256 } from "viem";
import { useWriteContract, useSimulateContract } from "wagmi";
import { erc20Abi } from "viem";
import { TransactionType } from "../../state/pendingTransactionsStore";
import { useToastify } from "./useContractToastify";

export function useApprove(
  amountToApprove: CurrencyAmount<Currency> | undefined,
  spender: Address
) {
  const token = amountToApprove?.currency?.isToken
    ? amountToApprove.currency
    : undefined;
  const needAllowance = useNeedAllowance(token, amountToApprove, spender);

  const approvalState: ApprovalStateType = useMemo(() => {
    if (!amountToApprove || !spender) return ApprovalState.UNKNOWN;
    if (amountToApprove.currency.isNative) return ApprovalState.APPROVED;

    return needAllowance ? ApprovalState.NOT_APPROVED : ApprovalState.APPROVED;
  }, [amountToApprove, needAllowance, spender]);

  const { data: config } = useSimulateContract({
    address: amountToApprove
      ? (amountToApprove.currency.wrapped.address as Address)
      : undefined,
    abi: erc20Abi,
    functionName: "approve",
    args: [
      spender,
      BigInt(maxInt256),
      //   amountToApprove ? BigInt(amountToApprove.quotient.toString()) : 0,
      //
    ] as [Address, bigint],
  });

  const { data: approvalData, writeContractAsync: approve } =
    useWriteContract();

  const { isLoading, isSuccess, isError } = useTransactionAwait(approvalData, {
    title: `Approve ${formatBalance(amountToApprove?.toSignificant() as string)} ${amountToApprove?.currency.symbol}`,
    tokenA: token?.address as Address,
    type: TransactionType.SWAP,
  });

  useToastify({
    title: `Approve ${formatBalance(amountToApprove?.toSignificant() as string)} ${amountToApprove?.currency.symbol}`,
    message: "Approve",
    isError: isError,
    isLoading: isLoading,
    isSuccess: isSuccess,
  });

  return {
    approvalState: isLoading
      ? ApprovalState.PENDING
      : isSuccess && approvalState === ApprovalState.APPROVED
        ? ApprovalState.APPROVED
        : approvalState,
    approvalCallback: () => config && approve(config?.request),
  };
}

export function useApproveCallbackFromTrade(
  trade: Trade<Currency, Currency, TradeType> | undefined,
  allowedSlippage: Percent
) {
  const amountToApprove = useMemo(
    () =>
      trade && trade.inputAmount.currency.isToken
        ? trade.maximumAmountIn(allowedSlippage)
        : undefined,
    [trade, allowedSlippage]
  );
  return useApprove(amountToApprove, ALGEBRA_ROUTER);
}
