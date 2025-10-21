import { ApolloClient, gql } from '@apollo/client';
import { useSubgraphClient } from '@honeypot/shared/hooks/useSubgraphClients';

export type LimitOrder = {
  id: string;
  owner: string;
  pool: string;
  liquidity: string;
  initialLiquidity: string;
  killedLiquidity: string;
  tickLower: string | number;
  tickUpper: string | number;
  zeroToOne: boolean;
  killed: boolean;
  placeTimestamp: string;
  closeTimestamp: string;
  epoch: {
    id: string;
  };
  poolData?: {
    token0: {
      id: string;
      symbol: string;
    };
    token1: {
      id: string;
      symbol: string;
    };
  };
};

type LimitOrdersResponse = {
  limitOrders: LimitOrder[];
};

type LimitOrdersResult = {
  status: string;
  message: string;
  data: LimitOrder[];
  pageInfo: {
    hasNextPage: boolean;
  };
};

export async function fetchLimitOrders(
  client: ApolloClient<any>,
  page: number = 1,
  pageSize: number = 10,
  owner?: string,
  poolAddress?: string,
  isOpen?: boolean
): Promise<LimitOrdersResult> {
  const skip = (page - 1) * pageSize;

  // Build where clause based on old component structure
  const whereConditions: string[] = [];
  if (owner) {
    whereConditions.push(`owner: "${owner.toLowerCase()}"`);
  }
  if (poolAddress) {
    whereConditions.push(`pool: "${poolAddress.toLowerCase()}"`);
  }

  const whereClause =
    whereConditions.length > 0
      ? `where: { ${whereConditions.join(', ')} }`
      : '';

  const query = `
    query GetLimitOrders {
      limitOrders(
        first: ${pageSize}
        skip: ${skip}
        orderBy: placeTimestamp
        orderDirection: desc
        ${whereClause}
      ) {
        id
        owner
        pool
        liquidity
        initialLiquidity
        killedLiquidity
        tickLower
        tickUpper
        zeroToOne
        killed
        placeTimestamp
        closeTimestamp
        epoch {
          id
        }
      }
    }
  `;

  try {
    const { data } = await client.query<LimitOrdersResponse>({
      query: gql(query),
      fetchPolicy: 'no-cache', // Bypass all caching completely
      context: {
        headers: {
          'x-request-time': Date.now().toString(), // Force unique request
          'cache-control': 'no-cache', // HTTP cache control
        },
      },
    });

    let filteredData = data.limitOrders;

    // Filter by open/closed status based on old component logic
    if (isOpen !== undefined) {
      const beforeFilter = filteredData.length;
      filteredData = filteredData.filter((order) => {
        // An order is closed if it's either fully filled (liquidity = 0) or killed/cancelled
        const isClosed = order.liquidity === '0' || order.killed === true;
        const shouldInclude = isOpen ? !isClosed : isClosed;

        return shouldInclude;
      });
    }

    return {
      status: 'success',
      message: 'Success',
      data: filteredData,
      pageInfo: {
        hasNextPage: data.limitOrders.length === pageSize,
      },
    };
  } catch (error) {
    console.error('Error fetching limit orders:', error);
    return {
      status: 'error',
      message: 'Failed to fetch limit orders',
      data: [],
      pageInfo: {
        hasNextPage: false,
      },
    };
  }
}

export function useLimitOrders() {
  const limitOrderClient = useSubgraphClient('limit_order');

  return {
    fetchOrders: async (
      page: number = 1,
      pageSize: number = 10,
      owner?: string,
      poolAddress?: string,
      isOpen?: boolean
    ) => {
      return fetchLimitOrders(
        limitOrderClient,
        page,
        pageSize,
        owner,
        poolAddress,
        isOpen
      );
    },
  };
}
