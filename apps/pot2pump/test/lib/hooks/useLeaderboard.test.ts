import { renderHook, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { useLeaderboard } from '../../../lib/hooks/useLeaderboard';
import { LEADERBOARD_QUERY } from '../../../lib/algebra/graphql/clients/leaderboard';
import * as React from 'react';

// Mock wallet dependency
jest.mock('@honeypot/shared/lib/wallet', () => ({
  wallet: {
    currentChain: {
      nativeToken: {
        symbol: 'BERA',
      },
    },
  },
}));

// Create mock data locally to avoid dependency issues
const createMockLeaderboardData = () => ({
  factories: [
    {
      totalMemeCreated: '150',
      totalSuccessedMeme: '45',
      totalDepositedUSD: '1500000.50',
    },
  ],
});

describe('useLeaderboard Hook', () => {
  const createWrapper = (mocks: any[]) => {
    const MockWrapper = ({ children }: { children: React.ReactNode }) => {
      return React.createElement(MockedProvider, { mocks }, children);
    };
    return MockWrapper;
  };

  describe('Successful data fetching', () => {
    it('should fetch and format leaderboard stats correctly', async () => {
      const mockData = createMockLeaderboardData();
      const mocks = [
        {
          request: {
            query: LEADERBOARD_QUERY,
          },
          result: {
            data: mockData,
          },
        },
      ];

      const { result } = renderHook(() => useLeaderboard(), {
        wrapper: createWrapper(mocks),
      });

      // Initially loading
      expect(result.current.loading).toBe(true);
      expect(result.current.stats).toBeNull();
      expect(result.current.error).toBeUndefined();

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Check formatted stats
      expect(result.current.stats).toBeDefined();
      expect(result.current.stats?.totalMemeCreated).toEqual({
        title: 'Total Meme Created',
        value: mockData.factories[0].totalMemeCreated,
      });
      expect(result.current.stats?.totalSuccessedMeme).toEqual({
        title: 'Total Successed Meme',
        value: mockData.factories[0].totalSuccessedMeme,
      });
      expect(result.current.stats?.totalDepositedUSD).toEqual({
        title: 'Total Deposited USD',
        value: mockData.factories[0].totalDepositedUSD,
      });
    });

    it('should handle empty factory data', async () => {
      const mocks = [
        {
          request: {
            query: LEADERBOARD_QUERY,
          },
          result: {
            data: { factories: [] },
          },
        },
      ];

      const { result } = renderHook(() => useLeaderboard(), {
        wrapper: createWrapper(mocks),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.stats).toBeNull();
      expect(result.current.error).toBeUndefined();
    });

    it('should handle missing factory data fields', async () => {
      const mocks = [
        {
          request: {
            query: LEADERBOARD_QUERY,
          },
          result: {
            data: {
              factories: [
                {
                  totalMemeCreated: '100',
                  totalSuccessedMeme: null,
                  totalDepositedUSD: undefined,
                },
              ],
            },
          },
        },
      ];

      const { result } = renderHook(() => useLeaderboard(), {
        wrapper: createWrapper(mocks),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.stats).toBeDefined();
      expect(result.current.stats?.totalMemeCreated.value).toBe('100');
      expect(result.current.stats?.totalSuccessedMeme.value).toBeNull();
      expect(result.current.stats?.totalDepositedUSD.value).toBeUndefined();
    });
  });

  describe('Error handling', () => {
    it('should handle network errors', async () => {
      const mocks = [
        {
          request: {
            query: LEADERBOARD_QUERY,
          },
          error: new Error('Network error'),
        },
      ];

      const { result } = renderHook(() => useLeaderboard(), {
        wrapper: createWrapper(mocks),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.stats).toBeNull();
    });

    it('should handle GraphQL errors', async () => {
      const mocks = [
        {
          request: {
            query: LEADERBOARD_QUERY,
          },
          result: {
            errors: [{ message: 'Failed to fetch leaderboard data' }],
          },
        },
      ];

      const { result } = renderHook(() => useLeaderboard(), {
        wrapper: createWrapper(mocks),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.stats).toBeNull();
    });
  });

  describe('Data transformation and formatting', () => {
    it('should handle zero values correctly', async () => {
      const mocks = [
        {
          request: {
            query: LEADERBOARD_QUERY,
          },
          result: {
            data: {
              factories: [
                {
                  totalMemeCreated: '0',
                  totalSuccessedMeme: '0',
                  totalDepositedUSD: '0',
                },
              ],
            },
          },
        },
      ];

      const { result } = renderHook(() => useLeaderboard(), {
        wrapper: createWrapper(mocks),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.stats).toBeDefined();
      expect(result.current.stats?.totalMemeCreated.value).toBe('0');
      expect(result.current.stats?.totalSuccessedMeme.value).toBe('0');
      expect(result.current.stats?.totalDepositedUSD.value).toBe('0');
    });

    it('should handle very large numbers', async () => {
      const mocks = [
        {
          request: {
            query: LEADERBOARD_QUERY,
          },
          result: {
            data: {
              factories: [
                {
                  totalMemeCreated: '999999999',
                  totalSuccessedMeme: '888888888',
                  totalDepositedUSD: '777777777.123456789',
                },
              ],
            },
          },
        },
      ];

      const { result } = renderHook(() => useLeaderboard(), {
        wrapper: createWrapper(mocks),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.stats).toBeDefined();
      expect(result.current.stats?.totalMemeCreated.value).toBe('999999999');
      expect(result.current.stats?.totalSuccessedMeme.value).toBe('888888888');
      expect(result.current.stats?.totalDepositedUSD.value).toBe(
        '777777777.123456789'
      );
    });
  });

  describe('Loading states', () => {
    it('should show loading state initially', () => {
      const mocks = [
        {
          request: {
            query: LEADERBOARD_QUERY,
          },
          result: {
            data: createMockLeaderboardData(),
          },
          delay: 1000, // Simulate slow network
        },
      ];

      const { result } = renderHook(() => useLeaderboard(), {
        wrapper: createWrapper(mocks),
      });

      expect(result.current.loading).toBe(true);
      expect(result.current.stats).toBeNull();
      expect(result.current.error).toBeUndefined();
    });
  });

  describe('Edge cases', () => {
    it('should handle null data response', async () => {
      const mocks = [
        {
          request: {
            query: LEADERBOARD_QUERY,
          },
          result: {
            data: null,
          },
        },
      ];

      const { result } = renderHook(() => useLeaderboard(), {
        wrapper: createWrapper(mocks),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.stats).toBeNull();
    });

    it('should handle undefined factories array', async () => {
      const mocks = [
        {
          request: {
            query: LEADERBOARD_QUERY,
          },
          result: {
            data: {
              factories: undefined,
            },
          },
        },
      ];

      const { result } = renderHook(() => useLeaderboard(), {
        wrapper: createWrapper(mocks),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.stats).toBeNull();
    });
  });
});
