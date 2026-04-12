import { useAccount, useReadContract, usePublicClient } from 'wagmi';
import { AllInOneVaultABI } from '@/lib/abis/all-in-one-vault';
import { ALL_IN_ONE_VAULT_PROXY } from '@/config/algebra/addresses';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import React from 'react';

export interface OnChainReceipt {
  id: string;
  receiptId: string;
  user: string;
  token: string;
  receiptWeight: string;
  claimableAt: string;
  isClaimed: boolean;
}

export interface SupportedToken {
  id: string;
  weight: string;
}

interface OnChainReceiptsState {
  receipts: OnChainReceipt[];
  supportedTokens: SupportedToken[];
  totalWeight: string | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  poll: () => Promise<void>;
}

const CONTRACT_ADDRESS = ALL_IN_ONE_VAULT_PROXY;
const MULTICALL_BATCH_SIZE = 100;
const MAX_CONCURRENT_BATCHES = 5;

const DEFAULT_STATE: OnChainReceiptsState = {
  receipts: [],
  supportedTokens: [],
  totalWeight: undefined,
  isLoading: true,
  isError: false,
  error: null,
  refetch: async () => {},
  poll: async () => {},
};

const OnChainReceiptsContext = createContext<OnChainReceiptsState>(DEFAULT_STATE);

/**
 * Provider that fetches on-chain receipts once and shares data with all consumers.
 * Wrap the page/section that contains StatCard, Table, etc.
 */
