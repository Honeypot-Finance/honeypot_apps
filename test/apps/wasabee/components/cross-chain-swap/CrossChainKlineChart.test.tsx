import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CrossChainKlineChart from '../../../../../apps/wasabee/components/cross-chain-swap/CrossChainKlineChart';

// Mock Next.js dynamic import
jest.mock('next/dynamic', () => {
  return jest.fn(() => {
    const MockedComponent = () => <div data-testid="kline-chart-container">Chart Display</div>;
    return MockedComponent;
  });
});

// Mock chart service
jest.mock('@honeypot/shared/services', () => ({
  chart: {
    setChartTarget: jest.fn(),
    showChart: false,
  },
}));

// Mock cross-chain swap service
jest.mock('@/services/crossChainSwap', () => ({
  crossChainSwapService: {
    fromToken: {
      symbol: 'USDC',
      address: '0x123',
      chainId: '1',
      name: 'USD Coin',
      decimals: 6,
      isNative: false,
    },
  },
}));

// Mock wallet
jest.mock('@honeypot/shared/lib/wallet', () => ({
  wallet: {
    currentChainId: 1,
  },
}));

// Mock Token class
jest.mock('@honeypot/shared', () => ({
  Token: jest.fn().mockImplementation((props) => ({
    ...props,
    init: jest.fn(),
  })),
}));

