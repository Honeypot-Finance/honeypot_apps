import {
  PoolsByTokenPairQuery,
  PoolsByTokenPairDocument,
  PoolsByTokenPairQueryVariables,
  UserActivePositionsDocument,
  UserActivePositionsQuery,
  UserActivePositionsQueryVariables,
  useUserActivePositionsQuery,
  Pool,
  SinglePoolQuery,
  SinglePoolQueryVariables,
  SinglePoolDocument,
  PoolsByTokenPairBatchQuery,
  PoolsByTokenPairBatchQueryVariables,
  PoolsByTokenPairBatchDocument,
} from '../generated/graphql';
import { Address, getContract } from 'viem';
import { useEffect, useState } from 'react';
import { MAX_UINT128 } from '../../../config/algebra/max-uint128';
import { wallet } from '../../wallet/wallet';
import { CurrencyAmount, Token as AlgebranToken } from '@cryptoalgebra/sdk';
import { unwrappedToken } from '@cryptoalgebra/sdk';
import BigNumber from 'bignumber.js';
import { PairContract } from '../../contract/dex/liquidity/pair-contract';
import { Token } from '../../contract/token/token';
import {
  useSubgraphClient,
  getSubgraphClientByChainId,
} from './../../../hooks/useSubgraphClients';
import { ApolloClient } from '@apollo/client';
import { createClientHook } from '../clientUtils';
import { useObserver } from 'mobx-react-lite';
import { calculatePercentageChange } from '../../utils/calculatePercentageChange';
import { algebraPositionManagerABI } from '../../abis/algebra-contracts/ABIs';
import { algebraPositionManagerAddress } from '../../../wagmi-generated';

let poolsByTokenPairRequestIds: string[] = [];
let poolsByTokenPairRequestTimeout: NodeJS.Timeout | null = null;
let poolsByTokenPairRequestResolvers: ((pools: Pool[]) => void)[] = [];

const bulkGetPoolsByTokenPair = async (tokens: string[]): Promise<Pool[]> => {
  poolsByTokenPairRequestIds.push(...tokens);

  return new Promise((resolve) => {
    poolsByTokenPairRequestResolvers.push(resolve);

    if (poolsByTokenPairRequestTimeout) {
      clearTimeout(poolsByTokenPairRequestTimeout);
    }

    poolsByTokenPairRequestTimeout = setTimeout(async () => {
      const idsToFetch = [...new Set(poolsByTokenPairRequestIds)]; // de-dupe
      const multipleTokenData = await getPoolsByTokenPairBatch(idsToFetch);

      // Clear queue before resolving
      poolsByTokenPairRequestIds = [];
      poolsByTokenPairRequestTimeout = null;

      // Resolve all waiting promises
      for (const r of poolsByTokenPairRequestResolvers) {
        r(multipleTokenData);
      }

      poolsByTokenPairRequestResolvers = [];
    }, 300);
  });
};

export const poolQueryToContract = (pool: Pool): PairContract => {
  const pairContract = new PairContract({
    address: pool.id as Address,
    TVL_USD: pool.totalValueLockedUSD,
  });

  pairContract.token0 = Token.getToken({
    address: pool.token0.id,
    decimals: pool.token0.decimals,
    name: pool.token0.name,
    symbol: pool.token0.symbol,
    chainId: wallet.currentChainId.toString(),
  });

  pairContract.token1 = Token.getToken({
    address: pool.token1.id,
    decimals: pool.token1.decimals,
    name: pool.token1.name,
    symbol: pool.token1.symbol,
    chainId: wallet.currentChainId.toString(),
  });

  pairContract.volume_24h_USD = 0;
  pairContract.fees_24h_USD = 0;
  pairContract.apr_24h = 0;
  pairContract.volumeChange24h = 0;

  return pairContract;
};

export const poolsByTokenPair = async (
  client: ApolloClient<any>,
  token0: string,
  token1: string
) => {
  const pools = await bulkGetPoolsByTokenPair([token0, token1]);
  return pools.filter(
    (pool) =>
      (pool.token0.id === token0 && pool.token1.id === token1) ||
      (pool.token0.id === token1 && pool.token1.id === token0)
  );
};

export const userPools = async (
  client: ApolloClient<any>,
  userAddress: string
) => {
  const { data } = await client.query<
    UserActivePositionsQuery,
    UserActivePositionsQueryVariables
  >({
    query: UserActivePositionsDocument,
    variables: { account: userAddress.toLowerCase() },
  });

  const pools = data?.positions.map((position) => position.pool);

  return pools;
};

export const usePoolsClient = createClientHook(
  () => useSubgraphClient('algebra_info'),
  {
    poolsByTokenPair,
    userPools,
  }
);

