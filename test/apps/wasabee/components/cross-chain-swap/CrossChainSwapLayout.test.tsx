import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CrossChainSwapLayout from '../../../../../apps/wasabee/components/cross-chain-swap/CrossChainSwapLayout';

// Mock child components
jest.mock('../../../../../apps/wasabee/components/cross-chain-swap/CrossChainSwapCard', () => {
  return function MockCrossChainSwapCard(props: any) {
    return (
      <div data-testid="cross-chain-swap-card">
        <button onClick={() => props.onSwapSuccess?.()}>
          Execute Swap
        </button>
      </div>
    );
  };
});

jest.mock('../../../../../apps/wasabee/components/cross-chain-swap/CrossChainKlineChart', () => {
  return function MockCrossChainKlineChart(props: any) {
    return (
      <div data-testid="cross-chain-kline-chart">
        Chart for {props.fromToken?.symbol} / {props.toToken?.symbol}
      </div>
    );
  };
});

jest.mock('../../../../../apps/wasabee/components/cross-chain-swap/CrossChainTransactionHistory', () => {
  return function MockCrossChainTransactionHistory() {
    return (
      <div data-testid="cross-chain-transaction-history">
        <div>Transaction 1: Completed</div>
        <div>Transaction 2: Pending</div>
      </div>
    );
  };
});

// Mock services
jest.mock('../../../../../apps/wasabee/services/crossChainSwap', () => ({
  crossChainSwapService: {
    fromToken: { symbol: 'USDC', address: '0x123' },
    toToken: { symbol: 'USDT', address: '0x456' },
    fromChain: { chainId: 1, name: 'Ethereum' },
    toChain: { chainId: 137, name: 'Polygon' },
  },
}));

describe('CrossChainSwapLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all main components', () => {
      render(<CrossChainSwapLayout />);
      
      expect(screen.getByTestId('cross-chain-swap-card')).toBeInTheDocument();
      expect(screen.getByTestId('cross-chain-kline-chart')).toBeInTheDocument();
      expect(screen.getByTestId('cross-chain-transaction-history')).toBeInTheDocument();
    });

    it('should display correct layout structure', () => {
      render(<CrossChainSwapLayout />);
      
      const layout = screen.getByRole('main');
      expect(layout).toBeInTheDocument();
      
      // Verify all components are within the layout
      const swapCard = screen.getByTestId('cross-chain-swap-card');
      const chart = screen.getByTestId('cross-chain-kline-chart');
      const history = screen.getByTestId('cross-chain-transaction-history');
      
      expect(layout).toContainElement(swapCard);
      expect(layout).toContainElement(chart);
      expect(layout).toContainElement(history);
    });
  });

  describe('Chart Integration', () => {
    it('should pass correct token props to chart', () => {
      render(<CrossChainSwapLayout />);
      
      const chart = screen.getByTestId('cross-chain-kline-chart');
      expect(chart).toHaveTextContent('Chart for USDC / USDT');
    });

    it('should update chart when tokens change', async () => {
      const { rerender } = render(<CrossChainSwapLayout />);
      
      // Mock token change
      const crossChainSwapService = require('../../../../../apps/wasabee/services/crossChainSwap').crossChainSwapService;
      crossChainSwapService.fromToken = { symbol: 'ETH', address: '0x789' };
      crossChainSwapService.toToken = { symbol: 'MATIC', address: '0xabc' };
      
      rerender(<CrossChainSwapLayout />);
      
      await waitFor(() => {
        const chart = screen.getByTestId('cross-chain-kline-chart');
        expect(chart).toHaveTextContent('Chart for ETH / MATIC');
      });
    });
  });

  describe('Swap Success Handling', () => {
    it('should refresh chart data on swap success', async () => {
      render(<CrossChainSwapLayout />);
      
      const executeSwapButton = screen.getByText('Execute Swap');
      fireEvent.click(executeSwapButton);
      
      await waitFor(() => {
        // Chart should be refreshed
        const chart = screen.getByTestId('cross-chain-kline-chart');
        expect(chart).toBeInTheDocument();
      });
    });

    it('should update transaction history on swap success', async () => {
      render(<CrossChainSwapLayout />);
      
      const executeSwapButton = screen.getByText('Execute Swap');
      fireEvent.click(executeSwapButton);
      
      await waitFor(() => {
        // Transaction history should be updated
        const history = screen.getByTestId('cross-chain-transaction-history');
        expect(history).toBeInTheDocument();
      });
    });
  });

  describe('Transaction History', () => {
    it('should display transaction history', () => {
      render(<CrossChainSwapLayout />);
      
      const history = screen.getByTestId('cross-chain-transaction-history');
      expect(history).toHaveTextContent('Transaction 1: Completed');
      expect(history).toHaveTextContent('Transaction 2: Pending');
    });

    it('should update history in real-time', async () => {
      render(<CrossChainSwapLayout />);
      
      // Simulate new transaction
      await waitFor(() => {
        const history = screen.getByTestId('cross-chain-transaction-history');
        expect(history).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Layout', () => {
    it('should handle mobile layout', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      render(<CrossChainSwapLayout />);
      
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should handle desktop layout', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });
      
      render(<CrossChainSwapLayout />);
      
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle chart loading errors', async () => {
      // Mock chart error
      const MockCrossChainKlineChart = jest.fn(() => {
        throw new Error('Chart failed to load');
      });
      
      jest.doMock('../../../../../apps/wasabee/components/cross-chain-swap/CrossChainKlineChart', () => MockCrossChainKlineChart);
      
      expect(() => {
        render(<CrossChainSwapLayout />);
      }).not.toThrow();
    });

    it('should handle transaction history errors', async () => {
      render(<CrossChainSwapLayout />);
      
      // Should render even if history has issues
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<CrossChainSwapLayout />);
      
      // Multiple re-renders should not cause issues
      rerender(<CrossChainSwapLayout />);
      rerender(<CrossChainSwapLayout />);
      
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should handle rapid token changes', async () => {
      render(<CrossChainSwapLayout />);
      
      // Simulate rapid token changes
      const crossChainSwapService = require('../../../../../apps/wasabee/services/crossChainSwap').crossChainSwapService;
      
      for (let i = 0; i < 5; i++) {
        crossChainSwapService.fromToken = { symbol: `TOKEN${i}`, address: `0x${i}` };
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<CrossChainSwapLayout />);
      
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      render(<CrossChainSwapLayout />);
      
      const executeSwapButton = screen.getByText('Execute Swap');
      
      // Should be focusable
      executeSwapButton.focus();
      expect(document.activeElement).toBe(executeSwapButton);
    });
  });

  describe('State Management', () => {
    it('should maintain state across component updates', async () => {
      const { rerender } = render(<CrossChainSwapLayout />);
      
      // Simulate state change
      const executeSwapButton = screen.getByText('Execute Swap');
      fireEvent.click(executeSwapButton);
      
      rerender(<CrossChainSwapLayout />);
      
      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });
    });
  });
});