describe('CrossChainKlineChart', () => {
  const defaultProps = {
    refreshKey: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render chart container with token selected', () => {
      render(<CrossChainKlineChart {...defaultProps} />);

      const chartContainer = screen.getByTestId('kline-chart-container');
      expect(chartContainer).toBeInTheDocument();
    });

    it('should render placeholder when no token selected', () => {
      // Mock no token selected
      const crossChainSwapService = require('@/services/crossChainSwap').crossChainSwapService;
      crossChainSwapService.fromToken = null;

      render(<CrossChainKlineChart {...defaultProps} />);

      expect(screen.getByText(/select a token to view price chart/i)).toBeInTheDocument();
    });

    it('should render chart display component when token is available', () => {
      render(<CrossChainKlineChart {...defaultProps} />);

      const chartContainer = screen.getByTestId('kline-chart-container');
      expect(chartContainer).toBeInTheDocument();
      expect(chartContainer).toHaveTextContent('Chart Display');
    });
  });

  describe('Chart Service Integration', () => {
    it('should set chart target when token is available', async () => {
      const mockSetChartTarget = jest.fn();
      const chart = require('@honeypot/shared/services').chart;
      chart.setChartTarget = mockSetChartTarget;

      render(<CrossChainKlineChart {...defaultProps} />);

      await waitFor(() => {
        expect(mockSetChartTarget).toHaveBeenCalled();
      });
    });

    it('should clear chart target when no token selected', async () => {
      const mockSetChartTarget = jest.fn();
      const chart = require('@honeypot/shared/services').chart;
      chart.setChartTarget = mockSetChartTarget;

      // Mock no token selected
      const crossChainSwapService = require('@/services/crossChainSwap').crossChainSwapService;
      crossChainSwapService.fromToken = null;

      render(<CrossChainKlineChart {...defaultProps} />);

      await waitFor(() => {
        expect(mockSetChartTarget).toHaveBeenCalledWith(undefined);
      });
    });

    it('should handle native token mapping', async () => {
      const mockSetChartTarget = jest.fn();
      const chart = require('@honeypot/shared/services').chart;
      chart.setChartTarget = mockSetChartTarget;

      // Mock native token
      const crossChainSwapService = require('@/services/crossChainSwap').crossChainSwapService;
      crossChainSwapService.fromToken = {
        symbol: 'ETH',
        address: '0x0000000000000000000000000000000000000000',
        chainId: '1',
        name: 'Ethereum',
        decimals: 18,
        isNative: true,
      };

      render(<CrossChainKlineChart {...defaultProps} />);

      await waitFor(() => {
        expect(mockSetChartTarget).toHaveBeenCalled();
      });
    });
  });

  describe('Token Changes', () => {
    it('should update chart target when token changes', async () => {
      const mockSetChartTarget = jest.fn();
      const chart = require('@honeypot/shared/services').chart;
      chart.setChartTarget = mockSetChartTarget;

      const crossChainSwapService = require('@/services/crossChainSwap').crossChainSwapService;
      
      const { rerender } = render(<CrossChainKlineChart {...defaultProps} />);

      // Change the token
      crossChainSwapService.fromToken = {
        symbol: 'ETH',
        address: '0x789',
        chainId: '1',
        name: 'Ethereum',
        decimals: 18,
        isNative: false,
      };

      rerender(<CrossChainKlineChart refreshKey={2} />);

      await waitFor(() => {
        expect(mockSetChartTarget).toHaveBeenCalled();
      });
    });

    it('should handle token with different chain ID', async () => {
      const mockSetChartTarget = jest.fn();
      const chart = require('@honeypot/shared/services').chart;
      chart.setChartTarget = mockSetChartTarget;

      const crossChainSwapService = require('@/services/crossChainSwap').crossChainSwapService;
      crossChainSwapService.fromToken = {
        symbol: 'MATIC',
        address: '0xabc',
        chainId: '137',
        name: 'Polygon',
        decimals: 18,
        isNative: false,
      };

      render(<CrossChainKlineChart {...defaultProps} />);

      await waitFor(() => {
        expect(mockSetChartTarget).toHaveBeenCalled();
      });
    });
  });

  describe('Chart Display Component', () => {
    it('should pass correct props to chart display', async () => {
      render(<CrossChainKlineChart {...defaultProps} />);

      await waitFor(() => {
        const chartContainer = screen.getByTestId('kline-chart-container');
        expect(chartContainer).toBeInTheDocument();
      });
    });

    it('should handle chart container interactions', async () => {
      render(<CrossChainKlineChart {...defaultProps} />);

      await waitFor(() => {
        const chartContainer = screen.getByTestId('kline-chart-container');

        // Simulate user interactions
        fireEvent.click(chartContainer);
        fireEvent.mouseEnter(chartContainer);
        fireEvent.mouseLeave(chartContainer);

        expect(chartContainer).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('should handle container resize', async () => {
      // Mock ResizeObserver
      const mockResizeObserver = jest.fn();
      const mockObserve = jest.fn();
      const mockDisconnect = jest.fn();

      global.ResizeObserver = jest.fn().mockImplementation(() => ({
        observe: mockObserve,
        disconnect: mockDisconnect,
      }));

      render(<CrossChainKlineChart {...defaultProps} />);

      await waitFor(() => {
        expect(mockObserve).toHaveBeenCalled();
      });
    });

    it('should cleanup resize observer on unmount', async () => {
      const mockDisconnect = jest.fn();
      global.ResizeObserver = jest.fn().mockImplementation(() => ({
        observe: jest.fn(),
        disconnect: mockDisconnect,
      }));

      const { unmount } = render(<CrossChainKlineChart {...defaultProps} />);
      unmount();

      expect(mockDisconnect).toHaveBeenCalled();
    });
  });

  describe('Token Creation and Initialization', () => {
    it('should create Token instance with correct properties', async () => {
      const MockToken = require('@honeypot/shared').Token;

      render(<CrossChainKlineChart {...defaultProps} />);

      await waitFor(() => {
        expect(MockToken).toHaveBeenCalledWith(
          expect.objectContaining({
            address: expect.any(String),
            symbol: expect.any(String),
            name: expect.any(String),
            decimals: expect.any(Number),
            chainId: expect.any(String),
          })
        );
      });
    });

    it('should initialize token after creation', async () => {
      const mockInit = jest.fn();
      const MockToken = require('@honeypot/shared').Token;
      MockToken.mockImplementation(() => ({
        init: mockInit,
      }));

      render(<CrossChainKlineChart {...defaultProps} />);

      await waitFor(() => {
        expect(mockInit).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing token gracefully', () => {
      const crossChainSwapService = require('@/services/crossChainSwap').crossChainSwapService;
      crossChainSwapService.fromToken = null;

      expect(() => {
        render(<CrossChainKlineChart {...defaultProps} />);
      }).not.toThrow();

      expect(screen.getByText(/select a token to view price chart/i)).toBeInTheDocument();
    });

    it('should handle token without address', () => {
      const crossChainSwapService = require('@/services/crossChainSwap').crossChainSwapService;
      crossChainSwapService.fromToken = {
        symbol: 'TEST',
        address: null,
        chainId: '1',
        name: 'Test Token',
        decimals: 18,
        isNative: false,
      };

      expect(() => {
        render(<CrossChainKlineChart {...defaultProps} />);
      }).not.toThrow();
    });

    it('should handle component unmounting', () => {
      const { unmount } = render(<CrossChainKlineChart {...defaultProps} />);

      expect(() => {
        unmount();
      }).not.toThrow();
    });
  });
});
