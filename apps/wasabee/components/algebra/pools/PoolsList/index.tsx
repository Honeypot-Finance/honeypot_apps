import {
  poolsColumns,
  poolsColumnsMy,
} from '@/components/algebra/common/Table/poolsColumns';
import { useMemo, useState } from 'react';
import { Address } from 'viem';
import PoolsTable from '@/components/algebra/common/Table/poolsTable';
import {
  usePoolsListQuery,
  useActiveFarmingsQuery,
  Pool_OrderBy,
} from '@/lib/algebra/graphql/generated/graphql';
import { SortingState } from '@tanstack/react-table';
import { useUserPools } from '@/lib/algebra/graphql/clients/pool';
import { wallet } from '@honeypot/shared/lib/wallet';
import BigNumber from 'bignumber.js';
import { useSubgraphClient } from '@honeypot/shared/hooks/useSubgraphClients';
const mappingSortKeys: Record<any, Pool_OrderBy> = {
  tvlUSD: Pool_OrderBy.TotalValueLockedUsd,
  price: Pool_OrderBy.Token0Price,
  age: Pool_OrderBy.CreatedAtTimestamp,
  txns: Pool_OrderBy.TxCount,
  volume: Pool_OrderBy.VolumeUsd,
  changeHour: Pool_OrderBy.Id,
  change24h: Pool_OrderBy.Id,
  changeWeek: Pool_OrderBy.Id,
  changeMonth: Pool_OrderBy.Id,
  liquidity: Pool_OrderBy.Liquidity,
  'marktet cap': Pool_OrderBy.Token0MarketCap,
};

import type { ProcessedPool } from '@/lib/cache/pools-cache';

interface PoolsListProps {
  defaultFilter?: string;
  showOptions?: boolean;
  initialPools?: any[];
  initialActiveFarmings?: { pool: string; id: string }[];
  initialProcessedPools?: ProcessedPool[];
  isClientLoading?: boolean;
}
const PoolsList = ({
  defaultFilter = 'trending',
  showOptions = true,
  initialPools = [],
  initialActiveFarmings = [],
  initialProcessedPools = [],
  isClientLoading ,
}: PoolsListProps) => {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'id', desc: true },
  ]);
  const farmingClient = useSubgraphClient('algebra_farming');
  const [search, setSearch] = useState('');

  const orderBy = mappingSortKeys[sorting[0].id];

  const { data: pools, loading: isPoolsListLoading } = usePoolsListQuery({
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-and-network',
    initialFetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
    pollInterval: 10000, // Refetch every 10 seconds,
    variables: {
      search: search,
    },
  });

  const { data: userPools, loading: isUserPoolsLoading } = useUserPools(
    wallet.account
  );

  const { data: activeFarmings, loading: isFarmingsLoading } =
    useActiveFarmingsQuery({
      client: farmingClient,
    });

  const isLoading =
    isClientLoading || 
    ((isPoolsListLoading || isFarmingsLoading) )
  // ||isFarmingsAPRLoading;

  const formattedPools = useMemo(() => {
    // If we have processed pools from cache and NO active search, use them directly
    if (initialProcessedPools && initialProcessedPools.length > 0 && !search) {
      console.log('Using pre-processed pools from cache');
      return initialProcessedPools;
    }

    // Use GraphQL results when searching or as fallback
    const sourcePools = (pools?.pools ?? initialPools) as any[];
    const activeFarmingsList = (activeFarmings?.eternalFarmings ?? initialActiveFarmings) as any[];

    if (!sourcePools || sourcePools.length === 0) return [];

    return sourcePools.map(
      ({
        id,
        token0,
        token1,
        fee,
        totalValueLockedUSD,
        feesUSD,
        txCount,
        volumeUSD,
        token0Price,
        createdAtTimestamp,
        liquidity,
        aprPercentage,
      }: any) => {
        const apr = Number(aprPercentage || 0);
        const activeFarming = activeFarmingsList.find(
          (farming: any) => farming.pool === id
        );

        return {
          id: id as Address,
          pair: {
            token0,
            token1,
          },
          fee: Number(fee) / 10_000,
          tvlUSD: Number(totalValueLockedUSD),
          volume24USD: 0,
          fees24USD: 0,
          poolMaxApr: apr,
          poolAvgApr: apr,
          farmApr: 0,
          avgApr: apr,
          feesUSD,
          hasActiveFarming: Boolean(activeFarming),
          createdAtTimestamp,
          liquidity,
          token0Price,
          changeHour: 0,
          change24h: 0,
          changeWeek: 0,
          changeMonth: 0,
          txCount,
          volumeUSD,
          marktetcap: token0.marketCap,
          apr24h: apr.toString(),
        };
      }
    );
  }, [isLoading, pools, activeFarmings?.eternalFarmings, initialPools, initialActiveFarmings, initialProcessedPools, search]);

  const formattedUserPools = useMemo(() => {
    if (isLoading || !userPools || !wallet.isInit) return [];

    return userPools.pools.map(
      ({
        id,
        token0,
        token1,
        fee,
        totalValueLockedUSD,
        feesUSD,
        txCount,
        volumeUSD,
        token0Price,
        createdAtTimestamp,
        liquidity,
        aprPercentage,
        fees,
        userTVLUSD,
      }: any) => {
        const apr = Number(aprPercentage || 0);

        const activeFarming = activeFarmings?.eternalFarmings.find(
          (farming: any) => farming.pool === id
        );

        const unclaimedFees = BigNumber(fees.toString());

        return {
          id: id as Address,
          pair: {
            token0,
            token1,
          },
          fee: Number(fee) / 10_000,
          tvlUSD: Number(totalValueLockedUSD),
          volume24USD: 0,
          fees24USD: 0,
          poolMaxApr: apr,
          poolAvgApr: apr,
          farmApr: 0,
          avgApr: apr,
          feesUSD,
          hasActiveFarming: Boolean(activeFarming),
          createdAtTimestamp,
          liquidity,
          token0Price,
          changeHour: 0,
          change24h: 0,
          changeWeek: 0,
          changeMonth: 0,
          txCount,
          volumeUSD,
          marktetcap: token0.marketCap,
          apr24h: apr.toString(),
          unclaimedFees,
          userTVLUSD,
        };
      }
    );
  }, [isLoading, userPools, activeFarmings, wallet.isInit]);

  const handleSort = (callback: any) => {
    const sort = callback();
    if (sort.length > 0) {
      setSorting(sort);
    } else {
      setSorting([]);
    }
  };

  return (
    <div className="w-full">
      <div className="w-full">
        <PoolsTable
          columnsMy={poolsColumnsMy}
          columns={poolsColumns}
          data={formattedPools}
          userPools={formattedUserPools}
          sorting={sorting}
          setSorting={handleSort}
          link={'pool-detail'}
          showPagination={true}
          loading={isLoading || isUserPoolsLoading}
          defaultFilter={defaultFilter}
          showOptions={showOptions}
          handleSearch={(data: string) => setSearch(data)}
        />
      </div>
    </div>
  );
};

export default PoolsList;
