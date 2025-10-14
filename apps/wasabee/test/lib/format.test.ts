import {
  amountFormatted,
  truncate,
  formatAmount,
  formatLargeNumber,
  formatExtremelyLargeNumber,
  shortenAddress,
} from '../../lib/format';
// @/lib/format

import BigNumber from 'bignumber.js';

describe('Format Utilities', () => {
  describe('Positive Tests', () => {
    test('amountFormatted should format amounts correctly', () => {
      expect(amountFormatted('1234567890123456789', { decimals: 18 })).toBe(
        '1.234567'
      );
      expect(amountFormatted('1000000', { decimals: 6 })).toBe('1');
      expect(amountFormatted(new BigNumber('123456789'), { decimals: 8 })).toBe(
        '1.234567'
      );
    });

    test('amountFormatted should handle prefix and symbol', () => {
      expect(
        amountFormatted(1000000, { decimals: 6, prefix: '$', symbol: ' USD' })
      ).toBe('$1 USD');
      expect(amountFormatted(500000, { decimals: 6, symbol: ' USDC' })).toBe(
        '0.5 USDC'
      );
    });

    test('truncate should truncate strings correctly', () => {
      expect(truncate('0x1234567890123456789012345678901234567890', 10)).toBe(
        '0x123...67890'
      );
      expect(truncate('short', 10)).toBe('short');
      expect(truncate('exactly10c', 10)).toBe('exactly10c');
    });

    test('formatAmount should format amounts correctly', () => {
      expect(formatAmount(1.234567)).toEqual({ start: '1.234567' });
      expect(formatAmount(0.000001234)).toEqual({
        start: '0.0',
        zeroCount: 5,
        end: '1234',
      });
      expect(formatAmount(0)).toEqual({ start: '0' });
    });

    test('formatLargeNumber should format large numbers correctly', () => {
      expect(formatLargeNumber(1000)).toBe('1.00K');
      expect(formatLargeNumber(1000000)).toBe('1.00M');
      expect(formatLargeNumber(1000000000)).toBe('1.00B');
      expect(formatLargeNumber(new BigNumber('1000000000000'))).toBe('1.00T');
    });

    test('shortenAddress should format addresses correctly', () => {
      const address = '0x1234567890123456789012345678901234567890';
      expect(shortenAddress(address as `0x${string}`)).toBe('0x1234...7890');
    });
  });

  describe('Negative Tests', () => {
    test('amountFormatted should handle invalid inputs', () => {
      expect(amountFormatted(undefined)).toBe('-');
      expect(amountFormatted(null)).toBe('-');
      expect(amountFormatted('')).toBe('-');
      expect(amountFormatted(0)).toBe('-');
    });

    test('formatExtremelyLargeNumber should handle invalid inputs', () => {
      expect(formatExtremelyLargeNumber('NaN')).toBe('NaN');
      expect(formatExtremelyLargeNumber('Infinity')).toBe('Infinity');
      expect(formatExtremelyLargeNumber('-Infinity')).toBe('-Infinity');
    });

    test('shortenAddress should handle invalid addresses', () => {
      expect(() => shortenAddress('' as `0x${string}`)).toThrow(
        'Invalid EVM address'
      );
      expect(() => shortenAddress('0x123' as `0x${string}`)).toThrow(
        'Invalid EVM address'
      );
      expect(() => shortenAddress('invalid' as `0x${string}`)).toThrow(
        'Invalid EVM address'
      );
    });

    test('formatAmount should handle invalid inputs', () => {
      expect(formatAmount(undefined)).toEqual({ start: '' });
      expect(formatAmount(null)).toEqual({ start: '' });
      expect(formatAmount('')).toEqual({ start: '' });
    });

    test('truncate should handle edge cases', () => {
      expect(truncate('', 5)).toBe('');
      expect(truncate('a', 5)).toBe('a');
    });
  });

  describe('Edge Case Tests', () => {
    test('amountFormatted should handle very small numbers', () => {
      expect(amountFormatted('1', { decimals: 18, fixed: 6 })).toBe(
        '<0.000001'
      );
      expect(amountFormatted('100', { decimals: 18, fixed: 4 })).toBe(
        '<0.0001'
      );
    });

    test('formatLargeNumber should handle different decimals', () => {
      expect(formatLargeNumber(1234, 1)).toBe('1.2K');
      expect(formatLargeNumber(1234567, 3)).toBe('1.235M');
      expect(formatLargeNumber(999)).toBe('999.00');
    });

    test('formatExtremelyLargeNumber should handle prefix option', () => {
      expect(formatExtremelyLargeNumber(1000, 2, { addPrefix: true })).toBe(
        '$1.00K'
      );
      expect(formatExtremelyLargeNumber(1000, 2, { addPrefix: false })).toBe(
        '1.00K'
      );
      expect(formatExtremelyLargeNumber(500, 1, { addPrefix: true })).toBe(
        '$500.0'
      );
    });

    test('formatAmount should handle very small decimals', () => {
      const result = formatAmount(0.00000123);
      expect(result).toHaveProperty('start');
      if ('zeroCount' in result) {
        expect(result).toHaveProperty('zeroCount');
        expect(result).toHaveProperty('end');
      }
    });

    test('truncate should handle exact length', () => {
      expect(truncate('0x123456', 6)).toBe('0x1...456');
      expect(truncate('0x1234567', 6)).toBe('0x1...567');
    });

    test('amountFormatted should handle BigNumber inputs', () => {
      const bigNum = new BigNumber('1234567890123456789');
      expect(amountFormatted(bigNum, { decimals: 18 })).toBe('1.234567');
    });

    test('formatLargeNumber should handle string inputs', () => {
      expect(formatLargeNumber('1000000')).toBe('1.00M');
      expect(formatLargeNumber('999')).toBe('999.00');
    });

    test('formatExtremelyLargeNumber should handle zero', () => {
      expect(formatExtremelyLargeNumber(0)).toBe('$0.00');
      expect(formatExtremelyLargeNumber('0')).toBe('$0.00');
    });

    test('amountFormatted should handle custom fixed precision', () => {
      expect(amountFormatted(1000000, { decimals: 6, fixed: 2 })).toBe('1');
      expect(amountFormatted(1234567, { decimals: 6, fixed: 4 })).toBe(
        '1.2345'
      );
    });

    test('formatExtremelyLargeNumber should handle $ prefix in input', () => {
      expect(formatExtremelyLargeNumber('$1000')).toBe('$1.00K');
      expect(formatExtremelyLargeNumber('$500')).toBe('$500.00');
    });
  });
});
