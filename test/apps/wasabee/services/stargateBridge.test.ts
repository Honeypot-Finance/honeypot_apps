import { StargateBridge } from '../../../../apps/wasabee/services/stargateBridge';

// Mock dependencies
jest.mock('@honeypot/shared/lib/wallet', () => ({
  wallet: {
    address: '0x123',
    currentChain: {
      chainId: 1,
      validatedTokens: [
        { symbol: 'USDC', address: '0x123', decimals: 6 },
        { symbol: 'USDT', address: '0x456', decimals: 6 },
        { symbol: 'ETH', address: '0x789', decimals: 18 },
      ],
    },
  },
}));

jest.mock('../../../../apps/wasabee/config/stargateConfig', () => ({
  stargateSupportedToken: ['USDC', 'USDT'],
  stargateSupportedChain: [
    { chainId: 1, name: 'Ethereum' },
    { chainId: 137, name: 'Polygon' },
    { chainId: 56, name: 'BSC' },
  ],
}));

// Mock fetch for Stargate API
global.fetch = jest.fn();

describe('StargateBridge', () => {
  let stargateBridge: StargateBridge;

  beforeEach(() => {
    jest.clearAllMocks();
    stargateBridge = new StargateBridge();
    (fetch as jest.Mock).mockClear();
  });

  describe('Initialization', () => {
    it('should initialize StargateBridge with default values', () => {
      expect(stargateBridge.selectedToken).toBeNull();
      expect(stargateBridge.fromChainId).toBeNull();
      expect(stargateBridge.toChainId).toBeNull();
      expect(stargateBridge.fromAmount).toBe('');
    });

    it('should have toAmount getter that returns "0" by default', () => {
      expect(stargateBridge.toAmount).toBe('0');
    });
  });

  describe('Token Management', () => {
    it('should get available tokens filtered by Stargate support', () => {
      const availableTokens = stargateBridge.getAvailableTokens();
      
      expect(availableTokens).toEqual([
        { symbol: 'USDC', address: '0x123', decimals: 6 },
        { symbol: 'USDT', address: '0x456', decimals: 6 },
      ]);
      
      // ETH should be filtered out as it's not in stargateSupportedToken
      expect(availableTokens.find(token => token.symbol === 'ETH')).toBeUndefined();
    });

    it('should set selected token', () => {
      const token = { symbol: 'USDC', address: '0x123', decimals: 6 };
      
      stargateBridge.setSelectedToken(token);
      
      expect(stargateBridge.selectedToken).toEqual(token);
    });

    it('should handle empty token list', () => {
      const wallet = require('@honeypot/shared/lib/wallet').wallet;
      wallet.currentChain.validatedTokens = [];
      
      const availableTokens = stargateBridge.getAvailableTokens();
      
      expect(availableTokens).toEqual([]);
    });
  });

  describe('Chain Management', () => {
    it('should set from chain ID', () => {
      stargateBridge.setFromChainId('1');
      
      expect(stargateBridge.fromChainId).toBe('1');
    });

    it('should set to chain ID', () => {
      stargateBridge.setToChainId('137');
      
      expect(stargateBridge.toChainId).toBe('137');
    });

    it('should swap chain IDs', () => {
      stargateBridge.setFromChainId('1');
      stargateBridge.setToChainId('137');
      
      stargateBridge.swapChainIds();
      
      expect(stargateBridge.fromChainId).toBe('137');
      expect(stargateBridge.toChainId).toBe('1');
    });

    it('should handle null values when swapping chain IDs', () => {
      stargateBridge.setFromChainId('1');
      stargateBridge.setToChainId(null);
      
      stargateBridge.swapChainIds();
      
      expect(stargateBridge.fromChainId).toBeNull();
      expect(stargateBridge.toChainId).toBe('1');
    });
  });

  describe('Amount Management', () => {
    it('should set from amount', () => {
      stargateBridge.setFromAmount('100');
      
      expect(stargateBridge.fromAmount).toBe('100');
    });

    it('should validate amount format', () => {
      expect(stargateBridge.isValidAmount('100')).toBe(true);
      expect(stargateBridge.isValidAmount('100.50')).toBe(true);
      expect(stargateBridge.isValidAmount('0')).toBe(true);
      expect(stargateBridge.isValidAmount('')).toBe(false);
      expect(stargateBridge.isValidAmount('invalid')).toBe(false);
      expect(stargateBridge.isValidAmount('-100')).toBe(false);
    });
  });

  describe('Route Fetching', () => {
    it('should fetch route from Stargate API', async () => {
      const mockRouteResponse = {
        routes: [{
          srcAmount: '1000000', // 1 USDC (6 decimals)
          dstAmount: '990000', // 0.99 USDC after fees
          fee: '10000',
          estimatedTime: 300,
        }],
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockRouteResponse),
      });

      stargateBridge.setSelectedToken({ symbol: 'USDC', address: '0x123', decimals: 6 });
      stargateBridge.setFromChainId('1');
      stargateBridge.setToChainId('137');
      stargateBridge.setFromAmount('1');

      const route = await stargateBridge.fetchRoute();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('stargate.finance/api/v1/routes'),
        expect.any(Object)
      );
      expect(route).toEqual(mockRouteResponse.routes[0]);
    });

    it('should handle API errors when fetching routes', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      stargateBridge.setSelectedToken({ symbol: 'USDC', address: '0x123', decimals: 6 });
      stargateBridge.setFromChainId('1');
      stargateBridge.setToChainId('137');
      stargateBridge.setFromAmount('1');

      await expect(stargateBridge.fetchRoute()).rejects.toThrow('Failed to fetch route');
    });

    it('should handle network errors when fetching routes', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      stargateBridge.setSelectedToken({ symbol: 'USDC', address: '0x123', decimals: 6 });
      stargateBridge.setFromChainId('1');
      stargateBridge.setToChainId('137');
      stargateBridge.setFromAmount('1');

      await expect(stargateBridge.fetchRoute()).rejects.toThrow('Network error');
    });

    it('should build correct API URL with parameters', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ routes: [] }),
      });

      const wallet = require('@honeypot/shared/lib/wallet').wallet;
      wallet.address = '0xUserAddress';

      stargateBridge.setSelectedToken({ symbol: 'USDC', address: '0x123', decimals: 6 });
      stargateBridge.setFromChainId('1');
      stargateBridge.setToChainId('137');
      stargateBridge.setFromAmount('100');

      await stargateBridge.fetchRoute();

      const expectedUrl = expect.stringMatching(
        /stargate\.finance\/api\/v1\/routes\?.*srcToken=0x123.*dstToken=0x123.*srcChainKey=ethereum.*dstChainKey=polygon.*srcAmount=100000000/
      );

      expect(fetch).toHaveBeenCalledWith(expectedUrl, expect.any(Object));
    });
  });

  describe('Chain Key Mapping', () => {
    it('should map chain IDs to Stargate chain keys', () => {
      expect(stargateBridge.getChainKey('1')).toBe('ethereum');
      expect(stargateBridge.getChainKey('137')).toBe('polygon');
      expect(stargateBridge.getChainKey('56')).toBe('bsc');
      expect(stargateBridge.getChainKey('42161')).toBe('arbitrum');
      expect(stargateBridge.getChainKey('10')).toBe('optimism');
    });

    it('should handle unknown chain IDs', () => {
      expect(stargateBridge.getChainKey('999')).toBeUndefined();
    });
  });

  describe('Amount Conversion', () => {
    it('should convert human readable amount to wei', () => {
      const token = { symbol: 'USDC', address: '0x123', decimals: 6 };
      
      expect(stargateBridge.toWei('1', token)).toBe('1000000');
      expect(stargateBridge.toWei('100.5', token)).toBe('100500000');
      expect(stargateBridge.toWei('0.000001', token)).toBe('1');
    });

    it('should convert wei to human readable amount', () => {
      const token = { symbol: 'USDC', address: '0x123', decimals: 6 };
      
      expect(stargateBridge.fromWei('1000000', token)).toBe('1');
      expect(stargateBridge.fromWei('100500000', token)).toBe('100.5');
      expect(stargateBridge.fromWei('1', token)).toBe('0.000001');
    });

    it('should handle different token decimals', () => {
      const ethToken = { symbol: 'ETH', address: '0x789', decimals: 18 };
      
      expect(stargateBridge.toWei('1', ethToken)).toBe('1000000000000000000');
      expect(stargateBridge.fromWei('1000000000000000000', ethToken)).toBe('1');
    });
  });

  describe('Validation', () => {
    it('should validate bridge parameters', () => {
      stargateBridge.setSelectedToken({ symbol: 'USDC', address: '0x123', decimals: 6 });
      stargateBridge.setFromChainId('1');
      stargateBridge.setToChainId('137');
      stargateBridge.setFromAmount('100');

      expect(stargateBridge.isValidBridgeSetup()).toBe(true);
    });

    it('should return false for incomplete bridge setup', () => {
      // Missing token
      stargateBridge.setFromChainId('1');
      stargateBridge.setToChainId('137');
      stargateBridge.setFromAmount('100');

      expect(stargateBridge.isValidBridgeSetup()).toBe(false);

      // Missing chains
      stargateBridge.setSelectedToken({ symbol: 'USDC', address: '0x123', decimals: 6 });
      stargateBridge.setFromChainId(null);
      stargateBridge.setToChainId(null);

      expect(stargateBridge.isValidBridgeSetup()).toBe(false);

      // Missing amount
      stargateBridge.setFromChainId('1');
      stargateBridge.setToChainId('137');
      stargateBridge.setFromAmount('');

      expect(stargateBridge.isValidBridgeSetup()).toBe(false);
    });

    it('should validate same chain selection', () => {
      stargateBridge.setFromChainId('1');
      stargateBridge.setToChainId('1');

      expect(stargateBridge.isSameChain()).toBe(true);

      stargateBridge.setToChainId('137');
      expect(stargateBridge.isSameChain()).toBe(false);
    });
  });

  describe('Transaction Building', () => {
    it('should build bridge transaction parameters', async () => {
      const mockRoute = {
        srcAmount: '1000000',
        dstAmount: '990000',
        fee: '10000',
        transactionData: '0xabcd1234',
      };

      stargateBridge.setSelectedToken({ symbol: 'USDC', address: '0x123', decimals: 6 });
      stargateBridge.setFromChainId('1');
      stargateBridge.setToChainId('137');
      stargateBridge.setFromAmount('1');

      const txParams = await stargateBridge.buildTransaction(mockRoute);

      expect(txParams).toEqual({
        to: expect.any(String),
        data: '0xabcd1234',
        value: '0',
        gasLimit: expect.any(String),
      });
    });

    it('should handle transaction building errors', async () => {
      const invalidRoute = null;

      await expect(stargateBridge.buildTransaction(invalidRoute)).rejects.toThrow();
    });
  });

  describe('Fee Calculation', () => {
    it('should calculate bridge fees', () => {
      const route = {
        srcAmount: '1000000',
        dstAmount: '990000',
        fee: '10000',
      };

      const feePercentage = stargateBridge.calculateFeePercentage(route);

      expect(feePercentage).toBe(1); // 1% fee
    });

    it('should handle zero amounts in fee calculation', () => {
      const route = {
        srcAmount: '0',
        dstAmount: '0',
        fee: '0',
      };

      const feePercentage = stargateBridge.calculateFeePercentage(route);

      expect(feePercentage).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing wallet connection', () => {
      const wallet = require('@honeypot/shared/lib/wallet').wallet;
      wallet.address = null;

      expect(stargateBridge.isWalletConnected()).toBe(false);
    });

    it('should handle unsupported tokens', () => {
      const unsupportedToken = { symbol: 'UNKNOWN', address: '0x999', decimals: 18 };

      expect(stargateBridge.isTokenSupported(unsupportedToken)).toBe(false);

      const supportedToken = { symbol: 'USDC', address: '0x123', decimals: 6 };
      expect(stargateBridge.isTokenSupported(supportedToken)).toBe(true);
    });

    it('should handle unsupported chains', () => {
      expect(stargateBridge.isChainSupported('999')).toBe(false);
      expect(stargateBridge.isChainSupported('1')).toBe(true);
    });
  });

  describe('State Management', () => {
    it('should reset bridge state', () => {
      stargateBridge.setSelectedToken({ symbol: 'USDC', address: '0x123', decimals: 6 });
      stargateBridge.setFromChainId('1');
      stargateBridge.setToChainId('137');
      stargateBridge.setFromAmount('100');

      stargateBridge.reset();

      expect(stargateBridge.selectedToken).toBeNull();
      expect(stargateBridge.fromChainId).toBeNull();
      expect(stargateBridge.toChainId).toBeNull();
      expect(stargateBridge.fromAmount).toBe('');
    });

    it('should maintain state consistency', () => {
      const token = { symbol: 'USDC', address: '0x123', decimals: 6 };
      
      stargateBridge.setSelectedToken(token);
      stargateBridge.setFromChainId('1');
      stargateBridge.setToChainId('137');
      stargateBridge.setFromAmount('100');

      expect(stargateBridge.selectedToken).toEqual(token);
      expect(stargateBridge.fromChainId).toBe('1');
      expect(stargateBridge.toChainId).toBe('137');
      expect(stargateBridge.fromAmount).toBe('100');
    });
  });
});