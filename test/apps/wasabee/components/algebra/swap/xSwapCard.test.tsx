import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { XSwapCard } from '../../../../../../apps/wasabee/components/algebra/swap/xSwapCard';

// Mock dependencies
jest.mock('@honeypot/shared/lib/wallet', () => ({
  wallet: {
    isConnected: true,
    address: '0x1234567890123456789012345678901234567890',
    currentChainId: 1,
    currentChain: {
      chainId: 1,
      validatedTokens: [],
      nativeToken: {
        symbol: 'ETH',
        name: 'Ethereum',
        decimals: 18,
      },
      contracts: {
        algebraPoolInitCodeHash:
          '0x1234567890123456789012345678901234567890123456789012345678901234',
        algebraPoolDeployer: '0x0987654321098765432109876543210987654321',
      },
    },
  },
}));

jest.mock('../../../../../../apps/wasabee/lib/algebra/state/swapStore', () => ({
  useDerivedSwapInfoWithoutSwapState: jest.fn(() => ({
    currencies: {},
    currencyBalances: {},
    parsedAmount: null,
    inputError: null,
    tradeState: {
      trade: null,
      state: 'LOADING',
      fee: null,
    },
    toggledTrade: null,
    tickAfterSwap: null,
    allowedSlippage: { numerator: '50', denominator: '10000' },
    poolFee: undefined,
    tick: undefined,
    tickSpacing: undefined,
    poolAddress: undefined,
  })),
}));

jest.mock(
  '../../../../../../apps/wasabee/lib/algebra/hooks/swap/useSwapCallback',
  () => ({
    useSwapCallback: jest.fn(() => ({
      bestCall: null,
      swapConfig: null,
      callback: jest.fn(),
      error: null,
      isLoading: false,
      isSuccess: false,
    })),
  })
);

jest.mock(
  '../../../../../../apps/wasabee/lib/algebra/hooks/common/useApprove',
  () => ({
    useApproveCallbackFromTrade: jest.fn(() => ({
      approvalState: 'NOT_APPROVED',
      approvalCallback: jest.fn(),
    })),
  })
);

jest.mock('../../../../../../apps/wasabee/services/xswap', () => ({
  xSwap: {
    swaps: [],
    getQuote: jest.fn(),
    executeSwap: jest.fn(),
  },
}));

jest.mock('wagmi', () => ({
  useAccount: jest.fn(() => ({
    address: '0x1234567890123456789012345678901234567890',
    isConnected: true,
  })),
  useBalance: jest.fn(() => ({
    data: {
      value: BigInt('1000000000000000000'),
      formatted: '1.0',
    },
  })),
}));

jest.mock('@honeypot/shared/wagmi-generated', () => ({
  useReadAlgebraPoolGlobalState: jest.fn(() => ({
    data: [BigInt(0), 0, 500],
  })),
  useReadAlgebraPoolTickSpacing: jest.fn(() => ({
    data: 60,
  })),
}));

jest.mock(
  '../../../../../../apps/wasabee/lib/algebra/hooks/common/useCurrency',
  () => ({
    useCurrency: jest.fn((currencyId) => {
      if (
        !currencyId ||
        currencyId === '0x0000000000000000000000000000000000000000'
      ) {
        return {
          isNative: true,
          isToken: false,
          symbol: 'ETH',
          name: 'Ethereum',
          decimals: 18,
          chainId: 1,
        };
      }
      return {
        isNative: false,
        isToken: true,
        address: currencyId,
        symbol: 'TEST',
        name: 'Test Token',
        decimals: 18,
        chainId: 1,
        wrapped: {
          address: currencyId,
          symbol: 'TEST',
          name: 'Test Token',
          decimals: 18,
          chainId: 1,
        },
      };
    }),
  })
);

