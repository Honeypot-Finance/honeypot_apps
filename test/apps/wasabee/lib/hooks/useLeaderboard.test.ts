import { renderHook, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { useLeaderboard } from '@/lib/hooks/useLeaderboard';
import { LEADERBOARD_QUERY } from '@/lib/algebra/graphql/clients/leaderboard';
import { usePoolsListQuery } from '@/lib/algebra/graphql/generated/graphql';
import { createWrapper } from '../../../../shared/leaderboard-test-utils';

// Mock the usePoolsListQuery hook
jest.mock('@/lib/algebra/graphql/generated/graphql', () => ({
  usePoolsListQuery: jest.fn()
}));

const mockFactoryData = {
  factories: [
    {
      txCount: '1000',
      untrackedVolumeUSD: '5000000.50',
      totalFeesUSD: '25000.75'
    }
  ]
};

const mockPoolsData = {
  pools: [
    {
      totalValueLockedUSD: '1000000.25'
    },
    {
      totalValueLockedUSD: '2000000.50'
    },
    {
      totalValueLockedUSD: '500000.75'
    }
  ]
};

describe('useLeaderboard (Wasabee)', () => {
  beforeEach(() => {
    (usePoolsListQuery as jest.Mock).mockReturnValue({
      data: mockPoolsData
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const defaultMocks = [
    {
      request: {
        query: LEADERBOARD_QUERY,
        variables: {}
      },
      result: {
        data: mockFactoryData
      }
    }
  ];

  it('should fetch leaderboard stats successfully', async () => {
    const { result } = renderHook(
      () => useLeaderboard(),
      { wrapper: createWrapper(defaultMocks) }
    );

    expect(result.current.loading).toBe(true);
    expect(result.current.stats).toBeNull();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.stats).toBeDefined();
    expect(result.current.stats?.totalTrades).toEqual({
      title: 'Total Trades',
      value: '1000'
    });
    expect(result.current.stats?.totalVolume).toEqual({
      title: 'Total Volume',
      value: '5,000,000.50'
    });
    expect(result.current.stats?.totalFees).toEqual({
      title: 'Total Fees',
      value: '25,000.75'
    });
  });

  it('should calculate TVL from pools data', async () => {
    const { result } = renderHook(
      () => useLeaderboard(),
      { wrapper: createWrapper(defaultMocks) }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.stats?.tvl).toEqual({
      title: 'TVL',
      value: '3,500,001.50'
    });
  });

  it('should handle empty factory data', async () => {
    const emptyMocks = [
      {
        request: {
          query: LEADERBOARD_QUERY,
          variables: {}
        },
        result: {
          data: { factories: [] }
        }
      }
    ];

    const { result } = renderHook(
      () => useLeaderboard(),
      { wrapper: createWrapper(emptyMocks) }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.stats).toBeNull();
  });

  it('should handle missing pools data', async () => {
    (usePoolsListQuery as jest.Mock).mockReturnValue({
      data: null
    });

    const { result } = renderHook(
      () => useLeaderboard(),
      { wrapper: createWrapper(defaultMocks) }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.stats?.tvl).toEqual({
      title: 'TVL',
      value: '0.00'
    });
  });

  it('should handle empty pools array', async () => {
    (usePoolsListQuery as jest.Mock).mockReturnValue({
      data: { pools: [] }
    });

    const { result } = renderHook(
      () => useLeaderboard(),
      { wrapper: createWrapper(defaultMocks) }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.stats?.tvl).toEqual({
      title: 'TVL',
      value: '0.00'
    });
  });

  it('should format large numbers correctly', async () => {
    const largeMocks = [
      {
        request: {
          query: LEADERBOARD_QUERY,
          variables: {}
        },
        result: {
          data: {
            factories: [
              {
                txCount: '1000000',
                untrackedVolumeUSD: '1500000000.123456',
                totalFeesUSD: '75000000.987654'
              }
            ]
          }
        }
      }
    ];

    (usePoolsListQuery as jest.Mock).mockReturnValue({
      data: {
        pools: [
          { totalValueLockedUSD: '500000000.123' },
          { totalValueLockedUSD: '1000000000.456' }
        ]
      }
    });

    const { result } = renderHook(
      () => useLeaderboard(),
      { wrapper: createWrapper(largeMocks) }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.stats?.totalVolume.value).toBe('1,500,000,000.12');
    expect(result.current.stats?.totalFees.value).toBe('75,000,000.99');
    expect(result.current.stats?.tvl.value).toBe('1,500,000,000.58');
  });

  it('should handle zero values', async () => {
    const zeroMocks = [
      {
        request: {
          query: LEADERBOARD_QUERY,
          variables: {}
        },
        result: {
          data: {
            factories: [
              {
                txCount: '0',
                untrackedVolumeUSD: '0',
                totalFeesUSD: '0'
              }
            ]
          }
        }
      }
    ];

    (usePoolsListQuery as jest.Mock).mockReturnValue({
      data: { pools: [] }
    });

    const { result } = renderHook(
      () => useLeaderboard(),
      { wrapper: createWrapper(zeroMocks) }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.stats?.totalTrades.value).toBe('0');
    expect(result.current.stats?.totalVolume.value).toBe('0.00');
    expect(result.current.stats?.totalFees.value).toBe('0.00');
    expect(result.current.stats?.tvl.value).toBe('0.00');
  });

  it('should handle GraphQL errors', async () => {
    const errorMocks = [
      {
        request: {
          query: LEADERBOARD_QUERY,
          variables: {}
        },
        error: new Error('Network error')
      }
    ];

    const { result } = renderHook(
      () => useLeaderboard(),
      { wrapper: createWrapper(errorMocks) }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.stats).toBeNull();
  });

  it('should handle null/undefined values in factory data', async () => {
    const nullMocks = [
      {
        request: {
          query: LEADERBOARD_QUERY,
          variables: {}
        },
        result: {
          data: {
            factories: [
              {
                txCount: null,
                untrackedVolumeUSD: undefined,
                totalFeesUSD: ''
              }
            ]
          }
        }
      }
    ];

    const { result } = renderHook(
      () => useLeaderboard(),
      { wrapper: createWrapper(nullMocks) }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.stats?.totalTrades.value).toBe(null);
    expect(result.current.stats?.totalVolume.value).toBe('0.00');
    expect(result.current.stats?.totalFees.value).toBe('0.00');
  });
});