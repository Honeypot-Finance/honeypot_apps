import type { NextApiResponse, NextApiRequest, PageConfig } from 'next';
import { networksMap } from '@honeypot/shared/config/chains/network';
import { DOMAIN_MAP } from '@/config/allAppPath';

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

  const network = networksMap[chainId as string];
  const validatedTokensInfo = Object.entries(network.validatedTokensInfo).map(
    ([address, tokenInfo]) => {
      if (!tokenInfo.logoURI.startsWith('https://')) {
        tokenInfo.logoURI = DOMAIN_MAP.WASABEE + tokenInfo.logoURI;
      }
      return {
        ...tokenInfo,
        address,
      };
    }
  );

  return response.status(200).json({
    s: 'ok',
    data: validatedTokensInfo,
  });
}

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};
