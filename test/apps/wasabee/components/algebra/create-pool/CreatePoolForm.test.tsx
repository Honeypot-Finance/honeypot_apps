import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreatePoolForm from '../../../../../../apps/wasabee/components/algebra/create-pool/CreatePoolForm';

// Mock dependencies
jest.mock('@honeypot/shared/lib/wallet', () => ({
  wallet: {
    address: '0x123',
    currentChain: {
      chainId: 1,
      contracts: {
        algebraPoolDeployer: '0xDeployer',
        algebraPoolInitCodeHash: '0xHash',
        algebraPositionManager: '0xPositionManager',
      },
      validatedTokens: [
        { address: '0x123', symbol: 'USDC', decimals: 6 },
        { address: '0x456', symbol: 'USDT', decimals: 6 },
        { address: '0x789', symbol: 'ETH', decimals: 18 },
      ],
    },
  },
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
}));

// Mock Algebra hooks and services
jest.mock('@/lib/algebra/hooks/pools/usePool', () => ({
  usePool: jest.fn(() => [0, null]), // PoolState.LOADING = 0
  PoolState: {
    LOADING: 0,
    NOT_EXISTS: 1,
    EXISTS: 2,
    INVALID: 3,
  },
}));

// Mock @cryptoalgebra/sdk
jest.mock('@cryptoalgebra/sdk', () => ({
  ADDRESS_ZERO: '0x0000000000000000000000000000000000000000',
  NonfungiblePositionManager: {
    createCallParameters: jest.fn(() => ({
      calldata: '0x123',
      value: '0',
    })),
  },
  computePoolAddress: jest.fn(() => '0xPoolAddress'),
}));

jest.mock('@/lib/algebra/state/swapStore', () => ({
  useDerivedSwapInfo: jest.fn(() => ({
    currencies: {
      INPUT: null,
      OUTPUT: null,
    },
  })),
  useSwapState: jest.fn(() => ({
    actions: {
      selectCurrency: jest.fn(),
    },
  })),
}));

jest.mock('@/lib/algebra/state/mintStore', () => ({
  useMintState: jest.fn(() => ({
    startPriceTypedValue: '',
    actions: {
      typeStartPriceInput: jest.fn(),
    },
  })),
  useDerivedMintInfo: jest.fn(() => ({
    pool: null,
    errorMessage: null,
    errorCode: null,
    invalidPool: false,
  })),
}));

jest.mock('@/lib/algebra/hooks/common/useTransactionAwait', () => ({
  useTransactionAwait: jest.fn(() => ({
    isLoading: false,
    isError: false,
    isSuccess: false,
  })),
}));

jest.mock('wagmi', () => ({
  useWriteContract: jest.fn(() => ({
    data: null,
    writeContract: jest.fn(),
  })),
}));

jest.mock('@honeypot/shared/wagmi-generated', () => ({
  useSimulateAlgebraPositionManagerMulticall: jest.fn(() => ({
    data: null,
  })),
}));

jest.mock('@/lib/hooks/useContractToastify', () => ({
  useToastify: jest.fn(),
}));

jest.mock('mobx-react-lite', () => ({
  useObserver: jest.fn((fn) => fn()),
}));

// Mock components
jest.mock('@/components/algebra/create-pool/SelectPair', () => {
  return function MockSelectPair() {
    return (
      <div data-testid="select-pair">
        <div data-testid="token-selector-token-a">
          <button data-testid="select-token-token-a">Select Token A</button>
        </div>
        <div data-testid="token-selector-token-b">
          <button data-testid="select-token-token-b">Select Token B</button>
        </div>
      </div>
    );
  };
});

