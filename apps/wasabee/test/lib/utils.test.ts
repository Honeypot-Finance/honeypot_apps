import { 
  ethAddressUtils,
  calculatePercentageChange,
  toCompactLocaleString,
  shortenAddressString,
  formatVolume,
  cn,
  hasValue,
  removeEmptyFields,
  getTextSizeClass,
  formatNumberWithUnit
} from '../../lib/utils';
// @/lib/utils

import BigNumber from 'bignumber.js';

describe('Utils', () => {
  describe('Positive Tests', () => {
    test('ethAddressUtils should format addresses correctly', () => {
      expect(ethAddressUtils('1234567890123456789012345678901234567890')).toBe('0x1234567890123456789012345678901234567890');
      expect(ethAddressUtils('0x1234567890123456789012345678901234567890')).toBe('0x1234567890123456789012345678901234567890');
    });

    test('calculatePercentageChange should calculate correctly', () => {
      expect(calculatePercentageChange(110, 100)).toBe(10);
      expect(calculatePercentageChange(90, 100)).toBe(-10);
      expect(calculatePercentageChange(200, 100)).toBe(100);
    });

    test('toCompactLocaleString should format numbers correctly', () => {
      expect(toCompactLocaleString(1000)).toBe('1K');
      expect(toCompactLocaleString(1000000)).toBe('1M');
      expect(toCompactLocaleString(0.1)).toBe('0.1');
      expect(toCompactLocaleString(0.001)).toBe('< 0.01');
    });

    test('shortenAddressString should shorten addresses correctly', () => {
      const address = '0x1234567890123456789012345678901234567890';
      expect(shortenAddressString(address)).toBe('0x1234...7890');
      expect(shortenAddressString(address, 6)).toBe('0x123456...567890');
    });

    test('formatVolume should format volumes correctly', () => {
      // Note: The test environment seems to add currency formatting
      const result1000 = formatVolume(1000);
      const result1M = formatVolume(1000000);
      const result1B = formatVolume(1000000000);
      const result500 = formatVolume(500);
      
      expect(result1000).toMatch(/1\.00K/);
      expect(result1M).toMatch(/1\.00M/);
      expect(result1B).toMatch(/1\.00B/);
      expect(result500).toMatch(/500\.00/);
    });

    test('cn should combine class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
      expect(cn('class1', undefined, 'class2')).toBe('class1 class2');
    });

    test('hasValue should detect objects with values', () => {
      expect(hasValue({ a: 1, b: 2 })).toBe(true);
      expect(hasValue({ a: 'test', b: null })).toBe(true);
      expect(hasValue({ nested: { value: 'test' } })).toBe(true);
    });

    test('getTextSizeClass should return appropriate classes', () => {
      expect(getTextSizeClass('short')).toBe('text-2xl md:text-[34px] text-stroke-2 text-shadow-[2px_4px_0px_#AF7F3D]');
      expect(getTextSizeClass('medium text')).toBe('text-base md:text-xl text-stroke-1 text-shadow-[1px_2px_0px_#AF7F3D]');
      expect(getTextSizeClass('very long text here')).toBe('text-base md:text-xl text-stroke-1 text-shadow-[1px_2px_0px_#AF7F3D]');
    });

    test('formatNumberWithUnit should format numbers with units', () => {
      expect(formatNumberWithUnit(1000)).toBe('1k');
      expect(formatNumberWithUnit(1000000)).toBe('1M');
      expect(formatNumberWithUnit(1000000000)).toBe('1B');
      expect(formatNumberWithUnit(1000000000000)).toBe('1T');
    });
  });

  describe('Negative Tests', () => {
    test('ethAddressUtils should handle empty input', () => {
      expect(ethAddressUtils('')).toBe('');
    });

    test('calculatePercentageChange should handle edge cases', () => {
      expect(calculatePercentageChange(0, 0)).toBe(0);
      expect(calculatePercentageChange(100, 0)).toBe(100);
      expect(calculatePercentageChange(0, 100)).toBe(-100);
    });

    test('toCompactLocaleString should handle invalid inputs', () => {
      expect(toCompactLocaleString(0)).toBe('0');
      expect(toCompactLocaleString('')).toBe('0');
      expect(toCompactLocaleString(null as unknown as number)).toBe('0');
    });

    test('shortenAddressString should handle empty input', () => {
      expect(shortenAddressString('')).toBe('');
    });

    test('hasValue should detect objects without values', () => {
      expect(hasValue({})).toBe(false);
      expect(hasValue({ a: null, b: undefined })).toBe(false);
      expect(hasValue({ a: '', b: 0 })).toBe(false);
      expect(hasValue(null)).toBe(false);
    });

    test('formatNumberWithUnit should handle special values', () => {
      expect(formatNumberWithUnit(NaN)).toBe('NaN');
      expect(formatNumberWithUnit(Infinity)).toBe('InfinityT');
      expect(formatNumberWithUnit(-Infinity)).toBe('-Infinity');
    });
  });

  describe('Edge Case Tests', () => {
    test('removeEmptyFields should clean objects correctly', () => {
      const input = {
        a: 1,
        b: '',
        c: null,
        d: undefined,
        e: { f: 2, g: '' },
        h: { i: null, j: undefined }
      };
      
      const result = removeEmptyFields(input);
      expect(result).toEqual({
        a: 1,
        e: { f: 2 }
      });
    });

    test('calculatePercentageChange should handle negative numbers', () => {
      expect(calculatePercentageChange(-50, -100)).toBe(-50);
      expect(calculatePercentageChange(-100, -50)).toBe(100);
    });

    test('toCompactLocaleString should handle BigNumber inputs', () => {
      const bigNum = new BigNumber('1000000');
      expect(toCompactLocaleString(bigNum)).toBe('1M');
    });

    test('formatVolume should handle decimal values', () => {
      const result1K = formatVolume(1234.56);
      const result1M = formatVolume(1234567.89);
      
      expect(result1K).toMatch(/1\.23K/);
      expect(result1M).toMatch(/1\.23M/);
    });

    test('formatNumberWithUnit should handle very small numbers', () => {
      expect(formatNumberWithUnit(0.001, 2)).toBe('<0.01');
      expect(formatNumberWithUnit(0.0001, 4)).toBe('0.0001');
    });

    test('formatNumberWithUnit should handle negative numbers', () => {
      expect(formatNumberWithUnit(-1000)).toBe('-1000');
      expect(formatNumberWithUnit(-1000000)).toBe('-1000000');
    });

    test('hasValue should handle arrays correctly', () => {
      expect(hasValue({ arr: [1, 2, 3] })).toBe(true);
      expect(hasValue({ arr: [] })).toBe(false);
      expect(hasValue({ arr: [{ nested: 'value' }] })).toBe(true);
    });

    test('getTextSizeClass should handle null and undefined', () => {
      expect(getTextSizeClass(null)).toBe('text-2xl md:text-[34px] text-stroke-2 text-shadow-[2px_4px_0px_#AF7F3D]');
      expect(getTextSizeClass(undefined)).toBe('text-2xl md:text-[34px] text-stroke-2 text-shadow-[2px_4px_0px_#AF7F3D]');
    });

    test('cn should handle conditional classes', () => {
      expect(cn('base', true && 'conditional', false && 'hidden')).toBe('base conditional');
      expect(cn('base', { active: true, disabled: false })).toBe('base active');
    });

    test('shortenAddressString should handle different character counts', () => {
      const address = '0x1234567890123456789012345678901234567890';
      expect(shortenAddressString(address, 2)).toBe('0x12...90');
      expect(shortenAddressString(address, 8)).toBe('0x12345678...34567890');
    });

    test('removeEmptyFields should handle nested objects', () => {
      const input = {
        level1: {
          level2: {
            value: 'test',
            empty: ''
          },
          emptyNested: {
            nothing: null
          }
        }
      };
      
      const result = removeEmptyFields(input);
      expect(result).toEqual({
        level1: {
          level2: {
            value: 'test'
          }
        }
      });
    });
  });
});