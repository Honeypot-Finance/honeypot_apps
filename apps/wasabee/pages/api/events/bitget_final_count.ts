import { put } from '@vercel/blob';
import type { NextApiResponse, NextApiRequest, PageConfig } from 'next';
import { getAccountSwapsWithPools } from '@/lib/algebra/graphql/clients/account';
import { getFullBitgetEventsParticipantList } from '@/lib/algebra/graphql/clients/bitget_event';

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const participants = await getFullBitgetEventsParticipantList();

  const checkTotalBeraReward = Object.values(participants).reduce(
    (acc, participant) => acc + participant.rewardAmountBERA,
    0
  );

  const checkTotalParticipantCount = Object.values(participants).reduce(
    (acc, participant) => acc + 1,
    0
  );

  const checkTotalAmountUsdTraded = Object.values(participants).reduce(
    (acc, participant) => acc + participant.participatedAmountUsd,
    0
  );

  console.log('checkTotalBeraReward', checkTotalBeraReward);
  console.log('checkTotalParticipantCount', checkTotalParticipantCount);
  console.log('checkTotalAmountUsdTraded', checkTotalAmountUsdTraded);
  return response.status(200).json(participants);
}
