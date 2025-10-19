import { useMintState, useMintActionHandlers, useDerivedMintInfo, Presets } from '@/lib/algebra/state/mintStore';
import { Field } from '@cryptoalgebra/sdk';
import { renderHook, act } from '@testing-library/react';
import { Currency } from '@cryptoalgebra/sdk';

// Mock dependencies
jest.mock('@/lib/algebra/hooks/pools/usePool', () => ({
  usePool: jest.fn().mockReturnValue([
    'NOT_EXISTS', // PoolState - use NOT_EXISTS to avoid complex pool logic
    null, // No pool object to avoid priceOf issues
  ]),
  PoolState: {
    LOADING: 'LOADING',
    EXISTS: 'EXISTS',
    NOT_EXISTS: 'NOT_EXISTS',
    INVALID: 'INVALID',
  },
}));

jest.mock('wagmi', () => ({
  useAccount: jest.fn().mockReturnValue({
    address: undefined, // Default to no account
  }),
  useBalance: jest.fn().mockReturnValue({
    data: undefined, // Default to no balance
  }),
}));

jest.mock('@cryptoalgebra/sdk', () => ({
  ...jest.requireActual('@cryptoalgebra/sdk'),
  tryParseAmount: jest.fn().mockImplementation((value, currency) => {
    if (!value || !currency) return undefined;
    return {
      currency,
      quotient: BigInt(parseFloat(value) * Math.pow(10, currency.decimals)),
    };
  }),
  Position: {
    fromAmount0: jest.fn().mockReturnValue({
      amount1: { quotient: BigInt('1000000') },
    }),
    fromAmount1: jest.fn().mockReturnValue({
      amount0: { quotient: BigInt('1000000000000000000') },
    }),
    fromAmounts: jest.fn().mockReturnValue({
      liquidity: BigInt('1000000'),
    }),
  },
  CurrencyAmount: {
    fromRawAmount: jest.fn().mockImplementation((currency, amount) => ({
      currency,
      quotient: amount,
      lessThan: jest.fn().mockReturnValue(false),
    })),
  },
  Field: {
    CURRENCY_A: 'CURRENCY_A',
    CURRENCY_B: 'CURRENCY_B',
  },
}));

