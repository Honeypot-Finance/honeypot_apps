



import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ApproveAndBurnButton } from '../../../components/button/button-approve-and-burn';
import { useAccount, useWriteContract } from 'wagmi';
import { useApprove } from '@/lib/algebra/hooks/common/useApprove';
import { ApprovalState } from '@/types/algebra/types/approve-state';
import { waitForTransactionReceipt } from '@wagmi/core';
import { MINIMUM_DEPOSIT_AMOUNT } from '../../../utils/helper-function';



// Mock dependencies
jest.mock('wagmi', () => ({
  useAccount: jest.fn(),
  useWriteContract: jest.fn(),
}));

jest.mock('../../../lib/algebra/hooks/common/useApprove', () => ({
  useApprove: jest.fn(),
}));

jest.mock('@wagmi/core', () => ({
  waitForTransactionReceipt: jest.fn(),
}));

jest.mock('../../../config/wagmi', () => ({
  config: {},
}));

const mockUseAccount = useAccount as jest.MockedFunction<typeof useAccount>;
const mockUseWriteContract = useWriteContract as jest.MockedFunction<typeof useWriteContract>;
const mockUseApprove = useApprove as jest.MockedFunction<typeof useApprove>;
const mockWaitForTransactionReceipt = waitForTransactionReceipt as jest.MockedFunction<typeof waitForTransactionReceipt>;

