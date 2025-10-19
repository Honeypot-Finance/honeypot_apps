
import { portfolio } from '../../services/portfolio';
import BigNumber from 'bignumber.js';

// Define types for better type safety
interface MockToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  derivedUSD: string | BigNumber;
  balance: BigNumber;
  getBalance: jest.Mock;
  getIndexerTokenData: jest.Mock;
}

interface MockValidatedToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  derivedUSD: string;
}

interface MockNativeToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  derivedUSD: string;
  balance: BigNumber;
}

// Mock the shared library
jest.mock('@honeypot/shared', () => {
  const BigNumber = require('bignumber.js');
  return {
    Token: {
      getToken: jest.fn().mockImplementation((config) => ({
        ...config,
        balance: new BigNumber(config.address === '0x123' ? 100 : 50),
        derivedUSD: config.derivedUSD || '1.0',
        getBalance: jest.fn().mockResolvedValue(new BigNumber(100)),
        getIndexerTokenData: jest.fn().mockResolvedValue({}),
      })),
    },
    AsyncState: jest.fn().mockImplementation((fn) => ({
      call: fn,
      isLoading: false,
      error: null,
    })),
    getSubgraphClientByChainId: jest.fn().mockReturnValue({}),
  };
});

// Mock wallet
jest.mock('@honeypot/shared/lib/wallet', () => {
  const BigNumber = require('bignumber.js');
  return {
    wallet: {
      account: '0x123456789abcdef',
      isInit: true,
      currentChainId: 1,
      currentChain: {
        validatedTokens: [
          {
            address: '0x123',
            symbol: 'TEST1',
            name: 'Test Token 1',
            decimals: 18,
            derivedUSD: '2.5',
          },
          {
            address: '0x456',
            symbol: 'TEST2',
            name: 'Test Token 2',
            decimals: 6,
            derivedUSD: '1.0',
          },
        ],
        nativeToken: {
          address: '0x0',
          symbol: 'ETH',
          name: 'Ethereum',
          decimals: 18,
          derivedUSD: '2000',
          balance: new BigNumber(1),
        },
      },
    },
  };
});

// Mock graphql clients
jest.mock('../../lib/algebra/graphql/clients/token', () => ({
  getMultipleTokensData: jest.fn().mockResolvedValue([
    {
      id: '0x123',
      symbol: 'TEST1',
      name: 'Test Token 1',
      decimals: 18,
      derivedMatic: '2.5',
      derivedUSD: '2.5',
      marketCap: '1000000',
    },
    {
      id: '0x456',
      symbol: 'TEST2',
      name: 'Test Token 2',
      decimals: 6,
      derivedMatic: '1.0',
      derivedUSD: '1.0',
      marketCap: '500000',
    },
  ]),
}));

jest.mock('../../lib/algebra/graphql/clients/account', () => ({
  getSingleAccountDetails: jest.fn().mockResolvedValue({
    account: {
      holder: [
        { token: { id: '0x789' } },
        { token: { id: '0xabc' } },
      ],
    },
  }),
}));

describe('Portfolio', () => {
  beforeEach(() => {
    // Reset portfolio state
    portfolio.tokens = [];
    portfolio.isInit = false;
    portfolio.isLoading = true;
    jest.clearAllMocks();
  });

  describe('Positive Tests', () => {
    test('should initialize portfolio with tokens', async () => {
      await portfolio.initPortfolio();
      
      expect(portfolio.isInit).toBe(true);
      expect(portfolio.isLoading).toBe(false);
      expect(portfolio.tokens.length).toBeGreaterThan(0);
    });

    test('should calculate total balance correctly', async () => {
      // Setup tokens with balances
      portfolio.tokens = [
        {
          balance: new BigNumber(100),
          derivedUSD: new BigNumber(2.5),
        } as MockToken,
        {
          balance: new BigNumber(50),
          derivedUSD: new BigNumber(1.0),
        } as MockToken,
      ];

      const totalBalance = portfolio.totalBalance;
      
      expect(totalBalance.toNumber()).toBe(300); // (100 * 2.5) + (50 * 1.0)
    });

    test('should format total balance correctly', async () => {
      portfolio.tokens = [
        {
          balance: new BigNumber(100),
          derivedUSD: new BigNumber(2.5),
        } as MockToken,
      ];

      const formattedBalance = portfolio.totalBalanceFormatted;
      
      expect(formattedBalance).toBe('250.00');
    });
  });

  describe('Negative Tests', () => {
    test('should handle initialization when wallet is not initialized', async () => {
      // Mock wallet module to get reference
      const { wallet } = require('@honeypot/shared/lib/wallet');
      wallet.isInit = false;
      
      await portfolio.initPortfolio();
      
      expect(portfolio.isInit).toBe(false);
    });

    test('should handle empty token list', () => {
      portfolio.tokens = [];
      
      const totalBalance = portfolio.totalBalance;
      const sortedTokens = portfolio.sortedTokens;
      
      expect(totalBalance.toNumber()).toBe(0);
      expect(sortedTokens).toHaveLength(0);
    });

    test('should handle tokens with zero balance', () => {
      portfolio.tokens = [
        {
          balance: new BigNumber(0),
          derivedUSD: new BigNumber(2.5),
        } as MockToken,
      ];

      const totalBalance = portfolio.totalBalance;
      
      expect(totalBalance.toNumber()).toBe(0);
    });
  });

  describe('Edge Case Tests', () => {
    test('should sort tokens by USD value correctly', () => {
      portfolio.tokens = [
        {
          symbol: 'LOW',
          balance: new BigNumber(10),
          derivedUSD: new BigNumber(1),
        } as MockToken,
        {
          symbol: 'HIGH',
          balance: new BigNumber(100),
          derivedUSD: new BigNumber(5),
        } as MockToken,
        {
          symbol: 'MID',
          balance: new BigNumber(50),
          derivedUSD: new BigNumber(2),
        } as MockToken,
      ];

      const sortedTokens = portfolio.sortedTokens;
      
      expect(sortedTokens[0].symbol).toBe('HIGH'); // 100 * 5 = 500
      expect(sortedTokens[1].symbol).toBe('MID');  // 50 * 2 = 100
      expect(sortedTokens[2].symbol).toBe('LOW');  // 10 * 1 = 10
    });

    test('should refresh balances correctly', async () => {
      const mockToken: Partial<MockToken> = {
        getBalance: jest.fn().mockResolvedValue(new BigNumber(200)),
        getIndexerTokenData: jest.fn().mockResolvedValue({}),
      };
      
      portfolio.tokens = [mockToken as MockToken];

      await portfolio.refreshBalances.call();
      
      expect(mockToken.getBalance).toHaveBeenCalled();
      expect(mockToken.getIndexerTokenData).toHaveBeenCalledWith({ force: true });
    });

    test('should handle tokens with undefined derivedUSD', () => {
      portfolio.tokens = [
        {
          balance: new BigNumber(100),
          derivedUSD: undefined,
        } as MockToken,
        {
          balance: new BigNumber(50),
          derivedUSD: new BigNumber(2),
        } as MockToken,
      ];

      const sortedTokens = portfolio.sortedTokens;
      
      // Token with undefined derivedUSD should be sorted last
      expect(sortedTokens[0].derivedUSD).toBeDefined();
      expect(sortedTokens[1].derivedUSD).toBeUndefined();
    });
  });
});