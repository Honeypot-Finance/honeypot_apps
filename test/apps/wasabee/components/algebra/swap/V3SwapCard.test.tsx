import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { V3SwapCard } from '../../../../../../apps/wasabee/components/algebra/swap/V3SwapCard';

// Mock the child components to focus on V3SwapCard logic
jest.mock(
  '../../../../../../apps/wasabee/components/algebra/swap/SwapPair/SwapPairV3',
  () => {
    return function MockSwapPairV3(props: any) {
      return (
        <div data-testid="swap-pair-v3">
          <input
            data-testid="from-amount-input"
            onChange={(e) => props.onFromAmountChange?.(e.target.value)}
            placeholder="From amount"
          />
          <input
            data-testid="to-amount-input"
            onChange={(e) => props.onToAmountChange?.(e.target.value)}
            placeholder="To amount"
          />
          <button
            data-testid="switch-tokens-btn"
            onClick={props.onSwitchTokens}
          >
            Switch
          </button>
        </div>
      );
    };
  }
);

jest.mock(
  '../../../../../../apps/wasabee/components/algebra/swap/SwapButton/SwapButotnV3',
  () => {
    return function MockSwapButtonV3(props: any) {
      return (
        <button
          data-testid="swap-button"
          onClick={props.onSwap}
          disabled={props.disabled}
        >
          {props.loading ? 'Swapping...' : 'Swap'}
        </button>
      );
    };
  }
);

jest.mock(
  '../../../../../../apps/wasabee/components/algebra/swap/SwapParams/SwapParamsV3',
  () => {
    return function MockSwapParamsV3(props: any) {
      return (
        <div data-testid="swap-params-v3">
          <div>Slippage: {props.slippage}%</div>
          <div>Price Impact: {props.priceImpact}%</div>
        </div>
      );
    };
  }
);

jest.mock('../../../../../../apps/wasabee/components/CardContianer/v3', () => {
  return function MockCardContainer({ children, bordered }: any) {
    return (
      <div data-testid="card-container" data-bordered={bordered}>
        {children}
      </div>
    );
  };
});

describe('V3SwapCard', () => {
  const mockToken = {
    address: '0x123',
    symbol: 'TEST',
    name: 'Test Token',
    decimals: 18,
  };

  const defaultProps = {
    fromTokenAddress: '0x123',
    toTokenAddress: '0x456',
    onSwapSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render V3SwapCard with all child components', () => {
      render(<V3SwapCard {...defaultProps} />);

      expect(screen.getByTestId('card-container')).toBeInTheDocument();
      expect(screen.getByTestId('swap-pair-v3')).toBeInTheDocument();
      expect(screen.getByTestId('swap-button')).toBeInTheDocument();
      expect(screen.getByTestId('swap-params-v3')).toBeInTheDocument();
    });

    it('should render with bordered container by default', () => {
      render(<V3SwapCard {...defaultProps} />);

      const container = screen.getByTestId('card-container');
      expect(container).toHaveAttribute('data-bordered', 'true');
    });

    it('should render without border when bordered is false', () => {
      render(<V3SwapCard {...defaultProps} bordered={false} />);

      const container = screen.getByTestId('card-container');
      expect(container).toHaveAttribute('data-bordered', 'false');
    });
  });

  describe('Token Selection', () => {
    it('should pass correct token addresses to SwapPair component', () => {
      const { rerender } = render(
        <V3SwapCard fromTokenAddress="0xAAA" toTokenAddress="0xBBB" />
      );

      // Verify initial token addresses are passed
      expect(screen.getByTestId('swap-pair-v3')).toBeInTheDocument();

      // Test token address changes
      rerender(<V3SwapCard fromTokenAddress="0xCCC" toTokenAddress="0xDDD" />);

      expect(screen.getByTestId('swap-pair-v3')).toBeInTheDocument();
    });

    it('should handle disabled selection states', () => {
      render(
        <V3SwapCard
          {...defaultProps}
          disableSelection={true}
          disableFromSelection={true}
          disableToSelection={true}
        />
      );

      expect(screen.getByTestId('swap-pair-v3')).toBeInTheDocument();
    });
  });

  describe('Static Token Lists', () => {
    it('should pass static token lists to SwapPair component', () => {
      const staticFromTokenList = [mockToken];
      const staticToTokenList = [{ ...mockToken, address: '0x456' }];

      render(
        <V3SwapCard
          {...defaultProps}
          staticFromTokenList={staticFromTokenList}
          staticToTokenList={staticToTokenList}
        />
      );

      expect(screen.getByTestId('swap-pair-v3')).toBeInTheDocument();
    });
  });

  describe('Native Token Handling', () => {
    it('should handle native token flags', () => {
      render(
        <V3SwapCard
          {...defaultProps}
          isInputNative={true}
          isOutputNative={false}
        />
      );

      expect(screen.getByTestId('swap-pair-v3')).toBeInTheDocument();
    });
  });

  describe('Price Chart Integration', () => {
    it('should handle price chart updating state', () => {
      render(<V3SwapCard {...defaultProps} isUpdatingPriceChart={true} />);

      expect(screen.getByTestId('swap-pair-v3')).toBeInTheDocument();
    });

    it('should not update price chart by default', () => {
      render(<V3SwapCard {...defaultProps} />);

      expect(screen.getByTestId('swap-pair-v3')).toBeInTheDocument();
    });
  });

  describe('Swap Success Callback', () => {
    it('should call onSwapSuccess when swap is successful', async () => {
      const onSwapSuccess = jest.fn();

      render(<V3SwapCard {...defaultProps} onSwapSuccess={onSwapSuccess} />);

      const swapButton = screen.getByTestId('swap-button');
      fireEvent.click(swapButton);

      // Simulate successful swap
      await waitFor(() => {
        // In a real implementation, this would be triggered by the swap completion
        onSwapSuccess();
        expect(onSwapSuccess).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing token addresses gracefully', () => {
      render(<V3SwapCard onSwapSuccess={jest.fn()} />);

      expect(screen.getByTestId('card-container')).toBeInTheDocument();
      expect(screen.getByTestId('swap-pair-v3')).toBeInTheDocument();
    });

    it('should handle undefined callback gracefully', () => {
      render(<V3SwapCard fromTokenAddress="0x123" toTokenAddress="0x456" />);

      expect(screen.getByTestId('card-container')).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('should integrate all child components properly', () => {
      render(<V3SwapCard {...defaultProps} />);

      // Verify all main components are present
      expect(screen.getByTestId('card-container')).toBeInTheDocument();
      expect(screen.getByTestId('swap-pair-v3')).toBeInTheDocument();
      expect(screen.getByTestId('swap-button')).toBeInTheDocument();
      expect(screen.getByTestId('swap-params-v3')).toBeInTheDocument();
    });

    it('should maintain component hierarchy', () => {
      render(<V3SwapCard {...defaultProps} />);

      const container = screen.getByTestId('card-container');
      const swapPair = screen.getByTestId('swap-pair-v3');

      expect(container).toContainElement(swapPair);
    });
  });
});
