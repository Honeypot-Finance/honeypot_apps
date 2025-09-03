import { NextApiRequest, NextApiResponse } from 'next';
import { getCachedProcessedPoolsData, isProcessedCacheStale, SUPPORTED_CHAINS } from '@/lib/cache/pools-cache';
import { kv } from '@/lib/kv';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log('🔍 Debugging cache status...');
    
    // Check raw KV connection
    console.log('Testing raw KV connection...');
    const testKey = 'test-connection';
    await kv.set(testKey, 'working', { ex: 60 });
    const testValue = await kv.get(testKey);
    console.log('Raw KV test:', testValue === 'working' ? '✅ Working' : '❌ Failed');
    
    // Check processed cache data for all supported chains
    console.log('Checking cached processed pools data for all chains...');
    const chainIds = Object.values(SUPPORTED_CHAINS);
    const chainStatuses: Record<string, any> = {};
    
    for (const chainId of chainIds) {
      const startTime = Date.now();
      const cached = await getCachedProcessedPoolsData(chainId);
      const endTime = Date.now();
      
      console.log(`Cache read for chain ${chainId} took: ${endTime - startTime}ms`);
      
      if (cached) {
        console.log(`✅ Processed Cache EXISTS for chain ${chainId}`);
        console.log(`Processed pools count: ${cached.pools.length}`);
        console.log(`Last updated: ${new Date(cached.lastUpdated).toISOString()}`);
        console.log(`Age: ${Date.now() - cached.lastUpdated}ms`);
      } else {
        console.log(`❌ Processed Cache is EMPTY for chain ${chainId}`);
      }
      
      const isStale = await isProcessedCacheStale(chainId);
      console.log(`Processed cache is stale for chain ${chainId}: ${isStale}`);
      
      chainStatuses[chainId] = {
        exists: !!cached,
        readTime: endTime - startTime,
        isStale,
        data: cached ? {
          poolsCount: cached.pools.length,
          lastUpdated: cached.lastUpdated,
          age: Date.now() - cached.lastUpdated,
        } : null,
      };
    }
    
    // Check individual cache keys for default chain
    const { createCache } = await import('@/lib/kv');
    const poolsCache = createCache('pools');
    const defaultChainId = Object.values(SUPPORTED_CHAINS)[0];
    const [processedPools, lastUpdate] = await Promise.all([
      poolsCache.get(`processed-pools-${defaultChainId}`),
      poolsCache.get(`last-update-${defaultChainId}`),
    ]);
    
    return res.status(200).json({
      kvConnection: testValue === 'working',
      supportedChains: Object.keys(SUPPORTED_CHAINS),
      chainStatuses,
      rawKeys: {
        processedPools: !!processedPools,
        lastUpdate: !!lastUpdate,
      },
      summary: {
        totalChains: chainIds.length,
        cachedChains: Object.values(chainStatuses).filter(status => status.exists).length,
        totalPools: Object.values(chainStatuses).reduce((sum, status) => 
          sum + (status.data?.poolsCount || 0), 0
        ),
      }
    });
  } catch (error) {
    console.error('Debug error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