export const useUserPools = (userAddress: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [fetchedPositions, setFetchedPositions] = useState<string[]>([]);
  const { currentChainId } = useObserver(() => ({
    currentChainId: wallet.currentChainId,
  }));
  const { data, loading, refetch } = useUserActivePositionsQuery({
    variables: { account: userAddress.toLowerCase() },
    //fetchPolicy: "cache-and-network",
    //notifyOnNetworkStatusChange: true,
    // pollInterval: 10000,
    onError: (error) => {
      setTimeout(() => {
        refetch();
      }, 1000);
    },
  });

  const [pools, setPools] = useState<
    Record<string, Pool & { fees: BigNumber; userTVLUSD: BigNumber }>
  >({});

  const algebraPositionManager = getContract({
    address:
      algebraPositionManagerAddress[
        currentChainId as keyof typeof algebraPositionManagerAddress
      ],
    abi: algebraPositionManagerABI,
    client: { public: wallet.publicClient, wallet: wallet.walletClient },
  });

  useEffect(() => {
    if (!data || !wallet.isInit || !algebraPositionManager.simulate) return;
    data.positions.forEach(async (position) => {
      if (fetchedPositions.includes(position.pool.id.concat('-', position.id)))
        return;
      try {
        const pool = position.pool;
        const {
          result: [fees0, fees1],
        } = await algebraPositionManager.simulate.collect([
          {
            tokenId: BigInt(position.id),
            recipient: wallet.account as `0x${string}`,
            amount0Max: MAX_UINT128,
            amount1Max: MAX_UINT128,
          },
        ]);

        const userTVLUSD =
          Number(position.depositedToken0 - position.withdrawnToken0) *
            Number(pool.token0.derivedUSD) +
          Number(position.depositedToken1 - position.withdrawnToken1) *
            Number(pool.token1.derivedUSD);

        const fees0USD = CurrencyAmount.fromRawAmount(
          unwrappedToken(
            new AlgebranToken(
              wallet.currentChainId,
              pool.token0.id,
              Number(pool.token0.decimals),
              pool.token0.symbol,
              pool.token0.name
            )
          ),
          fees0.toString()
        );

        const fees1USD = CurrencyAmount.fromRawAmount(
          unwrappedToken(
            new AlgebranToken(
              wallet.currentChainId,
              pool.token1.id,
              Number(pool.token1.decimals),
              pool.token1.symbol,
              pool.token1.name
            )
          ),
          fees1.toString()
        );

        const fees0USDformatted = fees0USD
          ? Number(fees0USD.toSignificant()) * Number(pool.token0.derivedUSD)
          : 0;
        const fees1USDformatted = fees1USD
          ? Number(fees1USD.toSignificant()) * Number(pool.token1.derivedUSD)
          : 0;

        if (
          fetchedPositions.includes(position.pool.id.concat('-', position.id))
        )
          return;

        setPools((prev) => {
          if (prev[pool.id]) {
            return {
              ...prev,
              [pool.id]: {
                ...prev[pool.id],
                fees: prev[pool.id].fees.plus(
                  BigNumber(fees0USDformatted + fees1USDformatted)
                ),
                userTVLUSD: prev[pool.id].userTVLUSD.plus(
                  BigNumber(userTVLUSD)
                ),
              },
            };
          } else {
            return {
              ...prev,
              [pool.id]: {
                ...(pool as Pool),
                fees: BigNumber(fees0USDformatted + fees1USDformatted),
                userTVLUSD: BigNumber(userTVLUSD),
              },
            };
          }
        });

        fetchedPositions.push(pool.id.concat('-', position.id));
      } catch (error) {
        console.error(error);
      }
    });

    setIsLoading(false);
  }, [algebraPositionManager.simulate, data, wallet.isInit]);

  return {
    data: { pools: Object.values(pools) ?? [] },
    loading: isLoading,
    refetch: refetch,
  };
};

export const poolExists = async (poolAddress: string) => {
  const infoClient = useSubgraphClient('algebra_info');
  const { data } = await infoClient.query<
    SinglePoolQuery,
    SinglePoolQueryVariables
  >({
    query: SinglePoolDocument,
    variables: { poolId: poolAddress },
  });

  return data?.pool !== null;
};

const getPoolsByTokenPairBatch = async (tokens: string[]): Promise<Pool[]> => {
  const infoClient = getSubgraphClientByChainId(
    wallet.currentChainId.toString(),
    'algebra_info'
  );
  const { data } = await infoClient.query<
    PoolsByTokenPairBatchQuery,
    PoolsByTokenPairBatchQueryVariables
  >({
    query: PoolsByTokenPairBatchDocument,
    variables: { tokens },
  });

  return data.pools as Pool[];
};
