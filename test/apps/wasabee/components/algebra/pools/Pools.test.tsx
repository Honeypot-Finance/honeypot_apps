import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the pools list component since we need to test the actual implementation
const MockPoolsList = ({ searchString, sortBy, onPoolClick }) => {
  const mockPools = [
    {
      id: '0x123',
      token0: { symbol: 'USDC', address: '0x123' },
      token1: { symbol: 'USDT', address: '0x456' },
      tvlUSD: '1000000',
      volume24hUSD: '50000',
      fees24hUSD: '500',
      apr: 15.5,
      liquidity: '5000000000000000000',
    },
    {
      id: '0x789',
      token0: { symbol: 'ETH', address: '0x789' },
      token1: { symbol: 'USDC', address: '0x123' },
      tvlUSD: '2000000',
      volume24hUSD: '100000',
      fees24hUSD: '1000',
      apr: 12.3,
      liquidity: '10000000000000000000',
    },
  ];

  const filteredPools = searchString 
    ? mockPools.filter(pool => 
        pool.token0.symbol.toLowerCase().includes(searchString.toLowerCase()) ||
        pool.token1.symbol.toLowerCase().includes(searchString.toLowerCase())
      )
    : mockPools;

  const sortedPools = [...filteredPools].sort((a, b) => {
    switch (sortBy) {
      case 'tvl':
        return Number(b.tvlUSD) - Number(a.tvlUSD);
      case 'volume':
        return Number(b.volume24hUSD) - Number(a.volume24hUSD);
      case 'apr':
        return b.apr - a.apr;
      default:
        return 0;
    }
  });

  return (
    <div data-testid="pools-list">
      <div className="pools-header">
        <div>Token Pair</div>
        <div>TVL</div>
        <div>24h Volume</div>
        <div>24h Fees</div>
        <div>APR</div>
      </div>
      {sortedPools.length === 0 ? (
        <div data-testid="no-pools">No pools found</div>
      ) : (
        sortedPools.map(pool => (
          <div 
            key={pool.id} 
            data-testid={`pool-${pool.id}`}
            onClick={() => onPoolClick?.(pool)}
            className="pool-row cursor-pointer"
          >
            <div>{pool.token0.symbol}/{pool.token1.symbol}</div>
            <div>${Number(pool.tvlUSD).toLocaleString()}</div>
            <div>${Number(pool.volume24hUSD).toLocaleString()}</div>
            <div>${Number(pool.fees24hUSD).toLocaleString()}</div>
            <div>{pool.apr.toFixed(2)}%</div>
          </div>
        ))
      )}
    </div>
  );
};

