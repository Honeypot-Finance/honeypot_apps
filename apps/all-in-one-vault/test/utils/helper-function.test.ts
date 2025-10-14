import {
  calculateSummaryData,
  handleTokenChange,
  handleAmountChange,
  handleCooldownComplete,
  updateClaimedReceipt,
  resetFormState,
  formatNumber,
  formatRewards,
  formatSmallScientific,
  isAmountBelowMinimum,
  MINIMUM_DEPOSIT_AMOUNT,
} from '../../utils/helper-function';

import { toast } from 'react-toastify';

import { ReceiptTableData } from '../../components/Table/table.config';

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
  },
}));

const mockToast = toast as jest.Mocked<typeof toast>;

describe('helper-function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('MINIMUM_DEPOSIT_AMOUNT', () => {
    it('should have correct minimum deposit amount', () => {
      expect(MINIMUM_DEPOSIT_AMOUNT).toBe(10000);
    });
  });

  describe('calculateSummaryData', () => {
    const mockToken = 'USDC';
    const mockWeightPerToken = 100;
    const mockTotalWeight = BigInt('1000000000000000000000');
    const mockTokenBalance = BigInt('5000000000000000000000'); // 5000 tokens

    describe('Valid Inputs', () => {
      it('should calculate summary data correctly with valid inputs', () => {
        const result = calculateSummaryData(
          mockToken,
          '1000',
          mockWeightPerToken,
          mockTotalWeight,
          mockTokenBalance
        );

        expect(result).toEqual({
          weightPerToken: '100',
          balance: '5000',
          receiptWeight: 100000,
        });
      });

      it('should handle decimal amounts', () => {
        const result = calculateSummaryData(
          mockToken,
          '1000.5',
          mockWeightPerToken,
          mockTotalWeight,
          mockTokenBalance
        );

        expect(result).toEqual({
          weightPerToken: '100',
          balance: '5000',
          receiptWeight: 100050,
        });
      });

      it('should handle minimum deposit amount', () => {
        const result = calculateSummaryData(
          mockToken,
          MINIMUM_DEPOSIT_AMOUNT.toString(),
          mockWeightPerToken,
          mockTotalWeight,
          mockTokenBalance
        );
        

        expect(result).toEqual({
          weightPerToken: '100',
          balance: '5000',
          receiptWeight: MINIMUM_DEPOSIT_AMOUNT * mockWeightPerToken,
        });
      });

      it('should handle large amounts', () => {
        const result = calculateSummaryData(
          mockToken,
          '999999',
          mockWeightPerToken,
          mockTotalWeight,
          mockTokenBalance
        );

        expect(result).toEqual({
          weightPerToken: '100',
          balance: '5000',
          receiptWeight: 99999900,
        });
      });
    });

    describe('Edge Cases', () => {
      it('should return undefined when token is empty', () => {
        const result = calculateSummaryData(
          '',
          '1000',
          mockWeightPerToken,
          mockTotalWeight,
          mockTokenBalance
        );

        expect(result).toBeUndefined();
      });

      it('should return undefined when weightPerToken is 0', () => {
        const result = calculateSummaryData(
          mockToken,
          '1000',
          0,
          mockTotalWeight,
          mockTokenBalance
        );

        expect(result).toBeUndefined();
      });

      it('should return basic data when amount is empty', () => {
        const result = calculateSummaryData(
          mockToken,
          '',
          mockWeightPerToken,
          mockTotalWeight,
          mockTokenBalance
        );

        expect(result).toEqual({
          weightPerToken: '100',
          balance: '5000',
          receiptWeight: '0',
        });
      });

      it('should return basic data when amount is whitespace', () => {
        const result = calculateSummaryData(
          mockToken,
          '   ',
          mockWeightPerToken,
          mockTotalWeight,
          mockTokenBalance
        );

        expect(result).toEqual({
          weightPerToken: '100',
          balance: '5000',
          receiptWeight: '0',
        });
      });

      it('should handle invalid amount (NaN)', () => {
        const result = calculateSummaryData(
          mockToken,
          'invalid',
          mockWeightPerToken,
          mockTotalWeight,
          mockTokenBalance
        );

        expect(result).toEqual({
          weightPerToken: '100',
          balance: '5000',
          receiptWeight: '0',
        });
      });

      it('should handle negative amount', () => {
        const result = calculateSummaryData(
          mockToken,
          '-100',
          mockWeightPerToken,
          mockTotalWeight,
          mockTokenBalance
        );

        expect(result).toEqual({
          weightPerToken: '100',
          balance: '5000',
          receiptWeight: '0',
        });
      });

      it('should handle zero amount', () => {
        const result = calculateSummaryData(
          mockToken,
          '0',
          mockWeightPerToken,
          mockTotalWeight,
          mockTokenBalance
        );

        expect(result).toEqual({
          weightPerToken: '100',
          balance: '5000',
          receiptWeight: '0',
        });
      });

      it('should handle undefined tokenBalance', () => {
        const result = calculateSummaryData(
          mockToken,
          '1000',
          mockWeightPerToken,
          mockTotalWeight,
          undefined
        );

        expect(result).toEqual({
          weightPerToken: '100',
          balance: '0',
          receiptWeight: 100000,
        });
      });

      it('should handle null tokenBalance', () => {
        const result = calculateSummaryData(
          mockToken,
          '1000',
          mockWeightPerToken,
          mockTotalWeight,
          null
        );

        expect(result).toEqual({
          weightPerToken: '100',
          balance: '0',
          receiptWeight: 100000,
        });
      });
    });
  });

  describe('handleTokenChange', () => {
    const mockSetSelectedToken = jest.fn();
    const mockSetInsufficientBalance = jest.fn();
    const mockSetSummaryData = jest.fn();
    const mockToken = 'USDC';
    const mockAmount = '1000';
    const mockWeightPerToken = 100;
    const mockTotalWeight = BigInt('1000000000000000000000');
    const mockTokenBalance = BigInt('5000000000000000000000');

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should set selected token and reset insufficient balance', () => {
      handleTokenChange(
        mockToken,
        mockAmount,
        mockWeightPerToken,
        mockTotalWeight,
        mockTokenBalance,
        mockSetSelectedToken,
        mockSetInsufficientBalance,
        mockSetSummaryData
      );

      expect(mockSetSelectedToken).toHaveBeenCalledWith(mockToken);
      expect(mockSetInsufficientBalance).toHaveBeenCalledWith(false);
    });

    it('should calculate and set summary data', () => {
      handleTokenChange(
        mockToken,
        mockAmount,
        mockWeightPerToken,
        mockTotalWeight,
        mockTokenBalance,
        mockSetSelectedToken,
        mockSetInsufficientBalance,
        mockSetSummaryData
      );

      expect(mockSetSummaryData).toHaveBeenCalledWith({
        weightPerToken: '100',
        balance: '5000',
        receiptWeight: 100000,
      });
    });

    it('should set insufficient balance when amount exceeds balance', () => {
      const largeAmount = '10000'; // Exceeds balance of 5000

      handleTokenChange(
        mockToken,
        largeAmount,
        mockWeightPerToken,
        mockTotalWeight,
        mockTokenBalance,
        mockSetSelectedToken,
        mockSetInsufficientBalance,
        mockSetSummaryData
      );

      expect(mockSetInsufficientBalance).toHaveBeenCalledWith(true);
    });

    it('should not set insufficient balance when amount is empty', () => {
      handleTokenChange(
        mockToken,
        '',
        mockWeightPerToken,
        mockTotalWeight,
        mockTokenBalance,
        mockSetSelectedToken,
        mockSetInsufficientBalance,
        mockSetSummaryData
      );

      expect(mockSetInsufficientBalance).toHaveBeenCalledWith(false);
    });

    it('should handle missing weightPerToken', () => {
      handleTokenChange(
        mockToken,
        mockAmount,
        0,
        mockTotalWeight,
        mockTokenBalance,
        mockSetSelectedToken,
        mockSetInsufficientBalance,
        mockSetSummaryData
      );

      expect(mockSetSelectedToken).toHaveBeenCalledWith(mockToken);
      expect(mockSetInsufficientBalance).toHaveBeenCalledWith(false);
      expect(mockSetSummaryData).not.toHaveBeenCalled();
    });
  });

  describe('handleAmountChange', () => {
    const mockSetAmount = jest.fn();
    const mockSetInsufficientBalance = jest.fn();
    const mockSetSummaryData = jest.fn();
    const mockSetBelowMinimum = jest.fn();
    const mockSelectedToken = 'USDC';
    const mockWeightPerToken = 100;
    const mockTotalWeight = BigInt('1000000000000000000000');
    const mockTokenBalance = BigInt('5000000000000000000000');

    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe('Valid Amount Changes', () => {
      it('should set amount and calculate summary data', () => {
        const newAmount = '1000';

        handleAmountChange(
          newAmount,
          mockSelectedToken,
          mockWeightPerToken,
          mockTotalWeight,
          mockTokenBalance,
          mockSetAmount,
          mockSetInsufficientBalance,
          mockSetSummaryData,
          mockSetBelowMinimum
        );

        expect(mockSetAmount).toHaveBeenCalledWith(newAmount);
        expect(mockSetSummaryData).toHaveBeenCalledWith({
          weightPerToken: '100',
          balance: '5000',
          receiptWeight: 100000,
        });
        expect(mockSetInsufficientBalance).toHaveBeenCalledWith(false);
        expect(mockSetBelowMinimum).toHaveBeenCalledWith(true);
      });

      it('should handle amount equal to minimum deposit', () => {
        const newAmount = MINIMUM_DEPOSIT_AMOUNT.toString();

        handleAmountChange(
          newAmount,
          mockSelectedToken,
          mockWeightPerToken,
          mockTotalWeight,
          mockTokenBalance,
          mockSetAmount,
          mockSetInsufficientBalance,
          mockSetSummaryData,
          mockSetBelowMinimum
        );

        expect(mockSetBelowMinimum).toHaveBeenCalledWith(false);
        expect(mockSetInsufficientBalance).toHaveBeenCalledWith(true);
        expect(mockToast.error).toHaveBeenCalledWith(
          `Insufficient balance! You only have 5000 ${mockSelectedToken} tokens available.`,
          expect.objectContaining({
            position: 'top-right',
            autoClose: 3000,
          })
        );
      });
    });

    describe('Below Minimum Amount', () => {
      it('should set below minimum flag and show toast for amount below minimum', () => {
        const belowMinimumAmount = '5000'; // Below MINIMUM_DEPOSIT_AMOUNT

        handleAmountChange(
          belowMinimumAmount,
          mockSelectedToken,
          mockWeightPerToken,
          mockTotalWeight,
          mockTokenBalance,
          mockSetAmount,
          mockSetInsufficientBalance,
          mockSetSummaryData,
          mockSetBelowMinimum
        );

        expect(mockSetBelowMinimum).toHaveBeenCalledWith(true);
        expect(mockToast.error).toHaveBeenCalledWith(
          `Minimum deposit amount is ${MINIMUM_DEPOSIT_AMOUNT.toLocaleString()} tokens!`,
          expect.objectContaining({
            position: 'top-right',
            autoClose: 3000,
          })
        );
      });

      it('should handle setBelowMinimum being undefined', () => {
        const belowMinimumAmount = '5000';

        expect(() => {
          handleAmountChange(
            belowMinimumAmount,
            mockSelectedToken,
            mockWeightPerToken,
            mockTotalWeight,
            mockTokenBalance,
            mockSetAmount,
            mockSetInsufficientBalance,
            mockSetSummaryData
          );
        }).not.toThrow();

        expect(mockToast.error).toHaveBeenCalled();
      });
    });

    describe('Insufficient Balance', () => {
      it('should set insufficient balance and show toast when amount exceeds balance', () => {
        const excessiveAmount = '10000'; // Exceeds balance of 5000

        handleAmountChange(
          excessiveAmount,
          mockSelectedToken,
          mockWeightPerToken,
          mockTotalWeight,
          mockTokenBalance,
          mockSetAmount,
          mockSetInsufficientBalance,
          mockSetSummaryData,
          mockSetBelowMinimum
        );

        expect(mockSetInsufficientBalance).toHaveBeenCalledWith(true);
        expect(mockToast.error).toHaveBeenCalledWith(
          `Insufficient balance! You only have 5000 ${mockSelectedToken} tokens available.`,
          expect.objectContaining({
            position: 'top-right',
            autoClose: 3000,
          })
        );
      });
    });

    describe('Edge Cases', () => {
      it('should reset flags when amount is empty', () => {
        handleAmountChange(
          '',
          mockSelectedToken,
          mockWeightPerToken,
          mockTotalWeight,
          mockTokenBalance,
          mockSetAmount,
          mockSetInsufficientBalance,
          mockSetSummaryData,
          mockSetBelowMinimum
        );

        expect(mockSetInsufficientBalance).toHaveBeenCalledWith(false);
        expect(mockSetBelowMinimum).toHaveBeenCalledWith(false);
      });

      it('should reset flags when amount is whitespace', () => {
        handleAmountChange(
          '   ',
          mockSelectedToken,
          mockWeightPerToken,
          mockTotalWeight,
          mockTokenBalance,
          mockSetAmount,
          mockSetInsufficientBalance,
          mockSetSummaryData,
          mockSetBelowMinimum
        );

        expect(mockSetInsufficientBalance).toHaveBeenCalledWith(false);
        expect(mockSetBelowMinimum).toHaveBeenCalledWith(false);
      });

      it('should handle invalid amount (NaN)', () => {
        handleAmountChange(
          'invalid',
          mockSelectedToken,
          mockWeightPerToken,
          mockTotalWeight,
          mockTokenBalance,
          mockSetAmount,
          mockSetInsufficientBalance,
          mockSetSummaryData,
          mockSetBelowMinimum
        );

        expect(mockSetInsufficientBalance).toHaveBeenCalledWith(false);
        expect(mockSetBelowMinimum).toHaveBeenCalledWith(false);
      });

      it('should handle zero amount', () => {
        handleAmountChange(
          '0',
          mockSelectedToken,
          mockWeightPerToken,
          mockTotalWeight,
          mockTokenBalance,
          mockSetAmount,
          mockSetInsufficientBalance,
          mockSetSummaryData,
          mockSetBelowMinimum
        );

        expect(mockSetInsufficientBalance).toHaveBeenCalledWith(false);
        expect(mockSetBelowMinimum).toHaveBeenCalledWith(false);
      });

      it('should handle negative amount', () => {
        handleAmountChange(
          '-100',
          mockSelectedToken,
          mockWeightPerToken,
          mockTotalWeight,
          mockTokenBalance,
          mockSetAmount,
          mockSetInsufficientBalance,
          mockSetSummaryData,
          mockSetBelowMinimum
        );

        expect(mockSetInsufficientBalance).toHaveBeenCalledWith(false);
        expect(mockSetBelowMinimum).toHaveBeenCalledWith(false);
      });

      it('should reset flags when selectedToken is empty', () => {
        handleAmountChange(
          '1000',
          '',
          mockWeightPerToken,
          mockTotalWeight,
          mockTokenBalance,
          mockSetAmount,
          mockSetInsufficientBalance,
          mockSetSummaryData,
          mockSetBelowMinimum
        );

        expect(mockSetInsufficientBalance).toHaveBeenCalledWith(false);
        expect(mockSetBelowMinimum).toHaveBeenCalledWith(false);
      });

      it('should reset flags when weightPerToken is 0', () => {
        handleAmountChange(
          '1000',
          mockSelectedToken,
          0,
          mockTotalWeight,
          mockTokenBalance,
          mockSetAmount,
          mockSetInsufficientBalance,
          mockSetSummaryData,
          mockSetBelowMinimum
        );

        expect(mockSetInsufficientBalance).toHaveBeenCalledWith(false);
        expect(mockSetBelowMinimum).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('handleCooldownComplete', () => {
    const mockSetCurrentTableData = jest.fn();
    const mockReceiptId = 'receipt-123';

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should update table data when cooldown completes', () => {
      const mockTableData: ReceiptTableData[] = [
        {
          id: mockReceiptId,
          isCooldownActive: true,
          cooldown: '01:30:45',
          action: {
            label: 'Cooldown',
            isDisabled: true,
            className: 'bg-gray-300 text-white px-2 py-1 rounded-md',
            onClick: jest.fn(),
          },
        } as ReceiptTableData,
        {
          id: 'other-receipt',
          isCooldownActive: false,
          cooldown: '00:00:00',
          action: {
            label: 'Claim',
            isDisabled: false,
            className: 'bg-orange-400 hover:bg-orange-500 text-white px-2 py-1 rounded-md',
            onClick: jest.fn(),
          },
        } as ReceiptTableData,
      ];

      mockSetCurrentTableData.mockImplementation((updateFn) => {
        const updatedData = updateFn(mockTableData);
        expect(updatedData[0]).toEqual({
          ...mockTableData[0],
          isCooldownActive: false,
          cooldown: '00:00:00',
          action: {
            ...mockTableData[0].action,
            label: 'Claim',
            isDisabled: false,
            className: 'bg-orange-400 hover:bg-orange-500 text-white px-2 py-1 rounded-md',
          },
        });
        expect(updatedData[1]).toEqual(mockTableData[1]); // Should remain unchanged
      });

      const mockEvent = new CustomEvent('cooldownComplete', { detail: mockReceiptId });
      handleCooldownComplete(mockEvent, mockSetCurrentTableData);

      expect(mockSetCurrentTableData).toHaveBeenCalledTimes(1);
    });

    it('should not modify other receipts', () => {
      const mockTableData: ReceiptTableData[] = [
        {
          id: 'different-receipt',
          isCooldownActive: true,
          cooldown: '02:00:00',
          action: {
            label: 'Cooldown',
            isDisabled: true,
            className: 'bg-gray-300 text-white px-2 py-1 rounded-md',
            onClick: jest.fn(),
          },
        } as ReceiptTableData,
      ];

      mockSetCurrentTableData.mockImplementation((updateFn) => {
        const updatedData = updateFn(mockTableData);
        expect(updatedData[0]).toEqual(mockTableData[0]); // Should remain unchanged
      });

      const mockEvent = new CustomEvent('cooldownComplete', { detail: mockReceiptId });
      handleCooldownComplete(mockEvent, mockSetCurrentTableData);

      expect(mockSetCurrentTableData).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateClaimedReceipt', () => {
    const mockSetCurrentTableData = jest.fn();
    const mockReceiptId = 'receipt-123';

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should update claimed receipt in table data', () => {
      const mockTableData: ReceiptTableData[] = [
        {
          id: mockReceiptId,
          action: {
            label: 'Claim',
            variant: 'default' as const,
            isDisabled: false,
            className: 'bg-orange-400 hover:bg-orange-500 text-white px-2 py-1 rounded-md',
            onClick: jest.fn(),
          },
        } as ReceiptTableData,
      ];

      mockSetCurrentTableData.mockImplementation((updateFn) => {
        const updatedData = updateFn(mockTableData);
        expect(updatedData[0].action.label).toBe('Claimed');
        expect(updatedData[0].action.variant).toBe('outline');
        expect(updatedData[0].action.isDisabled).toBe(true);
        expect(updatedData[0].action.className).toBe('bg-gray-300 text-white px-2 py-1 rounded-md');
      });

      updateClaimedReceipt(mockReceiptId, mockSetCurrentTableData);

      expect(mockSetCurrentTableData).toHaveBeenCalledTimes(1);
    });

    it('should not modify other receipts', () => {
      const mockTableData: ReceiptTableData[] = [
        {
          id: 'different-receipt',
          action: {
            label: 'Claim',
            variant: 'default' as const,
            isDisabled: false,
            className: 'bg-orange-400 hover:bg-orange-500 text-white px-2 py-1 rounded-md',
            onClick: jest.fn(),
          },
        } as ReceiptTableData,
      ];

      mockSetCurrentTableData.mockImplementation((updateFn) => {
        const updatedData = updateFn(mockTableData);
        expect(updatedData[0]).toEqual(mockTableData[0]); // Should remain unchanged
      });

      updateClaimedReceipt(mockReceiptId, mockSetCurrentTableData);

      expect(mockSetCurrentTableData).toHaveBeenCalledTimes(1);
    });
  });

  describe('resetFormState', () => {
    const mockSetSelectedToken = jest.fn();
    const mockSetAmount = jest.fn();
    const mockSetInsufficientBalance = jest.fn();
    const mockSetSummaryData = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should reset all form state to initial values', () => {
      resetFormState(
        mockSetSelectedToken,
        mockSetAmount,
        mockSetInsufficientBalance,
        mockSetSummaryData
      );

      expect(mockSetSelectedToken).toHaveBeenCalledWith('');
      expect(mockSetAmount).toHaveBeenCalledWith('');
      expect(mockSetInsufficientBalance).toHaveBeenCalledWith(false);
      expect(mockSetSummaryData).toHaveBeenCalledWith({
        weightPerToken: '-',
        balance: '-',
        receiptWeight: '0',
        estimatedRewards: '-',
      });
    });
  });

  describe('formatNumber', () => {
    it('should format valid numbers with 1 decimal place', () => {
      expect(formatNumber(123.456)).toBe('123.5');
      expect(formatNumber('123.456')).toBe('123.5');
      expect(formatNumber(123)).toBe('123.0');
      expect(formatNumber('123')).toBe('123.0');
    });

    it('should handle edge cases', () => {
      expect(formatNumber(0)).toBe('0.0');
      expect(formatNumber('0')).toBe('0.0');
      expect(formatNumber(NaN)).toBe('0.0');
      expect(formatNumber('invalid')).toBe('0.0');
      expect(formatNumber('')).toBe('0.0');
    });

    it('should format large numbers with commas', () => {
      expect(formatNumber(1234567.89)).toBe('1,234,567.9');
      expect(formatNumber('1234567.89')).toBe('1,234,567.9');
    });
  });

  describe('formatRewards', () => {
    it('should format rewards correctly with decimals', () => {
      expect(formatRewards(BigInt('1000000000000000000'), 18)).toBe(1);
      expect(formatRewards(BigInt('500000000000000000'), 18)).toBe(0.5);
      expect(formatRewards(1000000, 6)).toBe(1);
    });

    it('should handle undefined decimals', () => {
      expect(formatRewards(BigInt('1000000000000000000'), undefined)).toBe(0);
      expect(formatRewards(1000000, undefined)).toBe(0);
    });

    it('should handle zero values', () => {
      expect(formatRewards(BigInt(0), 18)).toBe(0);
      expect(formatRewards(0, 18)).toBe(0);
    });

    it('should handle different decimal places', () => {
      expect(formatRewards(BigInt('1000000'), 6)).toBe(1);
      expect(formatRewards(BigInt('1000'), 3)).toBe(1);
      expect(formatRewards(BigInt('100'), 2)).toBe(1);
    });
  });

  describe('formatSmallScientific', () => {
    it('should format very small numbers in scientific notation', () => {
      expect(formatSmallScientific(0.0000001)).toBe('1.00e-7');
      expect(formatSmallScientific(0.0000005)).toBe('5.00e-7');
    });

    it('should return original number for larger values', () => {
      expect(formatSmallScientific(0.001)).toBe(0.001);
      expect(formatSmallScientific(1)).toBe(1);
      expect(formatSmallScientific(1000)).toBe(1000);
    });

    it('should handle edge cases', () => {
      expect(formatSmallScientific(0)).toBe(0);
      expect(formatSmallScientific(-0.0000001)).toBe(-0.0000001); // Negative small numbers
    });

    it('should handle boundary values', () => {
      expect(formatSmallScientific(0.000001)).toBe(0.000001); // Exactly 1e-6
      expect(formatSmallScientific(0.0000009)).toBe('9.00e-7'); // Just below 1e-6
    });
  });

  describe('isAmountBelowMinimum', () => {
    it('should return true for amounts below minimum', () => {
      expect(isAmountBelowMinimum('5000')).toBe(true);
      expect(isAmountBelowMinimum('9999')).toBe(true);
      expect(isAmountBelowMinimum('1')).toBe(true);
    });

    it('should return false for amounts at or above minimum', () => {
      expect(isAmountBelowMinimum(MINIMUM_DEPOSIT_AMOUNT.toString())).toBe(false);
      expect(isAmountBelowMinimum('10001')).toBe(false);
      expect(isAmountBelowMinimum('50000')).toBe(false);
    });

    it('should return false for empty or invalid amounts', () => {
      expect(isAmountBelowMinimum('')).toBe(false);
      expect(isAmountBelowMinimum('   ')).toBe(false);
      expect(isAmountBelowMinimum('invalid')).toBe(false);
      expect(isAmountBelowMinimum('0')).toBe(false);
      expect(isAmountBelowMinimum('-100')).toBe(false);
    });

    it('should handle decimal amounts', () => {
      expect(isAmountBelowMinimum('9999.99')).toBe(true);
      expect(isAmountBelowMinimum('10000.01')).toBe(false);
    });
  });
});