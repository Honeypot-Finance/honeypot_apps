import { ApolloClient, gql } from '@apollo/client';
import { useSubgraphClient } from '@honeypot/shared';
import { zeroAddress } from 'viem';

type SwapTransaction = {
  id: string;
  timestamp: string;
  transaction: {
    id: string;
  };
  sender: string;
  recipient: string;
  token0: {
    symbol: string;
  };
  token1: {
    symbol: string;
  };
  amount0: string;
  amount1: string;
  amountUSD: string;
};

type SwapsResponse = {
  swaps: SwapTransaction[];
};

type SwapTransactionsResponse = {
  status: string;
  message: string;
  data: SwapTransaction[];
  pageInfo: {
    hasNextPage: boolean;
  };
};

export async function fetchSwapTransactions(
  client: ApolloClient<any>,
  page: number = 1,
  pageSize: number = 10,
  token1Address: string,
  token2Address: string
): Promise<SwapTransactionsResponse> {
  const skip = (page - 1) * pageSize;

  const query = `
    query GetUSDTWBERASwaps {
      swaps(
        first: ${pageSize}
        skip: ${skip}
        orderBy: timestamp
        orderDirection: desc
        where: {
        or: [
            {
              token0_: {id: "${token1Address.toLowerCase()}"},
              token1_: {id: "${token2Address.toLowerCase()}"}
            }, 
            {
              token0_: {id: "${token2Address.toLowerCase()}"},
              token1_: {id: "${token1Address.toLowerCase()}"}
            }
          ]
        })
        {
        id
        timestamp
        transaction {
          id
        }
        sender
        recipient
        origin
        token0 {
          symbol
        }
        token1 {
          symbol
        }
        amount0
        amount1
        amountUSD
      }
    }
  `;

  const { data } = await client.query<SwapsResponse>({
    query: gql(query),
  });

  return {
    status: 'success',
    message: 'Success',
    data: data.swaps,
    pageInfo: {
      hasNextPage: data.swaps.length === pageSize,
    },
  };
}

export async function fetchAllSwapTransactions(
  client: ApolloClient<any>,
  page: number = 1,
  pageSize: number = 10
): Promise<SwapTransactionsResponse> {
  const skip = (page - 1) * pageSize;

  const query = `
    query GetAllSwaps {
      swaps(
        first: ${pageSize}
        skip: ${skip}
        orderBy: timestamp
        orderDirection: desc
      ) {
        id
        timestamp
        transaction {
          id
          from: id
        }
        sender
        recipient
        origin
        token0 {
          symbol
        }
        token1 {
          symbol
        }
        amount0
        amount1
        amountUSD
      }
    }
  `;

  try {
    const { data } = await client.query<SwapsResponse>({
      query: gql(query),
      fetchPolicy: 'network-only',
    });

    return {
      status: 'success',
      message: 'Success',
      data: data.swaps.map(swap => ({
        ...swap,
        transaction: {
          ...swap.transaction,
          from: swap.sender || swap.origin || swap.transaction.from
        }
      })),
      pageInfo: {
        hasNextPage: data.swaps.length === pageSize,
      },
    };
  } catch (error) {
    console.error('Error fetching all swaps:', error);
    return {
      status: 'error',
      message: 'Failed to fetch transactions',
      data: [],
      pageInfo: {
        hasNextPage: false,
      },
    };
  }
}

export function useSwapTransactions() {
  const infoClient = useSubgraphClient('algebra_info');

  return {
    fetchTransactions: async (
      page: number = 1,
      pageSize: number = 10,
      token1Address: string,
      token2Address: string
    ) => {
      // If both addresses are zero address, fetch all transactions
      if (token1Address === zeroAddress && token2Address === zeroAddress) {
        return fetchAllSwapTransactions(infoClient, page, pageSize);
      }
      
      return fetchSwapTransactions(
        infoClient,
        page,
        pageSize,
        token1Address,
        token2Address
      );
    },
    fetchAllTransactions: async (
      page: number = 1,
      pageSize: number = 10
    ) => {
      return fetchAllSwapTransactions(infoClient, page, pageSize);
    },
  };
}
