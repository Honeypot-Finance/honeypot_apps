import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { AllInOneVaultABI } from '@/lib/abis/all-in-one-vault';
import { ALL_IN_ONE_VAULT_PROXY } from '@/config/algebra/addresses';
import { useState } from 'react';

/**
 * Hook to claim a receipt from the AllInOneVault contract
 * @returns Functions and state for claiming a receipt
 */
export function useClaimReceipt() {
  const [claimingReceiptId, setClaimingReceiptId] = useState<string | null>(null);
  
  // Write contract operation
  const { 
    data: hash, 
    isPending, 
    isError: isWriteError,
    error: writeError,
    writeContract 
  } = useWriteContract();

  // Transaction receipt
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    isError: isReceiptError,
    error: receiptError
  } = useWaitForTransactionReceipt({ 
    hash 
  });

  // Function to claim a receipt
  const claimReceipt = (receiptId: string) => {
    setClaimingReceiptId(receiptId);
    
    writeContract({
      address: ALL_IN_ONE_VAULT_PROXY,
      abi: AllInOneVaultABI,
      functionName: 'claim',
      args: [BigInt(receiptId)],
    });
  };
  
  // Combined error from write or receipt
  const error = writeError || receiptError;
  
  // Reset state when operation is complete
  if (isConfirmed && claimingReceiptId) {
    setClaimingReceiptId(null);
  }

  return {
    claimReceipt,
    claimingReceiptId,
    isPending,
    isConfirming,
    isConfirmed,
    isError: isWriteError || isReceiptError,
    error,
    hash
  };
}
