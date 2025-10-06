import { calculatePercentageChange } from '../../libs/shared/hpot-sdk/src/lib/utils/calculatePercentageChange';
import { helper } from '../../libs/shared/hpot-sdk/src/lib/utils/helper';
import { isEthAddress } from '../../libs/shared/hpot-sdk/src/lib/utils/address';

describe('Shared Utility Functions - Core Tests', () => {
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

    it('should handle edge cases', () => {
      expect(calculatePercentageChange(Infinity, 100)).toBe(Infinity);
      expect(calculatePercentageChange(-Infinity, 100)).toBe(-Infinity);
      expect(calculatePercentageChange(100, Infinity)).toBe(-100);
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

      it('should handle complex JSON objects', () => {
        const complexObj = {
          nested: { array: [1, 2, 3], bool: true },
          number: 42.5,
          nullValue: null
        };
        const jsonString = JSON.stringify(complexObj);
        const result = helper.json.safeParse(jsonString);
        expect(result).toEqual(complexObj);
      });

      it('should handle malformed JSON gracefully', () => {
        const malformedCases = [
          '{"incomplete": ',
          '{key: "value"}', // Missing quotes around key
          '{"trailing": "comma",}',
          'undefined',
          'function() {}',
          '{[}]'
        ];

        malformedCases.forEach(malformed => {
          expect(helper.json.safeParse(malformed)).toBeNull();
        });
      });
    });

    describe('env.isBrowser', () => {
      it('should detect browser environment', () => {
        expect(typeof helper.env.isBrowser).toBe('boolean');
      });

      it('should be consistent', () => {
        const first = helper.env.isBrowser;
        const second = helper.env.isBrowser;
        expect(first).toBe(second);
      });
    });
  });

  describe('isEthAddress', () => {
    it('should validate correct Ethereum addresses', () => {
      const validAddresses = [
        '0x1234567890123456789012345678901234567890',
        '0xabcdefABCDEF1234567890123456789012345678',
        '0x0000000000000000000000000000000000000000',
        '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'
      ];

      validAddresses.forEach(address => {
        expect(isEthAddress(address)).toBe(true);
      });
    });

    it('should reject invalid Ethereum addresses', () => {
      const invalidAddresses = [
        '1234567890123456789012345678901234567890', // No 0x prefix
        '0x123456789012345678901234567890123456789', // Too short
        '0x12345678901234567890123456789012345678901', // Too long
        '0x123456789012345678901234567890123456789g', // Invalid character
        '', // Empty string
        '0x', // Only prefix
        '0X1234567890123456789012345678901234567890', // Wrong case prefix
        '0x123456789012345678901234567890123456789G' // Invalid uppercase character
      ];

      invalidAddresses.forEach(address => {
        expect(isEthAddress(address)).toBe(false);
      });
    });

    it('should handle null and undefined', () => {
      expect(isEthAddress(null as any)).toBe(false);
      expect(isEthAddress(undefined as any)).toBe(false);
    });

    it('should handle non-string inputs', () => {
      expect(isEthAddress(123 as any)).toBe(false);
      expect(isEthAddress({} as any)).toBe(false);
      expect(isEthAddress([] as any)).toBe(false);
      expect(isEthAddress(true as any)).toBe(false);
    });
  });

  describe('Edge cases and boundary values', () => {
    describe('calculatePercentageChange edge cases', () => {
      it('should handle very large numbers', () => {
        const large = Number.MAX_SAFE_INTEGER;
        const result = calculatePercentageChange(large, large / 2);
        expect(result).toBe(100);
      });

      it('should handle very small numbers', () => {
        const small = Number.MIN_VALUE;
        const result = calculatePercentageChange(small * 2, small);
        expect(result).toBe(100);
      });

      it('should handle negative numbers', () => {
        expect(calculatePercentageChange(-50, -100)).toBe(-50); // (-50/-100)*100 - 100 = 50 - 100 = -50
        expect(calculatePercentageChange(-150, -100)).toBe(50); // ((-150 - (-100))/(-100))*100 = 50
        expect(calculatePercentageChange(50, -100)).toBe(-150); // (50/(-100))*100 - 100 = -50 - 100 = -150
        expect(calculatePercentageChange(-50, 100)).toBe(-150); // (-50/100)*100 - 100 = -50 - 100 = -150
      });

      it('should handle precision issues', () => {
        // Test floating point precision
        const result = calculatePercentageChange(0.1 + 0.2, 0.3);
        expect(Math.abs(result)).toBeLessThan(0.0001); // Should be close to 0
      });
    });

    describe('Performance tests', () => {
      it('should handle large datasets efficiently', () => {
        const startTime = performance.now();
        
        // Process 10000 calculations
        for (let i = 0; i < 10000; i++) {
          calculatePercentageChange(Math.random() * 1000, Math.random() * 1000);
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Should complete within reasonable time
        expect(duration).toBeLessThan(1000); // 1 second
      });

      it('should handle repeated JSON parsing efficiently', () => {
        const testJson = '{"test": "value", "number": 42, "array": [1,2,3]}';
        const startTime = performance.now();
        
        // Parse 1000 times
        for (let i = 0; i < 1000; i++) {
          helper.json.safeParse(testJson);
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Should complete within reasonable time
        expect(duration).toBeLessThan(500); // 0.5 seconds
      });

      it('should handle repeated address validation efficiently', () => {
        const testAddress = '0x1234567890123456789012345678901234567890';
        const startTime = performance.now();
        
        // Validate 10000 times
        for (let i = 0; i < 10000; i++) {
          isEthAddress(testAddress);
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Should complete within reasonable time
        expect(duration).toBeLessThan(100); // 0.1 seconds
      });
    });

    describe('Error handling and recovery', () => {
      it('should handle malformed input gracefully', () => {
        expect(() => {
          calculatePercentageChange('invalid' as any, 'also-invalid' as any);
        }).not.toThrow();
        
        expect(() => {
          helper.json.safeParse(undefined as any);
        }).not.toThrow();
        
        expect(() => {
          isEthAddress(null as any);
        }).not.toThrow();
      });

      it('should recover from extreme values', () => {
        // Test with extreme values that might cause overflow
        const extremeValues = [
          Number.MAX_VALUE,
          Number.MIN_VALUE,
          Number.POSITIVE_INFINITY,
          Number.NEGATIVE_INFINITY,
          Number.MAX_SAFE_INTEGER,
          Number.MIN_SAFE_INTEGER
        ];

        extremeValues.forEach(value => {
          expect(() => {
            calculatePercentageChange(value, 100);
            calculatePercentageChange(100, value);
          }).not.toThrow();
        });
      });

      it('should handle circular JSON references gracefully', () => {
        const circular: unknown = { a: 1 };
        circular.self = circular;
        
        let jsonString;
        try {
          jsonString = JSON.stringify(circular);
        } catch (e) {
          jsonString = 'invalid';
        }
        
        const result = helper.json.safeParse(jsonString);
        expect(result).toBeNull();
      });
    });

    describe('Memory and resource management', () => {
      it('should not leak memory with repeated operations', () => {
        const initialMemory = process.memoryUsage().heapUsed;
        
        // Perform many operations
        for (let i = 0; i < 1000; i++) {
          calculatePercentageChange(Math.random() * 1000, Math.random() * 1000);
          helper.json.safeParse(`{"iteration": ${i}}`);
          isEthAddress(`0x${'1'.repeat(40)}`);
        }
        
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
        
        const finalMemory = process.memoryUsage().heapUsed;
        const memoryIncrease = finalMemory - initialMemory;
        
        // Memory increase should be reasonable
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // 10MB
      });

      it('should handle memory pressure gracefully', () => {
        // Simulate memory pressure by creating large objects
        const largeObjects: unknown[] = [];
        
        try {
          for (let i = 0; i < 100; i++) {
            const largeArray = new Array(10000).fill(`data-${i}`);
            largeObjects.push(largeArray);
            
            // Test utility functions under memory pressure
            calculatePercentageChange(i * 100, (i + 1) * 100);
            helper.json.safeParse(`{"index": ${i}}`);
            isEthAddress(`0x${'a'.repeat(40)}`);
          }
        } catch (e) {
          // Should handle memory errors gracefully
          expect(e).toBeInstanceOf(Error);
        }
        
        // Clean up
        largeObjects.length = 0;
      });

      it('should handle concurrent operations efficiently', async () => {
        const promises = [];
        
        // Create multiple concurrent operations
        for (let i = 0; i < 100; i++) {
          promises.push(
            Promise.resolve().then(() => {
              calculatePercentageChange(Math.random() * 1000, Math.random() * 1000);
              helper.json.safeParse(`{"concurrent": ${i}}`);
              isEthAddress(`0x${i.toString(16).padStart(40, '0')}`);
            })
          );
        }
        
        const startTime = performance.now();
        await Promise.all(promises);
        const endTime = performance.now();
        
        // Should complete within reasonable time
        expect(endTime - startTime).toBeLessThan(1000); // 1 second
      });
    });
  });

  describe('Integration and compatibility tests', () => {
    it('should work with different number formats', () => {
      const formats = [
        { input: [1.5, 1], expected: 50 },
        { input: [150, 100], expected: 50 },
        { input: [1500, 1000], expected: 50 },
        { input: [0.15, 0.1], expected: 50 }
      ];

      formats.forEach(({ input, expected }) => {
        const result = calculatePercentageChange(input[0], input[1]);
        expect(Math.abs(result - expected)).toBeLessThan(0.0001); // Handle floating point precision
      });
    });

    it('should handle different JSON formats', () => {
      const jsonFormats = [
        '{"simple": "value"}',
        '{"number": 42}',
        '{"boolean": true}',
        '{"null": null}',
        '{"array": [1, 2, 3]}',
        '{"nested": {"deep": {"value": "test"}}}',
        '[]',
        '"string"',
        '42',
        'true',
        'null'
      ];

      jsonFormats.forEach(json => {
        const result = helper.json.safeParse(json);
        expect(result).toEqual(JSON.parse(json));
      });
    });

    it('should handle different address formats consistently', () => {
      const addressPairs = [
        ['0x1234567890123456789012345678901234567890', true],
        ['0xabcdefABCDEF1234567890123456789012345678', true],
        ['1234567890123456789012345678901234567890', false],
        ['0x123456789012345678901234567890123456789', false]
      ];

      addressPairs.forEach(([address, expected]) => {
        expect(isEthAddress(address as string)).toBe(expected);
      });
    });
  });
});  desc
ribe('Advanced utility function tests', () => {
    describe('calculatePercentageChange advanced scenarios', () => {
      it('should handle financial calculation scenarios', () => {
        // Stock price changes
        const stockScenarios = [
          { old: 100, new: 110, expected: 10 }, // 10% gain
          { old: 100, new: 90, expected: -10 }, // 10% loss
          { old: 50, new: 75, expected: 50 }, // 50% gain
          { old: 200, new: 100, expected: -50 } // 50% loss
        ];

        stockScenarios.forEach(({ old, new: newVal, expected }) => {
          const result = calculatePercentageChange(newVal, old);
          expect(Math.abs(result - expected)).toBeLessThan(0.0001);
        });
      });

      it('should handle cryptocurrency volatility scenarios', () => {
        // Extreme crypto price movements
        const cryptoScenarios = [
          { old: 1, new: 100, expected: 9900 }, // 99x pump
          { old: 100, new: 1, expected: -99 }, // 99% crash
          { old: 0.001, new: 0.01, expected: 900 }, // 10x on small numbers
          { old: 10000, new: 1000, expected: -90 } // 90% drop
        ];

        cryptoScenarios.forEach(({ old, new: newVal, expected }) => {
          const result = calculatePercentageChange(newVal, old);
          expect(Math.abs(result - expected)).toBeLessThan(0.1);
        });
      });

      it('should handle percentage changes with high precision', () => {
        const precisionScenarios = [
          { old: 1.000001, new: 1.000002, expected: 0.0001 },
          { old: 999.999, new: 1000.001, expected: 0.0002 },
          { old: 0.123456789, new: 0.123456790, expected: 0.00000081 }
        ];

        precisionScenarios.forEach(({ old, new: newVal, expected }) => {
          const result = calculatePercentageChange(newVal, old);
          expect(Math.abs(result - expected)).toBeLessThan(0.001);
        });
      });
    });

    describe('helper.json.safeParse advanced scenarios', () => {
      it('should handle complex nested JSON structures', () => {
        const complexJson = {
          user: {
            id: 123,
            profile: {
              name: 'Test User',
              settings: {
                theme: 'dark',
                notifications: {
                  email: true,
                  push: false,
                  sms: null
                }
              }
            },
            transactions: [
              { id: 1, amount: 100.50, date: '2024-01-01' },
              { id: 2, amount: -50.25, date: '2024-01-02' }
            ]
          },
          metadata: {
            version: '1.0.0',
            timestamp: 1704067200000,
            flags: ['feature_a', 'feature_b']
          }
        };

        const jsonString = JSON.stringify(complexJson);
        const parsed = helper.json.safeParse(jsonString);
        
        expect(parsed).toEqual(complexJson);
        expect(parsed.user.profile.settings.notifications.email).toBe(true);
        expect(parsed.metadata.flags).toHaveLength(2);
      });

      it('should handle JSON with special characters and unicode', () => {
        const specialJson = {
          text: 'Hello 世界! 🌍',
          symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
          quotes: 'He said "Hello" and she replied \'Hi\'',
          newlines: 'Line 1\nLine 2\r\nLine 3',
          tabs: 'Column1\tColumn2\tColumn3',
          unicode: '\u0048\u0065\u006C\u006C\u006F'
        };

        const jsonString = JSON.stringify(specialJson);
        const parsed = helper.json.safeParse(jsonString);
        
        expect(parsed).toEqual(specialJson);
        expect(parsed.text).toContain('世界');
        expect(parsed.text).toContain('🌍');
        expect(parsed.unicode).toBe('Hello');
      });

      it('should handle large JSON objects efficiently', () => {
        const largeObject = {
          data: Array.from({ length: 1000 }, (_, i) => ({
            id: i,
            name: `Item ${i}`,
            value: Math.random() * 1000,
            tags: [`tag${i}`, `category${i % 10}`],
            metadata: {
              created: new Date().toISOString(),
              updated: new Date().toISOString(),
              version: '1.0.0'
            }
          }))
        };

        const startTime = performance.now();
        const jsonString = JSON.stringify(largeObject);
        const parsed = helper.json.safeParse(jsonString);
        const endTime = performance.now();

        expect(parsed).toEqual(largeObject);
        expect(parsed.data).toHaveLength(1000);
        expect(endTime - startTime).toBeLessThan(100); // Should be fast
      });

      it('should handle edge cases in JSON parsing', () => {
        const edgeCases = [
          { input: '[]', expected: [] },
          { input: '{}', expected: {} },
          { input: 'null', expected: null },
          { input: 'true', expected: true },
          { input: 'false', expected: false },
          { input: '0', expected: 0 },
          { input: '""', expected: '' },
          { input: '"string"', expected: 'string' },
          { input: '123.456', expected: 123.456 }
        ];

        edgeCases.forEach(({ input, expected }) => {
          const result = helper.json.safeParse(input);
          expect(result).toEqual(expected);
        });
      });
    });

    describe('isEthAddress advanced validation', () => {
      it('should validate checksummed addresses correctly', () => {
        const checksummedAddresses = [
          '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
          '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
          '0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB',
          '0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb'
        ];

        checksummedAddresses.forEach(address => {
          expect(isEthAddress(address)).toBe(true);
        });
      });

      it('should handle mixed case addresses', () => {
        const mixedCaseAddresses = [
          '0x1234567890123456789012345678901234567890',
          '0xABCDEF1234567890123456789012345678901234',
          '0xabcdef1234567890123456789012345678901234',
          '0x1234567890abcdef1234567890ABCDEF12345678'
        ];

        mixedCaseAddresses.forEach(address => {
          expect(isEthAddress(address)).toBe(true);
        });
      });

      it('should reject addresses with invalid characters', () => {
        const invalidCharAddresses = [
          '0x123456789012345678901234567890123456789G', // G is invalid
          '0x123456789012345678901234567890123456789O', // O is invalid
          '0x123456789012345678901234567890123456789I', // I is invalid
          '0x123456789012345678901234567890123456789L', // L is invalid
          '0x123456789012345678901234567890123456789@', // @ is invalid
          '0x123456789012345678901234567890123456789#'  // # is invalid
        ];

        invalidCharAddresses.forEach(address => {
          expect(isEthAddress(address)).toBe(false);
        });
      });

      it('should handle boundary length cases', () => {
        const lengthCases = [
          { address: '0x', valid: false }, // Too short
          { address: '0x1', valid: false }, // Too short
          { address: '0x' + '1'.repeat(39), valid: false }, // 39 chars (too short)
          { address: '0x' + '1'.repeat(40), valid: true }, // 40 chars (correct)
          { address: '0x' + '1'.repeat(41), valid: false }, // 41 chars (too long)
          { address: '0x' + '1'.repeat(50), valid: false } // Much too long
        ];

        lengthCases.forEach(({ address, valid }) => {
          expect(isEthAddress(address)).toBe(valid);
        });
      });
    });

    describe('Performance optimization tests', () => {
      it('should optimize repeated calculations', () => {
        const testData = Array.from({ length: 10000 }, () => ({
          old: Math.random() * 1000,
          new: Math.random() * 1000
        }));

        const startTime = performance.now();
        
        const results = testData.map(({ old, new: newVal }) => 
          calculatePercentageChange(newVal, old)
        );
        
        const endTime = performance.now();
        
        expect(results).toHaveLength(10000);
        expect(results.every(r => typeof r === 'number')).toBe(true);
        expect(endTime - startTime).toBeLessThan(100); // Should be very fast
      });

      it('should optimize repeated JSON parsing', () => {
        const testJsons = Array.from({ length: 1000 }, (_, i) => 
          JSON.stringify({ id: i, value: Math.random(), timestamp: Date.now() })
        );

        const startTime = performance.now();
        
        const results = testJsons.map(json => helper.json.safeParse(json));
        
        const endTime = performance.now();
        
        expect(results).toHaveLength(1000);
        expect(results.every(r => r !== null && typeof r === 'object')).toBe(true);
        expect(endTime - startTime).toBeLessThan(50); // Should be very fast
      });

      it('should optimize repeated address validation', () => {
        const testAddresses = Array.from({ length: 10000 }, (_, i) => 
          `0x${i.toString(16).padStart(40, '0')}`
        );

        const startTime = performance.now();
        
        const results = testAddresses.map(address => isEthAddress(address));
        
        const endTime = performance.now();
        
        expect(results).toHaveLength(10000);
        expect(results.every(r => r === true)).toBe(true);
        expect(endTime - startTime).toBeLessThan(50); // Should be very fast
      });
    });

    describe('Real-world integration scenarios', () => {
      it('should handle DeFi price impact calculations', () => {
        const priceImpactScenarios = [
          { oldPrice: 100, newPrice: 99, expectedImpact: -1 }, // 1% negative impact
          { oldPrice: 100, newPrice: 105, expectedImpact: 5 }, // 5% positive impact
          { oldPrice: 1.5, newPrice: 1.485, expectedImpact: -1 }, // Small price, small impact
          { oldPrice: 0.001, newPrice: 0.0011, expectedImpact: 10 } // Very small price, larger impact
        ];

        priceImpactScenarios.forEach(({ oldPrice, newPrice, expectedImpact }) => {
          const impact = calculatePercentageChange(newPrice, oldPrice);
          expect(Math.abs(impact - expectedImpact)).toBeLessThan(0.1);
        });
      });

      it('should handle wallet transaction parsing', () => {
        const transactionData = {
          hash: '0x1234567890123456789012345678901234567890123456789012345678901234',
          from: '0x1234567890123456789012345678901234567890',
          to: '0x0987654321098765432109876543210987654321',
          value: '1000000000000000000', // 1 ETH in wei
          gasPrice: '20000000000', // 20 gwei
          gasUsed: '21000',
          blockNumber: 18500000,
          timestamp: 1704067200
        };

        const jsonString = JSON.stringify(transactionData);
        const parsed = helper.json.safeParse(jsonString);
        
        expect(parsed).toEqual(transactionData);
        expect(isEthAddress(parsed.from)).toBe(true);
        expect(isEthAddress(parsed.to)).toBe(true);
        expect(parsed.value).toBe('1000000000000000000');
      });

      it('should handle portfolio value calculations', () => {
        const portfolio = [
          { symbol: 'ETH', amount: 10, priceUSD: 2000 },
          { symbol: 'BTC', amount: 0.5, priceUSD: 45000 },
          { symbol: 'USDC', amount: 5000, priceUSD: 1 }
        ];

        const totalValue = portfolio.reduce((sum, asset) => 
          sum + (asset.amount * asset.priceUSD), 0
        );

        expect(totalValue).toBe(47500); // 20000 + 22500 + 5000

        // Test price change impact
        const newETHPrice = 2200; // 10% increase
        const newTotalValue = portfolio.reduce((sum, asset) => 
          sum + (asset.amount * (asset.symbol === 'ETH' ? newETHPrice : asset.priceUSD)), 0
        );

        const portfolioChange = calculatePercentageChange(newTotalValue, totalValue);
        expect(Math.abs(portfolioChange - 4.21)).toBeLessThan(0.1); // ~4.21% increase
      });
    });

    describe('Error boundary and resilience tests', () => {
      it('should handle system interruptions gracefully', () => {
        let interruptionCount = 0;
        const maxInterruptions = 5;

        const resilientCalculation = (a: number, b: number) => {
          try {
            // Simulate potential interruption
            if (Math.random() < 0.1 && interruptionCount < maxInterruptions) {
              interruptionCount++;
              throw new Error('System interruption');
            }
            return calculatePercentageChange(a, b);
          } catch (error) {
            // Retry logic
            return calculatePercentageChange(a, b);
          }
        };

        const results = [];
        for (let i = 0; i < 100; i++) {
          const result = resilientCalculation(Math.random() * 1000, Math.random() * 1000);
          results.push(result);
        }

        expect(results).toHaveLength(100);
        expect(results.every(r => typeof r === 'number')).toBe(true);
      });

      it('should handle resource exhaustion scenarios', () => {
        const resourceIntensiveOperation = () => {
          const largeArray = new Array(100000).fill(0).map((_, i) => ({
            id: i,
            data: helper.json.safeParse(`{"value": ${i}}`),
            address: `0x${i.toString(16).padStart(40, '0')}`,
            percentage: calculatePercentageChange(i + 1, i || 1)
          }));

          return largeArray.length;
        };

        expect(() => {
          const result = resourceIntensiveOperation();
          expect(result).toBe(100000);
        }).not.toThrow();
      });

      it('should maintain consistency under concurrent access', async () => {
        const sharedData = { counter: 0 };
        const concurrentOperations = [];

        for (let i = 0; i < 100; i++) {
          concurrentOperations.push(
            Promise.resolve().then(() => {
              const oldValue = sharedData.counter;
              sharedData.counter++;
              const newValue = sharedData.counter;
              
              return {
                change: calculatePercentageChange(newValue, oldValue || 1),
                json: helper.json.safeParse(`{"operation": ${i}}`),
                address: isEthAddress(`0x${i.toString(16).padStart(40, '0')}`)
              };
            })
          );
        }

        const results = await Promise.all(concurrentOperations);
        
        expect(results).toHaveLength(100);
        expect(results.every(r => 
          typeof r.change === 'number' && 
          r.json !== null && 
          r.address === true
        )).toBe(true);
      });
    });
  });