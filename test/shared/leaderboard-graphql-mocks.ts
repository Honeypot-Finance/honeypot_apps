import { MockedResponse } from '@apollo/client/testing';
import { GraphQLError } from 'graphql';
import {
  LEADERBOARD_QUERY,
  ACCOUNTS_WITH_ADDRESS_QUERY,
  ACCOUNTS_WITHOUT_ADDRESS_QUERY,
  TOP_SWAP_ACCOUNTS_QUERY,
  TOP_POT2PUMP_DEPLOYER_QUERY,
  TOP_PARTICIPATE_ACCOUNTS_QUERY,
} from '../../libs/shared/hpot-sdk/src/lib/graphql/clients/leaderboard';

// Import pot2pump specific queries
import {
  LEADERBOARD_QUERY as POT2PUMP_LEADERBOARD_QUERY,
  ACCOUNTS_WITH_ADDRESS_QUERY as POT2PUMP_ACCOUNTS_WITH_ADDRESS_QUERY,
  ACCOUNTS_WITHOUT_ADDRESS_QUERY as POT2PUMP_ACCOUNTS_WITHOUT_ADDRESS_QUERY,
} from '../../apps/pot2pump/lib/algebra/graphql/clients/leaderboard';

// Import wasabee specific queries
import {
  LEADERBOARD_QUERY as WASABEE_LEADERBOARD_QUERY,
  ACCOUNTS_WITH_ADDRESS_QUERY as WASABEE_ACCOUNTS_WITH_ADDRESS_QUERY,
  ACCOUNTS_WITHOUT_ADDRESS_QUERY as WASABEE_ACCOUNTS_WITHOUT_ADDRESS_QUERY,
} from '../../apps/wasabee/lib/algebra/graphql/clients/leaderboard';

// Mock data interfaces
export interface MockLeaderboardFactoryData {
  factories: Array<{
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
  }>;
}

export interface MockAccountData {
  id: string;
  swapCount: string;
  holdingPoolCount: string;
  memeTokenHoldingCount: string;
  platformTxCount: string;
  participateCount: string;
  totalSpendUSD: string;
  totalDepositPot2pumpUSD?: string;
  pot2PumpLaunchCount?: string;
  transaction: Array<{ timestamp: string }>;
}

export interface MockAccountsQueryData {
  accounts: MockAccountData[];
}

// Default mock data generators
export function createMockLeaderboardData(type: 'shared' | 'pot2pump' | 'wasabee' = 'shared'): MockLeaderboardFactoryData {
  const baseFactory = {
    txCount: '25000',
    totalVolumeUSD: '5000000.00',
    totalVolumeMatic: '2500000.00',
    totalValueLockedUSD: '1500000.00',
    totalValueLockedMatic: '750000.00',
    totalFeesUSD: '15000.00',
    untrackedVolumeUSD: '100000.00',
    totalValueLockedUSDUntracked: '50000.00',
  };

  if (type === 'pot2pump') {
    return {
      factories: [{
        ...baseFactory,
        totalMemeCreated: '150',
        totalSuccessedMeme: '45',
        totalDepositedUSD: '1500000.00',
      }],
    };
  }

  return { factories: [baseFactory] };
}

export function createMockAccountsData(count: number = 3, type: 'shared' | 'pot2pump' | 'wasabee' = 'shared'): MockAccountsQueryData {
  const accounts: MockAccountData[] = [];

  for (let i = 0; i < count; i++) {
    const baseAccount: MockAccountData = {
      id: `0x${(i + 1).toString(16).padStart(40, '0')}`,
      swapCount: (100 - i * 10).toString(),
      holdingPoolCount: (10 - i).toString(),
      memeTokenHoldingCount: (5 - i).toString(),
      platformTxCount: (500 - i * 50).toString(),
      participateCount: (20 - i * 2).toString(),
      totalSpendUSD: (10000 - i * 1000).toFixed(2),
      transaction: [{ timestamp: (Date.now() / 1000 - i * 86400).toString() }],
    };

    if (type === 'pot2pump') {
      baseAccount.totalDepositPot2pumpUSD = (50000 - i * 5000).toFixed(2);
      baseAccount.pot2PumpLaunchCount = (5 - i).toString();
    }

    accounts.push(baseAccount);
  }

  return { accounts };
}

