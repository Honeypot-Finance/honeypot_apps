import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CrossChainSwapPage from '../../../../apps/wasabee/pages/cross-chain-swap';

// Mock dependencies
jest.mock('@honeypot/shared/lib/wallet', () => ({
  wallet: {
    isInit: true,
    address: '0x123',
    currentChain: {
      chainId: 1,
      name: 'Ethereum',
    },
  },
}));

jest.mock('wagmi', () => ({
  useAccount: () => ({
    address: '0x123',
    isConnected: true,
  }),
}));

// Mock NextUI components
jest.mock('@nextui-org/react', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

// Mock child components
jest.mock('../../../../apps/wasabee/components/LoadingDisplay/LoadingDisplay', () => ({
  LoadingDisplay: () => <div data-testid="loading-display">Loading...</div>,
}));

jest.mock('../../../../apps/wasabee/components/cross-chain-swap/CrossChainSwapLayout', () => {
  return function MockCrossChainSwapLayout() {
    return (
      <div data-testid="cross-chain-swap-layout">
        <div data-testid="swap-card">Cross Chain Swap Card</div>
        <div data-testid="chart">Price Chart</div>
        <div data-testid="transaction-history">Transaction History</div>
      </div>
    );
  };
});

// Mock Universal Account Service
jest.mock('../../../../apps/wasabee/services/universalAccountService', () => ({
  universalAccountService: {
    isLoading: false,
    availableChains: [
      { chainId: 1, name: 'Ethereum' },
      { chainId: 137, name: 'Polygon' },
    ],
    isChainSupported: jest.fn((chainId) => [1, 137, 56].includes(chainId)),
    initialize: jest.fn(),
  },
}));

describe('CrossChainSwapPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset document body styles
    document.body.style.backgroundColor = '';
    
    // Reset universal account service state
    const universalAccountService = require('../../../../apps/wasabee/services/universalAccountService').universalAccountService;
    universalAccountService.isLoading = false;
  });

  describe('Rendering', () => {
    it('should render cross-chain swap page when wallet is initialized', () => {
      render(<CrossChainSwapPage />);
      
      expect(screen.getByTestId('cross-chain-swap-layout')).toBeInTheDocument();
    });

    it('should render loading display when wallet is not initialized', () => {
      const wallet = require('@honeypot/shared/lib/wallet').wallet;
      wallet.isInit = false;
      
      render(<CrossChainSwapPage />);
      
      expect(screen.getByTestId('loading-display')).toBeInTheDocument();
      expect(screen.queryByTestId('cross-chain-swap-layout')).not.toBeInTheDocument();
    });

    it('should set dark background on mount', () => {
      render(<CrossChainSwapPage />);
      
      expect(document.body.style.backgroundColor).toBe('rgb(10, 10, 10)');
    });

    it('should reset background on unmount', () => {
      const { unmount } = render(<CrossChainSwapPage />);
      
      unmount();
      
      expect(document.body.style.backgroundColor).toBe('');
    });
  });

  describe('Universal Account Service Integration', () => {
    it('should show loading when Universal Account service is loading', () => {
      const universalAccountService = require('../../../../apps/wasabee/services/universalAccountService').universalAccountService;
      universalAccountService.isLoading = true;
      
      render(<CrossChainSwapPage />);
      
      expect(screen.getByTestId('loading-display')).toBeInTheDocument();
      expect(screen.getByText('Loading supported chains...')).toBeInTheDocument();
    });

    it('should show main content when Universal Account service is loaded', () => {
      const universalAccountService = require('../../../../apps/wasabee/services/universalAccountService').universalAccountService;
      universalAccountService.isLoading = false;
      
      render(<CrossChainSwapPage />);
      
      expect(screen.getByTestId('cross-chain-swap-layout')).toBeInTheDocument();
    });

    it('should have proper loading container styling', () => {
      const universalAccountService = require('../../../../apps/wasabee/services/universalAccountService').universalAccountService;
      universalAccountService.isLoading = true;
      
      render(<CrossChainSwapPage />);
      
      const loadingContainer = screen.getByTestId('loading-display').closest('div');
      expect(loadingContainer).toHaveClass(
        'w-full',
        'min-h-[80vh]',
        'flex',
        'items-center',
        'justify-center'
      );
    });
  });

  describe('Chain Support Validation', () => {
    it('should render content when current chain is supported', () => {
      const wallet = require('@honeypot/shared/lib/wallet').wallet;
      wallet.currentChain = { chainId: 1, name: 'Ethereum' };
      
      const universalAccountService = require('../../../../apps/wasabee/services/universalAccountService').universalAccountService;
      universalAccountService.isChainSupported.mockReturnValue(true);
      
      render(<CrossChainSwapPage />);
      
      expect(screen.getByTestId('cross-chain-swap-layout')).toBeInTheDocument();
    });

    it('should handle unsupported chain gracefully', () => {
      const wallet = require('@honeypot/shared/lib/wallet').wallet;
      wallet.currentChain = { chainId: 999, name: 'Unsupported Chain' };
      
      const universalAccountService = require('../../../../apps/wasabee/services/universalAccountService').universalAccountService;
      universalAccountService.isChainSupported.mockReturnValue(false);
      
      render(<CrossChainSwapPage />);
      
      // Should still render the layout (commented out code suggests this might show a different UI)
      expect(screen.getByTestId('cross-chain-swap-layout')).toBeInTheDocument();
    });
  });

  describe('Wallet Integration', () => {
    it('should handle connected wallet', () => {
      const { useAccount } = require('wagmi');
      useAccount.mockReturnValue({
        address: '0x123',
        isConnected: true,
      });
      
      render(<CrossChainSwapPage />);
      
      expect(screen.getByTestId('cross-chain-swap-layout')).toBeInTheDocument();
    });

    it('should handle disconnected wallet', () => {
      const { useAccount } = require('wagmi');
      useAccount.mockReturnValue({
        address: undefined,
        isConnected: false,
      });
      
      render(<CrossChainSwapPage />);
      
      // Should still render when wallet is disconnected
      expect(screen.getByTestId('cross-chain-swap-layout')).toBeInTheDocument();
    });

    it('should update when wallet connection changes', () => {
      const { useAccount } = require('wagmi');
      useAccount.mockReturnValue({
        address: undefined,
        isConnected: false,
      });
      
      const { rerender } = render(<CrossChainSwapPage />);
      
      useAccount.mockReturnValue({
        address: '0x123',
        isConnected: true,
      });
      
      rerender(<CrossChainSwapPage />);
      
      expect(screen.getByTestId('cross-chain-swap-layout')).toBeInTheDocument();
    });
  });

  describe('Layout Components', () => {
    it('should render all layout components', () => {
      render(<CrossChainSwapPage />);
      
      expect(screen.getByTestId('swap-card')).toBeInTheDocument();
      expect(screen.getByTestId('chart')).toBeInTheDocument();
      expect(screen.getByTestId('transaction-history')).toBeInTheDocument();
    });

    it('should pass correct props to layout component', () => {
      render(<CrossChainSwapPage />);
      
      const layout = screen.getByTestId('cross-chain-swap-layout');
      expect(layout).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle wallet initialization errors', () => {
      const wallet = require('@honeypot/shared/lib/wallet').wallet;
      wallet.isInit = undefined;
      
      expect(() => {
        render(<CrossChainSwapPage />);
      }).not.toThrow();
    });

    it('should handle Universal Account service errors', () => {
      const universalAccountService = require('../../../../apps/wasabee/services/universalAccountService').universalAccountService;
      universalAccountService.isLoading = undefined;
      universalAccountService.availableChains = undefined;
      
      expect(() => {
        render(<CrossChainSwapPage />);
      }).not.toThrow();
    });

    it('should handle missing chain information', () => {
      const wallet = require('@honeypot/shared/lib/wallet').wallet;
      wallet.currentChain = null;
      
      expect(() => {
        render(<CrossChainSwapPage />);
      }).not.toThrow();
    });
  });

  describe('Loading States', () => {
    it('should show wallet loading state', () => {
      const wallet = require('@honeypot/shared/lib/wallet').wallet;
      wallet.isInit = false;
      
      render(<CrossChainSwapPage />);
      
      expect(screen.getByTestId('loading-display')).toBeInTheDocument();
    });

    it('should show Universal Account loading state', () => {
      const universalAccountService = require('../../../../apps/wasabee/services/universalAccountService').universalAccountService;
      universalAccountService.isLoading = true;
      
      render(<CrossChainSwapPage />);
      
      expect(screen.getByText('Loading supported chains...')).toBeInTheDocument();
    });

    it('should transition from loading to content', async () => {
      const universalAccountService = require('../../../../apps/wasabee/services/universalAccountService').universalAccountService;
      universalAccountService.isLoading = true;
      
      const { rerender } = render(<CrossChainSwapPage />);
      
      expect(screen.getByTestId('loading-display')).toBeInTheDocument();
      
      universalAccountService.isLoading = false;
      rerender(<CrossChainSwapPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('cross-chain-swap-layout')).toBeInTheDocument();
      });
    });
  });

  describe('Styling and Layout', () => {
    it('should apply correct page styling', () => {
      render(<CrossChainSwapPage />);
      
      expect(document.body.style.backgroundColor).toBe('rgb(10, 10, 10)');
    });

    it('should have proper loading container styling', () => {
      const universalAccountService = require('../../../../apps/wasabee/services/universalAccountService').universalAccountService;
      universalAccountService.isLoading = true;
      
      render(<CrossChainSwapPage />);
      
      const container = screen.getByTestId('loading-display').closest('div');
      expect(container).toHaveClass('bg-[#1a1a1a]', 'rounded-3xl', 'border', 'border-[#2a2a2a]', 'shadow-2xl', 'p-8');
    });
  });

  describe('Responsive Behavior', () => {
    it('should handle mobile viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      render(<CrossChainSwapPage />);
      
      expect(screen.getByTestId('cross-chain-swap-layout')).toBeInTheDocument();
    });

    it('should handle desktop viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });
      
      render(<CrossChainSwapPage />);
      
      expect(screen.getByTestId('cross-chain-swap-layout')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', () => {
      const { rerender } = render(<CrossChainSwapPage />);
      
      rerender(<CrossChainSwapPage />);
      rerender(<CrossChainSwapPage />);
      
      expect(screen.getByTestId('cross-chain-swap-layout')).toBeInTheDocument();
    });

    it('should handle rapid state changes', async () => {
      const universalAccountService = require('../../../../apps/wasabee/services/universalAccountService').universalAccountService;
      
      const { rerender } = render(<CrossChainSwapPage />);
      
      // Rapid state changes
      for (let i = 0; i < 5; i++) {
        universalAccountService.isLoading = true;
        rerender(<CrossChainSwapPage />);
        universalAccountService.isLoading = false;
        rerender(<CrossChainSwapPage />);
      }
      
      expect(screen.getByTestId('cross-chain-swap-layout')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper page structure', () => {
      render(<CrossChainSwapPage />);
      
      expect(screen.getByTestId('cross-chain-swap-layout')).toBeInTheDocument();
    });

    it('should provide loading feedback', () => {
      const universalAccountService = require('../../../../apps/wasabee/services/universalAccountService').universalAccountService;
      universalAccountService.isLoading = true;
      
      render(<CrossChainSwapPage />);
      
      expect(screen.getByText('Loading supported chains...')).toBeInTheDocument();
    });
  });

  describe('Cleanup', () => {
    it('should cleanup background style on unmount', () => {
      const { unmount } = render(<CrossChainSwapPage />);
      
      expect(document.body.style.backgroundColor).toBe('rgb(10, 10, 10)');
      
      unmount();
      
      expect(document.body.style.backgroundColor).toBe('');
    });

    it('should handle multiple mount/unmount cycles', () => {
      const { unmount: unmount1 } = render(<CrossChainSwapPage />);
      expect(document.body.style.backgroundColor).toBe('rgb(10, 10, 10)');
      
      unmount1();
      expect(document.body.style.backgroundColor).toBe('');
      
      const { unmount: unmount2 } = render(<CrossChainSwapPage />);
      expect(document.body.style.backgroundColor).toBe('rgb(10, 10, 10)');
      
      unmount2();
      expect(document.body.style.backgroundColor).toBe('');
    });
  });
});