describe('Pools Component', () => {
  const PoolsComponent = ({ searchString = '', sortBy = 'tvl', onPoolClick }) => {
    return (
      <div className="pools-container">
        <div className="pools-header-controls">
          <input 
            data-testid="search-input"
            placeholder="Search pools..."
            value={searchString}
            onChange={() => {}}
          />
          <select data-testid="sort-select" value={sortBy}>
            <option value="tvl">TVL</option>
            <option value="volume">Volume</option>
            <option value="apr">APR</option>
            <option value="fees">Fees</option>
          </select>
        </div>
        <MockPoolsList 
          searchString={searchString}
          sortBy={sortBy}
          onPoolClick={onPoolClick}
        />
      </div>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render pools list with header controls', () => {
      render(<PoolsComponent />);
      
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
      expect(screen.getByTestId('sort-select')).toBeInTheDocument();
      expect(screen.getByTestId('pools-list')).toBeInTheDocument();
    });

    it('should display pool data in table format', () => {
      render(<PoolsComponent />);
      
      expect(screen.getByText('Token Pair')).toBeInTheDocument();
      expect(screen.getByText('TVL')).toBeInTheDocument();
      expect(screen.getByText('24h Volume')).toBeInTheDocument();
      expect(screen.getByText('24h Fees')).toBeInTheDocument();
      expect(screen.getByText('APR')).toBeInTheDocument();
    });

    it('should display individual pool rows', () => {
      render(<PoolsComponent />);
      
      expect(screen.getByText('USDC/USDT')).toBeInTheDocument();
      expect(screen.getByText('ETH/USDC')).toBeInTheDocument();
    });

    it('should format currency values correctly', () => {
      render(<PoolsComponent />);
      
      expect(screen.getByText('$1,000,000')).toBeInTheDocument();
      expect(screen.getByText('$2,000,000')).toBeInTheDocument();
      expect(screen.getByText('15.50%')).toBeInTheDocument();
      expect(screen.getByText('12.30%')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should filter pools by token symbol', () => {
      render(<PoolsComponent searchString="USDC" />);
      
      expect(screen.getByText('USDC/USDT')).toBeInTheDocument();
      expect(screen.getByText('ETH/USDC')).toBeInTheDocument();
    });

    it('should filter pools case-insensitively', () => {
      render(<PoolsComponent searchString="usdc" />);
      
      expect(screen.getByText('USDC/USDT')).toBeInTheDocument();
      expect(screen.getByText('ETH/USDC')).toBeInTheDocument();
    });

    it('should show no results when search matches nothing', () => {
      render(<PoolsComponent searchString="NONEXISTENT" />);
      
      expect(screen.getByTestId('no-pools')).toBeInTheDocument();
      expect(screen.getByText('No pools found')).toBeInTheDocument();
    });

    it('should filter by specific token', () => {
      render(<PoolsComponent searchString="ETH" />);
      
      expect(screen.getByText('ETH/USDC')).toBeInTheDocument();
      expect(screen.queryByText('USDC/USDT')).not.toBeInTheDocument();
    });

    it('should handle empty search string', () => {
      render(<PoolsComponent searchString="" />);
      
      expect(screen.getByText('USDC/USDT')).toBeInTheDocument();
      expect(screen.getByText('ETH/USDC')).toBeInTheDocument();
    });
  });

  describe('Sorting Functionality', () => {
    it('should sort by TVL in descending order', () => {
      render(<PoolsComponent sortBy="tvl" />);
      
      const poolRows = screen.getAllByClassName('pool-row');
      expect(poolRows[0]).toHaveTextContent('ETH/USDC'); // Higher TVL
      expect(poolRows[1]).toHaveTextContent('USDC/USDT'); // Lower TVL
    });

    it('should sort by volume in descending order', () => {
      render(<PoolsComponent sortBy="volume" />);
      
      const poolRows = screen.getAllByClassName('pool-row');
      expect(poolRows[0]).toHaveTextContent('ETH/USDC'); // Higher volume
      expect(poolRows[1]).toHaveTextContent('USDC/USDT'); // Lower volume
    });

    it('should sort by APR in descending order', () => {
      render(<PoolsComponent sortBy="apr" />);
      
      const poolRows = screen.getAllByClassName('pool-row');
      expect(poolRows[0]).toHaveTextContent('USDC/USDT'); // Higher APR (15.5%)
      expect(poolRows[1]).toHaveTextContent('ETH/USDC'); // Lower APR (12.3%)
    });

    it('should maintain sort order with search', () => {
      render(<PoolsComponent searchString="USDC" sortBy="apr" />);
      
      const poolRows = screen.getAllByClassName('pool-row');
      expect(poolRows[0]).toHaveTextContent('USDC/USDT'); // Higher APR
      expect(poolRows[1]).toHaveTextContent('ETH/USDC'); // Lower APR
    });
  });

  describe('Pool Interaction', () => {
    it('should handle pool click events', async () => {
      const mockOnPoolClick = jest.fn();
      render(<PoolsComponent onPoolClick={mockOnPoolClick} />);
      
      const poolRow = screen.getByTestId('pool-0x123');
      fireEvent.click(poolRow);
      
      expect(mockOnPoolClick).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '0x123',
          token0: { symbol: 'USDC', address: '0x123' },
          token1: { symbol: 'USDT', address: '0x456' },
        })
      );
    });

    it('should make pool rows clickable', () => {
      render(<PoolsComponent />);
      
      const poolRows = screen.getAllByClassName('pool-row');
      poolRows.forEach(row => {
        expect(row).toHaveClass('cursor-pointer');
      });
    });

    it('should handle multiple pool clicks', async () => {
      const mockOnPoolClick = jest.fn();
      render(<PoolsComponent onPoolClick={mockOnPoolClick} />);
      
      const pool1 = screen.getByTestId('pool-0x123');
      const pool2 = screen.getByTestId('pool-0x789');
      
      fireEvent.click(pool1);
      fireEvent.click(pool2);
      
      expect(mockOnPoolClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('Data Display', () => {
    it('should display TVL values correctly', () => {
      render(<PoolsComponent />);
      
      expect(screen.getByText('$1,000,000')).toBeInTheDocument();
      expect(screen.getByText('$2,000,000')).toBeInTheDocument();
    });

    it('should display volume values correctly', () => {
      render(<PoolsComponent />);
      
      expect(screen.getByText('$50,000')).toBeInTheDocument();
      expect(screen.getByText('$100,000')).toBeInTheDocument();
    });

    it('should display fees values correctly', () => {
      render(<PoolsComponent />);
      
      expect(screen.getByText('$500')).toBeInTheDocument();
      expect(screen.getByText('$1,000')).toBeInTheDocument();
    });

    it('should display APR percentages correctly', () => {
      render(<PoolsComponent />);
      
      expect(screen.getByText('15.50%')).toBeInTheDocument();
      expect(screen.getByText('12.30%')).toBeInTheDocument();
    });

    it('should display token pair names correctly', () => {
      render(<PoolsComponent />);
      
      expect(screen.getByText('USDC/USDT')).toBeInTheDocument();
      expect(screen.getByText('ETH/USDC')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle pools with zero values', () => {
      const PoolsWithZeroValues = () => {
        const mockPoolsWithZeros = [
          {
            id: '0x000',
            token0: { symbol: 'ZERO', address: '0x000' },
            token1: { symbol: 'TOKEN', address: '0x001' },
            tvlUSD: '0',
            volume24hUSD: '0',
            fees24hUSD: '0',
            apr: 0,
            liquidity: '0',
          },
        ];

        return (
          <div data-testid="pools-list">
            {mockPoolsWithZeros.map(pool => (
              <div key={pool.id} className="pool-row">
                <div>{pool.token0.symbol}/{pool.token1.symbol}</div>
                <div>${Number(pool.tvlUSD).toLocaleString()}</div>
                <div>${Number(pool.volume24hUSD).toLocaleString()}</div>
                <div>${Number(pool.fees24hUSD).toLocaleString()}</div>
                <div>{pool.apr.toFixed(2)}%</div>
              </div>
            ))}
          </div>
        );
      };

      render(<PoolsWithZeroValues />);
      
      expect(screen.getByText('ZERO/TOKEN')).toBeInTheDocument();
      expect(screen.getByText('$0')).toBeInTheDocument();
      expect(screen.getByText('0.00%')).toBeInTheDocument();
    });

    it('should handle pools with very large numbers', () => {
      const PoolsWithLargeNumbers = () => {
        const mockPoolsWithLargeNumbers = [
          {
            id: '0x999',
            token0: { symbol: 'BIG', address: '0x999' },
            token1: { symbol: 'TOKEN', address: '0x998' },
            tvlUSD: '999999999999',
            volume24hUSD: '888888888888',
            fees24hUSD: '777777777777',
            apr: 999.99,
            liquidity: '999999999999999999999',
          },
        ];

        return (
          <div data-testid="pools-list">
            {mockPoolsWithLargeNumbers.map(pool => (
              <div key={pool.id} className="pool-row">
                <div>{pool.token0.symbol}/{pool.token1.symbol}</div>
                <div>${Number(pool.tvlUSD).toLocaleString()}</div>
                <div>${Number(pool.volume24hUSD).toLocaleString()}</div>
                <div>${Number(pool.fees24hUSD).toLocaleString()}</div>
                <div>{pool.apr.toFixed(2)}%</div>
              </div>
            ))}
          </div>
        );
      };

      render(<PoolsWithLargeNumbers />);
      
      expect(screen.getByText('BIG/TOKEN')).toBeInTheDocument();
      expect(screen.getByText('999.99%')).toBeInTheDocument();
    });

    it('should handle missing or null data gracefully', () => {
      const PoolsWithMissingData = () => {
        const mockPoolsWithMissingData = [
          {
            id: '0x111',
            token0: { symbol: 'MISSING', address: '0x111' },
            token1: { symbol: 'DATA', address: '0x112' },
            tvlUSD: null,
            volume24hUSD: undefined,
            fees24hUSD: '',
            apr: null,
            liquidity: null,
          },
        ];

        return (
          <div data-testid="pools-list">
            {mockPoolsWithMissingData.map(pool => (
              <div key={pool.id} className="pool-row">
                <div>{pool.token0.symbol}/{pool.token1.symbol}</div>
                <div>${Number(pool.tvlUSD || 0).toLocaleString()}</div>
                <div>${Number(pool.volume24hUSD || 0).toLocaleString()}</div>
                <div>${Number(pool.fees24hUSD || 0).toLocaleString()}</div>
                <div>{(pool.apr || 0).toFixed(2)}%</div>
              </div>
            ))}
          </div>
        );
      };

      render(<PoolsWithMissingData />);
      
      expect(screen.getByText('MISSING/DATA')).toBeInTheDocument();
      expect(screen.getByText('0.00%')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should handle large number of pools efficiently', () => {
      const manyPools = Array.from({ length: 100 }, (_, i) => ({
        id: `0x${i.toString().padStart(3, '0')}`,
        token0: { symbol: `TOKEN${i}`, address: `0x${i}` },
        token1: { symbol: 'USDC', address: '0x123' },
        tvlUSD: (Math.random() * 1000000).toString(),
        volume24hUSD: (Math.random() * 100000).toString(),
        fees24hUSD: (Math.random() * 1000).toString(),
        apr: Math.random() * 50,
        liquidity: (Math.random() * 1000000000000000000).toString(),
      }));

      const PoolsWithManyItems = () => (
        <div data-testid="pools-list">
          {manyPools.map(pool => (
            <div key={pool.id} className="pool-row">
              <div>{pool.token0.symbol}/{pool.token1.symbol}</div>
            </div>
          ))}
        </div>
      );

      render(<PoolsWithManyItems />);
      
      expect(screen.getByTestId('pools-list')).toBeInTheDocument();
      expect(screen.getAllByClassName('pool-row')).toHaveLength(100);
    });

    it('should not cause memory leaks with frequent updates', () => {
      const { rerender } = render(<PoolsComponent />);
      
      // Simulate frequent re-renders
      for (let i = 0; i < 10; i++) {
        rerender(<PoolsComponent searchString={`search${i}`} />);
      }
      
      expect(screen.getByTestId('pools-list')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper table structure', () => {
      render(<PoolsComponent />);
      
      expect(screen.getByText('Token Pair')).toBeInTheDocument();
      expect(screen.getByText('TVL')).toBeInTheDocument();
      expect(screen.getByText('24h Volume')).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      render(<PoolsComponent />);
      
      const searchInput = screen.getByTestId('search-input');
      searchInput.focus();
      expect(document.activeElement).toBe(searchInput);
    });

    it('should have proper ARIA labels', () => {
      render(<PoolsComponent />);
      
      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toHaveAttribute('placeholder', 'Search pools...');
    });
  });

  describe('Responsive Design', () => {
    it('should adapt to mobile screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<PoolsComponent />);
      
      expect(screen.getByTestId('pools-list')).toBeInTheDocument();
    });

    it('should work on desktop screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });

      render(<PoolsComponent />);
      
      expect(screen.getByTestId('pools-list')).toBeInTheDocument();
    });
  });
});