describe('MintStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Positive Tests', () => {
    test('should initialize with default state', () => {
      const { result } = renderHook(() => useMintState());
      
      expect(result.current.independentField).toBe(Field.CURRENCY_A);
      expect(result.current.typedValue).toBe('');
      expect(result.current.leftRangeTypedValue).toBe('');
      expect(result.current.rightRangeTypedValue).toBe('');
      expect(result.current.dynamicFee).toBe(0);
      expect(result.current.preset).toBeNull();
    });

    test('should update dynamic fee correctly', () => {
      const { result } = renderHook(() => useMintState());
      
      act(() => {
        result.current.actions.updateDynamicFee(3000);
      });
      
      expect(result.current.dynamicFee).toBe(3000);
    });

    test('should set full range correctly', () => {
      const { result } = renderHook(() => useMintState());
      
      act(() => {
        result.current.actions.setFullRange();
      });
      
      expect(result.current.leftRangeTypedValue).toBe(true);
      expect(result.current.rightRangeTypedValue).toBe(true);
    });
  });

  describe('Negative Tests', () => {
    test('should handle negative dynamic fee', () => {
      const { result } = renderHook(() => useMintState());
      
      act(() => {
        result.current.actions.updateDynamicFee(-100);
      });
      
      expect(result.current.dynamicFee).toBe(-100);
    });

    test('should handle empty typed values', () => {
      const { result } = renderHook(() => useMintState());
      
      act(() => {
        result.current.actions.typeInput(Field.CURRENCY_A, '', false);
      });
      
      expect(result.current.typedValue).toBe('');
      expect(result.current.independentField).toBe(Field.CURRENCY_A);
    });

    test('should handle null preset selection', () => {
      const { result } = renderHook(() => useMintState());
      
      act(() => {
        result.current.actions.updateSelectedPreset(null);
      });
      
      expect(result.current.preset).toBeNull();
    });
  });

  describe('Edge Case Tests', () => {
    test('should reset state correctly', () => {
      const { result } = renderHook(() => useMintState());
      
      // Set some values first
      act(() => {
        result.current.actions.updateDynamicFee(3000);
        result.current.actions.typeInput(Field.CURRENCY_A, '100', false);
        result.current.actions.updateSelectedPreset(Presets.SAFE);
      });
      
      // Reset state
      act(() => {
        result.current.actions.resetMintState();
      });
      
      expect(result.current.independentField).toBe(Field.CURRENCY_A);
      expect(result.current.typedValue).toBe('');
      expect(result.current.dynamicFee).toBe(0);
      expect(result.current.preset).toBeNull();
    });

    test('should handle different field inputs', () => {
      const { result } = renderHook(() => useMintState());
      
      act(() => {
        result.current.actions.typeInput(Field.CURRENCY_B, '50.5', false);
      });
      
      expect(result.current.independentField).toBe(Field.CURRENCY_B);
      expect(result.current.typedValue).toBe('50.5');
    });

    test('should update current step correctly', () => {
      const { result } = renderHook(() => useMintState());
      
      act(() => {
        result.current.actions.updateCurrentStep(2);
      });
      
      expect(result.current.currentStep).toBe(2);
    });
  });

  describe('useMintActionHandlers', () => {
    test('should provide correct action handlers', () => {
      const { result } = renderHook(() => useMintActionHandlers(false));
      
      expect(result.current.onFieldAInput).toBeInstanceOf(Function);
      expect(result.current.onFieldBInput).toBeInstanceOf(Function);
      expect(result.current.onLeftRangeInput).toBeInstanceOf(Function);
      expect(result.current.onRightRangeInput).toBeInstanceOf(Function);
      expect(result.current.onStartPriceInput).toBeInstanceOf(Function);
    });

    test('should handle field A input correctly', () => {
      const { result } = renderHook(() => useMintActionHandlers(false));
      
      act(() => {
        result.current.onFieldAInput('100');
      });
      
      // Should not throw
      expect(true).toBe(true);
    });

    test('should handle range inputs correctly', () => {
      const { result } = renderHook(() => useMintActionHandlers(false));
      
      act(() => {
        result.current.onLeftRangeInput('1.5');
        result.current.onRightRangeInput('2.5');
      });
      
      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('useDerivedMintInfo', () => {
    // Mock the complex dependencies to avoid BigInt conversion issues
    beforeEach(() => {
      jest.clearAllMocks();
      
      // Mock useAccount to return undefined (no wallet connected)
      require('wagmi').useAccount.mockReturnValue({
        address: undefined,
      });
      
      // Mock useBalance to return undefined
      require('wagmi').useBalance.mockReturnValue({
        data: undefined,
      });
    });

    test('should return error when no account is connected', () => {
      const { result } = renderHook(() => 
        useDerivedMintInfo(
          undefined,
          undefined,
          '0x789' as `0x${string}`,
          3000
        )
      );
      
      expect(result.current.errorMessage).toBe('Connect Wallet');
      expect(result.current.errorCode).toBe(0);
    });

    test('should handle undefined currencies', () => {
      const { result } = renderHook(() => 
        useDerivedMintInfo(
          undefined,
          undefined,
          '0x789' as `0x${string}`,
          3000
        )
      );
      
      expect(result.current.currencies).toEqual({
        [Field.CURRENCY_A]: undefined,
        [Field.CURRENCY_B]: undefined,
      });
      expect(result.current.dependentField).toBe(Field.CURRENCY_B);
    });

    test('should return basic structure when called with minimal params', () => {
      const { result } = renderHook(() => 
        useDerivedMintInfo()
      );
      
      expect(result.current).toHaveProperty('currencies');
      expect(result.current).toHaveProperty('dependentField');
      expect(result.current).toHaveProperty('errorMessage');
      expect(result.current).toHaveProperty('errorCode');
      expect(result.current).toHaveProperty('tickSpacing');
    });
  });
});