import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import {
  useAccounts,
  useTopSwapAccounts,
  useTopPot2PumpDeployer,
  useTopParticipateAccounts,
} from '../../../lib/hooks/useAccounts';
import {
  ACCOUNTS_WITH_ADDRESS_QUERY,
  ACCOUNTS_WITHOUT_ADDRESS_QUERY,
  TOP_SWAP_ACCOUNTS_QUERY,
  TOP_POT2PUMP_DEPLOYER_QUERY,
  TOP_PARTICIPATE_ACCOUNTS_QUERY,
} from '../../../lib/algebra/graphql/clients/leaderboard';

import { Account_OrderBy } from '../../../lib/algebra/graphql/generated/graphql';

// Mock dayjs to return consistent date formatting
jest.mock('dayjs', () => {
  const originalDayjs = jest.requireActual('dayjs');
  return jest.fn((date?: any) => {
    if (date === 1735142400000) { // Our test timestamp * 1000
      return {
        format: (formatStr: string) => {
          if (formatStr === 'MM/DD/YYYY, h:mm:ss A') {
            return '12/25/2024, 4:00:00 PM';
          }
          return originalDayjs(date).format(formatStr);
        }
      };
    }
    return originalDayjs(date);
  });
});





const mockAccountsData = {
  accounts: [
    {
      __typename: 'Account',
      id: '0x1234567890123456789012345678901234567890',
      totalSpendUSD: '1000.50',
      swapCount: '25',
      holdingPoolCount: '5',
      memeTokenHoldingCount: '3',
      platformTxCount: '100',
      participateCount: '10',
      totalDepositPot2pumpUSD: '5000.00',
      pot2PumpLaunchCount: '3',
      transaction: [{ __typename: 'Transaction', timestamp: '1735142400' }],
    },
    {
      __typename: 'Account',
      id: '0x2345678901234567890123456789012345678901',
      totalSpendUSD: '2500.75',
      swapCount: '50',
      holdingPoolCount: '8',
      memeTokenHoldingCount: '6',
      platformTxCount: '200',
      participateCount: '20',
      totalDepositPot2pumpUSD: '10000.00',
      pot2PumpLaunchCount: '5',
      transaction: [{ __typename: 'Transaction', timestamp: '1735210200' }],
    },
  ],
};

const mockTopSwapAccountsData = {
  accounts: [
    {
      __typename: 'Account',
      id: '0x1234567890123456789012345678901234567890',
      swapCount: '100',
    },
    {
      __typename: 'Account',
      id: '0x2345678901234567890123456789012345678901',
      swapCount: '75',
    },
  ],
};

const mockTopDeployerData = {
  accounts: [
    {
      __typename: 'Account',
      id: '0x1234567890123456789012345678901234567890',
      pot2PumpLaunchCount: '10',
    },
    {
      __typename: 'Account',
      id: '0x2345678901234567890123456789012345678901',
      pot2PumpLaunchCount: '8',
    },
  ],
};

const mockTopParticipateData = {
  accounts: [
    {
      __typename: 'Account',
      id: '0x1234567890123456789012345678901234567890',
      participateCount: '50',
      totalDepositPot2pumpUSD: '5000.00',
    },
    {
      __typename: 'Account',
      id: '0x2345678901234567890123456789012345678901',
      participateCount: '35',
      totalDepositPot2pumpUSD: '3500.00',
    },
  ],
};

