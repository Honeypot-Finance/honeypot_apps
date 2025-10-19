import { usePool } from '@/lib/algebra/hooks/pools/usePool';
import { Currency, CurrencyAmount, Position, ZERO } from '@cryptoalgebra/sdk';
import { useMemo } from 'react';
import { Address } from 'viem';

export function useLimitOrderInfo(
  poolAddress: Address | undefined,
  amount: CurrencyAmount<Currency> | undefined,
  limitOrderTick: number | undefined,
  tickSpacing?: number
) {
  const [, pool] = usePool(poolAddress);

  return useMemo(() => {
    if (!amount || !pool || typeof limitOrderTick !== 'number')
      return undefined;

    const amount0 = amount.currency.wrapped.equals(pool.token0)
      ? amount.quotient
      : ZERO;
    const amount1 = amount.currency.wrapped.equals(pool.token1)
      ? amount.quotient
      : ZERO;

    if (amount0 !== undefined && amount1 !== undefined) {
      // Use tickSpacing if provided, otherwise use pool's tickSpacing, fallback to 60
      const spacing = tickSpacing ?? pool.tickSpacing ?? 60;

      // Ensure tick is aligned to spacing
      const alignedTickLower = Math.round(limitOrderTick / spacing) * spacing;
      const alignedTickUpper = alignedTickLower + spacing;

      console.log('Position calculation:', {
        originalTick: limitOrderTick,
        alignedTickLower,
        alignedTickUpper,
        spacing,
        poolTickCurrent: pool.tickCurrent,
      });

      return Position.fromAmounts({
        pool,
        tickLower: alignedTickLower,
        tickUpper: alignedTickUpper,
        amount0,
        amount1,
        useFullPrecision: true,
      });
    } else {
      return undefined;
    }
  }, [limitOrderTick, amount, pool, tickSpacing]);
}
