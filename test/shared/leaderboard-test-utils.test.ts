import {
  createMockAccount,
  createMockStats,
  generateLargeDataset,
  createMockFactoryData,
  createMockAccountsQueryData,
  testDataScenarios,
  createEdgeCaseData,
  measurePerformance,
  createMockBigNumber,
  validateBigNumberPrecision,
} from './leaderboard-test-utils';

describe('Leaderboard Test Utilities', () => {
  describe('Mock Data Factories', () => {
    it('should create a valid mock account with default values', () => {
      const account = createMockAccount();
      
      expect(account).toHaveProperty('id');
      expect(account).toHaveProperty('walletAddress');
      expect(account).toHaveProperty('totalSpend');
      expect(account).toHaveProperty('swapCount');
      expect(account).toHaveProperty('participateCount');
      expect(account).toHaveProperty('pot2PumpLaunchCount');
      expect(account).toHaveProperty('totalSpendUSD');
      expect(account).toHaveProperty('totalDepositPot2pumpUSD');
      expect(account).toHaveProperty('lastActive');
      expect(account).toHaveProperty('transaction');
      
      expect(typeof account.totalSpend).toBe('number');
      expect(typeof account.swapCount).toBe('number');
      expect(typeof account.participateCount).toBe('number');
      expect(typeof account.pot2PumpLaunchCount).toBe('number');
      expect(typeof account.totalSpendUSD).toBe('string');
      expect(typeof account.totalDepositPot2pumpUSD).toBe('string');
      expect(Array.isArray(account.transaction)).toBe(true);
    });

    it('should create a mock account with custom overrides', () => {
      const customAccount = createMockAccount({
        totalSpend: 5000,
        swapCount: 100,
        walletAddress: '0xcustom123',
      });
      
      expect(customAccount.totalSpend).toBe(5000);
      expect(customAccount.swapCount).toBe(100);
      expect(customAccount.walletAddress).toBe('0xcustom123');
    });

    it('should create mock stats for different app types', () => {
      const pot2pumpStats = createMockStats('pot2pump');
      const wasabeeStats = createMockStats('wasabee');
      const dreampadStats = createMockStats('dreampad');
      
      expect(pot2pumpStats).toHaveProperty('totalMemeCreated');
      expect(pot2pumpStats).toHaveProperty('totalSuccessedMeme');
      expect(pot2pumpStats).toHaveProperty('totalDepositedUSD');
      
      expect(wasabeeStats).toHaveProperty('totalTrades');
      expect(wasabeeStats).toHaveProperty('totalVolume');
      expect(wasabeeStats).toHaveProperty('tvl');
      expect(wasabeeStats).toHaveProperty('totalFees');
      
      expect(dreampadStats).toHaveProperty('totalMemeCreated');
      expect(dreampadStats).toHaveProperty('totalSuccessedMeme');
      expect(dreampadStats).toHaveProperty('totalDepositedUSD');
    });

    it('should generate large datasets efficiently', () => {
      const { result, duration } = measurePerformance(() => generateLargeDataset(1000));
      
      expect(result).toHaveLength(1000);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
      
      // Verify all accounts have unique IDs
      const ids = result.map(account => account.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(1000);
    });

    it('should create mock factory data for different app types', () => {
      const pot2pumpFactory = createMockFactoryData('pot2pump');
      const wasabeeFactory = createMockFactoryData('wasabee');
      
      expect(pot2pumpFactory.factories).toHaveLength(1);
      expect(pot2pumpFactory.factories[0]).toHaveProperty('totalMemeCreated');
      expect(pot2pumpFactory.factories[0]).toHaveProperty('totalSuccessedMeme');
      expect(pot2pumpFactory.factories[0]).toHaveProperty('totalDepositedUSD');
      
      expect(wasabeeFactory.factories).toHaveLength(1);
      expect(wasabeeFactory.factories[0]).toHaveProperty('txCount');
      expect(wasabeeFactory.factories[0]).toHaveProperty('totalVolumeUSD');
      expect(wasabeeFactory.factories[0]).toHaveProperty('totalFeesUSD');
    });

    it('should create mock accounts query data', () => {
      const accounts = [createMockAccount(), createMockAccount({ id: '0x456' })];
      const queryData = createMockAccountsQueryData(accounts);
      
      expect(queryData.accounts).toHaveLength(2);
      expect(queryData.accounts[0]).toHaveProperty('id');
      expect(queryData.accounts[0]).toHaveProperty('swapCount');
      expect(queryData.accounts[0]).toHaveProperty('totalSpendUSD');
      expect(queryData.accounts[0]).toHaveProperty('participateCount');
    });
  });

  describe('Test Data Scenarios', () => {
    it('should provide valid test data scenarios', () => {
      expect(testDataScenarios.valid.accounts).toHaveLength(2);
      expect(testDataScenarios.valid.stats).toBeDefined();
      expect(testDataScenarios.valid.factoryData).toBeDefined();
    });

    it('should provide empty test data scenarios', () => {
      expect(testDataScenarios.empty.accounts).toHaveLength(0);
      expect(testDataScenarios.empty.stats).toEqual({});
      expect(testDataScenarios.empty.factoryData.factories).toHaveLength(0);
    });

    it('should provide malformed test data scenarios', () => {
      expect(testDataScenarios.malformed.accounts).toHaveLength(1);
      expect(testDataScenarios.malformed.accounts[0].id).toBe('invalid-address');
      expect(testDataScenarios.malformed.stats.totalMemeCreated?.value).toBeNaN();
    });

    it('should provide large dataset scenarios', () => {
      expect(testDataScenarios.large.accounts).toHaveLength(1000);
    });
  });

  describe('Edge Case Data', () => {
    it('should create edge case data with zero values', () => {
      const edgeCases = createEdgeCaseData();
      
      expect(edgeCases.zeroValues.totalSpend).toBe(0);
      expect(edgeCases.zeroValues.swapCount).toBe(0);
      expect(edgeCases.zeroValues.participateCount).toBe(0);
      expect(edgeCases.zeroValues.pot2PumpLaunchCount).toBe(0);
    });

    it('should create edge case data with extremely large values', () => {
      const edgeCases = createEdgeCaseData();
      
      expect(edgeCases.extremelyLargeValues.totalSpend).toBe(Number.MAX_SAFE_INTEGER);
      expect(edgeCases.extremelyLargeValues.swapCount).toBe(999999999);
    });

    it('should create edge case data with negative values', () => {
      const edgeCases = createEdgeCaseData();
      
      expect(edgeCases.negativeValues.totalSpend).toBe(-1000);
      expect(edgeCases.negativeValues.swapCount).toBe(-1);
    });

    it('should create edge case data with null/undefined values', () => {
      const edgeCases = createEdgeCaseData();
      
      expect(edgeCases.nullUndefinedValues.totalSpend).toBeNull();
      expect(edgeCases.nullUndefinedValues.swapCount).toBeUndefined();
    });
  });

  describe('Utility Functions', () => {
    it('should measure performance correctly', () => {
      const { result, duration } = measurePerformance(() => {
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
          sum += i;
        }
        return sum;
      });
      
      expect(result).toBe(499500); // Sum of 0 to 999
      expect(typeof duration).toBe('number');
      expect(duration).toBeGreaterThan(0);
    });

    it('should create and validate BigNumber instances', () => {
      const bn = createMockBigNumber('123.456789');
      
      expect(bn.toString()).toBe('123.456789');
      expect(validateBigNumberPrecision(bn, 6)).toBe(true);
      expect(validateBigNumberPrecision(bn, 4)).toBe(false);
    });

    it('should handle BigNumber edge cases', () => {
      const zeroBN = createMockBigNumber('0');
      const negativeBN = createMockBigNumber('-123.45');
      const largeBN = createMockBigNumber('999999999999.999999');
      
      expect(zeroBN.isZero()).toBe(true);
      expect(negativeBN.isNegative()).toBe(true);
      expect(largeBN.isGreaterThan(1000000000000)).toBe(false);
    });
  });
});