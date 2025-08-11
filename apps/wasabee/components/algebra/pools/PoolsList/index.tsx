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
import { calculatePercentageChange } from '@/lib/utils';
import { useSubgraphClient } from '@honeypot/shared';
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
const PoolsList = ({
  defaultFilter = 'trending',
  showOptions = true,
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
    isPoolsListLoading ||
    // isPoolsMaxAprLoading ||
    // isPoolsAvgAprLoading ||
    isFarmingsLoading;
  // ||isFarmingsAPRLoading;

  const formattedPools = useMemo(() => {
    if (isLoading || !pools || !wallet.isInit) return [];

    return pools?.pools.map(
      ({
        id,
        token0,
        token1,
        fee,
        totalValueLockedUSD,
        poolHourData,
        poolDayData,
        poolWeekData,
        feesUSD,
        txCount,
        volumeUSD,
        token0Price,
        createdAtTimestamp,
        liquidity,
      }) => {
        const currentDate = new Date().getTime();

        function handleGap(
          data: any[],
          gap: number,
          field: string,
          endTime: number
        ) {
          data?.sort((a, b) => a[field] - b[field]);

          const startTime = data[0]?.[field];

          let currentTimestamp = startTime;
          const filledData = [];

          while (currentTimestamp <= endTime) {
            const existingData = data.find(
              (d) =>
                d[field] >= currentTimestamp &&
                d[field] < currentTimestamp + gap
            );

            filledData.push(
              existingData || {
                [field]: currentTimestamp,
                volumeUSD: 0,
              }
            );

            currentTimestamp += gap;
          }

          return filledData?.sort((a, b) => b[field] - a[field]);
        }

        //periodStartUnix
        const handleGapHour = (data: any[], end: number) => {
          return handleGap(data, 3600, 'periodStartUnix', end);
        };

        const handleDayGap = (data: any[], end: number) => {
          return handleGap(data, 3600 * 24, 'date', end);
        };

        const handleGapWeek = (data: any[], end: number) => {
          return handleGap(data, 3600 * 24 * 7, 'week', end);
        };

        const filledGapHours = handleGapHour(
          poolHourData?.slice(0, 24) || [],
          Math.floor(Date.now() / 1000)
        );

        const filledGapDays = handleDayGap(
          poolDayData?.slice(0, 14) || [],
          Math.floor(Date.now() / 1000)
        );

        const filledGapWeeks = handleGapWeek(
          poolWeekData?.slice(0, 8),
          Math.floor(Date.now() / 1000)
        );
        const changeHour = calculatePercentageChange(
          Number(filledGapHours[0]?.volumeUSD || 0),
          Number(filledGapHours[1]?.volumeUSD || 0)
        );

        const change24h = calculatePercentageChange(
          filledGapHours
            .slice(0, 24)
            .reduce((sum, hour) => sum + Number(hour?.volumeUSD || 0), 0),
          filledGapHours
            .slice(24, 48)
            .reduce((sum, hour) => sum + Number(hour?.volumeUSD || 0), 0)
        );

        const changeWeek = calculatePercentageChange(
          filledGapDays
            .slice(0, 7)
            .reduce((sum, day) => sum + Number(day?.volumeUSD || 0), 0),
          filledGapDays
            .slice(7, 14)
            .reduce((sum, day) => sum + Number(day?.volumeUSD || 0), 0)
        );

        const changeMonth = calculatePercentageChange(
          filledGapWeeks
            .slice(0, 4)
            .reduce((sum, week) => sum + Number(week?.volumeUSD || 0), 0),
          filledGapWeeks
            .slice(4, 8)
            .reduce((sum, week) => sum + Number(week?.volumeUSD || 0), 0)
        );

        /* time difference calculations here to ensure that the graph provides information for the last 24 hours */
        const msIn24Hours = 24 * 60 * 60 * 1000;
        const msIn48Hours = 48 * 60 * 60 * 1000;
        const activeFarming = activeFarmings?.eternalFarmings.find(
          (farming) => farming.pool === id
        );

        let total24hFees = 0;
        let total24hDataCount = 0;
        let total24hVolume = 0;
        let total24to48hVolume = 0;
        let total24to48hDataCount = 0;

        poolHourData
          .filter((hour) => {
            return (
              hour.periodStartUnix > currentDate / 1000 - msIn24Hours / 1000
            );
          })
          .map((hour) => {
            total24hFees += Number(hour.feesUSD);
            total24hDataCount++;
            total24hVolume += Number(hour.volumeUSD);
          });

        poolHourData
          .filter((hour) => {
            return (
              hour.periodStartUnix > currentDate / 1000 - msIn48Hours / 1000 &&
              hour.periodStartUnix < currentDate / 1000 - msIn24Hours / 1000
            );
          })
          .map((hour) => {
            total24to48hVolume += Number(hour.volumeUSD);
            total24to48hDataCount++;
          });

        const avgFees24h =
          total24hDataCount > 0 ? total24hFees / total24hDataCount : 0;
        const avgVolume24h =
          total24hDataCount > 0 ? total24hVolume / total24hDataCount : 0;
        const avgVolume24to48h =
          total24to48hDataCount > 0
            ? total24to48hVolume / total24to48hDataCount
            : 0;

        const avgAPR24h =
          (avgFees24h / Number(totalValueLockedUSD)) * 365 * 100;

        const poolMaxApr = avgAPR24h;
        const poolAvgApr = avgAPR24h;
        const farmApr = 0;
        const avgApr = avgAPR24h;

        const volumeChange24to48h = calculatePercentageChange(
          avgVolume24h,
          avgVolume24to48h
        );

        return {
          id: id as Address,
          pair: {
            token0,
            token1,
          },
          fee: Number(fee) / 10_000,
          tvlUSD: Number(totalValueLockedUSD),
          volume24USD: avgVolume24h * 24,
          fees24USD: avgFees24h * 24,
          poolMaxApr,
          poolAvgApr,
          farmApr,
          avgApr,
          feesUSD,
          hasActiveFarming: Boolean(activeFarming),
          createdAtTimestamp,
          liquidity,
          token0Price,
          changeHour,
          change24h: volumeChange24to48h,
          changeWeek,
          changeMonth,
          txCount,
          volumeUSD,
          marktetcap: token0.marketCap,
          apr24h: (avgApr * 24).toString(),
        };
      }
    );
  }, [isLoading, pools, activeFarmings?.eternalFarmings, wallet.isInit]);

  const formattedUserPools = useMemo(() => {
    if (isLoading || !userPools || !wallet.isInit) return [];

    return userPools.pools.map(
      ({
        id,
        token0,
        token1,
        fee,
        totalValueLockedUSD,
        poolHourData,
        poolDayData,
        poolWeekData,
        poolMonthData,
        feesUSD,
        txCount,
        volumeUSD,
        token0Price,
        createdAtTimestamp,
        liquidity,
        aprPercentage,
        fees,
        userTVLUSD,
      }) => {
        const currentPool = poolDayData[0];
        const lastDate = currentPool ? currentPool.date * 1000 : 0;
        const currentDate = new Date().getTime();

        function handleGap(
          data: any[],
          gap: number,
          field: string,
          endTime: number
        ) {
          data?.sort((a, b) => a[field] - b[field]);

          const startTime = data[0]?.[field];

          let currentTimestamp = startTime;
          const filledData = [];

          while (currentTimestamp <= endTime) {
            const existingData = data.find(
              (d) =>
                d[field] >= currentTimestamp &&
                d[field] < currentTimestamp + gap
            );

            filledData.push(
              existingData || {
                [field]: currentTimestamp,
                volumeUSD: 0,
              }
            );

            currentTimestamp += gap;
          }

          return filledData?.sort((a, b) => b[field] - a[field]);
        }

        //periodStartUnix

        const handleGapHour = (data: any[], end: number) => {
          return handleGap(data, 3600, 'periodStartUnix', end);
        };

        const handleDayGap = (data: any[], end: number) => {
          return handleGap(data, 3600 * 24, 'date', end);
        };

        const handleGapWeek = (data: any[], end: number) => {
          return handleGap(data, 3600 * 24 * 7, 'week', end);
        };

        const filledGapHours = handleGapHour(
          poolHourData?.slice(0, 24) || [],
          Math.floor(Date.now() / 1000)
        );

        const filledGapDays = handleDayGap(
          poolDayData?.slice(0, 14) || [],
          Math.floor(Date.now() / 1000)
        );

        const filledGapWeeks = handleGapWeek(
          poolWeekData?.slice(0, 8),
          Math.floor(Date.now() / 1000)
        );
        const changeHour = calculatePercentageChange(
          Number(filledGapHours[0]?.volumeUSD || 0),
          Number(filledGapHours[1]?.volumeUSD || 0)
        );

        const change24h = calculatePercentageChange(
          filledGapHours
            .slice(0, 24)
            .reduce((sum, hour) => sum + Number(hour?.volumeUSD || 0), 0),
          filledGapHours
            .slice(24, 48)
            .reduce((sum, hour) => sum + Number(hour?.volumeUSD || 0), 0)
        );

        const changeWeek = calculatePercentageChange(
          filledGapDays
            .slice(0, 7)
            .reduce((sum, day) => sum + Number(day?.volumeUSD || 0), 0),
          filledGapDays
            .slice(7, 14)
            .reduce((sum, day) => sum + Number(day?.volumeUSD || 0), 0)
        );

        const changeMonth = calculatePercentageChange(
          filledGapWeeks
            .slice(0, 4)
            .reduce((sum, week) => sum + Number(week?.volumeUSD || 0), 0),
          filledGapWeeks
            .slice(4, 8)
            .reduce((sum, week) => sum + Number(week?.volumeUSD || 0), 0)
        );

        /* time difference calculations here to ensure that the graph provides information for the last 24 hours */
        // const timeDifference = currentDate - lastDate;
        const msIn24Hours = 24 * 60 * 60 * 1000;

        const activeFarming = activeFarmings?.eternalFarmings.find(
          (farming) => farming.pool === id
        );

        let total24hFees = 0;
        let total24hDataCount = 0;
        let total24hVolume = 0;

        poolHourData
          .filter((hour) => {
            return (
              hour.periodStartUnix > currentDate / 1000 - msIn24Hours / 1000
            );
          })
          .map((hour) => {
            total24hFees += Number(hour.feesUSD);
            total24hDataCount++;
            total24hVolume += Number(hour.volumeUSD);
          });
        const avgFees24h =
          total24hDataCount > 0 ? total24hFees / total24hDataCount : 0;
        const avgVolume24h =
          total24hDataCount > 0 ? total24hVolume / total24hDataCount : 0;

        const avgAPR24h =
          (avgFees24h / Number(totalValueLockedUSD)) * 365 * 100;

        const poolMaxApr = avgAPR24h;
        const poolAvgApr = avgAPR24h;
        const farmApr = 0;
        const avgApr = avgAPR24h;

        const unclaimedFees = BigNumber(fees.toString());

        return {
          id: id as Address,
          pair: {
            token0,
            token1,
          },
          fee: Number(fee) / 10_000,
          tvlUSD: Number(totalValueLockedUSD),
          volume24USD: avgVolume24h * 24,
          fees24USD: avgFees24h * 24,
          poolMaxApr,
          poolAvgApr,
          farmApr,
          avgApr,
          feesUSD,
          hasActiveFarming: Boolean(activeFarming),
          createdAtTimestamp,
          liquidity,
          token0Price,
          changeHour,
          change24h,
          changeWeek,
          changeMonth,
          txCount,
          volumeUSD,
          marktetcap: token0.marketCap,
          apr24h: (avgApr * 24).toString(),
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
