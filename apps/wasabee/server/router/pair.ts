import { factoryABI } from '@/lib/abis/factory';

import { publicProcedure, router } from '../trpc';
import z from 'zod';
import { pairByTokensLoader, tokenLoader } from '@/lib/dataloader/pair';
import { Address, getContract } from 'viem';
import { createPublicClientByChain } from '@/lib/client';
import IUniswapV2Pair from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import PQueue from 'p-queue';
import { networksMap } from '@honeypot/shared/config/chains/network';
import { kv } from '@/lib/kv';
import { pairQueryOutput } from '@/types/pair';
import { indexer } from '@/services/indexer/indexer';
import { cacheProvider, getCacheKey } from '@/lib/server/cache';
import { getCacheKey as getKvCacheKey } from '@/lib/cache';

interface Pair {
  id: string;
  token0: Token;
  token1: Token;
  reserve0: string;
  reserve1: string;
}

interface Token {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
}

const queue = new PQueue({ concurrency: 10 });

export const pairRouter = router({
  getPairByTokens: publicProcedure
    .input(
      z.object({
        chainId: z.number(),
        token0Address: z.string(),
        token1Address: z.string(),
      })
    )
    .output(
      z
        .object({
          address: z.string(),
          token0: z.object({
            address: z.string(),
            name: z.string(),
            symbol: z.string(),
            decimals: z.number(),
          }),
          token1: z.object({
            address: z.string(),
            name: z.string(),
            symbol: z.string(),
            decimals: z.number(),
          }),
          reserve0: z.string(),
          reserve1: z.string(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return cacheProvider.getOrSet(
        getCacheKey('getPairByTokens', input),
        async () => {
          const { token0Address, token1Address } = input;
          const res = await indexer.getPairByTokens({
            token0: token0Address,
            token1: token1Address,
          });
          return res;
        }
      );
    }),
  getPairs: publicProcedure
    .input(
      z.object({
        chainId: z.number(),
        blackListAddress: z.array(z.string().startsWith('0x')).optional(),
      })
    )
    .query(async ({ input }): Promise<pairQueryOutput> => {
      return cacheProvider.getOrSet(
        getCacheKey('getPairs', input),
        async () => {
          const { chainId } = input;
          const currentNetwork = networksMap[chainId];
          const factoryContract = getContract({
            address: currentNetwork.contracts.algebraFactory as `0x${string}`,
            abi: factoryABI,
            // 1a. Insert a single client
            client: {
              public: createPublicClientByChain(currentNetwork.chain),
            },
          });
          const length = Number(
            ((await factoryContract.read.allPairsLength()) as BigInt).toString()
          );
          if (!length) {
            return {};
          }
          //console.log("total pairs", length);
          // await kv.del(getCacheKey(chainId, 'allPairs'));
          const allPairs =
            (await kv.get<Record<string, any>>(
              getKvCacheKey(chainId, 'allPairs')
            )) || {};
          // console.log(getCacheKey(chainId, 'allPairs'), allPairs)
          Array.from({ length: Number(length) }).forEach(async (_, index) => {
            await queue.add(async () => {
              const pair = allPairs?.[index];
              if (!pair) {
                try {
                  const pairAddress = await factoryContract.read.allPairs([
                    BigInt(index),
                  ]);

                  const pairContract = getContract({
                    address: pairAddress as `0x${string}`,
                    abi: IUniswapV2Pair.abi,
                    client: {
                      public: createPublicClientByChain(currentNetwork.chain),
                    },
                  });
                  const [token0, token1] = await Promise.all([
                    pairContract.read.token0(),
                    pairContract.read.token1(),
                  ]);

                  const tokens = await Promise.all([
                    tokenLoader.load({
                      address: token0 as `0x${string}`,
                      chainId: Number(chainId),
                    }),
                    tokenLoader.load({
                      address: token1 as `0x${string}`,
                      chainId: Number(chainId),
                    }),
                  ]);
                  const pair = {
                    address: pairAddress,
                    token0: tokens[0],
                    token1: tokens[1],
                  };

                  if (
                    input.blackListAddress?.includes(pair.address) ||
                    input.blackListAddress?.includes(pair.token0.address) ||
                    input.blackListAddress?.includes(pair.token1.address)
                  ) {
                    return null;
                  }

                  allPairs[index] = pair;
                } catch (error) {
                  console.error(error);
                }
              }
              return pair;
            });
          });
          await queue.onIdle();
          await kv.set(getKvCacheKey(chainId, 'allPairs'), allPairs);

          return allPairs;
        }
      );
    }),
});
