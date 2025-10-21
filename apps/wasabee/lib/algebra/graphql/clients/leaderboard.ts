import { gql } from '@apollo/client';
import {
  getSubgraphClientByChainId,
  useSubgraphClient,
} from '@honeypot/shared/lib/contract/token/token';
import { wallet } from '@honeypot/shared/lib/wallet';

export const LEADERBOARD_QUERY = gql`
  query leaderboardStatus {
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

export const ACCOUNTS_WITH_ADDRESS_QUERY = gql`
  query accounts($skip: Int!, $first: Int!, $address: ID!) {
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

export const ACCOUNTS_WITHOUT_ADDRESS_QUERY = gql`
  query accounts($skip: Int!, $first: Int!, $exclude: [ID!]) {
    accounts(
      skip: $skip
      first: $first
      orderBy: totalSpendUSD
      orderDirection: desc
      where: { id_not_in: $exclude }
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

//just top 1 swap accounts
export const TOP_SWAP_ACCOUNTS_QUERY = gql`
  query topSwapAccounts($exclude: [ID!]) {
    accounts(
      skip: 0
      first: 1
      orderBy: swapCount
      orderDirection: desc
      where: { id_not_in: $exclude }
    ) {
      id
      swapCount
    }
  }
`;

//top pot2pump deployer
export const TOP_POT2PUMP_DEPLOYER_QUERY = gql`
  query topPot2PumpDeployer {
    accounts(
      skip: 0
      first: 1
      orderBy: pot2PumpLaunchCount
      orderDirection: desc
    ) {
      id
      pot2PumpLaunchCount
    }
  }
`;

//top participate accounts
export const TOP_PARTICIPATE_ACCOUNTS_QUERY = gql`
  query topParticipateAccounts {
    accounts(
      skip: 0
      first: 1
      orderBy: participateCount
      orderDirection: desc
    ) {
      id
      participateCount
    }
  }
`;

type Factory = {
  txCount: string;
  totalVolumeUSD: string;
  totalVolumeMatic: string;
  totalValueLockedUSD: string;
  totalValueLockedMatic: string;
  untrackedVolumeUSD: string;
  totalValueLockedUSDUntracked: string;
  totalFeesUSD: string;
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
};

export type AccountsQueryData = {
  accounts: Account[];
};

type LeaderboardResponse = {
  status: string;
  message: string;
  data: Factory;
};

export async function fetchLeaderboardData(): Promise<LeaderboardResponse> {
  const infoClient = getSubgraphClientByChainId(
    wallet.currentChainId.toString(),
    'algebra_info'
  );
  const { data } = await infoClient.query<FactoryData>({
    query: LEADERBOARD_QUERY,
  });

  return {
    status: 'success',
    message: 'Success',
    data: data.factories[0],
  };
}

export type PaginationParams = {
  skip: number;
  first: number;
};

export type TopSwapAccountsQueryData = {
  accounts: { id: string; swapCount: string }[];
};

export type TopPot2PumpDeployerQueryData = {
  accounts: { id: string; pot2PumpLaunchCount: string }[];
};

export type TopParticipateAccountsQueryData = {
  accounts: { id: string; participateCount: string }[];
};
