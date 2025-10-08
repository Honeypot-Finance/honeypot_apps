import { crossChainSwapService } from '../../services/crossChainSwap';
import { BigNumber } from 'bignumber.js';

// Define types for better type safety
interface MockToken {
  address: string;
  chainId: string;
  isNative: boolean;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  isInit: boolean;
  balance: BigNumber;
  balanceFormatted: string;
  init: jest.Mock;
  getBalance: jest.Mock;
}

interface MockNetwork {
  chainId: number;
  displayName: string;
  chain: { name: string };
  nativeToken: {
    name: string;
    symbol: string;
    decimals: number;
    logoURI: string;
  };
  wrappedNativeToken?: {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    logoURI: string;
  };
}

interface MockChain {
  chainId: number;
  displayName: string;
  chain: { name: string };
  nativeToken: {
    name: string;
    symbol: string;
    decimals: number;
    logoURI: string;
  };
}

// Mock the lazy-loaded shared library
const mockSharedLib = {
  wallet: {
    account: '0x123456789abcdef',
    isInit: true,
    currentChainId: 1,
    universalAccount: {
      accountUsdValue: 1000,
    },
  },
  networks: [
    {
      chainId: 1,
      displayName: 'Ethereum',
      chain: { name: 'Ethereum' },
      nativeToken: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
        logoURI: 'https://example.com/eth.png',
      },
      wrappedNativeToken: {
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        name: 'Wrapped Ether',
        symbol: 'WETH',
        decimals: 18,
        logoURI: 'https://example.com/weth.png',
      },
    },
    {
      chainId: 56,
      displayName: 'BSC',
      chain: { name: 'BSC' },
      nativeToken: {
        name: 'BNB',
        symbol: 'BNB',
        decimals: 18,
        logoURI: 'https://example.com/bnb.png',
      },
    },
  ] as MockNetwork[],
  Token: {
    getToken: jest.fn().mockImplementation(
      (config): MockToken => ({
        ...config,
        isInit: false,
        balance: new BigNumber(100),
        balanceFormatted: '100.0',
        init: jest.fn().mockResolvedValue(true),
        getBalance: jest.fn().mockResolvedValue(new BigNumber(100)),
      })
    ),
  },
};

// Mock the dynamic import
jest.mock('@honeypot/shared', () => mockSharedLib);

// Mock universalAccountService
jest.mock('../../services/universalAccountService', () => ({
  universalAccountService: {
    availableChains: [
      { chainId: 1, name: 'Ethereum' },
      { chainId: 56, name: 'BSC' },
    ],
  },
}));

// Mock viem
jest.mock('viem', () => ({
  createPublicClient: jest.fn().mockReturnValue({
    getBalance: jest.fn().mockResolvedValue(BigInt('1000000000000000000')),
    readContract: jest.fn().mockResolvedValue(BigInt('1000000000000000000')),
  }),
  http: jest.fn(),
  formatUnits: jest.fn().mockImplementation((value, decimals) => {
    return (Number(value) / Math.pow(10, decimals)).toString();
  }),
  zeroAddress: '0x0000000000000000000000000000000000000000',
}));

// Mock trpc client
const mockTrpcClient = {
  priceFeed: {
    getSingleTokenPrice: {
      query: jest.fn().mockResolvedValue({
        status: 'success',
        data: { price: 2000 },
      }),
    },
  },
};

jest.mock('@honeypot/shared/lib/trpc/trpc', () => ({
  trpcClient: mockTrpcClient,
}));

