// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { LibrarySymbolInfo } from '@/public/static/charting_library/charting_library';
import { chainsMap } from '@honeypot/shared/config/chains/chainBaseConfig';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<LibrarySymbolInfo>
) {
  const ticker = req.query.symbol as string;
  if (!ticker) {
    return res.status(400);
  }

  const symbol = ticker.split(':')[0];
  const chain = ticker.split(':')[1];
  const address = ticker.split(':')[2];
  const chainName = chainsMap[chain]?.name ?? '';

  res.status(200).json({
    name: symbol + ':' + chainName,
    ticker: ticker,
    description: '',
    type: '',
    session: '0000-0000',
    exchange: chainsMap[chain].name,
    listed_exchange: '',
    timezone: 'Etc/UTC',
    format: 'price',
    pricescale: 100000000,
    minmov: 1,
  });
}