export function createMockTopAccountsData(type: 'swap' | 'deployer' | 'participate'): any {
  const baseAccount = {
    id: '0x1234567890123456789012345678901234567890',
  };

  switch (type) {
    case 'swap':
      return {
        accounts: [{
          ...baseAccount,
          swapCount: '1000',
        }],
      };
    case 'deployer':
      return {
        accounts: [{
          ...baseAccount,
          pot2PumpLaunchCount: '50',
        }],
      };
    case 'participate':
      return {
        accounts: [{
          ...baseAccount,
          participateCount: '200',
          totalDepositPot2pumpUSD: '100000.00',
        }],
      };
    default:
      return { accounts: [] };
  }
}

// Mock response generators for different scenarios
export function createSuccessfulLeaderboardMock(type: 'shared' | 'pot2pump' | 'wasabee' = 'shared'): MockedResponse {
  const query = type === 'pot2pump' ? POT2PUMP_LEADERBOARD_QUERY : 
                type === 'wasabee' ? WASABEE_LEADERBOARD_QUERY : 
                LEADERBOARD_QUERY;

  return {
    request: {
      query,
    },
    result: {
      data: createMockLeaderboardData(type),
    },
  };
}

export function createSuccessfulAccountsMock(
  variables: { skip: number; first: number; address?: string; orderBy?: string; exclude?: string[] },
  type: 'shared' | 'pot2pump' | 'wasabee' = 'shared'
): MockedResponse {
  const hasAddress = variables.address !== undefined;
  const query = hasAddress 
    ? (type === 'pot2pump' ? POT2PUMP_ACCOUNTS_WITH_ADDRESS_QUERY : 
       type === 'wasabee' ? WASABEE_ACCOUNTS_WITH_ADDRESS_QUERY : 
       ACCOUNTS_WITH_ADDRESS_QUERY)
    : (type === 'pot2pump' ? POT2PUMP_ACCOUNTS_WITHOUT_ADDRESS_QUERY : 
       type === 'wasabee' ? WASABEE_ACCOUNTS_WITHOUT_ADDRESS_QUERY : 
       ACCOUNTS_WITHOUT_ADDRESS_QUERY);

  return {
    request: {
      query,
      variables,
    },
    result: {
      data: createMockAccountsData(variables.first, type),
    },
  };
}

export function createSuccessfulTopAccountsMock(type: 'swap' | 'deployer' | 'participate', variables: any = {}): MockedResponse {
  let query;
  switch (type) {
    case 'swap':
      query = TOP_SWAP_ACCOUNTS_QUERY;
      break;
    case 'deployer':
      query = TOP_POT2PUMP_DEPLOYER_QUERY;
      break;
    case 'participate':
      query = TOP_PARTICIPATE_ACCOUNTS_QUERY;
      break;
    default:
      throw new Error(`Unknown top accounts type: ${type}`);
  }

  return {
    request: {
      query,
      variables,
    },
    result: {
      data: createMockTopAccountsData(type),
    },
  };
}

// Error response generators
export function createNetworkErrorMock(query: any, variables: any = {}): MockedResponse {
  return {
    request: {
      query,
      variables,
    },
    error: new Error('Network error'),
  };
}

export function createGraphQLErrorMock(query: any, variables: any = {}, errorMessage: string = 'GraphQL error'): MockedResponse {
  return {
    request: {
      query,
      variables,
    },
    result: {
      errors: [new GraphQLError(errorMessage)],
    },
  };
}

export function createTimeoutErrorMock(query: any, variables: any = {}): MockedResponse {
  return {
    request: {
      query,
      variables,
    },
    error: new Error('Request timeout'),
  };
}

export function createMalformedDataMock(query: any, variables: any = {}): MockedResponse {
  return {
    request: {
      query,
      variables,
    },
    result: {
      data: {
        factories: [{
          txCount: 'invalid',
          totalVolumeUSD: 'not-a-number',
          totalVolumeMatic: null,
          totalValueLockedUSD: undefined,
          totalValueLockedMatic: 'NaN',
          totalFeesUSD: 'infinity',
          untrackedVolumeUSD: '',
          totalValueLockedUSDUntracked: '-1',
        }],
      },
    },
  };
}

export function createEmptyDataMock(query: any, variables: any = {}): MockedResponse {
  return {
    request: {
      query,
      variables,
    },
    result: {
      data: {
        factories: [],
        accounts: [],
      },
    },
  };
}

