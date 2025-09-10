import { NextApiRequest, NextApiResponse } from 'next';
import { clearCorruptedCache, debugCache } from '@/lib/cache/vaults-cache';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { chainId, debug } = req.body;

    if (debug) {
      await debugCache(chainId);
      return res.status(200).json({
        success: true,
        message: 'Cache debug info logged to console',
        chainId: chainId || 'default'
      });
    }

    await clearCorruptedCache(chainId);

    res.status(200).json({
      success: true,
      message: 'Cache cleared successfully',
      chainId: chainId || 'default'
    });

  } catch (error) {
    console.error('❌ Error clearing cache:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to clear cache',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
