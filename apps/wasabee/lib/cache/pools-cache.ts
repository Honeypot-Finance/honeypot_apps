import { createCache } from '@/lib/kv';
import { getSubgraphClientByChainId } from '@honeypot/shared/hooks/useSubgraphClients';
import { DEFAULT_CHAIN_ID } from '@/config/algebra/default-chain-id';
import {
  PoolsListDocument,
  ActiveFarmingsDocument,
  type PoolsListQuery,
  type ActiveFarmingsQuery,
} from '@/lib/algebra/graphql/generated/graphql';
import { Address } from 'viem';

// Create namespaced cache for pools data
const poolsCache = createCache('pools');

// Cache key generators (chain-aware)
const getProcessedPoolsKey = (chainId: string) => `processed-pools-${chainId}`;
const getLastUpdateKey = (chainId: string) => `last-update-${chainId}`;

// Supported chain IDs
export const SUPPORTED_CHAINS = {
  BERACHAIN: '80084', // Berachain testnet
  BSC: '56',          // BNB Smart Chain
  // Add more chains as needed
} as const;

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
  chainId: string;
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
      feesUSD,
      txCount,
      volumeUSD,
      token0Price,
      createdAtTimestamp,
      liquidity,
      aprPercentage,
    } = pool;

    const apr = Number(aprPercentage || 0);

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
  });
}

/**
 * Fetch and process pools data from subgraph for a specific chain
 */
export async function fetchAndProcessPoolsData(chainId?: string): Promise<CachedProcessedData> {
  const targetChainId = chainId || DEFAULT_CHAIN_ID.toString();
  const infoClient = getSubgraphClientByChainId(targetChainId, 'algebra_info');
  const farmingClient = getSubgraphClientByChainId(targetChainId, 'algebra_farming');

  console.log(`Fetching fresh pools data from subgraph for chain ${targetChainId}...`);
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
  console.log(`Subgraph query completed in ${endTime - startTime}ms for chain ${targetChainId}`);

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
    chainId: targetChainId,
    lastUpdated: Date.now(),
  };
}

/**
 * Fetch and process pools data for all supported chains
 */
export async function fetchAndProcessAllChainsData(): Promise<Record<string, CachedProcessedData>> {
  const results: Record<string, CachedProcessedData> = {};
  
  const chainIds = Object.values(SUPPORTED_CHAINS);
  console.log(`Fetching data for ${chainIds.length} chains: ${chainIds.join(', ')}`);
  
  // Process chains in parallel for better performance
  const chainPromises = chainIds.map(async (chainId) => {
    try {
      const data = await fetchAndProcessPoolsData(chainId);
      return { chainId, data };
    } catch (error) {
      console.error(`Failed to fetch data for chain ${chainId}:`, error);
      return { chainId, data: null };
    }
  });
  
  const chainResults = await Promise.all(chainPromises);
  
  // Store results, skipping failed chains
  chainResults.forEach(({ chainId, data }) => {
    if (data) {
      results[chainId] = data;
      console.log(`Successfully processed ${data.pools.length} pools for chain ${chainId}`);
    }
  });
  
  return results;
}

/**
 * Cache processed pools data in KV store for a specific chain
 */
export async function cacheProcessedPoolsData(data: CachedProcessedData): Promise<void> {
  try {
    const poolsKey = getProcessedPoolsKey(data.chainId);
    const updateKey = getLastUpdateKey(data.chainId);
    
    await Promise.all([
      poolsCache.set(poolsKey, data.pools, { ex: CACHE_TTL }),
      poolsCache.set(updateKey, data.lastUpdated, { ex: CACHE_TTL }),
    ]);
    
    console.log(`Processed pools data cached successfully for chain ${data.chainId} (${data.pools.length} pools)`);
  } catch (error) {
    console.error(`Failed to cache processed pools data for chain ${data.chainId}:`, error);
    throw error;
  }
}

/**
 * Cache data for all chains
 */
export async function cacheAllChainsData(allChainsData: Record<string, CachedProcessedData>): Promise<void> {
  const cachePromises = Object.values(allChainsData).map(data => 
    cacheProcessedPoolsData(data)
  );
  
  await Promise.all(cachePromises);
  console.log(`Cached data for ${Object.keys(allChainsData).length} chains`);
}

/**
 * Get cached processed pools data from KV store for a specific chain
 */
export async function getCachedProcessedPoolsData(chainId?: string): Promise<CachedProcessedData | null> {
  try {
    const targetChainId = chainId || DEFAULT_CHAIN_ID.toString();
    const poolsKey = getProcessedPoolsKey(targetChainId);
    const updateKey = getLastUpdateKey(targetChainId);
    
    const [pools, lastUpdated] = await Promise.all([
      poolsCache.get<ProcessedPool[]>(poolsKey),
      poolsCache.get<number>(updateKey),
    ]);

    if (!pools || !lastUpdated) {
      return null;
    }

    return {
      pools,
      chainId: targetChainId,
      lastUpdated,
    };
  } catch (error) {
    console.error(`Failed to get cached processed pools data for chain ${chainId}:`, error);
    return null;
  }
}

/**
 * Get processed pools data with fallback to fresh data if cache miss
 */
export async function getProcessedPoolsDataWithFallback(chainId?: string): Promise<CachedProcessedData> {
  const targetChainId = chainId || DEFAULT_CHAIN_ID.toString();
  
  // Try to get from cache first
  const cached = await getCachedProcessedPoolsData(targetChainId);
  
  if (cached) {
    console.log(`Serving processed pools data from cache for chain ${targetChainId}`);
    return cached;
  }

  console.log(`Cache miss - fetching and processing fresh data for chain ${targetChainId}`);
  // Cache miss - fetch fresh data, process it, and cache it
  const freshData = await fetchAndProcessPoolsData(targetChainId);
  
  // Cache the fresh processed data (fire and forget)
  cacheProcessedPoolsData(freshData).catch(console.error);
  
  return freshData;
}

/**
 * Update processed pools cache for all supported chains (used by cron job)
 */
export async function updateProcessedPoolsCache(): Promise<void> {
  try {
    console.log('Starting processed pools cache update for all chains...');
    const allChainsData = await fetchAndProcessAllChainsData();
    await cacheAllChainsData(allChainsData);
    
    const totalPools = Object.values(allChainsData).reduce((sum, data) => sum + data.pools.length, 0);
    console.log(`Processed pools cache updated successfully for ${Object.keys(allChainsData).length} chains (${totalPools} total pools)`);
  } catch (error) {
    console.error('Failed to update processed pools cache:', error);
    throw error;
  }
}

/**
 * Check if cache data is stale (older than 10 minutes) for a specific chain
 */
export async function isProcessedCacheStale(chainId?: string): Promise<boolean> {
  const cached = await getCachedProcessedPoolsData(chainId);
  if (!cached) return true;
  
  const now = Date.now();
  const tenMinutes = 10 * 60 * 1000; // Allow 10 minutes before considering stale
  
  return (now - cached.lastUpdated) > tenMinutes;
}
