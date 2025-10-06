import { CrossChainSwapService } from '../../../../apps/wasabee/services/crossChainSwap';

// Mock the lazy-loaded shared library
const mockSharedLib = {
  wallet: {
    address: '0x123',
    isConnected: true,
    currentChain: { chainId: 1, name: 'Ethereum' },
  },
  networks: {
    supportedNetworks: [
      { chainId: 1, name: 'Ethereum', symbol: 'ETH' },
      { chainId: 137, name: 'Polygon', symbol: 'MATIC' },
    ],
  },
};

// Mock dynamic import
jest.mock('../../../../apps/wasabee/services/crossChainSwap', () => {
  const originalModule = jest.requireActual('../../../../apps/wasabee/services/crossChainSwap');
  
  // Mock the getSharedLib function
  const mockGetSharedLib = jest.fn(() => Promise.resolve(mockSharedLib));
  
  return {
    ...originalModule,
    getSharedLib: mockGetSharedLib,
  };
});

// Mock Universal Account Service
jest.mock('../../../../apps/wasabee/services/universalAccountService', () => ({
  universalAccountService: {
    getSupportedChains: jest.fn(() => [
      { chainId: 1, name: 'Ethereum', symbol: 'ETH' },
      { chainId: 137, name: 'Polygon', symbol: 'MATIC' },
    ]),
    getSupportedTokensForChain: jest.fn(() => [
      { symbol: 'USDC', address: '0x123', decimals: 6 },
      { symbol: 'USDT', address: '0x456', decimals: 6 },
    ]),
    getSwapQuote: jest.fn(() => Promise.resolve({
      toAmount: '99.5',
      priceImpact: 0.5,
      estimatedTime: 300,
      route: ['Ethereum', 'Polygon'],
      feeInUSD: '2.50',
    })),
    executeSwap: jest.fn(() => Promise.resolve({
      transactionHash: '0xabc123',
      success: true,
    })),
  },
}));