describe('ApproveAndBurnButton', () => {
  const defaultProps = {
    tokenAddress: '0x1234567890123456789012345678901234567890' as `0x${string}`,
    tokenDecimals: 18,
    tokenSymbol: 'US',
    userAmount: BigInt('1000000000000000000000'), // 1000 tokens
    onSuccess: jest.fn(),
    onError: jest.fn(),
    insufficientBalance: false,
    belowMinimum: false,
  };

  const mockApprovalCallback = jest.fn();
  const mockWriteContractAsync = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mocks
    mockUseAccount.mockReturnValue({
      address: '0xuser123456789012345678901234567890123456' as `0x${string}`,
    } as any);

    mockUseWriteContract.mockReturnValue({
      writeContractAsync: mockWriteContractAsync,
    } as any);

    mockUseApprove.mockReturnValue({
      approvalState: ApprovalState.NOT_APPROVED,
      approvalCallback: mockApprovalCallback,
    } as any);

    mockWaitForTransactionReceipt.mockResolvedValue({
      status: 'success',
      transactionHash: '0xhash123',
    } as any);
  });

  describe('Button States', () => {
    it('should show "Connect Wallet" when user is not connected', () => {
      mockUseAccount.mockReturnValue({
        address: undefined,
      } as any);

      render(<ApproveAndBurnButton {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Connect Wallet');
      expect(button).toBeDisabled();
    });

    it('should show "Enter Amount" when userAmount is undefined', () => {
      render(<ApproveAndBurnButton {...defaultProps} userAmount={undefined} />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Enter Amount');
      expect(button).toBeDisabled();
    });

    it('should show "Enter Amount" when userAmount is zero', () => {
      render(<ApproveAndBurnButton {...defaultProps} userAmount={BigInt(0)} />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Enter Amount');
      expect(button).toBeDisabled();
    });

    it('should show minimum deposit message when below minimum', () => {
      render(<ApproveAndBurnButton {...defaultProps} belowMinimum={true} />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent(`Min. ${MINIMUM_DEPOSIT_AMOUNT.toLocaleString()} Tokens`);
      expect(button).toBeDisabled();
    });

    it('should show "Insufficient Balance" when balance is insufficient', () => {
      render(<ApproveAndBurnButton {...defaultProps} insufficientBalance={true} />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Insufficient Balance');
      expect(button).toBeDisabled();
    });

    it('should show "Approve" when approval is needed', () => {
      mockUseApprove.mockReturnValue({
        approvalState: ApprovalState.NOT_APPROVED,
        approvalCallback: mockApprovalCallback,
      } as any);

      render(<ApproveAndBurnButton {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Approve');
      expect(button).not.toBeDisabled();
    });

    it('should show "Approval Pending..." when approval is pending', () => {
      mockUseApprove.mockReturnValue({
        approvalState: ApprovalState.PENDING,
        approvalCallback: mockApprovalCallback,
      } as any);

      render(<ApproveAndBurnButton {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Approval Pending...');
      expect(button).toBeDisabled();
    });

    it('should show "Burn2Vault" when approved', () => {
      mockUseApprove.mockReturnValue({
        approvalState: ApprovalState.APPROVED,
        approvalCallback: mockApprovalCallback,
      } as any);

      render(<ApproveAndBurnButton {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Burn2Vault');
      expect(button).not.toBeDisabled();
    });

    it('should show "Unknown" for unknown approval state', () => {
      mockUseApprove.mockReturnValue({
        approvalState: 'UNKNOWN' as any,
        approvalCallback: mockApprovalCallback,
      } as any);

      render(<ApproveAndBurnButton {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Unknown');
      expect(button).toBeDisabled();
    });
  });

  describe('Approval Flow', () => {
    it('should call approval callback when approve button is clicked', async () => {
      mockUseApprove.mockReturnValue({
        approvalState: ApprovalState.NOT_APPROVED,
        approvalCallback: mockApprovalCallback,
      } as any);

      render(<ApproveAndBurnButton {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockApprovalCallback).toHaveBeenCalledTimes(1);
      });
    });

    it('should show "Approving..." during approval process', async () => {
      mockUseApprove.mockReturnValue({
        approvalState: ApprovalState.NOT_APPROVED,
        approvalCallback: jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100))),
      } as any);

      render(<ApproveAndBurnButton {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(button).toHaveTextContent('Approving...');
      expect(button).toBeDisabled();
    });

    it('should handle approval failure', async () => {
      const approvalError = new Error('Approval failed');
      mockUseApprove.mockReturnValue({
        approvalState: ApprovalState.NOT_APPROVED,
        approvalCallback: jest.fn().mockRejectedValue(approvalError),
      } as any);

      render(<ApproveAndBurnButton {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(defaultProps.onError).toHaveBeenCalledWith('Approval failed');
      });
    });
  });

  describe('Burn to Vault Flow', () => {
    beforeEach(() => {
      mockUseApprove.mockReturnValue({
        approvalState: ApprovalState.APPROVED,
        approvalCallback: mockApprovalCallback,
      } as any);
    });

    it('should call writeContractAsync when burn button is clicked', async () => {
      const mockHash = '0xhash123';
      mockWriteContractAsync.mockResolvedValue(mockHash);

      render(<ApproveAndBurnButton {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockWriteContractAsync).toHaveBeenCalledWith({
          address: '0x9c52cD80455a9ee50610aC90e846e46E04014f6d',
          abi: expect.any(Array),
          functionName: 'getReceipt',
          args: [defaultProps.tokenAddress, defaultProps.userAmount],
        });
      });
    });

    it('should show "Processing..." during burn process', async () => {
      mockWriteContractAsync.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<ApproveAndBurnButton {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(button).toHaveTextContent('Processing...');
      expect(button).toBeDisabled();
    });

    it('should call onSuccess when burn is successful', async () => {
      const mockHash = '0xhash123';
      mockWriteContractAsync.mockResolvedValue(mockHash);

      render(<ApproveAndBurnButton {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockWaitForTransactionReceipt).toHaveBeenCalledWith(expect.any(Object), { hash: mockHash });
        expect(defaultProps.onSuccess).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle burn failure', async () => {
      const burnError = new Error('Burn failed');
      mockWriteContractAsync.mockRejectedValue(burnError);

      render(<ApproveAndBurnButton {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(defaultProps.onError).toHaveBeenCalledWith('Burn to vault failed');
      });
    });

    it('should handle invalid amount error', async () => {
      // Force the button to be in approved state but with invalid amount
      mockUseApprove.mockReturnValue({
        approvalState: ApprovalState.APPROVED,
        approvalCallback: mockApprovalCallback,
      } as any);

      // Render with approved state but undefined amount
      render(<ApproveAndBurnButton {...defaultProps} userAmount={undefined} />);

      // The button should show "Enter Amount" and be disabled
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Enter Amount');
      expect(button).toBeDisabled();
    });
  });

  describe('Button Styling', () => {
    it('should apply disabled styling when button is disabled', () => {
      render(<ApproveAndBurnButton {...defaultProps} userAmount={undefined} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gray-300', 'text-gray-500', 'cursor-not-allowed');
    });

    it('should apply enabled styling when button is enabled', () => {
      mockUseApprove.mockReturnValue({
        approvalState: ApprovalState.NOT_APPROVED,
        approvalCallback: mockApprovalCallback,
      } as any);

      render(<ApproveAndBurnButton {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-amber-500', 'text-white');
      expect(button).not.toHaveClass('bg-gray-300', 'text-gray-500', 'cursor-not-allowed');
    });

    it('should have consistent shadow styling', () => {
      render(<ApproveAndBurnButton {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large amounts', () => {
      const largeAmount = BigInt('999999999999999999999999999999');
      
      render(<ApproveAndBurnButton {...defaultProps} userAmount={largeAmount} />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Approve');
    });

    it('should handle different token decimals', () => {
      render(<ApproveAndBurnButton {...defaultProps} tokenDecimals={6} />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Approve');
    });

    it('should handle different token symbols', () => {
      render(<ApproveAndBurnButton {...defaultProps} tokenSymbol="DAI" />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Approve');
    });

    it('should handle missing callbacks gracefully', () => {
      render(<ApproveAndBurnButton {...defaultProps} onSuccess={undefined} onError={undefined} />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Approve');
    });

    it('should handle approval callback being undefined', async () => {
      mockUseApprove.mockReturnValue({
        approvalState: ApprovalState.NOT_APPROVED,
        approvalCallback: undefined,
      } as any);

      render(<ApproveAndBurnButton {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Approve');
      
      fireEvent.click(button);

      // Should not throw error and button text should remain the same
      await waitFor(() => {
        expect(button).toHaveTextContent('Approve');
      });
    });
  });

  describe('Multiple State Combinations', () => {
    it('should prioritize wallet connection over other states', () => {
      mockUseAccount.mockReturnValue({
        address: undefined,
      } as any);

      render(<ApproveAndBurnButton {...defaultProps} insufficientBalance={true} belowMinimum={true} />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Connect Wallet');
    });

    it('should prioritize amount entry over balance checks', () => {
      render(<ApproveAndBurnButton {...defaultProps} userAmount={undefined} insufficientBalance={true} />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Enter Amount');
    });

    it('should prioritize minimum amount over insufficient balance', () => {
      render(<ApproveAndBurnButton {...defaultProps} belowMinimum={true} insufficientBalance={true} />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent(`Min. ${MINIMUM_DEPOSIT_AMOUNT.toLocaleString()} Tokens`);
    });
  });

  describe('CurrencyAmount Creation', () => {
    it('should create currency amount correctly', () => {
      render(<ApproveAndBurnButton {...defaultProps} />);

      expect(mockUseApprove).toHaveBeenCalledWith(
        expect.objectContaining({
          currency: expect.objectContaining({
            chainId: 80094,
            address: defaultProps.tokenAddress,
            decimals: defaultProps.tokenDecimals,
            symbol: defaultProps.tokenSymbol,
          }),
        }),
        expect.any(String)
      );
    });

    it('should handle undefined userAmount in currency creation', () => {
      render(<ApproveAndBurnButton {...defaultProps} userAmount={undefined} />);

      expect(mockUseApprove).toHaveBeenCalledWith(
        undefined,
        expect.any(String)
      );
    });
  });
});