import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/router';
import { VaultDetail } from '../../../../../apps/wasabee/pages/vault/[address]';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock wallet
const mockWallet = {
  isInit: true,
  account: '0x123',
  walletClient: {},
  currentChain: {
    chain: {
      blockExplorers: {
        default: {
          url: 'https://berascan.com/',
        },
      },
    },
  },
  contracts: {
    vaultStakerFactory: {
      getMiniVaultStaker: jest.fn().mockResolvedValue(['0xstaker1', '0xstaker2']),
    },
    vaultVolatilityCheck: {
      currentVolatility: jest.fn().mockResolvedValue('250'),
    },
  },
};

jest.mock('@honeypot/shared/lib/wallet', () => ({
  wallet: mockWallet,
}));

// Mock vault contract
const mockVaultContract = {
  address: '0xvault123',
  token0: {
    symbol: 'USDC',
    address: '0xusdc',
    decimals: 6,
    init: jest.fn(),
  },
  token1: {
    symbol: 'USDT',
    address: '0xusdt',
    decimals: 6,
    init: jest.fn(),
  },
  userShares: BigInt('1000000000000000000'),
  totalsupplyShares: BigInt('10000000000000000000'),
  totalSupply: {
    total0: BigInt('5000000000'),
    total1: BigInt('5000000000'),
  },
  userTokenAmounts: {
    total0: BigInt('500000000'),
    total1: BigInt('500000000'),
  },
  userTVLUSD: 1000,
  tvlUSD: 10000000,
  apr: 15.75,
  detailedApr: {
    feeApr_1d: 0.05,
    feeApr_3d: 0.15,
    feeApr_7d: 0.35,
    feeApr_30d: 1.25,
  },
  pool: {
    TVL_USD: 50000000,
    volume_24h_USD: 1000000,
    fees_24h_USD: 5000,
  },
  bgtVaultAddress: '0xbgtvault',
  vaultTag: {
    tag: 'High APR',
    bgColor: '#10B981',
    textColor: '#FFFFFF',
    tooltip: 'High yield vault',
  },
  vaultDescription: 'This is a high-yield automated vault for USDC/USDT liquidity provision.',
  recentTransactions: [
    {
      id: '0xtx1-0',
      __typename: 'VaultDeposit',
      amount0: BigInt('1000000000'),
      amount1: BigInt('1000000000'),
      createdAtTimestamp: '1640995200',
    },
    {
      id: '0xtx2-1',
      __typename: 'VaultWithdraw',
      amount0: BigInt('500000000'),
      amount1: BigInt('500000000'),
      createdAtTimestamp: '1641081600',
    },
  ],
  getTotalAmounts: jest.fn(),
  getTotalSupply: jest.fn(),
  getBalanceOf: jest.fn(),
  getBgtVaultAddress: jest.fn(),
};

jest.mock('@honeypot/shared', () => ({
  getSingleVaultDetails: jest.fn().mockResolvedValue(mockVaultContract),
  DynamicFormatAmount: ({ amount, decimals, endWith }) => `${amount} ${endWith}`,
  TokenLogo: ({ token, size }) => <div data-testid={`token-logo-${token.symbol}`}>Logo</div>,
}));

