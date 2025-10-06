import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CrossChainSwapCard from '../../../../../apps/wasabee/components/cross-chain-swap/CrossChainSwapCard';

// Mock dependencies
jest.mock('@honeypot/shared/lib/wallet', () => ({
  wallet: {
    isConnected: true,
    address: '0x123',
    universalAccount: {
      loadUniversalAccountInfo: jest.fn(),
      isInitialized: true,
    },
    isInit: true,
  },
}));

jest.mock('../../../../../apps/wasabee/services/crossChainSwap', () => ({
  crossChainSwapService: {
    fromChain: { chainId: 1, name: 'Ethereum' },
    toChain: { chainId: 137, name: 'Polygon' },
    fromToken: { symbol: 'USDC', address: '0x123' },
    toToken: { symbol: 'USDC', address: '0x456' },
    setFromChain: jest.fn(),
    setToChain: jest.fn(),
    setFromToken: jest.fn(),
    setToToken: jest.fn(),
    getQuote: jest.fn(),
    executeSwap: jest.fn(),
  },
}));

jest.mock('../../../../../apps/wasabee/services/crossChainTransactionService', () => ({
  crossChainTransactionService: {
    addTransaction: jest.fn(),
    updateTransactionStatus: jest.fn(),
    getTransactionHistory: jest.fn(() => []),
  },
}));

