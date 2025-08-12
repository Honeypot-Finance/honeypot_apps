import {
  Pool,
  useActiveFarmingsQuery,
} from '@/lib/algebra/graphql/generated/graphql';
import { DynamicFormatAmount } from '@honeypot/shared';
import { useMemo } from 'react';
import { calculatePercentageChange } from '@/lib/utils';
import { Address } from 'viem';

import { Token } from '@honeypot/shared';
import { TokenLogo } from '@honeypot/shared';
import { wallet } from '@honeypot/shared/lib/wallet';
import { useSubgraphClient } from '@honeypot/shared';

interface PoolStatsCardProps {
  pool: Pool | null | undefined;
}

export default function PoolStatsCard({ pool }: PoolStatsCardProps) {
  // Hooks need to be called unconditionally at the top
  const farmingClient = useSubgraphClient('algebra_farming');
  const { data: activeFarmings } = useActiveFarmingsQuery({
    client: farmingClient,
  });

  const derivedPoolInfo = useMemo(() => {
    if (!pool) return null;

    const {
      id,
      token0,
      token1,
      fee,
      totalValueLockedUSD,
      poolHourData,
      poolDayData,
      poolWeekData,
      feesUSD,
      poolMonthData,
      txCount,
      volumeUSD,
      token0Price,
      createdAtTimestamp,
      liquidity,
      aprPercentage,
    } = pool;
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
    const timeDifference = currentDate - lastDate;
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
        return hour.periodStartUnix > currentDate / 1000 - msIn24Hours / 1000;
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

    const avgAPR24h = (avgFees24h / Number(totalValueLockedUSD)) * 365 * 100;

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
        token0: Token.getToken({
          address: token0.id,
          chainId: wallet.currentChainId.toString(),
        }),
        token1: Token.getToken({
          address: token1.id,
          chainId: wallet.currentChainId.toString(),
        }),
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
      marketCap: token0.marketCap,
      apr24h: (avgApr * 24).toString(),
      tick: pool?.tick,
    };
  }, [pool, activeFarmings]);

  if (!pool || !derivedPoolInfo) return null;

  return (
    <div className="h-[400px] p-6 flex flex-col gap-6 bg-[#271A0C] border border-black rounded-[24px] shadow-[4px_4px_0px_0px_#D29A0D] text-[#202020] animate-fade-in">
      <div className="flex items-center">
        <h2 className="text-xl font-bold">Pool Stats</h2>
        <div className="ml-auto px-3 py-1 bg-[#FFCD4D] text-xs font-semibold rounded-full border border-[#202020] shadow-[1px_1px_0px_0px_#000]">
          {derivedPoolInfo.fee}% Fee
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-base font-semibold mb-3 pb-1 border-b border-gray-200">
            Tokens
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div
              key={derivedPoolInfo.pair.token0.symbol}
              className="flex items-center p-3 rounded-xl bg-[#86715B] border border-gray-200"
            >
              <TokenLogo
                token={derivedPoolInfo.pair.token0}
                size={24}
                addtionalClasses="w-6 h-6"
              />
              <span className="ml-2 font-semibold">
                {derivedPoolInfo.pair.token0.symbol}
              </span>
            </div>
            <div
              key={derivedPoolInfo.pair.token1.symbol}
              className="flex items-center p-3 rounded-xl bg-[#86715B] border border-gray-200"
            >
              <TokenLogo
                token={derivedPoolInfo.pair.token1}
                size={24}
                addtionalClasses="w-6 h-6"
              />
              <span className="ml-2 font-semibold">
                {derivedPoolInfo.pair.token1.symbol}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold mb-3 pb-1 border-b border-gray-200">
            Performance
          </h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-5">
            <div className="flex flex-col">
              <h4 className="text-sm text-gray-600 mb-1">TVL</h4>
              <span className="text-lg font-bold">
                $
                {DynamicFormatAmount({
                  amount: derivedPoolInfo.tvlUSD,
                  decimals: 2,
                })}
              </span>
            </div>

            <div className="flex flex-col">
              <h4 className="text-sm text-gray-600 mb-1">APR (24h)</h4>
              <div className="flex items-center">
                <span className="text-lg font-bold">
                  {DynamicFormatAmount({
                    amount: derivedPoolInfo.apr24h,
                    decimals: 2,
                  })}
                  %
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <h4 className="text-sm text-gray-600 mb-1">Volume (24h)</h4>
              <span className="text-lg font-bold">
                $
                {DynamicFormatAmount({
                  amount: derivedPoolInfo.volume24USD,
                  decimals: 2,
                })}
              </span>
            </div>

            <div className="flex flex-col">
              <h4 className="text-sm text-gray-600 mb-1">Fees (24h)</h4>
              <span className="text-lg font-bold">
                $
                {DynamicFormatAmount({
                  amount: derivedPoolInfo.fees24USD,
                  decimals: 2,
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
