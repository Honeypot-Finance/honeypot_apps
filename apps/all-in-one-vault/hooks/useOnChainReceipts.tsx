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

// Known token addresses that may be supported by the vault.
// Ensures newly added tokens appear in the dropdown even if nobody has burned them yet.
const KNOWN_TOKEN_ADDRESSES: `0x${string}`[] = [
  '0xa32bFAf94E37911D08531212d32EADe94389243b',
  '0x3A1d9069b791556C68c41860E70c2779B8D4509C',
  '0x773f8b20CC9bb82a67Ad2C5d996bB3Db79118EE1',
  '0x10AcD894a40d8584aD74628812525EF291e16C47',
  '0x539ACed84eBB5cbD609CFaf4047Fb78b29553dA9',
  '0x2bDE2638045e73dCE5c7b0e415d07D2884E39857',
];

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

type ReceiptTuple = [string, string, bigint, bigint, boolean];

function isValidReceiptResult(result: unknown): result is ReceiptTuple {
  return (
    Array.isArray(result) &&
    result.length === 5 &&
    typeof result[0] === 'string' &&
    typeof result[1] === 'string' &&
    typeof result[4] === 'boolean'
  );
}

/** Parse a batch of multicall results into user receipts and unique tokens. */
function parseReceiptBatch(
  batchStart: number,
  results: { status: string; result: unknown }[],
  lowerAddress: string,
  userReceipts: OnChainReceipt[],
  uniqueTokens: Set<string>
) {
  for (let j = 0; j < results.length; j++) {
    const item = results[j];
    if (item.status !== 'success' || !item.result) continue;
    if (!isValidReceiptResult(item.result)) continue;

    const [user, token, receiptWeight, claimableAt, claimed] = item.result;
    uniqueTokens.add(token);

    if (user.toLowerCase() !== lowerAddress) continue;

    const receiptIndex = batchStart + j;
    userReceipts.push({
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

/** Check which token addresses are currently supported (weight > 0). */
async function fetchSupportedTokens(
  publicClient: ReturnType<typeof usePublicClient>,
  tokenAddresses: string[]
): Promise<SupportedToken[]> {
  if (!publicClient || tokenAddresses.length === 0) return [];

  const contracts = tokenAddresses.map((t) => ({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: AllInOneVaultABI,
    functionName: 'supportedTokens' as const,
    args: [t as `0x${string}`] as const,
  }));
  const results = await publicClient.multicall({ contracts });

  const active: SupportedToken[] = [];
  for (let i = 0; i < results.length; i++) {
    const res = results[i];
    if (res.status !== 'success' || !res.result) continue;
    const weight = res.result as bigint;
    if (weight > BigInt(0)) {
      active.push({ id: tokenAddresses[i], weight: String(weight) });
    }
  }
  return active;
}

/**
 * Provider that fetches on-chain receipts once and shares data with all consumers.
 * Also discovers supported tokens from receipt data + known addresses.
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

        // Build batch definitions
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
              return {
                start,
                results: await publicClient.multicall({ contracts }),
              };
            })
          );

          if (controller.signal.aborted) return;

          for (const { start, results } of chunkResults) {
            parseReceiptBatch(start, results as any, lowerAddress, allResults, uniqueTokens);
          }
        }

        if (controller.signal.aborted) return;

        allResults.reverse();
        setReceipts(allResults);

        // Merge discovered tokens with known list, then check weights
        KNOWN_TOKEN_ADDRESSES.forEach((t) => uniqueTokens.add(t));
        const activeTokens = await fetchSupportedTokens(
          publicClient,
          Array.from(uniqueTokens)
        );

        if (!controller.signal.aborted) {
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

  // Lightweight poll: only checks nextReceiptID + unclaimed receipt statuses
  const poll = useCallback(async () => {
    if (!publicClient || !address || receipts.length === 0) return;

    await refetchTotalWeight();

    const { data: latestId } = await refetchNextId();
    if (latestId && Number(latestId) !== Number(nextReceiptID)) {
      await fetchReceipts(Number(latestId));
      return;
    }

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
        if (!isValidReceiptResult(res.result)) return r;
        const claimed = res.result[4];
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
