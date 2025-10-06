import { Button } from '@/components/ui/button';
import { useNeedAllowance } from '@/lib/algebra/hooks/common/useNeedAllowance';
import { useApprove } from '@/lib/algebra/hooks/common/useApprove';
import { useTransactionAwait } from '@/lib/algebra/hooks/common/useTransactionAwait';
import { Token, tryParseTick } from '@cryptoalgebra/sdk';
import {
  useAccount,
  useSimulateContract,
  usePublicClient,
} from 'wagmi';
import { ApprovalState } from '@/types/algebra/types/approve-state';
import Loader from '@/components/algebra/common/Loader';
import { SwapField } from '@/types/algebra/types/swap-field';
import { formatCurrency } from '@/lib/algebra/utils/common/formatCurrency';
import { TransactionType } from '@/lib/algebra/state/pendingTransactionsStore';
import { Address, decodeErrorResult } from 'viem';
import { useWriteLimitOrderManagerPlace } from '@honeypot/shared/wagmi-generated';
import { useLimitOrderInfo } from '@/hooks/useLimitOrderInfo';
import { useObserver } from 'mobx-react-lite';
import { wallet } from '@honeypot/shared';
import { useEffect, useState } from 'react';
import { limitOrderManagerABI } from '@honeypot/shared/lib/abis/algebra-contracts/ABIs/plugins/limitOrderManagerAbi';

interface LimitOrderButtonProps {
  derivedSwap: any;
  token0: Token | undefined;
  token1: Token | undefined;
  poolAddress: Address | undefined;
  disabled: boolean;
  sellPrice: string;
  wasInverted: boolean;
  tickSpacing: number | undefined;
  zeroToOne: boolean;
  limitOrderPlugin: boolean;
  tick?: number;
}

