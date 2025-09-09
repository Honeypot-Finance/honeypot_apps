import { NextApiRequest, NextApiResponse } from 'next';
import {
  getCachedProcessedVaultsData,
  isProcessedCacheStale,
  SUPPORTED_CHAINS,
} from '@/lib/cache/vaults-cache';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const results: Record<string, any> = {};
    const chainStatus = [];

    // Check each supported chain
    for (const [chainName, chainId] of Object.entries(SUPPORTED_CHAINS)) {
      try {
        const cached = await getCachedProcessedVaultsData(chainId);
        const isStale = await isProcessedCacheStale(chainId);

        const status = {
          chainName,
          chainId,
          hasCachedData: !!cached,
          vaultCount: cached?.vaults?.length || 0,
          lastUpdated: cached?.lastUpdated || null,
          lastUpdatedFormatted: cached?.lastUpdated 
            ? new Date(cached.lastUpdated).toISOString()
            : null,
          isStale,
          cacheAge: cached?.lastUpdated 
            ? Date.now() - cached.lastUpdated
            : null,
          cacheAgeMinutes: cached?.lastUpdated 
            ? Math.round((Date.now() - cached.lastUpdated) / (1000 * 60))
            : null,
        };

        chainStatus.push(status);
        results[chainId] = status;
      } catch (error) {
        chainStatus.push({
          chainName,
          chainId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Summary
    const summary = {
      totalChains: Object.keys(SUPPORTED_CHAINS).length,
      chainsWithData: chainStatus.filter(s => s.hasCachedData).length,
      totalVaultsCached: chainStatus.reduce((sum, s) => sum + (s.vaultCount || 0), 0),
      staleChains: chainStatus.filter(s => s.isStale).length,
    };

    res.status(200).json({
      success: true,
      summary,
      chains: chainStatus,
      rawResults: results,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error checking vault cache status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check vault cache status',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
}
