import type { NextApiResponse, NextApiRequest, PageConfig } from 'next';
import { appRouter, caller } from '@/server/_app';
import { networksMap } from '@honeypot/shared/config/chains/network';

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const chainId = request.query.chain;
  if (!chainId) {
    return response.status(400).json({
      s: 'error',
      errmsg: 'chainId is required',
    });
  }

  const res = await caller.priceFeed.getMultipleTokenPrice({
    chainId: chainId as string,
    tokenAddresses: Object.keys(
      networksMap[chainId as string].validatedTokensInfo
    ),
  });

  if (res.status === 'error') {
    return response.status(500).json({
      s: 'error',
      errmsg: res.message,
    });
  } else {
    return response.status(200).json({
      s: 'ok',
      data: res.data.map((d) => ({
        ...networksMap[chainId as string].validatedTokensInfo[d.address],
        address: d.address,
        price: d.price,
        lastUpdated: d.lastUpdated,
      })),
    });
  }
}

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};
