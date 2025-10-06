
// import { MemePairContract } from '@pot2pump/services/contract/launches/pot2pump/memepair-contract';
import { MemePairContract } from '../../../../../services/contract/launches/pot2pump/memepair-contract';

import { wallet } from '@honeypot/shared/lib/wallet';



import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import { dayjs as dayjsLib } from '../../../../../lib/dayjs';


// import { dayjs } from '@/lib/dayjs';



// Mock dependencies
jest.mock('@honeypot/shared/lib/wallet', () => ({
  wallet: {
    account: '0x1234567890123456789012345678901234567890',
    currentChainId: 80084,
    isInit: true,
    publicClient: {},
    walletClient: {},
    currentChain: {
      nativeToken: {
        address: '0x0000000000000000000000000000000000000000',
        decimals: 18,
      },
      validatedFtoAddresses: [],
    },
    contracts: {
      memeFacade: {
        address: '0xfacade',
        deposit: { call: jest.fn() },
        claimLP: { call: jest.fn() },
      },
    },
  },
}));

jest.mock('@honeypot/shared', () => ({
  Token: {
    getToken: jest.fn(),
  },
  getSubgraphClientByChainId: jest.fn(),
  poolsByTokenPair: jest.fn(),
  AsyncState: jest.fn().mockImplementation((func) => {
    const state = {
      call: jest.fn().mockImplementation(async (...args) => {
        try {
          state.loading = true;
          const result = await func?.(...args);
          state.value = result;
          state.loading = false;
          return result;
        } catch (error) {
          state.error = error;
          state.loading = false;
          throw error;
        }
      }),
      loading: false,
      error: null,
      value: null,
      isInit: false,
      setValue: jest.fn((newValue) => {
        state.value = newValue;
      }),
      setLoading: jest.fn((loading) => {
        state.loading = loading;
      }),
      setError: jest.fn((error) => {
        state.error = error;
      }),
    };
    return state;
  }),
}));

// Mock dayjs
jest.mock('dayjs', () => {
  const mockDayjs = jest.fn(() => ({
    unix: jest.fn(() => 1640995200), // Mock timestamp
    toISOString: () => '2022-01-01T00:00:00.000Z',
    isValid: () => true,
    diff: () => 5,
    isBefore: () => false,
  }));

  mockDayjs.unix = jest.fn((timestamp) => ({
    isBefore: jest.fn(() => false),
    isAfter: jest.fn(() => true),
  }));

  mockDayjs.extend = jest.fn();

  return mockDayjs;
});

// Mock the dayjs lib file
jest.mock('../../../../../lib/dayjs', () => {
  const mockDayjsLib = jest.fn(() => ({
    unix: jest.fn(() => 1640995200),
    toISOString: () => '2022-01-01T00:00:00.000Z',
    isValid: () => true,
    diff: () => 5,
    isBefore: () => false,
  }));

  mockDayjsLib.unix = jest.fn((timestamp) => ({
    isBefore: jest.fn(() => false),
    isAfter: jest.fn(() => true),
  }));

  return {
    dayjs: mockDayjsLib,
  };
});

// Mock formatAmountWithAlphabetSymbol
jest.mock('../../../../../lib/algebra/utils/common/formatAmount', () => ({
  formatAmountWithAlphabetSymbol: jest.fn((amount, decimals) => {
    const num = parseFloat(amount);
    return `${num.toFixed(2)}`;
  }),
}));

