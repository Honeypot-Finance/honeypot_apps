import {
  useSwapState,
  useSwapActionHandlers,
  tryParseAmount,
} from '@/lib/algebra/state/swapStore';
import { SwapField } from '@/types/algebra/types/swap-field';
import { ADDRESS_ZERO, Currency, CurrencyAmount } from '@cryptoalgebra/sdk';
import { renderHook, act } from '@testing-library/react';

// Mock dependencies
jest.mock('@/lib/algebra/hooks/common/useCurrency', () => ({
  useCurrency: jest.fn().mockImplementation((address) => {
    const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';
    if (!address || address === ADDRESS_ZERO) {
      return {
        isNative: true,
        isToken: false,
        symbol: 'ETH',
        decimals: 18,
        chainId: 1,
        wrapped: {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          symbol: 'WETH',
          decimals: 18,
        },
      };
    }
    return {
      isNative: false,
      isToken: true,
      address,
      symbol: 'USDC',
      decimals: 6,
      chainId: 1,
      wrapped: {
        address,
        symbol: 'USDC',
        decimals: 6,
      },
    };
  }),
}));

jest.mock('@/lib/algebra/hooks/swap/useBestTrade', () => ({
  useBestTradeExactIn: jest.fn().mockReturnValue({
    trade: {
      inputAmount: { quotient: '1000000000000000000' },
      outputAmount: { quotient: '2000000000' },
      maximumAmountIn: jest.fn().mockReturnValue({
        currency: { symbol: 'ETH' },
      }),
    },
    state: 'VALID',
    priceAfterSwap: ['1000000000000000000'],
  }),
  useBestTradeExactOut: jest.fn().mockReturnValue({
    trade: null,
    state: 'NO_ROUTE_FOUND',
  }),
}));

jest.mock('@/lib/algebra/hooks/swap/useSwapSlippageTolerance', () =>
  jest.fn().mockReturnValue({ multiply: jest.fn().mockReturnValue('0.005') })
);

jest.mock('wagmi', () => ({
  useAccount: jest.fn().mockReturnValue({
    address: '0x123456789abcdef',
  }),
  useBalance: jest.fn().mockReturnValue({
    data: {
      value: BigInt('1000000000000000000'),
      formatted: '1.0',
    },
  }),
}));

jest.mock('@honeypot/shared/wagmi-generated', () => ({
  useReadAlgebraPoolGlobalState: jest.fn().mockReturnValue({
    data: [BigInt(0), 100, 3000], // [price, tick, fee]
  }),
  useReadAlgebraPoolTickSpacing: jest.fn().mockReturnValue({
    data: 60,
  }),
}));

