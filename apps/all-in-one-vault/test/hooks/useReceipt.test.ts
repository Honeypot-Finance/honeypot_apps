import { renderHook } from '@testing-library/react';
import { useReceipt, useIsReceiptClaimable, useFormattedCooldownTime, Receipt } from '../../hooks/useReceipt';
import { useReadContract } from 'wagmi';
import { AllInOneVaultABI } from '../../lib/abis/all-in-one-vault';
import { ALL_IN_ONE_VAULT_PROXY } from '../../config/algebra/addresses';

// Mock wagmi hooks
jest.mock('wagmi', () => ({
  useReadContract: jest.fn(),
}));

const mockUseReadContract = useReadContract as jest.MockedFunction<typeof useReadContract>;

describe('useReceipt', () => {
  const mockRefetch = jest.fn();
  const mockError = new Error('Contract read failed');

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    mockUseReadContract.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    } as any);
  });

  describe('Initial State', () => {
    it('should return initial state correctly', () => {
      const { result } = renderHook(() => useReceipt());

      expect(result.current.receipt).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.error).toBe(null);
      expect(typeof result.current.refetch).toBe('function');
    });

    it('should call useReadContract with correct parameters', () => {
      renderHook(() => useReceipt());

      expect(mockUseReadContract).toHaveBeenCalledWith({
        address: ALL_IN_ONE_VAULT_PROXY,
        abi: AllInOneVaultABI,
        functionName: 'receipts',
      });
    });
  });

  describe('Receipt Data Handling', () => {
    const mockReceiptData: Receipt = {
      user: '0x1234567890123456789012345678901234567890' as `0x${string}`,
      token: '0x0987654321098765432109876543210987654321' as `0x${string}`,
      receiptWeight: BigInt('1000000000000000000000'),
      claimableAt: BigInt(Math.floor(Date.now() / 1000) + 3600), // 1 hour from now
      claimed: false,
    };

    it('should return receipt data when available', () => {
      mockUseReadContract.mockReturnValue({
        data: mockReceiptData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      } as any);

      const { result } = renderHook(() => useReceipt());

      expect(result.current.receipt).toEqual(mockReceiptData);
    });

    it('should handle loading state', () => {
      mockUseReadContract.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: mockRefetch,
      } as any);

      const { result } = renderHook(() => useReceipt());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.receipt).toBeUndefined();
    });

    it('should handle error state', () => {
      mockUseReadContract.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: mockError,
        refetch: mockRefetch,
      } as any);

      const { result } = renderHook(() => useReceipt());

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBe(mockError);
    });
  });

  describe('Refetch Functionality', () => {
    it('should call refetch when invoked', () => {
      const { result } = renderHook(() => useReceipt());

      result.current.refetch();

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });
});

