import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TokenSelector from '../../../../../apps/wasabee/components/cross-chain-swap/TokenSelector';

// Mock dependencies
jest.mock('@honeypot/shared', () => ({
  TokenLogo: ({ token }: any) => (
    <img src={token.logo} alt={`${token.symbol} logo`} data-testid="token-logo" />
  ),
}));

jest.mock('../../../../../apps/wasabee/services/universalAccountService', () => ({
  universalAccountService: {
    getSupportedTokensForChain: jest.fn((chainId) => [
      { symbol: 'USDC', address: '0x123', decimals: 6, logo: '/usdc-logo.png', balance: '1000.50' },
      { symbol: 'USDT', address: '0x456', decimals: 6, logo: '/usdt-logo.png', balance: '500.25' },
      { symbol: 'ETH', address: '0x789', decimals: 18, logo: '/eth-logo.png', balance: '2.5' },
    ]),
    getTokenBalance: jest.fn((token, chainId) => Promise.resolve('1000.50')),
  },
}));

describe('TokenSelector', () => {
  const mockToken = {
    symbol: 'USDC',
    address: '0x123',
    decimals: 6,
    logo: '/usdc-logo.png',
    balance: '1000.50',
  };

  const mockChain = {
    chainId: 1,
    name: 'Ethereum',
    symbol: 'ETH',
  };

  const defaultProps = {
    selectedToken: mockToken,
    selectedChain: mockChain,
    onTokenSelect: jest.fn(),
    label: 'From Token',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render token selector with label', () => {
      render(<TokenSelector {...defaultProps} />);
      
      expect(screen.getByText('From Token')).toBeInTheDocument();
    });

    it('should display selected token', () => {
      render(<TokenSelector {...defaultProps} />);
      
      expect(screen.getByText('USDC')).toBeInTheDocument();
      expect(screen.getByTestId('token-logo')).toBeInTheDocument();
    });

    it('should show token balance', () => {
      render(<TokenSelector {...defaultProps} />);
      
      expect(screen.getByText(/1000\.50/)).toBeInTheDocument();
    });

    it('should render placeholder when no token selected', () => {
      render(<TokenSelector {...defaultProps} selectedToken={null} />);
      
      expect(screen.getByText(/select token/i)).toBeInTheDocument();
    });
  });

  describe('Token Selection', () => {
    it('should open dropdown on click', async () => {
      render(<TokenSelector {...defaultProps} />);
      
      const selector = screen.getByRole('button');
      fireEvent.click(selector);
      
      await waitFor(() => {
        expect(screen.getByText('USDT')).toBeInTheDocument();
        expect(screen.getByText('ETH')).toBeInTheDocument();
      });
    });

    it('should call onTokenSelect when token is selected', async () => {
      const onTokenSelect = jest.fn();
      render(<TokenSelector {...defaultProps} onTokenSelect={onTokenSelect} />);
      
      const selector = screen.getByRole('button');
      fireEvent.click(selector);
      
      await waitFor(() => {
        const usdtOption = screen.getByText('USDT');
        fireEvent.click(usdtOption);
        
        expect(onTokenSelect).toHaveBeenCalledWith({
          symbol: 'USDT',
          address: '0x456',
          decimals: 6,
          logo: '/usdt-logo.png',
          balance: '500.25',
        });
      });
    });

    it('should close dropdown after selection', async () => {
      render(<TokenSelector {...defaultProps} />);
      
      const selector = screen.getByRole('button');
      fireEvent.click(selector);
      
      await waitFor(() => {
        const usdtOption = screen.getByText('USDT');
        fireEvent.click(usdtOption);
      });
      
      await waitFor(() => {
        expect(screen.queryByText('ETH')).not.toBeInTheDocument();
      });
    });
  });

  describe('Chain-based Token Loading', () => {
    it('should load tokens for selected chain', async () => {
      const universalAccountService = require('../../../../../apps/wasabee/services/universalAccountService').universalAccountService;
      const getSupportedTokensSpy = jest.spyOn(universalAccountService, 'getSupportedTokensForChain');
      
      render(<TokenSelector {...defaultProps} />);
      
      expect(getSupportedTokensSpy).toHaveBeenCalledWith(1);
    });

    it('should reload tokens when chain changes', async () => {
      const universalAccountService = require('../../../../../apps/wasabee/services/universalAccountService').universalAccountService;
      const getSupportedTokensSpy = jest.spyOn(universalAccountService, 'getSupportedTokensForChain');
      
      const { rerender } = render(<TokenSelector {...defaultProps} />);
      
      const newChain = { chainId: 137, name: 'Polygon', symbol: 'MATIC' };
      rerender(<TokenSelector {...defaultProps} selectedChain={newChain} />);
      
      await waitFor(() => {
        expect(getSupportedTokensSpy).toHaveBeenCalledWith(137);
      });
    });

    it('should handle empty token list', async () => {
      const universalAccountService = require('../../../../../apps/wasabee/services/universalAccountService').universalAccountService;
      universalAccountService.getSupportedTokensForChain.mockReturnValue([]);
      
      render(<TokenSelector {...defaultProps} />);
      
      const selector = screen.getByRole('button');
      fireEvent.click(selector);
      
      await waitFor(() => {
        expect(screen.getByText(/no tokens available/i)).toBeInTheDocument();
      });
    });
  });

  describe('Balance Display', () => {
    it('should show token balances in dropdown', async () => {
      render(<TokenSelector {...defaultProps} />);
      
      const selector = screen.getByRole('button');
      fireEvent.click(selector);
      
      await waitFor(() => {
        expect(screen.getByText(/1000\.50/)).toBeInTheDocument();
        expect(screen.getByText(/500\.25/)).toBeInTheDocument();
        expect(screen.getByText(/2\.5/)).toBeInTheDocument();
      });
    });

    it('should update balances when chain changes', async () => {
      const universalAccountService = require('../../../../../apps/wasabee/services/universalAccountService').universalAccountService;
      const getTokenBalanceSpy = jest.spyOn(universalAccountService, 'getTokenBalance');
      
      const { rerender } = render(<TokenSelector {...defaultProps} />);
      
      const newChain = { chainId: 137, name: 'Polygon', symbol: 'MATIC' };
      rerender(<TokenSelector {...defaultProps} selectedChain={newChain} />);
      
      await waitFor(() => {
        expect(getTokenBalanceSpy).toHaveBeenCalled();
      });
    });

    it('should handle balance loading errors', async () => {
      const universalAccountService = require('../../../../../apps/wasabee/services/universalAccountService').universalAccountService;
      universalAccountService.getTokenBalance.mockRejectedValue(new Error('Balance fetch failed'));
      
      render(<TokenSelector {...defaultProps} />);
      
      const selector = screen.getByRole('button');
      fireEvent.click(selector);
      
      await waitFor(() => {
        // Should show tokens even if balance loading fails
        expect(screen.getByText('USDT')).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('should filter tokens by search term', async () => {
      render(<TokenSelector {...defaultProps} searchable={true} />);
      
      const selector = screen.getByRole('button');
      fireEvent.click(selector);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/search tokens/i);
        fireEvent.change(searchInput, { target: { value: 'USD' } });
        
        expect(screen.getByText('USDC')).toBeInTheDocument();
        expect(screen.getByText('USDT')).toBeInTheDocument();
        expect(screen.queryByText('ETH')).not.toBeInTheDocument();
      });
    });

    it('should search by token address', async () => {
      render(<TokenSelector {...defaultProps} searchable={true} />);
      
      const selector = screen.getByRole('button');
      fireEvent.click(selector);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/search tokens/i);
        fireEvent.change(searchInput, { target: { value: '0x456' } });
        
        expect(screen.getByText('USDT')).toBeInTheDocument();
        expect(screen.queryByText('USDC')).not.toBeInTheDocument();
        expect(screen.queryByText('ETH')).not.toBeInTheDocument();
      });
    });

    it('should show no results message when search yields no matches', async () => {
      render(<TokenSelector {...defaultProps} searchable={true} />);
      
      const selector = screen.getByRole('button');
      fireEvent.click(selector);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/search tokens/i);
        fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
        
        expect(screen.getByText(/no tokens found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Disabled State', () => {
    it('should handle disabled state', () => {
      render(<TokenSelector {...defaultProps} disabled={true} />);
      
      const selector = screen.getByRole('button');
      expect(selector).toBeDisabled();
    });

    it('should not open dropdown when disabled', () => {
      render(<TokenSelector {...defaultProps} disabled={true} />);
      
      const selector = screen.getByRole('button');
      fireEvent.click(selector);
      
      expect(screen.queryByText('USDT')).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading state while fetching tokens', () => {
      const universalAccountService = require('../../../../../apps/wasabee/services/universalAccountService').universalAccountService;
      universalAccountService.getSupportedTokensForChain.mockImplementation(() => {
        throw new Promise(() => {}); // Never resolves
      });
      
      render(<TokenSelector {...defaultProps} />);
      
      const selector = screen.getByRole('button');
      fireEvent.click(selector);
      
      expect(screen.getByText(/loading/i) || screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle token loading errors', async () => {
      const universalAccountService = require('../../../../../apps/wasabee/services/universalAccountService').universalAccountService;
      universalAccountService.getSupportedTokensForChain.mockImplementation(() => {
        throw new Error('Failed to load tokens');
      });
      
      render(<TokenSelector {...defaultProps} />);
      
      const selector = screen.getByRole('button');
      fireEvent.click(selector);
      
      await waitFor(() => {
        expect(screen.getByText(/error loading tokens/i)).toBeInTheDocument();
      });
    });

    it('should handle missing chain gracefully', () => {
      render(<TokenSelector {...defaultProps} selectedChain={null} />);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation', async () => {
      render(<TokenSelector {...defaultProps} />);
      
      const selector = screen.getByRole('button');
      
      // Open with Enter key
      fireEvent.keyDown(selector, { key: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByText('USDT')).toBeInTheDocument();
      });
      
      // Navigate with arrow keys
      fireEvent.keyDown(selector, { key: 'ArrowDown' });
      fireEvent.keyDown(selector, { key: 'Enter' });
      
      expect(defaultProps.onTokenSelect).toHaveBeenCalled();
    });

    it('should close dropdown with Escape key', async () => {
      render(<TokenSelector {...defaultProps} />);
      
      const selector = screen.getByRole('button');
      fireEvent.click(selector);
      
      await waitFor(() => {
        expect(screen.getByText('USDT')).toBeInTheDocument();
      });
      
      fireEvent.keyDown(selector, { key: 'Escape' });
      
      await waitFor(() => {
        expect(screen.queryByText('USDT')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<TokenSelector {...defaultProps} />);
      
      const selector = screen.getByRole('button');
      expect(selector).toHaveAttribute('aria-haspopup', 'listbox');
      expect(selector).toHaveAttribute('aria-expanded', 'false');
    });

    it('should update ARIA attributes when dropdown opens', async () => {
      render(<TokenSelector {...defaultProps} />);
      
      const selector = screen.getByRole('button');
      fireEvent.click(selector);
      
      await waitFor(() => {
        expect(selector).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should have proper labels for screen readers', () => {
      render(<TokenSelector {...defaultProps} />);
      
      expect(screen.getByLabelText(/from token/i)).toBeInTheDocument();
    });
  });

  describe('Token Filtering', () => {
    it('should exclude selected token from opposite selector', async () => {
      render(<TokenSelector {...defaultProps} excludeToken={mockToken} />);
      
      const selector = screen.getByRole('button');
      fireEvent.click(selector);
      
      await waitFor(() => {
        expect(screen.getByText('USDT')).toBeInTheDocument();
        expect(screen.getByText('ETH')).toBeInTheDocument();
        expect(screen.queryByText('USDC')).not.toBeInTheDocument();
      });
    });
  });
});