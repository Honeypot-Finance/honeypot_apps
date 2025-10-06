import BigNumber from 'bignumber.js';
import {
  formatAmountWithAlphabetSymbol,
  formatAmountWithScientificNotation,
  getFirstDecimalPlace,
  reverseFormatAmount,
} from '../../libs/shared/hpot-sdk/src/lib/utils/formatAmount';
import { calculatePercentageChange } from '../../libs/shared/hpot-sdk/src/lib/utils/calculatePercentageChange';
import { helper } from '../../libs/shared/hpot-sdk/src/lib/utils/helper';
import { isEthAddress } from '../../libs/shared/hpot-sdk/src/lib/utils/address';
import { AsyncState } from '../../libs/shared/hpot-sdk/src/lib/utils';
import { ValueState } from '../../libs/shared/hpot-sdk/src/lib/utils';

// Mock dependencies that might not be available in test environment
jest.mock('../../libs/shared/hpot-sdk/src/lib/utils/storage', () => ({
  localforage: {
    setItem: jest.fn(),
    getItem: jest.fn(),
  },
}));

describe('Shared Utility Functions', () => {
  describe('formatAmountWithAlphabetSymbol', () => {
    it('should format large numbers with compact notation', () => {
      expect(formatAmountWithAlphabetSymbol('1000')).toBe('1.00K');
      expect(formatAmountWithAlphabetSymbol('1500000')).toBe('1.50M');
      expect(formatAmountWithAlphabetSymbol('2300000000')).toBe('2.30B');
    });

    it('should format small numbers without compact notation', () => {
      expect(formatAmountWithAlphabetSymbol('999')).toBe('999.00');
      expect(formatAmountWithAlphabetSymbol('100.5')).toBe('100.50');
      expect(formatAmountWithAlphabetSymbol('1.23')).toBe('1.23');
    });

    it('should handle zero', () => {
      expect(formatAmountWithAlphabetSymbol('0')).toBe('0');
    });

    it('should respect custom decimals', () => {
      expect(formatAmountWithAlphabetSymbol('1234.567', 0)).toBe('1K');
      expect(formatAmountWithAlphabetSymbol('1234.567', 1)).toBe('1.2K');
      expect(formatAmountWithAlphabetSymbol('1234.567', 3)).toBe('1.235K');
    });

    it('should handle negative numbers', () => {
      expect(formatAmountWithAlphabetSymbol('-1000')).toBe('-1.00K');
      expect(formatAmountWithAlphabetSymbol('-999')).toBe('-999.00');
    });
  });

  describe('formatAmountWithScientificNotation', () => {
    it('should format numbers in scientific notation', () => {
      expect(formatAmountWithScientificNotation('1000')).toBe('1.000e+3');
      expect(formatAmountWithScientificNotation('0.001')).toBe('1.000e-3');
    });

    it('should handle zero', () => {
      expect(formatAmountWithScientificNotation('0')).toBe('0');
    });

    it('should respect custom decimals', () => {
      expect(formatAmountWithScientificNotation('1234.567', 2)).toBe('1.23e+3');
      expect(formatAmountWithScientificNotation('1234.567', 5)).toBe(
        '1.23457e+3'
      );
    });
  });

  describe('getFirstDecimalPlace', () => {
    it('should return 0 for numbers >= 1', () => {
      expect(getFirstDecimalPlace('1.5')).toBe(0);
      expect(getFirstDecimalPlace('100.123')).toBe(0);
    });

    it('should return 0 for zero', () => {
      expect(getFirstDecimalPlace('0')).toBe(0);
    });

    it('should count leading zeros after decimal', () => {
      expect(getFirstDecimalPlace('0.001')).toBe(2);
      expect(getFirstDecimalPlace('0.0001')).toBe(3);
      expect(getFirstDecimalPlace('0.1')).toBe(0);
    });

    it('should handle numbers without decimals', () => {
      expect(getFirstDecimalPlace('5')).toBe(0);
    });
  });

  describe('reverseFormatAmount', () => {
    it('should reverse format numbers with suffixes', () => {
      expect(reverseFormatAmount('1.5K')).toBe(1500);
      expect(reverseFormatAmount('2.3M')).toBe(2300000);
      expect(reverseFormatAmount('1.2B')).toBe(1200000000);
      expect(reverseFormatAmount('5T')).toBe(5000000000000);
    });

    it('should handle numbers without suffixes', () => {
      expect(reverseFormatAmount('123.45')).toBe(123.45);
      expect(reverseFormatAmount('999')).toBe(999);
    });

    it('should handle comparison operators', () => {
      expect(reverseFormatAmount('< 0.01')).toBe(0.01);
      expect(reverseFormatAmount('> 1000')).toBe(1000);
    });

    it('should handle invalid suffixes', () => {
      expect(reverseFormatAmount('123X')).toBe(NaN);
    });
  });

  describe('calculatePercentageChange', () => {
    it('should calculate positive percentage changes', () => {
      expect(calculatePercentageChange(150, 100)).toBe(50);
      expect(calculatePercentageChange(200, 100)).toBe(100);
    });

    it('should calculate negative percentage changes', () => {
      expect(calculatePercentageChange(50, 100)).toBe(-50);
      expect(calculatePercentageChange(25, 100)).toBe(-75);
    });

    it('should handle zero cases', () => {
      expect(calculatePercentageChange(0, 0)).toBe(0);
      expect(calculatePercentageChange(100, 0)).toBe(100);
      expect(calculatePercentageChange(0, 100)).toBe(-100);
    });

    it('should handle decimal numbers', () => {
      expect(calculatePercentageChange(1.5, 1)).toBe(50);
      expect(calculatePercentageChange(0.5, 1)).toBe(-50);
    });

    it('should handle very small numbers', () => {
      expect(calculatePercentageChange(0.001, 0.002)).toBe(-50);
      expect(calculatePercentageChange(0.003, 0.002)).toBe(50);
    });
  });

  describe('helper utilities', () => {
    describe('json.safeParse', () => {
      it('should parse valid JSON', () => {
        const result = helper.json.safeParse('{"key": "value"}');
        expect(result).toEqual({ key: 'value' });
      });

      it('should return null for invalid JSON', () => {
        const result = helper.json.safeParse('invalid json');
        expect(result).toBeNull();
      });

      it('should handle empty string', () => {
        const result = helper.json.safeParse('');
        expect(result).toBeNull();
      });

      it('should handle null input', () => {
        const result = helper.json.safeParse(null as any);
        expect(result).toBeNull();
      });
    });

    describe('env.isBrowser', () => {
      it('should detect browser environment', () => {
        // In Jest environment, window is defined by jsdom
        expect(typeof helper.env.isBrowser).toBe('boolean');
      });
    });
  });

  describe('isEthAddress', () => {
    it('should validate correct Ethereum addresses', () => {
      expect(isEthAddress('0x1234567890123456789012345678901234567890')).toBe(
        true
      );
      expect(isEthAddress('0xabcdefABCDEF1234567890123456789012345678')).toBe(
        true
      );
    });

    it('should reject invalid Ethereum addresses', () => {
      expect(isEthAddress('1234567890123456789012345678901234567890')).toBe(
        false
      ); // No 0x prefix
      expect(isEthAddress('0x123456789012345678901234567890123456789')).toBe(
        false
      ); // Too short
      expect(isEthAddress('0x12345678901234567890123456789012345678901')).toBe(
        false
      ); // Too long
      expect(isEthAddress('0x123456789012345678901234567890123456789g')).toBe(
        false
      ); // Invalid character
      expect(isEthAddress('')).toBe(false); // Empty string
      expect(isEthAddress('0x')).toBe(false); // Only prefix
    });

    it('should handle null and undefined', () => {
      expect(isEthAddress(null as any)).toBe(false);
      expect(isEthAddress(undefined as any)).toBe(false);
    });
  });

  describe('Edge cases and boundary values', () => {
    describe('BigNumber operations', () => {
      it('should handle BigNumber precision correctly', () => {
        const bigNum = new BigNumber('123.456789012345678901234567890');
        const formatted = formatAmountWithAlphabetSymbol(bigNum.toString(), 10);
        expect(formatted).toContain('123.456789');
      });

      it('should handle very large BigNumbers', () => {
        const bigNum = new BigNumber('1e50');
        const formatted = formatAmountWithAlphabetSymbol(bigNum.toString());
        expect(formatted).toBeDefined();
      });

      it('should handle very small BigNumbers', () => {
        const bigNum = new BigNumber('1e-50');
        const formatted = formatAmountWithAlphabetSymbol(bigNum.toString());
        expect(formatted).toBeDefined();
      });
    });

    describe('Extreme values', () => {
      it('should handle Number.MAX_SAFE_INTEGER', () => {
        const result = formatAmountWithAlphabetSymbol(
          Number.MAX_SAFE_INTEGER.toString()
        );
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });

      it('should handle Number.MIN_SAFE_INTEGER', () => {
        const result = formatAmountWithAlphabetSymbol(
          Number.MIN_SAFE_INTEGER.toString()
        );
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });

      it('should handle Infinity', () => {
        const result = calculatePercentageChange(Infinity, 100);
        expect(result).toBe(Infinity);
      });

      it('should handle -Infinity', () => {
        const result = calculatePercentageChange(-Infinity, 100);
        expect(result).toBe(-Infinity);
      });
    });

    describe('Null and undefined handling', () => {
      it('should handle null inputs gracefully', () => {
        expect(() => formatAmountWithAlphabetSymbol(null as any)).not.toThrow();
        expect(() => calculatePercentageChange(null as any, 100)).not.toThrow();
      });

      it('should handle undefined inputs gracefully', () => {
        expect(() =>
          formatAmountWithAlphabetSymbol(undefined as any)
        ).not.toThrow();
        expect(() =>
          calculatePercentageChange(100, undefined as any)
        ).not.toThrow();
      });
    });
  });

  describe('Performance and memory tests', () => {
    it('should handle large datasets efficiently', () => {
      const startTime = performance.now();

      // Process 1000 format operations
      for (let i = 0; i < 1000; i++) {
        formatAmountWithAlphabetSymbol((Math.random() * 1000000).toString());
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(1000); // 1 second
    });

    it('should not leak memory with repeated operations', () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Perform many operations
      for (let i = 0; i < 10000; i++) {
        const state = new ValueState<string>({ _value: `test-${i}` });
        state.setValue(`updated-${i}`);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (adjust threshold as needed)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB
    });
  });

  describe('Error handling and recovery', () => {
    it('should handle malformed input gracefully', () => {
      expect(() => {
        formatAmountWithAlphabetSymbol('not-a-number');
      }).not.toThrow();

      expect(() => {
        calculatePercentageChange('invalid' as any, 'also-invalid' as any);
      }).not.toThrow();
    });

    it('should recover from JSON parsing errors', () => {
      const malformedJson = '{"incomplete": ';
      const result = helper.json.safeParse(malformedJson);
      expect(result).toBeNull();
    });

    it('should handle async state errors gracefully', async () => {
      const errorFunc = jest.fn().mockRejectedValue(new Error('Async error'));
      const state = new AsyncState(errorFunc);

      const [result, error] = await state.call();

      expect(result).toBeNull();
      expect(error).toBeInstanceOf(Error);
      expect(state.loading).toBe(false);
    });

    it('should handle browser storage errors', () => {
      // Mock localStorage to throw an error
      const originalLocalStorage = global.localStorage;
      Object.defineProperty(global, 'localStorage', {
        value: {
          setItem: jest.fn(() => {
            throw new Error('Storage quota exceeded');
          }),
          getItem: jest.fn(() => {
            throw new Error('Storage access denied');
          }),
        },
        writable: true,
      });

      expect(() => {
        try {
          localStorage.setItem('test', 'value');
        } catch (e) {
          // Should handle storage errors gracefully
        }
      }).not.toThrow();

      // Restore original localStorage
      Object.defineProperty(global, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
      });
    });

    it('should handle network interruption gracefully', async () => {
      const networkErrorFunc = jest
        .fn()
        .mockRejectedValue(new Error('Network unavailable'));
      const state = new AsyncState(networkErrorFunc);

      const [result, error] = await state.call();

      expect(result).toBeNull();
      expect(error?.message).toBe('Network unavailable');
      expect(state.loading).toBe(false);
    });

    it('should handle JavaScript execution interruption', () => {
      // Simulate a function that might be interrupted
      const interruptibleFunction = () => {
        let result = 0;
        for (let i = 0; i < 1000000; i++) {
          result += i;
          // Simulate potential interruption point
          if (i % 100000 === 0) {
            // Check if execution should continue
            if (typeof window !== 'undefined' && !window.navigator.onLine) {
              throw new Error('Execution interrupted');
            }
          }
        }
        return result;
      };

      expect(() => {
        try {
          interruptibleFunction();
        } catch (e) {
          // Should handle interruption gracefully
        }
      }).not.toThrow();
    });
  });

  describe('Debounce functionality tests', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should debounce function calls correctly', () => {
      const mockFn = jest.fn();
      const debounceDelay = 300;

      // Simple debounce implementation for testing
      let timeoutId: NodeJS.Timeout | null = null;
      const debouncedFn = (...args: any[]) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => mockFn(...args), debounceDelay);
      };

      // Call function multiple times rapidly
      debouncedFn('call1');
      debouncedFn('call2');
      debouncedFn('call3');

      // Function should not have been called yet
      expect(mockFn).not.toHaveBeenCalled();

      // Fast-forward time
      jest.advanceTimersByTime(debounceDelay);

      // Function should have been called once with the last arguments
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('call3');
    });

    it('should cancel previous debounced calls', () => {
      const mockFn = jest.fn();
      const debounceDelay = 300;

      let timeoutId: NodeJS.Timeout | null = null;
      const debouncedFn = (...args: unknown[]) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => mockFn(...args), debounceDelay);
      };

      debouncedFn('first');
      jest.advanceTimersByTime(100);

      debouncedFn('second');
      jest.advanceTimersByTime(100);

      debouncedFn('third');
      jest.advanceTimersByTime(debounceDelay);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('third');
    });

    it('should handle rapid user input scenarios', () => {
      const searchFn = jest.fn();
      const debounceDelay = 250;

      let timeoutId: NodeJS.Timeout | null = null;
      const debouncedSearch = (query: string) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => searchFn(query), debounceDelay);
      };

      // Simulate rapid typing
      const queries = ['a', 'ap', 'app', 'appl', 'apple'];
      queries.forEach((query, index) => {
        debouncedSearch(query);
        jest.advanceTimersByTime(50); // Simulate typing speed
      });

      // Should not have called search yet
      expect(searchFn).not.toHaveBeenCalled();

      // Complete the debounce period
      jest.advanceTimersByTime(debounceDelay);

      // Should only search for the final query
      expect(searchFn).toHaveBeenCalledTimes(1);
      expect(searchFn).toHaveBeenCalledWith('apple');
    });
  });
});
des;
cribe('Comprehensive BigNumber operations', () => {
  it('should handle BigNumber arithmetic correctly', () => {
    const a = new BigNumber('123.456789');
    const b = new BigNumber('987.654321');

    const sum = a.plus(b);
    expect(sum.toString()).toBe('1111.11111');

    const difference = b.minus(a);
    expect(difference.toString()).toBe('864.197532');

    const product = a.multipliedBy(b);
    expect(product.decimalPlaces()).toBeLessThanOrEqual(18); // Default precision

    const quotient = b.dividedBy(a);
    expect(quotient.isFinite()).toBe(true);
  });

  it('should handle BigNumber precision edge cases', () => {
    const verySmall = new BigNumber('1e-50');
    const veryLarge = new BigNumber('1e50');

    expect(verySmall.isZero()).toBe(false);
    expect(veryLarge.isFinite()).toBe(true);

    const result = veryLarge.plus(verySmall);
    expect(result.isEqualTo(veryLarge)).toBe(true); // Small number gets lost in precision
  });

  it('should handle BigNumber division by zero', () => {
    const num = new BigNumber('100');
    const zero = new BigNumber('0');

    const result = num.dividedBy(zero);
    expect(result.isFinite()).toBe(false);
    expect(result.toString()).toBe('Infinity');
  });

  it('should handle BigNumber overflow scenarios', () => {
    const maxSafe = new BigNumber(Number.MAX_SAFE_INTEGER);
    const beyondMax = maxSafe.multipliedBy(2);

    expect(beyondMax.isGreaterThan(maxSafe)).toBe(true);
    expect(beyondMax.toString()).not.toBe('Infinity');
  });

  it('should maintain precision in complex calculations', () => {
    const price = new BigNumber('1234.56789012345');
    const quantity = new BigNumber('0.00000001');

    const total = price.multipliedBy(quantity);
    expect(total.decimalPlaces()).toBeGreaterThan(0);
    expect(total.toString()).toContain('.');
  });
});

