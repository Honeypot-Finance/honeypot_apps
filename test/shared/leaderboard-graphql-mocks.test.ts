import { MockedProvider } from '@apollo/client/testing';
import { render, waitFor } from '@testing-library/react';
import { useQuery } from '@apollo/client';
import React from 'react';
import {
  mockCollections,
  createSuccessfulLeaderboardMock,
  createSuccessfulAccountsMock,
  createNetworkErrorMock,
  createGraphQLErrorMock,
  createMalformedDataMock,
  createEmptyDataMock,
  createLargeDatasetMock,
  createMockApolloProvider,
  createEdgeCaseMocks,
} from './leaderboard-graphql-mocks';
import { LEADERBOARD_QUERY } from '../../libs/shared/hpot-sdk/src/lib/graphql/clients/leaderboard';

// Test component to validate GraphQL mocks
function TestLeaderboardComponent() {
  const { data, loading, error } = useQuery(LEADERBOARD_QUERY);

  if (loading) return <div data-testid="loading">Loading...</div>;
  if (error) return <div data-testid="error">{error.message}</div>;
  if (!data) return <div data-testid="no-data">No data</div>;

  return (
    <div data-testid="success">
      <div data-testid="tx-count">{data.factories[0]?.txCount}</div>
      <div data-testid="volume">{data.factories[0]?.totalVolumeUSD}</div>
    </div>
  );
}

