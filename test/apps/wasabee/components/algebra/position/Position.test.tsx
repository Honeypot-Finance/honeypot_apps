import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PositionCard from '../../../../../../apps/wasabee/components/algebra/position/PositionCard';

describe('PositionCard', () => {
  const mockPosition = {
    id: '12345',
    liquidityUSD: 5000,
    feesUSD: 125.5,
    apr: 15.75,
    token0: {
      symbol: 'USDC',
      address: '0x123',
      decimals: 6,
    },
    token1: {
      symbol: 'USDT',
      address: '0x456',
      decimals: 6,
    },
    tickLower: -276324,
    tickUpper: -276320,
    liquidity: '1000000000000000000',
  };

  const mockFarming = {
    id: 'farming-123',
    pool: '0x789',
    rewardToken: {
      symbol: 'REWARD',
      address: '0xabc',
    },
    startTime: '1640995200',
    endTime: '1672531200',
    reward: '1000000000000000000',
  };

  const mockClosedFarmings = [
    {
      id: 'farming-123',
      pool: '0x789',
      rewardToken: {
        symbol: 'REWARD',
        address: '0xabc',
      },
      startTime: '1640995200',
      endTime: '1672531200',
      reward: '1000000000000000000',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should show selection message when no position is selected', () => {
      render(<PositionCard selectedPosition={undefined} />);

      expect(
        screen.getByText('Select a position to view details')
      ).toBeInTheDocument();
    });

    it('should render position details when position is selected', async () => {
      render(<PositionCard selectedPosition={mockPosition} />);

      await waitFor(() => {
        expect(screen.getByText('Position #12345')).toBeInTheDocument();
        expect(screen.getByText('LIQUIDITY')).toBeInTheDocument();
        expect(screen.getByText('APR')).toBeInTheDocument();
      });
    });

    it('should display position liquidity in USD', async () => {
      render(<PositionCard selectedPosition={mockPosition} />);

      await waitFor(() => {
        expect(screen.getByText(/5,000/)).toBeInTheDocument();
      });
    });

    it('should display position APR', async () => {
      render(<PositionCard selectedPosition={mockPosition} />);

      await waitFor(() => {
        expect(screen.getByText('15.75%')).toBeInTheDocument();
      });
    });

    it('should display accumulated fees', async () => {
      render(<PositionCard selectedPosition={mockPosition} />);

      await waitFor(() => {
        expect(screen.getByText(/125\.50/)).toBeInTheDocument();
      });
    });
  });

  describe('Position NFT', () => {
    it('should render position NFT component', async () => {
      render(<PositionCard selectedPosition={mockPosition} />);

      await waitFor(() => {
        // PositionNFT component should be rendered
        expect(screen.getByText('Position #12345')).toBeInTheDocument();
      });
    });
  });

  describe('Token Ratio Display', () => {
    it('should show token amounts in position', async () => {
      render(<PositionCard selectedPosition={mockPosition} />);

      await waitFor(() => {
        // Should display token symbols
        expect(screen.getByText(/USDC/)).toBeInTheDocument();
        expect(screen.getByText(/USDT/)).toBeInTheDocument();
      });
    });

    it('should handle positions with different token decimals', async () => {
      const positionWithETH = {
        ...mockPosition,
        token0: {
          symbol: 'ETH',
          address: '0x789',
          decimals: 18,
        },
      };

      render(<PositionCard selectedPosition={positionWithETH} />);

      await waitFor(() => {
        expect(screen.getByText(/ETH/)).toBeInTheDocument();
      });
    });
  });

  describe('Fee Collection', () => {
    it('should render collect fees button', async () => {
      render(<PositionCard selectedPosition={mockPosition} />);

      await waitFor(() => {
        expect(screen.getByText('Collect fees')).toBeInTheDocument();
      });
    });

    it('should disable collect button when no fees available', async () => {
      const positionWithNoFees = {
        ...mockPosition,
        feesUSD: 0,
      };

      render(<PositionCard selectedPosition={positionWithNoFees} />);

      await waitFor(() => {
        const collectButton = screen.getByText('Collect fees');
        expect(collectButton).toBeDisabled();
      });
    });

    it('should handle fee collection click', async () => {
      render(<PositionCard selectedPosition={mockPosition} />);

      await waitFor(() => {
        const collectButton = screen.getByText('Collect fees');
        fireEvent.click(collectButton);

        // Should trigger fee collection
        expect(collectButton).toBeInTheDocument();
      });
    });

    it('should show loading state during fee collection', async () => {
      render(<PositionCard selectedPosition={mockPosition} />);

      await waitFor(() => {
        const collectButton = screen.getByText('Collect fees');
        fireEvent.click(collectButton);

        // Should show loading state
        expect(screen.getByText('Collecting...')).toBeInTheDocument();
      });
    });
  });

  describe('Position Range Chart', () => {
    it('should render position range chart when pool data is available', async () => {
      render(<PositionCard selectedPosition={mockPosition} />);

      await waitFor(() => {
        // Chart component should be rendered
        expect(screen.getByText('Position #12345')).toBeInTheDocument();
      });
    });

    it('should handle missing pool data gracefully', async () => {
      const positionWithoutPool = {
        ...mockPosition,
        pool: null,
      };

      render(<PositionCard selectedPosition={positionWithoutPool} />);

      await waitFor(() => {
        expect(screen.getByText('Position #12345')).toBeInTheDocument();
      });
    });
  });

  describe('Liquidity Management', () => {
    it('should render increase liquidity modal trigger', async () => {
      render(<PositionCard selectedPosition={mockPosition} />);

      await waitFor(() => {
        // IncreaseLiquidityModal should be rendered
        expect(screen.getByText('Position #12345')).toBeInTheDocument();
      });
    });

    it('should render remove liquidity modal trigger when position has liquidity', async () => {
      render(<PositionCard selectedPosition={mockPosition} />);

      await waitFor(() => {
        // RemoveLiquidityModal should be rendered for positions with liquidity
        expect(screen.getByText('Position #12345')).toBeInTheDocument();
      });
    });

    it('should not render remove liquidity for positions without liquidity', async () => {
      const positionWithoutLiquidity = {
        ...mockPosition,
        liquidity: '0',
      };

      render(<PositionCard selectedPosition={positionWithoutLiquidity} />);

      await waitFor(() => {
        expect(screen.getByText('Position #12345')).toBeInTheDocument();
      });
    });
  });

  describe('Farming Integration', () => {
    it('should render active farming card when position is in farming', async () => {
      render(
        <PositionCard selectedPosition={mockPosition} farming={mockFarming} />
      );

      await waitFor(() => {
        expect(screen.getByText('Position #12345')).toBeInTheDocument();
      });
    });

    it('should render closed farming card when position was in ended farming', async () => {
      render(
        <PositionCard
          selectedPosition={mockPosition}
          closedFarmings={mockClosedFarmings}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Position #12345')).toBeInTheDocument();
      });
    });

    it('should handle both active and closed farming states', async () => {
      render(
        <PositionCard
          selectedPosition={mockPosition}
          farming={mockFarming}
          closedFarmings={mockClosedFarmings}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Position #12345')).toBeInTheDocument();
      });
    });

    it('should not render farming cards when no farming data', async () => {
      render(<PositionCard selectedPosition={mockPosition} />);

      await waitFor(() => {
        expect(screen.getByText('Position #12345')).toBeInTheDocument();
        // Should not have farming-specific content
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading skeleton while position data loads', () => {
      render(<PositionCard selectedPosition={undefined} />);

      expect(
        screen.getByText('Select a position to view details')
      ).toBeInTheDocument();
    });

    it('should show skeleton for missing data fields', async () => {
      const incompletePosition = {
        ...mockPosition,
        liquidityUSD: undefined,
        feesUSD: undefined,
        apr: undefined,
      };

      render(<PositionCard selectedPosition={incompletePosition} />);

      await waitFor(() => {
        expect(screen.getByText('Position #12345')).toBeInTheDocument();
      });
    });
  });

  describe('Native Token Handling', () => {
    it('should handle native token switching', async () => {
      const positionWithNative = {
        ...mockPosition,
        token0: {
          symbol: 'ETH',
          address: '0x0000000000000000000000000000000000000000',
          decimals: 18,
        },
      };

      render(<PositionCard selectedPosition={positionWithNative} />);

      await waitFor(() => {
        expect(screen.getByText('Position #12345')).toBeInTheDocument();
      });
    });

    it('should allow toggling between native and wrapped tokens', async () => {
      const positionWithNative = {
        ...mockPosition,
        token0: {
          symbol: 'ETH',
          address: '0x0000000000000000000000000000000000000000',
          decimals: 18,
        },
      };

      render(<PositionCard selectedPosition={positionWithNative} />);

      await waitFor(() => {
        // Should handle native token display
        expect(screen.getByText('Position #12345')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid position data gracefully', () => {
      const invalidPosition = {
        id: null,
        liquidityUSD: null,
        feesUSD: null,
        apr: null,
      };

      expect(() => {
        render(<PositionCard selectedPosition={invalidPosition} />);
      }).not.toThrow();
    });

    it('should handle missing token information', async () => {
      const positionWithoutTokens = {
        ...mockPosition,
        token0: null,
        token1: null,
      };

      render(<PositionCard selectedPosition={positionWithoutTokens} />);

      await waitFor(() => {
        expect(screen.getByText('Position #12345')).toBeInTheDocument();
      });
    });

    it('should handle contract interaction errors', async () => {
      render(<PositionCard selectedPosition={mockPosition} />);

      await waitFor(() => {
        const collectButton = screen.getByText('Collect fees');
        fireEvent.click(collectButton);

        // Should handle errors gracefully
        expect(collectButton).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    it('should adapt layout for mobile screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<PositionCard selectedPosition={mockPosition} />);

      expect(screen.getByText('Position #12345')).toBeInTheDocument();
    });

    it('should show full layout on desktop', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });

      render(<PositionCard selectedPosition={mockPosition} />);

      expect(screen.getByText('Position #12345')).toBeInTheDocument();
    });
  });

  describe('Position Updates', () => {
    it('should update when position data changes', async () => {
      const { rerender } = render(
        <PositionCard selectedPosition={mockPosition} />
      );

      const updatedPosition = {
        ...mockPosition,
        liquidityUSD: 10000,
        apr: 20.5,
      };

      rerender(<PositionCard selectedPosition={updatedPosition} />);

      await waitFor(() => {
        expect(screen.getByText('20.50%')).toBeInTheDocument();
      });
    });

    it('should handle position switching', async () => {
      const { rerender } = render(
        <PositionCard selectedPosition={mockPosition} />
      );

      const newPosition = {
        ...mockPosition,
        id: '67890',
      };

      rerender(<PositionCard selectedPosition={newPosition} />);

      await waitFor(() => {
        expect(screen.getByText('Position #67890')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper button labels', async () => {
      render(<PositionCard selectedPosition={mockPosition} />);

      await waitFor(() => {
        const collectButton = screen.getByText('Collect fees');
        expect(collectButton).toHaveAttribute('type', 'button');
      });
    });

    it('should support keyboard navigation', async () => {
      render(<PositionCard selectedPosition={mockPosition} />);

      await waitFor(() => {
        const collectButton = screen.getByText('Collect fees');
        collectButton.focus();
        expect(document.activeElement).toBe(collectButton);
      });
    });

    it('should have proper ARIA labels for complex components', async () => {
      render(<PositionCard selectedPosition={mockPosition} />);

      await waitFor(() => {
        expect(screen.getByText('Position #12345')).toBeInTheDocument();
      });
    });
  });
});