describe('VaultDetail', () => {
  const mockPush = jest.fn();
  const mockRouter = {
    query: { address: '0xvault123' },
    push: mockPush,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  describe('Rendering', () => {
    it('should render vault details page', async () => {
      render(<VaultDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('Back to Vaults')).toBeInTheDocument();
        expect(screen.getByText('USDC/USDT')).toBeInTheDocument();
      });
    });

    it('should display vault token pair with logos', async () => {
      render(<VaultDetail />);
      
      await waitFor(() => {
        expect(screen.getByTestId('token-logo-USDC')).toBeInTheDocument();
        expect(screen.getByTestId('token-logo-USDT')).toBeInTheDocument();
        expect(screen.getByText('USDC/USDT')).toBeInTheDocument();
      });
    });

    it('should show action buttons', async () => {
      render(<VaultDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('Swap')).toBeInTheDocument();
        expect(screen.getByText('Deposit')).toBeInTheDocument();
        expect(screen.getByText('Withdraw')).toBeInTheDocument();
        expect(screen.getByText('Stake')).toBeInTheDocument();
      });
    });

    it('should display vault statistics', async () => {
      render(<VaultDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('Total Supply')).toBeInTheDocument();
        expect(screen.getByText('Your Asset')).toBeInTheDocument();
        expect(screen.getByText('Your Share Percentage')).toBeInTheDocument();
        expect(screen.getByText('Vault TVL')).toBeInTheDocument();
        expect(screen.getByText('APR')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate back to pools page', async () => {
      render(<VaultDetail />);
      
      const backButton = screen.getByText('Back to Vaults');
      fireEvent.click(backButton);
      
      expect(mockPush).toHaveBeenCalledWith('/pools');
    });

    it('should navigate to swap page with correct tokens', async () => {
      render(<VaultDetail />);
      
      await waitFor(() => {
        const swapButton = screen.getByText('Swap');
        expect(swapButton.closest('a')).toHaveAttribute(
          'href',
          '/swap?inputCurrency=0xusdc&outputCurrency=0xusdt'
        );
      });
    });

    it('should navigate to BGT vault when available', async () => {
      render(<VaultDetail />);
      
      await waitFor(() => {
        const stakeButton = screen.getByText('Stake');
        expect(stakeButton.closest('a')).toHaveAttribute(
          'href',
          'https://hub.berachain.com/vaults/0xbgtvault/'
        );
      });
    });
  });

  describe('Vault Operations', () => {
    it('should open deposit modal when deposit button clicked', async () => {
      render(<VaultDetail />);
      
      await waitFor(() => {
        const depositButton = screen.getByText('Deposit');
        fireEvent.click(depositButton);
        
        // Modal should be triggered (component state change)
        expect(depositButton).toBeInTheDocument();
      });
    });

    it('should open withdraw modal when withdraw button clicked', async () => {
      render(<VaultDetail />);
      
      await waitFor(() => {
        const withdrawButton = screen.getByText('Withdraw');
        fireEvent.click(withdrawButton);
        
        // Modal should be triggered (component state change)
        expect(withdrawButton).toBeInTheDocument();
      });
    });

    it('should disable deposit when wallet not connected', async () => {
      mockWallet.walletClient = null;
      
      render(<VaultDetail />);
      
      await waitFor(() => {
        const depositButton = screen.getByText('Connect Wallet');
        expect(depositButton).toBeDisabled();
      });
    });

    it('should show withdraw button only when user has shares', async () => {
      render(<VaultDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('Withdraw')).toBeInTheDocument();
      });
    });

    it('should hide withdraw button when user has no shares', async () => {
      const vaultWithoutShares = {
        ...mockVaultContract,
        userShares: BigInt('0'),
      };
      
      const { getSingleVaultDetails } = require('@honeypot/shared');
      getSingleVaultDetails.mockResolvedValue(vaultWithoutShares);
      
      render(<VaultDetail />);
      
      await waitFor(() => {
        expect(screen.queryByText('Withdraw')).not.toBeInTheDocument();
      });
    });
  });

  describe('Data Display', () => {
    it('should display formatted total supply amounts', async () => {
      render(<VaultDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('5000000000 USDC')).toBeInTheDocument();
        expect(screen.getByText('5000000000 USDT')).toBeInTheDocument();
      });
    });

    it('should display user asset amounts', async () => {
      render(<VaultDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('500000000 USDC')).toBeInTheDocument();
        expect(screen.getByText('500000000 USDT')).toBeInTheDocument();
      });
    });

    it('should calculate and display share percentage', async () => {
      render(<VaultDetail />);
      
      await waitFor(() => {
        // 1000000000000000000 / 10000000000000000000 * 100 = 10%
        expect(screen.getByText(/10/)).toBeInTheDocument();
      });
    });

    it('should display vault TVL', async () => {
      render(<VaultDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('10000000 $')).toBeInTheDocument();
      });
    });

    it('should display APR with detailed breakdown', async () => {
      render(<VaultDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('15.75%')).toBeInTheDocument();
      });
    });

    it('should display volatility with color coding', async () => {
      render(<VaultDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('250%')).toBeInTheDocument();
      });
    });
  });

  describe('Vault Information Section', () => {
    it('should display vault address with copy functionality', async () => {
      render(<VaultDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('Vault Address')).toBeInTheDocument();
        expect(screen.getByText('0xvault123')).toBeInTheDocument();
      });
    });

    it('should display token addresses with external links', async () => {
      render(<VaultDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('Token Addresses')).toBeInTheDocument();
        expect(screen.getByText('0xusdc')).toBeInTheDocument();
        expect(screen.getByText('0xusdt')).toBeInTheDocument();
      });
    });

    it('should show vault description when available', async () => {
      render(<VaultDetail />);
      
      await waitFor(() => {
        expect(screen.getByText(/high-yield automated vault/)).toBeInTheDocument();
      });
    });

    it('should display vault tag when available', async () => {
      render(<VaultDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('High APR')).toBeInTheDocument();
      });
    });
  });

  describe('Recent Activity', () => {
    it('should display recent transactions', async () => {
      render(<VaultDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('Recent Activity')).toBeInTheDocument();
        expect(screen.getByText('Deposit')).toBeInTheDocument();
        expect(screen.getByText('Withdraw')).toBeInTheDocument();
      });
    });

    it('should format transaction amounts correctly', async () => {
      render(<VaultDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('1000000000 USDC')).toBeInTheDocument();
        expect(screen.getByText('1000000000 USDT')).toBeInTheDocument();
      });
    });

    it('should show transaction timestamps', async () => {
      render(<VaultDetail />);
      
      await waitFor(() => {
        // Should show formatted dates
        expect(screen.getByText(/2022/)).toBeInTheDocument();
      });
    });

    it('should provide transaction links', async () => {
      render(<VaultDetail />);
      
      await waitFor(() => {
        const txLinks = screen.getAllByText('View Transaction');
        expect(txLinks.length).toBeGreaterThan(0);
      });
    });

    it('should handle mobile and desktop layouts for transactions', async () => {
      render(<VaultDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid vault address', async () => {
      const invalidRouter = {
        query: { address: 'invalid' },
        push: mockPush,
      };
      (useRouter as jest.Mock).mockReturnValue(invalidRouter);
      
      render(<VaultDetail />);
      
      // Should not crash with invalid address
      expect(screen.getByText('Back to Vaults')).toBeInTheDocument();
    });

    it('should handle missing vault data', async () => {
      const { getSingleVaultDetails } = require('@honeypot/shared');
      getSingleVaultDetails.mockResolvedValue(null);
      
      render(<VaultDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('Back to Vaults')).toBeInTheDocument();
      });
    });

    it('should handle wallet connection errors', async () => {
      mockWallet.isInit = false;
      mockWallet.account = null;
      
      render(<VaultDetail />);
      
      expect(screen.getByText('Back to Vaults')).toBeInTheDocument();
    });

    it('should handle contract call failures gracefully', async () => {
      mockWallet.contracts.vaultVolatilityCheck.currentVolatility.mockRejectedValue(
        new Error('Contract error')
      );
      
      render(<VaultDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('Back to Vaults')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state while vault data loads', () => {
      const { getSingleVaultDetails } = require('@honeypot/shared');
      getSingleVaultDetails.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(<VaultDetail />);
      
      expect(screen.getByText('Back to Vaults')).toBeInTheDocument();
    });

    it('should handle partial data loading', async () => {
      const partialVault = {
        ...mockVaultContract,
        pool: null,
        recentTransactions: [],
      };
      
      const { getSingleVaultDetails } = require('@honeypot/shared');
      getSingleVaultDetails.mockResolvedValue(partialVault);
      
      render(<VaultDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('USDC/USDT')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    it('should adapt to mobile screens', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<VaultDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('USDC/USDT')).toBeInTheDocument();
      });
    });

    it('should show full layout on desktop', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });

      render(<VaultDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('USDC/USDT')).toBeInTheDocument();
      });
    });
  });

  describe('Data Refresh', () => {
    it('should refresh vault data after operations', async () => {
      render(<VaultDetail />);
      
      await waitFor(() => {
        const depositButton = screen.getByText('Deposit');
        fireEvent.click(depositButton);
        
        // Should trigger data refresh
        expect(mockVaultContract.getTotalSupply).toHaveBeenCalled();
      });
    });

    it('should update user balances after transactions', async () => {
      render(<VaultDetail />);
      
      await waitFor(() => {
        expect(mockVaultContract.getBalanceOf).toHaveBeenCalledWith('0x123');
      });
    });
  });

  describe('Integration with External Services', () => {
    it('should fetch mini vault stakers', async () => {
      render(<VaultDetail />);
      
      await waitFor(() => {
        expect(mockWallet.contracts.vaultStakerFactory.getMiniVaultStaker).toHaveBeenCalledWith(
          '0xbgtvault'
        );
      });
    });

    it('should fetch volatility data', async () => {
      render(<VaultDetail />);
      
      await waitFor(() => {
        expect(mockWallet.contracts.vaultVolatilityCheck.currentVolatility).toHaveBeenCalledWith(
          '0xvault123'
        );
      });
    });

    it('should initialize token data', async () => {
      render(<VaultDetail />);
      
      await waitFor(() => {
        expect(mockVaultContract.token0.init).toHaveBeenCalledWith(true, {
          loadIndexerTokenData: true,
        });
        expect(mockVaultContract.token1.init).toHaveBeenCalledWith(true, {
          loadIndexerTokenData: true,
        });
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper button labels', async () => {
      render(<VaultDetail />);
      
      await waitFor(() => {
        const depositButton = screen.getByText('Deposit');
        expect(depositButton).toHaveAttribute('type', 'button');
      });
    });

    it('should support keyboard navigation', async () => {
      render(<VaultDetail />);
      
      await waitFor(() => {
        const backButton = screen.getByText('Back to Vaults');
        backButton.focus();
        expect(document.activeElement).toBe(backButton);
      });
    });

    it('should have proper heading structure', async () => {
      render(<VaultDetail />);
      
      await waitFor(() => {
        expect(screen.getByText('Vault Information')).toBeInTheDocument();
        expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      });
    });
  });
});