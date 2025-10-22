import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useObserver } from 'mobx-react-lite';
import SwapPairV3 from '../multichain-design/swap/SwapPair/SwapPairV3';
import Container from '../multichain-design/Container';
import Settings from '../multichain-design/Buttons/SettingButton';
import { wallet } from '@honeypot/shared/lib/wallet';
import {
  useDerivedSwapInfo,
  useSwapState,
} from '@/lib/algebra/state/swapStore';
import { SwapField } from '@/types/algebra/types/swap-field';
import {
  computePoolAddress,
  getTickToPrice,
  TickMath,
  tickToPrice,
  tryParseTick,
  WNATIVE,
} from '@cryptoalgebra/sdk';
import { PoolState, usePool } from '@/lib/algebra/hooks/pools/usePool';
import { Address, decodeErrorResult } from 'viem';
import { LimitOrderButton } from './LimitOrderButton/index';
import { usePublicClient, useAccount } from 'wagmi';
import { useLimitOrderInfo } from '@/hooks/useLimitOrderInfo';
import { limitOrderManagerABI } from '@honeypot/shared/lib/abis/algebra-contracts/ABIs/plugins/limitOrderManagerAbi';

interface LimitOrderProps {
  fromTokenAddress?: string;
  toTokenAddress?: string;
  isInputNative?: boolean;
  isOutputNative?: boolean;
  onOrderPlaced?: () => void;
}

