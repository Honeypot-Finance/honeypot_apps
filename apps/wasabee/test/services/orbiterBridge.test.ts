import { BigNumber } from 'bignumber.js';

import { OrbiterBridge } from '../../services/orbiterBridge';

// Mock OrbiterClient
jest.mock('@orbiter-finance/bridge-sdk', () => ({
  OrbiterClient: {
    create: jest.fn().mockResolvedValue({
      getAvailableTokens: jest.fn().mockReturnValue([
        {
          address: '0x123',
          decimals: 18,
          symbol: 'ETH',
          name: 'Ethereum',
          isNative: true,
        },
        {
          address: '0x456',
          decimals: 6,
          symbol: 'USDC',
          name: 'USD Coin',
          isNative: false,
        },
      ]),
      getAvailableTradePairs: jest.fn().mockReturnValue([
        {
          srcChainId: '1',
          dstChainId: '56',
          srcTokenSymbol: 'ETH',
          dstTokenSymbol: 'ETH',
        },
        {
          srcChainId: '1',
          dstChainId: '137',
          srcTokenSymbol: 'USDC',
          dstTokenSymbol: 'USDC',
        },
      ]),
      createRouter: jest.fn().mockReturnValue({
        routerConfig: {
          endpointContract: '0x789',
        },
        vc: 'test-vc',
        makerAddress: '0xmaker',
        simulationAmount: jest.fn().mockReturnValue({
          receiveAmount: '0.99',
        }),
        createTransaction: jest.fn().mockResolvedValue({
          value: BigInt('1000000000000000000'),
          raw: { value: '1000000000000000000' },
        }),
      }),
    }),
  },
  ENDPOINT: {
    MAINNET: 'https://api.orbiter.finance',
  },
}));

// Define types for better type safety
interface MockToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  isNative: boolean;
  chainId: string;
  logoURI?: string;
  balance?: string;
  approveIfNoAllowance?: jest.Mock;
}

// Mock the dynamic import
jest.mock('@honeypot/shared', () => ({
  Token: {
    getToken: jest.fn().mockImplementation((config): MockToken => ({
      ...config,
      logoURI: config.isNative ? 'native-logo.png' : 'token-logo.png',
      approveIfNoAllowance: jest.fn().mockResolvedValue(true),
    })),
  },
  ContractWrite: jest.fn().mockImplementation(() => ({
    call: jest.fn().mockResolvedValue({ hash: '0xtxhash' }),
  })),
}));

jest.mock('@honeypot/shared/lib/wallet', () => ({
  wallet: {
    account: '0x123456789abcdef',
    currentChain: {
      nativeToken: {
        logoURI: 'native-logo.png',
      },
      chain: {
        id: 1,
      },
    },
    currentChainId: 1,
    walletClient: {},
    publicClient: {},
  },
}));

// Mock contract utilities
jest.mock('../../lib/utils', () => ({
  ethAddressUtils: jest.fn().mockReturnValue('0xprocessed'),
}));

jest.mock('web3', () => {
  const mockWeb3 = {
    utils: {
      stringToHex: jest.fn().mockReturnValue('0xhex'),
    },
  };
  return {
    default: mockWeb3,
    __esModule: true,
  };
});

jest.mock('viem/actions', () => ({
  simulateContract: jest.fn().mockResolvedValue({
    result: true,
  }),
}));

// Mock the OrbiterRouterV3 contract
jest.mock('../../services/contract/orbiter/OrbiterRouterV3', () => ({
  OrbiterRouterV3: jest.fn().mockImplementation(() => ({
    address: '0x789',
    abi: [],
    contract: {
      write: {
        transferToken: jest.fn(),
        transfer: jest.fn(),
      },
    },
  })),
}));


// Get reference to the mocked client for test assertions
const mockOrbiterClient = {
  getAvailableTokens: jest.fn(),
  getAvailableTradePairs: jest.fn(),
  createRouter: jest.fn(),
};