describe('Leaderboard GraphQL Mocks', () => {
  describe('Mock Data Generation', () => {
    it('should create successful leaderboard mock with correct structure', () => {
      const mock = createSuccessfulLeaderboardMock('shared');

      expect(mock.request.query).toBe(LEADERBOARD_QUERY);
      expect(mock.result.data.factories).toHaveLength(1);
      expect(mock.result.data.factories[0]).toHaveProperty('txCount');
      expect(mock.result.data.factories[0]).toHaveProperty('totalVolumeUSD');
      expect(mock.result.data.factories[0]).toHaveProperty('totalFeesUSD');
    });

    it('should create pot2pump specific mock with additional fields', () => {
      const mock = createSuccessfulLeaderboardMock('pot2pump');

      expect(mock.result.data.factories[0]).toHaveProperty('totalMemeCreated');
      expect(mock.result.data.factories[0]).toHaveProperty(
        'totalSuccessedMeme'
      );
      expect(mock.result.data.factories[0]).toHaveProperty('totalDepositedUSD');
    });

    it('should create accounts mock with pagination variables', () => {
      const variables = { skip: 0, first: 10 };
      const mock = createSuccessfulAccountsMock(variables, 'shared');

      expect(mock.request.variables).toEqual(variables);
      expect(mock.result.data.accounts).toHaveLength(10);
      expect(mock.result.data.accounts[0]).toHaveProperty('id');
      expect(mock.result.data.accounts[0]).toHaveProperty('totalSpendUSD');
    });

    it('should create pot2pump accounts mock with additional fields', () => {
      const variables = { skip: 0, first: 5 };
      const mock = createSuccessfulAccountsMock(variables, 'pot2pump');

      expect(mock.result.data.accounts[0]).toHaveProperty(
        'totalDepositPot2pumpUSD'
      );
      expect(mock.result.data.accounts[0]).toHaveProperty(
        'pot2PumpLaunchCount'
      );
    });
  });

  describe('Error Scenarios', () => {
    it('should create network error mock', () => {
      const mock = createNetworkErrorMock(LEADERBOARD_QUERY);

      expect(mock.request.query).toBe(LEADERBOARD_QUERY);
      expect(mock.error).toBeInstanceOf(Error);
      expect(mock.error?.message).toBe('Network error');
    });

    it('should create GraphQL error mock', () => {
      const errorMessage = 'Custom GraphQL error';
      const mock = createGraphQLErrorMock(LEADERBOARD_QUERY, {}, errorMessage);

      expect(mock.result.errors).toHaveLength(1);
      expect(mock.result.errors?.[0].message).toBe(errorMessage);
    });

    it('should create malformed data mock', () => {
      const mock = createMalformedDataMock(LEADERBOARD_QUERY);

      expect(mock.result.data.factories[0].txCount).toBe('invalid');
      expect(mock.result.data.factories[0].totalVolumeUSD).toBe('not-a-number');
    });

    it('should create empty data mock', () => {
      const mock = createEmptyDataMock(LEADERBOARD_QUERY);

      expect(mock.result.data.factories).toHaveLength(0);
      expect(mock.result.data.accounts).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('should create edge case mocks with extreme values', () => {
      const edgeCases = createEdgeCaseMocks();

      // Zero values
      expect(edgeCases.zeroValues.result.data.factories[0].txCount).toBe('0');
      expect(edgeCases.zeroValues.result.data.factories[0].totalVolumeUSD).toBe(
        '0'
      );

      // Extremely large values
      expect(
        edgeCases.extremelyLargeValues.result.data.factories[0].txCount
      ).toBe('999999999999');

      // Negative values
      expect(edgeCases.negativeValues.result.data.factories[0].txCount).toBe(
        '-1'
      );

      // Null/undefined values
      expect(
        edgeCases.nullUndefinedValues.result.data.factories[0].txCount
      ).toBeNull();
      expect(
        edgeCases.nullUndefinedValues.result.data.factories[0].totalVolumeUSD
      ).toBeUndefined();
    });
  });

  describe('Performance Testing Mocks', () => {
    it('should create large dataset mock', () => {
      const mock = createLargeDatasetMock(1000);

      expect(mock.result.data.accounts).toHaveLength(1000);
      expect(mock.request.variables.first).toBe(1000);
    });

    it('should create concurrent request mocks with random delays', () => {
      const mocks = mockCollections.performance.concurrentRequests;

      expect(mocks).toHaveLength(5);
      mocks.forEach((mock) => {
        expect(mock.delay).toBeGreaterThanOrEqual(0);
        expect(mock.delay).toBeLessThan(100);
      });
    });
  });

  describe('Mock Collections', () => {
    it('should provide comprehensive successful mock collection', () => {
      const { successful } = mockCollections;

      expect(successful.shared).toHaveProperty('leaderboard');
      expect(successful.shared).toHaveProperty('accounts');
      expect(successful.shared).toHaveProperty('topSwapAccounts');

      expect(successful.pot2pump).toHaveProperty('leaderboard');
      expect(successful.pot2pump).toHaveProperty('accounts');

      expect(successful.wasabee).toHaveProperty('leaderboard');
      expect(successful.wasabee).toHaveProperty('accounts');
    });

    it('should provide error scenario mocks', () => {
      const { errors } = mockCollections;

      expect(errors).toHaveProperty('networkError');
      expect(errors).toHaveProperty('graphqlError');
      expect(errors).toHaveProperty('timeoutError');
      expect(errors).toHaveProperty('malformedData');
      expect(errors).toHaveProperty('emptyData');
    });

    it('should provide pagination scenario mocks', () => {
      const { pagination } = mockCollections;

      expect(pagination).toHaveProperty('firstPage');
      expect(pagination).toHaveProperty('secondPage');
      expect(pagination).toHaveProperty('lastPage');
    });
  });

  describe('Apollo Provider Integration', () => {
    it('should create mock apollo provider with successful scenario', () => {
      const mocks = createMockApolloProvider('successful');

      expect(Array.isArray(mocks)).toBe(true);
      expect(mocks.length).toBeGreaterThan(0);
    });

    it('should render component with successful mock', async () => {
      const mocks = [createSuccessfulLeaderboardMock('shared')];

      const { getByTestId } = render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <TestLeaderboardComponent />
        </MockedProvider>
      );

      // Initially should show loading
      expect(getByTestId('loading')).toBeInTheDocument();

      // Wait for data to load
      await waitFor(() => {
        expect(getByTestId('success')).toBeInTheDocument();
      });

      expect(getByTestId('tx-count')).toHaveTextContent('25000');
      expect(getByTestId('volume')).toHaveTextContent('5000000.00');
    });

    it('should render component with network error mock', async () => {
      const mocks = [createNetworkErrorMock(LEADERBOARD_QUERY)];

      const { getByTestId } = render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <TestLeaderboardComponent />
        </MockedProvider>
      );

      // Initially should show loading
      expect(getByTestId('loading')).toBeInTheDocument();

      // Wait for error to appear
      await waitFor(() => {
        expect(getByTestId('error')).toBeInTheDocument();
      });

      expect(getByTestId('error')).toHaveTextContent('Network error');
    });

    it('should render component with GraphQL error mock', async () => {
      const mocks = [
        createGraphQLErrorMock(LEADERBOARD_QUERY, {}, 'Custom error'),
      ];

      const { getByTestId } = render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <TestLeaderboardComponent />
        </MockedProvider>
      );

      await waitFor(() => {
        expect(getByTestId('error')).toBeInTheDocument();
      });

      expect(getByTestId('error')).toHaveTextContent('Custom error');
    });
  });

  describe('Data Validation', () => {
    it('should generate consistent mock data across calls', () => {
      const mock1 = createSuccessfulLeaderboardMock('shared');
      const mock2 = createSuccessfulLeaderboardMock('shared');

      expect(mock1.result.data.factories[0].txCount).toBe(
        mock2.result.data.factories[0].txCount
      );
      expect(mock1.result.data.factories[0].totalVolumeUSD).toBe(
        mock2.result.data.factories[0].totalVolumeUSD
      );
    });

    it('should generate different data for different types', () => {
      const sharedMock = createSuccessfulLeaderboardMock('shared');
      const pot2pumpMock = createSuccessfulLeaderboardMock('pot2pump');

      expect(sharedMock.result.data.factories[0]).not.toHaveProperty(
        'totalMemeCreated'
      );
      expect(pot2pumpMock.result.data.factories[0]).toHaveProperty(
        'totalMemeCreated'
      );
    });

    it('should generate valid account data with proper structure', () => {
      const mock = createSuccessfulAccountsMock(
        { skip: 0, first: 5 },
        'pot2pump'
      );
      const account = mock.result.data.accounts[0];

      expect(account.id).toMatch(/^0x[0-9a-f]{40}$/);
      expect(account.swapCount).toMatch(/^\d+$/);
      expect(account.totalSpendUSD).toMatch(/^\d+\.\d{2}$/);
      expect(account.transaction).toHaveLength(1);
      expect(account.transaction[0]).toHaveProperty('timestamp');
    });
  });

  describe('Mock Scenarios Integration', () => {
    it('should handle search scenario mocks', () => {
      const { search } = mockCollections;
      const validAddressMock = search.validAddress;

      expect(validAddressMock.request.variables.address).toBe(
        '0x1234567890123456789012345678901234567890'
      );
      expect(validAddressMock.result.data.accounts[0].id).toBe(
        '0x1234567890123456789012345678901234567890'
      );
    });

    it('should handle sorting scenario mocks', () => {
      const { sorting } = mockCollections;

      expect(sorting.byTotalSpend.request.variables.orderBy).toBe(
        'totalSpendUSD'
      );
      expect(sorting.bySwapCount.request.variables.orderBy).toBe('swapCount');
      expect(sorting.byParticipateCount.request.variables.orderBy).toBe(
        'participateCount'
      );
    });

    it('should handle pagination scenario mocks', () => {
      const { pagination } = mockCollections;

      expect(pagination.firstPage.request.variables.skip).toBe(0);
      expect(pagination.secondPage.request.variables.skip).toBe(10);
      expect(pagination.lastPage.request.variables.skip).toBe(90);
    });
  });
});
