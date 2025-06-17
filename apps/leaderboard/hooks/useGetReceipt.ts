import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { AllInOneVaultABI } from '@/lib/abis/all-in-one-vault';
import { ALL_IN_ONE_VAULT_PROXY } from '@/config/algebra/addresses';
import { useState } from 'react';

export function useGetReceipt() {
  const [processing, setProcessing] = useState(false);
  
  const { 
    data: hash, 
    isPending, 
    isError: isWriteError,
    error: writeError,
    writeContract 
  } = useWriteContract();

  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    isError: isReceiptError,
    error: receiptError
  } = useWaitForTransactionReceipt({ 
    hash 
  });

  const getReceipt = (tokenAddress: string, amount: string) => {
    setProcessing(true);
    
    writeContract({
      address: ALL_IN_ONE_VAULT_PROXY,
      abi: AllInOneVaultABI,
      functionName: 'getReceipt',
      args: [tokenAddress as `0x${string}`, BigInt(Number(amount) * 10 ** 18)], 
    });
  };
  
  const error = writeError || receiptError;
  if (isConfirmed && processing) {
    setProcessing(false);
  }

  return {
    getReceipt,
    processing,
    isPending,
    isConfirming,
    isConfirmed,
    isError: isWriteError || isReceiptError,
    error,
    hash
  };
}
