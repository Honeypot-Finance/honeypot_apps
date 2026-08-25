import {
  poolsColumns,
  poolsColumnsMy,
} from '@/components/algebra/common/Table/poolsColumns';
import { useEffect, useMemo, useState } from 'react';
import { Address } from 'viem';
import PoolsTable from '@/components/algebra/common/Table/poolsTable';
import { usePositions } from '@/lib/algebra/hooks/positions/usePositions';
import { farmingClient } from '@/lib/algebra/graphql/clients';
import {
  usePoolsListQuery,
  useActiveFarmingsQuery,
  OrderDirection,
  Pool_OrderBy,
} from '@/lib/algebra/graphql/generated/graphql';
import PoolCardList from './PoolCardList';
import { SortingState } from '@tanstack/react-table';
import { useUserPools } from '@/lib/algebra/graphql/clients/pool';
import { wallet } from '@honeypot/shared/lib/wallet';
import BigNumber from 'bignumber.js';
import { observer } from 'mobx-react-lite';
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
interface PoolsListProps {
  defaultFilter?: string;
  showOptions?: boolean;
}
const PoolsList = observer(
  ({ defaultFilter = 'trending', showOptions = true }: PoolsListProps) => {
    const [sorting, setSorting] = useState<SortingState>([
      { id: 'id', desc: true },
    ]);
    const [isAllpoolsLoading, setIsAllpoolsLoading] = useState(true);

    const orderBy = mappingSortKeys[sorting[0].id];

    const {
      data: pools,
      loading: isPoolsListLoading,
      refetch,
    } = usePoolsListQuery({
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-and-network',
      initialFetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
      pollInterval: 10000, // Refetch every 10 seconds
    });

    const {
      data: userPools,
      loading: isUserPoolsLoading,
      refetch: refetchUserPools,
    } = useUserPools(wallet.account);

    const { data: activeFarmings, loading: isFarmingsLoading } =
      useActiveFarmingsQuery({
        client: farmingClient,
      });
    const isLoading =
      isAllpoolsLoading || isUserPoolsLoading || isFarmingsLoading;

    const formattedPools = useMemo(() => {
      if (!pools) {
        return [];
      }

      setIsAllpoolsLoading(false);

      return pools.pools.map(
        ({
          id,
          token0,
          token1,
          fee,
          totalValueLockedUSD,
          txCount,
          volumeUSD,
          token0Price,
          createdAtTimestamp,
          liquidity,
          aprPercentage,
        }: any) => {
          const apr = Number(aprPercentage || 0);

          const activeFarming = activeFarmings?.eternalFarmings.find(
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
            apr24h: apr,
          };
        }
      );
    }, [pools, activeFarmings]);

    const formattedUserPools = useMemo(() => {
      if (!userPools) return [];

      return userPools.pools.map(
        ({
          id,
          token0,
          token1,
          fee,
          totalValueLockedUSD,
          txCount,
          volumeUSD,
          token0Price,
          createdAtTimestamp,
          liquidity,
          aprPercentage,
          fees,
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
            apr24h: apr,
            unclaimedFees,
          };
        }
      );
    }, [userPools, activeFarmings]);

    const handleSort = (callback: any) => {
      const sort = callback();
      if (sort.length > 0) {
        setSorting(sort);
      } else {
        setSorting([]);
      }
    };

    return (
      <div>
        <div className="hidden xl:block">
          <PoolsTable
            columnsMy={poolsColumnsMy}
            columns={poolsColumns}
            data={formattedPools}
            userPools={formattedUserPools}
            sorting={sorting}
            setSorting={handleSort}
            link={'pool-detail'}
            showPagination={true}
            loading={isLoading}
            defaultFilter={defaultFilter}
            showOptions={showOptions}
            handleSearch={() => {}}
          />
        </div>
        <div className="block xl:hidden">
          <PoolCardList data={formattedPools} />
        </div>
      </div>
    );
  }
);

export default PoolsList;
