import { NextApiRequest, NextApiResponse } from 'next';
import { getCachedProcessedPoolsData, isProcessedCacheStale } from '@/lib/cache/pools-cache';
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
    
    // Check processed cache data
    console.log('Checking cached processed pools data...');
    const startTime = Date.now();
    const cached = await getCachedProcessedPoolsData();
    const endTime = Date.now();
    
    console.log(`Cache read took: ${endTime - startTime}ms`);
    
    if (cached) {
      console.log('✅ Processed Cache EXISTS');
      console.log(`Processed pools count: ${cached.pools.length}`);
      console.log(`Last updated: ${new Date(cached.lastUpdated).toISOString()}`);
      console.log(`Age: ${Date.now() - cached.lastUpdated}ms`);
    } else {
      console.log('❌ Processed Cache is EMPTY');
    }
    
    const isStale = await isProcessedCacheStale();
    console.log(`Processed cache is stale: ${isStale}`);
    
    // Check individual cache keys
    const { createCache } = await import('@/lib/kv');
    const poolsCache = createCache('pools');
    const [processedPools, lastUpdate] = await Promise.all([
      poolsCache.get('processed-pools'),
      poolsCache.get('last-update'),
    ]);
    
    return res.status(200).json({
      kvConnection: testValue === 'working',
      cacheExists: !!cached,
      cacheReadTime: endTime - startTime,
      isStale,
      data: cached ? {
        processedPoolsCount: cached.pools.length,
        lastUpdated: cached.lastUpdated,
        age: Date.now() - cached.lastUpdated,
        samplePool: cached.pools[0] ? {
          id: cached.pools[0].id,
          tvlUSD: cached.pools[0].tvlUSD,
          volume24USD: cached.pools[0].volume24USD,
          avgApr: cached.pools[0].avgApr,
        } : null,
      } : null,
      rawKeys: {
        processedPools: !!processedPools,
        lastUpdate: !!lastUpdate,
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
