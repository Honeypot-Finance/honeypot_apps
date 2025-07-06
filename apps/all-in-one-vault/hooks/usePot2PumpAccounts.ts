import { useQuery } from '@apollo/client';
import {
  POT2PUMP_ACCOUNTS_WITH_ADDRESS_QUERY,
  POT2PUMP_ACCOUNTS_WITHOUT_ADDRESS_QUERY,
  AccountsQueryData,
} from '@/lib/algebra/graphql/clients/leaderboard';
import dayjs from 'dayjs';

// Define Account ordering enum
export enum Account_OrderBy {
  TotalDepositPot2pumpUsd = 'totalDepositPot2pumpUSD',
  Pot2PumpLaunchCount = 'pot2PumpLaunchCount',
  ParticipateCount = 'participateCount',
  TotalSpendUSD = 'totalSpendUSD',
  SwapCount = 'swapCount',
}

export function usePot2PumpAccounts(
  page: number = 1,
  pageSize: number = 10,
  searchAddress: string = '',
  orderBy: Account_OrderBy = Account_OrderBy.TotalDepositPot2pumpUsd
) {
  // Only search when it's a valid Ethereum address format (0x + 40 hex chars)
  const isValidAddress =
    searchAddress &&
    searchAddress.startsWith('0x') &&
    searchAddress.length === 42 &&
    /^0x[a-fA-F0-9]{40}$/.test(searchAddress);

  const { data, loading, error, fetchMore } = useQuery<AccountsQueryData>(
    isValidAddress
      ? POT2PUMP_ACCOUNTS_WITH_ADDRESS_QUERY
      : POT2PUMP_ACCOUNTS_WITHOUT_ADDRESS_QUERY,
    {
      variables: {
        skip: (page - 1) * pageSize,
        first: pageSize,
        orderBy: orderBy,
        address: isValidAddress ? searchAddress.toLowerCase() : undefined,
      },
    }
  );

  const accounts =
    data?.accounts.map((account) => ({
      walletAddress: account.id,
      totalSpend: parseFloat(account.totalSpendUSD || '0'),
      swapCount: parseInt(account.swapCount || '0'),
      poolHoldingCount: parseInt(account.holdingPoolCount || '0'),
      memeTokenCount: parseInt(account.memeTokenHoldingCount || '0'),
      transactions: parseInt(account.platformTxCount || '0'),
      participateCount: parseInt(account.participateCount || '0'),
      totalDepositPot2pumpUSD: account.totalDepositPot2pumpUSD || '0',
      pot2PumpLaunchCount: parseInt(account.pot2PumpLaunchCount || '0'),
      lastActive: account.transaction[0]
        ? dayjs(parseInt(account.transaction[0].timestamp) * 1000).format(
            'MM/DD/YYYY, h:mm:ss A'
          )
        : '-',
    })) ?? [];

  const loadMore = () => {
    return fetchMore({
      variables: {
        skip: data?.accounts.length ?? 0,
        first: pageSize,
      },
    });
  };

  const hasMore = data?.accounts && data.accounts.length >= pageSize;

  return {
    accounts,
    loading,
    error,
    loadMore,
    hasMore: hasMore || false,
  };
}