export const LimitOrderButton = ({
  derivedSwap,
  disabled,
  token0,
  token1,
  poolAddress,
  wasInverted,
  sellPrice,
  tickSpacing,
  zeroToOne,
  limitOrderPlugin,
  tick,
}: LimitOrderButtonProps) => {
  const { address: account } = useAccount();
  const publicClient = usePublicClient();
  const [detailedError, setDetailedError] = useState<string | null>(null);

  const currenChain = useObserver(() => wallet.currentChain);

  const {
    currencies: { [SwapField.INPUT]: inputCurrency },
    currencyBalances,
    inputError,
    parsedAmounts: { [SwapField.INPUT]: inputAmount },
  } = derivedSwap;

  const isInverted = wasInverted === zeroToOne;
  const [baseToken, quoteToken] = isInverted
    ? [token1, token0]
    : [token0, token1];

  // Parse the tick from the sell price - keep it simple like the original
  const limitOrderTick = tryParseTick(
    baseToken,
    quoteToken,
    sellPrice,
    tickSpacing
  );

  const limitOrder = useLimitOrderInfo(
    poolAddress,
    inputAmount,
    limitOrderTick,
    tickSpacing
  );

  const needAllowance = useNeedAllowance(
    inputCurrency?.isNative ? undefined : inputCurrency?.wrapped,
    inputAmount,
    currenChain.contracts.limitOrderManager // Use configured limit order manager
  );

  const insufficientBalance =
    inputAmount &&
    currencyBalances[SwapField.INPUT]?.lessThan(
      inputAmount.quotient.toString()
    );

  const isReady =
    token0 &&
    token1 &&
    inputAmount &&
    limitOrder &&
    !disabled &&
    !inputError &&
    !needAllowance &&
    !insufficientBalance &&
    limitOrder?.liquidity &&
    BigInt(limitOrder.liquidity.toString()) > 0;

  // Debug logging
  console.log('LimitOrderButton state:', {
    token0: !!token0,
    token1: !!token1,
    inputAmount: !!inputAmount,
    inputAmountValue: inputAmount?.toSignificant(),
    limitOrder: !!limitOrder,
    limitOrderLiquidity: limitOrder?.liquidity?.toString(),
    disabled,
    inputError,
    needAllowance,
    insufficientBalance,
    isReady,
    sellPrice,
    limitOrderTick,
  });

  const { approvalState, approvalCallback } = useApprove(
    inputAmount,
    currenChain.contracts.limitOrderManager // Use configured limit order manager
  );

  // Debug logging before config creation
  if (isReady && limitOrder) {
    const sellingToken0 = inputAmount?.currency.wrapped.equals(token0.wrapped);

    console.log('Creating limit order config:', {
      limitOrderTick,
      tickLower: limitOrder.tickLower,
      tickUpper: limitOrder.tickUpper,
      tickSpacing,
      currentTick: tick,
      zeroToOne,
      liquidity: limitOrder.liquidity.toString(),
      inputAmount: inputAmount?.toSignificant(),
      token0: token0?.symbol,
      token1: token1?.symbol,
      sellingToken0,
      invertPrice: wasInverted === zeroToOne,
      limitOrderPlugin,
      poolAddress,
    });

    // Check if tick is properly aligned
    if (tickSpacing && limitOrder.tickLower % tickSpacing !== 0) {
      console.error('TICK NOT ALIGNED:', {
        tickLower: limitOrder.tickLower,
        tickSpacing,
        remainder: limitOrder.tickLower % tickSpacing,
        shouldBe: Math.round(limitOrder.tickLower / tickSpacing) * tickSpacing,
      });
    }

    // Validate tick is on correct side
    if (tick !== undefined) {
      // When zeroToOne=true (selling token0), tick must be > current
      // When zeroToOne=false (selling token1), tick must be < current
      const isValidSide = zeroToOne
        ? limitOrder.tickLower > tick // Selling token0, tick should be above
        : limitOrder.tickLower < tick; // Selling token1, tick should be below

      if (!isValidSide) {
        console.error('TICK ON WRONG SIDE:', {
          tickLower: limitOrder.tickLower,
          currentTick: tick,
          zeroToOne,
          sellingToken0,
          shouldBe: zeroToOne ? 'above current' : 'below current',
        });
      }
    }
  }

  // Use the configured limit order manager - it's a separate contract, not the pool's plugin
  const limitOrderManagerAddress = currenChain.contracts
    .limitOrderManager as Address;

  const placeLimitOrderConfig =
    isReady &&
    limitOrder &&
    tickSpacing &&
    limitOrder.tickLower % tickSpacing === 0 // Ensure tick is aligned
      ? {
          address: limitOrderManagerAddress,
          abi: limitOrderManagerABI,
          functionName: 'place' as const,
          args: [
            {
              deployer: '0x0000000000000000000000000000000000000000' as Address, // Always use zero address
              token0: token0.address as Address,
              token1: token1.address as Address,
            },
            limitOrder.tickLower, // Use tickLower directly, it's already aligned
            zeroToOne,
            BigInt(limitOrder.liquidity.toString()),
          ] as const,
          value: inputAmount?.currency.isNative
            ? BigInt(inputAmount.quotient.toString())
            : BigInt(0),
        }
      : undefined;

  // Simulate the contract call before sending
  const { data: simulationData, error: simulationError } = useSimulateContract(
    placeLimitOrderConfig || {}
  );

  // Log simulation errors for debugging and try manual simulation
  useEffect(() => {
    if (simulationError && placeLimitOrderConfig && publicClient && account) {
      // Extract the actual revert reason
      let revertReason = 'Unknown error';
      const error = simulationError as any;

      // Check for custom error in the error object
      if (error.cause?.data?.errorName) {
        revertReason = error.cause.data.errorName;
      } else if (error.shortMessage) {
        revertReason = error.shortMessage;
      } else if (error.message) {
        // Try to extract custom error from the message
        const customErrorMatch = error.message.match(/error: (\w+)/);
        if (customErrorMatch) {
          revertReason = customErrorMatch[1];
        }
      }

      // Try to decode the error if we have error data
      if (error.cause?.data) {
        try {
          const decodedError = decodeErrorResult({
            abi: limitOrderManagerABI,
            data: error.cause.data,
          });
          console.log('Decoded error:', decodedError);
          revertReason = decodedError.errorName || revertReason;
          setDetailedError(decodedError.errorName || revertReason);
        } catch (decodeError) {
          console.log('Could not decode error:', decodeError);
        }
      }

      // Also check if there's a revert reason in the error walk
      if (!error.cause?.data && typeof error.walk === 'function') {
        try {
          const errors = [...error.walk()];
          for (const err of errors) {
            console.log('Walking error:', err);
            if (err.signature) {
              console.log('Found signature:', err.signature);
              revertReason = err.signature;
              setDetailedError(err.signature);
              break;
            }
            if (err.data && err.data !== '0x') {
              try {
                const decoded = decodeErrorResult({
                  abi: limitOrderManagerABI,
                  data: err.data,
                });
                console.log('Decoded from walk:', decoded);
                revertReason = decoded.errorName;
                setDetailedError(decoded.errorName);
                break;
              } catch (e) {
                // Continue
              }
            }
          }
        } catch (e) {
          console.log('Error walking:', e);
        }
      }

      // Try manual simulation for more details
      const tryManualSimulation = async () => {
        try {
          const result = await publicClient.simulateContract({
            address: placeLimitOrderConfig.address,
            abi: limitOrderManagerABI,
            functionName: 'place',
            args: placeLimitOrderConfig.args,
            value: placeLimitOrderConfig.value,
            account,
          });
          console.log('Manual simulation succeeded:', result);
        } catch (manualError: any) {
          console.error('Manual simulation error:', {
            message: manualError.message,
            cause: manualError.cause,
            data: manualError.data,
            shortMessage: manualError.shortMessage,
            metaMessages: manualError.metaMessages,
            details: manualError.details,
            walk: manualError.walk,
          });

          // Try multiple ways to extract the error
          let extractedError = null;

          // Method 1: Check for custom error in cause.data
          if (manualError.cause?.data) {
            try {
              const decodedError = decodeErrorResult({
                abi: limitOrderManagerABI,
                data: manualError.cause.data,
              });
              console.log('Decoded error from cause.data:', decodedError);
              extractedError = decodedError.errorName;
            } catch (e) {
              console.log('Could not decode from cause.data');
            }
          }

          // Method 2: Check for error in walk() if available
          if (!extractedError && typeof manualError.walk === 'function') {
            try {
              const errors = [...manualError.walk()];
              console.log('Errors from walk:', errors);
              for (const err of errors) {
                if (err.data) {
                  try {
                    const decoded = decodeErrorResult({
                      abi: limitOrderManagerABI,
                      data: err.data,
                    });
                    console.log('Decoded error from walk:', decoded);
                    extractedError = decoded.errorName;
                    break;
                  } catch (e) {
                    // Continue to next error
                  }
                }
              }
            } catch (walkError) {
              console.log('Error walking:', walkError);
            }
          }

          // Method 3: Check raw revert data
          if (!extractedError && manualError.cause?.reason) {
            console.log('Revert reason:', manualError.cause.reason);
            extractedError = manualError.cause.reason;
          }

          // Method 4: Parse from message
          if (!extractedError && manualError.message) {
            const customErrorMatch = manualError.message.match(
              /custom error '([^']+)'/
            );
            if (customErrorMatch) {
              extractedError = customErrorMatch[1];
            }
          }

          if (extractedError) {
            console.log('EXTRACTED ERROR:', extractedError);
            setDetailedError(extractedError);
          }

          // Also check the error details property
          if (manualError.details) {
            console.log('Error details:', manualError.details);
          }

          // Check if there's raw revert data we can parse
          if (manualError.cause?.cause?.data) {
            console.log('Deep cause data:', manualError.cause.cause.data);
            try {
              const decoded = decodeErrorResult({
                abi: limitOrderManagerABI,
                data: manualError.cause.cause.data,
              });
              console.log('Decoded deep cause:', decoded);
              if (decoded.errorName) {
                setDetailedError(decoded.errorName);
              }
            } catch (e) {
              console.log('Could not decode deep cause');
            }
          }

          // Log all available error properties for debugging
          console.log('Full error properties:', {
            name: manualError.name,
            message: manualError.message,
            stack: manualError.stack,
            cause: manualError.cause,
            reason: manualError.reason,
            code: manualError.code,
            data: manualError.data,
            transaction: manualError.transaction,
            receipt: manualError.receipt,
            action: manualError.action,
            url: manualError.url,
            requestBody: manualError.requestBody,
            requestMethod: manualError.requestMethod,
            responseText: manualError.responseText,
            statusCode: manualError.statusCode,
            errorArgs: manualError.errorArgs,
            errorName: manualError.errorName,
            errorSignature: manualError.errorSignature,
            failureReason: manualError.failureReason,
          });
        }
      };

      tryManualSimulation();

      console.error('Limit Order Simulation Error:', {
        revertReason,
        fullError: simulationError,
        errorCause: error.cause,
        errorData: error.cause?.data,
        config: {
          poolKey: {
            token0: token0?.address,
            token1: token1?.address,
            deployer: '0x0000000000000000000000000000000000000000', // Always zero address
          },
          tickLower: limitOrder?.tickLower,
          tickUpper: limitOrder?.tickUpper,
          liquidity: limitOrder?.liquidity?.toString(),
          zeroToOne,
          value: inputAmount?.currency.isNative
            ? inputAmount.quotient.toString()
            : '0',
        },
        inputAmount: inputAmount?.toSignificant(),
        sellPrice,
        currentTick: tick,
        tickSpacing,
        calculatedPriceTick: limitOrderTick,
      });
    }
  }, [
    simulationError,
    placeLimitOrderConfig,
    limitOrder,
    zeroToOne,
    inputAmount,
    token0,
    token1,
    currenChain,
    sellPrice,
    tickSpacing,
    tick,
    publicClient,
    account,
    limitOrderTick,
  ]);

  const {
    data: placeData,
    writeContract: placeLimitOrder,
    isPending,
  } = useWriteLimitOrderManagerPlace();

  const { isLoading: isPlaceLoading } = useTransactionAwait(placeData, {
    type: TransactionType.LIMIT_ORDER,
    title: `Buy ${formatCurrency.format(
      Number(inputAmount?.toSignificant())
    )} ${inputAmount?.currency.symbol}`,
  });

  if (!account) return <Button onClick={() => open()}>Connect Wallet</Button>;

  if (!limitOrderPlugin)
    return (
      <Button disabled>This pool doesn&apos;t support Limit Orders</Button>
    );

  if (!disabled && inputError) return <Button disabled>{inputError}</Button>;

  if (insufficientBalance) {
    return (
      <Button disabled>
        Insufficient {inputAmount.currency.symbol} amount
      </Button>
    );
  }

  if (!disabled && needAllowance) {
    console.log('Showing approval button:', {
      needAllowance,
      approvalState,
      approvingFor: currenChain.contracts.limitOrderManager,
      inputCurrency: inputAmount?.currency.symbol,
    });
    return (
      <Button
        disabled={approvalState === ApprovalState.PENDING}
        onClick={() => approvalCallback && approvalCallback()}
      >
        {approvalState === ApprovalState.PENDING ? (
          <Loader />
        ) : (
          `Approve ${inputAmount?.currency.symbol}`
        )}
      </Button>
    );
  }

  // Show simulation error if exists
  let displayError: string | null = null;
  if ((simulationError || detailedError) && isReady) {
    const error = simulationError as any;
    let errorMessage = detailedError || 'Unknown error';

    // If we don't have a detailed error yet, try to extract from simulation error
    if (!detailedError) {
      if (error?.cause?.data?.errorName) {
        errorMessage = error.cause.data.errorName;
      } else if (error?.shortMessage) {
        errorMessage = error.shortMessage;
      } else if (error?.message) {
        errorMessage = error.message;
      }
    }

    // Map known error names to user-friendly messages
    const errorMap: Record<string, string> = {
      InRange: 'Price is in current range',
      CrossedRange: 'Price crossed the range',
      ZeroLiquidity: 'Zero liquidity provided',
      InsufficientLiquidity: 'Insufficient liquidity',
      NotPlugin: 'Pool plugin not enabled',
      NotPoolManagerToken: 'Invalid token',
      Filled: 'Order already filled',
      NotFilled: 'Order not filled',
    };

    const friendlyError = errorMap[errorMessage] || errorMessage;
    displayError =
      friendlyError.length > 50
        ? friendlyError.substring(0, 47) + '...'
        : friendlyError;
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Show error message if there is one */}
      {(inputError || displayError) && (
        <Button disabled className="text-red-500">
          {displayError ||
            (typeof inputError === 'string'
              ? inputError
              : (inputError as any)?.message ||
                (inputError as any)?.shortMessage ||
                'Error')}
        </Button>
      )}
      <Button
        disabled={
          disabled ||
          isPlaceLoading ||
          approvalState === ApprovalState.PENDING ||
          isPending ||
          !isReady ||
          !!simulationError
        }
        onClick={() => {
          console.log(
            '[PLACE LIMIT ORDER]',
            {
              token0,
              token1,
              inputAmount,
              limitOrder,
              disabled,
              inputError,
              needAllowance,
              simulationSuccess: !!simulationData && !simulationError,
            },
            isReady && [
              {
                token0: token0.address as Address,
                token1: token1.address as Address,
              },
              limitOrder?.tickLower,
              zeroToOne,
              BigInt(limitOrder?.liquidity?.toString() || 0),
            ]
          );

          if (simulationData && !simulationError) {
            placeLimitOrderConfig && placeLimitOrder(placeLimitOrderConfig);
          } else {
            console.error(
              'Cannot place order: simulation failed',
              simulationError
            );
          }
        }}
      >
        {isPlaceLoading || isPending ? <Loader /> : 'Place an order'}
      </Button>
    </div>
  );
};
