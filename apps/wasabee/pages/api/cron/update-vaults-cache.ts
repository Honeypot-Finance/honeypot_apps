import { NextApiRequest, NextApiResponse } from 'next';
import { updateProcessedVaultsCache } from '@/lib/cache/vaults-cache';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests (Vercel cron jobs use POST)
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const startTime = Date.now();

    await updateProcessedVaultsCache();

    const endTime = Date.now();
    const duration = endTime - startTime;

    res.status(200).json({
      success: true,
      message: 'Vault cache updated successfully',
      duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update vault cache',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
}
