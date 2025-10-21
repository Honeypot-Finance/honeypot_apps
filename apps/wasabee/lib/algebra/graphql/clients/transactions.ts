import {
  SwapsQuery,
  SwapsDocument,
  SwapsQueryVariables,
  DepositsQuery,
  DepositsDocument,
  DepositsQueryVariables,
  TransactionsQuery,
  TransactionsDocument,
  TransactionsQueryVariables,
  TransactionType,
  Transaction,
} from '../generated/graphql';
import { useSubgraphClient } from '@honeypot/shared/hooks/useSubgraphClients';
type ParticipantTransaction = {
  id: string;
  account: {
    id: string;
  };
  depositAmount: string;
  refundAmount: string;
  claimLqAmount: string;
  actionType: string;
  createdAt: string;
};

type Pot2PumpTransactions = {
  pot2Pump: {
    participantTransactionHistorys: ParticipantTransaction[];
  };
};

type TransactionsResponse = {
  status: string;
  message: string;
  data: ParticipantTransaction[];
  pageInfo: {
    hasNextPage: boolean;
  };
};

export async function fetchPot2PumpTransactions(
  pairAddress: string,
  launchTokenAddress: string,
  page: number = 1,
  pageSize: number = 10
): Promise<{
  status: string;
  message: string;
  data: TransactionsQuery;
  pageInfo: {
    hasNextPage: boolean;
  };
}> {
  const infoClient = useSubgraphClient('algebra_info');
  const skip = (page - 1) * pageSize;

  const { data } = await infoClient.query<
    TransactionsQuery,
    TransactionsQueryVariables
  >({
    query: TransactionsDocument,
    variables: {
      where: {
        or: [
          {
            type_in: [TransactionType.Swap, TransactionType.Deposit],
            swaps_: {
              token0: launchTokenAddress,
            },
          },
          {
            type_in: [TransactionType.Swap, TransactionType.Deposit],
            swaps_: {
              token1: launchTokenAddress,
            },
          },
          {
            type_in: [TransactionType.Swap, TransactionType.Deposit],
            depositRaisedTokens_: {
              poolAddress: pairAddress,
            },
          },
        ],
      },
      first: pageSize,
      skip,
    },
    fetchPolicy: 'network-only',
  });

  return {
    status: 'success',
    message: 'Success',
    data: data,
    pageInfo: {
      hasNextPage: data.transactions.length === pageSize,
    },
  };
}
