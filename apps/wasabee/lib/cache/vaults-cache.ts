import { createCache } from '@/lib/kv';
import { getVaultPageData, getSingleVaultDetails } from '@/lib/algebra/graphql/clients/vaults';
import { VaultsSortedByHoldersQuery } from '@/lib/algebra/graphql/generated/graphql';
import { ICHIVaultContract } from '@honeypot/shared';
import { wallet } from '@honeypot/shared/lib/wallet';
import { getSubgraphClientByChainId } from '@honeypot/shared';
import { DEFAULT_CHAIN_ID } from '@/config/algebra/default-chain-id';

// Cache configuration
const CACHE_TTL = 10 * 60; // 10 minutes in seconds (Redis/KV expiration)
const STALE_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds (when we consider cache stale but still usable)

// Supported chains for vault caching  
export const SUPPORTED_CHAINS = {
  BERACHAIN: '80094',
  BSC: '56',
} as const;

// Minimal types for UI display only
export interface MinimalToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
}

export interface MinimalVaultTag {
  tag: string;
  bgColor: string;
  textColor: string;
  tooltip?: string;
}

export interface ProcessedVault {
  // Essential fields for display only
  address: string;
  apr: number;
  detailedApr: {
    feeApr_1d: number;
    feeApr_3d: number;
    feeApr_7d: number;
    feeApr_30d: number;
  };
  tvlUSD: number;

  // Minimal token info for TokenLogo and display
  token0: MinimalToken | null;
  token1: MinimalToken | null;

  // Only pool fields actually displayed
  pool: {
    volume_24h_USD: number;
    fees_24h_USD: number;
  } | null;

  // Allow tokens for UI
  allowToken0: boolean;
  allowToken1: boolean;
  
  // Vault tag for display
  vaultTag?: MinimalVaultTag;
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
 * Process raw vault data into minimal UI-ready format
 * OPTIMIZATION: Only stores fields that are actually displayed in the UI
 * This reduces Vercel KV storage by ~70% compared to storing full vault objects
 * 
 * UI fields tracked:
 * - VaultRow: address, apr, detailedApr, tvlUSD, pool.volume_24h_USD, pool.fees_24h_USD, 
 *   allowToken0, allowToken1, token0/1.symbol/address/name/decimals, vaultTag.*
 * - VaultCard: Same fields as VaultRow
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
    return {
      // Essential fields displayed in UI
      address: vault.address,
      apr: vault.apr || 0,
      detailedApr: vault.detailedApr || {
        feeApr_1d: 0,
        feeApr_3d: 0,
        feeApr_7d: 0,
        feeApr_30d: 0,
      },
      tvlUSD: vault.tvlUSD || 0,

      // Minimal token info - only what's needed for TokenLogo and display
      token0: vault.token0 ? {
        address: vault.token0.address,
        symbol: vault.token0.symbol || '',
        name: vault.token0.name || '',
        decimals: vault.token0.decimals || 18,
      } : null,

      token1: vault.token1 ? {
        address: vault.token1.address,
        symbol: vault.token1.symbol || '',
        name: vault.token1.name || '',
        decimals: vault.token1.decimals || 18,
      } : null,

      // Only pool fields actually displayed in UI
      pool: vault.pool ? {
        volume_24h_USD: vault.pool.volume_24h_USD || 0,
        fees_24h_USD: vault.pool.fees_24h_USD || 0,
      } : null,

      // Allow tokens for UI display
      allowToken0: vault.allowToken0 || false,
      allowToken1: vault.allowToken1 || false,
      
      // Vault tag for display (if exists)
      vaultTag: vault.vaultTag ? {
        tag: vault.vaultTag.tag || '',
        bgColor: vault.vaultTag.bgColor || '#000000',
        textColor: vault.vaultTag.textColor || '#ffffff',
        tooltip: vault.vaultTag.tooltip,
      } : undefined,
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
    // Validate data before caching
    if (!data || !data.vaults || !Array.isArray(data.vaults)) {
      throw new Error('Invalid data structure for caching');
    }

    const vaultsKey = getProcessedVaultsKey(chainId);
    const updateKey = getLastUpdateKey(chainId);

    console.log(`🔄 Attempting to cache data for chain ${chainId || 'default'}`);
    console.log(`📝 Cache keys - vaults: "${vaultsKey}", update: "${updateKey}"`);
    console.log(`📊 Data to cache: ${data.vaults.length} vaults, lastUpdated: ${data.lastUpdated}`);

    // Serialize data and validate the result
    const serializedData = JSON.stringify(data);
    if (serializedData === '[object Object]' || serializedData === 'undefined') {
      throw new Error('Data serialization failed, got invalid string representation');
    }

    console.log(`📦 Serialized data length: ${serializedData.length} characters`);
    console.log(`⏰ Cache TTL: ${CACHE_TTL} seconds`);

    const cacheResults = await Promise.all([
      vaultsCache.set(vaultsKey, serializedData, { ex: CACHE_TTL }),
      vaultsCache.set(updateKey, Date.now().toString(), { ex: CACHE_TTL }),
    ]);

    console.log(`✅ Cache set results:`, cacheResults);

    // Immediately verify the cache was saved
    const verifyVaults = await vaultsCache.get(vaultsKey);
    const verifyUpdate = await vaultsCache.get(updateKey);
    
    console.log(`🔍 Verification - vaults cached:`, !!verifyVaults, `(type: ${typeof verifyVaults})`);
    console.log(`🔍 Verification - update cached:`, !!verifyUpdate, `(type: ${typeof verifyUpdate})`);
    
    if (verifyVaults) {
      console.log(`🔍 Verification - cached data length: ${verifyVaults.toString().length}`);
    }

    console.log(`✅ Successfully cached ${data.vaults.length} processed vaults for chain ${chainId || 'default'}`);
  } catch (error) {
    console.error('❌ Error caching vault data:', error);
    throw error;
  }
}

