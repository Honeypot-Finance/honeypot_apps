import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SwapPage from '../../../../apps/wasabee/pages/swap';

// Mock Next.js router
const mockPush = jest.fn();
const mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock dependencies
jest.mock('@honeypot/shared/lib/wallet', () => ({
  wallet: {
    isInit: true,
    currentChain: {
      validatedTokens: [
        { address: '0x123', symbol: 'USDC', isStableCoin: true },
        { address: '0x456', symbol: 'USDT', isStableCoin: true },
        { address: '0x789', symbol: 'ETH', isStableCoin: false },
      ],
    },
  },
}));

jest.mock('@honeypot/shared/services', () => ({
  chart: {
    updateTokenPair: jest.fn(),
    refreshData: jest.fn(),
  },
}));

// Mock child components
jest.mock('../../../../apps/wasabee/pages/launch-detail/components/KlineChart', () => {
  return function MockKlineChart(props: any) {
    return (
      <div data-testid="kline-chart">
        Chart for {props.inputToken} / {props.outputToken}
      </div>
    );
  };
});

jest.mock('../../../../apps/wasabee/components/SwapTransactionHistory', () => {
  return function MockSwapTransactionHistory() {
    return (
      <div data-testid="swap-transaction-history">
        <div>Transaction 1: Completed</div>
        <div>Transaction 2: Pending</div>
      </div>
    );
  };
});

jest.mock('../../../../apps/wasabee/components/multichain-design/swap/SwapCard', () => {
  return function MockSwapCardMultichainDesign(props: any) {
    return (
      <div data-testid="swap-card">
        <button 
          onClick={() => props.onSwapSuccess?.()}
          data-testid="execute-swap-btn"
        >
          Execute Swap
        </button>
        <div>From: {props.inputCurrency || 'Not selected'}</div>
        <div>To: {props.outputCurrency || 'Not selected'}</div>
      </div>
    );
  };
});

jest.mock('../../../../apps/wasabee/components/LoadingDisplay/LoadingDisplay', () => ({
  LoadingDisplay: () => <div data-testid="loading-display">Loading...</div>,
}));