describe('CrossChainSwapService', () => {
  let service: typeof crossChainSwapService;

  beforeEach(() => {
    service = crossChainSwapService;
    jest.clearAllMocks();
  });

  describe('Positive Tests', () => {
    test('should initialize with default chains', async () => {
      await new Promise((resolve) => setTimeout(resolve, 150)); // Wait for initialization

      expect(service.fromChain).toBeTruthy();
      expect(service.toChain).toBeTruthy();
      expect(service.availableChains).toHaveLength(2);
    });

    test('should set from and to chains correctly', () => {
      const mockChain: MockChain = { 
        chainId: 1, 
        displayName: 'Ethereum',
        chain: { name: 'Ethereum' },
        nativeToken: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
          logoURI: 'https://example.com/eth.png',
        }
      };

      service.setFromChain(mockChain as MockNetwork);
      service.setToChain(mockChain as MockNetwork);

      expect(service.fromChain).toEqual(mockChain);
      expect(service.toChain).toEqual(mockChain);
    });

    test('should get quote for valid swap parameters', async () => {
      // Setup
      const mockFromToken: Partial<MockToken> = {
        symbol: 'ETH',
        decimals: 18,
        chainId: '1',
        address: '0x0000000000000000000000000000000000000000',
        isNative: true,
      };
      const mockToToken: Partial<MockToken> = {
        symbol: 'USDC',
        decimals: 6,
        chainId: '56',
        address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
        isNative: false,
      };
      const mockToChain: Partial<MockNetwork> = {
        chainId: 56,
        displayName: 'BSC',
        chain: { name: 'BSC' },
      };

      service.fromToken = mockFromToken as MockToken;
      service.toToken = mockToToken as MockToken;
      service.toChain = mockToChain as MockNetwork;

      const quote = await service.getQuote('1.0');

      expect(quote).toBeDefined();
      expect(quote.toAmount).toBeTruthy();
      expect(quote.priceImpact).toBeGreaterThan(0);
      expect(quote.estimatedTime).toBeGreaterThan(0);
      expect(quote.route).toBeInstanceOf(Array);
    });
  });

  describe('Negative Tests', () => {
    test('should return empty quote when tokens are not set', async () => {
      service.fromToken = null;
      service.toToken = null;

      const quote = await service.getQuote('1.0');

      expect(quote.toAmount).toBe('');
      expect(quote.priceImpact).toBe(0);
      expect(quote.estimatedTime).toBe(0);
      expect(quote.route).toEqual([]);
    });

    test('should return empty quote for zero amount', async () => {
      const mockToken: Partial<MockToken> = { symbol: 'ETH', decimals: 18 };
      service.fromToken = mockToken as MockToken;
      service.toToken = mockToken as MockToken;

      const quote = await service.getQuote('0');

      expect(quote.toAmount).toBe('');
      expect(quote.priceImpact).toBe(0);
    });

    test('should handle price fetch errors gracefully', async () => {
      mockTrpcClient.priceFeed.getSingleTokenPrice.query.mockRejectedValueOnce(
        new Error('Price fetch failed')
      );

      const mockFromToken: Partial<MockToken> = {
        symbol: 'ETH',
        decimals: 18,
        chainId: '1',
        isNative: true,
      };
      const mockToToken: Partial<MockToken> = {
        symbol: 'USDC',
        decimals: 6,
        chainId: '56',
        isNative: false,
      };

      service.fromToken = mockFromToken as MockToken;
      service.toToken = mockToToken as MockToken;
      service.toChain = { chainId: 56 } as MockNetwork;

      const quote = await service.getQuote('1.0');

      expect(quote.toAmount).toBe('');
      expect(quote.route).toContain('Price data unavailable');
    });
  });

  describe('Edge Case Tests', () => {
    test('should handle very small amounts correctly', async () => {
      const mockFromToken: Partial<MockToken> = {
        symbol: 'ETH',
        decimals: 18,
        chainId: '1',
        isNative: true,
      };
      const mockToToken: Partial<MockToken> = {
        symbol: 'USDC',
        decimals: 6,
        chainId: '56',
        isNative: false,
      };

      service.fromToken = mockFromToken as MockToken;
      service.toToken = mockToToken as MockToken;
      service.toChain = { chainId: 56 } as MockNetwork;

      const quote = await service.getQuote('0.000000001');

      expect(quote.toAmount).toBe('');
      expect(quote.priceImpact).toBe(0);
    });

    test('should swap chains correctly', () => {
      const chain1: MockChain = { 
        chainId: 1, 
        displayName: 'Ethereum',
        chain: { name: 'Ethereum' },
        nativeToken: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
          logoURI: 'https://example.com/eth.png',
        }
      };
      const chain2: MockChain = { 
        chainId: 56, 
        displayName: 'BSC',
        chain: { name: 'BSC' },
        nativeToken: {
          name: 'BNB',
          symbol: 'BNB',
          decimals: 18,
          logoURI: 'https://example.com/bnb.png',
        }
      };
      const token1: Partial<MockToken> = { symbol: 'ETH' };
      const token2: Partial<MockToken> = { symbol: 'BNB' };

      service.fromChain = chain1 as MockNetwork;
      service.toChain = chain2 as MockNetwork;
      service.fromToken = token1 as MockToken;
      service.toToken = token2 as MockToken;

      service.swapChains();

      expect(service.fromChain).toEqual(chain2);
      expect(service.toChain).toEqual(chain1);
      expect(service.fromToken).toEqual(token2);
      expect(service.toToken).toEqual(token1);
    });

    test('should handle stablecoin price fallback', async () => {
      mockTrpcClient.priceFeed.getSingleTokenPrice.query.mockResolvedValueOnce({
        status: 'error',
        data: null,
      });

      const mockFromToken: Partial<MockToken> = {
        symbol: 'USDC',
        decimals: 6,
        chainId: '1',
        isNative: false,
      };
      const mockToToken: Partial<MockToken> = {
        symbol: 'USDT',
        decimals: 6,
        chainId: '56',
        isNative: false,
      };
      const mockToChain: Partial<MockNetwork> = {
        chainId: 56,
        displayName: 'BSC',
        chain: { name: 'BSC' },
      };

      service.fromToken = mockFromToken as MockToken;
      service.toToken = mockToToken as MockToken;
      service.toChain = mockToChain as MockNetwork;

      const quote = await service.getQuote('100');

      // Should still calculate quote using $1 fallback for stablecoins
      expect(quote.toAmount).toBeTruthy();
    });
  });
});
