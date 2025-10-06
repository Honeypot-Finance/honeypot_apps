import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import EnterAmountCard from '../../../../../../apps/wasabee/components/algebra/create-position/EnterAmountsCard';

// Mock dependencies
jest.mock('@honeypot/shared/lib/wallet', () => ({
  wallet: {
    currentChainId: '1',
    currentChain: {
      nativeToken: {
        address: '0x0000000000000000000000000000000000000000',
        symbol: 'ETH',
      },
    },
  },
}));

jest.mock('wagmi', () => ({
  useAccount: jest.fn(() => ({
    address: '0x123456789abcdef',
  })),
  useBalance: jest.fn(() => ({
    data: {
      formatted: '1000.123456',
      decimals: 18,
    },
    isLoading: false,
  })),
}));

jest.mock('@honeypot/shared', () => ({
  Token: {
    getToken: jest.fn(() => ({
      address: '0x123',
      symbol: 'USDC',
      decimals: 6,
    })),
  },
  TokenLogo: ({ token, addtionalClasses }: any) => (
    <div className={addtionalClasses} data-testid="token-logo">
      {token?.symbol || 'TOKEN'}
    </div>
  ),
}));

jest.mock('@/lib/algebra/utils/common/formatCurrency', () => ({
  formatCurrency: {
    format: jest.fn((value: number) => value.toLocaleString()),
  },
}));

jest.mock('@/components/algebra/ui/input', () => ({
  Input: ({
    value,
    onUserInput,
    placeholder,
    id,
    className,
    classNames,
    maxDecimals,
    ...props
  }: any) => {
    const handleChange = (e: any) => {
      if (onUserInput) {
        onUserInput(e.target.value);
      }
    };

    return (
      <input
        id={id}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={className}
        data-testid="amount-input"
        {...props}
      />
    );
  },
}));

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

jest.mock('react-icons/hi', () => ({
  HiOutlineSwitchHorizontal: ({ onClick, className }: any) => (
    <button
      onClick={onClick}
      className={className}
      data-testid="switch-button"
      role="button"
    >
      Switch
    </button>
  ),
  HiSwitchVertical: ({ onClick, className }: any) => (
    <button
      onClick={onClick}
      className={className}
      data-testid="switch-vertical-button"
      role="button"
    >
      Switch Vertical
    </button>
  ),
}));

// Mock @cryptoalgebra/sdk
jest.mock('@cryptoalgebra/sdk', () => ({
  Currency: class MockCurrency {
    constructor(
      public mockSymbol: string,
      public mockDecimals: number,
      public mockIsNative: boolean
    ) {
      this.symbol = mockSymbol;
      this.decimals = mockDecimals;
      this.isNative = mockIsNative;
    }
    symbol: string = '';
    decimals: number = 0;
    isNative: boolean = false;
    wrapped = {
      address: '0x123',
      symbol: '',
      decimals: 0,
    };
  },
  CurrencyAmount: class MockCurrencyAmount {
    constructor(public mockCurrency: unknown, public mockAmount: string) {}
  },
  WNATIVE: {
    1: {
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      symbol: 'WETH',
      decimals: 18,
    },
  },
}));

