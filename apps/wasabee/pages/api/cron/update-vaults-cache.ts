import { NextApiRequest, NextApiResponse } from 'next';
import { updateProcessedVaultsCache } from '@/lib/cache/vaults-cache';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests (Vercel cron jobs use POST)
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Verify the request is from Vercel cron (optional security)
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn('Unauthorized cron request');
    // Still allow if CRON_SECRET is not set (for development)
    if (process.env.CRON_SECRET) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  }

  try {
    console.log('🔄 Vault cache update cron job started');
    const startTime = Date.now();

    await updateProcessedVaultsCache();

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`✅ Vault cache update completed in ${duration}ms`);

    res.status(200).json({
      success: true,
      message: 'Vault cache updated successfully',
      duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error in vault cache update cron:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to update vault cache',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
}