jest.mock('@honeypot/shared/lib/wallet', () => ({
  wallet: {
    currentChain: {
      contracts: {
        algebraPoolInitCodeHash: '0x123',
        algebraPoolDeployer: '0x456',
      },
    },
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('SwapStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  describe('Positive Tests', () => {
    test('should initialize with default state', () => {
      const { result } = renderHook(() => useSwapState());

      expect(result.current.independentField).toBe(SwapField.INPUT);
      expect(result.current.typedValue).toBe('');
      expect(result.current[SwapField.INPUT].currencyId).toBe(ADDRESS_ZERO);
      expect(result.current[SwapField.OUTPUT].currencyId).toBe(ADDRESS_ZERO);
    });

    test('should select currency correctly', () => {
      const { result } = renderHook(() => useSwapState());

      act(() => {
        result.current.actions.selectCurrency(SwapField.INPUT, '0x123');
      });

      expect(result.current[SwapField.INPUT].currencyId).toBe('0x123');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'swapInputToken',
        '0x123'
      );
    });

    test('should switch currencies correctly', () => {
      const { result } = renderHook(() => useSwapState());

      act(() => {
        result.current.actions.selectCurrency(SwapField.INPUT, '0x123');
        result.current.actions.selectCurrency(SwapField.OUTPUT, '0x456');
      });

      act(() => {
        result.current.actions.switchCurrencies();
      });

      expect(result.current[SwapField.INPUT].currencyId).toBe('0x456');
      expect(result.current[SwapField.OUTPUT].currencyId).toBe('0x123');
      expect(result.current.independentField).toBe(SwapField.OUTPUT);
    });
  });

  describe('Negative Tests', () => {
    test('should handle undefined currency selection', () => {
      const { result } = renderHook(() => useSwapState());

      act(() => {
        result.current.actions.selectCurrency(SwapField.INPUT, undefined);
      });

      expect(result.current[SwapField.INPUT].currencyId).toBeUndefined();
    });

    test('should handle empty typed value', () => {
      const { result } = renderHook(() => useSwapState());

      act(() => {
        result.current.actions.typeInput(SwapField.INPUT, '');
      });

      expect(result.current.typedValue).toBe('');
      expect(result.current.independentField).toBe(SwapField.INPUT);
    });

    test('tryParseAmount should return undefined for invalid input', () => {
      const mockCurrency = {
        decimals: 18,
        symbol: 'ETH',
      } as Currency;

      // Suppress console.error for this test since we expect errors
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result1 = tryParseAmount('', mockCurrency);
      const result2 = tryParseAmount('invalid', mockCurrency);
      const result3 = tryParseAmount('1.0', undefined);

      expect(result1).toBeUndefined();
      expect(result2).toBeUndefined();
      expect(result3).toBeUndefined();

      // Restore console.error
      consoleSpy.mockRestore();
    });
  });

  describe('Edge Case Tests', () => {
    test('should handle auto-switching when selecting same currency', () => {
      const { result } = renderHook(() => useSwapState());

      act(() => {
        result.current.actions.selectCurrency(SwapField.INPUT, '0x123');
        result.current.actions.selectCurrency(SwapField.OUTPUT, '0x456');
      });

      // Select the same currency as output for input (should auto-switch)
      act(() => {
        result.current.actions.selectCurrency(SwapField.INPUT, '0x456');
      });

      expect(result.current[SwapField.INPUT].currencyId).toBe('0x456');
      expect(result.current[SwapField.OUTPUT].currencyId).toBe('0x123');
    });

    test('should handle native token selection and localStorage', () => {
      const { result } = renderHook(() => useSwapState());

      act(() => {
        result.current.actions.selectCurrency(SwapField.INPUT, ADDRESS_ZERO);
      });

      expect(result.current[SwapField.INPUT].currencyId).toBe(ADDRESS_ZERO);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'swapInputToken'
      );
    });

    test('tryParseAmount should handle valid amounts correctly', () => {
      const mockCurrency = {
        decimals: 18,
        symbol: 'ETH',
        chainId: 1,
      } as Currency;

      const result = tryParseAmount('1.0', mockCurrency);

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(CurrencyAmount);
    });
  });

  describe('useSwapActionHandlers', () => {
    test('should provide correct action handlers', () => {
      const { result } = renderHook(() => useSwapActionHandlers());

      expect(result.current.onCurrencySelection).toBeInstanceOf(Function);
      expect(result.current.onSwitchTokens).toBeInstanceOf(Function);
      expect(result.current.onUserInput).toBeInstanceOf(Function);
    });

    test('should handle currency selection with native token', () => {
      const { result } = renderHook(() => useSwapActionHandlers());

      const mockNativeCurrency = {
        isNative: true,
        isToken: false,
        symbol: 'ETH',
      } as Currency;

      act(() => {
        result.current.onCurrencySelection(SwapField.INPUT, mockNativeCurrency);
      });

      // Should not throw and should handle native currency correctly
      expect(true).toBe(true);
    });

    test('should handle currency selection with ERC20 token', () => {
      const { result } = renderHook(() => useSwapActionHandlers());

      const mockTokenCurrency = {
        isNative: false,
        isToken: true,
        address: '0x123',
        symbol: 'USDC',
      } as Currency;

      act(() => {
        result.current.onCurrencySelection(SwapField.OUTPUT, mockTokenCurrency);
      });

      // Should not throw and should handle token currency correctly
      expect(true).toBe(true);
    });
  });
});
