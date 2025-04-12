import {
  ADDRESS_ZERO,
  Currency,
  DEFAULT_TICK_SPACING,
  Pool,
  Route,
  Token,
} from '@cryptoalgebra/sdk';
import { useMemo } from 'react';
import { useSwapPools } from './useSwapPools';
import { useChainId } from 'wagmi';
import { Address } from 'viem';
import { useUserState } from '../../state/userStore';
import { useObserver } from 'mobx-react-lite';
import { wallet } from '@/services/wallet';

/**
 * Returns true if poolA is equivalent to poolB
 * @param poolA one of the two pools
 * @param poolB the other pool
 */
function poolEquals(poolA: Pool, poolB: Pool): boolean {
  return (
    poolA === poolB ||
    (poolA.token0.equals(poolB.token0) && poolA.token1.equals(poolB.token1))
  );
}

function computeAllRoutes(
  currencyIn: Currency,
  currencyOut: Currency,
  pools: {
    tokens: [Token, Token];
    pool: {
      address: Address;
      liquidity: string;
      price: string;
      tick: string;
      fee: string;
    };
  }[],
  chainId: number,
  currentPath: Pool[] = [],
  allPaths: Route<Currency, Currency>[] = [],
  startCurrencyIn: Currency = currencyIn,
  maxHops = 2
): Route<Currency, Currency>[] {
  const tokenIn = currencyIn?.wrapped;
  const tokenOut = currencyOut?.wrapped;

  if (!tokenIn || !tokenOut) throw new Error('Missing tokenIn/tokenOut');

  for (const pool of pools) {
    const [tokenA, tokenB] = pool.tokens;

    const { liquidity, price, tick, fee } = pool.pool;
    if (price === '0' || liquidity === '0') continue;

    const newPool = new Pool(
      tokenA,
      tokenB,
      Number(fee),
      String(price),
      ADDRESS_ZERO,
      String(liquidity),
      Number(tick),
      Number(DEFAULT_TICK_SPACING)
    );

    if (
      !newPool ||
      !newPool.involvesToken(tokenIn) ||
      currentPath.find((pathPool) => poolEquals(newPool, pathPool))
    )
      continue;

    const outputToken = newPool.token0.equals(tokenIn)
      ? newPool.token1
      : newPool.token0;
    if (outputToken.equals(tokenOut)) {
      allPaths.push(
        new Route([...currentPath, newPool], startCurrencyIn, currencyOut)
      );
    } else if (maxHops > 1) {
      computeAllRoutes(
        outputToken,
        currencyOut,
        pools,
        chainId,
        [...currentPath, newPool],
        allPaths,
        startCurrencyIn,
        maxHops - 1
      );
    }
  }

  return allPaths;
}

/**
 * Returns all the routes from an input currency to an output currency
 * @param currencyIn the input currency
 * @param currencyOut the output currency
 */
export function useAllRoutes(
  currencyIn?: Currency,
  currencyOut?: Currency
): { loading: boolean; routes: Route<Currency, Currency>[] } {
  const { currentChainId } = useObserver(() => ({
    currentChainId: wallet.currentChainId,
  }));

  const { pools, loading: poolsLoading } = useSwapPools(
    currencyIn,
    currencyOut
  );

  const { isMultihop } = useUserState();

  return useMemo(() => {
    if (
      poolsLoading ||
      !currentChainId ||
      !pools ||
      !currencyIn ||
      !currencyOut
    )
      return {
        loading: true,
        routes: [],
      };

    // Hack
    // const singleIfWrapped = (currencyIn.isNative || currencyOut.isNative)

    const routes = computeAllRoutes(
      currencyIn,
      currencyOut,
      pools,
      currentChainId,
      [],
      [],
      currencyIn,
      isMultihop ? 3 : 1
    );

    return { loading: false, routes };
  }, [
    currentChainId,
    currencyIn,
    currencyOut,
    pools,
    poolsLoading,
    isMultihop,
  ]);
}
