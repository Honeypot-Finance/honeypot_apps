import { renderHook, act } from '@testing-library/react';
import { useGetReceipt } from '../../hooks/useGetReceipt';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { AllInOneVaultABI } from '../../lib/abis/all-in-one-vault';
import { ALL_IN_ONE_VAULT_PROXY } from '../../config/algebra/addresses';

// Mock wagmi hooks
jest.mock('wagmi', () => ({
  useWriteContract: jest.fn(),
  useWaitForTransactionReceipt: jest.fn(),
}));

const mockUseWriteContract = useWriteContract as jest.MockedFunction<typeof useWriteContract>;
const mockUseWaitForTransactionReceipt = useWaitForTransactionReceipt as jest.MockedFunction<typeof useWaitForTransactionReceipt>;

describe('useGetReceipt', () => {
  const mockWriteContract = jest.fn();
  const mockHash = '0x123456789abcdef';
  const mockError = new Error('Transaction failed');

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockUseWriteContract.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: false,
      error: null,
      writeContract: mockWriteContract,
    } as any);

    mockUseWaitForTransactionReceipt.mockReturnValue({
      isLoading: false,
      isSuccess: false,
      isError: false,
      error: null,
    } as any);
  });

  describe('Initial State', () => {
    it('should return initial state correctly', () => {
      const { result } = renderHook(() => useGetReceipt());

      expect(result.current.processing).toBe(false);
      expect(result.current.isPending).toBe(false);
      expect(result.current.isConfirming).toBe(false);
      expect(result.current.isConfirmed).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.hash).toBeUndefined();
      expect(typeof result.current.getReceipt).toBe('function');
    });
  });

  describe('getReceipt Function', () => {
    it('should call writeContract with correct parameters', () => {
      const { result } = renderHook(() => useGetReceipt());
      const tokenAddress = '0x1234567890123456789012345678901234567890';
      const amount = '1000';

      act(() => {
        result.current.getReceipt(tokenAddress, amount);
      });

      expect(mockWriteContract).toHaveBeenCalledWith({
        address: ALL_IN_ONE_VAULT_PROXY,
        abi: AllInOneVaultABI,
        functionName: 'getReceipt',
        args: [tokenAddress, BigInt(Number(amount) * 10 ** 18)],
      });
    });

    it('should set processing to true when called', () => {
      const { result } = renderHook(() => useGetReceipt());

      act(() => {
        result.current.getReceipt('0x1234567890123456789012345678901234567890', '1000');
      });

      expect(result.current.processing).toBe(true);
    });

    it('should handle large amounts correctly', () => {
      const { result } = renderHook(() => useGetReceipt());
      const tokenAddress = '0x1234567890123456789012345678901234567890';
      const amount = '999999999';

      act(() => {
        result.current.getReceipt(tokenAddress, amount);
      });

      expect(mockWriteContract).toHaveBeenCalledWith({
        address: ALL_IN_ONE_VAULT_PROXY,
        abi: AllInOneVaultABI,
        functionName: 'getReceipt',
        args: [tokenAddress, BigInt(Number(amount) * 10 ** 18)],
      });
    });

    it('should handle minimum deposit amount', () => {
      const { result } = renderHook(() => useGetReceipt());
      const tokenAddress = '0x1234567890123456789012345678901234567890';
      const amount = '10000'; // MINIMUM_DEPOSIT_AMOUNT

      act(() => {
        result.current.getReceipt(tokenAddress, amount);
      });

      expect(mockWriteContract).toHaveBeenCalledWith({
        address: ALL_IN_ONE_VAULT_PROXY,
        abi: AllInOneVaultABI,
        functionName: 'getReceipt',
        args: [tokenAddress, BigInt(Number(amount) * 10 ** 18)],
      });
    });
  });

  describe('Transaction States', () => {
    it('should reflect pending state from useWriteContract', () => {
      mockUseWriteContract.mockReturnValue({
        data: undefined,
        isPending: true,
        isError: false,
        error: null,
        writeContract: mockWriteContract,
      } as any);

      const { result } = renderHook(() => useGetReceipt());

      expect(result.current.isPending).toBe(true);
    });

    it('should reflect confirming state from useWaitForTransactionReceipt', () => {
      mockUseWaitForTransactionReceipt.mockReturnValue({
        isLoading: true,
        isSuccess: false,
        isError: false,
        error: null,
      } as any);

      const { result } = renderHook(() => useGetReceipt());

      expect(result.current.isConfirming).toBe(true);
    });

    it('should reflect confirmed state and reset processing', () => {
      mockUseWaitForTransactionReceipt.mockReturnValue({
        isLoading: false,
        isSuccess: true,
        isError: false,
        error: null,
      } as any);

      const { result } = renderHook(() => useGetReceipt());

      // First set processing to true
      act(() => {
        result.current.getReceipt('0x1234567890123456789012345678901234567890', '1000');
      });

      expect(result.current.isConfirmed).toBe(true);
      expect(result.current.processing).toBe(false);
    });

    it('should return transaction hash when available', () => {
      mockUseWriteContract.mockReturnValue({
        data: mockHash,
        isPending: false,
        isError: false,
        error: null,
        writeContract: mockWriteContract,
      } as any);

      const { result } = renderHook(() => useGetReceipt());

      expect(result.current.hash).toBe(mockHash);
    });
  });

  describe('Error Handling', () => {
    it('should handle write contract errors', () => {
      mockUseWriteContract.mockReturnValue({
        data: undefined,
        isPending: false,
        isError: true,
        error: mockError,
        writeContract: mockWriteContract,
      } as any);

      const { result } = renderHook(() => useGetReceipt());

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBe(mockError);
    });

    it('should handle receipt errors', () => {
      mockUseWaitForTransactionReceipt.mockReturnValue({
        isLoading: false,
        isSuccess: false,
        isError: true,
        error: mockError,
      } as any);

      const { result } = renderHook(() => useGetReceipt());

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBe(mockError);
    });

    it('should combine write and receipt errors', () => {
      const writeError = new Error('Write error');
      const receiptError = new Error('Receipt error');

      mockUseWriteContract.mockReturnValue({
        data: undefined,
        isPending: false,
        isError: true,
        error: writeError,
        writeContract: mockWriteContract,
      } as any);

      mockUseWaitForTransactionReceipt.mockReturnValue({
        isLoading: false,
        isSuccess: false,
        isError: true,
        error: receiptError,
      } as any);

      const { result } = renderHook(() => useGetReceipt());

      expect(result.current.isError).toBe(true);
      // Should return the first error (writeError)
      expect(result.current.error).toBe(writeError);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero amount', () => {
      const { result } = renderHook(() => useGetReceipt());
      const tokenAddress = '0x1234567890123456789012345678901234567890';
      const amount = '0';

      act(() => {
        result.current.getReceipt(tokenAddress, amount);
      });

      expect(mockWriteContract).toHaveBeenCalledWith({
        address: ALL_IN_ONE_VAULT_PROXY,
        abi: AllInOneVaultABI,
        functionName: 'getReceipt',
        args: [tokenAddress, BigInt(0)],
      });
    });

    it('should handle decimal amounts', () => {
      const { result } = renderHook(() => useGetReceipt());
      const tokenAddress = '0x1234567890123456789012345678901234567890';
      const amount = '1000.5';

      act(() => {
        result.current.getReceipt(tokenAddress, amount);
      });

      expect(mockWriteContract).toHaveBeenCalledWith({
        address: ALL_IN_ONE_VAULT_PROXY,
        abi: AllInOneVaultABI,
        functionName: 'getReceipt',
        args: [tokenAddress, BigInt(Number(amount) * 10 ** 18)],
      });
    });

    it('should handle empty token address', () => {
      const { result } = renderHook(() => useGetReceipt());
      const tokenAddress = '';
      const amount = '1000';

      act(() => {
        result.current.getReceipt(tokenAddress, amount);
      });

      expect(mockWriteContract).toHaveBeenCalledWith({
        address: ALL_IN_ONE_VAULT_PROXY,
        abi: AllInOneVaultABI,
        functionName: 'getReceipt',
        args: [tokenAddress, BigInt(Number(amount) * 10 ** 18)],
      });
    });

    it('should handle invalid token address format', () => {
      const { result } = renderHook(() => useGetReceipt());
      const tokenAddress = 'invalid-address';
      const amount = '1000';

      act(() => {
        result.current.getReceipt(tokenAddress, amount);
      });

      expect(mockWriteContract).toHaveBeenCalledWith({
        address: ALL_IN_ONE_VAULT_PROXY,
        abi: AllInOneVaultABI,
        functionName: 'getReceipt',
        args: [tokenAddress, BigInt(Number(amount) * 10 ** 18)],
      });
    });
  });

  describe('State Transitions', () => {
    it('should transition from idle to pending to confirmed', () => {
      const { result, rerender } = renderHook(() => useGetReceipt());

      // Initial state
      expect(result.current.isPending).toBe(false);
      expect(result.current.isConfirming).toBe(false);
      expect(result.current.isConfirmed).toBe(false);

      // Pending state
      mockUseWriteContract.mockReturnValue({
        data: undefined,
        isPending: true,
        isError: false,
        error: null,
        writeContract: mockWriteContract,
      } as any);

      rerender();
      expect(result.current.isPending).toBe(true);

      // Confirming state
      mockUseWriteContract.mockReturnValue({
        data: mockHash,
        isPending: false,
        isError: false,
        error: null,
        writeContract: mockWriteContract,
      } as any);

      mockUseWaitForTransactionReceipt.mockReturnValue({
        isLoading: true,
        isSuccess: false,
        isError: false,
        error: null,
      } as any);

      rerender();
      expect(result.current.isPending).toBe(false);
      expect(result.current.isConfirming).toBe(true);

      // Confirmed state
      mockUseWaitForTransactionReceipt.mockReturnValue({
        isLoading: false,
        isSuccess: true,
        isError: false,
        error: null,
      } as any);

      rerender();
      expect(result.current.isConfirming).toBe(false);
      expect(result.current.isConfirmed).toBe(true);
    });
  });
});