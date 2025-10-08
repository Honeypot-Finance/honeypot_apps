import {
  useBurnState,
  useDerivedBurnInfo,
  useBurnActionHandlers,
} from '@/lib/algebra/state/burnStore';
import { renderHook, act } from '@testing-library/react';

// Mock dependencies
jest.mock('@/lib/algebra/hooks/common/useCurrency', () => ({
  useCurrency: jest.fn().mockImplementation((address) => {
    if (address === '0x123') {
      return {
        symbol: 'TOKEN0',
        decimals: 18,
        wrapped: {
          address: '0x123',
          symbol: 'TOKEN0',
          decimals: 18,
        },
      };
    }
    if (address === '0x456') {
      return {
        symbol: 'TOKEN1',
        decimals: 6,
        wrapped: {
          address: '0x456',
          symbol: 'TOKEN1',
          decimals: 6,
        },
      };
    }
    return null;
  }),
}));

jest.mock('@/lib/algebra/hooks/pools/usePool', () => ({
  usePool: jest.fn().mockReturnValue([
    'EXISTS',
    {
      tickCurrent: 100,
      token0: {
        address: '0x123',
        symbol: 'TOKEN0',
        decimals: 18,
      },
      token1: {
        address: '0x456',
        symbol: 'TOKEN1',
        decimals: 6,
      },
    },
  ]),
}));

jest.mock('@/lib/algebra/hooks/positions/usePositionFees', () => ({
  usePositionFees: jest.fn().mockReturnValue({
    amount0: {
      currency: { symbol: 'TOKEN0' },
      quotient: BigInt('1000000000000000000'),
    },
    amount1: {
      currency: { symbol: 'TOKEN1' },
      quotient: BigInt('1000000'),
    },
  }),
}));

jest.mock('wagmi', () => ({
  useAccount: jest.fn().mockReturnValue({
    address: '0x123456789abcdef',
  }),
}));

jest.mock('@cryptoalgebra/sdk', () => ({
  ...jest.requireActual('@cryptoalgebra/sdk'),
  computePoolAddress: jest.fn().mockReturnValue('0x789'),
  Position: jest.fn().mockImplementation((params) => {
    const liquidity = params?.liquidity
      ? BigInt(params.liquidity)
      : BigInt('1000000');
    return {
      liquidity: liquidity,
      tickLower: params?.tickLower || 50,
      tickUpper: params?.tickUpper || 150,
      amount0: {
        quotient:
          liquidity > BigInt(0) ? BigInt('1000000000000000000') : BigInt(0),
      },
      amount1: {
        quotient: liquidity > BigInt(0) ? BigInt('1000000') : BigInt(0),
      },
    };
  }),
  Percent: jest.fn().mockImplementation((numerator, denominator) => ({
    multiply: jest.fn().mockImplementation((value) => ({
      quotient: BigInt(Math.floor((Number(value) * numerator) / denominator)),
    })),
  })),
  CurrencyAmount: {
    fromRawAmount: jest.fn().mockImplementation((currency, amount) => ({
      currency,
      quotient: amount,
    })),
  },
  unwrappedToken: jest.fn().mockImplementation((token) => token),
}));

