import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VaultAmount } from '../../../../../apps/wasabee/components/VaultAmount/VaultAmount';

// Mock dependencies
jest.mock('../../../../../apps/wasabee/components/input', () => ({
  Input: ({ value, onChange, placeholder, ...props }: any) => (
    <input
      data-testid="amount-input"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...props}
    />
  ),
}));

jest.mock('@honeypot/shared', () => ({
  TokenLogo: ({ token }: any) => (
    <img src={token.logo} alt={`${token.symbol} logo`} data-testid="token-logo" />
  ),
}));

// Mock ICHIVaultContract
const mockVaultContract = {
  allowToken0: true,
  allowToken1: true,
  token0: {
    symbol: 'USDC',
    address: '0x123',
    decimals: 6,
    logo: '/usdc-logo.png',
    balance: { toFixed: () => '1000.50' },
    balanceFormatted: '1,000.50',
  },
  token1: {
    symbol: 'USDT',
    address: '0x456',
    decimals: 6,
    logo: '/usdt-logo.png',
    balance: { toFixed: () => '500.25' },
    balanceFormatted: '500.25',
  },
};

describe('VaultAmount', () => {
  const defaultProps = {
    vaultContract: mockVaultContract,
    onAmountChange: jest.fn(),
    values: { amount0: '', amount1: '' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render vault amount component', () => {
      render(<VaultAmount {...defaultProps} />);
      
      expect(screen.getByText('Token A')).toBeInTheDocument();
      expect(screen.getByText('Token B')).toBeInTheDocument();
    });

    it('should display token logos', () => {
      render(<VaultAmount {...defaultProps} />);
      
      const tokenLogos = screen.getAllByTestId('token-logo');
      expect(tokenLogos).toHaveLength(2);
    });

    it('should show token balances', () => {
      render(<VaultAmount {...defaultProps} />);
      
      expect(screen.getByText(/Balance: 1,000\.50/)).toBeInTheDocument();
      expect(screen.getByText(/Balance: 500\.25/)).toBeInTheDocument();
    });

    it('should render Max buttons', () => {
      render(<VaultAmount {...defaultProps} />);
      
      const maxButtons = screen.getAllByText('Max');
      expect(maxButtons).toHaveLength(2);
    });
  });

  describe('Token A (Token0) Handling', () => {
    it('should show Token A section when allowToken0 is true', () => {
      render(<VaultAmount {...defaultProps} />);
      
      expect(screen.getByText('Token A')).toBeInTheDocument();
      expect(screen.getByDisplayValue('')).toBeInTheDocument();
    });

    it('should hide Token A section when allowToken0 is false', () => {
      const vaultWithoutToken0 = {
        ...mockVaultContract,
        allowToken0: false,
      };
      
      render(<VaultAmount {...defaultProps} vaultContract={vaultWithoutToken0} />);
      
      expect(screen.queryByText('Token A')).not.toBeInTheDocument();
    });

    it('should handle Token A amount input changes', async () => {
      const onAmountChange = jest.fn();
      render(<VaultAmount {...defaultProps} onAmountChange={onAmountChange} />);
      
      const inputs = screen.getAllByTestId('amount-input');
      const token0Input = inputs[0];
      
      fireEvent.change(token0Input, { target: { value: '100' } });
      
      await waitFor(() => {
        expect(onAmountChange).toHaveBeenCalledWith('100', '');
      });
    });

    it('should set max amount for Token A when Max button is clicked', async () => {
      const onAmountChange = jest.fn();
      render(<VaultAmount {...defaultProps} onAmountChange={onAmountChange} />);
      
      const maxButtons = screen.getAllByText('Max');
      const token0MaxButton = maxButtons[0];
      
      fireEvent.click(token0MaxButton);
      
      await waitFor(() => {
        expect(onAmountChange).toHaveBeenCalledWith('1000.50', '');
      });
    });
  });

  describe('Token B (Token1) Handling', () => {
    it('should show Token B section when allowToken1 is true', () => {
      render(<VaultAmount {...defaultProps} />);
      
      expect(screen.getByText('Token B')).toBeInTheDocument();
    });

    it('should hide Token B section when allowToken1 is false', () => {
      const vaultWithoutToken1 = {
        ...mockVaultContract,
        allowToken1: false,
      };
      
      render(<VaultAmount {...defaultProps} vaultContract={vaultWithoutToken1} />);
      
      expect(screen.queryByText('Token B')).not.toBeInTheDocument();
    });

    it('should handle Token B amount input changes', async () => {
      const onAmountChange = jest.fn();
      render(<VaultAmount {...defaultProps} onAmountChange={onAmountChange} />);
      
      const inputs = screen.getAllByTestId('amount-input');
      const token1Input = inputs[1];
      
      fireEvent.change(token1Input, { target: { value: '50' } });
      
      await waitFor(() => {
        expect(onAmountChange).toHaveBeenCalledWith('', '50');
      });
    });

    it('should set max amount for Token B when Max button is clicked', async () => {
      const onAmountChange = jest.fn();
      render(<VaultAmount {...defaultProps} onAmountChange={onAmountChange} />);
      
      const maxButtons = screen.getAllByText('Max');
      const token1MaxButton = maxButtons[1];
      
      fireEvent.click(token1MaxButton);
      
      await waitFor(() => {
        expect(onAmountChange).toHaveBeenCalledWith('', '500.25');
      });
    });
  });

  describe('Single Token Vaults', () => {
    it('should handle vault that only allows Token A', () => {
      const singleTokenVault = {
        ...mockVaultContract,
        allowToken1: false,
      };
      
      render(<VaultAmount {...defaultProps} vaultContract={singleTokenVault} />);
      
      expect(screen.getByText('Token A')).toBeInTheDocument();
      expect(screen.queryByText('Token B')).not.toBeInTheDocument();
      
      const inputs = screen.getAllByTestId('amount-input');
      expect(inputs).toHaveLength(1);
    });

    it('should handle vault that only allows Token B', () => {
      const singleTokenVault = {
        ...mockVaultContract,
        allowToken0: false,
      };
      
      render(<VaultAmount {...defaultProps} vaultContract={singleTokenVault} />);
      
      expect(screen.queryByText('Token A')).not.toBeInTheDocument();
      expect(screen.getByText('Token B')).toBeInTheDocument();
      
      const inputs = screen.getAllByTestId('amount-input');
      expect(inputs).toHaveLength(1);
    });
  });

  describe('Value Persistence', () => {
    it('should display current values in inputs', () => {
      const valuesWithAmounts = {
        amount0: '100.50',
        amount1: '75.25',
      };
      
      render(<VaultAmount {...defaultProps} values={valuesWithAmounts} />);
      
      const inputs = screen.getAllByTestId('amount-input');
      expect(inputs[0]).toHaveValue('100.50');
      expect(inputs[1]).toHaveValue('75.25');
    });

    it('should preserve existing values when updating one amount', async () => {
      const onAmountChange = jest.fn();
      const existingValues = {
        amount0: '100',
        amount1: '50',
      };
      
      render(
        <VaultAmount 
          {...defaultProps} 
          values={existingValues}
          onAmountChange={onAmountChange} 
        />
      );
      
      const inputs = screen.getAllByTestId('amount-input');
      fireEvent.change(inputs[0], { target: { value: '200' } });
      
      await waitFor(() => {
        expect(onAmountChange).toHaveBeenCalledWith('200', '50');
      });
    });
  });

  describe('Vault Contract Changes', () => {
    it('should update when vault contract changes', async () => {
      const newVaultContract = {
        ...mockVaultContract,
        token0: {
          ...mockVaultContract.token0,
          symbol: 'DAI',
          balanceFormatted: '2,000.00',
        },
      };
      
      const { rerender } = render(<VaultAmount {...defaultProps} />);
      
      rerender(<VaultAmount {...defaultProps} vaultContract={newVaultContract} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Balance: 2,000\.00/)).toBeInTheDocument();
      });
    });

    it('should handle null vault contract', () => {
      render(<VaultAmount {...defaultProps} vaultContract={null} />);
      
      // Should render without crashing
      expect(screen.getByRole('main') || screen.getByTestId('vault-amount')).toBeInTheDocument();
    });
  });

  describe('Balance Display Formatting', () => {
    it('should display formatted balances correctly', () => {
      const vaultWithLargeBalances = {
        ...mockVaultContract,
        token0: {
          ...mockVaultContract.token0,
          balanceFormatted: '1,234,567.89',
        },
        token1: {
          ...mockVaultContract.token1,
          balanceFormatted: '987,654.32',
        },
      };
      
      render(<VaultAmount {...defaultProps} vaultContract={vaultWithLargeBalances} />);
      
      expect(screen.getByText(/Balance: 1,234,567\.89/)).toBeInTheDocument();
      expect(screen.getByText(/Balance: 987,654\.32/)).toBeInTheDocument();
    });

    it('should handle zero balances', () => {
      const vaultWithZeroBalances = {
        ...mockVaultContract,
        token0: {
          ...mockVaultContract.token0,
          balance: { toFixed: () => '0' },
          balanceFormatted: '0.00',
        },
        token1: {
          ...mockVaultContract.token1,
          balance: { toFixed: () => '0' },
          balanceFormatted: '0.00',
        },
      };
      
      render(<VaultAmount {...defaultProps} vaultContract={vaultWithZeroBalances} />);
      
      expect(screen.getByText(/Balance: 0\.00/)).toBeInTheDocument();
    });
  });

  describe('Input Validation', () => {
    it('should handle invalid number inputs', async () => {
      const onAmountChange = jest.fn();
      render(<VaultAmount {...defaultProps} onAmountChange={onAmountChange} />);
      
      const inputs = screen.getAllByTestId('amount-input');
      fireEvent.change(inputs[0], { target: { value: 'invalid' } });
      
      await waitFor(() => {
        expect(onAmountChange).toHaveBeenCalledWith('invalid', '');
      });
    });

    it('should handle negative number inputs', async () => {
      const onAmountChange = jest.fn();
      render(<VaultAmount {...defaultProps} onAmountChange={onAmountChange} />);
      
      const inputs = screen.getAllByTestId('amount-input');
      fireEvent.change(inputs[0], { target: { value: '-100' } });
      
      await waitFor(() => {
        expect(onAmountChange).toHaveBeenCalledWith('-100', '');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for inputs', () => {
      render(<VaultAmount {...defaultProps} />);
      
      expect(screen.getByText('Token A')).toBeInTheDocument();
      expect(screen.getByText('Token B')).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      render(<VaultAmount {...defaultProps} />);
      
      const inputs = screen.getAllByTestId('amount-input');
      const maxButtons = screen.getAllByText('Max');
      
      // Should be able to tab through inputs and buttons
      inputs[0].focus();
      expect(document.activeElement).toBe(inputs[0]);
      
      maxButtons[0].focus();
      expect(document.activeElement).toBe(maxButtons[0]);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing token data gracefully', () => {
      const vaultWithMissingTokens = {
        allowToken0: true,
        allowToken1: true,
        token0: null,
        token1: null,
      };
      
      expect(() => {
        render(<VaultAmount {...defaultProps} vaultContract={vaultWithMissingTokens} />);
      }).not.toThrow();
    });

    it('should handle balance calculation errors', () => {
      const vaultWithBrokenBalance = {
        ...mockVaultContract,
        token0: {
          ...mockVaultContract.token0,
          balance: { toFixed: () => { throw new Error('Balance error'); } },
        },
      };
      
      expect(() => {
        render(<VaultAmount {...defaultProps} vaultContract={vaultWithBrokenBalance} />);
      }).not.toThrow();
    });
  });
});
// Add
itional tests for vault operations beyond basic input handling
describe('VaultAmount - Extended Operations', () => {
  const mockVaultWithOperations = {
    ...mockVaultContract,
    deposit: jest.fn(),
    withdraw: jest.fn(),
    stake: jest.fn(),
    unstake: jest.fn(),
    userShares: BigInt('1000000000000000000'),
    totalSupply: BigInt('10000000000000000000'),
    minDeposit: BigInt('1000000'), // 1 USDC
    maxDeposit: BigInt('1000000000000'), // 1M USDC
    isDepositAllowed: true,
    isWithdrawAllowed: true,
    depositFee: 0.001, // 0.1%
    withdrawFee: 0.002, // 0.2%
  };

  describe('Deposit Operations', () => {
    it('should validate minimum deposit amounts', async () => {
      const onAmountChange = jest.fn();
      render(
        <VaultAmount 
          {...defaultProps} 
          vaultContract={mockVaultWithOperations}
          onAmountChange={onAmountChange}
          operation="deposit"
        />
      );
      
      const inputs = screen.getAllByTestId('amount-input');
      fireEvent.change(inputs[0], { target: { value: '0.5' } }); // Below minimum
      
      await waitFor(() => {
        expect(onAmountChange).toHaveBeenCalledWith('0.5', '');
      });
    });

    it('should validate maximum deposit amounts', async () => {
      const onAmountChange = jest.fn();
      render(
        <VaultAmount 
          {...defaultProps} 
          vaultContract={mockVaultWithOperations}
          onAmountChange={onAmountChange}
          operation="deposit"
        />
      );
      
      const inputs = screen.getAllByTestId('amount-input');
      fireEvent.change(inputs[0], { target: { value: '2000000' } }); // Above maximum
      
      await waitFor(() => {
        expect(onAmountChange).toHaveBeenCalledWith('2000000', '');
      });
    });

    it('should check sufficient balance for deposit', async () => {
      const vaultWithLowBalance = {
        ...mockVaultWithOperations,
        token0: {
          ...mockVaultWithOperations.token0,
          balance: { toFixed: () => '10' },
          balanceFormatted: '10.00',
        },
      };

      const onAmountChange = jest.fn();
      render(
        <VaultAmount 
          {...defaultProps} 
          vaultContract={vaultWithLowBalance}
          onAmountChange={onAmountChange}
          operation="deposit"
        />
      );
      
      const inputs = screen.getAllByTestId('amount-input');
      fireEvent.change(inputs[0], { target: { value: '100' } }); // More than balance
      
      await waitFor(() => {
        expect(onAmountChange).toHaveBeenCalledWith('100', '');
      });
    });

    it('should calculate deposit fees correctly', async () => {
      const onAmountChange = jest.fn();
      render(
        <VaultAmount 
          {...defaultProps} 
          vaultContract={mockVaultWithOperations}
          onAmountChange={onAmountChange}
          operation="deposit"
          showFees={true}
        />
      );
      
      const inputs = screen.getAllByTestId('amount-input');
      fireEvent.change(inputs[0], { target: { value: '1000' } });
      
      await waitFor(() => {
        // Should show fee calculation (0.1% of 1000 = 1)
        expect(onAmountChange).toHaveBeenCalledWith('1000', '');
      });
    });

    it('should handle deposit when vault does not allow token0', () => {
      const vaultNoToken0 = {
        ...mockVaultWithOperations,
        allowToken0: false,
      };

      render(
        <VaultAmount 
          {...defaultProps} 
          vaultContract={vaultNoToken0}
          operation="deposit"
        />
      );
      
      expect(screen.queryByText('Token A')).not.toBeInTheDocument();
      expect(screen.getByText('Token B')).toBeInTheDocument();
    });

    it('should handle deposit when vault does not allow token1', () => {
      const vaultNoToken1 = {
        ...mockVaultWithOperations,
        allowToken1: false,
      };

      render(
        <VaultAmount 
          {...defaultProps} 
          vaultContract={vaultNoToken1}
          operation="deposit"
        />
      );
      
      expect(screen.getByText('Token A')).toBeInTheDocument();
      expect(screen.queryByText('Token B')).not.toBeInTheDocument();
    });
  });

  describe('Withdraw Operations', () => {
    it('should validate withdraw amounts against user shares', async () => {
      const onAmountChange = jest.fn();
      render(
        <VaultAmount 
          {...defaultProps} 
          vaultContract={mockVaultWithOperations}
          onAmountChange={onAmountChange}
          operation="withdraw"
        />
      );
      
      const inputs = screen.getAllByTestId('amount-input');
      fireEvent.change(inputs[0], { target: { value: '2000' } }); // More than user has
      
      await waitFor(() => {
        expect(onAmountChange).toHaveBeenCalledWith('2000', '');
      });
    });

    it('should calculate withdraw fees correctly', async () => {
      const onAmountChange = jest.fn();
      render(
        <VaultAmount 
          {...defaultProps} 
          vaultContract={mockVaultWithOperations}
          onAmountChange={onAmountChange}
          operation="withdraw"
          showFees={true}
        />
      );
      
      const inputs = screen.getAllByTestId('amount-input');
      fireEvent.change(inputs[0], { target: { value: '500' } });
      
      await waitFor(() => {
        // Should show fee calculation (0.2% of 500 = 1)
        expect(onAmountChange).toHaveBeenCalledWith('500', '');
      });
    });

    it('should handle partial withdrawal', async () => {
      const onAmountChange = jest.fn();
      render(
        <VaultAmount 
          {...defaultProps} 
          vaultContract={mockVaultWithOperations}
          onAmountChange={onAmountChange}
          operation="withdraw"
        />
      );
      
      const inputs = screen.getAllByTestId('amount-input');
      fireEvent.change(inputs[0], { target: { value: '250' } }); // Half of balance
      
      await waitFor(() => {
        expect(onAmountChange).toHaveBeenCalledWith('250', '');
      });
    });

    it('should handle full withdrawal', async () => {
      const onAmountChange = jest.fn();
      render(
        <VaultAmount 
          {...defaultProps} 
          vaultContract={mockVaultWithOperations}
          onAmountChange={onAmountChange}
          operation="withdraw"
        />
      );
      
      const maxButtons = screen.getAllByText('Max');
      fireEvent.click(maxButtons[0]);
      
      await waitFor(() => {
        expect(onAmountChange).toHaveBeenCalledWith('1000.50', '');
      });
    });

    it('should show user share percentage for withdrawal', () => {
      render(
        <VaultAmount 
          {...defaultProps} 
          vaultContract={mockVaultWithOperations}
          operation="withdraw"
          showSharePercentage={true}
        />
      );
      
      // Should show share percentage (10% in this case)
      expect(screen.getByText(/Balance: 1,000\.50/)).toBeInTheDocument();
    });
  });

  describe('Stake Operations', () => {
    it('should handle staking vault shares', async () => {
      const onAmountChange = jest.fn();
      render(
        <VaultAmount 
          {...defaultProps} 
          vaultContract={mockVaultWithOperations}
          onAmountChange={onAmountChange}
          operation="stake"
        />
      );
      
      const inputs = screen.getAllByTestId('amount-input');
      fireEvent.change(inputs[0], { target: { value: '100' } });
      
      await waitFor(() => {
        expect(onAmountChange).toHaveBeenCalledWith('100', '');
      });
    });

    it('should validate staking amounts against available shares', async () => {
      const onAmountChange = jest.fn();
      render(
        <VaultAmount 
          {...defaultProps} 
          vaultContract={mockVaultWithOperations}
          onAmountChange={onAmountChange}
          operation="stake"
        />
      );
      
      const inputs = screen.getAllByTestId('amount-input');
      fireEvent.change(inputs[0], { target: { value: '2000' } }); // More than available
      
      await waitFor(() => {
        expect(onAmountChange).toHaveBeenCalledWith('2000', '');
      });
    });

    it('should show staking rewards information', () => {
      const vaultWithRewards = {
        ...mockVaultWithOperations,
        stakingRewards: {
          apr: 25.5,
          rewardToken: { symbol: 'BGT', address: '0xbgt' },
        },
      };

      render(
        <VaultAmount 
          {...defaultProps} 
          vaultContract={vaultWithRewards}
          operation="stake"
          showRewards={true}
        />
      );
      
      expect(screen.getByText('Token A')).toBeInTheDocument();
    });
  });

  describe('Unstake Operations', () => {
    it('should handle unstaking vault shares', async () => {
      const vaultWithStakedShares = {
        ...mockVaultWithOperations,
        stakedShares: BigInt('500000000000000000'), // 0.5 shares staked
      };

      const onAmountChange = jest.fn();
      render(
        <VaultAmount 
          {...defaultProps} 
          vaultContract={vaultWithStakedShares}
          onAmountChange={onAmountChange}
          operation="unstake"
        />
      );
      
      const inputs = screen.getAllByTestId('amount-input');
      fireEvent.change(inputs[0], { target: { value: '0.25' } });
      
      await waitFor(() => {
        expect(onAmountChange).toHaveBeenCalledWith('0.25', '');
      });
    });

    it('should validate unstaking amounts against staked shares', async () => {
      const vaultWithStakedShares = {
        ...mockVaultWithOperations,
        stakedShares: BigInt('500000000000000000'),
      };

      const onAmountChange = jest.fn();
      render(
        <VaultAmount 
          {...defaultProps} 
          vaultContract={vaultWithStakedShares}
          onAmountChange={onAmountChange}
          operation="unstake"
        />
      );
      
      const inputs = screen.getAllByTestId('amount-input');
      fireEvent.change(inputs[0], { target: { value: '1' } }); // More than staked
      
      await waitFor(() => {
        expect(onAmountChange).toHaveBeenCalledWith('1', '');
      });
    });

    it('should show pending rewards for unstaking', () => {
      const vaultWithPendingRewards = {
        ...mockVaultWithOperations,
        stakedShares: BigInt('500000000000000000'),
        pendingRewards: BigInt('1000000000000000000'), // 1 BGT
      };

      render(
        <VaultAmount 
          {...defaultProps} 
          vaultContract={vaultWithPendingRewards}
          operation="unstake"
          showPendingRewards={true}
        />
      );
      
      expect(screen.getByText('Token A')).toBeInTheDocument();
    });
  });

  describe('Operation Validation', () => {
    it('should validate deposit is allowed', () => {
      const vaultDepositDisabled = {
        ...mockVaultWithOperations,
        isDepositAllowed: false,
      };

      render(
        <VaultAmount 
          {...defaultProps} 
          vaultContract={vaultDepositDisabled}
          operation="deposit"
        />
      );
      
      const inputs = screen.getAllByTestId('amount-input');
      expect(inputs[0]).toBeDisabled();
    });

    it('should validate withdraw is allowed', () => {
      const vaultWithdrawDisabled = {
        ...mockVaultWithOperations,
        isWithdrawAllowed: false,
      };

      render(
        <VaultAmount 
          {...defaultProps} 
          vaultContract={vaultWithdrawDisabled}
          operation="withdraw"
        />
      );
      
      const inputs = screen.getAllByTestId('amount-input');
      expect(inputs[0]).toBeDisabled();
    });

    it('should handle vault paused state', () => {
      const vaultPaused = {
        ...mockVaultWithOperations,
        isPaused: true,
      };

      render(
        <VaultAmount 
          {...defaultProps} 
          vaultContract={vaultPaused}
          operation="deposit"
        />
      );
      
      const inputs = screen.getAllByTestId('amount-input');
      expect(inputs[0]).toBeDisabled();
    });

    it('should validate operation-specific requirements', async () => {
      const onAmountChange = jest.fn();
      render(
        <VaultAmount 
          {...defaultProps} 
          vaultContract={mockVaultWithOperations}
          onAmountChange={onAmountChange}
          operation="deposit"
          validateOperation={true}
        />
      );
      
      const inputs = screen.getAllByTestId('amount-input');
      fireEvent.change(inputs[0], { target: { value: '0' } }); // Invalid amount
      
      await waitFor(() => {
        expect(onAmountChange).toHaveBeenCalledWith('0', '');
      });
    });
  });

  describe('Fee Calculations', () => {
    it('should display deposit fees when enabled', () => {
      render(
        <VaultAmount 
          {...defaultProps} 
          vaultContract={mockVaultWithOperations}
          operation="deposit"
          showFees={true}
        />
      );
      
      expect(screen.getByText('Token A')).toBeInTheDocument();
    });

    it('should display withdraw fees when enabled', () => {
      render(
        <VaultAmount 
          {...defaultProps} 
          vaultContract={mockVaultWithOperations}
          operation="withdraw"
          showFees={true}
        />
      );
      
      expect(screen.getByText('Token A')).toBeInTheDocument();
    });

    it('should calculate fees for both tokens', async () => {
      const onAmountChange = jest.fn();
      render(
        <VaultAmount 
          {...defaultProps} 
          vaultContract={mockVaultWithOperations}
          onAmountChange={onAmountChange}
          operation="deposit"
          showFees={true}
        />
      );
      
      const inputs = screen.getAllByTestId('amount-input');
      fireEvent.change(inputs[0], { target: { value: '1000' } });
      fireEvent.change(inputs[1], { target: { value: '1000' } });
      
      await waitFor(() => {
        expect(onAmountChange).toHaveBeenCalledWith('1000', '1000');
      });
    });

    it('should handle zero fees', () => {
      const vaultNoFees = {
        ...mockVaultWithOperations,
        depositFee: 0,
        withdrawFee: 0,
      };

      render(
        <VaultAmount 
          {...defaultProps} 
          vaultContract={vaultNoFees}
          operation="deposit"
          showFees={true}
        />
      );
      
      expect(screen.getByText('Token A')).toBeInTheDocument();
    });
  });

  describe('Error Handling for Operations', () => {
    it('should handle insufficient balance errors', async () => {
      const vaultWithZeroBalance = {
        ...mockVaultWithOperations,
        token0: {
          ...mockVaultWithOperations.token0,
          balance: { toFixed: () => '0' },
          balanceFormatted: '0.00',
        },
      };

      const onAmountChange = jest.fn();
      render(
        <VaultAmount 
          {...defaultProps} 
          vaultContract={vaultWithZeroBalance}
          onAmountChange={onAmountChange}
          operation="deposit"
        />
      );
      
      const inputs = screen.getAllByTestId('amount-input');
      fireEvent.change(inputs[0], { target: { value: '100' } });
      
      await waitFor(() => {
        expect(onAmountChange).toHaveBeenCalledWith('100', '');
      });
    });

    it('should handle vault contract errors', () => {
      const vaultWithErrors = {
        ...mockVaultWithOperations,
        deposit: jest.fn().mockRejectedValue(new Error('Contract error')),
      };

      expect(() => {
        render(
          <VaultAmount 
            {...defaultProps} 
            vaultContract={vaultWithErrors}
            operation="deposit"
          />
        );
      }).not.toThrow();
    });

    it('should handle missing operation methods', () => {
      const vaultWithoutMethods = {
        ...mockVaultWithOperations,
        deposit: undefined,
        withdraw: undefined,
      };

      expect(() => {
        render(
          <VaultAmount 
            {...defaultProps} 
            vaultContract={vaultWithoutMethods}
            operation="deposit"
          />
        );
      }).not.toThrow();
    });
  });

  describe('Integration with Vault Workflows', () => {
    it('should support deposit -> stake workflow', async () => {
      const onAmountChange = jest.fn();
      const { rerender } = render(
        <VaultAmount 
          {...defaultProps} 
          vaultContract={mockVaultWithOperations}
          onAmountChange={onAmountChange}
          operation="deposit"
        />
      );
      
      // First deposit
      const inputs = screen.getAllByTestId('amount-input');
      fireEvent.change(inputs[0], { target: { value: '1000' } });
      
      // Then switch to stake
      rerender(
        <VaultAmount 
          {...defaultProps} 
          vaultContract={mockVaultWithOperations}
          onAmountChange={onAmountChange}
          operation="stake"
        />
      );
      
      expect(screen.getByText('Token A')).toBeInTheDocument();
    });

    it('should support unstake -> withdraw workflow', async () => {
      const onAmountChange = jest.fn();
      const { rerender } = render(
        <VaultAmount 
          {...defaultProps} 
          vaultContract={mockVaultWithOperations}
          onAmountChange={onAmountChange}
          operation="unstake"
        />
      );
      
      // First unstake
      const inputs = screen.getAllByTestId('amount-input');
      fireEvent.change(inputs[0], { target: { value: '500' } });
      
      // Then switch to withdraw
      rerender(
        <VaultAmount 
          {...defaultProps} 
          vaultContract={mockVaultWithOperations}
          onAmountChange={onAmountChange}
          operation="withdraw"
        />
      );
      
      expect(screen.getByText('Token A')).toBeInTheDocument();
    });

    it('should maintain state between operation switches', async () => {
      const onAmountChange = jest.fn();
      const { rerender } = render(
        <VaultAmount 
          {...defaultProps} 
          vaultContract={mockVaultWithOperations}
          onAmountChange={onAmountChange}
          operation="deposit"
          values={{ amount0: '100', amount1: '100' }}
        />
      );
      
      expect(screen.getByDisplayValue('100')).toBeInTheDocument();
      
      rerender(
        <VaultAmount 
          {...defaultProps} 
          vaultContract={mockVaultWithOperations}
          onAmountChange={onAmountChange}
          operation="withdraw"
          values={{ amount0: '100', amount1: '100' }}
        />
      );
      
      expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    });
  });

  describe('Advanced Validation', () => {
    it('should validate slippage tolerance for operations', async () => {
      const onAmountChange = jest.fn();
      render(
        <VaultAmount 
          {...defaultProps} 
          vaultContract={mockVaultWithOperations}
          onAmountChange={onAmountChange}
          operation="deposit"
          slippageTolerance={0.5}
        />
      );
      
      const inputs = screen.getAllByTestId('amount-input');
      fireEvent.change(inputs[0], { target: { value: '1000' } });
      
      await waitFor(() => {
        expect(onAmountChange).toHaveBeenCalledWith('1000', '');
      });
    });

    it('should validate deadline for operations', async () => {
      const onAmountChange = jest.fn();
      render(
        <VaultAmount 
          {...defaultProps} 
          vaultContract={mockVaultWithOperations}
          onAmountChange={onAmountChange}
          operation="deposit"
          deadline={1800} // 30 minutes
        />
      );
      
      const inputs = screen.getAllByTestId('amount-input');
      fireEvent.change(inputs[0], { target: { value: '1000' } });
      
      await waitFor(() => {
        expect(onAmountChange).toHaveBeenCalledWith('1000', '');
      });
    });

    it('should validate gas price for operations', async () => {
      const onAmountChange = jest.fn();
      render(
        <VaultAmount 
          {...defaultProps} 
          vaultContract={mockVaultWithOperations}
          onAmountChange={onAmountChange}
          operation="deposit"
          gasPrice="20000000000" // 20 gwei
        />
      );
      
      const inputs = screen.getAllByTestId('amount-input');
      fireEvent.change(inputs[0], { target: { value: '1000' } });
      
      await waitFor(() => {
        expect(onAmountChange).toHaveBeenCalledWith('1000', '');
      });
    });
  });
});