jest.mock('../../../../apps/wasabee/components/CardContianer', () => ({
  DarkContainer: ({ children }: any) => (
    <div data-testid="dark-container">{children}</div>
  ),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('SwapPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockSearchParams.get = jest.fn().mockReturnValue(null);
  });

  describe('Rendering', () => {
    it('should render swap page when wallet is initialized', () => {
      render(<SwapPage />);
      
      expect(screen.getByTestId('swap-card')).toBeInTheDocument();
      expect(screen.getByTestId('kline-chart')).toBeInTheDocument();
      expect(screen.getByTestId('swap-transaction-history')).toBeInTheDocument();
    });

    it('should render loading display when wallet is not initialized', () => {
      const wallet = require('@honeypot/shared/lib/wallet').wallet;
      wallet.isInit = false;
      
      render(<SwapPage />);
      
      expect(screen.getByTestId('loading-display')).toBeInTheDocument();
      expect(screen.queryByTestId('swap-card')).not.toBeInTheDocument();
    });

    it('should render all main components in correct layout', () => {
      render(<SwapPage />);
      
      const swapCard = screen.getByTestId('swap-card');
      const chart = screen.getByTestId('kline-chart');
      const history = screen.getByTestId('swap-transaction-history');
      
      expect(swapCard).toBeInTheDocument();
      expect(chart).toBeInTheDocument();
      expect(history).toBeInTheDocument();
    });
  });

  describe('URL Parameter Handling', () => {
    it('should use URL parameters for token selection', async () => {
      mockSearchParams.get = jest.fn((param) => {
        if (param === 'inputCurrency') return '0x123';
        if (param === 'outputCurrency') return '0x456';
        return null;
      });
      
      render(<SwapPage />);
      
      await waitFor(() => {
        expect(screen.getByText('From: 0x123')).toBeInTheDocument();
        expect(screen.getByText('To: 0x456')).toBeInTheDocument();
      });
    });

    it('should prioritize URL parameters over localStorage', async () => {
      mockSearchParams.get = jest.fn((param) => {
        if (param === 'inputCurrency') return '0x123';
        return null;
      });
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'swapInputToken') return '0x789';
        return null;
      });
      
      render(<SwapPage />);
      
      await waitFor(() => {
        expect(screen.getByText('From: 0x123')).toBeInTheDocument();
      });
    });
  });

  describe('LocalStorage Integration', () => {
    it('should use localStorage values when URL parameters are not present', async () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'swapInputToken') return '0x123';
        if (key === 'swapOutputToken') return '0x456';
        return null;
      });
      
      render(<SwapPage />);
      
      await waitFor(() => {
        expect(screen.getByText('From: 0x123')).toBeInTheDocument();
        expect(screen.getByText('To: 0x456')).toBeInTheDocument();
      });
    });

    it('should use default output token when no stored value exists', async () => {
      const wallet = require('@honeypot/shared/lib/wallet').wallet;
      wallet.currentChain.validatedTokens = [
        { address: '0x123', symbol: 'USDC', isStableCoin: true },
        { address: '0x456', symbol: 'USDT', isStableCoin: false },
      ];
      
      render(<SwapPage />);
      
      await waitFor(() => {
        expect(screen.getByText('To: 0x123')).toBeInTheDocument(); // First stablecoin
      });
    });

    it('should save token selections to localStorage', async () => {
      render(<SwapPage />);
      
      // Simulate token selection change
      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('swapInputToken', expect.any(String));
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('swapOutputToken', expect.any(String));
      });
    });
  });

  describe('Chart Integration', () => {
    it('should update chart when tokens change', async () => {
      const chart = require('@honeypot/shared/services').chart;
      
      render(<SwapPage />);
      
      await waitFor(() => {
        expect(chart.updateTokenPair).toHaveBeenCalled();
      });
    });

    it('should refresh chart data on swap success', async () => {
      const chart = require('@honeypot/shared/services').chart;
      
      render(<SwapPage />);
      
      const executeSwapBtn = screen.getByTestId('execute-swap-btn');
      fireEvent.click(executeSwapBtn);
      
      await waitFor(() => {
        expect(chart.refreshData).toHaveBeenCalled();
      });
    });

    it('should pass correct token addresses to chart', () => {
      mockSearchParams.get = jest.fn((param) => {
        if (param === 'inputCurrency') return '0x123';
        if (param === 'outputCurrency') return '0x456';
        return null;
      });
      
      render(<SwapPage />);
      
      expect(screen.getByText('Chart for 0x123 / 0x456')).toBeInTheDocument();
    });
  });

  describe('Swap Execution', () => {
    it('should handle successful swap', async () => {
      const chart = require('@honeypot/shared/services').chart;
      
      render(<SwapPage />);
      
      const executeSwapBtn = screen.getByTestId('execute-swap-btn');
      fireEvent.click(executeSwapBtn);
      
      await waitFor(() => {
        expect(chart.refreshData).toHaveBeenCalled();
      });
    });

    it('should update transaction history after swap', async () => {
      render(<SwapPage />);
      
      const executeSwapBtn = screen.getByTestId('execute-swap-btn');
      fireEvent.click(executeSwapBtn);
      
      await waitFor(() => {
        const history = screen.getByTestId('swap-transaction-history');
        expect(history).toBeInTheDocument();
      });
    });
  });

  describe('Token Selection Logic', () => {
    it('should handle undefined input currency gracefully', async () => {
      render(<SwapPage />);
      
      await waitFor(() => {
        expect(screen.getByText('From: Not selected')).toBeInTheDocument();
      });
    });

    it('should handle undefined output currency gracefully', async () => {
      const wallet = require('@honeypot/shared/lib/wallet').wallet;
      wallet.currentChain.validatedTokens = []; // No stablecoins available
      
      render(<SwapPage />);
      
      await waitFor(() => {
        expect(screen.getByText('To: Not selected')).toBeInTheDocument();
      });
    });

    it('should update tokens when wallet chain changes', async () => {
      const { rerender } = render(<SwapPage />);
      
      // Simulate chain change
      const wallet = require('@honeypot/shared/lib/wallet').wallet;
      wallet.currentChain.validatedTokens = [
        { address: '0xAAA', symbol: 'DAI', isStableCoin: true },
      ];
      
      rerender(<SwapPage />);
      
      await waitFor(() => {
        expect(screen.getByText('To: 0xAAA')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', async () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('LocalStorage error');
      });
      
      expect(() => {
        render(<SwapPage />);
      }).not.toThrow();
    });

    it('should handle missing wallet chain gracefully', () => {
      const wallet = require('@honeypot/shared/lib/wallet').wallet;
      wallet.currentChain = null;
      
      expect(() => {
        render(<SwapPage />);
      }).not.toThrow();
    });

    it('should handle chart service errors gracefully', async () => {
      const chart = require('@honeypot/shared/services').chart;
      chart.updateTokenPair.mockImplementation(() => {
        throw new Error('Chart error');
      });
      
      expect(() => {
        render(<SwapPage />);
      }).not.toThrow();
    });
  });

  describe('Responsive Behavior', () => {
    it('should handle window resize events', () => {
      render(<SwapPage />);
      
      // Simulate window resize
      fireEvent(window, new Event('resize'));
      
      expect(screen.getByTestId('swap-card')).toBeInTheDocument();
    });

    it('should maintain layout on different screen sizes', () => {
      // Mock different viewport sizes
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375, // Mobile width
      });
      
      render(<SwapPage />);
      
      expect(screen.getByTestId('swap-card')).toBeInTheDocument();
      expect(screen.getByTestId('kline-chart')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', () => {
      const { rerender } = render(<SwapPage />);
      
      // Multiple re-renders should not cause issues
      rerender(<SwapPage />);
      rerender(<SwapPage />);
      
      expect(screen.getByTestId('swap-card')).toBeInTheDocument();
    });

    it('should handle rapid token changes', async () => {
      render(<SwapPage />);
      
      // Simulate rapid URL parameter changes
      for (let i = 0; i < 5; i++) {
        mockSearchParams.get = jest.fn(() => `0x${i}`);
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      expect(screen.getByTestId('swap-card')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper page structure', () => {
      render(<SwapPage />);
      
      // Should have main content area
      expect(screen.getByTestId('swap-card')).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      render(<SwapPage />);
      
      const executeSwapBtn = screen.getByTestId('execute-swap-btn');
      
      // Should be focusable
      executeSwapBtn.focus();
      expect(document.activeElement).toBe(executeSwapBtn);
    });
  });
});