// Loading state mock (delayed response)
export function createLoadingMock(query: any, variables: any = {}, delay: number = 1000): MockedResponse {
  return {
    request: {
      query,
      variables,
    },
    result: {
      data: createMockLeaderboardData(),
    },
    delay,
  };
}

// Pagination-specific mocks
export function createPaginatedAccountsMock(
  page: number,
  pageSize: number,
  totalItems: number = 100,
  type: 'shared' | 'pot2pump' | 'wasabee' = 'shared'
): MockedResponse {
  const skip = page * pageSize;
  const remainingItems = Math.max(0, totalItems - skip);
  const itemsToReturn = Math.min(pageSize, remainingItems);

  return createSuccessfulAccountsMock(
    { skip, first: pageSize },
    type
  );
}

// Search-specific mocks
export function createSearchAccountsMock(
  searchAddress: string,
  type: 'shared' | 'pot2pump' | 'wasabee' = 'shared'
): MockedResponse {
  const mockAccount = createMockAccountsData(1, type);
  mockAccount.accounts[0].id = searchAddress;

  return {
    request: {
      query: type === 'pot2pump' ? POT2PUMP_ACCOUNTS_WITH_ADDRESS_QUERY : 
             type === 'wasabee' ? WASABEE_ACCOUNTS_WITH_ADDRESS_QUERY : 
             ACCOUNTS_WITH_ADDRESS_QUERY,
      variables: {
        skip: 0,
        first: 10,
        address: searchAddress,
      },
    },
    result: {
      data: mockAccount,
    },
  };
}

// Sorting-specific mocks
export function createSortedAccountsMock(
  orderBy: string,
  type: 'shared' | 'pot2pump' | 'wasabee' = 'shared'
): MockedResponse {
  return {
    request: {
      query: type === 'pot2pump' ? POT2PUMP_ACCOUNTS_WITHOUT_ADDRESS_QUERY : 
             type === 'wasabee' ? WASABEE_ACCOUNTS_WITHOUT_ADDRESS_QUERY : 
             ACCOUNTS_WITHOUT_ADDRESS_QUERY,
      variables: {
        skip: 0,
        first: 10,
        orderBy,
      },
    },
    result: {
      data: createMockAccountsData(10, type),
    },
  };
}

// Large dataset mocks for performance testing
export function createLargeDatasetMock(
  size: number = 1000,
  type: 'shared' | 'pot2pump' | 'wasabee' = 'shared'
): MockedResponse {
  return {
    request: {
      query: type === 'pot2pump' ? POT2PUMP_ACCOUNTS_WITHOUT_ADDRESS_QUERY : 
             type === 'wasabee' ? WASABEE_ACCOUNTS_WITHOUT_ADDRESS_QUERY : 
             ACCOUNTS_WITHOUT_ADDRESS_QUERY,
      variables: {
        skip: 0,
        first: size,
      },
    },
    result: {
      data: createMockAccountsData(size, type),
    },
  };
}

// Race condition testing mocks
export function createConcurrentRequestMocks(
  requestCount: number = 3,
  type: 'shared' | 'pot2pump' | 'wasabee' = 'shared'
): MockedResponse[] {
  return Array.from({ length: requestCount }, (_, index) => ({
    request: {
      query: LEADERBOARD_QUERY,
      variables: {},
    },
    result: {
      data: createMockLeaderboardData(type),
    },
    delay: Math.random() * 100, // Random delay to simulate race conditions
  }));
}

