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
    filled: string;
    totalLiquidity: string;
    fillTimestamp: string;
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

  // Fetch a large number of orders to handle client-side filtering
  // This ensures pagination works correctly after filtering
  const query = `
    query GetLimitOrders {
      limitOrders(
        first: 1000
        skip: 0
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
          filled
          totalLiquidity
          fillTimestamp
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

    // Filter by open/closed status based on epoch data
    if (isOpen !== undefined) {
      filteredData = filteredData.filter((order) => {
        // An order is closed if:
        // 1. It was filled (liquidity is 0 or significantly reduced from initial)
        // 2. It was killed/cancelled
        // 3. The entire epoch was filled
        // 4. It was claimed (closeTimestamp !== '0')
        const currentLiquidity = BigInt(order.liquidity || '0');
        const initialLiquidity = BigInt(order.initialLiquidity || '0');

        // Order is filled if current liquidity is 0 or significantly less than initial
        const isOrderFilled = currentLiquidity === BigInt(0) ||
                             (initialLiquidity > BigInt(0) && currentLiquidity < initialLiquidity);

        // Also check if the entire epoch was filled
        const isEpochFilled =
          (order.epoch?.filled && order.epoch.filled !== '0') ||
          (order.epoch?.fillTimestamp && order.epoch.fillTimestamp !== '0');

        // Check if order was claimed
        const isClaimed = order.closeTimestamp && order.closeTimestamp !== '0';

        const isClosed = isOrderFilled || isEpochFilled || order.killed === true || isClaimed;
        const shouldInclude = isOpen ? !isClosed : isClosed;

        return shouldInclude;
      });
    }

    // Apply client-side pagination AFTER filtering
    const skip = (page - 1) * pageSize;
    const paginatedData = filteredData.slice(skip, skip + pageSize);
    const hasNextPage = skip + pageSize < filteredData.length;

    return {
      status: 'success',
      message: 'Success',
      data: paginatedData,
      pageInfo: {
        hasNextPage: hasNextPage,
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