describe('useAccounts (Pot2Pump)', () => {
  const createWrapper = (mocks: any[]) => {
    const MockWrapper = ({ children }: { children: React.ReactNode }) => {
      return React.createElement(
        MockedProvider,
        { mocks },
        children
      );
    };
    return MockWrapper;
  };

  describe('useAccounts', () => {
    const defaultMocks = [
      {
        request: {
          query: ACCOUNTS_WITHOUT_ADDRESS_QUERY,
          variables: {
            skip: 0,
            first: 10,
            orderBy: Account_OrderBy.TotalSpendUsd,
            address: undefined,
          },
        },
        result: {
          data: mockAccountsData,
        },
      },
    ];

    it('should fetch accounts without search address', async () => {
      const { result } = renderHook(
        () => useAccounts(1, 10, '', Account_OrderBy.TotalSpendUsd),
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
        totalSpend: 1000.5,
        swapCount: 25,
        poolHoldingCount: 5,
        memeTokenCount: 3,
        transactions: 100,
        participateCount: 10,
        totalDepositPot2pumpUSD: '5000.00',
        pot2PumpLaunchCount: '3',
        lastActive: '12/25/2024, 4:00:00 PM',
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
              orderBy: Account_OrderBy.TotalSpendUsd,
              address: '0x1234567890123456789012345678901234567890',
            },
          },
          result: {
            data: {
              accounts: [mockAccountsData.accounts[0]],
            },
          },
        },
      ];

      const { result } = renderHook(
        () =>
          useAccounts(
            1,
            10,
            '0x1234567890123456789012345678901234567890',
            Account_OrderBy.TotalSpendUsd
          ),
        { wrapper: createWrapper(searchMocks) }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.accounts).toHaveLength(1);
      expect(result.current.accounts[0].walletAddress).toBe(
        '0x1234567890123456789012345678901234567890'
      );
    });

    it('should handle pagination correctly', async () => {
      const page2Mocks = [
        {
          request: {
            query: ACCOUNTS_WITHOUT_ADDRESS_QUERY,
            variables: {
              skip: 10,
              first: 10,
              orderBy: Account_OrderBy.TotalSpendUsd,
              address: undefined,
            },
          },
          result: {
            data: mockAccountsData,
          },
        },
      ];

      const { result } = renderHook(
        () => useAccounts(2, 10, '', Account_OrderBy.TotalSpendUsd),
        { wrapper: createWrapper(page2Mocks) }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.accounts).toHaveLength(2);
    });

    it('should handle empty accounts list', async () => {
      const emptyMocks = [
        {
          request: {
            query: ACCOUNTS_WITHOUT_ADDRESS_QUERY,
            variables: {
              skip: 0,
              first: 10,
              orderBy: Account_OrderBy.TotalSpendUsd,
              address: undefined,
            },
          },
          result: {
            data: { accounts: [] },
          },
        },
      ];

      const { result } = renderHook(
        () => useAccounts(1, 10, '', Account_OrderBy.TotalSpendUsd),
        { wrapper: createWrapper(emptyMocks) }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.accounts).toEqual([]);
      expect(result.current.hasMore).toBe(false);
    });

    it('should handle accounts with no transactions', async () => {
      const noTransactionMocks = [
        {
          request: {
            query: ACCOUNTS_WITHOUT_ADDRESS_QUERY,
            variables: {
              skip: 0,
              first: 10,
              orderBy: Account_OrderBy.TotalSpendUsd,
              address: undefined,
            },
          },
          result: {
            data: {
              accounts: [
                {
                  ...mockAccountsData.accounts[0],
                  transaction: [],
                },
              ],
            },
          },
        },
      ];

      const { result } = renderHook(
        () => useAccounts(1, 10, '', Account_OrderBy.TotalSpendUsd),
        { wrapper: createWrapper(noTransactionMocks) }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.accounts[0].lastActive).toBe('-');
    });

    it('should calculate hasMore correctly', async () => {
      const fullPageMocks = [
        {
          request: {
            query: ACCOUNTS_WITHOUT_ADDRESS_QUERY,
            variables: {
              skip: 0,
              first: 2,
              orderBy: Account_OrderBy.TotalSpendUsd,
              address: undefined,
            },
          },
          result: {
            data: mockAccountsData,
          },
        },
      ];

      const { result } = renderHook(
        () => useAccounts(1, 2, '', Account_OrderBy.TotalSpendUsd),
        { wrapper: createWrapper(fullPageMocks) }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasMore).toBe(true);
    });

    it('should handle loadMore functionality', async () => {
      const loadMoreMocks = [
        {
          request: {
            query: ACCOUNTS_WITHOUT_ADDRESS_QUERY,
            variables: {
              skip: 0,
              first: 10,
              orderBy: Account_OrderBy.TotalSpendUsd,
              address: undefined,
            },
          },
          result: {
            data: mockAccountsData,
          },
        },
        {
          request: {
            query: ACCOUNTS_WITHOUT_ADDRESS_QUERY,
            variables: {
              skip: 2,
              first: 10,
              orderBy: Account_OrderBy.TotalSpendUsd,
              address: undefined,
              exclude: ['0xfff605964840a5511f595eb970011ecbffa46b39'],
            },
          },
          result: {
            data: { accounts: [] },
          },
        },
      ];

      const { result } = renderHook(
        () => useAccounts(1, 10, '', Account_OrderBy.TotalSpendUsd),
        { wrapper: createWrapper(loadMoreMocks) }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(typeof result.current.loadMore).toBe('function');

      // Test loadMore call
      const loadMoreResult = result.current.loadMore();
      expect(loadMoreResult).toBeDefined();
    });

    it('should handle GraphQL errors', async () => {
      const errorMocks = [
        {
          request: {
            query: ACCOUNTS_WITHOUT_ADDRESS_QUERY,
            variables: {
              skip: 0,
              first: 10,
              orderBy: Account_OrderBy.TotalSpendUsd,
              address: undefined,
            },
          },
          error: new Error('Network error'),
        },
      ];

      const { result } = renderHook(
        () => useAccounts(1, 10, '', Account_OrderBy.TotalSpendUsd),
        { wrapper: createWrapper(errorMocks) }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.accounts).toEqual([]);
    });

    it('should handle malformed account data', async () => {
      const malformedMocks = [
        {
          request: {
            query: ACCOUNTS_WITHOUT_ADDRESS_QUERY,
            variables: {
              skip: 0,
              first: 10,
              orderBy: Account_OrderBy.TotalSpendUsd,
              address: undefined,
            },
          },
          result: {
            data: {
              accounts: [
                {
                  __typename: 'Account',
                  id: 'invalid-address',
                  totalSpendUSD: 'not-a-number',
                  swapCount: 'invalid',
                  holdingPoolCount: 'invalid',
                  memeTokenHoldingCount: 'invalid',
                  platformTxCount: 'invalid',
                  participateCount: 'invalid',
                  totalDepositPot2pumpUSD: 'invalid',
                  pot2PumpLaunchCount: 'invalid',
                  transaction: [{ __typename: 'Transaction', timestamp: 'invalid' }],
                },
              ],
            },
          },
        },
      ];

      const { result } = renderHook(
        () => useAccounts(1, 10, '', Account_OrderBy.TotalSpendUsd),
        { wrapper: createWrapper(malformedMocks) }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.accounts).toHaveLength(1);
      expect(result.current.accounts[0].walletAddress).toBe('invalid-address');
      expect(result.current.accounts[0].totalSpend).toBeNaN();
      expect(result.current.accounts[0].swapCount).toBeNaN();
    });

    it('should handle different orderBy parameters', async () => {
      const orderByMocks = [
        {
          request: {
            query: ACCOUNTS_WITHOUT_ADDRESS_QUERY,
            variables: {
              skip: 0,
              first: 10,
              orderBy: Account_OrderBy.SwapCount,
              address: undefined,
            },
          },
          result: {
            data: mockAccountsData,
          },
        },
      ];

      const { result } = renderHook(
        () => useAccounts(1, 10, '', Account_OrderBy.SwapCount),
        { wrapper: createWrapper(orderByMocks) }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.accounts).toHaveLength(2);
    });
  });

  describe('useTopSwapAccounts', () => {
    const topSwapMocks = [
      {
        request: {
          query: TOP_SWAP_ACCOUNTS_QUERY,
          variables: {},
        },
        result: {
          data: mockTopSwapAccountsData,
        },
      },
    ];

    it('should fetch top swap accounts', async () => {
      const { result } = renderHook(() => useTopSwapAccounts(), {
        wrapper: createWrapper(topSwapMocks),
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.accounts).toHaveLength(2);
      expect(result.current.accounts[0]).toEqual({
        walletAddress: '0x1234567890123456789012345678901234567890',
        swapCount: 100,
      });
    });

    it('should handle empty top swap accounts', async () => {
      const emptyMocks = [
        {
          request: {
            query: TOP_SWAP_ACCOUNTS_QUERY,
            variables: {},
          },
          result: {
            data: { accounts: [] },
          },
        },
      ];

      const { result } = renderHook(() => useTopSwapAccounts(), {
        wrapper: createWrapper(emptyMocks),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.accounts).toEqual([]);
    });
  });

  describe('useTopPot2PumpDeployer', () => {
    const topDeployerMocks = [
      {
        request: {
          query: TOP_POT2PUMP_DEPLOYER_QUERY,
          variables: {},
        },
        result: {
          data: mockTopDeployerData,
        },
      },
    ];

    it('should fetch top deployers', async () => {
      const { result } = renderHook(() => useTopPot2PumpDeployer(), {
        wrapper: createWrapper(topDeployerMocks),
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.accounts).toHaveLength(2);
      expect(result.current.accounts[0]).toEqual({
        walletAddress: '0x1234567890123456789012345678901234567890',
        pot2PumpDeployCount: 10,
      });
    });

    it('should handle errors in top deployers query', async () => {
      const errorMocks = [
        {
          request: {
            query: TOP_POT2PUMP_DEPLOYER_QUERY,
            variables: {},
          },
          error: new Error('GraphQL error'),
        },
      ];

      const { result } = renderHook(() => useTopPot2PumpDeployer(), {
        wrapper: createWrapper(errorMocks),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.accounts).toEqual([]);
    });
  });

  describe('useTopParticipateAccounts', () => {
    const topParticipateMocks = [
      {
        request: {
          query: TOP_PARTICIPATE_ACCOUNTS_QUERY,
          variables: {},
        },
        result: {
          data: mockTopParticipateData,
        },
      },
    ];

    it('should fetch top participate accounts', async () => {
      const { result } = renderHook(() => useTopParticipateAccounts(), {
        wrapper: createWrapper(topParticipateMocks),
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.accounts).toHaveLength(2);
      expect(result.current.accounts[0]).toEqual({
        walletAddress: '0x1234567890123456789012345678901234567890',
        participateCount: 50,
      });
    });

    it('should handle malformed participate data', async () => {
      const malformedMocks = [
        {
          request: {
            query: TOP_PARTICIPATE_ACCOUNTS_QUERY,
            variables: {},
          },
          result: {
            data: {
              accounts: [
                {
                  id: '0x1234567890123456789012345678901234567890',
                  participateCount: 'not-a-number',
                  totalDepositPot2pumpUSD: 'invalid',
                },
              ],
            },
          },
        },
      ];

      const { result } = renderHook(() => useTopParticipateAccounts(), {
        wrapper: createWrapper(malformedMocks),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.accounts).toHaveLength(1);
      expect(result.current.accounts[0].participateCount).toBeNaN();
    });
  });

  describe('Edge cases and error scenarios', () => {
    it('should handle concurrent queries', async () => {
      const concurrentMocks = [
        {
          request: {
            query: ACCOUNTS_WITHOUT_ADDRESS_QUERY,
            variables: {
              skip: 0,
              first: 10,
              orderBy: Account_OrderBy.TotalSpendUsd,
              address: undefined,
            },
          },
          result: {
            data: mockAccountsData,
          },
        },
        {
          request: {
            query: TOP_SWAP_ACCOUNTS_QUERY,
            variables: {},
          },
          result: {
            data: mockTopSwapAccountsData,
          },
        },
      ];

      const { result: accountsResult } = renderHook(
        () => useAccounts(1, 10, '', Account_OrderBy.TotalSpendUsd),
        { wrapper: createWrapper(concurrentMocks) }
      );

      const { result: topSwapResult } = renderHook(() => useTopSwapAccounts(), {
        wrapper: createWrapper(concurrentMocks),
      });

      await waitFor(() => {
        expect(accountsResult.current.loading).toBe(false);
        expect(topSwapResult.current.loading).toBe(false);
      });

      expect(accountsResult.current.accounts).toHaveLength(2);
      expect(topSwapResult.current.accounts).toHaveLength(2);
    });

    it('should handle network timeout', async () => {
      const timeoutMocks = [
        {
          request: {
            query: ACCOUNTS_WITHOUT_ADDRESS_QUERY,
            variables: {
              skip: 0,
              first: 10,
              orderBy: Account_OrderBy.TotalSpendUsd,
              address: undefined,
            },
          },
          error: new Error('Request timeout'),
        },
      ];

      const { result } = renderHook(
        () => useAccounts(1, 10, '', Account_OrderBy.TotalSpendUsd),
        { wrapper: createWrapper(timeoutMocks) }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error?.message).toBe('Request timeout');
    });

    it('should handle very large datasets', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `0x${i.toString(16).padStart(40, '0')}`,
        totalSpendUSD: (Math.random() * 10000).toString(),
        swapCount: Math.floor(Math.random() * 1000).toString(),
        holdingPoolCount: Math.floor(Math.random() * 100).toString(),
        memeTokenHoldingCount: Math.floor(Math.random() * 50).toString(),
        platformTxCount: Math.floor(Math.random() * 5000).toString(),
        participateCount: Math.floor(Math.random() * 500).toString(),
        totalDepositPot2pumpUSD: (Math.random() * 50000).toString(),
        pot2PumpLaunchCount: Math.floor(Math.random() * 10).toString(),
        transaction: [{ timestamp: '1735123800' }],
      }));

      const largeMocks = [
        {
          request: {
            query: ACCOUNTS_WITHOUT_ADDRESS_QUERY,
            variables: {
              skip: 0,
              first: 1000,
              orderBy: Account_OrderBy.TotalSpendUsd,
              address: undefined,
            },
          },
          result: {
            data: { accounts: largeDataset },
          },
        },
      ];

      const { result } = renderHook(
        () => useAccounts(1, 1000, '', Account_OrderBy.TotalSpendUsd),
        { wrapper: createWrapper(largeMocks) }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.accounts).toHaveLength(1000);
    });
  });
});
