import { renderHook } from '@testing-library/react';

import { useLaunchTokenQuery } from '../../../lib/hooks/useLaunchTokenQuery';

// import { wallet } from '@honeypot/shared/lib/wallet';

// Mock Apollo Client
jest.mock('@apollo/client', () => ({
  useQuery: jest.fn(),
}));

// Mock wallet
jest.mock('@honeypot/shared/lib/wallet', () => ({
  wallet: {
    currentChainId: 80084,
    isInit: true,
    account: '0x1234567890123456789012345678901234567890',
  },
}));

// Mock GraphQL documents and functions
jest.mock('@pot2pump/lib/algebra/graphql/generated/graphql', () => ({
  GetPot2PumpByLaunchTokenDocument: 'mock-document',
}));

jest.mock('@pot2pump/lib/algebra/graphql/clients/pair', () => ({
  pot2PumpToMemePair: jest.fn(),
}));

describe('useLaunchTokenQuery', () => {
  const mockUseQuery = require('@apollo/client').useQuery;
  const mockPot2PumpToMemePair =
    require('@pot2pump/lib/algebra/graphql/clients/pair').pot2PumpToMemePair;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should call useQuery with correct parameters', async () => {
      const mockQueryResult = {
        data: null,
        loading: false,
        error: null,
        refetch: jest.fn(),
      };

      mockUseQuery.mockReturnValue(mockQueryResult);

      const { result } = renderHook(() => useLaunchTokenQuery('0xlaunchtoken'));

      expect(mockUseQuery).toHaveBeenCalledWith(
        'mock-document',
        expect.objectContaining({
          variables: { launchToken: '0xlaunchtoken' },
          fetchPolicy: 'network-only',
          skip: false,
        })
      );

      expect(result.current).toEqual(mockQueryResult);
    });

    it('should skip query when no launch token address provided', () => {
      const mockQueryResult = {
        data: null,
        loading: false,
        error: null,
        refetch: jest.fn(),
      };

      mockUseQuery.mockReturnValue(mockQueryResult);

      renderHook(() => useLaunchTokenQuery(''));

      expect(mockUseQuery).toHaveBeenCalledWith(
        'mock-document',
        expect.objectContaining({
          skip: true,
        })
      );
    });

    it('should process data with onCompleted callback', () => {
      const mockData = {
        pot2Pumps: [{ id: '1', name: 'Test Token' }],
      };

      const mockQueryResult = {
        data: mockData,
        loading: false,
        error: null,
        refetch: jest.fn(),
      };

      mockUseQuery.mockReturnValue(mockQueryResult);
      mockPot2PumpToMemePair.mockReturnValue({ processed: true });

      renderHook(() => useLaunchTokenQuery('0xlaunchtoken'));

      // Get the onCompleted callback from the mock call
      const onCompletedCallback = mockUseQuery.mock.calls[0][1].onCompleted;
      onCompletedCallback(mockData);

      expect(mockPot2PumpToMemePair).toHaveBeenCalledWith(
        mockData.pot2Pumps[0]
      );
    });

    it('should return null when no data in onCompleted', () => {
      const mockData = { pot2Pumps: [] };

      const mockQueryResult = {
        data: mockData,
        loading: false,
        error: null,
        refetch: jest.fn(),
      };

      mockUseQuery.mockReturnValue(mockQueryResult);

      renderHook(() => useLaunchTokenQuery('0xlaunchtoken'));

      // Get the onCompleted callback from the mock call
      const onCompletedCallback = mockUseQuery.mock.calls[0][1].onCompleted;
      const result = onCompletedCallback(mockData);

      expect(result).toBeNull();
      expect(mockPot2PumpToMemePair).not.toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should return loading state from useQuery', () => {
      const mockQueryResult = {
        data: null,
        loading: true,
        error: null,
        refetch: jest.fn(),
      };

      mockUseQuery.mockReturnValue(mockQueryResult);

      const { result } = renderHook(() => useLaunchTokenQuery('0xlaunchtoken'));

      expect(result.current.loading).toBe(true);
    });

    it('should return data from useQuery', () => {
      const mockData = { pot2Pumps: [{ id: '1' }] };
      const mockQueryResult = {
        data: mockData,
        loading: false,
        error: null,
        refetch: jest.fn(),
      };

      mockUseQuery.mockReturnValue(mockQueryResult);

      const { result } = renderHook(() => useLaunchTokenQuery('0xlaunchtoken'));

      expect(result.current.data).toEqual(mockData);
    });
  });

  describe('Error Handling', () => {
    it('should return error from useQuery', () => {
      const mockError = new Error('GraphQL Error');
      const mockQueryResult = {
        data: null,
        loading: false,
        error: mockError,
        refetch: jest.fn(),
      };

      mockUseQuery.mockReturnValue(mockQueryResult);

      const { result } = renderHook(() => useLaunchTokenQuery('0xlaunchtoken'));

      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('Refetch Functionality', () => {
    it('should provide refetch function from useQuery', () => {
      const mockRefetch = jest.fn();
      const mockQueryResult = {
        data: null,
        loading: false,
        error: null,
        refetch: mockRefetch,
      };

      mockUseQuery.mockReturnValue(mockQueryResult);

      const { result } = renderHook(() => useLaunchTokenQuery('0xlaunchtoken'));

      expect(result.current.refetch).toBe(mockRefetch);
    });
  });
});