describe('BurnStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Positive Tests', () => {
    test('should initialize with default state', () => {
      const { result } = renderHook(() => useBurnState());

      expect(result.current.percent).toBe(0);
    });

    test('should select percent correctly', () => {
      const { result } = renderHook(() => useBurnState());

      act(() => {
        result.current.actions.selectPercent(50);
      });

      expect(result.current.percent).toBe(50);
    });

    test('should derive burn info for valid position', () => {
      const mockPosition = {
        token0: '0x123',
        token1: '0x456',
        liquidity: BigInt('1000000'),
        tickLower: 50,
        tickUpper: 150,
        tokenId: '1',
      };

      const { result } = renderHook(() =>
        useDerivedBurnInfo(mockPosition as any)
      );

      expect(result.current.position).toBeDefined();
      expect(result.current.outOfRange).toBe(false); // tickCurrent (100) is between tickLower (50) and tickUpper (150)
    });
  });

  describe('Negative Tests', () => {
    test('should handle undefined position', () => {
      const { result } = renderHook(() => useDerivedBurnInfo(undefined));

      expect(result.current.position).toBeUndefined();
      expect(result.current.liquidityPercentage).toBeDefined(); // liquidityPercentage is always created from percent
      expect(result.current.liquidityValue0).toBeUndefined();
      expect(result.current.liquidityValue1).toBeUndefined();
    });

    test('should return error when wallet not connected', () => {
      // Mock useAccount to return no address
      const useAccountMock = require('wagmi').useAccount;
      useAccountMock.mockReturnValueOnce({ address: undefined });

      const { result } = renderHook(() => useDerivedBurnInfo({} as any));

      expect(result.current.error).toBe('Connect Wallet');
    });

    test('should return error when percent is zero', () => {
      const mockPosition = {
        token0: '0x123',
        token1: '0x456',
        liquidity: BigInt('1000000'),
        tickLower: 50,
        tickUpper: 150,
        tokenId: '1',
      };

      // First ensure percent is 0
      const { result: stateResult } = renderHook(() => useBurnState());
      act(() => {
        stateResult.current.actions.selectPercent(0);
      });

      const { result } = renderHook(() =>
        useDerivedBurnInfo(mockPosition as any)
      );

      expect(result.current.error).toBe('Enter a percent');
    });
  });

  describe('Edge Case Tests', () => {
    test('should handle 100% burn correctly', () => {
      const { result } = renderHook(() => useBurnState());

      act(() => {
        result.current.actions.selectPercent(100);
      });

      expect(result.current.percent).toBe(100);
    });

    test('should detect out of range position', () => {
      // Mock pool with tickCurrent outside position range
      const usePoolMock = require('@/lib/algebra/hooks/pools/usePool').usePool;
      usePoolMock.mockReturnValueOnce([
        'EXISTS',
        {
          tickCurrent: 200, // Outside range [50, 150]
          token0: { address: '0x123', symbol: 'TOKEN0', decimals: 18 },
          token1: { address: '0x456', symbol: 'TOKEN1', decimals: 6 },
        },
      ]);

      const mockPosition = {
        token0: '0x123',
        token1: '0x456',
        liquidity: BigInt('1000000'),
        tickLower: 50,
        tickUpper: 150,
        tokenId: '1',
      };

      const { result } = renderHook(() =>
        useDerivedBurnInfo(mockPosition as any)
      );

      expect(result.current.outOfRange).toBe(true);
    });

    test('should handle asWNative parameter correctly', () => {
      const mockPosition = {
        token0: '0x123',
        token1: '0x456',
        liquidity: BigInt('1000000'),
        tickLower: 50,
        tickUpper: 150,
        tokenId: '1',
      };

      const { result } = renderHook(() =>
        useDerivedBurnInfo(mockPosition as any, true)
      );

      expect(result.current.position).toBeDefined();
      // When asWNative is true, should use wrapped tokens
    });

    test('should handle position with zero liquidity', () => {
      const mockPosition = {
        token0: '0x123',
        token1: '0x456',
        liquidity: BigInt('0'),
        tickLower: 50,
        tickUpper: 150,
        tokenId: '1',
      };

      const { result } = renderHook(() =>
        useDerivedBurnInfo(mockPosition as any)
      );

      // Position with zero liquidity might not be created, but should not crash
      // The hook should handle this gracefully
      expect(result.current.liquidityValue0).toBeUndefined();
      expect(result.current.liquidityValue1).toBeUndefined();
    });
  });

  describe('useBurnActionHandlers', () => {
    test('should provide correct action handlers', () => {
      const { result } = renderHook(() => useBurnActionHandlers());

      expect(result.current.onPercentSelect).toBeInstanceOf(Function);
    });

    test('should handle percent selection correctly', () => {
      const { result: handlersResult } = renderHook(() =>
        useBurnActionHandlers()
      );
      const { result: stateResult } = renderHook(() => useBurnState());

      act(() => {
        handlersResult.current.onPercentSelect(75);
      });

      expect(stateResult.current.percent).toBe(75);
    });

    test('should handle multiple percent selections', () => {
      const { result: handlersResult } = renderHook(() =>
        useBurnActionHandlers()
      );
      const { result: stateResult } = renderHook(() => useBurnState());

      act(() => {
        handlersResult.current.onPercentSelect(25);
      });

      act(() => {
        handlersResult.current.onPercentSelect(50);
      });

      act(() => {
        handlersResult.current.onPercentSelect(100);
      });

      expect(stateResult.current.percent).toBe(100);
    });
  });
});
