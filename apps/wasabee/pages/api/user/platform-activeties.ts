import type { NextApiResponse, NextApiRequest, PageConfig } from 'next';
import { getAccountSwapsWithPools } from '@/lib/algebra/graphql/clients/account';
import { getSingleBitgetParticipantInfo } from '@/lib/algebra/graphql/clients/bitget_event';
import { getInfoClientByChainId } from '@/lib/hooks/useSubgraphClients';
import { wallet } from '@/services/wallet';
import { DEFAULT_CHAIN_ID } from '@/config/algebra/default-chain-id';

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const accountId = request.query.accountid as string;
  let totalAmountUsdTraded = 0;
  let totalSwaps = 0;
  const infoClient = getInfoClientByChainId(DEFAULT_CHAIN_ID.toString());
  const amountUsdTradedForEachPool: Record<
    string,
    { pair: string; amountUsd: number; swaps: number }
  > = {
    '0xa61d8220f35947cce2f6bfc0405dbfca167336da': {
      pair: 'XI / HONEY',
      swaps: 0,
      amountUsd: 0,
    },
    '0xb228eefe1c9fecd615a242fd3ea99a4e129e5a78': {
      pair: 'BERACHAIN / WBERA',
      swaps: 0,
      amountUsd: 0,
    },
    '0xe86c89a85e9d1b2d514477fee05d61603681f53a': {
      pair: 'Q5 / WBERA',
      swaps: 0,
      amountUsd: 0,
    },
    '0xc1014c1b2b131f87d4dd6ddfd9e3b0ab68fcd631': {
      pair: 'WBERA / HENLO',
      swaps: 0,
      amountUsd: 0,
    },
  };

  if (!accountId) {
    return response.status(400).json({ error: 'accountid is required' });
  }

  const pools = [
    '0xa61d8220f35947cce2f6bfc0405dbfca167336da', // XI / HONEY
    '0xb228eefe1c9fecd615a242fd3ea99a4e129e5a78', // BERACHAIN / WBERA
    '0xe86c89a85e9d1b2d514477fee05d61603681f53a', // Q5 / WBERA
    '0xc1014c1b2b131f87d4dd6ddfd9e3b0ab68fcd631', // WBERA / HENLO
  ];

  const swaps = await getAccountSwapsWithPools(infoClient, accountId, pools);
  const bitgetParticipantInfo = await getSingleBitgetParticipantInfo(
    infoClient,
    accountId
  );

  console.log('swaps', swaps);
  console.log('bitgetParticipantInfo', bitgetParticipantInfo);

  swaps.account?.transaction.map((transaction) => {
    transaction.swaps.map((swap) => {
      const swapPool = amountUsdTradedForEachPool[swap.pool.id.toLowerCase()];
      if (swapPool) {
        totalSwaps += 1;
        swapPool.swaps += 1;
      }
    });
  });

  bitgetParticipantInfo?.map((participant: any) => {
    totalAmountUsdTraded += Number(participant.amountUSD);
    amountUsdTradedForEachPool[participant.pool.id.toLowerCase()].amountUsd +=
      Number(participant.amountUSD);
  });

  return response.status(200).json({
    status: totalAmountUsdTraded >= 10 ? '1' : '0',
    data: {
      userAddress: accountId,
      totalAmountUsdTraded,
      totalSwaps,
      amountUsdTradedForEachPool,
    },
  });
}