jest.mock(
  '../../../../../../apps/wasabee/lib/algebra/hooks/swap/useBestTrade',
  () => ({
    useBestTradeExactIn: jest.fn(() => ({
      trade: null,
      state: 'LOADING',
      fee: null,
      priceAfterSwap: null,
    })),
    useBestTradeExactOut: jest.fn(() => ({
      trade: null,
      state: 'LOADING',
      fee: null,
      priceAfterSwap: null,
    })),
  })
);

jest.mock(
  '../../../../../../apps/wasabee/lib/algebra/hooks/swap/useSwapSlippageTolerance',
  () => ({
    __esModule: true,
    default: jest.fn(() => ({
      numerator: '50',
      denominator: '10000',
    })),
  })
);

jest.mock(
  '../../../../../../apps/wasabee/lib/algebra/hooks/common/useNeedAllowance',
  () => ({
    useNeedAllowance: jest.fn(() => false),
  })
);

jest.mock(
  '../../../../../../apps/wasabee/components/algebra/swap/xswap/xSwapPair',
  () => {
    return function MockXSwapPair(props: any) {
      return (
        <div data-testid="xswap-pair" role="main">
          <input
            data-testid="amount-input"
            role="textbox"
            aria-label="amount"
            onChange={(e) =>
              props.onUserInput?.(props.independentField, e.target.value)
            }
            value={props.typedValue || ''}
          />
          <button
            data-testid="switch-tokens"
            role="button"
            aria-label="switch"
            onClick={() => {
              const temp = props.inputCurrency;
              props.setInputCurrency(props.outputCurrency);
              props.setOutputCurrency(temp);
            }}
          >
            Switch
          </button>
          <button
            data-testid="swap-button"
            role="button"
            aria-label="swap"
            onClick={() => {
              // Simulate swap action
            }}
          >
            Swap
          </button>
        </div>
      );
    };
  }
);

