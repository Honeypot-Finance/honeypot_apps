import { createCache } from '@/lib/kv';
import { getSubgraphClientByChainId } from '@honeypot/shared';
import { DEFAULT_CHAIN_ID } from '@/config/algebra/default-chain-id';
import {
  PoolsListDocument,
  ActiveFarmingsDocument,
  type PoolsListQuery,
  type ActiveFarmingsQuery,
} from '@/lib/algebra/graphql/generated/graphql';
import { calculatePercentageChange } from '@/lib/utils';
import { Address } from 'viem';

// Create namespaced cache for pools data
const poolsCache = createCache('pools');

// Cache keys
const PROCESSED_POOLS_KEY = 'processed-pools';
const LAST_UPDATE_KEY = 'last-update';

// Cache TTL - 5 minutes (data will be updated every 5 minutes via cron)
const CACHE_TTL = 5 * 60;

// Optimized token data structure (only essential fields)
type OptimizedToken = {
  id: string;
  symbol: string;
  name: string;
};

// Processed pool data structure (what the UI actually needs)
export type ProcessedPool = {
  id: Address;
  pair: {
    token0: OptimizedToken;
    token1: OptimizedToken;
  };
  fee: number;
  tvlUSD: number;
  volume24USD: number;
  fees24USD: number;
  poolMaxApr: number;
  poolAvgApr: number;
  farmApr: number;
  avgApr: number;
  feesUSD: string;
  hasActiveFarming: boolean;
  createdAtTimestamp: string;
  liquidity: string;
  token0Price: string;
  changeHour: number;
  change24h: number;
  changeWeek: number;
  changeMonth: number;
  txCount: string;
  volumeUSD: string;
  marktetcap: string;
  apr24h: string;
};

export type CachedProcessedData = {
  pools: ProcessedPool[];
  lastUpdated: number;
};

/**
 * Process raw pool data into the format needed by the UI
 */
