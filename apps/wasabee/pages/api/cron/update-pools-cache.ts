import { NextApiRequest, NextApiResponse } from 'next';
import { updateProcessedPoolsCache } from '@/lib/cache/pools-cache';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verify the request is from Vercel Cron (optional security check)
  const authHeader = req.headers.authorization;
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Cron job triggered: updating pools cache');
    const startTime = Date.now();
    
    await updateProcessedPoolsCache();
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`Pools cache updated successfully in ${duration}ms`);
    
    return res.status(200).json({
      success: true,
      message: 'Pools cache updated successfully',
      duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to update pools cache:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to update pools cache',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
}
