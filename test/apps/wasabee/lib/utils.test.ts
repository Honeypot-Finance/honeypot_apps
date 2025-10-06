import BigNumber from 'bignumber.js';
import {
  formatNumberWithUnit,
  calculatePercentageChange,
  ethAddressUtils,
  shortenAddressString,
  formatVolume,
  hasValue,
  removeEmptyFields,
  getTextSizeClass,
} from '@wasabee/lib/utils';

import { formatExtremelyLargeNumber } from '@wasabee/lib/format';

describe('Wasabee Utility Functions', () => {
  describe('formatNumberWithUnit', () => {
    it('formats with units correctly', () => {
      expect(formatNumberWithUnit(1000)).toBe('1k');
      expect(formatNumberWithUnit(1500)).toBe('1.5k');
      expect(formatNumberWithUnit(1_000_000)).toBe('1M');
      expect(formatNumberWithUnit(1_500_000)).toBe('1.5M');
      expect(formatNumberWithUnit(1_000_000_000)).toBe('1B');
      expect(formatNumberWithUnit(1_500_000_000)).toBe('1.5B');
      expect(formatNumberWithUnit(1_000_000_000_000)).toBe('1T');
      expect(formatNumberWithUnit(1_500_000_000_000)).toBe('1.5T');
    });

    it('handles values under 1000 without units', () => {
      expect(formatNumberWithUnit(999)).toBe('999');
      expect(formatNumberWithUnit(100)).toBe('100');
      expect(formatNumberWithUnit(1)).toBe('1');
      expect(formatNumberWithUnit(0)).toBe('0');
    });

    it('handles decimals', () => {
      expect(formatNumberWithUnit(1234.567)).toBe('1.23k');
      expect(formatNumberWithUnit(1999.999)).toBe('2k');
      expect(formatNumberWithUnit(999.99)).toBe('999.99');
    });

    it('respects custom decimals', () => {
      expect(formatNumberWithUnit(1234.567, 0)).toBe('1k');
      expect(formatNumberWithUnit(1234.567, 1)).toBe('1.2k');
      expect(formatNumberWithUnit(1234.567, 3)).toBe('1.235k');
    });

    it('handles small numbers', () => {
      expect(formatNumberWithUnit(0.01)).toBe('0.01');
      expect(formatNumberWithUnit(0.001)).toBe('<0.01');
      expect(formatNumberWithUnit(0.005, 3)).toBe('0.005');
    });

    it('handles edge cases', () => {
      expect(formatNumberWithUnit(NaN)).toBe('NaN');
      expect(formatNumberWithUnit(Infinity)).toBe('Infinity');
      expect(formatNumberWithUnit(-1000)).toBe('-1k');
    });
  });

  describe('formatExtremelyLargeNumber', () => {
    it('formats with prefix by default', () => {
      expect(formatExtremelyLargeNumber(1000)).toBe('$1.00K');
      expect(formatExtremelyLargeNumber(1500000)).toBe('$1.50M');
      expect(formatExtremelyLargeNumber(2300000000)).toBe('$2.30B');
    });

    it('respects addPrefix = false', () => {
      expect(formatExtremelyLargeNumber(1000, 2, { addPrefix: false })).toBe('1.00K');
      expect(formatExtremelyLargeNumber(1500000, 2, { addPrefix: false })).toBe('1.50M');
    });

    it('handles string inputs with prefix', () => {
      expect(formatExtremelyLargeNumber('1000')).toBe('$1.00K');
      expect(formatExtremelyLargeNumber('1500000')).toBe('$1.50M');
    });

    it('handles BigNumber', () => {
      expect(formatExtremelyLargeNumber(new BigNumber(1000))).toBe('$1.00K');
      expect(formatExtremelyLargeNumber(new BigNumber(1500000))).toBe('$1.50M');
    });

    it('respects decimals', () => {
      expect(formatExtremelyLargeNumber(1234567, 0)).toBe('$1M');
      expect(formatExtremelyLargeNumber(1234567, 1)).toBe('$1.2M');
      expect(formatExtremelyLargeNumber(1234567, 3)).toBe('$1.235M');
    });

    it('handles small values', () => {
      expect(formatExtremelyLargeNumber(0)).toBe('$0.00');
      expect(formatExtremelyLargeNumber(999)).toBe('$999.00');
      expect(formatExtremelyLargeNumber(100.5)).toBe('$100.50');
    });

    it('handles negatives', () => {
      expect(formatExtremelyLargeNumber(-1000)).toBe('$-1000.00');
      expect(formatExtremelyLargeNumber(-1500000)).toBe('$-1500000.00');
    });

    it('handles invalid inputs gracefully', () => {
      expect(formatExtremelyLargeNumber(NaN)).toBe('NaN');
      expect(formatExtremelyLargeNumber(Infinity)).toBe('Infinity');
      expect(formatExtremelyLargeNumber(-Infinity)).toBe('-Infinity');
    });
  });

  describe('calculatePercentageChange', () => {
    it('calculates increases', () => {
      expect(calculatePercentageChange(150, 100)).toBe(50);
      expect(calculatePercentageChange(200, 100)).toBe(100);
    });

    it('calculates decreases', () => {
      expect(calculatePercentageChange(50, 100)).toBe(-50);
    });

    it('handles zero cases', () => {
      expect(calculatePercentageChange(0, 0)).toBe(0);
      expect(calculatePercentageChange(100, 0)).toBe(100);
      expect(calculatePercentageChange(0, 100)).toBe(-100);
    });

    it('handles edge cases', () => {
      expect(calculatePercentageChange(NaN, 100)).toBeNaN();
      expect(calculatePercentageChange(100, NaN)).toBeNaN();
      expect(calculatePercentageChange(Infinity, 100)).toBe(Infinity);
    });
  });

  describe('ethAddressUtils', () => {
    it('adds 0x prefix', () => {
      expect(ethAddressUtils('abc123')).toBe('0xabc123');
    });
    
    it('leaves prefixed address unchanged', () => {
      expect(ethAddressUtils('0xabc123')).toBe('0xabc123');
    });

    it('handles empty string', () => {
      expect(ethAddressUtils('')).toBe('0x');
    });
  });

  describe('shortenAddressString', () => {
    it('shortens addresses', () => {
      expect(shortenAddressString('0x1234567890abcdef')).toBe('0x1234...cdef');
    });

    it('handles custom character count', () => {
      expect(shortenAddressString('0x1234567890abcdef', 6)).toBe('0x123456...90abcdef');
    });

    it('handles empty/null addresses', () => {
      expect(shortenAddressString('')).toBe('');
      expect(shortenAddressString(null as any)).toBe('');
    });
  });

  describe('formatVolume', () => {
    it('formats with K, M, B', () => {
      expect(formatVolume(1000)).toBe('$1.00K');
      expect(formatVolume(1_000_000)).toBe('$1.00M');
      expect(formatVolume(1_000_000_000)).toBe('$1.00B');
    });

    it('handles small values', () => {
      expect(formatVolume(999)).toBe('$999.00');
      expect(formatVolume(0)).toBe('$0.00');
    });

    it('handles decimals', () => {
      expect(formatVolume(1234.567)).toBe('$1.23K');
    });
  });

  describe('getTextSizeClass', () => {
    it('returns correct class for text length', () => {
      expect(getTextSizeClass('')).toContain('text-2xl');
      expect(getTextSizeClass('hello')).toContain('text-2xl');
      expect(getTextSizeClass('helloworld')).toContain('text-xl');
      expect(getTextSizeClass('helloworldlong')).toContain('text-base');
    });

    it('handles null/undefined', () => {
      expect(getTextSizeClass(null)).toContain('text-2xl');
      expect(getTextSizeClass(undefined)).toContain('text-2xl');
    });
  });

  describe('removeEmptyFields', () => {
    it('removes null/undefined/empty fields', () => {
      const input = { a: null, b: '', c: { d: null, e: 1 } };
      expect(removeEmptyFields(input)).toEqual({ c: { e: 1 } });
    });

    it('handles nested objects', () => {
      const input = { 
        a: { x: 1, y: null }, 
        b: { z: '' }, 
        c: { w: 'valid' } 
      };
      expect(removeEmptyFields(input)).toEqual({ 
        a: { x: 1 }, 
        c: { w: 'valid' } 
      });
    });

    it('handles arrays', () => {
      const input = { a: [1, 2, 3], b: null, c: 'test' };
      expect(removeEmptyFields(input)).toEqual({ a: [1, 2, 3], c: 'test' });
    });
  });

  describe('hasValue', () => {
    it('detects non-empty objects', () => {
      expect(hasValue({ a: 1 })).toBe(true);
      expect(hasValue({ a: 'test' })).toBe(true);
      expect(hasValue({ a: true })).toBe(true);
    });

    it('detects empty objects', () => {
      expect(hasValue({ a: null })).toBe(false);
      expect(hasValue({ a: undefined })).toBe(false);
      expect(hasValue({ a: '' })).toBe(false);
      expect(hasValue({})).toBe(false);
    });

    it('handles non-objects', () => {
      expect(hasValue(null)).toBe(false);
      expect(hasValue(undefined)).toBe(false);
      expect(hasValue('string')).toBe(false);
      expect(hasValue(123)).toBe(false);
    });

    it('handles nested objects', () => {
      expect(hasValue({ a: { b: 1 } })).toBe(true);
      expect(hasValue({ a: { b: null } })).toBe(false);
    });

    it('handles arrays', () => {
      expect(hasValue({ a: [{ b: 1 }] })).toBe(true);
      expect(hasValue({ a: [{ b: null }] })).toBe(false);
      expect(hasValue({ a: [] })).toBe(false);
    });
  });
});