describe('OrbiterBridge', () => {
  let orbiterBridge: OrbiterBridge;

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mock return values
    mockOrbiterClient.getAvailableTokens.mockReturnValue([
      {
        address: '0x123',
        decimals: 18,
        symbol: 'ETH',
        name: 'Ethereum',
        isNative: true,
      },
      {
        address: '0x456',
        decimals: 6,
        symbol: 'USDC',
        name: 'USD Coin',
        isNative: false,
      },
    ]);
    
    mockOrbiterClient.getAvailableTradePairs.mockReturnValue([
      {
        srcChainId: '1',
        dstChainId: '56',
        srcTokenSymbol: 'ETH',
        dstTokenSymbol: 'ETH',
      },
      {
        srcChainId: '1',
        dstChainId: '137',
        srcTokenSymbol: 'USDC',
        dstTokenSymbol: 'USDC',
      },
    ]);
    
    mockOrbiterClient.createRouter.mockReturnValue({
      routerConfig: {
        endpointContract: '0x789',
      },
      vc: 'test-vc',
      makerAddress: '0xmaker',
      simulationAmount: jest.fn().mockReturnValue({
        receiveAmount: '0.99',
      }),
      createTransaction: jest.fn().mockResolvedValue({
        value: BigInt('1000000000000000000'),
        raw: { value: '1000000000000000000' },
      }),
    });
    
    orbiterBridge = new OrbiterBridge();
    // Wait for orbiter client initialization
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Positive Tests', () => {
    test('should initialize with orbiter client', async () => {
      expect(orbiterBridge.orbiter).toBeTruthy();
    });

    test('should get available tokens for a chain', () => {
      const tokens = orbiterBridge.getAvailableTokens('1');
      
      expect(tokens).toHaveLength(2);
      expect(tokens[0].symbol).toBe('ETH');
      expect(tokens[1].symbol).toBe('USDC');
      // Note: We can't easily test the mock call since the orbiter client is private
      // But we can test the returned tokens structure
      expect(tokens[0]).toHaveProperty('logoURI');
      expect(tokens[1]).toHaveProperty('logoURI');
    });

    test('should calculate bridge amount correctly', () => {
      // Setup
      orbiterBridge.setFromChainId('1');
      orbiterBridge.setToChainId('56');
      orbiterBridge.setSelectedToken({
        symbol: 'ETH',
        address: '0x123',
        name: 'Ethereum',
        decimals: 18,
        isNative: true,
        chainId: '1',
      } as MockToken);
      orbiterBridge.setFromAmount('1.0');

      const toAmount = orbiterBridge.toAmount;
      
      expect(toAmount).toBe('0.99');
    });
  });

  describe('Negative Tests', () => {
    test('should return error when no trade pairs found', () => {
      orbiterBridge.setFromChainId('999'); // Non-existent chain
      orbiterBridge.setToChainId('1000');
      orbiterBridge.setSelectedToken({
        symbol: 'UNKNOWN',
        address: '0x999',
        name: 'Unknown Token',
        decimals: 18,
        isNative: false,
        chainId: '999',
      } as MockToken);

      const errorText = orbiterBridge.bridgeErrorText;
      
      expect(errorText).toBe('No trade pairs found');
    });

    test('should return error for insufficient balance', () => {
      const mockToken: MockToken = {
        symbol: 'ETH',
        address: '0x123',
        name: 'Ethereum',
        decimals: 18,
        isNative: true,
        chainId: '1',
        balance: '0.5', // Less than fromAmount
      };

      orbiterBridge.setFromChainId('1');
      orbiterBridge.setToChainId('56');
      orbiterBridge.setSelectedToken(mockToken);
      orbiterBridge.setFromAmount('1.0');

      const errorText = orbiterBridge.bridgeErrorText;
      
      expect(errorText).toBe('Insufficient balance');
    });

    test('should return zero amount when router is not available', () => {
      orbiterBridge.setFromChainId('999');
      orbiterBridge.setFromAmount('1.0');

      const toAmount = orbiterBridge.toAmount;
      
      expect(toAmount).toBe('0');
    });
  });

  describe('Edge Case Tests', () => {
    test('should handle bridge with native token', async () => {
      const nativeToken: MockToken = {
        symbol: 'ETH',
        address: '0x123',
        name: 'Ethereum',
        decimals: 18,
        isNative: true,
        chainId: '1',
        balance: '2.0',
      };

      orbiterBridge.setFromChainId('1');
      orbiterBridge.setToChainId('56');
      orbiterBridge.setSelectedToken(nativeToken);
      orbiterBridge.setFromAmount('1.0');

      await expect(orbiterBridge.bridge()).resolves.not.toThrow();
    });

    test('should handle bridge with ERC20 token', async () => {
      const erc20Token: MockToken = {
        symbol: 'USDC',
        address: '0x456',
        name: 'USD Coin',
        decimals: 6,
        isNative: false,
        chainId: '1',
        balance: '1000.0',
      };

      orbiterBridge.setFromChainId('1');
      orbiterBridge.setToChainId('137');
      orbiterBridge.setSelectedToken(erc20Token);
      orbiterBridge.setFromAmount('100.0');

      await expect(orbiterBridge.bridge()).resolves.not.toThrow();
    });

    test('should handle empty state gracefully', () => {
      const newBridge = new OrbiterBridge();
      
      expect(newBridge.selectedToken).toBeNull();
      expect(newBridge.fromChainId).toBeNull();
      expect(newBridge.toChainId).toBeNull();
      expect(newBridge.fromAmount).toBe('');
      expect(newBridge.toAmount).toBe('0');
    });
  });
});