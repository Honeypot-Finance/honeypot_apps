import { NextApiRequest, NextApiResponse } from 'next';
import { getProcessedPoolsDataWithFallback, getCachedProcessedPoolsData, isProcessedCacheStale } from '@/lib/cache/pools-cache';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { force, chainId } = req.query;
    console.log(req.query,"req querey is")
    const targetChainId = typeof chainId === 'string' ? chainId : undefined;
    
    // If force=true, always fetch fresh data
    if (force === 'true') {
      console.log(`Force refresh requested for chain ${targetChainId || 'default'}`);
      const data = await getProcessedPoolsDataWithFallback(targetChainId);
      return res.status(200).json({
        ...data,
        cached: false,
        source: 'fresh',
      });
    }

    // Try to get cached data first
    const cached = await getCachedProcessedPoolsData(targetChainId);
    
    if (cached && !(await isProcessedCacheStale(targetChainId))) {
      console.log(`Serving processed data from cache for chain ${cached.chainId}`);
      return res.status(200).json({
        ...cached,
        cached: true,
        source: 'cache',
      });
    }

    // Cache miss or stale - get fresh data
    console.log(`Cache miss or stale - fetching and processing fresh data for chain ${targetChainId || 'default'}`);
    const data = await getProcessedPoolsDataWithFallback(targetChainId);
    
    return res.status(200).json({
      ...data,
      cached: false,
      source: cached ? 'stale-fallback' : 'fresh',
    });
  } catch (error) {
    console.error('Failed to get pools data:', error);
    
    return res.status(500).json({
      error: 'Failed to get pools data',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
