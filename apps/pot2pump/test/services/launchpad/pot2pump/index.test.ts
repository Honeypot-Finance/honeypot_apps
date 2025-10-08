

import { Pot2PumpService } from '../../../../services/launchpad/pot2pump/index';
import { MemePairContract } from '../../../../services/contract/launches/pot2pump/memepair-contract';

import { wallet } from '@honeypot/shared/lib/wallet';


// Mock wallet
jest.mock('@honeypot/shared/lib/wallet', () => ({
  wallet: {
    account: '0x1234567890123456789012345678901234567890',
    currentChainId: 80084,
  },
}));

// Mock fetchPot2PumpList
jest.mock(
  '../../../../lib/algebra/graphql/clients/pair',
  () => ({
    fetchPot2PumpList: jest.fn(),
  })
);

describe('Pot2PumpService', () => {
  let service: Pot2PumpService;

  beforeEach(() => {
    service = new Pot2PumpService();
  });

  describe('DEFAULT_FILTERS', () => {
    it('should have correct MY_LAUNCHES_FILTER structure', () => {
      expect(service.DEFAULT_FILTERS.MY_LAUNCHES_FILTER).toEqual({
        status: 'all',
        search: '',
        currentPage: 0,
        limit: 9,
        hasNextPage: true,
        creator: wallet.account,
        orderBy: 'endTime',
        orderDirection: 'desc',
      });
    });

    it('should have correct MY_PARTICIPATED_PAIRS_FILTER structure', () => {
      expect(service.DEFAULT_FILTERS.MY_PARTICIPATED_PAIRS_FILTER).toEqual({
        status: 'all',
        search: '',
        currentPage: 0,
        limit: 9,
        hasNextPage: true,
        participant: wallet.account,
        orderBy: 'endTime',
        orderDirection: 'desc',
      });
    });
  });

  describe('LoadMoreMyLaunchesPage', () => {
    it('should return items when API call succeeds', async () => {
      const mockPairs = [
        new MemePairContract({ address: '0xtest1' }),
        new MemePairContract({ address: '0xtest2' }),
      ];

      const mockResponse = {
        status: 'success',
        data: {
          pairs: mockPairs,
          filterUpdates: { hasNextPage: false },
        },
      };

      const {
        fetchPot2PumpList,
      } = require('../../../../lib/algebra/graphql/clients/pair');
      fetchPot2PumpList.mockResolvedValue(mockResponse);

      const filter = {
        status: 'all' as const,
        search: '',
        currentPage: 0,
        limit: 9,
        hasNextPage: true,
      };

      const result = await service.LoadMoreMyLaunchesPage(filter);

      expect(result).toEqual({
        items: mockPairs,
        filterUpdates: { hasNextPage: false },
      });
      expect(fetchPot2PumpList).toHaveBeenCalledWith({
        chainId: '80084',
        filter: {
          ...filter,
          userAccountId: wallet.account.toLowerCase(),
        },
      });
    });

    it('should return empty items when API call fails', async () => {
      const mockResponse = {
        status: 'error',
      };

      const {
        fetchPot2PumpList,
      } = require('../../../../lib/algebra/graphql/clients/pair');
      fetchPot2PumpList.mockResolvedValue(mockResponse);

      const filter = {
        status: 'all' as const,
        search: '',
        currentPage: 0,
        limit: 9,
        hasNextPage: true,
      };

      const result = await service.LoadMoreMyLaunchesPage(filter);

      expect(result).toEqual({
        items: [],
      });
    });

    it('should set userAccountId to lowercase wallet account', async () => {
      const {
        fetchPot2PumpList,
      } = require('../../../../lib/algebra/graphql/clients/pair');
      fetchPot2PumpList.mockResolvedValue({
        status: 'success',
        data: { pairs: [] },
      });

      const filter = {
        status: 'all' as const,
        search: '',
        currentPage: 0,
        limit: 9,
        hasNextPage: true,
      };

      await service.LoadMoreMyLaunchesPage(filter);

      expect(fetchPot2PumpList).toHaveBeenCalledWith({
        chainId: '80084',
        filter: {
          ...filter,
          userAccountId: wallet.account.toLowerCase(),
        },
      });
    });
  });

  describe('LoadMoreParticipatedPage', () => {
    it('should return items when API call succeeds', async () => {
      const mockPairs = [new MemePairContract({ address: '0xtest3' })];

      const mockResponse = {
        status: 'success',
        data: {
          pairs: mockPairs,
          filterUpdates: { hasNextPage: true },
        },
      };

      const {
        fetchPot2PumpList,
      } = require('../../../../lib/algebra/graphql/clients/pair');
      fetchPot2PumpList.mockResolvedValue(mockResponse);

      const filter = {
        status: 'processing' as const,
        search: 'test',
        currentPage: 1,
        limit: 9,
        hasNextPage: true,
      };

      const result = await service.LoadMoreParticipatedPage(filter);

      expect(result).toEqual({
        items: mockPairs,
        filterUpdates: { hasNextPage: true },
      });
    });

    it('should return empty items when API call fails', async () => {
      const mockResponse = {
        status: 'error',
      };

      const {
        fetchPot2PumpList,
      } = require('../../../../lib/algebra/graphql/clients/pair');
      fetchPot2PumpList.mockResolvedValue(mockResponse);

      const filter = {
        status: 'all' as const,
        search: '',
        currentPage: 0,
        limit: 9,
        hasNextPage: true,
      };

      const result = await service.LoadMoreParticipatedPage(filter);

      expect(result).toEqual({
        items: [],
      });
    });
  });

  describe('Pagination States', () => {
    it('should initialize myLaunches pagination state correctly', () => {
      expect(service.myLaunches).toBeDefined();
      expect(service.myLaunches.namespace).toBe('myLaunches');
    });

    it('should initialize participatedPairs pagination state correctly', () => {
      expect(service.participatedPairs).toBeDefined();
      expect(service.participatedPairs.namespace).toBe('participatedPairs');
    });
  });
});