/**
 * Get cached processed vault data
 */
export async function getCachedProcessedVaultsData(chainId?: string): Promise<ProcessedVaultsData | null> {
  try {
    const vaultsKey = getProcessedVaultsKey(chainId);
    console.log(`🔍 Looking for cached data with key: "${vaultsKey}" for chain ${chainId || 'default'}`);
    
    const cached = await vaultsCache.get(vaultsKey);
    console.log(`🔍 Cache lookup result:`, !!cached, `(type: ${typeof cached})`);
    
    if (cached) {
      console.log(`🔍 Cached data length: ${cached.toString().length} characters`);
    } else {
      console.log(`❌ No cached data found for key: "${vaultsKey}"`);
    }

    if (!cached) {
      return null;
    }

    // Validate cached data before parsing
    if (typeof cached !== 'string') {
      console.error('❌ Cached data is not a string, type:', typeof cached);
      console.error('❌ This indicates corrupted cache data. Clearing cache...');
      // Clear the corrupted cache entry
      await clearVaultsCache(chainId);
      return null;
    }

    if (cached === '[object Object]' || cached.toString() === '[object Object]') {
      console.error('Cached data is "[object Object]", clearing invalid cache entry');
      // Clear the invalid cache entry
      await vaultsCache.set(vaultsKey, '', { ex: 1 }); // Set to expire in 1 second
      return null;
    }

    const data = JSON.parse(cached) as ProcessedVaultsData;
    
    // Validate parsed data structure
    if (!data.vaults || !Array.isArray(data.vaults)) {
      console.error('Invalid cached data structure:', data);
      return null;
    }

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
    console.log(`🕐 Checking staleness with key: "${updateKey}" for chain ${chainId || 'default'}`);
    
    const lastUpdate = await vaultsCache.get(updateKey);
    console.log(`🕐 Last update timestamp:`, lastUpdate, `(type: ${typeof lastUpdate})`);

    if (!lastUpdate) {
      console.log(`🕐 No last update found, considering stale`);
      return true;
    }

    const lastUpdateTime = parseInt(lastUpdate as string);
    const age = Date.now() - lastUpdateTime;
    const isStale = age > STALE_TIME;
    
    console.log(`🕐 Cache age: ${age}ms, stale threshold: ${STALE_TIME}ms, is stale: ${isStale}`);
    console.log(`🕐 Last updated: ${new Date(lastUpdateTime).toISOString()}`);
    
    return isStale;
  } catch (error) {
    console.error('❌ Error checking cache staleness:', error);
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
 * Clear cache for a specific chain
 */
export async function clearVaultsCache(chainId?: string): Promise<void> {
  try {
    const vaultsKey = getProcessedVaultsKey(chainId);
    const updateKey = getLastUpdateKey(chainId);
    
    await Promise.all([
      vaultsCache.set(vaultsKey, '', { ex: 1 }),
      vaultsCache.set(updateKey, '', { ex: 1 }),
    ]);
    
    console.log(`Cleared vault cache for chain ${chainId || 'default'}`);
  } catch (error) {
    console.error('Error clearing vault cache:', error);
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

}

/**
 * Clear corrupted cache entries for a specific chain
 */
export async function clearCorruptedCache(chainId?: string): Promise<void> {
  try {
    const vaultsKey = getProcessedVaultsKey(chainId);
    const updateKey = getLastUpdateKey(chainId);

    await Promise.all([
      vaultsCache.set(vaultsKey, '', { ex: 1 }), // Set to expire in 1 second
      vaultsCache.set(updateKey, '', { ex: 1 }),
    ]);

    console.log(`Cleared corrupted cache for chain ${chainId || 'default'}`);
  } catch (error) {
    console.error('Error clearing corrupted cache:', error);
  }
}

/**
 * Debug cache contents for a specific chain
 */
export async function debugCache(chainId?: string): Promise<void> {
  try {
    const vaultsKey = getProcessedVaultsKey(chainId);
    const updateKey = getLastUpdateKey(chainId);

    const vaultsData = await vaultsCache.get(vaultsKey);
    const updateData = await vaultsCache.get(updateKey);

    console.log(`Debug cache for chain ${chainId || 'default'}:`);
    console.log(`Vaults key: ${vaultsKey}`);
    console.log(`Vaults data type: ${typeof vaultsData}`);
    console.log(`Vaults data preview: ${typeof vaultsData === 'string' ? vaultsData.substring(0, 100) + '...' : vaultsData}`);
    console.log(`Update key: ${updateKey}`);
    console.log(`Update data: ${updateData}`);
  } catch (error) {
    console.error('Error debugging cache:', error);
  }
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
