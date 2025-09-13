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


      // Normal flow - try cache first
      const cached = await getCachedProcessedVaultsData(targetChainId);
   

    
      if(cached)
        data = cached!;
      else
        data = await getProcessedVaultsDataWithFallback(targetChainId);
    
      
   
    

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
