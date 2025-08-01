import {
  poolsColumns,
  poolsColumnsMy,
} from '@/components/algebra/common/Table/poolsColumns';
import { useMemo, useState } from 'react';
import { Address } from 'viem';
import PoolsTable from '@/components/algebra/common/Table/poolsTable';
import { Pool_OrderBy } from '@/lib/algebra/graphql/generated/graphql';
import { SortingState } from '@tanstack/react-table';
import { wallet } from '@honeypot/shared/lib/wallet';
import BigNumber from 'bignumber.js';
import { calculatePercentageChange } from '@/lib/utils';
import { usePoolsWithCache } from '@/hooks/usePoolsWithCache';

// Type definitions for pool data
interface PoolToken {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  marketCap?: string;
}

interface PoolHourData {
  periodStartUnix: number;
  volumeUSD: string;
  feesUSD: string;
  [key: string]: any;
}

interface PoolDayData {
  date: number;
  volumeUSD: string;
  feesUSD: string;
  [key: string]: any;
}

interface PoolWeekData {
  week: number;
  volumeUSD: string;
  feesUSD: string;
  [key: string]: any;
}

interface Pool {
  id: string;
  token0: PoolToken;
  token1: PoolToken;
  fee: string;
  totalValueLockedUSD: string;
  poolHourData: PoolHourData[];
  poolDayData: PoolDayData[];
  poolWeekData: PoolWeekData[];
  feesUSD: string;
  txCount: string;
  volumeUSD: string;
  token0Price: string;
  createdAtTimestamp: string;
  liquidity: string;
}

interface UserPool extends Pool {
  poolMonthData: any[];
  aprPercentage: string;
  fees: string;
  userTVLUSD: string;
  [key: string]: any;
}

interface Farming {
  pool: string;
}

