import { OrbiterBridge } from '../../../../apps/wasabee/services/orbiterBridge';

// Mock dependencies
jest.mock('@orbiter-finance/bridge-sdk', () => ({
  OrbiterClient: {
    create: jest.fn(() => Promise.resolve({
      getTradePairs: jest.fn(() => [
        {
          fromChainId: '1',
          toChainId: '137',
          fromToken: { symbol: 'USDC', address: '0x123' },
          toToken: { symbol: 'USDC', address: '0x456' },
          minAmount: '1',
          maxAmount: '10000',
        },
      ]),
      getRouter: jest.fn(() => ({
        buildTransaction: jest.fn(() => ({
          to: '0x789',
          data: '0xabcd',
          value: '0',
        })),
      })),
    })),
  },
  ENDPOINT: {
    MAINNET: 'https://api.orbiter.finance',
  },
}));

jest.mock('@honeypot/shared/lib/wallet', () => ({
  wallet: {
    address: '0x123',
    currentChain: {
      chainId: 1,
      validatedTokens: [
        { symbol: 'USDC', address: '0x123', decimals: 6 },
        { symbol: 'USDT', address: '0x456', decimals: 6 },
      ],
    },
  },
}));

jest.mock('@honeypot/shared', () => ({
  ContractWrite: jest.fn(),
}));