export function OnChainReceiptsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [receipts, setReceipts] = useState<OnChainReceipt[]>([]);
  const [supportedTokens, setSupportedTokens] = useState<SupportedToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const {
    data: nextReceiptID,
    refetch: refetchNextId,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: AllInOneVaultABI,
    functionName: 'nextReceiptID',
  });

  const {
    data: totalWeight,
    refetch: refetchTotalWeight,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: AllInOneVaultABI,
    functionName: 'totalWeight',
  });

  const fetchReceipts = useCallback(
    async (total: number) => {
      if (!publicClient || !address) return;

      // Abort any in-flight fetch
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      setIsError(false);
      setError(null);

      try {
        const lowerAddress = address.toLowerCase();
        const allResults: OnChainReceipt[] = [];
        const uniqueTokens = new Set<string>();

        // Build all batch definitions
        const batches: { start: number; end: number }[] = [];
        for (let i = 0; i < total; i += MULTICALL_BATCH_SIZE) {
          batches.push({ start: i, end: Math.min(i + MULTICALL_BATCH_SIZE, total) });
        }

        // Process batches with limited concurrency
        for (let i = 0; i < batches.length; i += MAX_CONCURRENT_BATCHES) {
          if (controller.signal.aborted) return;

          const chunk = batches.slice(i, i + MAX_CONCURRENT_BATCHES);
          const chunkResults = await Promise.all(
            chunk.map(async ({ start, end }) => {
              const contracts = [];
              for (let j = start; j < end; j++) {
                contracts.push({
                  address: CONTRACT_ADDRESS as `0x${string}`,
                  abi: AllInOneVaultABI,
                  functionName: 'receipts' as const,
                  args: [BigInt(j)] as const,
                });
              }
              const results = await publicClient.multicall({ contracts });
              return { start, results };
            })
          );

          if (controller.signal.aborted) return;

          for (const { start, results } of chunkResults) {
            for (let j = 0; j < results.length; j++) {
              const item = results[j];
              if (item.status !== 'success' || !item.result) continue;

              const [user, token, receiptWeight, claimableAt, claimed] =
                item.result as [string, string, bigint, bigint, boolean];

              // Collect all unique token addresses for supported token lookup
              uniqueTokens.add(token);

              if (user.toLowerCase() !== lowerAddress) continue;

              const receiptIndex = start + j;
              allResults.push({
                id: String(receiptIndex),
                receiptId: String(receiptIndex),
                user,
                token,
                receiptWeight: String(receiptWeight),
                claimableAt: String(claimableAt),
                isClaimed: claimed,
              });
            }
          }
        }

        if (controller.signal.aborted) return;

        // Sort by ID descending (newest first)
        allResults.reverse();
        setReceipts(allResults);

        // Check which tokens are currently supported (weight > 0)
        if (uniqueTokens.size > 0) {
          const tokenAddresses = Array.from(uniqueTokens);
          const tokenContracts = tokenAddresses.map((t) => ({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: AllInOneVaultABI,
            functionName: 'supportedTokens' as const,
            args: [t as `0x${string}`] as const,
          }));
          const tokenResults = await publicClient.multicall({ contracts: tokenContracts });

          if (controller.signal.aborted) return;

          const activeTokens: SupportedToken[] = [];
          for (let k = 0; k < tokenResults.length; k++) {
            const res = tokenResults[k];
            if (res.status === 'success' && res.result) {
              const weight = res.result as bigint;
              if (weight > BigInt(0)) {
                activeTokens.push({
                  id: tokenAddresses[k],
                  weight: String(weight),
                });
              }
            }
          }
          setSupportedTokens(activeTokens);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error('Error fetching on-chain receipts:', err);
        setIsError(true);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [publicClient, address]
  );

  // Fetch when nextReceiptID or address changes
  useEffect(() => {
    if (nextReceiptID) {
      fetchReceipts(Number(nextReceiptID));
    }
  }, [nextReceiptID, fetchReceipts]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  // Full refetch: re-reads nextReceiptID, totalWeight, and all receipts
  const refetch = useCallback(async () => {
    const { data } = await refetchNextId();
    await refetchTotalWeight();
    if (data) {
      await fetchReceipts(Number(data));
    }
  }, [refetchNextId, refetchTotalWeight, fetchReceipts]);

  // Lightweight poll: only re-reads nextReceiptID, totalWeight, and
  // the current user's receipt claim statuses (not all 1348 receipts)
  const poll = useCallback(async () => {
    if (!publicClient || !address || receipts.length === 0) return;

    await refetchTotalWeight();

    // Check if new receipts were added
    const { data: latestId } = await refetchNextId();
    if (latestId && Number(latestId) !== Number(nextReceiptID)) {
      // New receipts added — do full refetch
      await fetchReceipts(Number(latestId));
      return;
    }

    // Re-read only the user's receipt claim statuses
    const unclaimed = receipts.filter((r) => !r.isClaimed);
    if (unclaimed.length === 0) return;

    const contracts = unclaimed.map((r) => ({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: AllInOneVaultABI,
      functionName: 'receipts' as const,
      args: [BigInt(r.id)] as const,
    }));

    try {
      const results = await publicClient.multicall({ contracts });
      let changed = false;

      const updated = receipts.map((r) => {
        const idx = unclaimed.findIndex((u) => u.id === r.id);
        if (idx === -1) return r;
        const res = results[idx];
        if (res.status !== 'success' || !res.result) return r;
        const claimed = (res.result as [string, string, bigint, bigint, boolean])[4];
        if (claimed && !r.isClaimed) {
          changed = true;
          return { ...r, isClaimed: true };
        }
        return r;
      });

      if (changed) setReceipts(updated);
    } catch {
      // Silently fail on poll — full refetch will retry
    }
  }, [publicClient, address, receipts, nextReceiptID, refetchNextId, refetchTotalWeight, fetchReceipts]);

  const value: OnChainReceiptsState = {
    receipts,
    supportedTokens,
    totalWeight: totalWeight ? String(totalWeight) : undefined,
    isLoading,
    isError,
    error,
    refetch,
    poll,
  };

  return (
    <OnChainReceiptsContext.Provider value={value}>
      {children}
    </OnChainReceiptsContext.Provider>
  );
}

/**
 * Hook to consume shared on-chain receipts data.
 * Must be used within an OnChainReceiptsProvider.
 */
export function useOnChainReceipts(): OnChainReceiptsState {
  return useContext(OnChainReceiptsContext);
}