describe('useIsReceiptClaimable', () => {
  const currentTime = Math.floor(Date.now() / 1000);

  describe('Claimable Conditions', () => {
    it('should return false when receipt is undefined', () => {
      const { result } = renderHook(() => useIsReceiptClaimable(undefined));

      expect(result.current).toBe(false);
    });

    it('should return false when receipt is already claimed', () => {
      const claimedReceipt: Receipt = {
        user: '0x1234567890123456789012345678901234567890' as `0x${string}`,
        token: '0x0987654321098765432109876543210987654321' as `0x${string}`,
        receiptWeight: BigInt('1000000000000000000000'),
        claimableAt: BigInt(currentTime - 3600), // 1 hour ago
        claimed: true,
      };

      const { result } = renderHook(() => useIsReceiptClaimable(claimedReceipt));

      expect(result.current).toBe(false);
    });

    it('should return true when receipt is claimable and not claimed', () => {
      const claimableReceipt: Receipt = {
        user: '0x1234567890123456789012345678901234567890' as `0x${string}`,
        token: '0x0987654321098765432109876543210987654321' as `0x${string}`,
        receiptWeight: BigInt('1000000000000000000000'),
        claimableAt: BigInt(currentTime - 3600), // 1 hour ago
        claimed: false,
      };

      const { result } = renderHook(() => useIsReceiptClaimable(claimableReceipt));

      expect(result.current).toBe(true);
    });

    it('should return false when receipt is not yet claimable', () => {
      const futureReceipt: Receipt = {
        user: '0x1234567890123456789012345678901234567890' as `0x${string}`,
        token: '0x0987654321098765432109876543210987654321' as `0x${string}`,
        receiptWeight: BigInt('1000000000000000000000'),
        claimableAt: BigInt(currentTime + 3600), // 1 hour from now
        claimed: false,
      };

      const { result } = renderHook(() => useIsReceiptClaimable(futureReceipt));

      expect(result.current).toBe(false);
    });

    it('should return true when claimableAt equals current time', () => {
      const exactTimeReceipt: Receipt = {
        user: '0x1234567890123456789012345678901234567890' as `0x${string}`,
        token: '0x0987654321098765432109876543210987654321' as `0x${string}`,
        receiptWeight: BigInt('1000000000000000000000'),
        claimableAt: BigInt(currentTime),
        claimed: false,
      };

      const { result } = renderHook(() => useIsReceiptClaimable(exactTimeReceipt));

      expect(result.current).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large claimableAt values', () => {
      const farFutureReceipt: Receipt = {
        user: '0x1234567890123456789012345678901234567890' as `0x${string}`,
        token: '0x0987654321098765432109876543210987654321' as `0x${string}`,
        receiptWeight: BigInt('1000000000000000000000'),
        claimableAt: BigInt('9999999999999'), // Far future
        claimed: false,
      };

      const { result } = renderHook(() => useIsReceiptClaimable(farFutureReceipt));

      expect(result.current).toBe(false);
    });

    it('should handle zero claimableAt value', () => {
      const zeroTimeReceipt: Receipt = {
        user: '0x1234567890123456789012345678901234567890' as `0x${string}`,
        token: '0x0987654321098765432109876543210987654321' as `0x${string}`,
        receiptWeight: BigInt('1000000000000000000000'),
        claimableAt: BigInt(0),
        claimed: false,
      };

      const { result } = renderHook(() => useIsReceiptClaimable(zeroTimeReceipt));

      expect(result.current).toBe(true);
    });
  });
});

