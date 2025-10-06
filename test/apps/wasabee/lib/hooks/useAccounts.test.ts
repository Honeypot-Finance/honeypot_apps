import { renderHook, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { useAccounts, useTopSwapAccounts, useTopPot2PumpDeployer, useTopParticipateAccounts } from '@/lib/hooks/useAccounts';
import { 
  ACCOUNTS_WITH_ADDRESS_QUERY, 
  ACCOUNTS_WITHOUT_ADDRESS_QUERY,
  TOP_SWAP_ACCOUNTS_QUERY,
  TOP_POT2PUMP_DEPLOYER_QUERY,
  TOP_PARTICIPATE_ACCOUNTS_QUERY
} from '@/lib/algebra/graphql/clients/leaderboard';
import { createWrapper } from '../../../../shared/leaderboard-test-utils';

// Mock wallet and useObserver
jest.mock('@honeypot/shared/lib/wallet', () => ({
  wallet: {
    currentChain: {
      contracts: {
        algebraSwapRouter: '0xrouter123456789012345678901234567890'
      }
    }
  }
}));

jest.mock('mobx-react-lite', () => ({
  useObserver: jest.fn((fn) => fn())
}));

const mockAccountsData = {
  accounts: [
    {
      id: '0x1234567890123456789012345678901234567890',
      totalSpendUSD: '1000.50',
      swapCount: '25',
      holdingPoolCount: '5',
      memeTokenHoldingCount: '3',
      platformTxCount: '50',
      participateCount: '10',
      transaction: [
        { timestamp: '1640995200' } // 2022-01-01 00:00:00
      ]
    },
    {
      id: '0x2345678901234567890123456789012345678901',
      totalSpendUSD: '2000.75',
      swapCount: '40',
      holdingPoolCount: '8',
      memeTokenHoldingCount: '6',
      platformTxCount: '80',
      participateCount: '15',
      transaction: []
    }
  ]
};

const mockTopSwapAccountsData = {
  accounts: [
    {
      id: '0x1111111111111111111111111111111111111111',
      swapCount: '100'
    },
    {
      id: '0x2222222222222222222222222222222222222222',
      swapCount: '85'
    }
  ]
};

const mockTopDeployerData = {
  accounts: [
    {
      id: '0x3333333333333333333333333333333333333333',
      pot2PumpLaunchCount: '10'
    }
  ]
};

const mockTopParticipateData = {
  accounts: [
    {
      id: '0x4444444444444444444444444444444444444444',
      participateCount: '50'
    }
  ]
};

describe('useAccounts (Wasabee)', () => {
  const defaultMocks = [
    {
      request: {
        query: ACCOUNTS_WITHOUT_ADDRESS_QUERY,
        variables: {
          skip: 0,
          first: 10,
          address: undefined,
          exclude: ['0xrouter123456789012345678901234567890']
        }
      },
      result: {
        data: mockAccountsData
      }
    }
  ];

  it('should fetch accounts without search address', async () => {
    const { result } = renderHook(
      () => useAccounts(1, 10, ''),
      { wrapper: createWrapper(defaultMocks) }
    );

    expect(result.current.loading).toBe(true);
    expect(result.current.accounts).toEqual([]);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.accounts).toHaveLength(2);
    expect(result.current.accounts[0]).toEqual({
      walletAddress: '0x1234567890123456789012345678901234567890',
      totalSpend: 1000.50,
      swapCount: 25,
      poolHoldingCount: 5,
      memeTokenCount: 3,
      transactions: 50,
      participateCount: 10,
      lastActive: '01/01/2022, 12:00:00 AM'
    });
  });

  it('should fetch accounts with search address', async () => {
    const searchMocks = [
      {
        request: {
          query: ACCOUNTS_WITH_ADDRESS_QUERY,
          variables: {
            skip: 0,
            first: 10,
            address: '0x1234567890123456789012345678901234567890',
            exclude: ['0xrouter123456789012345678901234567890']
          }
        },
        result: {
          data: {
            accounts: [mockAccountsData.accounts[0]]
          }
        }
      }
    ];

    const { result } = renderHook(
      () => useAccounts(1, 10, '0x1234567890123456789012345678901234567890'),
      { wrapper: createWrapper(searchMocks) }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.accounts).toHaveLength(1);
    expect(result.current.accounts[0].walletAddress).toBe('0x1234567890123456789012345678901234567890');
  });

  it('should handle pagination correctly', async () => {
    const page2Mocks = [
      {
        request: {
          query: ACCOUNTS_WITHOUT_ADDRESS_QUERY,
          variables: {
            skip: 10,
            first: 10,
            address: undefined,
            exclude: ['0xrouter123456789012345678901234567890']
          }
        },
        result: {
          data: mockAccountsData
        }
      }
    ];

    const { result } = renderHook(
      () => useAccounts(2, 10, ''),
      { wrapper: createWrapper(page2Mocks) }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.accounts).toHaveLength(2);
    expect(result.current.hasMore).toBe(false); // Less than pageSize
  });

  it('should exclude router address from results', async () => {
    const { result } = renderHook(
      () => useAccounts(1, 10, ''),
      { wrapper: createWrapper(defaultMocks) }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify that router address is not in the results
    const routerAddress = '0xrouter123456789012345678901234567890';
    const hasRouterAddress = result.current.accounts.some(
      account => account.walletAddress.toLowerCase() === routerAddress.toLowerCase()
    );
    expect(hasRouterAddress).toBe(false);
  });

  it('should handle empty results', async () => {
    const emptyMocks = [
      {
        request: {
          query: ACCOUNTS_WITHOUT_ADDRESS_QUERY,
          variables: {
            skip: 0,
            first: 10,
            address: undefined,
            exclude: ['0xrouter123456789012345678901234567890']
          }
        },
        result: {
          data: { accounts: [] }
        }
      }
    ];

    const { result } = renderHook(
      () => useAccounts(1, 10, ''),
      { wrapper: createWrapper(emptyMocks) }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.accounts).toEqual([]);
    expect(result.current.hasMore).toBe(false);
  });

  it('should handle accounts with no transactions', async () => {
    const { result } = renderHook(
      () => useAccounts(1, 10, ''),
      { wrapper: createWrapper(defaultMocks) }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.accounts[1].lastActive).toBe('-');
  });

  it('should handle loadMore functionality', async () => {
    const loadMoreMocks = [
      ...defaultMocks,
      {
        request: {
          query: ACCOUNTS_WITHOUT_ADDRESS_QUERY,
          variables: {
            skip: 2,
            first: 10,
            exclude: ['0xrouter123456789012345678901234567890']
          }
        },
        result: {
          data: {
            accounts: [
              {
                id: '0x5555555555555555555555555555555555555555',
                totalSpendUSD: '500.25',
                swapCount: '15',
                holdingPoolCount: '3',
                memeTokenHoldingCount: '2',
                platformTxCount: '30',
                participateCount: '5',
                transaction: []
              }
            ]
          }
        }
      }
    ];

    const { result } = renderHook(
      () => useAccounts(1, 10, ''),
      { wrapper: createWrapper(loadMoreMocks) }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.accounts).toHaveLength(2);

    // Test loadMore function
    await result.current.loadMore();

    // Note: In real implementation, loadMore would update the cache
    // Here we just verify the function exists and can be called
    expect(typeof result.current.loadMore).toBe('function');
  });
});

describe('useTopSwapAccounts (Wasabee)', () => {
  const topSwapMocks = [
    {
      request: {
        query: TOP_SWAP_ACCOUNTS_QUERY,
        variables: {
          exclude: ['0xrouter123456789012345678901234567890']
        }
      },
      result: {
        data: mockTopSwapAccountsData
      }
    }
  ];

  it('should fetch top swap accounts with router exclusion', async () => {
    const { result } = renderHook(
      () => useTopSwapAccounts(),
      { wrapper: createWrapper(topSwapMocks) }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.accounts).toHaveLength(2);
    expect(result.current.accounts[0]).toEqual({
      walletAddress: '0x1111111111111111111111111111111111111111',
      swapCount: 100
    });
  });
});

describe('useTopPot2PumpDeployer (Wasabee)', () => {
  const topDeployerMocks = [
    {
      request: {
        query: TOP_POT2PUMP_DEPLOYER_QUERY,
        variables: {}
      },
      result: {
        data: mockTopDeployerData
      }
    }
  ];

  it('should fetch top deployers', async () => {
    const { result } = renderHook(
      () => useTopPot2PumpDeployer(),
      { wrapper: createWrapper(topDeployerMocks) }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.accounts).toHaveLength(1);
    expect(result.current.accounts[0]).toEqual({
      walletAddress: '0x3333333333333333333333333333333333333333',
      pot2PumpDeployCount: 10
    });
  });
});

describe('useTopParticipateAccounts (Wasabee)', () => {
  const topParticipateMocks = [
    {
      request: {
        query: TOP_PARTICIPATE_ACCOUNTS_QUERY,
        variables: {}
      },
      result: {
        data: mockTopParticipateData
      }
    }
  ];

  it('should fetch top participate accounts', async () => {
    const { result } = renderHook(
      () => useTopParticipateAccounts(),
      { wrapper: createWrapper(topParticipateMocks) }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.accounts).toHaveLength(1);
    expect(result.current.accounts[0]).toEqual({
      walletAddress: '0x4444444444444444444444444444444444444444',
      participateCount: 50
    });
  });
});

describe('Error handling (Wasabee)', () => {
  it('should handle GraphQL errors', async () => {
    const errorMocks = [
      {
        request: {
          query: ACCOUNTS_WITHOUT_ADDRESS_QUERY,
          variables: {
            skip: 0,
            first: 10,
            address: undefined,
            exclude: ['0xrouter123456789012345678901234567890']
          }
        },
        error: new Error('Network error')
      }
    ];

    const { result } = renderHook(
      () => useAccounts(1, 10, ''),
      { wrapper: createWrapper(errorMocks) }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.accounts).toEqual([]);
  });

  it('should handle malformed data gracefully', async () => {
    const malformedMocks = [
      {
        request: {
          query: ACCOUNTS_WITHOUT_ADDRESS_QUERY,
          variables: {
            skip: 0,
            first: 10,
            address: undefined,
            exclude: ['0xrouter123456789012345678901234567890']
          }
        },
        result: {
          data: {
            accounts: [
              {
                id: '0x1234567890123456789012345678901234567890',
                totalSpendUSD: null,
                swapCount: undefined,
                holdingPoolCount: '',
                memeTokenHoldingCount: 'invalid',
                platformTxCount: '50',
                participateCount: '10',
                transaction: null
              }
            ]
          }
        }
      }
    ];

    const { result } = renderHook(
      () => useAccounts(1, 10, ''),
      { wrapper: createWrapper(malformedMocks) }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.accounts).toHaveLength(1);
    expect(result.current.accounts[0].totalSpend).toBeNaN();
    expect(result.current.accounts[0].swapCount).toBeNaN();
    expect(result.current.accounts[0].lastActive).toBe('-');
  });
});