describe('OrbiterBridge', () => {
  let orbiterBridge: OrbiterBridge;

  beforeEach(() => {
    jest.clearAllMocks();
    orbiterBridge = new OrbiterBridge();
  });

  describe('Initialization', () => {
    it('should initialize OrbiterBridge with default values', () => {
      expect(orbiterBridge.selectedToken).toBeNull();
      expect(orbiterBridge.fromChainId).toBeNull();
      expect(orbiterBridge.toChainId).toBeNull();
      expect(orbiterBridge.fromAmount).toBe('');
      expect(orbiterBridge.tradePairs).toEqual([]);
      expect(orbiterBridge.router).toBeNull();
    });

    it('should create Orbiter client on initialization', async () => {
      const { OrbiterClient } = require('@orbiter-finance/bridge-sdk');
      
      await new Promise(resolve => setTimeout(resolve, 100)); // Wait for async initialization
      
      expect(OrbiterClient.create).toHaveBeenCalledWith({
        apiEndpoint: 'https://api.orbiter.finance',
        apiKey: 'xxxxxx',
        channelId: 'xxxxxx',
      });
    });
  });

  describe('Token Selection', () => {
    it('should set selected token', () => {
      const token = { symbol: 'USDC', address: '0x123', decimals: 6 };
      
      orbiterBridge.setSelectedToken(token);
      
      expect(orbiterBridge.selectedToken).toEqual(token);
    });

    it('should get available tokens from wallet', () => {
      const availableTokens = orbiterBridge.getAvailableTokens();
      
      expect(availableTokens).toEqual([
        { symbol: 'USDC', address: '0x123', decimals: 6 },
        { symbol: 'USDT', address: '0x456', decimals: 6 },
      ]);
    });
  });

  describe('Chain Management', () => {
    it('should set from chain ID', () => {
      orbiterBridge.setFromChainId('1');
      
      expect(orbiterBridge.fromChainId).toBe('1');
    });

    it('should set to chain ID', () => {
      orbiterBridge.setToChainId('137');
      
      expect(orbiterBridge.toChainId).toBe('137');
    });

    it('should swap chain IDs', () => {
      orbiterBridge.setFromChainId('1');
      orbiterBridge.setToChainId('137');
      
      orbiterBridge.swapChainIds();
      
      expect(orbiterBridge.fromChainId).toBe('137');
      expect(orbiterBridge.toChainId).toBe('1');
    });

    it('should handle null chain IDs when swapping', () => {
      orbiterBridge.setFromChainId('1');
      orbiterBridge.setToChainId(null);
      
      orbiterBridge.swapChainIds();
      
      expect(orbiterBridge.fromChainId).toBeNull();
      expect(orbiterBridge.toChainId).toBe('1');
    });
  });

  describe('Amount Management', () => {
    it('should set from amount', () => {
      orbiterBridge.setFromAmount('100');
      
      expect(orbiterBridge.fromAmount).toBe('100');
    });

    it('should calculate to amount based on trade pairs', async () => {
      // Setup mock trade pair
      orbiterBridge.tradePairs = [{
        fromChainId: '1',
        toChainId: '137',
        fromToken: { symbol: 'USDC', address: '0x123' },
        toToken: { symbol: 'USDC', address: '0x456' },
        minAmount: '1',
        maxAmount: '10000',
        exchangeRate: 0.999, // 0.1% fee
      }];
      
      orbiterBridge.setFromAmount('100');
      
      const toAmount = orbiterBridge.getToAmount();
      
      // Should calculate based on exchange rate and fees
      expect(typeof toAmount).toBe('string');
      expect(parseFloat(toAmount)).toBeGreaterThan(0);
    });
  });

  describe('Trade Pairs Management', () => {
    it('should update available trade pairs when chain or token changes', async () => {
      const mockOrbiter = {
        getTradePairs: jest.fn(() => Promise.resolve([
          {
            fromChainId: '1',
            toChainId: '137',
            fromToken: { symbol: 'USDC', address: '0x123' },
            toToken: { symbol: 'USDC', address: '0x456' },
            minAmount: '1',
            maxAmount: '10000',
          },
        ])),
      };
      
      orbiterBridge.orbiter = mockOrbiter;
      orbiterBridge.setFromChainId('1');
      orbiterBridge.setSelectedToken({ symbol: 'USDC', address: '0x123', decimals: 6 });
      
      await orbiterBridge.updateAvailableTradePairs();
      
      expect(mockOrbiter.getTradePairs).toHaveBeenCalled();
    });

    it('should handle trade pair fetch errors', async () => {
      const mockOrbiter = {
        getTradePairs: jest.fn(() => Promise.reject(new Error('API Error'))),
      };
      
      orbiterBridge.orbiter = mockOrbiter;
      
      await expect(orbiterBridge.updateAvailableTradePairs()).rejects.toThrow('API Error');
    });

    it('should filter trade pairs by selected criteria', () => {
      orbiterBridge.tradePairs = [
        {
          fromChainId: '1',
          toChainId: '137',
          fromToken: { symbol: 'USDC', address: '0x123' },
          toToken: { symbol: 'USDC', address: '0x456' },
        },
        {
          fromChainId: '1',
          toChainId: '56',
          fromToken: { symbol: 'USDC', address: '0x123' },
          toToken: { symbol: 'USDC', address: '0x789' },
        },
      ];
      
      orbiterBridge.setFromChainId('1');
      orbiterBridge.setToChainId('137');
      
      const filteredPairs = orbiterBridge.getFilteredTradePairs();
      
      expect(filteredPairs).toHaveLength(1);
      expect(filteredPairs[0].toChainId).toBe('137');
    });
  });

  describe('Router Management', () => {
    it('should update router when chain or token changes', async () => {
      const mockOrbiter = {
        getRouter: jest.fn(() => Promise.resolve({
          buildTransaction: jest.fn(),
        })),
      };
      
      orbiterBridge.orbiter = mockOrbiter;
      orbiterBridge.setFromChainId('1');
      
      await orbiterBridge.updateRouter();
      
      expect(mockOrbiter.getRouter).toHaveBeenCalled();
    });

    it('should handle router creation errors', async () => {
      const mockOrbiter = {
        getRouter: jest.fn(() => Promise.reject(new Error('Router Error'))),
      };
      
      orbiterBridge.orbiter = mockOrbiter;
      
      await expect(orbiterBridge.updateRouter()).rejects.toThrow('Router Error');
    });
  });

  describe('Transaction Building', () => {
    it('should build bridge transaction', async () => {
      const mockRouter = {
        buildTransaction: jest.fn(() => ({
          to: '0x789',
          data: '0xabcd',
          value: '100000000', // 100 USDC in wei
        })),
      };
      
      orbiterBridge.router = mockRouter;
      orbiterBridge.setFromAmount('100');
      orbiterBridge.setSelectedToken({ symbol: 'USDC', address: '0x123', decimals: 6 });
      
      const transaction = await orbiterBridge.buildBridgeTransaction();
      
      expect(mockRouter.buildTransaction).toHaveBeenCalledWith({
        fromAmount: '100',
        fromToken: { symbol: 'USDC', address: '0x123', decimals: 6 },
      });
      
      expect(transaction).toEqual({
        to: '0x789',
        data: '0xabcd',
        value: '100000000',
      });
    });

    it('should handle transaction building errors', async () => {
      const mockRouter = {
        buildTransaction: jest.fn(() => Promise.reject(new Error('Transaction Error'))),
      };
      
      orbiterBridge.router = mockRouter;
      
      await expect(orbiterBridge.buildBridgeTransaction()).rejects.toThrow('Transaction Error');
    });
  });

  describe('Validation', () => {
    it('should validate bridge parameters', () => {
      orbiterBridge.setFromChainId('1');
      orbiterBridge.setToChainId('137');
      orbiterBridge.setSelectedToken({ symbol: 'USDC', address: '0x123', decimals: 6 });
      orbiterBridge.setFromAmount('100');
      
      const isValid = orbiterBridge.validateBridgeParameters();
      
      expect(isValid).toBe(true);
    });

    it('should return false for invalid parameters', () => {
      // Missing required parameters
      const isValid = orbiterBridge.validateBridgeParameters();
      
      expect(isValid).toBe(false);
    });

    it('should validate amount against trade pair limits', () => {
      orbiterBridge.tradePairs = [{
        fromChainId: '1',
        toChainId: '137',
        fromToken: { symbol: 'USDC', address: '0x123' },
        toToken: { symbol: 'USDC', address: '0x456' },
        minAmount: '10',
        maxAmount: '1000',
      }];
      
      orbiterBridge.setFromAmount('5'); // Below minimum
      expect(orbiterBridge.isAmountValid()).toBe(false);
      
      orbiterBridge.setFromAmount('50'); // Within range
      expect(orbiterBridge.isAmountValid()).toBe(true);
      
      orbiterBridge.setFromAmount('2000'); // Above maximum
      expect(orbiterBridge.isAmountValid()).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle Orbiter client initialization failure', async () => {
      const { OrbiterClient } = require('@orbiter-finance/bridge-sdk');
      OrbiterClient.create.mockRejectedValue(new Error('Client Init Error'));
      
      const bridge = new OrbiterBridge();
      
      // Should not throw during construction
      expect(bridge.orbiter).toBeNull();
    });

    it('should handle missing wallet connection', () => {
      const wallet = require('@honeypot/shared/lib/wallet').wallet;
      wallet.address = null;
      
      const tokens = orbiterBridge.getAvailableTokens();
      
      expect(tokens).toEqual([]);
    });

    it('should handle network switching errors', async () => {
      orbiterBridge.setFromChainId('999'); // Unsupported chain
      
      const isValid = orbiterBridge.validateBridgeParameters();
      
      expect(isValid).toBe(false);
    });
  });

  describe('Fee Calculation', () => {
    it('should calculate bridge fees', () => {
      orbiterBridge.tradePairs = [{
        fromChainId: '1',
        toChainId: '137',
        fromToken: { symbol: 'USDC', address: '0x123' },
        toToken: { symbol: 'USDC', address: '0x456' },
        fee: '0.001', // 0.1% fee
      }];
      
      orbiterBridge.setFromAmount('1000');
      
      const fee = orbiterBridge.calculateFee();
      
      expect(fee).toBe('1'); // 0.1% of 1000
    });

    it('should handle missing fee information', () => {
      orbiterBridge.tradePairs = [{
        fromChainId: '1',
        toChainId: '137',
        fromToken: { symbol: 'USDC', address: '0x123' },
        toToken: { symbol: 'USDC', address: '0x456' },
        // No fee property
      }];
      
      const fee = orbiterBridge.calculateFee();
      
      expect(fee).toBe('0');
    });
  });

  describe('State Management', () => {
    it('should maintain state consistency', () => {
      orbiterBridge.setFromChainId('1');
      orbiterBridge.setToChainId('137');
      orbiterBridge.setSelectedToken({ symbol: 'USDC', address: '0x123', decimals: 6 });
      orbiterBridge.setFromAmount('100');
      
      expect(orbiterBridge.fromChainId).toBe('1');
      expect(orbiterBridge.toChainId).toBe('137');
      expect(orbiterBridge.selectedToken?.symbol).toBe('USDC');
      expect(orbiterBridge.fromAmount).toBe('100');
    });

    it('should reset state when needed', () => {
      orbiterBridge.setFromChainId('1');
      orbiterBridge.setSelectedToken({ symbol: 'USDC', address: '0x123', decimals: 6 });
      
      orbiterBridge.reset();
      
      expect(orbiterBridge.fromChainId).toBeNull();
      expect(orbiterBridge.toChainId).toBeNull();
      expect(orbiterBridge.selectedToken).toBeNull();
      expect(orbiterBridge.fromAmount).toBe('');
    });
  });
});