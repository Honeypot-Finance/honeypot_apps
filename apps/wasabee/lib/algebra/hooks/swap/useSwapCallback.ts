import { Currency, Percent, Trade, TradeType } from '@cryptoalgebra/sdk';
import { useAccount, useContractWrite } from 'wagmi';
import { useSwapCallArguments } from './useSwapCallArguments';
import { useEffect, useMemo, useState } from 'react';
import { useTransactionAwait } from '../common/useTransactionAwait';
import { Address, getContract } from 'viem';
import { ApprovalStateType } from '@/types/algebra/types/approve-state';
import { SwapCallbackState } from '@/types/algebra/types/swap-state';
import { TransactionType } from '../../state/pendingTransactionsStore';
import { formatBalance } from '../../utils/common/formatBalance';
import {
  algebraRouterAbi,
  useSimulateAlgebraRouterMulticall,
} from '@/wagmi-generated';
import { wallet } from '@/services/wallet';
import { SwapField } from '@/types/algebra/types/swap-field';
import { useSwapActionHandlers } from '../../state/swapStore';
import { useObserver } from 'mobx-react-lite';

export interface SwapCallEstimate {
  calldata: string | string[];
  value: bigint;
}

export interface SuccessfulCall extends SwapCallEstimate {
  calldata: string | string[];
  value: bigint;
  gasEstimate: bigint;
}

interface FailedCall extends SwapCallEstimate {
  calldata: string | string[];
  value: bigint;
  error: Error;
}

export function useSwapCallback(
  trade: Trade<Currency, Currency, TradeType> | undefined,
  allowedSlippage: Percent,
  approvalState: ApprovalStateType
) {
  const { address: account } = useAccount();

  const [bestCall, setBestCall] = useState<
    SuccessfulCall | SwapCallEstimate | undefined
  >();

  const swapCalldata = useSwapCallArguments(trade, allowedSlippage);

  const { onUserInput } = useSwapActionHandlers();

  const ALGEBRA_ROUTER = useObserver(
    () => wallet.currentChain.contracts.algebraSwapRouter
  );

  useEffect(() => {
    async function findBestCall() {
      if (!swapCalldata || !account) return;

      setBestCall(undefined);

      const algebraRouter = getContract({
        address: ALGEBRA_ROUTER,
        abi: algebraRouterAbi,
        client: wallet.publicClient,
      });

      const calls = await Promise.all(
        swapCalldata.map(({ calldata, value: _value }) => {
          const value = BigInt(_value);

          return algebraRouter.estimateGas
            .multicall([calldata], {
              account,
              value,
            })
            .then((gasEstimate) => ({
              calldata,
              value,
              gasEstimate,
            }))
            .catch((gasError) => {
              return algebraRouter.simulate
                .multicall([calldata], {
                  account,
                  value,
                })
                .then(() => ({
                  calldata,
                  value,
                  error: new Error(
                    `Unexpected issue with estimating the gas. Please try again. ${gasError}`
                  ),
                }))
                .catch(
                  (callError) => (
                    console.log('Error in useSwapCallback', callError),
                    {
                      calldata,
                      value,
                      error: callError,
                    }
                  )
                );
            });
        })
      );

      let bestCallOption: SuccessfulCall | SwapCallEstimate | undefined =
        calls.find(
          (el, ix, list): el is SuccessfulCall =>
            'gasEstimate' in el &&
            (ix === list.length - 1 || 'gasEstimate' in list[ix + 1])
        );

      if (!bestCallOption) {
        const errorCalls = calls.filter(
          (call): call is FailedCall => 'error' in call
        );
        if (errorCalls.length > 0) {
          //throw errorCalls[errorCalls.length - 1].error?;
          console.log(
            'Error in useSwapCallback',
            errorCalls[errorCalls.length - 1].error
          );
        }
        const firstNoErrorCall = calls.find<any>(
          (call): call is any => !('error' in call)
        );
        if (!firstNoErrorCall)
          console.log('Unexpected error. Could not estimate gas for the swap.');
        //   throw new Error(
        //     "Unexpected error. Could not estimate gas for the swap."
        //   );
        bestCallOption = firstNoErrorCall;
      }

      setBestCall(bestCallOption);
    }

    swapCalldata && findBestCall();
  }, [swapCalldata, approvalState, account]);

  const { data: swapConfig } = useSimulateAlgebraRouterMulticall({
    args: bestCall && ([bestCall.calldata] as any),
    value: BigInt(bestCall?.value || 0),
    query: {
      enabled: Boolean(bestCall),
    },
    gas: (bestCall as any)?.gasEstimate
      ? ((bestCall as any).gasEstimate * (BigInt(10000) + BigInt(2000))) /
        BigInt(10000)
      : undefined,
  });

  const { data: swapData, writeContractAsync: swapCallback } =
    useContractWrite();

  const { isLoading, isSuccess } = useTransactionAwait(swapData, {
    title: `Swap ${formatBalance(
      trade?.inputAmount.toSignificant() as string
    )} ${trade?.inputAmount.currency.symbol}`,
    tokenA: trade?.inputAmount.currency.wrapped.address as Address,
    tokenB: trade?.outputAmount.currency.wrapped.address as Address,
    type: TransactionType.SWAP,
  });

  useEffect(() => {
    if (isSuccess) {
      onUserInput(SwapField.INPUT, '0');
      onUserInput(SwapField.OUTPUT, '0');
    }
  }, [isSuccess, onUserInput]);

  return useMemo(() => {
    if (!trade)
      return {
        state: SwapCallbackState.INVALID,
        callback: null,
        error: 'No trade was found',
        isLoading: false,
        isSuccess: false,
      };

    return {
      bestCall,
      swapConfig,
      state: SwapCallbackState.VALID,
      callback: () => swapConfig && swapCallback(swapConfig?.request),
      error: null,
      isLoading,
      isSuccess,
    };
  }, [trade, isLoading, swapCalldata, swapCallback, swapConfig, isSuccess]);
}
