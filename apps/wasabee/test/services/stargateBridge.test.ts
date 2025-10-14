import { StargateBridge } from '../../services/stargateBridge';
import { Token } from '@honeypot/shared';
import { wallet } from '@honeypot/shared/lib/wallet';

// Mock wallet
jest.mock('@honeypot/shared/lib/wallet', () => ({
  wallet: {
    currentChain: {
      validatedTokens: [
        {
          symbol: 'USDC',
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          name: 'USD Coin',
          decimals: 6,
        },
        {
          symbol: 'USDT',
          address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          name: 'Tether USD',
          decimals: 6,
        },
        {
          symbol: 'ETH',
          address: '0x0000000000000000000000000000000000000000',
          name: 'Ethereum',
          decimals: 18,
        },
      ],
    },
  },
}));

// Mock stargate config
jest.mock('@/config/stargateConfig', () => ({
  stargateSupportedChain: ['ethereum', 'polygon', 'bsc'],
  stargateSupportedToken: ['USDC', 'USDT'],
}));

describe('StargateBridge', () => {
  let stargateBridge: StargateBridge;

  beforeEach(() => {
    stargateBridge = new StargateBridge();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Positive Tests', () => {
    test('should initialize with default values', () => {
      expect(stargateBridge.selectedToken).toBeNull();
      expect(stargateBridge.fromChainId).toBeNull();
      expect(stargateBridge.toChainId).toBeNull();
      expect(stargateBridge.fromAmount).toBe('');
    });

    test('should set selected token correctly', () => {
      const mockToken = {
        symbol: 'USDC',
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      } as Token;

      stargateBridge.setSelectedToken(mockToken);

      expect(stargateBridge.selectedToken).toEqual(mockToken);
    });

    test('should get available tokens filtered by stargate support', () => {
      const availableTokens = stargateBridge.getAvailableTokens();

      expect(availableTokens).toHaveLength(2); // Only USDC and USDT
      expect(
        availableTokens.every((token) =>
          ['USDC', 'USDT'].includes(token.symbol)
        )
      ).toBe(true);
    });
  });

  describe('Negative Tests', () => {
    test('should handle null token selection', () => {
      stargateBridge.setSelectedToken(null as any);

      expect(stargateBridge.selectedToken).toBeNull();
    });

    test('should return zero amount when no configuration is set', () => {
      const toAmount = stargateBridge.toAmount;

      expect(toAmount).toBe('0');
    });

    test('should handle invalid chain IDs', () => {
      stargateBridge.setFromChainId('invalid-chain');
      stargateBridge.setToChainId('another-invalid-chain');

      expect(stargateBridge.fromChainId).toBe('invalid-chain');
      expect(stargateBridge.toChainId).toBe('another-invalid-chain');
    });
  });

  describe('Edge Case Tests', () => {
    test('should swap chain IDs correctly', () => {
      stargateBridge.setFromChainId('1');
      stargateBridge.setToChainId('56');

      stargateBridge.swapChainIds();

      expect(stargateBridge.fromChainId).toBe('56');
      expect(stargateBridge.toChainId).toBe('1');
    });

    test('should handle swapping when one chain ID is null', () => {
      stargateBridge.setFromChainId('1');
      stargateBridge.setToChainId(null as any);

      stargateBridge.swapChainIds();

      expect(stargateBridge.fromChainId).toBeNull();
      expect(stargateBridge.toChainId).toBe('1');
    });

    test('should set from amount correctly', () => {
      const testAmount = '123.456';

      stargateBridge.setFromAmount(testAmount);

      expect(stargateBridge.fromAmount).toBe(testAmount);
    });
  });
});
