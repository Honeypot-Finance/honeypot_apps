import { useReadContract } from 'wagmi';
import { AllInOneVaultABI } from '@/lib/abis/all-in-one-vault';
import { ALL_IN_ONE_VAULT_PROXY } from '@/config/algebra/addresses';

export interface Receipt {
  user: `0x${string}`;
  token: `0x${string}`;
  receiptWeight: bigint;
  claimableAt: bigint;
  claimed: boolean;
}

export function useReceipt() {
  const { data, isLoading, isError, error, refetch } = useReadContract({
    address: ALL_IN_ONE_VAULT_PROXY,
    abi: AllInOneVaultABI,
    functionName: 'receipts',
  });

  // Format the data into a more usable structure
  const receipt: Receipt | undefined = data as Receipt | undefined;

  return { 
    receipt,
    isLoading,
    isError,
    error,
    refetch
  };
}

export function useIsReceiptClaimable(receipt: Receipt | undefined) {
  if (!receipt) return false;
  if (receipt.claimed) return false;
  
  const currentTime = BigInt(Math.floor(Date.now() / 1000));
  return currentTime >= receipt.claimableAt;
}

export function useFormattedCooldownTime(receipt: Receipt | undefined) {
  if (!receipt) return "00:00:00";
  
  if (receipt.claimed || useIsReceiptClaimable(receipt)) return "00:00:00";
  
  const currentTime = BigInt(Math.floor(Date.now() / 1000));
  const remainingSeconds = receipt.claimableAt > currentTime 
    ? Number(receipt.claimableAt - currentTime)
    : 0;
  
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