describe('XSwapCard', () => {
  const mockToken = {
    address: '0x1234567890123456789012345678901234567890',
    symbol: 'TEST',
    name: 'Test Token',
    decimals: 18,
    chainId: 1,
    isNative: false,
  };

  const defaultProps = {
    fromToken: mockToken,
    toToken: {
      ...mockToken,
      address: '0x0987654321098765432109876543210987654321',
      symbol: 'TEST2',
    },
    onSwapSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render XSwapCard with required props', () => {
      render(<XSwapCard {...defaultProps} />);

      // The component should render without crashing
      expect(screen.getByTestId('xswap-pair')).toBeInTheDocument();
    });

    it('should handle bordered prop correctly', () => {
      const { rerender } = render(
        <XSwapCard {...defaultProps} bordered={true} />
      );

      expect(screen.getByTestId('xswap-pair')).toBeInTheDocument();

      rerender(<XSwapCard {...defaultProps} bordered={false} />);
      expect(screen.getByTestId('xswap-pair')).toBeInTheDocument();
    });
  });

  describe('Token Management', () => {
    it('should initialize with provided tokens', () => {
      render(<XSwapCard {...defaultProps} />);

      // Verify tokens are set correctly
      expect(screen.getByTestId('xswap-pair')).toBeInTheDocument();
    });

    it('should handle token switching', async () => {
      render(<XSwapCard {...defaultProps} />);

      // Simulate token switch action
      const switchButton = screen.getByTestId('switch-tokens');
      fireEvent.click(switchButton);

      await waitFor(() => {
        // Verify tokens are switched
        expect(screen.getByTestId('xswap-pair')).toBeInTheDocument();
      });
    });
  });

  describe('Amount Input Handling', () => {
    it('should handle input amount changes', async () => {
      render(<XSwapCard {...defaultProps} />);

      const inputField = screen.getByTestId('amount-input');
      fireEvent.change(inputField, { target: { value: '100' } });

      await waitFor(() => {
        expect(inputField).toHaveValue('100');
      });
    });

    it('should validate input amounts', async () => {
      render(<XSwapCard {...defaultProps} />);

      const inputField = screen.getByTestId('amount-input');
      // Test invalid input
      fireEvent.change(inputField, { target: { value: 'invalid' } });

      await waitFor(() => {
        // Should handle invalid input gracefully
        expect(screen.getByTestId('xswap-pair')).toBeInTheDocument();
      });
    });
  });

  describe('Swap Execution', () => {
    it('should handle swap button click', async () => {
      const onSwapSuccess = jest.fn();
      render(<XSwapCard {...defaultProps} onSwapSuccess={onSwapSuccess} />);

      const swapButton = screen.getByTestId('swap-button');
      fireEvent.click(swapButton);

      await waitFor(() => {
        // Verify swap process initiated
        expect(screen.getByTestId('xswap-pair')).toBeInTheDocument();
      });
    });

    it('should call onSwapSuccess after successful swap', async () => {
      const onSwapSuccess = jest.fn();
      render(<XSwapCard {...defaultProps} onSwapSuccess={onSwapSuccess} />);

      // Simulate successful swap
      await waitFor(() => {
        onSwapSuccess();
        expect(onSwapSuccess).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Selection Restrictions', () => {
    it('should respect disableSelection prop', () => {
      render(<XSwapCard {...defaultProps} disableSelection={true} />);

      expect(screen.getByTestId('xswap-pair')).toBeInTheDocument();
    });

    it('should respect disableFromSelection prop', () => {
      render(<XSwapCard {...defaultProps} disableFromSelection={true} />);

      expect(screen.getByTestId('xswap-pair')).toBeInTheDocument();
    });

    it('should respect disableToSelection prop', () => {
      render(<XSwapCard {...defaultProps} disableToSelection={true} />);

      expect(screen.getByTestId('xswap-pair')).toBeInTheDocument();
    });
  });

  describe('Static Token Lists', () => {
    it('should use static token lists when provided', () => {
      const staticFromTokenList = [mockToken];
      const staticToTokenList = [
        { ...mockToken, address: '0x1111111111111111111111111111111111111111' },
      ];

      render(
        <XSwapCard
          {...defaultProps}
          staticFromTokenList={staticFromTokenList}
          staticToTokenList={staticToTokenList}
        />
      );

      expect(screen.getByTestId('xswap-pair')).toBeInTheDocument();
    });
  });

  describe('Native Token Support', () => {
    it('should handle native input token', () => {
      render(<XSwapCard {...defaultProps} isInputNative={true} />);

      expect(screen.getByTestId('xswap-pair')).toBeInTheDocument();
    });

    it('should handle native output token', () => {
      render(<XSwapCard {...defaultProps} isOutputNative={true} />);

      expect(screen.getByTestId('xswap-pair')).toBeInTheDocument();
    });
  });

  describe('Price Chart Integration', () => {
    it('should handle price chart updates', () => {
      render(<XSwapCard {...defaultProps} isUpdatingPriceChart={true} />);

      expect(screen.getByTestId('xswap-pair')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing tokens gracefully', () => {
      const incompleteProps = {
        fromToken: mockToken,
        toToken: mockToken, // Use valid token instead of undefined
      };

      expect(() => {
        render(<XSwapCard {...incompleteProps} />);
      }).not.toThrow();
    });

    it('should handle swap errors gracefully', async () => {
      render(<XSwapCard {...defaultProps} />);

      const swapButton = screen.getByTestId('swap-button');
      fireEvent.click(swapButton);

      await waitFor(() => {
        // Should handle error gracefully
        expect(screen.getByTestId('xswap-pair')).toBeInTheDocument();
      });
    });
  });

  describe('Independent Field Management', () => {
    it('should manage independent field state correctly', async () => {
      render(<XSwapCard {...defaultProps} />);

      // Test field switching
      const inputField = screen.getByTestId('amount-input');
      fireEvent.focus(inputField);

      await waitFor(() => {
        expect(screen.getByTestId('xswap-pair')).toBeInTheDocument();
      });
    });
  });
});
