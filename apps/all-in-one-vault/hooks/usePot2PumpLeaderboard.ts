import { useQuery } from '@apollo/client';
import { POT2PUMP_LEADERBOARD_QUERY } from '@/lib/algebra/graphql/clients/leaderboard';
import BigNumber from 'bignumber.js';
import type { FactoryData } from '@/lib/algebra/graphql/clients/leaderboard';
import { wallet } from '@honeypot/shared/lib/wallet';

export function usePot2PumpLeaderboard() {
  const { data, loading, error, refetch } = useQuery<FactoryData>(
    POT2PUMP_LEADERBOARD_QUERY
  );

  const formatValue = (value: string) => {
    const bn = new BigNumber(value || '0');
    return {
      usd: `$${bn.toFormat(2)}`,
      matic: `${bn.toFormat(2)} ${wallet.currentChain?.nativeToken?.symbol}`,
    };
  };

  const stats = data?.factories[0]
    ? {
        totalMemeCreated: {
          title: 'Total Meme Created',
          value: data.factories[0].totalMemeCreated,
        },
        totalSuccessedMeme: {
          title: 'Total Successed Meme',
          value: data.factories[0].totalSuccessedMeme,
        },
        totalDepositedUSD: {
          title: 'Total Deposited USD',
          value: data.factories[0].totalDepositedUSD,
        },
      }
    : null;

  return {
    stats,
    loading,
    error,
    refetch,
  };
}
