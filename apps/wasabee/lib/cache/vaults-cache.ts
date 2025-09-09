import { createCache } from '@/lib/kv';
import { getVaultPageData, getSingleVaultDetails } from '@/lib/algebra/graphql/clients/vaults';
import { VaultsSortedByHoldersQuery } from '@/lib/algebra/graphql/generated/graphql';
import { ICHIVaultContract } from '@honeypot/shared';
import { wallet } from '@honeypot/shared/lib/wallet';
import { getSubgraphClientByChainId } from '@honeypot/shared';
import { DEFAULT_CHAIN_ID } from '@/config/algebra/default-chain-id';

// Cache configuration
const CACHE_TTL = 5 * 60; // 5 minutes in seconds
const STALE_TIME = 10 * 60 * 1000; // 10 minutes in milliseconds

// Supported chains for vault caching  
export const SUPPORTED_CHAINS = {
  BERACHAIN: '80094',
  BSC: '56',
} as const;

// Types for optimized vault data
export interface OptimizedToken {
  id: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

export interface ProcessedVault {
  // Essential fields for display
  address: string;
  apr: number;
  detailedApr: {
    feeApr_1d: number;
    feeApr_3d: number;
    feeApr_7d: number;
    feeApr_30d: number;
  };
  tvlUSD: number;

  // Optimized token info
  token0: OptimizedToken | null;
  token1: OptimizedToken | null;

  // Pool data for display
  pool: {
    volume_24h_USD: number;
    fees_24h_USD: number;
    totalValueLockedUSD: number;
  } | null;

  // Basic vault info
  name: string;
  fee: number;
  allowToken0: boolean;
  allowToken1: boolean;
  vaultTag?: string;
  
