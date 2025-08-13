import { useEffect, useState } from 'react';
import { wallet } from '@honeypot/shared/lib/wallet';
import { useSubgraphClient } from '@honeypot/shared';
import {
  getVaultPageData,
  getSingleVaultDetails,
} from '@/lib/algebra/graphql/clients/vaults';
import { VaultsSortedByHoldersQuery } from '@/lib/algebra/graphql/generated/graphql';
import { ICHIVaultContract } from '@honeypot/shared';
import { Wallet } from '@honeypot/shared';
interface VaultDataStore {
  allVaults: VaultsSortedByHoldersQuery | null;
  allVaultContracts: ICHIVaultContract[] | null;
  isAllVaultsLoading: boolean;
  isContractsLoading: boolean;
  lastFetched: number;
}

export interface VaultDataPrefetchReturn extends VaultDataStore {
  isLoading: boolean;
  isDataFresh: boolean;
  chainId: number | undefined;
}

const DATA_DURATION = 5 * 60 * 1000; // 5 minutes

// Global data to persist across component unmounts
let globalVaultData: VaultDataStore = {
  allVaults: null,
  allVaultContracts: null,
  isAllVaultsLoading: false,
  isContractsLoading: false,
  lastFetched: 0,
};

export const useVaultDataPrefetch = (): VaultDataPrefetchReturn => {
  const [data, setData] = useState<VaultDataStore>(globalVaultData);
  const infoClient = useSubgraphClient('algebra_info');

  const isDataFresh = () => {
    return Date.now() - data.lastFetched < DATA_DURATION;
  };

  // Process vault contracts with full initialization
  const processAllVaultContracts = async (
    vaults: any[]
  ): Promise<ICHIVaultContract[]> => {
    if (typeof window === 'undefined' || !infoClient) return []; // Skip during SSR/build

    try {
      // Process vaults in parallel but with controlled batching to avoid memory issues
      const batchSize = 10; // Process 10 vaults at a time
      const processedVaults: ICHIVaultContract[] = [];

      for (let i = 0; i < vaults.length; i += batchSize) {
        const batch = vaults.slice(i, i + batchSize);

        const batchPromises = batch.map(async (vault: any) => {
          try {
            const vaultContract = await getSingleVaultDetails(
              infoClient,
              vault.id
            );

            if (vaultContract) {
              // Load all the detailed vault data in parallel
              await Promise.all([
                vaultContract.getTotalAmounts(),
                vaultContract.getTotalSupply(),
                vaultContract.getBalanceOf(wallet.account || '0x0'),
                // Initialize tokens with full data loading
                vaultContract.token0?.init(true, {
                  loadIndexerTokenData: true,
                }),
                vaultContract.token1?.init(true, {
                  loadIndexerTokenData: true,
                }),
              ]);

              return vaultContract;
            }
            return null;
          } catch (error) {
            console.error(`Error processing vault ${vault.id}:`, error);
            return null;
          }
        });

        const batchResults = await Promise.all(batchPromises);
        const validBatchVaults = batchResults.filter(
          (vault): vault is ICHIVaultContract => vault !== null
        );

        processedVaults.push(...validBatchVaults);

        // Small delay between batches to prevent overwhelming the system
        if (i + batchSize < vaults.length) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      // processed data
      try {
        const completeData = {
          contracts: processedVaults.map((vault) => ({
            address: vault.address,
            apr: vault.apr,
            detailedApr: vault.detailedApr,
            tvlUSD: vault.tvlUSD,
            token0: vault.token0
              ? {
                  address: vault.token0.address,
                  symbol: vault.token0.symbol,
                  name: vault.token0.name,
                  decimals: vault.token0.decimals,
                  logoURI: vault.token0.logoURI,
                }
              : null,
            token1: vault.token1
              ? {
                  address: vault.token1.address,
                  symbol: vault.token1.symbol,
                  name: vault.token1.name,
                  decimals: vault.token1.decimals,
                  logoURI: vault.token1.logoURI,
                }
              : null,
          })),
          timestamp: Date.now(),
        };
        localStorage.setItem(
          'prefetch-all-vaults-contracts',
          JSON.stringify(completeData)
        );
      } catch (error) {
        console.warn('Could not set vault contracts to localStorage:', error);
      }

      return processedVaults;
    } catch (error) {
      console.error('Error processing vault contracts:', error);
      return [];
    }
  };

  const fetchAllVaults = async () => {
    if (!infoClient) return;

    setData((prev) => ({
      ...prev,
      isAllVaultsLoading: true,
      isContractsLoading: true,
    }));
    globalVaultData.isAllVaultsLoading = true;
    globalVaultData.isContractsLoading = true;

    try {
      const allVaultsData = await getVaultPageData(infoClient, '');

      // Process all vault contracts with full initialization
      const allVaultContracts = await processAllVaultContracts(
        allVaultsData.ichiVaults || []
      );

      const newData = {
        ...globalVaultData,
        allVaults: allVaultsData,
        allVaultContracts,
        isAllVaultsLoading: false,
        isContractsLoading: false,
        lastFetched: Date.now(),
      };

      globalVaultData = newData;
      setData(newData);
    } catch (error) {
      console.error('Error fetching all vaults:', error);
      const newData = {
        ...globalVaultData,
        isAllVaultsLoading: false,
        isContractsLoading: false,
      };
      globalVaultData = newData;
      setData(newData);
    }
  };

  const prefetchVaultData = async () => {
    // Skip if data is fresh and vault data with contracts is available
    if (isDataFresh() && data.allVaults && data.allVaultContracts) {
      return;
    }

    // Skip if already loading
    if (data.isAllVaultsLoading) {
      return;
    }

    // Fetch vault data if not fresh or not available
    if (
      !data.isAllVaultsLoading &&
      (!data.allVaults || !data.allVaultContracts || !isDataFresh())
    ) {
      await fetchAllVaults();
    }
  };

  // Clear data when chain changes
  const clearDataOnChainChange = () => {
    const clearedData = {
      allVaults: null,
      allVaultContracts: null,
      isAllVaultsLoading: false,
      isContractsLoading: false,
      lastFetched: 0,
    };
    globalVaultData = clearedData;
    setData(clearedData);
  };

  // Track current chain to detect changes
  const [currentChainId, setCurrentChainId] = useState(wallet.currentChainId);

  // Clear data when chain changes
  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip during SSR/build
    
    if (currentChainId !== wallet.currentChainId && wallet.currentChainId !== -1) {
      clearDataOnChainChange();
      setCurrentChainId(wallet.currentChainId);
    }
  }, [wallet.currentChainId, currentChainId]);

  // Auto-prefetch when wallet is ready (only in browser, not during build)
  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip during SSR/build
    if (!wallet.isInit || !infoClient) return;

    prefetchVaultData();
  }, [wallet.isInit, infoClient, data.allVaults]);

  return {
    allVaults: data.allVaults,
    allVaultContracts: data.allVaultContracts,
    isAllVaultsLoading: data.isAllVaultsLoading,
    isContractsLoading: data.isContractsLoading,
    lastFetched: data.lastFetched,
    isLoading: data.isAllVaultsLoading || data.isContractsLoading,
    isDataFresh: isDataFresh(),
    chainId: wallet.currentChainId,
  };
};