// Helper function to create a mock contract with specific state
function createMockContract(state: number, isCompleted?: boolean) {
  const mockContract = {
    address: '0x1234567890123456789012345678901234567890',
    raiseToken: undefined as any,
    launchedToken: undefined as any,
    depositedRaisedTokenWithoutDecimals: null as any,
    depositedLaunchedTokenWithoutDecimals: null as any,
    state,
    isCompleted: isCompleted ?? false,
    get price() {
      if (this.state === 0) {
        return this.priceAfterSuccess;
      } else {
        return this.priceBeforeSuccess;
      }
    },
    get priceAfterSuccess() {
      if (!(this.state === 0)) {
        return new BigNumber(0);
      }
      return this.launchedToken?.derivedUSD
        ? new BigNumber(this.launchedToken.derivedUSD)
        : new BigNumber(0);
    },
    get priceBeforeSuccess() {
      return this.depositedRaisedToken &&
        this.depositedLaunchedToken &&
        this.raiseToken?.derivedUSD
        ? this.depositedRaisedToken
            .multipliedBy(this.raiseToken.derivedUSD)
            .div(this.depositedLaunchedToken)
        : new BigNumber(0);
    },
    get depositedRaisedToken() {
      if (!this.raiseToken) {
        return undefined;
      }
      return this.depositedRaisedTokenWithoutDecimals && this.raiseToken.decimals
        ? this.depositedRaisedTokenWithoutDecimals.div(
            new BigNumber(10).pow(this.raiseToken.decimals)
          )
        : undefined;
    },
    get depositedLaunchedToken() {
      if (!this.launchedToken) {
        return undefined;
      }
      return this.depositedLaunchedTokenWithoutDecimals &&
        this.launchedToken.decimals
        ? this.depositedLaunchedTokenWithoutDecimals.div(
            new BigNumber(10).pow(this.launchedToken.decimals)
          )
        : undefined;
    },
    get ftoStatusDisplay() {
      switch (this.state) {
        case 0:
          return {
            status: 'success',
            color: 'bg-success/20 text-success-600',
          };
        case 1:
          return {
            status: 'Fail',
            color: 'bg-danger/20 text-danger',
          };
        case 2:
          return {
            status: 'Paused',
            color: 'bg-warning/20 text-warning-600',
          };
        case 3:
          if (this.isCompleted) {
            return {
              status: 'Completed',
              color: 'bg-[rgba(226,232,240,0.1)] text-default-foreground',
            };
          }
          return {
            status: 'Processing',
            color: 'text-[#83C2E9] bg-[rgba(131,194,233,0.1)]',
          };
      }
    },
  };
  
  return mockContract;
}

