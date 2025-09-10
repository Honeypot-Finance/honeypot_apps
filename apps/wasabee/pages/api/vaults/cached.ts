import { NextApiRequest, NextApiResponse } from 'next';
import {
  getProcessedVaultsDataWithFallback,
  getCachedProcessedVaultsData,
  isProcessedCacheStale,
  clearVaultsCache,
  ProcessedVaultsData,
} from '@/lib/cache/vaults-cache';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { force, chainId, clearCache } = req.query;
    const targetChainId = Array.isArray(chainId) ? chainId[0] : chainId;

    console.log(`📥 Vault cache request for chain: ${targetChainId || 'default'}`);

    // Handle cache clearing
    if (clearCache === 'true') {
      console.log('🗑️ Clearing cache as requested');
      await clearVaultsCache(targetChainId);
      return res.status(200).json({
        success: true,
        message: 'Cache cleared successfully',
        chainId: targetChainId || 'default',
        timestamp: new Date().toISOString(),
      });
    }

    let data: ProcessedVaultsData;

    if (force === 'true') {
      // Force refresh - bypass cache
      console.log('🔄 Force refresh requested, bypassing cache');
      data = await getProcessedVaultsDataWithFallback(targetChainId);
    } else {
      // Normal flow - try cache first
      const cached = await getCachedProcessedVaultsData(targetChainId);
      const isStale = await isProcessedCacheStale(targetChainId);

      if (cached && !isStale) {
        console.log(`✅ Serving fresh cached vault data for chain ${targetChainId || 'default'}`);
        data = cached;
      } else if (cached && isStale) {
        console.log(`⚠️ Serving stale cached vault data for chain ${targetChainId || 'default'}`);
        data = cached;
        
        // TODO: Consider triggering background refresh here
        // getProcessedVaultsDataWithFallback(targetChainId).catch(console.error);
      } else {
        console.log(`❌ No cached vault data, fetching fresh for chain ${targetChainId || 'default'}`);
        data = await getProcessedVaultsDataWithFallback(targetChainId);
      }
    }

    // Add cache metadata to response
    const isStale = await isProcessedCacheStale(targetChainId);
    
    res.status(200).json({
      success: true,
      vaults: data.vaults,
      chainId: data.chainId,
      lastUpdated: data.lastUpdated,
      count: data.vaults.length,
      cached: !force,
      stale: isStale,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error serving cached vault data:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch vault data',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
}
