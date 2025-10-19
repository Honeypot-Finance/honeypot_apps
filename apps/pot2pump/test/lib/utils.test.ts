import BigNumber from 'bignumber.js';
import {
  toCompactLocaleString,
  shortenAddressString,
  formatVolume,
  shortenString,
  hasValue,
  removeEmptyFields,
  getTextSizeClass,
} from '../../lib/utils';

describe('pot2pump utility functions', () => {
  describe('toCompactLocaleString', () => {
    describe('Valid number formatting', () => {
      it('should format numbers >= 0.01 with compact notation', () => {
        expect(toCompactLocaleString(1000)).toBe('1K');
        expect(toCompactLocaleString(1500)).toBe('1.5K');
        expect(toCompactLocaleString(1000000)).toBe('1M');
        expect(toCompactLocaleString(1500000)).toBe('1.5M');
        expect(toCompactLocaleString(1000000000)).toBe('1B');
        expect(toCompactLocaleString(1500000000)).toBe('1.5B');
      });

      it('should format decimal numbers correctly', () => {
        expect(toCompactLocaleString(0.01)).toBe('0.01');
        expect(toCompactLocaleString(0.1)).toBe('0.1');
        expect(toCompactLocaleString(1.5)).toBe('1.5');
        expect(toCompactLocaleString(10.25)).toBe('10.25');
      });

      it('should handle BigNumber inputs', () => {
        expect(toCompactLocaleString(new BigNumber(1000))).toBe('1K');
        expect(toCompactLocaleString(new BigNumber(1500000))).toBe('1.5M');
        expect(toCompactLocaleString(new BigNumber(0.05))).toBe('0.05');
      });

      it('should handle string inputs', () => {
        expect(toCompactLocaleString('1000')).toBe('1K');
        expect(toCompactLocaleString('1500000')).toBe('1.5M');
        expect(toCompactLocaleString('0.05')).toBe('0.05');
      });

      it('should respect custom options', () => {
        expect(
          toCompactLocaleString(1234.5678, { maximumFractionDigits: 0 })
        ).toBe('1K');
        expect(
          toCompactLocaleString(1234.5678, { maximumFractionDigits: 3 })
        ).toBe('1.235K');
      });
    });

    describe('Edge cases and boundary values', () => {
      it('should return "< 0.01" for very small positive numbers', () => {
        expect(toCompactLocaleString(0.001)).toBe('< 0.01');
        expect(toCompactLocaleString(0.009)).toBe('< 0.01');
        expect(toCompactLocaleString(0.0099)).toBe('< 0.01');
      });

      it('should handle zero values', () => {
        expect(toCompactLocaleString(0)).toBe('0');
        expect(toCompactLocaleString('0')).toBe('< 0.01'); // '0' string is truthy, so !!!value is false
        expect(toCompactLocaleString(new BigNumber(0))).toBe('< 0.01'); // BigNumber(0) is truthy
      });

      it('should handle negative numbers', () => {
        expect(toCompactLocaleString(-1000)).toBe('< 0.01'); // Negative numbers are < 0.01 check
        expect(toCompactLocaleString(-0.05)).toBe('< 0.01'); // Negative numbers are < 0.01 check
        expect(toCompactLocaleString(-0.001)).toBe('< 0.01');
      });

      it('should handle very large numbers', () => {
        expect(toCompactLocaleString(1000000000000)).toBe('1T');
        expect(toCompactLocaleString(1500000000000)).toBe('1.5T');
      });
    });

    describe('Invalid inputs', () => {
      it('should return "0" for null and undefined', () => {
        expect(toCompactLocaleString(null as any)).toBe('0');
        expect(toCompactLocaleString(undefined as any)).toBe('0');
      });

      it('should return "0" for empty string', () => {
        expect(toCompactLocaleString('')).toBe('0');
      });

      it('should handle NaN gracefully', () => {
        expect(toCompactLocaleString(NaN)).toBe('0'); // NaN is falsy, so !!!NaN is true, returns "0"
      });

      it('should handle Infinity', () => {
        expect(toCompactLocaleString(Infinity)).toBe('∞'); // Infinity >= 0.01, so formats normally
        expect(toCompactLocaleString(-Infinity)).toBe('< 0.01'); // -Infinity < 0.01
      });
    });
  });

  describe('shortenAddressString', () => {
    const validAddress = '0x1234567890123456789012345678901234567890';

    describe('Valid address shortening', () => {
      it('should shorten address with default 4 characters', () => {
        expect(shortenAddressString(validAddress)).toBe('0x1234...7890');
      });

      it('should shorten address with custom character count', () => {
        expect(shortenAddressString(validAddress, 6)).toBe('0x123456...567890');
        expect(shortenAddressString(validAddress, 2)).toBe('0x12...90');
        expect(shortenAddressString(validAddress, 8)).toBe(
          '0x12345678...34567890'
        ); // Takes chars+2 from start, chars from end
      });

      it('should handle shorter addresses', () => {
        const shortAddress = '0x1234567890';
        expect(shortenAddressString(shortAddress, 4)).toBe('0x1234...7890');
      });
    });

    describe('Edge cases', () => {
      it('should return empty string for null/undefined', () => {
        expect(shortenAddressString(null as any)).toBe('');
        expect(shortenAddressString(undefined as any)).toBe('');
      });

      it('should return empty string for empty string', () => {
        expect(shortenAddressString('')).toBe('');
      });

      it('should handle very short strings', () => {
        expect(shortenAddressString('0x12', 4)).toBe('0x12...0x12'); // Takes chars+2 from start, chars from end
        expect(shortenAddressString('abc', 2)).toBe('abc...bc'); // Takes chars+2 from start, but string is only 3 chars
      });

      it('should handle addresses without 0x prefix', () => {
        const addressWithoutPrefix = '1234567890123456789012345678901234567890';
        expect(shortenAddressString(addressWithoutPrefix, 4)).toBe(
          '123456...7890'
        ); // Takes chars+2 from start
      });
    });

    describe('Boundary values', () => {
      it('should handle zero character count', () => {
        expect(shortenAddressString(validAddress, 0)).toBe('0x...');
      });

      it('should handle character count larger than address', () => {
        const shortAddr = '0x123';
        expect(shortenAddressString(shortAddr, 10)).toBe('0x123...0x123'); // Takes chars+2 from start, chars from end
      });
    });
  });

  describe('formatVolume', () => {
    describe('Volume formatting with units', () => {
      it('should format billions correctly', () => {
        expect(formatVolume(1000000000)).toBe('$1.00B');
        expect(formatVolume(1500000000)).toBe('$1.50B');
        expect(formatVolume(2300000000)).toBe('$2.30B');
        expect(formatVolume(999999999999)).toBe('$1000.00B');
      });

      it('should format millions correctly', () => {
        expect(formatVolume(1000000)).toBe('$1.00M');
        expect(formatVolume(1500000)).toBe('$1.50M');
        expect(formatVolume(999999999)).toBe('$1000.00M');
      });

      it('should format thousands correctly', () => {
        expect(formatVolume(1000)).toBe('$1.00K');
        expect(formatVolume(1500)).toBe('$1.50K');
        expect(formatVolume(999999)).toBe('$1000.00K');
      });

      it('should format numbers less than 1000 without units', () => {
        expect(formatVolume(999)).toBe('$999.00');
        expect(formatVolume(100)).toBe('$100.00');
        expect(formatVolume(1)).toBe('$1.00');
      });
    });

    describe('Edge cases and boundary values', () => {
      it('should handle zero', () => {
        expect(formatVolume(0)).toBe('$0.00');
      });

      it('should handle decimal numbers', () => {
        expect(formatVolume(1000.5)).toBe('$1.00K');
        expect(formatVolume(1500.75)).toBe('$1.50K');
        expect(formatVolume(999.99)).toBe('$999.99');
      });

      it('should handle negative numbers', () => {
        expect(formatVolume(-1000)).toBe('$-1000.00'); // Negative numbers don't get formatted with units
        expect(formatVolume(-1000000)).toBe('$-1000000.00');
        expect(formatVolume(-1000000000)).toBe('$-1000000000.00');
        expect(formatVolume(-500)).toBe('$-500.00');
      });

      it('should handle very large numbers', () => {
        expect(formatVolume(1000000000000)).toBe('$1000.00B');
        expect(formatVolume(999999999999999)).toBe('$1000000.00B');
      });

      it('should handle very small decimal numbers', () => {
        expect(formatVolume(0.01)).toBe('$0.01');
        expect(formatVolume(0.001)).toBe('$0.00');
        expect(formatVolume(0.999)).toBe('$1.00');
      });
    });

    describe('Precision and rounding', () => {
      it('should round to 2 decimal places', () => {
        expect(formatVolume(1234.567)).toBe('$1.23K');
        expect(formatVolume(1999.999)).toBe('$2.00K');
        expect(formatVolume(999.996)).toBe('$1000.00');
      });

      it('should handle boundary rounding cases', () => {
        expect(formatVolume(999.995)).toBe('$1000.00');
        expect(formatVolume(999999.995)).toBe('$1000.00K'); // Rounds to 1000K, not 1000M
        expect(formatVolume(999999999.995)).toBe('$1000.00M'); // Rounds to 1000M, not 1000B
      });
    });

    describe('Invalid inputs', () => {
      it('should handle NaN', () => {
        expect(formatVolume(NaN)).toBe('$NaN');
      });

      it('should handle Infinity', () => {
        expect(formatVolume(Infinity)).toBe('$InfinityB'); // Infinity >= 1B, so gets B suffix
        expect(formatVolume(-Infinity)).toBe('$-Infinity'); // -Infinity doesn't match >= conditions
      });
    });
  });

  describe('Additional utility functions', () => {
    describe('shortenString', () => {
      it('should shorten strings correctly', () => {
        expect(shortenString('abcdefghijk', 4)).toBe('abcd...hijk');
        expect(shortenString('short', 2)).toBe('sh...rt');
      });

      it('should handle empty strings', () => {
        expect(shortenString('')).toBe('');
        expect(shortenString(null as any)).toBe('');
      });
    });

    describe('hasValue', () => {
      it('should detect objects with values', () => {
        expect(hasValue({ a: 1 })).toBe(true);
        expect(hasValue({ a: 'test' })).toBe(true);
        expect(hasValue({ a: true })).toBe(true);
      });

      it('should detect empty objects', () => {
        expect(hasValue({})).toBe(false);
        expect(hasValue({ a: null })).toBe(false);
        expect(hasValue({ a: undefined })).toBe(false);
        expect(hasValue({ a: '' })).toBe(false);
      });

      it('should handle non-objects', () => {
        expect(hasValue(null)).toBe(false);
        expect(hasValue(undefined)).toBe(false);
        expect(hasValue('string')).toBe(false);
        expect(hasValue(123)).toBe(false);
      });
    });

    describe('removeEmptyFields', () => {
      it('should remove null and undefined fields', () => {
        const input = { a: 1, b: null, c: undefined, d: 'test' };
        const result = removeEmptyFields(input);
        expect(result).toEqual({ a: 1, d: 'test' });
      });

      it('should remove empty strings', () => {
        const input = { a: 'test', b: '', c: 'valid' };
        const result = removeEmptyFields(input);
        expect(result).toEqual({ a: 'test', c: 'valid' });
      });

      it('should handle nested objects', () => {
        const input = {
          a: { x: 1, y: null },
          b: { z: '' },
          c: { w: 'valid' },
        };
        const result = removeEmptyFields(input);
        expect(result).toEqual({
          a: { x: 1 },
          c: { w: 'valid' },
        });
      });
    });

    describe('getTextSizeClass', () => {
      it('should return appropriate classes for different text lengths', () => {
        const longClass = getTextSizeClass('verylongtext');
        const mediumClass = getTextSizeClass('medium');
        const shortClass = getTextSizeClass('hi');
        const nullClass = getTextSizeClass(null);

        expect(longClass).toContain('text-base');
        expect(mediumClass).toContain('text-xl');
        expect(shortClass).toContain('text-2xl');
        expect(nullClass).toContain('text-2xl');
      });
    });
  });
});