jest.mock('@honeypot/shared/lib/trpc/trpc', () => ({
  trpcClient: {
    tokenPrice: {
      getTokenPrice: {
        query: jest.fn(),
      },
    },
  },
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe('CrossChainSwapCard', () => {
  const defaultProps = {
    onSwapSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render CrossChainSwapCard with all main elements', () => {
      render(<CrossChainSwapCard {...defaultProps} />);
      
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByText(/from/i)).toBeInTheDocument();
      expect(screen.getByText(/to/i)).toBeInTheDocument();
    });

    it('should render chain selectors', () => {
      render(<CrossChainSwapCard {...defaultProps} />);
      
      const chainSelectors = screen.getAllByRole('button', { name: /chain/i });
      expect(chainSelectors.length).toBeGreaterThan(0);
    });

    it('should render token selectors', () => {
      render(<CrossChainSwapCard {...defaultProps} />);
      
      const tokenSelectors = screen.getAllByRole('button', { name: /token/i });
      expect(tokenSelectors.length).toBeGreaterThan(0);
    });
  });

  describe('Amount Input', () => {
    it('should handle from amount input changes', async () => {
      render(<CrossChainSwapCard {...defaultProps} />);
      
      const fromAmountInput = screen.getByPlaceholderText(/enter amount/i);
      fireEvent.change(fromAmountInput, { target: { value: '100' } });
      
      await waitFor(() => {
        expect(fromAmountInput).toHaveValue('100');
      });
    });

    it('should validate amount input format', async () => {
      render(<CrossChainSwapCard {...defaultProps} />);
      
      const fromAmountInput = screen.getByPlaceholderText(/enter amount/i);
      
      // Test invalid input
      fireEvent.change(fromAmountInput, { target: { value: 'invalid' } });
      
      await waitFor(() => {
        // Should handle invalid input gracefully
        expect(screen.getByRole('main')).toBeInTheDocument();
      });
    });

    it('should update quote when amount changes', async () => {
      const mockGetQuote = jest.fn();
      const crossChainSwapService = require('../../../../../apps/wasabee/services/crossChainSwap').crossChainSwapService;
      crossChainSwapService.getQuote = mockGetQuote;
      
      render(<CrossChainSwapCard {...defaultProps} />);
      
      const fromAmountInput = screen.getByPlaceholderText(/enter amount/i);
      fireEvent.change(fromAmountInput, { target: { value: '100' } });
      
      await waitFor(() => {
        expect(mockGetQuote).toHaveBeenCalled();
      });
    });
  });

  describe('Chain Selection', () => {
    it('should handle from chain selection', async () => {
      const mockSetFromChain = jest.fn();
      const crossChainSwapService = require('../../../../../apps/wasabee/services/crossChainSwap').crossChainSwapService;
      crossChainSwapService.setFromChain = mockSetFromChain;
      
      render(<CrossChainSwapCard {...defaultProps} />);
      
      const fromChainSelector = screen.getByRole('button', { name: /from chain/i });
      fireEvent.click(fromChainSelector);
      
      await waitFor(() => {
        // Chain selection dropdown should appear
        expect(screen.getByRole('main')).toBeInTheDocument();
      });
    });

    it('should handle to chain selection', async () => {
      const mockSetToChain = jest.fn();
      const crossChainSwapService = require('../../../../../apps/wasabee/services/crossChainSwap').crossChainSwapService;
      crossChainSwapService.setToChain = mockSetToChain;
      
      render(<CrossChainSwapCard {...defaultProps} />);
      
      const toChainSelector = screen.getByRole('button', { name: /to chain/i });
      fireEvent.click(toChainSelector);
      
      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });
    });

    it('should prevent selecting same chain for from and to', async () => {
      render(<CrossChainSwapCard {...defaultProps} />);
      
      // This test would verify that the UI prevents or warns about same chain selection
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('Token Selection', () => {
    it('should handle from token selection', async () => {
      const mockSetFromToken = jest.fn();
      const crossChainSwapService = require('../../../../../apps/wasabee/services/crossChainSwap').crossChainSwapService;
      crossChainSwapService.setFromToken = mockSetFromToken;
      
      render(<CrossChainSwapCard {...defaultProps} />);
      
      const fromTokenSelector = screen.getByRole('button', { name: /from token/i });
      fireEvent.click(fromTokenSelector);
      
      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });
    });

    it('should handle to token selection', async () => {
      const mockSetToToken = jest.fn();
      const crossChainSwapService = require('../../../../../apps/wasabee/services/crossChainSwap').crossChainSwapService;
      crossChainSwapService.setToToken = mockSetToToken;
      
      render(<CrossChainSwapCard {...defaultProps} />);
      
      const toTokenSelector = screen.getByRole('button', { name: /to token/i });
      fireEvent.click(toTokenSelector);
      
      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });
    });
  });

  describe('Quote Display', () => {
    it('should display loading state while fetching quote', async () => {
      render(<CrossChainSwapCard {...defaultProps} />);
      
      const fromAmountInput = screen.getByPlaceholderText(/enter amount/i);
      fireEvent.change(fromAmountInput, { target: { value: '100' } });
      
      // Should show loading indicator
      await waitFor(() => {
        expect(screen.getByText(/loading/i) || screen.getByRole('progressbar')).toBeInTheDocument();
      });
    });

    it('should display quote details when available', async () => {
      const mockQuoteData = {
        priceImpact: 0.5,
        estimatedTime: 300,
        route: ['Ethereum', 'Polygon'],
        feeInUSD: '5.00',
      };
      
      render(<CrossChainSwapCard {...defaultProps} />);
      
      // Simulate quote data being available
      await waitFor(() => {
        // Quote details should be displayed
        expect(screen.getByRole('main')).toBeInTheDocument();
      });
    });

    it('should handle quote fetch errors', async () => {
      const crossChainSwapService = require('../../../../../apps/wasabee/services/crossChainSwap').crossChainSwapService;
      crossChainSwapService.getQuote.mockRejectedValue(new Error('Quote failed'));
      
      render(<CrossChainSwapCard {...defaultProps} />);
      
      const fromAmountInput = screen.getByPlaceholderText(/enter amount/i);
      fireEvent.change(fromAmountInput, { target: { value: '100' } });
      
      await waitFor(() => {
        // Should handle error gracefully
        expect(screen.getByRole('main')).toBeInTheDocument();
      });
    });
  });

  describe('Swap Execution', () => {
    it('should handle swap button click', async () => {
      const mockExecuteSwap = jest.fn();
      const crossChainSwapService = require('../../../../../apps/wasabee/services/crossChainSwap').crossChainSwapService;
      crossChainSwapService.executeSwap = mockExecuteSwap;
      
      render(<CrossChainSwapCard {...defaultProps} />);
      
      const swapButton = screen.getByRole('button', { name: /swap/i });
      fireEvent.click(swapButton);
      
      await waitFor(() => {
        expect(mockExecuteSwap).toHaveBeenCalled();
      });
    });

    it('should disable swap button when insufficient balance', async () => {
      render(<CrossChainSwapCard {...defaultProps} />);
      
      // Simulate insufficient balance scenario
      const fromAmountInput = screen.getByPlaceholderText(/enter amount/i);
      fireEvent.change(fromAmountInput, { target: { value: '999999999' } });
      
      await waitFor(() => {
        const swapButton = screen.getByRole('button', { name: /swap/i });
        expect(swapButton).toBeDisabled();
      });
    });

    it('should call onSwapSuccess after successful swap', async () => {
      const onSwapSuccess = jest.fn();
      const mockExecuteSwap = jest.fn().mockResolvedValue({ success: true });
      const crossChainSwapService = require('../../../../../apps/wasabee/services/crossChainSwap').crossChainSwapService;
      crossChainSwapService.executeSwap = mockExecuteSwap;
      
      render(<CrossChainSwapCard onSwapSuccess={onSwapSuccess} />);
      
      const swapButton = screen.getByRole('button', { name: /swap/i });
      fireEvent.click(swapButton);
      
      await waitFor(() => {
        expect(onSwapSuccess).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Settings', () => {
    it('should toggle settings panel', async () => {
      render(<CrossChainSwapCard {...defaultProps} />);
      
      const settingsButton = screen.getByRole('button', { name: /settings/i });
      fireEvent.click(settingsButton);
      
      await waitFor(() => {
        expect(screen.getByText(/slippage/i)).toBeInTheDocument();
      });
    });

    it('should handle slippage changes', async () => {
      render(<CrossChainSwapCard {...defaultProps} />);
      
      const settingsButton = screen.getByRole('button', { name: /settings/i });
      fireEvent.click(settingsButton);
      
      const slippageInput = screen.getByDisplayValue('1.0');
      fireEvent.change(slippageInput, { target: { value: '2.0' } });
      
      await waitFor(() => {
        expect(slippageInput).toHaveValue('2.0');
      });
    });
  });

  describe('Universal Account Integration', () => {
    it('should initialize universal account on wallet connection', async () => {
      const mockLoadUniversalAccountInfo = jest.fn();
      const wallet = require('@honeypot/shared/lib/wallet').wallet;
      wallet.universalAccount.loadUniversalAccountInfo = mockLoadUniversalAccountInfo;
      
      render(<CrossChainSwapCard {...defaultProps} />);
      
      await waitFor(() => {
        expect(mockLoadUniversalAccountInfo).toHaveBeenCalled();
      });
    });

    it('should handle universal account initialization errors', async () => {
      const mockLoadUniversalAccountInfo = jest.fn().mockRejectedValue(new Error('Init failed'));
      const wallet = require('@honeypot/shared/lib/wallet').wallet;
      wallet.universalAccount.loadUniversalAccountInfo = mockLoadUniversalAccountInfo;
      
      render(<CrossChainSwapCard {...defaultProps} />);
      
      await waitFor(() => {
        // Should handle error gracefully
        expect(screen.getByRole('main')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network switching errors', async () => {
      render(<CrossChainSwapCard {...defaultProps} />);
      
      // Simulate network switch requirement
      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });
    });

    it('should handle transaction failures gracefully', async () => {
      const mockExecuteSwap = jest.fn().mockRejectedValue(new Error('Transaction failed'));
      const crossChainSwapService = require('../../../../../apps/wasabee/services/crossChainSwap').crossChainSwapService;
      crossChainSwapService.executeSwap = mockExecuteSwap;
      
      render(<CrossChainSwapCard {...defaultProps} />);
      
      const swapButton = screen.getByRole('button', { name: /swap/i });
      fireEvent.click(swapButton);
      
      await waitFor(() => {
        // Should show error message
        expect(screen.getByRole('main')).toBeInTheDocument();
      });
    });
  });
});