describe('useFormattedCooldownTime', () => {
  const currentTime = Math.floor(Date.now() / 1000);

  describe('Cooldown Formatting', () => {
    it('should return "00:00:00" when receipt is undefined', () => {
      const { result } = renderHook(() => useFormattedCooldownTime(undefined));

      expect(result.current).toBe('00:00:00');
    });

    it('should return "00:00:00" when receipt is already claimed', () => {
      const claimedReceipt: Receipt = {
        user: '0x1234567890123456789012345678901234567890' as `0x${string}`,
        token: '0x0987654321098765432109876543210987654321' as `0x${string}`,
        receiptWeight: BigInt('1000000000000000000000'),
        claimableAt: BigInt(currentTime + 3600),
        claimed: true,
      };

      const { result } = renderHook(() => useFormattedCooldownTime(claimedReceipt));

      expect(result.current).toBe('00:00:00');
    });

    it('should return "00:00:00" when receipt is claimable', () => {
      const claimableReceipt: Receipt = {
        user: '0x1234567890123456789012345678901234567890' as `0x${string}`,
        token: '0x0987654321098765432109876543210987654321' as `0x${string}`,
        receiptWeight: BigInt('1000000000000000000000'),
        claimableAt: BigInt(currentTime - 3600), // 1 hour ago
        claimed: false,
      };

      const { result } = renderHook(() => useFormattedCooldownTime(claimableReceipt));

      expect(result.current).toBe('00:00:00');
    });

    it('should format remaining time correctly for hours, minutes, seconds', () => {
      const futureReceipt: Receipt = {
        user: '0x1234567890123456789012345678901234567890' as `0x${string}`,
        token: '0x0987654321098765432109876543210987654321' as `0x${string}`,
        receiptWeight: BigInt('1000000000000000000000'),
        claimableAt: BigInt(currentTime + 3661), // 1 hour, 1 minute, 1 second
        claimed: false,
      };

      const { result } = renderHook(() => useFormattedCooldownTime(futureReceipt));

      expect(result.current).toBe('01:01:01');
    });

    it('should format time with leading zeros', () => {
      const futureReceipt: Receipt = {
        user: '0x1234567890123456789012345678901234567890' as `0x${string}`,
        token: '0x0987654321098765432109876543210987654321' as `0x${string}`,
        receiptWeight: BigInt('1000000000000000000000'),
        claimableAt: BigInt(currentTime + 125), // 2 minutes, 5 seconds
        claimed: false,
      };

      const { result } = renderHook(() => useFormattedCooldownTime(futureReceipt));

      expect(result.current).toBe('00:02:05');
    });

    it('should handle exactly 1 hour remaining', () => {
      const futureReceipt: Receipt = {
        user: '0x1234567890123456789012345678901234567890' as `0x${string}`,
        token: '0x0987654321098765432109876543210987654321' as `0x${string}`,
        receiptWeight: BigInt('1000000000000000000000'),
        claimableAt: BigInt(currentTime + 3600), // Exactly 1 hour
        claimed: false,
      };

      const { result } = renderHook(() => useFormattedCooldownTime(futureReceipt));

      expect(result.current).toBe('01:00:00');
    });

    it('should handle exactly 1 minute remaining', () => {
      const futureReceipt: Receipt = {
        user: '0x1234567890123456789012345678901234567890' as `0x${string}`,
        token: '0x0987654321098765432109876543210987654321' as `0x${string}`,
        receiptWeight: BigInt('1000000000000000000000'),
        claimableAt: BigInt(currentTime + 60), // Exactly 1 minute
        claimed: false,
      };

      const { result } = renderHook(() => useFormattedCooldownTime(futureReceipt));

      expect(result.current).toBe('00:01:00');
    });

    it('should handle exactly 1 second remaining', () => {
      const futureReceipt: Receipt = {
        user: '0x1234567890123456789012345678901234567890' as `0x${string}`,
        token: '0x0987654321098765432109876543210987654321' as `0x${string}`,
        receiptWeight: BigInt('1000000000000000000000'),
        claimableAt: BigInt(currentTime + 1), // Exactly 1 second
        claimed: false,
      };

      const { result } = renderHook(() => useFormattedCooldownTime(futureReceipt));

      expect(result.current).toBe('00:00:01');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long cooldown periods', () => {
      const longCooldownReceipt: Receipt = {
        user: '0x1234567890123456789012345678901234567890' as `0x${string}`,
        token: '0x0987654321098765432109876543210987654321' as `0x${string}`,
        receiptWeight: BigInt('1000000000000000000000'),
        claimableAt: BigInt(currentTime + 86400), // 24 hours
        claimed: false,
      };

      const { result } = renderHook(() => useFormattedCooldownTime(longCooldownReceipt));

      expect(result.current).toBe('24:00:00');
    });

    it('should handle negative remaining time (past claimable time)', () => {
      const pastReceipt: Receipt = {
        user: '0x1234567890123456789012345678901234567890' as `0x${string}`,
        token: '0x0987654321098765432109876543210987654321' as `0x${string}`,
        receiptWeight: BigInt('1000000000000000000000'),
        claimableAt: BigInt(currentTime - 1000), // 1000 seconds ago
        claimed: false,
      };

      const { result } = renderHook(() => useFormattedCooldownTime(pastReceipt));

      expect(result.current).toBe('00:00:00');
    });

    it('should handle zero receiptWeight', () => {
      const zeroWeightReceipt: Receipt = {
        user: '0x1234567890123456789012345678901234567890' as `0x${string}`,
        token: '0x0987654321098765432109876543210987654321' as `0x${string}`,
        receiptWeight: BigInt(0),
        claimableAt: BigInt(currentTime + 3600),
        claimed: false,
      };

      const { result } = renderHook(() => useFormattedCooldownTime(zeroWeightReceipt));

      expect(result.current).toBe('01:00:00');
    });
  });
});