// Edge case mocks
export function createEdgeCaseMocks(): {
  zeroValues: MockedResponse;
  extremelyLargeValues: MockedResponse;
  negativeValues: MockedResponse;
  nullUndefinedValues: MockedResponse;
} {
  return {
    zeroValues: {
      request: { query: LEADERBOARD_QUERY },
      result: {
        data: {
          factories: [{
            txCount: '0',
            totalVolumeUSD: '0',
            totalVolumeMatic: '0',
            totalValueLockedUSD: '0',
            totalValueLockedMatic: '0',
            totalFeesUSD: '0',
            untrackedVolumeUSD: '0',
            totalValueLockedUSDUntracked: '0',
          }],
        },
      },
    },

    extremelyLargeValues: {
      request: { query: LEADERBOARD_QUERY },
      result: {
        data: {
          factories: [{
            txCount: '999999999999',
            totalVolumeUSD: '999999999999999.99',
            totalVolumeMatic: '999999999999999.99',
            totalValueLockedUSD: '999999999999999.99',
            totalValueLockedMatic: '999999999999999.99',
            totalFeesUSD: '999999999999999.99',
            untrackedVolumeUSD: '999999999999999.99',
            totalValueLockedUSDUntracked: '999999999999999.99',
          }],
        },
      },
    },

    negativeValues: {
      request: { query: LEADERBOARD_QUERY },
      result: {
        data: {
          factories: [{
            txCount: '-1',
            totalVolumeUSD: '-1000.00',
            totalVolumeMatic: '-500.00',
            totalValueLockedUSD: '-2000.00',
            totalValueLockedMatic: '-1000.00',
            totalFeesUSD: '-100.00',
            untrackedVolumeUSD: '-50.00',
            totalValueLockedUSDUntracked: '-25.00',
          }],
        },
      },
    },

    nullUndefinedValues: {
      request: { query: LEADERBOARD_QUERY },
      result: {
        data: {
          factories: [{
            txCount: null,
            totalVolumeUSD: undefined,
            totalVolumeMatic: null,
            totalValueLockedUSD: undefined,
            totalValueLockedMatic: null,
            totalFeesUSD: undefined,
            untrackedVolumeUSD: null,
            totalValueLockedUSDUntracked: undefined,
          }],
        },
      },
    },
  };
}

// Comprehensive mock collections for different testing scenarios
export const mockCollections = {
  // Standard successful responses
  successful: {
    shared: {
      leaderboard: createSuccessfulLeaderboardMock('shared'),
      accounts: createSuccessfulAccountsMock({ skip: 0, first: 10 }, 'shared'),
      topSwapAccounts: createSuccessfulTopAccountsMock('swap'),
      topDeployer: createSuccessfulTopAccountsMock('deployer'),
      topParticipate: createSuccessfulTopAccountsMock('participate'),
    },
    pot2pump: {
      leaderboard: createSuccessfulLeaderboardMock('pot2pump'),
      accounts: createSuccessfulAccountsMock({ skip: 0, first: 10 }, 'pot2pump'),
      topSwapAccounts: createSuccessfulTopAccountsMock('swap'),
      topDeployer: createSuccessfulTopAccountsMock('deployer'),
      topParticipate: createSuccessfulTopAccountsMock('participate'),
    },
    wasabee: {
      leaderboard: createSuccessfulLeaderboardMock('wasabee'),
      accounts: createSuccessfulAccountsMock({ skip: 0, first: 10 }, 'wasabee'),
      topSwapAccounts: createSuccessfulTopAccountsMock('swap'),
    },
  },

  // Error scenarios
  errors: {
    networkError: createNetworkErrorMock(LEADERBOARD_QUERY),
    graphqlError: createGraphQLErrorMock(LEADERBOARD_QUERY, {}, 'Failed to fetch leaderboard data'),
    timeoutError: createTimeoutErrorMock(LEADERBOARD_QUERY),
    malformedData: createMalformedDataMock(LEADERBOARD_QUERY),
    emptyData: createEmptyDataMock(LEADERBOARD_QUERY),
  },

  // Edge cases
  edgeCases: createEdgeCaseMocks(),

  // Performance testing
  performance: {
    largeDataset: createLargeDatasetMock(1000),
    concurrentRequests: createConcurrentRequestMocks(5),
  },

  // Pagination scenarios
  pagination: {
    firstPage: createPaginatedAccountsMock(0, 10),
    secondPage: createPaginatedAccountsMock(1, 10),
    lastPage: createPaginatedAccountsMock(9, 10, 95), // 95 total items, page 9 with 5 items
  },

  // Search scenarios
  search: {
    validAddress: createSearchAccountsMock('0x1234567890123456789012345678901234567890'),
    invalidAddress: createSearchAccountsMock('invalid-address'),
  },

  // Sorting scenarios
  sorting: {
    byTotalSpend: createSortedAccountsMock('totalSpendUSD'),
    bySwapCount: createSortedAccountsMock('swapCount'),
    byParticipateCount: createSortedAccountsMock('participateCount'),
  },
};

// Helper function to create Apollo Client mock provider with predefined mocks
export function createMockApolloProvider(scenario: keyof typeof mockCollections = 'successful') {
  const mocks = Object.values(mockCollections[scenario]);
  return mocks.flat();
}

// Helper function to create custom mock combinations
export function createCustomMockCombination(mocks: MockedResponse[]): MockedResponse[] {
  return mocks;
}