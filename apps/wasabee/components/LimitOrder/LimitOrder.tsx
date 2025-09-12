import React, { useState, useMemo, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useObserver } from 'mobx-react-lite';
import SwapPairV3 from '../multichain-design/swap/SwapPair/SwapPairV3';
import SwapParamsV3 from '../multichain-design/swap/SwapParams/SwapParamsV3';
import Container from '../multichain-design/Container';
import Settings from '../multichain-design/Buttons/SettingButton';
import { wallet } from '@honeypot/shared/lib/wallet';
import {
  useDerivedSwapInfo,
  useSwapState,
} from '@/lib/algebra/state/swapStore';
import { SwapField } from '@/types/algebra/types/swap-field';
import {
  computeCustomPoolAddress,
  getTickToPrice,
  TickMath,
  TradeType,
  WNATIVE,
} from '@cryptoalgebra/sdk';
import BigNumber from 'bignumber.js';
import { usePool } from '@/lib/algebra/hooks/pools/usePool';
import { useCurrency } from '@/lib/algebra/hooks/common/useCurrency';
import { Address } from 'viem';

interface LimitOrderProps {
  fromTokenAddress?: string;
  toTokenAddress?: string;
  isInputNative?: boolean;
  isOutputNative?: boolean;
}

const LimitOrder = observer(
  ({
    fromTokenAddress,
    toTokenAddress,
    isInputNative = false,
    isOutputNative = false,
  }: LimitOrderProps) => {
    const [sellRate, setSellRate] = useState<string>('');
    const [isRateFocused, setIsRateFocused] = useState(false);

    // Use MobX observer to properly track wallet connection state
    const poolDeployerAddress = useObserver(
      () => wallet.currentChain.contracts.algebraPoolDeployer
    );
    const walletAddress = useObserver(() => wallet.account);
    const token0 = useCurrency(fromTokenAddress as Address);
    const token1 = useCurrency(toTokenAddress as Address);

    const { currencies, tradeState } = useDerivedSwapInfo();
    const { typedValue, independentField } = useSwapState();
    const baseCurrency = currencies[SwapField.INPUT];
    const quoteCurrency = currencies[SwapField.OUTPUT];
    const showWrap =
      token0?.wrapped?.equals(WNATIVE[wallet.currentChain.chainId]) &&
      token1?.wrapped.equals(WNATIVE[wallet.currentChain.chainId]);
    const limitOrderPoolAddress =
      token0 && token1 && !showWrap && poolDeployerAddress
        ? (computeCustomPoolAddress({
            tokenA: token0.wrapped,
            tokenB: token1.wrapped,
            customPoolDeployer: poolDeployerAddress,
          }) as Address)
        : undefined;

    const [limitOrderPoolExists, limitOrderPool] = usePool(
      limitOrderPoolAddress
    );

    const invertPrice = Boolean(
      currencies[SwapField.INPUT] &&
        token0 &&
        !currencies[SwapField.INPUT]?.wrapped.equals(token0)
    );

    // Get the trade object to calculate execution price
    const trade = tradeState?.trade;

    const initialSellPrice = useMemo(() => {
      if (!limitOrderPool) return '';

      const { tickCurrent, tickSpacing } = limitOrderPool;

      const targetTick = invertPrice
        ? Math.max(tickCurrent - tickSpacing, TickMath.MIN_TICK)
        : Math.min(tickCurrent + tickSpacing, TickMath.MAX_TICK);

      const _newPrice = invertPrice
        ? getTickToPrice(token1?.wrapped, token0?.wrapped, targetTick)
        : getTickToPrice(token0?.wrapped, token1?.wrapped, targetTick);

      return _newPrice?.toSignificant(8);
    }, [limitOrderPool, token0, token1, invertPrice]);

    // Get current market price from pool - removed since we're using trade execution price
    // The pool lookup was causing RPC errors with wrapped token objects

    // Calculate market price from the swap trade execution price
    const marketPrice = useMemo(() => {
      if (!trade) return '0';

      try {
        // Get execution price from the trade object
        const executionPrice = trade.executionPrice;

        // The execution price shows output/input ratio
        // For exact input trades: how much output you get per input
        // For exact output trades: how much input needed per output
        if (trade.tradeType === TradeType.EXACT_INPUT) {
          return executionPrice.toSignificant(6);
        } else {
          // For exact output, we need to invert the price
          return executionPrice.invert().toSignificant(6);
        }
      } catch (error) {
        console.error('Error calculating market price:', error);
        return '0';
      }
    }, [trade]);

    const handleSetToMarket = useCallback(() => {
      if (marketPrice !== '0') {
        setSellRate(initialSellPrice || '0');
      }
    }, [marketPrice]);

    const handlePlaceOrder = useCallback(() => {
      // This will be connected to contract functions later
      // Get the actual amounts from the swap inputs
      const sellAmount =
        independentField === SwapField.INPUT
          ? typedValue
          : trade?.inputAmount?.toExact();
      const buyAmount =
        independentField === SwapField.OUTPUT
          ? typedValue
          : trade?.outputAmount?.toExact();

      // Get the token addresses - handle both wrapped and native tokens
      const sellTokenAddress = baseCurrency?.isNative
        ? baseCurrency?.wrapped?.address
        : baseCurrency?.address;
      const buyTokenAddress = quoteCurrency?.isNative
        ? quoteCurrency?.wrapped?.address
        : quoteCurrency?.address;

      const orderData = {
        sellToken: sellTokenAddress,
        buyToken: buyTokenAddress,
        sellAmount: sellAmount,
        buyAmount: buyAmount,
        sellRate: sellRate,
      };
      console.log('Limit Order Data:', orderData);
    }, [
      baseCurrency,
      quoteCurrency,
      sellRate,
      typedValue,
      independentField,
      trade,
    ]);

    const increaseRate = () => {
      const current = parseFloat(sellRate) || 0;
      const increment = current * 0.01 || 1; // 1% increment or 1 if rate is 0
      setSellRate((current + increment).toFixed(6));
    };

    const decreaseRate = () => {
      const current = parseFloat(sellRate) || 0;
      const decrement = current * 0.01 || 1; // 1% decrement or 1 if rate is 0
      if (current > decrement) {
        setSellRate((current - decrement).toFixed(6));
      }
    };

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
              Sell {baseCurrency?.symbol || 'Token'} at rate
            </span>
            <button
              onClick={handleSetToMarket}
              className="text-sm text-[#4A9EFF] hover:text-[#6AB2FF] font-medium transition-colors"
            >
              Set to market
            </button>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 mb-1">
              Buy {quoteCurrency?.symbol || 'Token'}
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
                value={sellRate}
                onChange={(e) => setSellRate(e.target.value)}
                onFocus={() => setIsRateFocused(true)}
                onBlur={() => setIsRateFocused(false)}
                placeholder="0.00"
                className="bg-transparent text-3xl font-bold text-white outline-none w-full"
              />
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={increaseRate}
                  className="w-10 h-10 bg-[#2A1F14] hover:bg-[#3A2F24] rounded-lg text-white text-xl font-medium transition-colors flex items-center justify-center"
                >
                  +
                </button>
                <button
                  onClick={decreaseRate}
                  className="w-10 h-10 bg-[#2A1F14] hover:bg-[#3A2F24] rounded-lg text-white text-xl font-medium transition-colors flex items-center justify-center"
                >
                  −
                </button>
              </div>
            </div>
            {marketPrice !== '0' && (
              <div className="text-xs text-gray-500 mt-2">
                Market rate: {marketPrice} {quoteCurrency?.symbol || ''}
              </div>
            )}
          </div>
        </div>

        {/* Place Order Button */}
        <button
          onClick={handlePlaceOrder}
          className={`w-full mt-4 py-4 rounded-2xl font-semibold text-lg transition-all ${
            walletAddress &&
            sellRate &&
            baseCurrency &&
            quoteCurrency &&
            typedValue
              ? 'bg-gradient-to-r from-[#FFA931] to-[#FFD131] hover:from-[#FFB951] hover:to-[#FFE151] text-black'
              : 'bg-[#2A1F14] text-gray-500 cursor-not-allowed'
          }`}
          disabled={
            !walletAddress ||
            !sellRate ||
            !baseCurrency ||
            !quoteCurrency ||
            !typedValue
          }
        >
          {!walletAddress
            ? 'Connect Wallet'
            : !baseCurrency || !quoteCurrency
            ? 'Select Tokens'
            : !typedValue
            ? 'Enter Amount'
            : !sellRate
            ? 'Set Limit Price'
            : 'Place Limit Order'}
        </button>
      </Container>
    );
  }
);

export default LimitOrder;
