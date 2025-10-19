import type { NextApiRequest, NextApiResponse } from 'next';

const SNAG_API_BASE_URL = 'https://admin.snagsolutions.io/api';
const SNAG_API_KEY = '1349fa8dcfcc47b9be5d9ce11ad1103f';
const ORGANIZATION_ID = 'dc42201d-d1cb-47c2-a3ac-94367cdf40ea';
const WEBSITE_ID = '4a2be9fc-12fb-4b39-bd2c-c721deafce39';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const {
    loyaltyCurrencyId,
    limit = '20',
    startingAfter,
    sortDir = 'desc',
    walletAddress,
  } = req.query;

  if (!loyaltyCurrencyId) {
    return res.status(400).json({ message: 'loyaltyCurrencyId is required' });
  }

  const queryParams = new URLSearchParams({
    organizationId: ORGANIZATION_ID,
    websiteId: WEBSITE_ID,
    loyaltyCurrencyId: loyaltyCurrencyId as string,
    limit: limit as string,
    sortDir: sortDir as string,
  });

  if (startingAfter) {
    queryParams.append('startingAfter', startingAfter as string);
  }

  if (walletAddress) {
    queryParams.append('walletAddress', walletAddress as string);
  }

  try {
    const response = await fetch(
      `${SNAG_API_BASE_URL}/loyalty/accounts?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'X-API-KEY': SNAG_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Snag API error:', errorText);
      return res.status(response.status).json({
        message: `Failed to fetch loyalty accounts: ${response.statusText}`,
        error: errorText,
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching loyalty accounts:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
