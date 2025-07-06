import { useQuery } from '@apollo/client';
import { WASABEE_LEADERBOARD_QUERY } from '@/lib/algebra/graphql/clients/leaderboard';
import BigNumber from 'bignumber.js';
import type { FactoryData } from '@/lib/algebra/graphql/clients/leaderboard';
import { wallet } from '@honeypot/shared/lib/wallet';
import { gql } from '@apollo/client';

// Pools query to match original Wasabee implementation
const POOLS_LIST_QUERY = gql`
  query PoolsList($search: String) {
    pools(
      where: { searchString_contains: $search, liquidity_gt: 0 }
      orderBy: totalValueLockedUSD
      orderDirection: desc
      first: 100
    ) {
      id
      totalValueLockedUSD
      token0 {
        id
        symbol
        name
      }
      token1 {
        id
        symbol
        name
      }
    }
  }
`;

type Pool = {
  id: string;
  totalValueLockedUSD: string;
  token0: {
    id: string;
    symbol: string;
    name: string;
  };
  token1: {
    id: string;
    symbol: string;
    name: string;
  };
};

type PoolsData = {
  pools: Pool[];
};

export function useWasabeeLeaderboard() {
  const { data, loading, error, refetch } = useQuery<FactoryData>(
    WASABEE_LEADERBOARD_QUERY
  );

  // Fetch pools data for accurate TVL calculation (matching original Wasabee)
  const { data: poolsData } = useQuery<PoolsData>(POOLS_LIST_QUERY, {
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-and-network',
    initialFetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
    pollInterval: 10000, // Refetch every 10 seconds
    variables: {
      search: '',
    },
  });

  // Calculate TVL by summing individual pools (same as original Wasabee)
  const poolsTVL = poolsData?.pools.reduce((acc, pool) => {
    return acc.plus(pool.totalValueLockedUSD);
  }, new BigNumber(0));

  const formatValue = (value: string) => {
    const bn = new BigNumber(value || '0');
    return {
      usd: `$${bn.toFormat(2)}`,
      matic: `${bn.toFormat(2)} ${wallet.currentChain?.nativeToken?.symbol}`,
    };
  };

  const stats = data?.factories[0]
    ? {
        totalTrades: {
          title: 'Total Trades',
          value: data.factories[0].txCount,
        },
        totalVolume: {
          title: 'Total Volume',
          value: data.factories[0].untrackedVolumeUSD,
        },
        tvl: {
          title: 'TVL',
          value: poolsTVL?.toString() || '0',
        },
        totalFees: {
          title: 'Total Fees',
          value: data.factories[0].totalFeesUSD,
        },
      }
    : null;

  return {
    stats,
    loading,
    error,
    refetch,
  };
}
