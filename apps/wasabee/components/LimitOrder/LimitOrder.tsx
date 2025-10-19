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
import { Address } from 'viem';
import { LimitOrderButton } from './LimitOrderButton/index';
import { usePublicClient } from 'wagmi';

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

    const [sellPrice, setSellPrice] = useState<string>('');
    const [wasInverted, setWasInverted] = useState(false);
    const [isRateFocused, setIsRateFocused] = useState(false);
    const [poolPlugin, setPoolPlugin] = useState<Address | null>(null);
    const [isPluginInitialized, setIsPluginInitialized] = useState(false);

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

      // Determine the correct tick direction based on which token we're selling
      // If selling token0 (zeroToOne=true), we need tick above current
      // If selling token1 (zeroToOne=false), we need tick below current
      const targetTick = zeroToOne
        ? Math.min(tickCurrent + tickSpacing, TickMath.MAX_TICK)
        : Math.max(tickCurrent - tickSpacing, TickMath.MIN_TICK);

      const _newPrice = invertPrice
        ? getTickToPrice(token1, token0, targetTick)
        : getTickToPrice(token0, token1, targetTick);

      return _newPrice?.toSignificant(8);
    }, [limitOrderPool, token0, token1, invertPrice, currencies, zeroToOne]);

    const isPoolExists = limitOrderPoolExists === PoolState.EXISTS;
    const tick = limitOrderPool?.tickCurrent;
    const tickSpacing = limitOrderPool?.tickSpacing;

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
        if (!poolPlugin || !limitOrderPoolAddress || !publicClient || !limitOrderManagerAddress) {
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
    }, [poolPlugin, limitOrderPoolAddress, publicClient, limitOrderManagerAddress]);


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
        ? wasInverted
          ? tryParseTick(token0, token1, sellPrice.toString(), tickSpacing)
          : tryParseTick(token1, token0, sellPrice.toString(), tickSpacing)
        : wasInverted
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
          message: 'Sell price must be above current price when selling token0',
        };
      }

      if (
        currencies.INPUT.wrapped.equals(token1.wrapped) &&
        priceTick >= tick
      ) {
        return {
          blockCreation: true,
          message: 'Sell price must be below current price when selling token1',
        };
      }

      return { blockCreation: false, message: '' };
    }, [
      token0,
      token1,
      currencies,
      invertPrice,
      sellPrice,
      tick,
      wasInverted,
      tickSpacing,
    ]);


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
        ? wasInverted
          ? tryParseTick(token0, token1, sellPrice.toString(), tickSpacing)
          : tryParseTick(token1, token0, sellPrice.toString(), tickSpacing)
        : wasInverted
        ? tryParseTick(token1, token0, sellPrice.toString(), tickSpacing)
        : tryParseTick(token0, token1, sellPrice.toString(), tickSpacing);

      if (priceTick === undefined) {
        return [true, true];
      }

      if (
        currencies.INPUT.wrapped.equals(token0.wrapped) &&
        priceTick - tickSpacing <= tick
      )
        return wasInverted ? [true, false] : [false, true];

      if (
        currencies.INPUT.wrapped.equals(token1.wrapped) &&
        priceTick + tickSpacing >= tick - tickSpacing
      )
        return wasInverted ? [true, false] : [false, true];

      return [false, false];
    }, [
      token0,
      token1,
      currencies,
      invertPrice,
      sellPrice,
      tick,
      wasInverted,
      tickSpacing,
    ]);

    const handleSetSellPrice = useCallback(
      (value: string, invert = false) => {
        const tick = tryParseTick(token0, token1, value, tickSpacing);

        const newPrice = getTickToPrice(token0, token1, tick);

        if (!newPrice) {
          setSellPrice('');
          return;
        }

        const limitOrderPrice = invert
          ? newPrice.invert().toSignificant(8)
          : newPrice.toSignificant(8);

        setSellPrice(limitOrderPrice);
      },
      [token0, token1, tickSpacing]
    );

    const setToMarketPrice = useCallback(
      (invert: boolean) => {
        if (!initialSellPrice) return;
        handleSetSellPrice(initialSellPrice, invert);
      },
      [initialSellPrice, handleSetSellPrice]
    );

    useEffect(() => {
      if (initialSellPrice && !sellPrice) {
        setSellPrice(initialSellPrice);
      }
    }, [initialSellPrice, sellPrice]); // Removed invertPrice to prevent re-triggering

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
              onClick={() => setToMarketPrice(false)}
              className="text-sm text-[#4A9EFF] hover:text-[#6AB2FF] font-medium transition-colors"
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
            {initialSellPrice && (
              <div className="text-xs text-gray-500 mt-2">
                Market rate: {initialSellPrice}{' '}
                {currencies[SwapField.OUTPUT]?.symbol || ''}
              </div>
            )}
          </div>
        </div>

        {/* Invert Price Button */}
        <button
          onClick={() => {
            if (sellPrice) {
              handleSetSellPrice(sellPrice, true);
              setWasInverted(!wasInverted);
            }
          }}
          disabled={
            showWrap || !isPoolExists || !isPluginInitialized || !sellPrice
          }
          className={`w-full mb-2 py-2 rounded-xl text-sm transition-all ${
            showWrap || !isPoolExists || !isPluginInitialized || !sellPrice
              ? 'bg-[#1A0F06] text-gray-600 cursor-not-allowed'
              : 'bg-[#2A1F14] hover:bg-[#3A2F24] text-white'
          }`}
        >
          Invert Price
        </button>

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
          wasInverted={wasInverted}
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
