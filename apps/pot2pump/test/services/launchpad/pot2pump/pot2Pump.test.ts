

import { Pot2PumpPumpingService } from '../../../../services/launchpad/pot2pump/pot2Pump';
import { MemePairContract } from '../../../../services/contract/launches/pot2pump/memepair-contract';
import { wallet } from '@honeypot/shared/lib/wallet';

// Mock wallet
jest.mock('@honeypot/shared/lib/wallet', () => ({
  wallet: {
    currentChainId: 80084,
  },
}));

// Mock fetchPot2PumpList
jest.mock('../../../../lib/algebra/graphql/clients/pair', () => ({
  fetchPot2PumpList: jest.fn(),
}));

describe('Pot2PumpPumpingService', () => {
  let service: Pot2PumpPumpingService;
  
  beforeEach(() => {
    // Reset wallet mock to default state
    (wallet as any).currentChainId = 80084;
    service = new Pot2PumpPumpingService();
  });

  describe('DEFAULT_FILTER', () => {
    it('should have correct default filter structure', () => {
      expect(service.DEFAULT_FILTER).toEqual({
        currentPage: 0,
        status: 'success',
        limit: 9,
        hasNextPage: true,
        orderBy: 'endTime',
        orderDirection: 'desc',
      });
    });
  });

  describe('LoadMoreProjectPage', () => {
    it('should return items when API call succeeds', async () => {
      const mockPairs = [
        new MemePairContract({ address: '0xtest1' }),
        new MemePairContract({ address: '0xtest2' }),
      ];
      
      const mockResponse = {
        status: 'success',
        data: {
          pairs: mockPairs,
        },
      };

      const { fetchPot2PumpList } = require('../../../../lib/algebra/graphql/clients/pair');
      fetchPot2PumpList.mockResolvedValue(mockResponse);

      const filter = {
        status: 'success' as const,
        currentPage: 0,
        limit: 9,
        hasNextPage: true,
        orderBy: 'endTime',
        orderDirection: 'desc',
      };

      const result = await service.LoadMoreProjectPage(filter);

      expect(result).toEqual({
        items: mockPairs,
      });
      expect(fetchPot2PumpList).toHaveBeenCalledWith({
        chainId: '80084',
        filter: filter,
      });
    });

    it('should return empty items when API call fails', async () => {
      const mockResponse = {
        status: 'error',
      };

      const { fetchPot2PumpList } = require('../../../../lib/algebra/graphql/clients/pair');
      fetchPot2PumpList.mockResolvedValue(mockResponse);

      const filter = {
        status: 'success' as const,
        currentPage: 0,
        limit: 9,
        hasNextPage: true,
        orderBy: 'endTime',
        orderDirection: 'desc',
      };

      const result = await service.LoadMoreProjectPage(filter);

      expect(result).toEqual({
        items: [],
      });
    });

    it('should handle different filter parameters', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          pairs: [],
        },
      };

      const { fetchPot2PumpList } = require('../../../../lib/algebra/graphql/clients/pair');
      fetchPot2PumpList.mockResolvedValue(mockResponse);

      const filter = {
        status: 'processing' as const,
        currentPage: 2,
        limit: 15,
        hasNextPage: false,
        orderBy: 'createdAt',
        orderDirection: 'asc',
        search: 'test token',
      };

      await service.LoadMoreProjectPage(filter);

      expect(fetchPot2PumpList).toHaveBeenCalledWith({
        chainId: '80084',
        filter: filter,
      });
    });

    it('should use current chain ID from wallet', async () => {
      const mockResponse = {
        status: 'success',
        data: { pairs: [] },
      };

      const { fetchPot2PumpList } = require('../../../../lib/algebra/graphql/clients/pair');
      fetchPot2PumpList.mockResolvedValue(mockResponse);

      // Change wallet chain ID
      (wallet as any).currentChainId = 1;

      const filter = service.DEFAULT_FILTER;
      await service.LoadMoreProjectPage(filter);

      expect(fetchPot2PumpList).toHaveBeenCalledWith({
        chainId: '1',
        filter: filter,
      });
    });
  });

  describe('Pagination State', () => {
    it('should initialize projectsPage pagination state correctly', () => {
      expect(service.projectsPage).toBeDefined();
      expect(service.projectsPage.namespace).toBe('projectsPage');
    });

    it('should use correct default filter for pagination', () => {
      expect(service.projectsPage.defaultFilter).toEqual(service.DEFAULT_FILTER);
    });
  });

  describe('Filter Status Values', () => {
    it('should handle all valid status values', async () => {
      const { fetchPot2PumpList } = require('../../../../lib/algebra/graphql/clients/pair');
      fetchPot2PumpList.mockResolvedValue({ status: 'success', data: { pairs: [] } });

      const statusValues = ['success', 'processing', 'fail', 'all'] as const;

      for (const status of statusValues) {
        fetchPot2PumpList.mockClear(); // Clear previous calls
        const filter = { ...service.DEFAULT_FILTER, status };
        await service.LoadMoreProjectPage(filter);
        
        expect(fetchPot2PumpList).toHaveBeenCalledWith({
          chainId: '80084',
          filter: filter,
        });
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const { fetchPot2PumpList } = require('../../../../lib/algebra/graphql/clients/pair');
      fetchPot2PumpList.mockRejectedValue(new Error('Network error'));

      const filter = service.DEFAULT_FILTER;

      await expect(service.LoadMoreProjectPage(filter)).rejects.toThrow('Network error');
    });

    it('should handle malformed API responses', async () => {
      const { fetchPot2PumpList } = require('../../../../lib/algebra/graphql/clients/pair');
      fetchPot2PumpList.mockResolvedValue(null);

      const filter = service.DEFAULT_FILTER;

      await expect(service.LoadMoreProjectPage(filter)).rejects.toThrow();
    });
  });
});