const LimitOrder = observer(
  ({
    fromTokenAddress,
    toTokenAddress,
    isInputNative = false,
    isOutputNative = false,
    onOrderPlaced,
  }: LimitOrderProps) => {
    const { independentField } = useSwapState();
    const derivedSwapInfo = useDerivedSwapInfo();
    const {
      currencies,
      parsedAmount,
      currencyBalances,
      inputError,
      tradeState,
    } = derivedSwapInfo;
    const publicClient = usePublicClient();
    const { address: account } = useAccount();

    const [sellPrice, setSellPrice] = useState<string>('');
    const [isRateFocused, setIsRateFocused] = useState(false);
    const [poolPlugin, setPoolPlugin] = useState<Address | null>(null);
    const [isPluginInitialized, setIsPluginInitialized] = useState(false);
    const [simulationError, setSimulationError] = useState<string | null>(null);
    const [simulationSuccess, setSimulationSuccess] = useState(false);

    // Create derivedSwap object compatible with LimitOrderButton
    const derivedSwap = useMemo(() => {
      // For limit orders, we primarily care about the input amount the user typed
      const inputAmount =
        independentField === SwapField.INPUT
          ? parsedAmount
          : tradeState?.trade?.inputAmount;
      const outputAmount =
        independentField === SwapField.OUTPUT
          ? parsedAmount
          : tradeState?.trade?.outputAmount;

      return {
        currencies,
        currencyBalances,
        inputError,
        parsedAmounts: {
          [SwapField.INPUT]: inputAmount,
          [SwapField.OUTPUT]: outputAmount,
        },
      };
    }, [
      currencies,
      currencyBalances,
      inputError,
      parsedAmount,
      tradeState,
      independentField,
    ]);

    // Use MobX observer to properly track wallet connection state
    const poolDeployerAddress = useObserver(
      () => wallet.currentChain.contracts.algebraPoolDeployer
    );
    const initCodeHashManualOverride = useObserver(
      () => wallet.currentChain.contracts.algebraPoolInitCodeHash
    );
    const limitOrderManagerAddress = useObserver(
      () => wallet.currentChain.contracts.limitOrderManager
    );
    const chainId = wallet.currentChain.chainId;

    const tokenA = currencies[SwapField.INPUT]?.wrapped;
    const tokenB = currencies[SwapField.OUTPUT]?.wrapped;

    const showWrap =
      tokenA?.wrapped?.equals(WNATIVE[chainId]) &&
      tokenB?.wrapped.equals(WNATIVE[chainId]);

    const [token0, token1] =
      tokenA && tokenB && !showWrap
        ? tokenA.wrapped?.sortsBefore(tokenB.wrapped)
          ? [tokenA, tokenB]
          : [tokenB, tokenA]
        : [undefined, undefined];
    const invertPrice = Boolean(
      currencies[SwapField.INPUT] &&
        token0 &&
        !currencies[SwapField.INPUT]?.wrapped.equals(token0)
    );

    // zeroToOne: true means selling token0 for token1, false means selling token1 for token0
    // If INPUT currency equals token0, then zeroToOne = true (selling token0)
    // If INPUT currency equals token1, then zeroToOne = false (selling token1)
    const zeroToOne = Boolean(
      currencies[SwapField.INPUT] &&
        token0 &&
        currencies[SwapField.INPUT]?.wrapped.equals(token0.wrapped)
    );

    const limitOrderPoolAddress =
      token0 && token1 && !showWrap && poolDeployerAddress
        ? (computePoolAddress({
            tokenA: token0,
            tokenB: token1,
            initCodeHashManualOverride: initCodeHashManualOverride,
          }) as Address)
        : undefined;

    const [limitOrderPoolExists, limitOrderPool] = usePool(
      limitOrderPoolAddress
    );

    const initialSellPrice = useMemo(() => {
      if (!limitOrderPool || !currencies[SwapField.INPUT]) return '';

      const { tickCurrent, tickSpacing } = limitOrderPool;

      // Limit order ranges are [tickLower, tickUpper] where tickUpper = tickLower + tickSpacing
      // For the order to be valid, currentTick must NOT be in this range
      let targetTick: number;

      if (zeroToOne) {
        // Selling token0 - need range ABOVE current
        // Need tickLower > tickCurrent (so entire range is above)
        // Use ceil to round up to next aligned tick above current
        targetTick = Math.ceil((tickCurrent + 1) / tickSpacing) * tickSpacing;
        targetTick = Math.min(targetTick, TickMath.MAX_TICK);
      } else {
        // Selling token1 - need range BELOW current
        // Need tickUpper < tickCurrent (so entire range is below)
        // tickUpper = tickLower + tickSpacing < tickCurrent
        // tickLower < tickCurrent - tickSpacing
        // Use floor to get largest aligned tick that satisfies this
        targetTick =
          Math.floor((tickCurrent - tickSpacing) / tickSpacing) * tickSpacing;
        targetTick = Math.max(targetTick, TickMath.MIN_TICK);
      }

      const _newPrice = invertPrice
        ? getTickToPrice(token1, token0, targetTick)
        : getTickToPrice(token0, token1, targetTick);

      console.log('[INITIAL PRICE] Calculating nearest valid:', {
        tickCurrent,
        targetTick,
        rangeWillBe: `[${targetTick}, ${targetTick + tickSpacing}]`,
        tickSpacing,
        zeroToOne,
        distanceFromCurrent: Math.abs(targetTick - tickCurrent),
        price: _newPrice?.toSignificant(8),
      });

      return _newPrice?.toSignificant(8);
    }, [limitOrderPool, token0, token1, invertPrice, currencies, zeroToOne]);

    // Calculate the actual current market rate using tickCurrent directly
    const currentMarketRate = useMemo(() => {
      if (!limitOrderPool || !currencies[SwapField.INPUT]) return '';

      const { tickCurrent } = limitOrderPool;

      const _marketPrice = invertPrice
        ? getTickToPrice(token1, token0, tickCurrent)
        : getTickToPrice(token0, token1, tickCurrent);

      return _marketPrice?.toSignificant(8);
    }, [limitOrderPool, token0, token1, invertPrice, currencies]);

    const isPoolExists = limitOrderPoolExists === PoolState.EXISTS;
    const tick = limitOrderPool?.tickCurrent;
    const tickSpacing = limitOrderPool?.tickSpacing;

    // Calculate input amount for simulation
    const inputAmount = useMemo(() => {
      return independentField === SwapField.INPUT
        ? parsedAmount
        : tradeState?.trade?.inputAmount;
    }, [independentField, parsedAmount, tradeState]);

    // Calculate limit order tick for simulation
    // baseToken/quoteToken determines price direction
    const [baseToken, quoteToken] = [token0, token1];

    const limitOrderTick = useMemo(() => {
      if (!baseToken || !quoteToken || !sellPrice || !tickSpacing)
        return undefined;
      return tryParseTick(baseToken, quoteToken, sellPrice, tickSpacing);
    }, [baseToken, quoteToken, sellPrice, tickSpacing]);

    // Get limit order info for simulation
    const limitOrder = useLimitOrderInfo(
      limitOrderPoolAddress,
      inputAmount,
      limitOrderTick,
      tickSpacing
    );

    // Debug logging for limit order calculation
    useEffect(() => {
      if (sellPrice && inputAmount && tick !== undefined) {
        const parsedTick = tryParseTick(
          baseToken,
          quoteToken,
          sellPrice,
          tickSpacing
        );
        const alignedTick =
          parsedTick !== undefined && tickSpacing
            ? Math.round(parsedTick / tickSpacing) * tickSpacing
            : undefined;

        console.log('[LIMIT ORDER DEBUG]', {
          sellPrice,
          inputAmount: inputAmount.toSignificant(),
          limitOrderTick,
          parsedTickFromPrice: parsedTick,
          alignedTickLower: alignedTick,
          tickSpacing,
          currentTick: tick,
          zeroToOne,
          tickDistance: alignedTick !== undefined ? alignedTick - tick : 'N/A',
          isAboveCurrent:
            alignedTick !== undefined ? alignedTick > tick : 'N/A',
          limitOrder: limitOrder
            ? {
                tickLower: limitOrder.tickLower,
                tickUpper: limitOrder.tickUpper,
                liquidity: limitOrder.liquidity?.toString(),
                isValid: limitOrder.liquidity?.toString() !== '0',
              }
            : null,
          baseToken: baseToken?.symbol,
          quoteToken: quoteToken?.symbol,
        });
      }
    }, [
      sellPrice,
      inputAmount,
      limitOrderTick,
      limitOrder,
      tick,
      zeroToOne,
      baseToken,
      quoteToken,
      tickSpacing,
    ]);

    // Step 1: Get the pool's plugin address
    useEffect(() => {
      const getPoolPlugin = async () => {
        if (!limitOrderPoolAddress || !publicClient || !isPoolExists) {
          setPoolPlugin(null);
          setIsPluginInitialized(false);
          return;
        }

        try {
          const plugin = (await publicClient.readContract({
            address: limitOrderPoolAddress,
            abi: [
              {
                inputs: [],
                name: 'plugin',
                outputs: [{ name: '', type: 'address' }],
                stateMutability: 'view',
                type: 'function',
              },
            ],
            functionName: 'plugin',
          })) as Address;

          setPoolPlugin(plugin);
        } catch (error) {
          setPoolPlugin(null);
          setIsPluginInitialized(false);
        }
      };

      getPoolPlugin();
    }, [limitOrderPoolAddress, publicClient, isPoolExists]);

    // Step 2: Check if the plugin is initialized in the limit order manager
    useEffect(() => {
      const checkPluginInitialization = async () => {
        if (
          !poolPlugin ||
          !limitOrderPoolAddress ||
          !publicClient ||
          !limitOrderManagerAddress
        ) {
          setIsPluginInitialized(false);
          return;
        }

        try {
          const initialized = (await publicClient.readContract({
            address: limitOrderManagerAddress as Address,
            abi: [
              {
                inputs: [
                  {
                    internalType: 'address',
                    name: '',
                    type: 'address',
                  },
                ],
                name: 'initialized',
                outputs: [
                  {
                    internalType: 'bool',
                    name: '',
                    type: 'bool',
                  },
                ],
                stateMutability: 'view',
                type: 'function',
              },
            ],
            functionName: 'initialized',
            args: [limitOrderPoolAddress],
          })) as boolean;

          setIsPluginInitialized(initialized);
        } catch (error) {
          setIsPluginInitialized(false);
        }
      };

      checkPluginInitialization();
    }, [
      poolPlugin,
      limitOrderPoolAddress,
      publicClient,
      limitOrderManagerAddress,
    ]);

    // Step 3: Simulate contract call whenever price changes
    useEffect(() => {
      const simulateTransaction = async () => {
        // Only run if dev mode is enabled
        const isDev = process.env.NEXT_PUBLIC_DEV === 'true';

        console.log(
          '[SIMULATION] Effect triggered - sellPrice:',
          sellPrice,
          'inputAmount:',
          inputAmount?.toSignificant()
        );

        // Reset states
        setSimulationError(null);
        setSimulationSuccess(false);

        // Check if we have all required data
        const missingData = {
          token0: !token0,
          token1: !token1,
          inputAmount: !inputAmount,
          limitOrder: !limitOrder,
          limitOrderManagerAddress: !limitOrderManagerAddress,
          account: !account,
          publicClient: !publicClient,
          sellPrice: !sellPrice,
          liquidity:
            !limitOrder?.liquidity ||
            BigInt(limitOrder.liquidity.toString()) === BigInt(0),
        };

        const hasMissingData = Object.values(missingData).some((v) => v);

        if (hasMissingData) {
          console.log(
            '[SIMULATION] Skipped - Missing data:',
            Object.entries(missingData)
              .filter(([_, missing]) => missing)
              .map(([key]) => key),
            {
              limitOrderTick,
              limitOrderLiquidity: limitOrder?.liquidity?.toString(),
            }
          );
          return;
        }

        // TypeScript type guards - all required data is definitely defined here
        if (!limitOrder || !token0 || !token1 || !inputAmount || !publicClient)
          return;

        // Ensure tick is aligned
        if (tickSpacing && limitOrder.tickLower % tickSpacing !== 0) {
          console.log('[SIMULATION] Skipped - Tick not aligned:', {
            tickLower: limitOrder.tickLower,
            tickSpacing,
            remainder: limitOrder.tickLower % tickSpacing,
          });
          return;
        }

        // Prepare simulation parameters for logging
        const simulationParams = {
          token0: token0.symbol,
          token1: token1.symbol,
          inputAmount: inputAmount.toSignificant(),
          sellPrice,
          limitOrderTick,
          tickLower: limitOrder.tickLower,
          tickUpper: limitOrder.tickUpper,
          liquidity: limitOrder.liquidity.toString(),
          zeroToOne,
          currentTick: tick,
          tickSpacing,
        };

        try {
          if (isDev) {
            console.log(
              '[SIMULATION] Starting simulation with:',
              simulationParams
            );
          }

          await publicClient.simulateContract({
            address: limitOrderManagerAddress as Address,
            abi: limitOrderManagerABI,
            functionName: 'place',
            args: [
              {
                deployer:
                  '0x0000000000000000000000000000000000000000' as Address,
                token0: token0.address as Address,
                token1: token1.address as Address,
              },
              limitOrder.tickLower,
              zeroToOne,
              BigInt(limitOrder.liquidity.toString()),
            ],
            value: inputAmount?.currency.isNative
              ? BigInt(inputAmount.quotient.toString())
              : BigInt(0),
            account,
          });

          setSimulationSuccess(true);
          // Always log simulation success to console
          console.log(
            '[SIMULATION] ✅ Success! This limit order can be placed.'
          );
          console.log('[SIMULATION] Parameters:', simulationParams);
          if (isDev) {
            console.log(
              '[SIMULATION] Successful simulation details available in dev mode'
            );
          }
        } catch (error: any) {
          let errorMessage = 'Unknown error';

          // Try to extract error name
          if (error.cause?.data) {
            try {
              const decoded = decodeErrorResult({
                abi: limitOrderManagerABI,
                data: error.cause.data,
              }) as unknown as { errorName?: string; args?: unknown[] };
              errorMessage =
                decoded.errorName ||
                (decoded.args?.[0] as string) ||
                errorMessage;
            } catch (e) {
              // Continue with other extraction methods
            }
          }

          // Walk through error chain
          if (
            errorMessage === 'Unknown error' &&
            typeof error.walk === 'function'
          ) {
            try {
              const errors = [...error.walk()];
              for (const err of errors) {
                if (err.data && err.data !== '0x') {
                  try {
                    const decoded = decodeErrorResult({
                      abi: limitOrderManagerABI,
                      data: err.data,
                    });
                    errorMessage = decoded.errorName || errorMessage;
                    break;
                  } catch (e) {
                    // Continue
                  }
                }
              }
            } catch (e) {
              // Continue
            }
          }

          // Try other error properties
          if (errorMessage === 'Unknown error') {
            if (error.shortMessage) {
              errorMessage = error.shortMessage;
            } else if (error.message) {
              const match = error.message.match(/error: (\w+)/);
              if (match) {
                errorMessage = match[1];
              } else {
                errorMessage = error.message;
              }
            }
          }

          setSimulationError(errorMessage);

          // Always log simulation errors to console
          console.log('[SIMULATION] ❌ Failed:', errorMessage);
          console.log('[SIMULATION] Parameters:', simulationParams);
          if (isDev) {
            console.log('[SIMULATION] Full error:', {
              message: error.message,
              shortMessage: error.shortMessage,
              cause: error.cause,
              data: error.data,
              details: error.details,
            });
          }
        }
      };

      simulateTransaction();
    }, [
      token0,
      token1,
      inputAmount,
      limitOrder,
      limitOrderManagerAddress,
      account,
      publicClient,
      sellPrice,
      zeroToOne,
      tick,
      tickSpacing,
      limitOrderTick,
    ]);

    const tickStep = useCallback(
      (direction: 1 | -1) => {
        if (!tickSpacing) return;

        const tick = invertPrice
          ? tryParseTick(token1, token0, sellPrice.toString(), tickSpacing)
          : tryParseTick(token0, token1, sellPrice.toString(), tickSpacing);

        if (!token0 || !token1 || tick === undefined) {
          setSellPrice('');
          return;
        }

        const limitOrderPrice = invertPrice
          ? tickToPrice(
              token1,
              token0,
              tick + tickSpacing * direction * -1
            ).toSignificant(8)
          : tickToPrice(
              token0,
              token1,
              tick + tickSpacing * direction
            ).toSignificant(8);

        setSellPrice(limitOrderPrice);
      },
      [invertPrice, token0, token1, sellPrice, tickSpacing]
    );

    const { blockCreation, message } = useMemo(() => {
      const missingFields: string[] = [];

      if (!currencies.INPUT) missingFields.push('currencies.INPUT');
      if (!currencies.OUTPUT) missingFields.push('currencies.OUTPUT');
      if (!token0) missingFields.push('token0');
      if (!token1) missingFields.push('token1');
      if (tick === undefined) missingFields.push('tick');
      if (tickSpacing === undefined) missingFields.push('tickSpacing');

      if (
        missingFields.length > 0 ||
        !token0 ||
        !token1 ||
        tick === undefined ||
        tickSpacing === undefined ||
        !currencies.INPUT ||
        !currencies.OUTPUT
      ) {
        return {
          blockCreation: true,
          message: `Missing: ${missingFields.join(', ')}`,
        };
      }

      // Check if sellPrice is empty or invalid
      if (!sellPrice || sellPrice === '') {
        return {
          blockCreation: true,
          message: 'Set limit price',
        };
      }

      const priceTick = invertPrice
        ? tryParseTick(token1, token0, sellPrice.toString(), tickSpacing)
        : tryParseTick(token0, token1, sellPrice.toString(), tickSpacing);

      if (priceTick === undefined) {
        return {
          blockCreation: true,
          message: 'Unable to calculate price tick',
        };
      }

      if (
        currencies.INPUT.wrapped.equals(token0.wrapped) &&
        priceTick <= tick
      ) {
        return {
          blockCreation: true,
          message: 'Price must be above market',
        };
      }

      if (
        currencies.INPUT.wrapped.equals(token1.wrapped) &&
        priceTick >= tick
      ) {
        return {
          blockCreation: true,
          message: 'Price must be below market',
        };
      }

      return { blockCreation: false, message: '' };
    }, [token0, token1, currencies, invertPrice, sellPrice, tick, tickSpacing]);

    const [plusDisabled, minusDisabled] = useMemo(() => {
      if (
        !currencies.INPUT ||
        !currencies.OUTPUT ||
        !token0 ||
        !token1 ||
        tick === undefined ||
        tick === null ||
        tickSpacing === undefined ||
        tickSpacing === null
      ) {
        return [true, true];
      }

      const priceTick = invertPrice
        ? tryParseTick(token1, token0, sellPrice.toString(), tickSpacing)
        : tryParseTick(token0, token1, sellPrice.toString(), tickSpacing);

      if (priceTick === undefined) {
        return [true, true];
      }

      if (
        currencies.INPUT.wrapped.equals(token0.wrapped) &&
        priceTick - tickSpacing <= tick
      )
        return [false, true];

      if (
        currencies.INPUT.wrapped.equals(token1.wrapped) &&
        priceTick + tickSpacing >= tick - tickSpacing
      )
        return [false, true];

      return [false, false];
    }, [token0, token1, currencies, invertPrice, sellPrice, tick, tickSpacing]);

    const setToMarketPrice = useCallback(() => {
      if (!limitOrderPool || !token0 || !token1 || !tickSpacing) return;

      const { tickCurrent } = limitOrderPool;

      // Use same logic as initialSellPrice
      let targetTick: number;

      if (zeroToOne) {
        // Selling token0 - need range ABOVE current
        // Need tickLower > tickCurrent
        targetTick = Math.ceil((tickCurrent + 1) / tickSpacing) * tickSpacing;
        targetTick = Math.min(targetTick, TickMath.MAX_TICK);
      } else {
        // Selling token1 - need range BELOW current
        // Need tickUpper < tickCurrent
        // tickLower < tickCurrent - tickSpacing
        targetTick =
          Math.floor((tickCurrent - tickSpacing) / tickSpacing) * tickSpacing;
        targetTick = Math.max(targetTick, TickMath.MIN_TICK);
      }

      const _newPrice = invertPrice
        ? getTickToPrice(token1, token0, targetTick)
        : getTickToPrice(token0, token1, targetTick);

      if (_newPrice) {
        const limitOrderPrice = _newPrice.toSignificant(8);
        setSellPrice(limitOrderPrice);
        console.log('[SET TO MARKET] Set to nearest valid price:', {
          tickCurrent,
          targetTick,
          rangeWillBe: `[${targetTick}, ${targetTick + tickSpacing}]`,
          tickSpacing,
          zeroToOne,
          distanceFromCurrent: Math.abs(targetTick - tickCurrent),
          direction: zeroToOne ? 'above market' : 'below market',
          price: limitOrderPrice,
        });
      }
    }, [limitOrderPool, token0, token1, tickSpacing, zeroToOne, invertPrice]);

    // Auto-set initial price when tokens are selected
    useEffect(() => {
      if (initialSellPrice && !sellPrice) {
        setSellPrice(initialSellPrice);
      }
    }, [initialSellPrice, sellPrice]);

    // Reset price when tokens change
    useEffect(() => {
      setSellPrice('');
    }, [currencies.INPUT, currencies.OUTPUT]);

    return (
      <Container className="">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-2xl font-medium">Limit Order</h2>
          <button className=" rounded-[1rem] bg-[#2A1F14] hover:bg-[#3A2F24] transition-colors">
            <Settings />
          </button>
        </div>

        {/* Swap Pair Section - Reuse existing component */}
        <div className="flex-1">
          <SwapPairV3
            fromTokenAddress={fromTokenAddress}
            toTokenAddress={toTokenAddress}
            disableSelection={false}
            isUpdatingPriceChart={false}
            staticFromTokenList={undefined}
            staticToTokenList={undefined}
            isInputNative={isInputNative}
            isOutputNative={isOutputNative}
            disableFromSelection={false}
            disableToSelection={false}
          />
        </div>

        {/* Rate Setting Section - New addition for Limit Orders */}
        <div className="mt-4 mb-4 p-4 bg-[#1A0F06] rounded-2xl border border-[#2a2318]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-400">
              Sell {currencies[SwapField.INPUT]?.symbol || 'Token'} at rate
            </span>
            <button
              onClick={setToMarketPrice}
              className="text-sm text-[#4A9EFF] hover:text-[#6AB2FF] font-medium transition-colors"
              title="Sets price to the nearest valid limit order price"
            >
              Set to market
            </button>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 mb-1">
              Buy {currencies[SwapField.OUTPUT]?.symbol || 'Token'}
            </span>
          </div>
          <div
            className={`bg-[#0F0804] rounded-xl p-3 border-2 transition-colors ${
              isRateFocused ? 'border-[#4A9EFF]/30' : 'border-transparent'
            }`}
          >
            <div className="flex justify-between items-center">
              <input
                type="text"
                value={sellPrice}
                onChange={(e) => {
                  setSellPrice(e.target.value);
                }}
                onFocus={() => {
                  setIsRateFocused(true);
                }}
                onBlur={() => setIsRateFocused(false)}
                placeholder="0.00"
                className="bg-transparent text-3xl font-bold text-white outline-none w-full"
              />
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => tickStep(1)}
                  disabled={plusDisabled}
                  className={`w-10 h-10 rounded-lg text-white text-xl font-medium transition-colors flex items-center justify-center ${
                    plusDisabled
                      ? 'bg-[#1A0F06] text-gray-600 cursor-not-allowed'
                      : 'bg-[#2A1F14] hover:bg-[#3A2F24]'
                  }`}
                >
                  +
                </button>
                <button
                  onClick={() => tickStep(-1)}
                  disabled={minusDisabled}
                  className={`w-10 h-10 rounded-lg text-white text-xl font-medium transition-colors flex items-center justify-center ${
                    minusDisabled
                      ? 'bg-[#1A0F06] text-gray-600 cursor-not-allowed'
                      : 'bg-[#2A1F14] hover:bg-[#3A2F24]'
                  }`}
                >
                  −
                </button>
              </div>
            </div>

            {/* Show simulation result in dev mode */}
            {process.env.NEXT_PUBLIC_DEV === 'true' && sellPrice && (
              <div className="mt-2">
                {simulationSuccess && (
                  <div className="text-xs text-green-500 font-medium">
                    ✅ Simulation: Can place order
                  </div>
                )}
                {simulationError && (
                  <div className="text-xs text-red-500 font-medium">
                    ❌ Simulation: {simulationError}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Place Order Button */}
        <LimitOrderButton
          derivedSwap={derivedSwap}
          disabled={blockCreation}
          limitOrderPlugin={isPluginInitialized && isPoolExists}
          token0={token0}
          token1={token1}
          poolAddress={limitOrderPoolAddress}
          sellPrice={sellPrice}
          tickSpacing={tickSpacing}
          wasInverted={false}
          zeroToOne={zeroToOne}
          tick={tick}
          onSuccess={() => {
            if (onOrderPlaced) {
              onOrderPlaced();
            }
          }}
        />
      </Container>
    );
  }
);

export default LimitOrder;
