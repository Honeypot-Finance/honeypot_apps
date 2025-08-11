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
import { wallet } from '@honeypot/shared/lib/wallet';

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

  // Log once at the start
  if (currentPath.length === 0) {
    console.log('Starting route computation:', {
      tokenIn: `${tokenIn.symbol} (${tokenIn.address})`,
      tokenOut: `${tokenOut.symbol} (${tokenOut.address})`,
      poolsToCheck: pools.length
    });
  }

  for (const pool of pools) {
    const [tokenA, tokenB] = pool.tokens;

    const { liquidity, price, tick, fee } = pool.pool;
    
    if (!price || price === '0' || !liquidity || liquidity === '0') {
      console.log(`Skipping pool ${tokenA.symbol}/${tokenB.symbol} - price: ${price}, liquidity: ${liquidity}`);
      continue;
    }

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

    const involvesTokenIn = newPool.involvesToken(tokenIn);
    
    if (!involvesTokenIn) {
      // Log why pool was skipped
      if (currentPath.length === 0) {
        console.log(`Pool ${tokenA.symbol}/${tokenB.symbol} doesn't involve ${tokenIn.symbol}`);
      }
      continue;
    }

    if (currentPath.find((pathPool) => poolEquals(newPool, pathPool))) {
      continue;
    }

    const outputToken = newPool.token0.equals(tokenIn)
      ? newPool.token1
      : newPool.token0;
      
    console.log(`Pool ${tokenA.symbol}/${tokenB.symbol} routes ${tokenIn.symbol} to ${outputToken.symbol}`);
    
    if (outputToken.equals(tokenOut)) {
      console.log(`Found direct route: ${tokenIn.symbol} -> ${outputToken.symbol}`);
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

    console.log('Computing routes:', {
      currencyIn: currencyIn.symbol,
      currencyOut: currencyOut.symbol,
      poolsCount: pools.length,
      pools: pools.map(p => ({
        tokens: `${p.tokens[0].symbol}/${p.tokens[1].symbol}`,
        liquidity: p.pool.liquidity,
        hasLiquidity: p.pool.liquidity !== '0'
      }))
    });

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

    console.log(`Generated ${routes.length} routes`);
    if (routes.length > 0) {
      console.log('Routes:', routes.map(r => 
        r.pools.map(p => `${p.token0.symbol}/${p.token1.symbol}`).join(' -> ')
      ));
    }

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