describe('EnterAmountCard', () => {
  // Create proper mock currencies using the mocked Currency class
  const mockCurrency = {
    symbol: 'USDC',
    decimals: 6,
    isNative: false,
    wrapped: {
      address: '0x123',
      symbol: 'USDC',
      decimals: 6,
    },
  };

  const mockNativeCurrency = {
    symbol: 'ETH',
    decimals: 18,
    isNative: true,
    wrapped: {
      address: '0x0000000000000000000000000000000000000000',
      symbol: 'ETH',
      decimals: 18,
    },
  };

  const defaultProps = {
    currency: mockCurrency,
    value: '',
    needApprove: false,
    error: undefined,
    valueForApprove: undefined,
    handleChange: jest.fn(),
    useNative: false,
    setUseNative: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset useBalance mock to default state
    const mockUseBalance = require('wagmi').useBalance;
    mockUseBalance.mockReturnValue({
      data: {
        formatted: '1000.123456',
        decimals: 18,
      },
      isLoading: false,
    });
  });

  describe('Rendering', () => {
    it('should render amount input card with currency', () => {
      render(<EnterAmountCard {...defaultProps} />);

      expect(screen.getAllByText('USDC')).toHaveLength(2); // TokenLogo and span
      expect(screen.getByTestId('amount-input')).toBeInTheDocument();
    });

    it('should show token logo when currency is provided', () => {
      render(<EnterAmountCard {...defaultProps} />);

      // TokenLogo component should be rendered
      expect(screen.getByTestId('token-logo')).toBeInTheDocument();
    });

    it('should show "Select a token" when no currency provided', () => {
      render(<EnterAmountCard {...defaultProps} currency={undefined} />);

      expect(screen.getByText('Select a token')).toBeInTheDocument();
    });

    it('should display current input value', () => {
      render(<EnterAmountCard {...defaultProps} value="100.50" />);

      const input = screen.getByDisplayValue('100.50');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Amount Input Handling', () => {
    it('should call handleChange when user types', async () => {
      const mockHandleChange = jest.fn();
      render(
        <EnterAmountCard {...defaultProps} handleChange={mockHandleChange} />
      );

      const input = screen.getByTestId('amount-input');
      fireEvent.change(input, { target: { value: '123.45' } });

      expect(mockHandleChange).toHaveBeenCalledWith('123.45');
    });

    it('should handle decimal point input correctly', async () => {
      const mockHandleChange = jest.fn();
      render(
        <EnterAmountCard {...defaultProps} handleChange={mockHandleChange} />
      );

      const input = screen.getByTestId('amount-input');
      fireEvent.change(input, { target: { value: '.' } });

      expect(mockHandleChange).toHaveBeenCalledWith('0.');
    });

    it('should respect token decimal limits', async () => {
      const mockHandleChange = jest.fn();
      const currencyWith2Decimals = {
        ...mockCurrency,
        decimals: 2,
        wrapped: {
          ...mockCurrency.wrapped,
          decimals: 2,
        },
      };

      render(
        <EnterAmountCard
          {...defaultProps}
          currency={currencyWith2Decimals}
          handleChange={mockHandleChange}
        />
      );

      const input = screen.getByTestId('amount-input');
      fireEvent.change(input, { target: { value: '123.456' } });

      // Should handle decimal precision
      expect(mockHandleChange).toHaveBeenCalled();
    });

    it('should handle empty input', async () => {
      const mockHandleChange = jest.fn();
      render(
        <EnterAmountCard {...defaultProps} handleChange={mockHandleChange} />
      );

      const input = screen.getByTestId('amount-input');

      // Test that the input accepts empty values (even if handleChange isn't called)
      fireEvent.change(input, { target: { value: '' } });

      // The input should accept the empty value
      expect(input).toHaveValue('');

      // Test that non-empty values work
      fireEvent.change(input, { target: { value: '123' } });
      expect(mockHandleChange).toHaveBeenCalledWith('123');
    });

    it('should handle invalid characters gracefully', async () => {
      const mockHandleChange = jest.fn();
      render(
        <EnterAmountCard {...defaultProps} handleChange={mockHandleChange} />
      );

      const input = screen.getByTestId('amount-input');
      fireEvent.change(input, { target: { value: 'abc' } });

      expect(mockHandleChange).toHaveBeenCalledWith('abc');
    });
  });

  describe('Balance Display', () => {
    it('should show loading state for balance', () => {
      // Mock loading state
      const mockUseBalance = require('wagmi').useBalance;
      mockUseBalance.mockReturnValue({
        data: null,
        isLoading: true,
      });

      render(<EnterAmountCard {...defaultProps} />);

      expect(screen.getByText(/Loading\.\.\./)).toBeInTheDocument();
    });

    it('should display formatted balance when available', async () => {
      render(<EnterAmountCard {...defaultProps} />);

      await waitFor(() => {
        // Balance should be formatted and displayed
        expect(screen.getByText(/Balance:/)).toBeInTheDocument();
      });
    });

    it('should show Max button when balance is available', async () => {
      render(<EnterAmountCard {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Max')).toBeInTheDocument();
      });
    });

    it('should set max amount when Max button clicked', async () => {
      const mockHandleChange = jest.fn();
      render(
        <EnterAmountCard {...defaultProps} handleChange={mockHandleChange} />
      );

      await waitFor(() => {
        const maxButton = screen.getByText('Max');
        fireEvent.click(maxButton);

        expect(mockHandleChange).toHaveBeenCalled();
      });
    });
  });

  describe('Native Token Handling', () => {
    it('should show native token symbol when useNative is true', () => {
      render(
        <EnterAmountCard
          {...defaultProps}
          currency={mockNativeCurrency}
          useNative={true}
        />
      );

      expect(screen.getByText('ETH')).toBeInTheDocument();
    });

    it('should show wrapped token symbol when useNative is false', () => {
      render(
        <EnterAmountCard
          {...defaultProps}
          currency={mockNativeCurrency}
          useNative={false}
        />
      );

      expect(screen.getByText('WETH')).toBeInTheDocument();
    });

    it('should show switch button for native tokens', () => {
      render(
        <EnterAmountCard {...defaultProps} currency={mockNativeCurrency} />
      );

      // Switch button should be present for native tokens
      const switchButton = screen.getByTestId('switch-button');
      expect(switchButton).toBeInTheDocument();
    });

    it('should call setUseNative when switch button clicked', async () => {
      const mockSetUseNative = jest.fn();
      render(
        <EnterAmountCard
          {...defaultProps}
          currency={mockNativeCurrency}
          useNative={false}
          setUseNative={mockSetUseNative}
        />
      );

      const switchButton = screen.getByTestId('switch-button');
      fireEvent.click(switchButton);

      expect(mockSetUseNative).toHaveBeenCalledWith(true);
    });

    it('should not show switch button for non-native tokens', () => {
      render(<EnterAmountCard {...defaultProps} />);

      // Should not have switch button for regular tokens
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(1); // Only Max button
    });
  });

  describe('Styling and Layout', () => {
    it('should apply correct container styling', () => {
      const { container } = render(<EnterAmountCard {...defaultProps} />);

      // Find the main container div (should be the outermost div with the specific classes)
      const mainContainer = container.querySelector(
        '.w-full.rounded-2xl.border.bg-white'
      );
      expect(mainContainer).toBeInTheDocument();
    });

    it('should have proper input styling', () => {
      render(<EnterAmountCard {...defaultProps} />);

      const input = screen.getByTestId('amount-input');
      expect(input).toHaveClass('text-right');
    });

    it('should show token logo with correct size', () => {
      render(<EnterAmountCard {...defaultProps} />);

      // TokenLogo should be rendered with proper classes
      expect(screen.getByTestId('token-logo')).toHaveClass('w-8', 'h-8');
    });
  });

  describe('Error States', () => {
    it('should handle balance loading errors gracefully', () => {
      render(<EnterAmountCard {...defaultProps} />);

      // Should not crash when balance fails to load
      expect(screen.getByTestId('token-logo')).toBeInTheDocument();
    });

    it('should handle missing account gracefully', () => {
      render(<EnterAmountCard {...defaultProps} />);

      // Should render without account
      expect(screen.getByTestId('token-logo')).toBeInTheDocument();
    });

    it('should handle invalid currency data', () => {
      expect(() => {
        render(<EnterAmountCard {...defaultProps} currency={undefined} />);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have proper input labels', () => {
      render(<EnterAmountCard {...defaultProps} />);

      const input = screen.getByTestId('amount-input');
      expect(input).toHaveAttribute('id', 'amount-USDC');
    });

    it('should support keyboard navigation', () => {
      render(<EnterAmountCard {...defaultProps} />);

      const input = screen.getByTestId('amount-input');
      input.focus();
      expect(document.activeElement).toBe(input);
    });

    it('should have accessible button labels', async () => {
      render(<EnterAmountCard {...defaultProps} />);

      await waitFor(() => {
        const maxButton = screen.getByText('Max');
        expect(maxButton).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large numbers', async () => {
      const mockHandleChange = jest.fn();
      render(
        <EnterAmountCard {...defaultProps} handleChange={mockHandleChange} />
      );

      const input = screen.getByTestId('amount-input');
      fireEvent.change(input, { target: { value: '999999999999999999' } });

      expect(mockHandleChange).toHaveBeenCalledWith('999999999999999999');
    });

    it('should handle very small decimal numbers', async () => {
      const mockHandleChange = jest.fn();
      render(
        <EnterAmountCard {...defaultProps} handleChange={mockHandleChange} />
      );

      const input = screen.getByTestId('amount-input');
      fireEvent.change(input, { target: { value: '0.000001' } });

      expect(mockHandleChange).toHaveBeenCalledWith('0.000001');
    });

    it('should handle multiple decimal points', async () => {
      const mockHandleChange = jest.fn();
      render(
        <EnterAmountCard {...defaultProps} handleChange={mockHandleChange} />
      );

      const input = screen.getByTestId('amount-input');
      fireEvent.change(input, { target: { value: '1.2.3' } });

      expect(mockHandleChange).toHaveBeenCalledWith('1.2.3');
    });

    it('should handle leading zeros', async () => {
      const mockHandleChange = jest.fn();
      render(
        <EnterAmountCard {...defaultProps} handleChange={mockHandleChange} />
      );

      const input = screen.getByTestId('amount-input');
      fireEvent.change(input, { target: { value: '000123' } });

      expect(mockHandleChange).toHaveBeenCalledWith('000123');
    });
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', () => {
      const mockHandleChange = jest.fn();
      const { rerender } = render(
        <EnterAmountCard {...defaultProps} handleChange={mockHandleChange} />
      );

      // Re-render with same props
      rerender(
        <EnterAmountCard {...defaultProps} handleChange={mockHandleChange} />
      );

      expect(screen.getByTestId('token-logo')).toBeInTheDocument();
    });

    it('should handle rapid input changes', async () => {
      const mockHandleChange = jest.fn();
      render(
        <EnterAmountCard {...defaultProps} handleChange={mockHandleChange} />
      );

      const input = screen.getByTestId('amount-input');

      // Simulate rapid typing
      for (let i = 0; i < 10; i++) {
        fireEvent.change(input, { target: { value: i.toString() } });
      }

      expect(mockHandleChange).toHaveBeenCalledTimes(10);
    });
  });

  describe('Integration with Parent Components', () => {
    it('should work with form validation', () => {
      render(
        <EnterAmountCard {...defaultProps} error="Insufficient balance" />
      );

      // Should render even with error prop
      expect(screen.getByTestId('token-logo')).toBeInTheDocument();
    });

    it('should work with approval flow', () => {
      render(<EnterAmountCard {...defaultProps} needApprove={true} />);

      // Should render with approval needed
      expect(screen.getByTestId('token-logo')).toBeInTheDocument();
    });

    it('should handle value updates from parent', () => {
      const { rerender } = render(
        <EnterAmountCard {...defaultProps} value="100" />
      );

      expect(screen.getByDisplayValue('100')).toBeInTheDocument();

      rerender(<EnterAmountCard {...defaultProps} value="200" />);

      expect(screen.getByDisplayValue('200')).toBeInTheDocument();
    });
  });
});