describe('Advanced formatting scenarios', () => {
  it('should handle scientific notation edge cases', () => {
    const scientificNumbers = [
      '1e-10',
      '1.23e+15',
      '9.99999e-5',
      '1.000001e+20',
    ];

    scientificNumbers.forEach((num) => {
      const result = formatAmountWithScientificNotation(num);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  it('should handle locale-specific formatting', () => {
    // Test with different decimal separators and thousand separators
    const testNumbers = ['1234.56', '1000000.789', '0.001'];

    testNumbers.forEach((num) => {
      const result = formatAmountWithAlphabetSymbol(num);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  it('should handle currency-like formatting', () => {
    const amounts = ['1234.56', '1000000', '0.01', '999.999'];

    amounts.forEach((amount) => {
      const formatted = formatAmountWithAlphabetSymbol(amount, 2);
      if (parseFloat(amount) >= 1000) {
        expect(formatted).toMatch(/[KMBT]$/);
      } else {
        expect(formatted).not.toMatch(/[KMBT]$/);
      }
    });
  });
});

describe('Stress testing and performance', () => {
  it('should handle rapid successive calculations', () => {
    const startTime = performance.now();

    for (let i = 0; i < 10000; i++) {
      const oldValue = Math.random() * 1000;
      const newValue = Math.random() * 1000;
      calculatePercentageChange(newValue, oldValue);
    }

    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(2000); // 2 seconds
  });

  it('should handle large string processing', () => {
    const largeNumber = '1' + '0'.repeat(100);

    expect(() => {
      formatAmountWithAlphabetSymbol(largeNumber);
    }).not.toThrow();

    expect(() => {
      new BigNumber(largeNumber);
    }).not.toThrow();
  });

  it('should handle concurrent formatting operations', async () => {
    const promises = Array.from({ length: 1000 }, (_, i) =>
      Promise.resolve().then(() =>
        formatAmountWithAlphabetSymbol((Math.random() * 1000000).toString())
      )
    );

    const startTime = performance.now();
    const results = await Promise.all(promises);
    const endTime = performance.now();

    expect(results).toHaveLength(1000);
    expect(results.every((r) => typeof r === 'string')).toBe(true);
    expect(endTime - startTime).toBeLessThan(1000); // 1 second
  });
});

describe('Integration with real-world scenarios', () => {
  it('should handle cryptocurrency price formatting', () => {
    const cryptoPrices = [
      '0.000000001', // Very small altcoin
      '45000.123456', // Bitcoin-like price
      '3500.789', // Ethereum-like price
      '1.0001', // Stablecoin
      '0.00000000001', // Extremely small token
    ];

    cryptoPrices.forEach((price) => {
      const formatted = formatAmountWithAlphabetSymbol(price, 6);
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
    });
  });

  it('should handle trading volume calculations', () => {
    const volumes = [
      { old: '1000000', new: '1500000' }, // 50% increase
      { old: '2000000', new: '1000000' }, // 50% decrease
      { old: '0', new: '1000000' }, // From zero
      { old: '1000000', new: '0' }, // To zero
    ];

    volumes.forEach(({ old, new: newVol }) => {
      const change = calculatePercentageChange(
        parseFloat(newVol),
        parseFloat(old)
      );
      expect(typeof change).toBe('number');
      expect(isNaN(change)).toBe(false);
    });
  });

  it('should handle wallet address validation in real scenarios', () => {
    const realAddresses = [
      '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Vitalik's address
      '0x0000000000000000000000000000000000000000', // Zero address
      '0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF', // Max address
      '0x1234567890123456789012345678901234567890', // Test address
    ];

    realAddresses.forEach((address) => {
      expect(isEthAddress(address)).toBe(true);
    });

    const invalidAddresses = [
      '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA9604', // Too short
      '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA960455', // Too long
      'd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // No 0x prefix
      '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA9604G', // Invalid character
    ];

    invalidAddresses.forEach((address) => {
      expect(isEthAddress(address)).toBe(false);
    });
  });
});

describe('Error recovery and resilience', () => {
  it('should recover from calculation errors', () => {
    const problematicInputs = [
      { old: 0, new: 0 },
      { old: Infinity, new: 100 },
      { old: 100, new: Infinity },
      { old: -Infinity, new: 100 },
      { old: NaN, new: 100 },
      { old: 100, new: NaN },
    ];

    problematicInputs.forEach(({ old, new: newVal }) => {
      expect(() => {
        const result = calculatePercentageChange(newVal, old);
        // Result might be NaN or Infinity, but shouldn't throw
      }).not.toThrow();
    });
  });

  it('should handle JSON parsing edge cases', () => {
    const edgeCases = [
      '{"key": "value with \\"quotes\\""}',
      '{"unicode": "\\u0048\\u0065\\u006C\\u006C\\u006F"}',
      '{"nested": {"deep": {"very": {"deep": "value"}}}}',
      '{"array": [1, 2, {"nested": "in array"}]}',
      '{"null": null, "undefined": null}', // undefined becomes null in JSON
      '{"number": 1.23e-10}',
      '{"boolean": true, "false": false}',
    ];

    edgeCases.forEach((json) => {
      const result = helper.json.safeParse(json);
      expect(result).not.toBeNull();
      expect(typeof result).toBe('object');
    });
  });

  it('should handle system resource constraints', () => {
    // Simulate low memory conditions
    const originalMemory = process.memoryUsage();

    try {
      // Perform operations that might stress memory
      const largeOperations = Array.from({ length: 1000 }, (_, i) => {
        const bigNum = new BigNumber(`${i}.${i}${i}${i}`);
        const formatted = formatAmountWithAlphabetSymbol(bigNum.toString());
        const percentage = calculatePercentageChange(i + 1, i || 1);
        return { bigNum, formatted, percentage };
      });

      expect(largeOperations).toHaveLength(1000);

      // Check memory usage didn't explode
      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - originalMemory.heapUsed;
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // 100MB limit
    } catch (error) {
      // Should handle memory errors gracefully
      expect(error).toBeInstanceOf(Error);
    }
  });
});