const mappingSortKeys: Record<string, Pool_OrderBy> = {
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
  const [search, setSearch] = useState('');

  // Use cached data hook
  const {
    pools,
    userPools,
    activeFarmings,
    isLoading,
  } = usePoolsWithCache(defaultFilter, search);

  const formattedPools = useMemo(() => {
    if (isLoading || !pools || !wallet.isInit) return [];

    return pools?.pools.map((pool: Pool) => {
      const currentDate = new Date().getTime();

      function handleGap(
        data: PoolHourData[] | PoolDayData[] | PoolWeekData[],
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
              d[field] >= currentTimestamp && d[field] < currentTimestamp + gap
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

     
      const handleGapHour = (data: PoolHourData[], end: number) => {
        return handleGap(data, 3600, 'periodStartUnix', end);
      };

      const handleDayGap = (data: PoolDayData[], end: number) => {
        return handleGap(data, 3600 * 24, 'date', end);
      };

      const handleGapWeek = (data: PoolWeekData[], end: number) => {
        return handleGap(data, 3600 * 24 * 7, 'week', end);
      };

      const filledGapHours = handleGapHour(
        pool.poolHourData?.slice(0, 24) || [],
        Math.floor(Date.now() / 1000)
      );

      const filledGapDays = handleDayGap(
        pool.poolDayData?.slice(0, 14) || [],
        Math.floor(Date.now() / 1000)
      );

      const filledGapWeeks = handleGapWeek(
        pool.poolWeekData?.slice(0, 8) || [],
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
        (farming: Farming) => farming.pool === pool.id
      );

      let total24hFees = 0;
      let total24hDataCount = 0;
      let total24hVolume = 0;
      let total24to48hVolume = 0;
      let total24to48hDataCount = 0;

      pool.poolHourData
        .filter((hour) => {
          return hour.periodStartUnix > currentDate / 1000 - msIn24Hours / 1000;
        })
        .map((hour: PoolHourData) => {
          total24hFees += Number(hour.feesUSD);
          total24hDataCount++;
          total24hVolume += Number(hour.volumeUSD);
        });

      pool.poolHourData
        .filter((hour) => {
          return (
            hour.periodStartUnix > currentDate / 1000 - msIn48Hours / 1000 &&
            hour.periodStartUnix < currentDate / 1000 - msIn24Hours / 1000
          );
        })
        .map((hour: PoolHourData) => {
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
        (avgFees24h / Number(pool.totalValueLockedUSD)) * 365 * 100;

      const poolMaxApr = avgAPR24h;
      const poolAvgApr = avgAPR24h;
      const farmApr = 0;
      const avgApr = avgAPR24h;

      const volumeChange24to48h = calculatePercentageChange(
        avgVolume24h,
        avgVolume24to48h
      );

      return {
        id: pool.id as Address,
        pair: {
          token0: pool.token0,
          token1: pool.token1,
        },
        fee: Number(pool.fee) / 10_000,
        tvlUSD: Number(pool.totalValueLockedUSD),
        volume24USD: avgVolume24h * 24,
        fees24USD: avgFees24h * 24,
        poolMaxApr,
        poolAvgApr,
        farmApr,
        avgApr,
        feesUSD: pool.feesUSD,
        hasActiveFarming: Boolean(activeFarming),
        createdAtTimestamp: pool.createdAtTimestamp,
        liquidity: pool.liquidity,
        token0Price: pool.token0Price,
        changeHour,
        change24h: volumeChange24to48h,
        changeWeek,
        changeMonth,
        txCount: pool.txCount,
        volumeUSD: pool.volumeUSD,
        marktetcap: pool.token0.marketCap,
        apr24h: (avgApr * 24).toString(),
      };
    });
  }, [isLoading, pools, activeFarmings?.eternalFarmings]);

  const formattedUserPools = useMemo(() => {
    if (isLoading || !userPools || !userPools.data || !wallet.isInit) return [];

    return userPools.data.pools.map((userPool: UserPool) => {
      const currentPool = userPool.poolDayData[0];
      // const lastDate = currentPool ? currentPool.date * 1000 : 0;
      const currentDate = new Date().getTime();

      function handleGap(
        data: PoolHourData[] | PoolDayData[] | PoolWeekData[],
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
              d[field] >= currentTimestamp && d[field] < currentTimestamp + gap
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
        userPool.poolHourData?.slice(0, 24) || [],
        Math.floor(Date.now() / 1000)
      );

      const filledGapDays = handleDayGap(
        userPool.poolDayData?.slice(0, 14) || [],
        Math.floor(Date.now() / 1000)
      );

      const filledGapWeeks = handleGapWeek(
        userPool.poolWeekData?.slice(0, 8) || [],
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
        (farming: Farming) => farming.pool === userPool.id
      );

      let total24hFees = 0;
      let total24hDataCount = 0;
      let total24hVolume = 0;

      userPool.poolHourData
        .filter((hour) => {
          return hour.periodStartUnix > currentDate / 1000 - msIn24Hours / 1000;
        })
        .map((hour: PoolHourData) => {
          total24hFees += Number(hour.feesUSD);
          total24hDataCount++;
          total24hVolume += Number(hour.volumeUSD);
        });
      const avgFees24h =
        total24hDataCount > 0 ? total24hFees / total24hDataCount : 0;
      const avgVolume24h =
        total24hDataCount > 0 ? total24hVolume / total24hDataCount : 0;

      const avgAPR24h =
        (avgFees24h / Number(userPool.totalValueLockedUSD)) * 365 * 100;

      const poolMaxApr = avgAPR24h;
      const poolAvgApr = avgAPR24h;
      const farmApr = 0;
      const avgApr = avgAPR24h;

      const unclaimedFees = BigNumber(userPool.fees.toString());

      return {
        id: userPool.id as Address,
        pair: {
          token0: userPool.token0,
          token1: userPool.token1,
        },
        fee: Number(userPool.fee) / 10_000,
        tvlUSD: Number(userPool.totalValueLockedUSD),
        volume24USD: avgVolume24h * 24,
        fees24USD: avgFees24h * 24,
        poolMaxApr,
        poolAvgApr,
        farmApr,
        avgApr,
        feesUSD: userPool.feesUSD,
        hasActiveFarming: Boolean(activeFarming),
        createdAtTimestamp: userPool.createdAtTimestamp,
        liquidity: userPool.liquidity,
        token0Price: userPool.token0Price,
        changeHour,
        change24h,
        changeWeek,
        changeMonth,
        txCount: userPool.txCount,
        volumeUSD: userPool.volumeUSD,
        marktetcap: userPool.token0.marketCap,
        apr24h: (avgApr * 24).toString(),
        unclaimedFees,
        userTVLUSD: userPool.userTVLUSD,
      };
    });
  }, [isLoading, userPools, activeFarmings]);

  const handleSort = (callback: () => SortingState) => {
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
          loading={isLoading}
          defaultFilter={defaultFilter}
          showOptions={showOptions}
          handleSearch={(data: string) => setSearch(data)}
        />
      </div>
    </div>
  );
};

export default PoolsList;