function processPoolData(
  pools: PoolsListQuery['pools'], 
  activeFarmings: ActiveFarmingsQuery['eternalFarmings']
): ProcessedPool[] {
  if (!pools || pools.length === 0) return [];

  return pools.map((pool: any) => {
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
      txCount,
      volumeUSD,
      token0Price,
      createdAtTimestamp,
      liquidity,
    } = pool;

    const currentDate = new Date().getTime();

    // Gap filling helper function
    function handleGap(data: any[], gap: number, field: string, endTime: number) {
      data?.sort((a, b) => a[field] - b[field]);
      const startTime = data[0]?.[field];
      let currentTimestamp = startTime;
      const filledData = [];

      while (currentTimestamp <= endTime) {
        const existingData = data.find(
          (d) => d[field] >= currentTimestamp && d[field] < currentTimestamp + gap
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

    const handleGapHour = (data: any[], end: number) =>
      handleGap(data, 3600, 'periodStartUnix', end);
    const handleDayGap = (data: any[], end: number) =>
      handleGap(data, 3600 * 24, 'date', end);
    const handleGapWeek = (data: any[], end: number) =>
      handleGap(data, 3600 * 24 * 7, 'week', end);

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

    // Calculate percentage changes
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

    // Calculate 24h metrics
    const msIn24Hours = 24 * 60 * 60 * 1000;
    const msIn48Hours = 48 * 60 * 60 * 1000;
    
    let total24hFees = 0;
    let total24hDataCount = 0;
    let total24hVolume = 0;
    let total24to48hVolume = 0;
    let total24to48hDataCount = 0;

    // Last 24 hours
    poolHourData
      ?.filter((hour: any) => hour.periodStartUnix > currentDate / 1000 - msIn24Hours / 1000)
      .forEach((hour: any) => {
        total24hFees += Number(hour.feesUSD);
        total24hDataCount++;
        total24hVolume += Number(hour.volumeUSD);
      });

    // 24-48 hours ago
    poolHourData
      ?.filter((hour: any) => 
        hour.periodStartUnix > currentDate / 1000 - msIn48Hours / 1000 &&
        hour.periodStartUnix < currentDate / 1000 - msIn24Hours / 1000
      )
      .forEach((hour: any) => {
        total24to48hVolume += Number(hour.volumeUSD);
        total24to48hDataCount++;
      });

    const avgFees24h = total24hDataCount > 0 ? total24hFees / total24hDataCount : 0;
    const avgVolume24h = total24hDataCount > 0 ? total24hVolume / total24hDataCount : 0;
    const avgVolume24to48h = total24to48hDataCount > 0 ? total24to48hVolume / total24to48hDataCount : 0;

    const avgAPR24h = (avgFees24h / Number(totalValueLockedUSD)) * 365 * 100;
    const volumeChange24to48h = calculatePercentageChange(avgVolume24h, avgVolume24to48h);

    // Check for active farming
    const activeFarming = activeFarmings?.find((farming: any) => farming.pool === id);

    return {
      id: id as Address,
      pair: { 
        token0: {
          id: token0.id,
          symbol: token0.symbol,
          name: token0.name,
        },
        token1: {
          id: token1.id,
          symbol: token1.symbol,
          name: token1.name,
        }
      },
      fee: Number(fee) / 10_000,
      tvlUSD: Number(totalValueLockedUSD),
      volume24USD: avgVolume24h * 24,
      fees24USD: avgFees24h * 24,
      poolMaxApr: avgAPR24h,
      poolAvgApr: avgAPR24h,
      farmApr: 0,
      avgApr: avgAPR24h,
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
      apr24h: (avgAPR24h * 24).toString(),
    };
  });
}

/**
 * Fetch and process pools data from subgraph
 */
export async function fetchAndProcessPoolsData(): Promise<CachedProcessedData> {
  const chainId = DEFAULT_CHAIN_ID.toString();
  const infoClient = getSubgraphClientByChainId(chainId, 'algebra_info');
  const farmingClient = getSubgraphClientByChainId(chainId, 'algebra_farming');

  console.log('Fetching fresh pools data from subgraph...');
  const startTime = Date.now();

  const [poolsRes, farmingsRes] = await Promise.all([
    infoClient.query({
      query: PoolsListDocument,
      variables: { search: '' },
      fetchPolicy: 'no-cache',
    }),
    farmingClient.query({
      query: ActiveFarmingsDocument,
      fetchPolicy: 'no-cache',
    }),
  ]);

  const endTime = Date.now();
  console.log(`Subgraph query completed in ${endTime - startTime}ms`);

  console.log('Processing pools data...');
  const processStart = Date.now();
  
  const processedPools = processPoolData(
    poolsRes.data?.pools ?? [],
    farmingsRes.data?.eternalFarmings ?? []
  );
  
  const processEnd = Date.now();
  console.log(`Data processing completed in ${processEnd - processStart}ms`);

  return {
    pools: processedPools,
    lastUpdated: Date.now(),
  };
}

/**
 * Cache processed pools data in KV store
 */
export async function cacheProcessedPoolsData(data: CachedProcessedData): Promise<void> {
  try {
    await Promise.all([
      poolsCache.set(PROCESSED_POOLS_KEY, data.pools, { ex: CACHE_TTL }),
      poolsCache.set(LAST_UPDATE_KEY, data.lastUpdated, { ex: CACHE_TTL }),
    ]);
    
    console.log(`Processed pools data cached successfully (${data.pools.length} pools)`);
  } catch (error) {
    console.error('Failed to cache processed pools data:', error);
    throw error;
  }
}

/**
 * Get cached processed pools data from KV store
 */
export async function getCachedProcessedPoolsData(): Promise<CachedProcessedData | null> {
  try {
    const [pools, lastUpdated] = await Promise.all([
      poolsCache.get<ProcessedPool[]>(PROCESSED_POOLS_KEY),
      poolsCache.get<number>(LAST_UPDATE_KEY),
    ]);

    if (!pools || !lastUpdated) {
      return null;
    }

    return {
      pools,
      lastUpdated,
    };
  } catch (error) {
    console.error('Failed to get cached processed pools data:', error);
    return null;
  }
}

/**
 * Get processed pools data with fallback to fresh data if cache miss
 */
export async function getProcessedPoolsDataWithFallback(): Promise<CachedProcessedData> {
  // Try to get from cache first
  const cached = await getCachedProcessedPoolsData();
  
  if (cached) {
    console.log('Serving processed pools data from cache');
    return cached;
  }

  console.log('Cache miss - fetching and processing fresh data');
  // Cache miss - fetch fresh data, process it, and cache it
  const freshData = await fetchAndProcessPoolsData();
  
  // Cache the fresh processed data (fire and forget)
  cacheProcessedPoolsData(freshData).catch(console.error);
  
  return freshData;
}

/**
 * Update processed pools cache (used by cron job)
 */
export async function updateProcessedPoolsCache(): Promise<void> {
  try {
    console.log('Starting processed pools cache update...');
    const freshData = await fetchAndProcessPoolsData();
    await cacheProcessedPoolsData(freshData);
    console.log('Processed pools cache updated successfully');
  } catch (error) {
    console.error('Failed to update processed pools cache:', error);
    throw error;
  }
}

/**
 * Check if cache data is stale (older than 10 minutes)
 */
export async function isProcessedCacheStale(): Promise<boolean> {
  const cached = await getCachedProcessedPoolsData();
  if (!cached) return true;
  
  const now = Date.now();
  const tenMinutes = 10 * 60 * 1000; // Allow 10 minutes before considering stale
  
  return (now - cached.lastUpdated) > tenMinutes;
}