describe('CrossChainSwapService', () => {
  let crossChainSwapService: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Import the service after mocks are set up
    const module = await import('../../../../apps/wasabee/services/crossChainSwap');
    crossChainSwapService = new module.CrossChainSwapService();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      expect(crossChainSwapService.fromChain).toBeNull();
      expect(crossChainSwapService.toChain).toBeNull();
      expect(crossChainSwapService.fromToken).toBeNull();
      expect(crossChainSwapService.toToken).toBeNull();
      expect(crossChainSwapService.fromAmount).toBe('');
      expect(crossChainSwapService.toAmount).toBe('');
      expect(crossChainSwapService.isLoading).toBe(false);
    });

    it('should load shared library on initialization', async () => {
      await crossChainSwapService.initialize();
      
      expect(crossChainSwapService.wallet).toBeDefined();
      expect(crossChainSwapService.networks).toBeDefined();
    });
  });

  describe('Chain Management', () => {
    it('should set from chain', () => {
      const chain = { chainId: 1, name: 'Ethereum', symbol: 'ETH' };
      
      crossChainSwapService.setFromChain(chain);
      
      expect(crossChainSwapService.fromChain).toEqual(chain);
    });

    it('should set to chain', () => {
      const chain = { chainId: 137, name: 'Polygon', symbol: 'MATIC' };
      
      crossChainSwapService.setToChain(chain);
      
      expect(crossChainSwapService.toChain).toEqual(chain);
    });

    it('should swap chains', () => {
      const fromChain = { chainId: 1, name: 'Ethereum', symbol: 'ETH' };
      const toChain = { chainId: 137, name: 'Polygon', symbol: 'MATIC' };
      
      crossChainSwapService.setFromChain(fromChain);
      crossChainSwapService.setToChain(toChain);
      
      crossChainSwapService.swapChains();
      
      expect(crossChainSwapService.fromChain).toEqual(toChain);
      expect(crossChainSwapService.toChain).toEqual(fromChain);
    });

    it('should get supported chains', () => {
      const supportedChains = crossChainSwapService.getSupportedChains();
      
      expect(supportedChains).toEqual([
        { chainId: 1, name: 'Ethereum', symbol: 'ETH' },
        { chainId: 137, name: 'Polygon', symbol: 'MATIC' },
      ]);
    });
  });

  describe('Token Management', () => {
    it('should set from token', () => {
      const token = { symbol: 'USDC', address: '0x123', decimals: 6 };
      
      crossChainSwapService.setFromToken(token);
      
      expect(crossChainSwapService.fromToken).toEqual(token);
    });

    it('should set to token', () => {
      const token = { symbol: 'USDT', address: '0x456', decimals: 6 };
      
      crossChainSwapService.setToToken(token);
      
      expect(crossChainSwapService.toToken).toEqual(token);
    });

    it('should swap tokens', () => {
      const fromToken = { symbol: 'USDC', address: '0x123', decimals: 6 };
      const toToken = { symbol: 'USDT', address: '0x456', decimals: 6 };
      
      crossChainSwapService.setFromToken(fromToken);
      crossChainSwapService.setToToken(toToken);
      
      crossChainSwapService.swapTokens();
      
      expect(crossChainSwapService.fromToken).toEqual(toToken);
      expect(crossChainSwapService.toToken).toEqual(fromToken);
    });

    it('should get supported tokens for chain', () => {
      const chain = { chainId: 1, name: 'Ethereum', symbol: 'ETH' };
      
      const supportedTokens = crossChainSwapService.getSupportedTokensForChain(chain);
      
      expect(supportedTokens).toEqual([
        { symbol: 'USDC', address: '0x123', decimals: 6 },
        { symbol: 'USDT', address: '0x456', decimals: 6 },
      ]);
    });
  });

  describe('Amount Management', () => {
    it('should set from amount', () => {
      crossChainSwapService.setFromAmount('100');
      
      expect(crossChainSwapService.fromAmount).toBe('100');
    });

    it('should validate amount format', () => {
      expect(crossChainSwapService.isValidAmount('100')).toBe(true);
      expect(crossChainSwapService.isValidAmount('100.50')).toBe(true);
      expect(crossChainSwapService.isValidAmount('0')).toBe(true);
      expect(crossChainSwapService.isValidAmount('')).toBe(false);
      expect(crossChainSwapService.isValidAmount('invalid')).toBe(false);
      expect(crossChainSwapService.isValidAmount('-100')).toBe(false);
    });

    it('should clear amounts', () => {
      crossChainSwapService.setFromAmount('100');
      crossChainSwapService.toAmount = '99.5';
      
      crossChainSwapService.clearAmounts();
      
      expect(crossChainSwapService.fromAmount).toBe('');
      expect(crossChainSwapService.toAmount).toBe('');
    });
  });

  describe('Quote Management', () => {
    it('should fetch swap quote', async () => {
      const fromChain = { chainId: 1, name: 'Ethereum', symbol: 'ETH' };
      const toChain = { chainId: 137, name: 'Polygon', symbol: 'MATIC' };
      const fromToken = { symbol: 'USDC', address: '0x123', decimals: 6 };
      const toToken = { symbol: 'USDT', address: '0x456', decimals: 6 };
      
      crossChainSwapService.setFromChain(fromChain);
      crossChainSwapService.setToChain(toChain);
      crossChainSwapService.setFromToken(fromToken);
      crossChainSwapService.setToToken(toToken);
      crossChainSwapService.setFromAmount('100');
      
      const quote = await crossChainSwapService.getQuote();
      
      expect(quote).toEqual({
        toAmount: '99.5',
        priceImpact: 0.5,
        estimatedTime: 300,
        route: ['Ethereum', 'Polygon'],
        feeInUSD: '2.50',
      });
    });

    it('should handle quote fetch errors', async () => {
      const universalAccountService = require('../../../../apps/wasabee/services/universalAccountService').universalAccountService;
      universalAccountService.getSwapQuote.mockRejectedValue(new Error('Quote failed'));
      
      crossChainSwapService.setFromChain({ chainId: 1, name: 'Ethereum' });
      crossChainSwapService.setToChain({ chainId: 137, name: 'Polygon' });
      crossChainSwapService.setFromToken({ symbol: 'USDC', address: '0x123' });
      crossChainSwapService.setToToken({ symbol: 'USDT', address: '0x456' });
      crossChainSwapService.setFromAmount('100');
      
      await expect(crossChainSwapService.getQuote()).rejects.toThrow('Quote failed');
    });

    it('should validate quote parameters before fetching', async () => {
      // Missing required parameters
      const quote = await crossChainSwapService.getQuote();
      
      expect(quote).toBeNull();
    });

    it('should update to amount when quote is received', async () => {
      crossChainSwapService.setFromChain({ chainId: 1, name: 'Ethereum' });
      crossChainSwapService.setToChain({ chainId: 137, name: 'Polygon' });
      crossChainSwapService.setFromToken({ symbol: 'USDC', address: '0x123' });
      crossChainSwapService.setToToken({ symbol: 'USDT', address: '0x456' });
      crossChainSwapService.setFromAmount('100');
      
      await crossChainSwapService.getQuote();
      
      expect(crossChainSwapService.toAmount).toBe('99.5');
    });
  });

  describe('Swap Execution', () => {
    it('should execute cross-chain swap', async () => {
      crossChainSwapService.setFromChain({ chainId: 1, name: 'Ethereum' });
      crossChainSwapService.setToChain({ chainId: 137, name: 'Polygon' });
      crossChainSwapService.setFromToken({ symbol: 'USDC', address: '0x123' });
      crossChainSwapService.setToToken({ symbol: 'USDT', address: '0x456' });
      crossChainSwapService.setFromAmount('100');
      
      const result = await crossChainSwapService.executeSwap();
      
      expect(result).toEqual({
        transactionHash: '0xabc123',
        success: true,
      });
    });

    it('should handle swap execution errors', async () => {
      const universalAccountService = require('../../../../apps/wasabee/services/universalAccountService').universalAccountService;
      universalAccountService.executeSwap.mockRejectedValue(new Error('Swap failed'));
      
      crossChainSwapService.setFromChain({ chainId: 1, name: 'Ethereum' });
      crossChainSwapService.setToChain({ chainId: 137, name: 'Polygon' });
      crossChainSwapService.setFromToken({ symbol: 'USDC', address: '0x123' });
      crossChainSwapService.setToToken({ symbol: 'USDT', address: '0x456' });
      crossChainSwapService.setFromAmount('100');
      
      await expect(crossChainSwapService.executeSwap()).rejects.toThrow('Swap failed');
    });

    it('should validate swap parameters before execution', async () => {
      // Missing required parameters
      const result = await crossChainSwapService.executeSwap();
      
      expect(result).toBeNull();
    });

    it('should set loading state during swap execution', async () => {
      crossChainSwapService.setFromChain({ chainId: 1, name: 'Ethereum' });
      crossChainSwapService.setToChain({ chainId: 137, name: 'Polygon' });
      crossChainSwapService.setFromToken({ symbol: 'USDC', address: '0x123' });
      crossChainSwapService.setToToken({ symbol: 'USDT', address: '0x456' });
      crossChainSwapService.setFromAmount('100');
      
      const swapPromise = crossChainSwapService.executeSwap();
      
      expect(crossChainSwapService.isLoading).toBe(true);
      
      await swapPromise;
      
      expect(crossChainSwapService.isLoading).toBe(false);
    });
  });

  describe('Validation', () => {
    it('should validate complete swap setup', () => {
      crossChainSwapService.setFromChain({ chainId: 1, name: 'Ethereum' });
      crossChainSwapService.setToChain({ chainId: 137, name: 'Polygon' });
      crossChainSwapService.setFromToken({ symbol: 'USDC', address: '0x123' });
      crossChainSwapService.setToToken({ symbol: 'USDT', address: '0x456' });
      crossChainSwapService.setFromAmount('100');
      
      expect(crossChainSwapService.isValidSwapSetup()).toBe(true);
    });

    it('should return false for incomplete swap setup', () => {
      // Missing chains
      crossChainSwapService.setFromToken({ symbol: 'USDC', address: '0x123' });
      crossChainSwapService.setToToken({ symbol: 'USDT', address: '0x456' });
      crossChainSwapService.setFromAmount('100');
      
      expect(crossChainSwapService.isValidSwapSetup()).toBe(false);
      
      // Missing tokens
      crossChainSwapService.setFromChain({ chainId: 1, name: 'Ethereum' });
      crossChainSwapService.setToChain({ chainId: 137, name: 'Polygon' });
      crossChainSwapService.setFromToken(null);
      crossChainSwapService.setToToken(null);
      
      expect(crossChainSwapService.isValidSwapSetup()).toBe(false);
      
      // Missing amount
      crossChainSwapService.setFromToken({ symbol: 'USDC', address: '0x123' });
      crossChainSwapService.setToToken({ symbol: 'USDT', address: '0x456' });
      crossChainSwapService.setFromAmount('');
      
      expect(crossChainSwapService.isValidSwapSetup()).toBe(false);
    });

    it('should validate same chain selection', () => {
      const chain = { chainId: 1, name: 'Ethereum' };
      
      crossChainSwapService.setFromChain(chain);
      crossChainSwapService.setToChain(chain);
      
      expect(crossChainSwapService.isSameChain()).toBe(true);
      
      crossChainSwapService.setToChain({ chainId: 137, name: 'Polygon' });
      
      expect(crossChainSwapService.isSameChain()).toBe(false);
    });
  });

  describe('Price Impact Calculation', () => {
    it('should calculate price impact', () => {
      const quote = {
        toAmount: '99',
        priceImpact: 1.0,
        estimatedTime: 300,
        route: ['Ethereum', 'Polygon'],
      };
      
      crossChainSwapService.setFromAmount('100');
      
      const priceImpact = crossChainSwapService.calculatePriceImpact(quote);
      
      expect(priceImpact).toBe(1.0);
    });

    it('should handle zero amounts in price impact calculation', () => {
      const quote = {
        toAmount: '0',
        priceImpact: 0,
        estimatedTime: 300,
        route: ['Ethereum', 'Polygon'],
      };
      
      crossChainSwapService.setFromAmount('0');
      
      const priceImpact = crossChainSwapService.calculatePriceImpact(quote);
      
      expect(priceImpact).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle wallet connection errors', async () => {
      // Mock wallet as disconnected
      mockSharedLib.wallet.isConnected = false;
      
      expect(crossChainSwapService.isWalletConnected()).toBe(false);
    });

    it('should handle unsupported chain combinations', () => {
      const unsupportedChain = { chainId: 999, name: 'Unknown' };
      
      crossChainSwapService.setFromChain(unsupportedChain);
      
      expect(crossChainSwapService.isChainSupported(unsupportedChain)).toBe(false);
    });

    it('should handle network switching errors', async () => {
      const targetChain = { chainId: 137, name: 'Polygon' };
      
      // Mock network switch failure
      mockSharedLib.wallet.switchNetwork = jest.fn().mockRejectedValue(new Error('Network switch failed'));
      
      await expect(crossChainSwapService.switchToChain(targetChain)).rejects.toThrow('Network switch failed');
    });
  });

  describe('State Management', () => {
    it('should reset swap state', () => {
      crossChainSwapService.setFromChain({ chainId: 1, name: 'Ethereum' });
      crossChainSwapService.setToChain({ chainId: 137, name: 'Polygon' });
      crossChainSwapService.setFromToken({ symbol: 'USDC', address: '0x123' });
      crossChainSwapService.setToToken({ symbol: 'USDT', address: '0x456' });
      crossChainSwapService.setFromAmount('100');
      
      crossChainSwapService.reset();
      
      expect(crossChainSwapService.fromChain).toBeNull();
      expect(crossChainSwapService.toChain).toBeNull();
      expect(crossChainSwapService.fromToken).toBeNull();
      expect(crossChainSwapService.toToken).toBeNull();
      expect(crossChainSwapService.fromAmount).toBe('');
      expect(crossChainSwapService.toAmount).toBe('');
    });

    it('should maintain state consistency', () => {
      const fromChain = { chainId: 1, name: 'Ethereum' };
      const toChain = { chainId: 137, name: 'Polygon' };
      const fromToken = { symbol: 'USDC', address: '0x123' };
      const toToken = { symbol: 'USDT', address: '0x456' };
      
      crossChainSwapService.setFromChain(fromChain);
      crossChainSwapService.setToChain(toChain);
      crossChainSwapService.setFromToken(fromToken);
      crossChainSwapService.setToToken(toToken);
      crossChainSwapService.setFromAmount('100');
      
      expect(crossChainSwapService.fromChain).toEqual(fromChain);
      expect(crossChainSwapService.toChain).toEqual(toChain);
      expect(crossChainSwapService.fromToken).toEqual(fromToken);
      expect(crossChainSwapService.toToken).toEqual(toToken);
      expect(crossChainSwapService.fromAmount).toBe('100');
    });
  });
});