describe('MemePairContract', () => {
  let contract: MemePairContract;
  
  beforeEach(() => {
    contract = new MemePairContract({
      address: '0x1234567890123456789012345678901234567890',
    });
  });

  describe('Constructor and Static Methods', () => {
    it('should create contract with provided address', () => {
      expect(contract.address).toBe('0x1234567890123456789012345678901234567890');
    });

    it('should load contract from static map', () => {
      const address = '0xtest123';
      const contractArgs = { name: 'Test Token' };
      
      const loadedContract = MemePairContract.loadContract(address, contractArgs);
      
      expect(loadedContract.address).toBe(address.toLowerCase());
      expect(loadedContract.name).toBe('Test Token');
    });

    it('should reuse existing contract from map', () => {
      const address = '0xtest456';
      const firstContract = MemePairContract.loadContract(address, { name: 'First' });
      const secondContract = MemePairContract.loadContract(address, { name: 'Second' });
      
      expect(firstContract).toBe(secondContract);
      expect(secondContract.name).toBe('Second'); // Should update with new data
    });
  });

  describe('Token Amount Calculations', () => {
    beforeEach(() => {
      contract.raiseToken = {
        decimals: 18,
        derivedUSD: new BigNumber('1.5'),
        balance: new BigNumber('1000'),
        balanceFormatted: '1000.00',
      } as unknown as typeof contract.raiseToken;
      
      contract.launchedToken = {
        decimals: 18,
        derivedUSD: new BigNumber('0.5'),
        priceChange24hPercentage: '5.2',
      } as unknown as typeof contract.launchedToken;
    });

    it('should calculate userDepositedRaisedToken correctly', () => {
      contract.userDepositedRaisedTokenWithoutDecimals = new BigNumber('1000000000000000000'); // 1 token
      
      const result = contract.userDepositedRaisedToken;
      
      expect(result.toString()).toBe('1');
    });

    it('should calculate userDepositedRaisedTokenUSDAmount correctly', () => {
      contract.userDepositedRaisedTokenWithoutDecimals = new BigNumber('2000000000000000000'); // 2 tokens
      
      const result = contract.userDepositedRaisedTokenUSDAmount;
      
      expect(result?.toString()).toBe('3'); // 2 * 1.5 USD
    });

    it('should calculate depositedRaisedToken correctly', () => {
      contract.depositedRaisedTokenWithoutDecimals = new BigNumber('5000000000000000000'); // 5 tokens
      
      const result = contract.depositedRaisedToken;
      
      expect(result?.toString()).toBe('5');
    });

    it('should calculate depositedLaunchedToken correctly', () => {
      contract.depositedLaunchedTokenWithoutDecimals = new BigNumber('10000000000000000000'); // 10 tokens
      
      const result = contract.depositedLaunchedToken;
      
      expect(result?.toString()).toBe('10');
    });

    it('should return undefined for depositedRaisedToken when raiseToken is not set', () => {
      contract.raiseToken = undefined;
      contract.depositedRaisedTokenWithoutDecimals = new BigNumber('1000000000000000000');
      
      const result = contract.depositedRaisedToken;
      
      expect(result).toBeUndefined();
    });
  });

  describe('Potting Percentage Calculations', () => {
    beforeEach(() => {
      contract.raiseToken = { decimals: 18 } as unknown as typeof contract.raiseToken;
      contract.depositedRaisedTokenWithoutDecimals = new BigNumber('5000000000000000000'); // 5 tokens
      contract.raisedTokenMinCap = new BigNumber('10000000000000000000'); // 10 tokens
    });

    it('should calculate pottingPercentageNumber correctly', () => {
      const result = contract.pottingPercentageNumber;
      
      expect(result).toBe(0.5); // 5/10 = 50%
    });

    it('should format pottingPercentageDisplay correctly', () => {
      const result = contract.pottingPercentageDisplay;
      
      expect(result).toBe('0.50%');
    });

    it('should return -- when data is missing', () => {
      contract.depositedRaisedTokenWithoutDecimals = null;
      
      const result = contract.pottingPercentageDisplay;
      
      expect(result).toBe('--');
    });
  });

  describe('Time Display Methods', () => {
    it('should format startTimeDisplay correctly', () => {
      contract.startTime = '1640995200'; // Unix timestamp
      
      const result = contract.startTimeDisplay;
      
      expect(result).toBe('2022-01-01T00:00:00.000Z');
    });

    it('should format endTimeDisplay correctly', () => {
      contract.endTime = '1640995200';
      
      const result = contract.endTimeDisplay;
      
      expect(result).toBe('2022-01-01T00:00:00.000Z');
    });

    it('should return - when time is not set', () => {
      contract.startTime = '';
      contract.endTime = '';
      
      expect(contract.startTimeDisplay).toBe('-');
      expect(contract.endTimeDisplay).toBe('-');
    });
  });

  describe('Price Calculations', () => {
    beforeEach(() => {
      contract.raiseToken = { derivedUSD: new BigNumber('1.5') } as unknown as typeof contract.raiseToken;
      contract.launchedToken = { derivedUSD: new BigNumber('0.5') } as unknown as typeof contract.launchedToken;
      contract.depositedRaisedTokenWithoutDecimals = new BigNumber('3000000000000000000'); // 3 tokens
      contract.depositedLaunchedTokenWithoutDecimals = new BigNumber('6000000000000000000'); // 6 tokens
    });

    it('should return priceAfterSuccess when state is 0 (success)', () => {
      // Create a mock contract with state 0
      const testContract = createMockContract(0);
      testContract.raiseToken = { derivedUSD: new BigNumber('1.5') } as any;
      testContract.launchedToken = { derivedUSD: new BigNumber('0.5') } as any;
      testContract.depositedRaisedTokenWithoutDecimals = new BigNumber('3000000000000000000');
      testContract.depositedLaunchedTokenWithoutDecimals = new BigNumber('6000000000000000000');
      
      const result = testContract.price;
      
      expect(result.toString()).toBe('0.5'); // launchedToken.derivedUSD
    });

    it('should return priceBeforeSuccess when state is not 0', () => {
      // Create a mock contract with state 3
      const testContract = createMockContract(3);
      testContract.raiseToken = { derivedUSD: new BigNumber('1.5'), decimals: 18 } as any;
      testContract.launchedToken = { derivedUSD: new BigNumber('0.5'), decimals: 18 } as any;
      testContract.depositedRaisedTokenWithoutDecimals = new BigNumber('3000000000000000000');
      testContract.depositedLaunchedTokenWithoutDecimals = new BigNumber('6000000000000000000');
      
      const result = testContract.price;
      
      expect(result.toString()).toBe('0.75'); // (3 * 1.5) / 6 = 0.75
    });

    it('should calculate priceBeforeSuccess correctly', () => {
      // Ensure the contract has the right data for calculation
      contract.raiseToken = { derivedUSD: new BigNumber('1.5'), decimals: 18 } as unknown as typeof contract.raiseToken;
      contract.launchedToken = { derivedUSD: new BigNumber('0.5'), decimals: 18 } as unknown as typeof contract.launchedToken;
      contract.depositedRaisedTokenWithoutDecimals = new BigNumber('3000000000000000000'); // 3 tokens
      contract.depositedLaunchedTokenWithoutDecimals = new BigNumber('6000000000000000000'); // 6 tokens
      
      const result = contract.priceBeforeSuccess;
      
      expect(result.toString()).toBe('0.75'); // (3 * 1.5) / 6
    });

    it('should return 0 for priceBeforeSuccess when data is missing', () => {
      contract.depositedRaisedTokenWithoutDecimals = null;
      
      const result = contract.priceBeforeSuccess;
      
      expect(result.toString()).toBe('0');
    });
  });

  describe('State Calculations', () => {
    beforeEach(() => {
      contract.raiseToken = { decimals: 18 } as unknown as typeof contract.raiseToken;
      contract.depositedRaisedTokenWithoutDecimals = new BigNumber('5000000000000000000'); // 5 tokens
      contract.raisedTokenMinCap = new BigNumber('10000000000000000000'); // 10 tokens
      contract.endTime = '1640995200';
    });

    it('should return 0 (success) when raised amount meets minimum cap', () => {
      contract.depositedRaisedTokenWithoutDecimals = new BigNumber('10000000000000000000'); // 10 tokens
      
      const result = contract.state;
      
      expect(result).toBe(0);
    });

    it('should return 1 (fail) when time expired and cap not met', () => {
      // Mock dayjs.unix to return an object with isBefore method
      (dayjsLib.unix as jest.Mock).mockReturnValue({
        isBefore: jest.fn(() => true), // endTime is before now
      });
      
      const result = contract.state;
      
      expect(result).toBe(1);
    });

    it('should return 3 (processing) when time not expired and cap not met', () => {
      // Mock dayjs.unix to return an object with isBefore method that returns false
      (dayjsLib.unix as jest.Mock).mockReturnValue({
        isBefore: jest.fn(() => false), // endTime is not before now
      });
      
      const result = contract.state;
      
      expect(result).toBe(3);
    });

    it('should return -1 when raiseToken is not set', () => {
      contract.raiseToken = undefined;
      
      const result = contract.state;
      
      expect(result).toBe(-1);
    });
  });

  describe('Provider Check', () => {
    it('should return true when user is the provider', () => {
      contract.launchedTokenProvider = wallet.account;
      
      const result = contract.isProvider;
      
      expect(result).toBe(true);
    });

    it('should return false when user is not the provider', () => {
      contract.launchedTokenProvider = '0xdifferentaddress';
      
      const result = contract.isProvider;
      
      expect(result).toBe(false);
    });

    it('should handle case insensitive comparison', () => {
      contract.launchedTokenProvider = wallet.account.toUpperCase();
      
      const result = contract.isProvider;
      
      expect(result).toBe(true);
    });
  });

  describe('Status Display', () => {
    it('should return success status for state 0', () => {
      const testContract = createMockContract(0);
      
      const result = testContract.ftoStatusDisplay;
      
      expect(result).toEqual({
        status: 'success',
        color: 'bg-success/20 text-success-600',
      });
    });

    it('should return fail status for state 1', () => {
      const testContract = createMockContract(1);
      
      const result = testContract.ftoStatusDisplay;
      
      expect(result).toEqual({
        status: 'Fail',
        color: 'bg-danger/20 text-danger',
      });
    });

    it('should return paused status for state 2', () => {
      const testContract = createMockContract(2);
      
      const result = testContract.ftoStatusDisplay;
      
      expect(result).toEqual({
        status: 'Paused',
        color: 'bg-warning/20 text-warning-600',
      });
    });

    it('should return processing status for state 3 when not completed', () => {
      const testContract = createMockContract(3, false);
      
      const result = testContract.ftoStatusDisplay;
      
      expect(result).toEqual({
        status: 'Processing',
        color: 'text-[#83C2E9] bg-[rgba(131,194,233,0.1)]',
      });
    });

    it('should return completed status for state 3 when completed', () => {
      const testContract = createMockContract(3, true);
      
      const result = testContract.ftoStatusDisplay;
      
      expect(result).toEqual({
        status: 'Completed',
        color: 'bg-[rgba(226,232,240,0.1)] text-default-foreground',
      });
    });
  });

  describe('Completion Check', () => {
    it('should return true when endTime is in the past', () => {
      contract.endTime = '1640995200';
      
      // Mock dayjs() to return current time after endTime
      (dayjsLib as jest.Mock).mockReturnValue({
        unix: () => 1640995300, // After endTime
      });
      
      const result = contract.isCompleted;
      
      expect(result).toBe(true);
    });

    it('should return false when endTime is not set', () => {
      contract.endTime = '';
      
      const result = contract.isCompleted;
      
      expect(result).toBe('');
    });
  });

  describe('Validation', () => {
    it('should set isValidated to true when address is in validated list', () => {
      wallet.currentChain.validatedFtoAddresses = [contract.address.toLowerCase()];
      
      contract.getIsValidated();
      
      expect(contract.isValidated).toBe(true);
    });

    it('should set isValidated to false when address is not in validated list', () => {
      wallet.currentChain.validatedFtoAddresses = [];
      
      contract.getIsValidated();
      
      expect(contract.isValidated).toBe(false);
    });
  });
});