  // Computed values
  volumeChange24h?: number;
  tvlChange24h?: number;
  feesChange24h?: number;
}

export interface ProcessedVaultsData {
  vaults: ProcessedVault[];
  lastUpdated: number;
  chainId: string;
}

// Cache instance
const vaultsCache = createCache('vaults');

// Cache key generators
const getProcessedVaultsKey = (chainId?: string) => 
  chainId ? `processed-vaults-${chainId}` : 'processed-vaults';

const getLastUpdateKey = (chainId?: string) => 
  chainId ? `last-update-${chainId}` : 'last-update';

/**
 * Process raw vault data into optimized UI-ready format
 */
export async function processVaultData(
  vaultsQuery: VaultsSortedByHoldersQuery,
  vaultContracts: ICHIVaultContract[],
  chainId: string
): Promise<ProcessedVault[]> {
  if (!vaultContracts?.length) {
    return [];
  }

  return vaultContracts.map((vault) => {
    // Calculate 24h changes (simplified - you can enhance this based on your needs)
    const volumeChange24h = 0; // TODO: Calculate from historical data
    const tvlChange24h = 0; // TODO: Calculate from historical data  
    const feesChange24h = 0; // TODO: Calculate from historical data

    return {
      // Essential fields
      address: vault.address,
      apr: vault.apr || 0,
      detailedApr: vault.detailedApr || {
        feeApr_1d: 0,
        feeApr_3d: 0,
        feeApr_7d: 0,
        feeApr_30d: 0,
      },
      tvlUSD: vault.tvlUSD || 0,

      // Optimized token info - only keep essential fields
      token0: vault.token0 ? {
        id: vault.token0.address,
        symbol: vault.token0.symbol || '',
        name: vault.token0.name || '',
        decimals: vault.token0.decimals || 18,
        logoURI: vault.token0.logoURI,
      } : null,

      token1: vault.token1 ? {
        id: vault.token1.address,
        symbol: vault.token1.symbol || '',
        name: vault.token1.name || '',
        decimals: vault.token1.decimals || 18,
        logoURI: vault.token1.logoURI,
      } : null,

      // Pool data for display
      pool: vault.pool ? {
        volume_24h_USD: vault.pool.volume_24h_USD || 0,
        fees_24h_USD: vault.pool.fees_24h_USD || 0,
        totalValueLockedUSD: vault.pool.totalValueLockedUSD || 0,
      } : null,

      // Basic vault info
      name: vault.name || '',
      fee: vault.fee || 0,
      allowToken0: vault.allowToken0 || false,
      allowToken1: vault.allowToken1 || false,
      vaultTag: vault.vaultTag,

      // Computed values
      volumeChange24h,
      tvlChange24h,
      feesChange24h,
    };
  });
}

/**
 * Process vault contracts with full initialization
 */
async function processVaultContracts(vaults: any[], infoClient: any): Promise<ICHIVaultContract[]> {
  if (!vaults?.length || !infoClient) return [];

  try {
    // Process vaults in batches to avoid memory issues
    const batchSize = 10;
    const processedVaults: ICHIVaultContract[] = [];

    for (let i = 0; i < vaults.length; i += batchSize) {
      const batch = vaults.slice(i, i + batchSize);

      const batchPromises = batch.map(async (vault: any) => {
        try {
          const vaultContract = await getSingleVaultDetails(infoClient, vault.id);

          if (vaultContract) {
            // Skip on-chain heavy calls in serverless caching to avoid provider-related issues
            // Values like tvlUSD will default to 0 in processed output when unavailable
            return vaultContract;
          }
          return null;
        } catch (error) {
          console.error(`Error processing vault ${vault.id}:`, error);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      const validBatchVaults = batchResults.filter(
        (vault): vault is ICHIVaultContract => vault !== null
      );

      processedVaults.push(...validBatchVaults);

      // Small delay between batches to prevent overwhelming the system
      if (i + batchSize < vaults.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return processedVaults;
  } catch (error) {
    console.error('Error processing vault contracts:', error);
    return [];
  }
}

/**
 * Fetch and process vault data from subgraph
 */
export async function fetchAndProcessVaultsData(chainId?: string): Promise<ProcessedVaultsData> {
  try {
    const targetChainId = chainId || DEFAULT_CHAIN_ID.toString();
    console.log(`Fetching vault data from subgraph for chain ${targetChainId}...`);
    const startTime = Date.now();

    // Get the info client for the current chain  
    const infoClient = getSubgraphClientByChainId(targetChainId, 'algebra_info');
    if (!infoClient) {
      throw new Error(`Subgraph client not available for chain ${targetChainId}`);
    }
    
    console.log(`✅ Subgraph client initialized for chain ${targetChainId}`);

    // Fetch vault data
    const vaultsQuery = await getVaultPageData(infoClient, '');
    
    // Process vault contracts with full initialization
    const vaultContracts = await processVaultContracts(
      vaultsQuery.ichiVaults || [],
      infoClient
    );

    // Process into optimized format
    const processedVaults = await processVaultData(
      vaultsQuery,
      vaultContracts,
      targetChainId
    );

    const endTime = Date.now();
    console.log(
      `Vault data fetched and processed in ${endTime - startTime}ms for chain ${targetChainId}`
    );
    console.log(`Processed ${processedVaults.length} vaults`);

    return {
      vaults: processedVaults,
      lastUpdated: Date.now(),
      chainId: targetChainId,
    };
  } catch (error) {
    console.error('Error fetching vault data:', error);
    throw error;
  }
}

/**
 * Cache processed vault data
 */
export async function cacheProcessedVaultsData(
  data: ProcessedVaultsData,
  chainId?: string
): Promise<void> {
  try {
    const vaultsKey = getProcessedVaultsKey(chainId);
    const updateKey = getLastUpdateKey(chainId);

    await Promise.all([
      vaultsCache.set(vaultsKey, JSON.stringify(data), { ex: CACHE_TTL }),
      vaultsCache.set(updateKey, Date.now().toString(), { ex: CACHE_TTL }),
    ]);

    console.log(`Cached ${data.vaults.length} processed vaults for chain ${chainId || 'default'}`);
  } catch (error) {
    console.error('Error caching vault data:', error);
    throw error;
  }
}

/**
 * Get cached processed vault data
 */
export async function getCachedProcessedVaultsData(chainId?: string): Promise<ProcessedVaultsData | null> {
  try {
    const vaultsKey = getProcessedVaultsKey(chainId);
    const cached = await vaultsCache.get(vaultsKey);

    if (!cached) {
      return null;
    }

    const data = JSON.parse(cached as string) as ProcessedVaultsData;
    console.log(`Retrieved ${data.vaults.length} cached vaults for chain ${chainId || 'default'}`);
    return data;
  } catch (error) {
    console.error('Error retrieving cached vault data:', error);
    return null;
  }
}

/**
 * Check if processed cache is stale
 */
export async function isProcessedCacheStale(chainId?: string): Promise<boolean> {
  try {
    const updateKey = getLastUpdateKey(chainId);
    const lastUpdate = await vaultsCache.get(updateKey);

    if (!lastUpdate) {
      return true;
    }

    const age = Date.now() - parseInt(lastUpdate as string);
    return age > STALE_TIME;
  } catch (error) {
    console.error('Error checking cache staleness:', error);
    return true;
  }
}

/**
 * Get processed vault data with fallback to fresh data
 */
export async function getProcessedVaultsDataWithFallback(chainId?: string): Promise<ProcessedVaultsData> {
  try {
    // Try cache first
    const cached = await getCachedProcessedVaultsData(chainId);
    
    if (cached && !await isProcessedCacheStale(chainId)) {
      console.log(`Using cached vault data for chain ${chainId || 'default'}`);
      return cached;
    }

    // Fallback to fresh data
    console.log(`Cache miss/stale for chain ${chainId || 'default'}, fetching fresh vault data...`);
    const fresh = await fetchAndProcessVaultsData(chainId);
    
    // Cache the fresh data
    await cacheProcessedVaultsData(fresh, chainId);
    
    return fresh;
  } catch (error) {
    console.error('Error in getProcessedVaultsDataWithFallback:', error);
    
    // Try to return stale cache as last resort
    const staleCache = await getCachedProcessedVaultsData(chainId);
    if (staleCache) {
      console.log(`Returning stale cache for chain ${chainId || 'default'} due to error`);
      return staleCache;
    }
    
    throw error;
  }
}

/**
 * Fetch and process vault data for all supported chains
 */
export async function fetchAndProcessAllChainsVaultsData(): Promise<Record<string, ProcessedVaultsData>> {
  const results: Record<string, ProcessedVaultsData> = {};
  
  const chainPromises = Object.entries(SUPPORTED_CHAINS).map(async ([name, chainId]) => {
    try {
      console.log(`Fetching vault data for ${name} (${chainId})...`);
      const data = await fetchAndProcessVaultsData(chainId);
      results[chainId] = data;
      console.log(`✅ ${name}: ${data.vaults.length} vaults processed`);
    } catch (error) {
      console.error(`❌ Error fetching vault data for ${name} (${chainId}):`, error);
    }
  });

  await Promise.all(chainPromises);
  return results;
}

/**
 * Cache vault data for all supported chains
 */
export async function cacheAllChainsVaultsData(): Promise<void> {
  const allData = await fetchAndProcessAllChainsVaultsData();
  
  const cachePromises = Object.entries(allData).map(([chainId, data]) =>
    cacheProcessedVaultsData(data, chainId)
  );

  await Promise.all(cachePromises);
  console.log(`🎯 Cached vault data for ${Object.keys(allData).length} chains`);
}

/**
 * Update processed vault cache (called by cron job)
 */
export async function updateProcessedVaultsCache(): Promise<void> {
  console.log('🔄 Starting vault cache update...');
  const startTime = Date.now();

  try {
    await cacheAllChainsVaultsData();
    
    const endTime = Date.now();
    console.log(`✅ Vault cache update completed in ${endTime - startTime}ms`);
  } catch (error) {
    console.error('❌ Error updating vault cache:', error);
    throw error;
  }
}
