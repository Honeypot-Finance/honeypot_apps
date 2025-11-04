import { useInfoTickData } from '@/lib/algebra/hooks/pools/usePoolTickData';

import {
  CurrencyAmount,
  Pool,
  Token,
  TickMath,
  Price,
  Currency,
  ADDRESS_ZERO,
} from '@cryptoalgebra/sdk';
import { useEffect, useMemo, useState } from 'react';
import { Chart } from './chart';
import { Skeleton } from '@/components/algebra/ui/skeleton';
import { MAX_UINT128 } from '@/config/algebra/max-uint128';
import { useMintState, Presets } from '@/lib/algebra/state/mintStore';
interface LiquidityChartProps {
  currencyA: Currency | undefined;
  currencyB: Currency | undefined;
  currentPrice: number | undefined;
  priceLower: Price<Token, Token> | undefined;
  priceUpper: Price<Token, Token> | undefined;
}

// const ZOOM_STEP = 5

const LiquidityChart = ({
  currencyA,
  currencyB,
  currentPrice,
  priceLower,
  priceUpper,
}: LiquidityChartProps) => {
  const { preset } = useMintState();

  const [processedData, setProcessedData] = useState<any>(null);

  const [zoom, setZoom] = useState(50);

  const {
    fetchTicksSurroundingPrice: { ticksResult, fetchTicksSurroundingPrice },
  } = useInfoTickData();

  useEffect(() => {
    if (!currencyA || !currencyB) return;
    fetchTicksSurroundingPrice(currencyA, currencyB);
  }, [currencyA, currencyB]);

  useEffect(() => {
    if (!ticksResult || !ticksResult.ticksProcessed) return;

    async function processTicks() {
      if (!ticksResult) return;

      const _data = await Promise.all(
        ticksResult.ticksProcessed.map(async (t, i) => {
          const active = t.tickIdx === ticksResult.activeTickIdx;
          const sqrtPriceX96 = TickMath.getSqrtRatioAtTick(t.tickIdx);
          const mockTicks = [
            {
              index: Number(t.tickIdx) - Number(ticksResult.tickSpacing),
              liquidityGross: t.liquidityGross.toString(),
              liquidityNet: (t.liquidityNet * BigInt(1)).toString(),
            },
            {
              index: t.tickIdx,
              liquidityGross: t.liquidityGross.toString(),
              liquidityNet: t.liquidityNet.toString(),
            },
          ];

          let pool;

          try {
            pool =
              currencyA &&
              currencyB &&
              !(t.liquidityActive === BigInt(0)) &&
              new Pool(
                currencyA.wrapped,
                currencyB.wrapped,
                100,
                sqrtPriceX96,
                ADDRESS_ZERO,
                t.liquidityActive.toString(),
                t.tickIdx,
                ticksResult.tickSpacing,
                mockTicks
              );
          } catch (e) {
            console.error(e);
          }

          const nextSqrtX96 = ticksResult.ticksProcessed[i - 1]
            ? TickMath.getSqrtRatioAtTick(
                ticksResult.ticksProcessed[i - 1].tickIdx
              )
            : undefined;

          const maxAmountToken0 = currencyA
            ? CurrencyAmount.fromRawAmount(
                currencyA.wrapped,
                MAX_UINT128.toString()
              )
            : undefined;

          const outputRes0 =
            pool && maxAmountToken0
              ? await pool.getOutputAmount(maxAmountToken0, nextSqrtX96)
              : undefined;

          const token1Amount = outputRes0?.[0] as
            | CurrencyAmount<Token>
            | undefined;

          const amount0 = token1Amount
            ? parseFloat(token1Amount.toExact()) * parseFloat(t.price1)
            : 0;
          const amount1 = token1Amount ? parseFloat(token1Amount.toExact()) : 0;

          return {
            index: i,
            isCurrent: active,
            activeLiquidity: parseFloat(t.liquidityActive.toString()),
            price0: parseFloat(t.price0),
            price1: parseFloat(t.price1),
            tvlToken0: amount0,
            tvlToken1: amount1,
          };
        })
      );
      setProcessedData(_data);
    }

    processTicks();
  }, [ticksResult]);

  useEffect(() => {
    if (preset === null) return;
    switch (preset) {
      case Presets.FULL.toString():
        setZoom(10);
        break;
      case Presets.NORMAL.toString():
        setZoom(25);
        break;
      case Presets.RISK.toString():
        setZoom(30);
        break;
      case Presets.SAFE.toString():
        setZoom(15);
        break;
      case Presets.STABLE.toString():
        setZoom(40);
        break;
    }
  }, [preset]);

  const formattedData = useMemo(() => {
    if (!processedData) return undefined;
    if (processedData && processedData.length === 0) return undefined;

    const middle = Math.round(processedData.length / 2);
    const chunkLength = Math.round(processedData.length / zoom);

    const slicedData = processedData.slice(
      middle - chunkLength,
      middle + chunkLength
    );

    return slicedData.reverse();
  }, [processedData, zoom]);

  const isSorted =
    currencyA &&
    currencyB &&
    currencyA?.wrapped.sortsBefore(currencyB?.wrapped);

  const leftPrice = useMemo(() => {
    return isSorted
      ? priceLower?.toSignificant(18)
      : priceUpper?.invert().toSignificant(18);
  }, [isSorted, priceLower, priceUpper]);

  const rightPrice = useMemo(() => {
    return isSorted
      ? priceUpper?.toSignificant(18)
      : priceLower?.invert().toSignificant(18);
  }, [isSorted, priceLower, priceUpper]);

  // const isZoomMin = zoom - ZOOM_STEP <= 10
  // const isZoomMax = zoom + ZOOM_STEP > 40

  // const handleZoomIn = () => setZoom((zoom) => zoom + ZOOM_STEP)
  // const handleZoomOut = () => setZoom((zoom) => zoom - ZOOM_STEP)

  return (
    <div className="w-full rounded-2xl bg-[#1F150A]  p-4">
      <div className="flex w-full h-full">
        {formattedData ? (
          <Chart
            formattedData={formattedData}
            leftPrice={leftPrice}
            rightPrice={rightPrice}
            currentPrice={currentPrice}
            isSorted={isSorted}
            zoom={zoom}
            currencyA={currencyA}
            currencyB={currencyB}
          />
        ) : (
          <LiquidityChartLoader />
        )}
      </div>
    </div>
  );
};

const LiquidityChartLoader = () => (
  <div className="flex items-end gap-4 w-full h-[250px]">
    <Skeleton className="w-[40px] h-[120px] bg-white/10" />
    <Skeleton className="w-[40px] h-[130px] bg-white/10" />
    <Skeleton className="w-[40px] h-[160px] bg-white/10" />
    <Skeleton className="w-[40px] h-[130px] bg-white/10" />
    <Skeleton className="w-[40px] h-[120px] bg-white/10" />
    <Skeleton className="w-[40px] h-[160px] bg-white/10" />
    <Skeleton className="w-[40px] h-[200px] bg-white/10" />
    <Skeleton className="w-[40px] h-[140px] bg-white/10" />
    <Skeleton className="w-[40px] h-[130px] bg-white/10" />
    <Skeleton className="w-[40px] h-[120px] bg-white/10" />
    <Skeleton className="w-[40px] h-[140px] bg-white/10" />
    <Skeleton className="w-[40px] h-[120px] bg-white/10" />
    <Skeleton className="w-[40px] h-[190px] bg-white/10" />
  </div>
);

export default LiquidityChart;