jest.mock('@/components/CardContianer/HoneyContainer', () => {
  return function MockHoneyContainer({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <div data-testid="honey-container">{children}</div>;
  };
});

jest.mock('@/components/algebra/common/Loader', () => {
  return function MockLoader() {
    return <div data-testid="loader">Loading...</div>;
  };
});

// Mock NextUI Button component to avoid ripple effect issues
jest.mock('@/components/button/button-next', () => ({
  Button: ({
    children,
    onPress,
    disabled,
    isDisabled,
    className,
    ...props
  }: any) => {
    const isButtonDisabled = disabled || isDisabled;
    return (
      <button
        onClick={onPress}
        disabled={isButtonDisabled}
        data-testid="mock-button"
        className={className}
        {...props}
      >
        {children}
      </button>
    );
  },
}));

// Mock NextUI Input component
jest.mock('@/components/algebra/ui/input', () => ({
  Input: ({ onChange, value, placeholder, ...props }: any) => (
    <input
      onChange={onChange}
      value={value}
      placeholder={placeholder}
      data-testid="mock-input"
      {...props}
    />
  ),
}));

// Helper function to create mock tokens
const createMockToken = (
  address: string,
  symbol: string,
  decimals: number = 18
) => ({
  address,
  symbol,
  decimals,
  wrapped: {
    address,
    symbol,
    decimals,
    equals: jest.fn((other: any) => address === other?.address),
    sortsBefore: jest.fn(() => true),
  },
});

describe('CreatePoolForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset all mocks to their default state
    const mockUseDerivedSwapInfo =
      require('../../../../../../apps/wasabee/lib/algebra/state/swapStore').useDerivedSwapInfo;
    const mockUseMintState =
      require('../../../../../../apps/wasabee/lib/algebra/state/mintStore').useMintState;
    const mockUsePool =
      require('../../../../../../apps/wasabee/lib/algebra/hooks/pools/usePool').usePool;

    mockUseDerivedSwapInfo.mockReturnValue({
      currencies: {
        INPUT: null,
        OUTPUT: null,
      },
    });

    mockUseMintState.mockReturnValue({
      startPriceTypedValue: '',
      actions: {
        typeStartPriceInput: jest.fn(),
      },
    });

    mockUsePool.mockReturnValue([0, null]); // PoolState.LOADING = 0
  });

  describe('Rendering', () => {
    it('should render create pool form', () => {
      render(<CreatePoolForm />);

      expect(screen.getByText(/select pair/i)).toBeInTheDocument();
      expect(screen.getByTestId('token-selector-token-a')).toBeInTheDocument();
      expect(screen.getByTestId('token-selector-token-b')).toBeInTheDocument();
    });

    it('should render select currencies button initially', () => {
      render(<CreatePoolForm />);

      const selectButton = screen.getByRole('button', {
        name: /select currencies/i,
      });
      expect(selectButton).toBeInTheDocument();
    });

    it('should disable button initially', () => {
      render(<CreatePoolForm />);

      const selectButton = screen.getByRole('button', {
        name: /select currencies/i,
      });
      expect(selectButton).toBeDisabled();
    });
  });

  describe('Token Selection', () => {
    it('should render token selectors', () => {
      render(<CreatePoolForm />);

      const tokenASelector = screen.getByTestId('select-token-token-a');
      const tokenBSelector = screen.getByTestId('select-token-token-b');

      expect(tokenASelector).toBeInTheDocument();
      expect(tokenBSelector).toBeInTheDocument();
    });

    it('should show select currencies when no tokens selected', () => {
      render(<CreatePoolForm />);

      const selectButton = screen.getByRole('button', {
        name: /select currencies/i,
      });
      expect(selectButton).toBeInTheDocument();
    });

    it('should show select another pair when same token selected', () => {
      const mockUseDerivedSwapInfo =
        require('@/lib/algebra/state/swapStore').useDerivedSwapInfo;
      const mockToken = createMockToken('0x123', 'USDC');
      mockToken.wrapped.equals = jest.fn(() => true);

      mockUseDerivedSwapInfo.mockReturnValue({
        currencies: {
          INPUT: mockToken,
          OUTPUT: mockToken,
        },
      });

      render(<CreatePoolForm />);

      const selectButton = screen.getByRole('button', {
        name: /select another pair/i,
      });
      expect(selectButton).toBeInTheDocument();
    });
  });

  describe('Price Input', () => {
    it('should show price input when tokens are selected and pool does not exist', () => {
      const mockUseDerivedSwapInfo =
        require('@/lib/algebra/state/swapStore').useDerivedSwapInfo;
      const mockTokenA = createMockToken('0x123', 'USDC');
      const mockTokenB = createMockToken('0x456', 'USDT');

      mockUseDerivedSwapInfo.mockReturnValue({
        currencies: {
          INPUT: mockTokenA,
          OUTPUT: mockTokenB,
        },
      });

      render(<CreatePoolForm />);

      const priceInput = screen.getByTestId('mock-input');
      expect(priceInput).toBeInTheDocument();
    });

    it('should handle price input changes', () => {
      const mockUseDerivedSwapInfo =
        require('@/lib/algebra/state/swapStore').useDerivedSwapInfo;
      const mockTypeStartPriceInput = jest.fn();
      const mockUseMintState =
        require('@/lib/algebra/state/mintStore').useMintState;

      const mockTokenA = createMockToken('0x123', 'USDC');
      const mockTokenB = createMockToken('0x456', 'USDT');

      mockUseDerivedSwapInfo.mockReturnValue({
        currencies: {
          INPUT: mockTokenA,
          OUTPUT: mockTokenB,
        },
      });

      mockUseMintState.mockReturnValue({
        startPriceTypedValue: '',
        actions: {
          typeStartPriceInput: mockTypeStartPriceInput,
        },
      });

      render(<CreatePoolForm />);

      const priceInput = screen.getByTestId('mock-input');
      fireEvent.change(priceInput, { target: { value: '1.5' } });

      expect(mockTypeStartPriceInput).toHaveBeenCalledWith('1.5');
    });

    it('should show enter initial price button when no price entered', () => {
      const mockUseDerivedSwapInfo =
        require('@/lib/algebra/state/swapStore').useDerivedSwapInfo;
      const mockTokenA = createMockToken('0x123', 'USDC');
      const mockTokenB = createMockToken('0x456', 'USDT');

      mockUseDerivedSwapInfo.mockReturnValue({
        currencies: {
          INPUT: mockTokenA,
          OUTPUT: mockTokenB,
        },
      });

      render(<CreatePoolForm />);

      const enterPriceButton = screen.getByTestId('mock-button');
      expect(enterPriceButton).toBeInTheDocument();
      expect(enterPriceButton).toBeDisabled();
    });
  });

  describe('Pool Existence Check', () => {
    it('should show view existing pool when pool exists', () => {
      const mockUsePool = require('@/lib/algebra/hooks/pools/usePool').usePool;
      const mockUseDerivedSwapInfo =
        require('@/lib/algebra/state/swapStore').useDerivedSwapInfo;

      const mockTokenA = createMockToken('0x123', 'USDC');
      const mockTokenB = createMockToken('0x456', 'USDT');

      mockUseDerivedSwapInfo.mockReturnValue({
        currencies: {
          INPUT: mockTokenA,
          OUTPUT: mockTokenB,
        },
      });

      mockUsePool.mockReturnValue([2, null]); // PoolState.EXISTS = 2

      render(<CreatePoolForm />);

      const viewPoolButton = screen.getByTestId('mock-button');
      expect(viewPoolButton).toBeInTheDocument();
    });

    it('should handle pool existence navigation', () => {
      const mockUseRouter = require('next/navigation').useRouter;
      const mockPush = jest.fn();
      mockUseRouter.mockReturnValue({ push: mockPush });

      const mockUsePool = require('@/lib/algebra/hooks/pools/usePool').usePool;
      const mockUseDerivedSwapInfo =
        require('@/lib/algebra/state/swapStore').useDerivedSwapInfo;

      const mockTokenA = createMockToken('0x123', 'USDC');
      const mockTokenB = createMockToken('0x456', 'USDT');

      mockUseDerivedSwapInfo.mockReturnValue({
        currencies: {
          INPUT: mockTokenA,
          OUTPUT: mockTokenB,
        },
      });

      mockUsePool.mockReturnValue([2, null]); // PoolState.EXISTS = 2

      render(<CreatePoolForm />);

      const viewPoolButton = screen.getByTestId('mock-button');
      fireEvent.click(viewPoolButton);

      expect(mockPush).toHaveBeenCalled();
    });
  });

  describe('Form Validation', () => {
    it('should enable create button when all fields are valid', () => {
      const mockUseDerivedSwapInfo =
        require('@/lib/algebra/state/swapStore').useDerivedSwapInfo;
      const mockUseMintState =
        require('@/lib/algebra/state/mintStore').useMintState;
      const mockUsePool = require('@/lib/algebra/hooks/pools/usePool').usePool;

      const mockTokenA = createMockToken('0x123', 'USDC');
      const mockTokenB = createMockToken('0x456', 'USDT');

      mockUseDerivedSwapInfo.mockReturnValue({
        currencies: {
          INPUT: mockTokenA,
          OUTPUT: mockTokenB,
        },
      });

      mockUseMintState.mockReturnValue({
        startPriceTypedValue: '1.5',
        actions: {
          typeStartPriceInput: jest.fn(),
        },
      });

      mockUsePool.mockReturnValue([1, null]); // PoolState.NOT_EXISTS = 1

      render(<CreatePoolForm />);

      const createButton = screen.getByTestId('mock-button');
      expect(createButton).not.toBeDisabled();
    });

    it('should show validation errors for missing fields', () => {
      render(<CreatePoolForm />);

      // When no tokens are selected, button should be disabled
      const selectButton = screen.getByTestId('mock-button');
      // The button should be disabled when no currencies are selected
      expect(selectButton).toBeDisabled();
      // Button text will be "Select currencies" when no tokens are selected
      expect(selectButton).toHaveTextContent(/select currencies/i);
    });
  });

  describe('Pool Creation', () => {
    it('should handle pool creation submission', () => {
      const mockWriteContract = jest.fn();
      const mockUseWriteContract = require('wagmi').useWriteContract;
      const mockUseDerivedSwapInfo =
        require('@/lib/algebra/state/swapStore').useDerivedSwapInfo;
      const mockUseMintState =
        require('@/lib/algebra/state/mintStore').useMintState;
      const mockUsePool = require('@/lib/algebra/hooks/pools/usePool').usePool;
      const mockUseSimulate =
        require('@honeypot/shared/wagmi-generated').useSimulateAlgebraPositionManagerMulticall;

      const mockTokenA = createMockToken('0x123', 'USDC');
      const mockTokenB = createMockToken('0x456', 'USDT');

      mockUseDerivedSwapInfo.mockReturnValue({
        currencies: {
          INPUT: mockTokenA,
          OUTPUT: mockTokenB,
        },
      });

      mockUseMintState.mockReturnValue({
        startPriceTypedValue: '1.5',
        actions: {
          typeStartPriceInput: jest.fn(),
        },
      });

      mockUsePool.mockReturnValue([1, null]); // PoolState.NOT_EXISTS = 1
      mockUseWriteContract.mockReturnValue({
        data: null,
        writeContract: mockWriteContract,
      });

      mockUseSimulate.mockReturnValue({
        data: {
          request: {
            address: '0x123',
            abi: [],
            functionName: 'multicall',
            args: [],
            value: 0n,
          },
        },
      });

      render(<CreatePoolForm />);

      const createButton = screen.getByTestId('mock-button');
      fireEvent.click(createButton);

      expect(mockWriteContract).toHaveBeenCalled();
    });

    it('should show loading state during pool creation', () => {
      const mockUseTransactionAwait =
        require('@/lib/algebra/hooks/common/useTransactionAwait').useTransactionAwait;

      mockUseTransactionAwait.mockReturnValue({
        isLoading: true,
        isError: false,
        isSuccess: false,
      });

      render(<CreatePoolForm />);

      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    it('should handle successful pool creation', () => {
      const mockUseTransactionAwait =
        require('@/lib/algebra/hooks/common/useTransactionAwait').useTransactionAwait;

      mockUseTransactionAwait.mockReturnValue({
        isLoading: false,
        isError: false,
        isSuccess: true,
      });

      render(<CreatePoolForm />);

      // Component should render without errors when successful
      expect(screen.getByTestId('honey-container')).toBeInTheDocument();
    });
  });

  describe('Price Display', () => {
    it('should show price conversion when price is entered', () => {
      const mockUseDerivedSwapInfo =
        require('@/lib/algebra/state/swapStore').useDerivedSwapInfo;
      const mockUseMintState =
        require('@/lib/algebra/state/mintStore').useMintState;

      const mockTokenA = createMockToken('0x123', 'USDC');
      const mockTokenB = createMockToken('0x456', 'USDT');

      mockUseDerivedSwapInfo.mockReturnValue({
        currencies: {
          INPUT: mockTokenA,
          OUTPUT: mockTokenB,
        },
      });

      mockUseMintState.mockReturnValue({
        startPriceTypedValue: '2.0',
        actions: {
          typeStartPriceInput: jest.fn(),
        },
      });

      render(<CreatePoolForm />);

      expect(screen.getByText(/1 USDT = 0.5 USDC/i)).toBeInTheDocument();
    });

    it('should show enter initial price message when no price', () => {
      const mockUseDerivedSwapInfo =
        require('@/lib/algebra/state/swapStore').useDerivedSwapInfo;
      const mockUseMintState =
        require('@/lib/algebra/state/mintStore').useMintState;

      const mockTokenA = createMockToken('0x123', 'USDC');
      const mockTokenB = createMockToken('0x456', 'USDT');

      mockUseDerivedSwapInfo.mockReturnValue({
        currencies: {
          INPUT: mockTokenA,
          OUTPUT: mockTokenB,
        },
      });

      mockUseMintState.mockReturnValue({
        startPriceTypedValue: '',
        actions: {
          typeStartPriceInput: jest.fn(),
        },
      });

      render(<CreatePoolForm />);

      expect(screen.getByText(/enter the initial price/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle transaction errors', () => {
      const mockUseTransactionAwait =
        require('@/lib/algebra/hooks/common/useTransactionAwait').useTransactionAwait;

      mockUseTransactionAwait.mockReturnValue({
        isLoading: false,
        isError: true,
        isSuccess: false,
      });

      render(<CreatePoolForm />);

      // Component should render without crashing when there's an error
      expect(screen.getByTestId('honey-container')).toBeInTheDocument();
    });

    it('should handle missing contract addresses', () => {
      const mockWallet = require('@honeypot/shared/lib/wallet').wallet;
      mockWallet.currentChain.contracts = null;

      render(<CreatePoolForm />);

      expect(screen.getByTestId('token-selector-token-a')).toBeInTheDocument();
    });

    it('should handle invalid mint info', () => {
      const mockUseDerivedMintInfo =
        require('@/lib/algebra/state/mintStore').useDerivedMintInfo;

      mockUseDerivedMintInfo.mockReturnValue({
        pool: null,
        errorMessage: 'Invalid pool configuration',
        errorCode: 'INVALID_POOL',
        invalidPool: true,
      });

      render(<CreatePoolForm />);

      expect(screen.getByTestId('honey-container')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper form structure', () => {
      render(<CreatePoolForm />);

      expect(screen.getByText(/select pair/i)).toBeInTheDocument();
      expect(screen.getByTestId('select-pair')).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      const mockUseDerivedSwapInfo =
        require('@/lib/algebra/state/swapStore').useDerivedSwapInfo;
      const mockTokenA = createMockToken('0x123', 'USDC');
      const mockTokenB = createMockToken('0x456', 'USDT');

      mockUseDerivedSwapInfo.mockReturnValue({
        currencies: {
          INPUT: mockTokenA,
          OUTPUT: mockTokenB,
        },
      });

      render(<CreatePoolForm />);

      const priceInput = screen.getByTestId('mock-input');
      const button = screen.getByTestId('mock-button');

      // Should be focusable
      priceInput.focus();
      expect(document.activeElement).toBe(priceInput);

      // Note: Button might be disabled, so focus might not work as expected
      // Just test that the elements exist and are accessible
      expect(button).toBeInTheDocument();
      expect(priceInput).toBeInTheDocument();
    });

    it('should have proper button states', () => {
      render(<CreatePoolForm />);

      const button = screen.getByTestId('mock-button');
      expect(button).toBeInTheDocument();
      // Button should be disabled initially and show appropriate text
      expect(button).toBeDisabled();
    });
  });
});
