import { gql } from '@apollo/client';
import { getSubgraphClientByChainId } from '@honeypot/shared';
import { wallet } from '@honeypot/shared/lib/wallet';

// Pot2Pump specific queries
export const POT2PUMP_LEADERBOARD_QUERY = gql`
  query pot2pumpLeaderboardStatus {
    factories {
      txCount
      totalVolumeUSD
      totalVolumeMatic
      totalValueLockedUSD
      totalValueLockedMatic
      untrackedVolumeUSD
      totalValueLockedUSDUntracked
      totalMemeCreated
      totalSuccessedMeme
      totalDepositedUSD
    }
  }
`;

export const POT2PUMP_ACCOUNTS_WITH_ADDRESS_QUERY = gql`
  query pot2pumpAccounts(
    $skip: Int!
    $first: Int!
    $address: ID!
    $orderBy: Account_orderBy
  ) {
    accounts(
      skip: $skip
      first: $first
      orderBy: $orderBy
      orderDirection: desc
      where: { id: $address }
    ) {
      id
      swapCount
      holdingPoolCount
      memeTokenHoldingCount
      platformTxCount
      participateCount
      totalSpendUSD
      totalDepositPot2pumpUSD
      pot2PumpLaunchCount
      transaction(first: 1, orderBy: timestamp, orderDirection: desc) {
        timestamp
      }
    }
  }
`;

export const POT2PUMP_ACCOUNTS_WITHOUT_ADDRESS_QUERY = gql`
  query pot2pumpAccounts($skip: Int!, $first: Int!, $orderBy: Account_orderBy) {
    accounts(
      skip: $skip
      first: $first
      orderBy: $orderBy
      orderDirection: desc
    ) {
      id
      swapCount
      holdingPoolCount
      memeTokenHoldingCount
      platformTxCount
      participateCount
      totalSpendUSD
      totalDepositPot2pumpUSD
      pot2PumpLaunchCount
      transaction(first: 1, orderBy: timestamp, orderDirection: desc) {
        timestamp
      }
    }
  }
`;

// Wasabee specific queries
export const WASABEE_LEADERBOARD_QUERY = gql`
  query wasabeeLeaderboardStatus {
    factories {
      txCount
      totalVolumeUSD
      totalVolumeMatic
      totalValueLockedUSD
      totalValueLockedMatic
      totalFeesUSD
      untrackedVolumeUSD
      totalValueLockedUSDUntracked
    }
  }
`;

export const WASABEE_ACCOUNTS_WITH_ADDRESS_QUERY = gql`
  query wasabeeAccounts($skip: Int!, $first: Int!, $address: ID!) {
    accounts(
      skip: $skip
      first: $first
      orderBy: totalSpendUSD
      orderDirection: desc
      where: { id: $address }
    ) {
      id
      swapCount
      holdingPoolCount
      memeTokenHoldingCount
      platformTxCount
      participateCount
      totalSpendUSD
      transaction(first: 1, orderBy: timestamp, orderDirection: desc) {
        timestamp
      }
    }
  }
`;

export const WASABEE_ACCOUNTS_WITHOUT_ADDRESS_QUERY = gql`
  query wasabeeAccounts($skip: Int!, $first: Int!) {
    accounts(
      skip: $skip
      first: $first
      orderBy: totalSpendUSD
      orderDirection: desc
    ) {
      id
      swapCount
      holdingPoolCount
      memeTokenHoldingCount
      platformTxCount
      participateCount
      totalSpendUSD
      transaction(first: 1, orderBy: timestamp, orderDirection: desc) {
        timestamp
      }
    }
  }
`;

// Total users query
export const TOTAL_USERS_QUERY = gql`
  query totalUsers {
    factories {
      accountCount
    }
  }
`;

// Type definitions
export type Factory = {
  txCount: string;
  totalVolumeUSD: string;
  totalVolumeMatic: string;
  totalValueLockedUSD: string;
  totalValueLockedMatic: string;
  totalFeesUSD: string;
  untrackedVolumeUSD: string;
  totalValueLockedUSDUntracked: string;
  totalMemeCreated?: string;
  totalSuccessedMeme?: string;
  totalDepositedUSD?: string;
  accountCount?: string;
};

export type FactoryData = {
  factories: Factory[];
};

export type Account = {
  id: string;
  swapCount: string;
  holdingPoolCount: string;
  memeTokenHoldingCount: string;
  platformTxCount: string;
  participateCount: string;
  totalSpendUSD: string;
  transaction: { timestamp: string }[];
  totalDepositPot2pumpUSD?: string;
  pot2PumpLaunchCount?: string;
};

export type AccountsQueryData = {
  accounts: Account[];
};

export type PaginationParams = {
  skip: number;
  first: number;
};

// Utility functions
export async function fetchPot2PumpLeaderboardData(): Promise<{
  status: string;
  message: string;
  data: Factory;
}> {
  try {
    const infoClient = getSubgraphClientByChainId(
      wallet.currentChainId.toString(),
      'algebra_info'
    );
    const { data } = await infoClient.query<FactoryData>({
      query: POT2PUMP_LEADERBOARD_QUERY,
    });

    return {
      status: 'success',
      message: 'Success',
      data: data.factories[0],
    };
  } catch (error) {
    console.error('Error fetching pot2pump leaderboard data:', error);
    throw error;
  }
}

export async function fetchWasabeeLeaderboardData(): Promise<{
  status: string;
  message: string;
  data: Factory;
}> {
  try {
    const infoClient = getSubgraphClientByChainId(
      wallet.currentChainId.toString(),
      'algebra_info'
    );
    const { data } = await infoClient.query<FactoryData>({
      query: WASABEE_LEADERBOARD_QUERY,
    });

    return {
      status: 'success',
      message: 'Success',
      data: data.factories[0],
    };
  } catch (error) {
    console.error('Error fetching wasabee leaderboard data:', error);
    throw error;
  }
}
