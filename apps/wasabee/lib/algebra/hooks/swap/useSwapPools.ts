import { Currency, Token, computePoolAddress } from '@cryptoalgebra/sdk';
import { useEffect, useMemo, useState } from 'react';
import { useAllCurrencyCombinations } from './useAllCurrencyCombinations';
import { Address } from 'viem';
import {
  TokenFieldsFragment,
  useMultiplePoolsLazyQuery,
} from '../../graphql/generated/graphql';
import { wallet } from '@honeypot/shared/lib/wallet';
import { useObserver } from 'mobx-react-lite';

/**
 * Returns all the existing pools that should be considered for swapping between an input currency and an output currency
 * @param currencyIn the input currency
 * @param currencyOut the output currency
 */
export function useSwapPools(
  currencyIn?: Currency,
  currencyOut?: Currency
): {
  pools: {
    tokens: [Token, Token];
    pool: {
      address: Address;
      liquidity: string;
      price: string;
      tick: string;
      fee: string;
      token0: TokenFieldsFragment;
      token1: TokenFieldsFragment;
    };
  }[];
  loading: boolean;
} {
  const [existingPools, setExistingPools] = useState<any[]>();
  const { currentChainId, currentChain } = useObserver(() => {
    return {
      currentChainId: wallet.currentChainId,
      currentChain: wallet.currentChain,
    };
  });

  const allCurrencyCombinations = useAllCurrencyCombinations(
    currencyIn,
    currencyOut
  );

  const [getMultiplePools] = useMultiplePoolsLazyQuery();

  useEffect(() => {
    async function getPools() {
      const poolsAddresses = allCurrencyCombinations.map(
        ([tokenA, tokenB]) => {
          try {
            return computePoolAddress({
              tokenA,
              tokenB,
              initCodeHashManualOverride: wallet.currentChain?.contracts?.algebraPoolInitCodeHash,
              poolDeployer: wallet.currentChain?.contracts?.algebraPoolDeployer,
            }) as Address;
          } catch (error) {
            // If computePoolAddress fails, return a dummy address
            console.warn('Failed to compute pool address:', error);
            return '0x0000000000000000000000000000000000000000' as Address;
          }
        }
      );

      const poolsData = await getMultiplePools({
        variables: {
          poolIds: poolsAddresses.map((address) => address.toLowerCase()),
        },
      });

      // const poolsLiquidities = await Promise.allSettled(poolsAddresses.map(address => getAlgebraPool({
      //     address
      // }).read.liquidity()))

      // const poolsGlobalStates = await Promise.allSettled(poolsAddresses.map(address => getAlgebraPool({
      //     address
      // }).read.globalState()))

      const pools =
        poolsData.data &&
        poolsData.data.pools.map((pool) => ({
          address: pool.id,
          liquidity: pool.liquidity,
          price: pool.sqrtPrice,
          tick: pool.tick,
          fee: pool.fee,
          token0: pool.token0,
          token1: pool.token1,
        }));

      setExistingPools(pools);
    }

    Boolean(allCurrencyCombinations.length) && getPools();
  }, [allCurrencyCombinations]);

  return useMemo(() => {
    if (!existingPools)
      return {
        pools: [],
        loading: true,
      };

    return {
      pools: existingPools
        .map((pool) => ({
          tokens: [
            new Token(
              currentChainId,
              pool.token0.id,
              Number(pool.token0.decimals),
              pool.token0.symbol,
              pool.token0.name
            ),
            new Token(
              currentChainId,
              pool.token1.id,
              Number(pool.token1.decimals),
              pool.token1.symbol,
              pool.token1.name
            ),
          ] as [Token, Token],
          pool: pool,
        }))
        .filter(({ pool }) => {
          return pool;
        }),
      loading: false,
    };
  }, [existingPools, currentChainId]);
}
