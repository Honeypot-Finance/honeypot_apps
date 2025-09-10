import { useEffect, useState } from 'react';
import { wallet } from '@honeypot/shared/lib/wallet';
import { useSubgraphClient } from '@honeypot/shared';
import {
  getVaultPageData,
  getSingleVaultDetails,
} from '@/lib/algebra/graphql/clients/vaults';
import { VaultsSortedByHoldersQuery } from '@/lib/algebra/graphql/generated/graphql';
import { ICHIVaultContract } from '@honeypot/shared';
import { ProcessedVault } from '@/lib/cache/vaults-cache';
import { useChainId } from 'wagmi';
interface VaultDataStore {
  allVaults: VaultsSortedByHoldersQuery | null;
  allVaultContracts: ICHIVaultContract[] | null;
  processedVaults: ProcessedVault[] | null;
  isAllVaultsLoading: boolean;
  isContractsLoading: boolean;
  isProcessedLoading: boolean;
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
  processedVaults: null,
  isAllVaultsLoading: false,
  isContractsLoading: false,
  isProcessedLoading: false,
  lastFetched: 0,
};

export const useVaultDataPrefetch = (): VaultDataPrefetchReturn => {
  const [data, setData] = useState<VaultDataStore>(globalVaultData);
  const infoClient = useSubgraphClient('algebra_info');
  const chainId = useChainId();

  const isDataFresh = () => {
    return Date.now() - data.lastFetched < DATA_DURATION;
  };

  // Fetch processed vault data from cache
  const fetchProcessedVaultData = async () => {
    if (!chainId) {
      console.log('❌ #fetch fetchProcessedVaultData: No chainId');
      return;
    }

    console.log(`🔄  #fetch fetchProcessedVaultData: Starting for chain ${chainId}`);

    globalVaultData.isProcessedLoading = true;

    try {
      const startTime = Date.now();
      const response = await fetch(`/api/vaults/cached?chainId=${chainId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch cached vault data: ${response.statusText}`);
      }

      const result = await response.json();
      const endTime = Date.now();
      
      console.log(`📥 fetchProcessedVaultData: API response in ${endTime - startTime}ms`,response, {
        success: result.success,
        vaultCount: result.vaults?.length || 0,
        cached: result.cached,
        stale: result.stale
        
      });
      
      if (result.success && result.vaults) {
        const newData = {
          ...globalVaultData,
          processedVaults: result.vaults,
          isProcessedLoading: false,
          lastFetched: Date.now(),
        };

        globalVaultData = newData;
        setData(newData);
        
        console.log(`✅ fetchProcessedVaultData: Stored ${result.vaults.length} processed vaults for chain ${chainId}`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ fetchProcessedVaultData error:', error);
      const newData = {
        ...globalVaultData,
        isProcessedLoading: false,
      };
      globalVaultData = newData;
      setData(newData);
    }
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
    // Try to use processed vault data first (fastest)
    if (!data.processedVaults && !data.isProcessedLoading) {
      await fetchProcessedVaultData();
      return;
    }

    // Skip if processed data is fresh
    if (isDataFresh() && data.processedVaults) {
      return;
    }

    // Skip if data is fresh and vault data with contracts is available
    if (isDataFresh() && data.allVaults && data.allVaultContracts) {
      return;
    }

    // Skip if already loading
    if (data.isAllVaultsLoading || data.isProcessedLoading) {
      return;
    }

    // Prefer cached processed data over subgraph fetching
    if (!data.processedVaults) {
      await fetchProcessedVaultData();
    } else if (
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
      processedVaults: null,
      isAllVaultsLoading: false,
      isContractsLoading: false,
      isProcessedLoading: false,
      lastFetched: 0,
    };
    globalVaultData = clearedData;
    setData(clearedData);
  };

  // Track current chain to detect changes
  const [currentChainId, setCurrentChainId] = useState(chainId);

  // Clear data when chain changes
  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip during SSR/build
    
    if (currentChainId !== chainId && chainId) {
      clearDataOnChainChange();
      setCurrentChainId(chainId);
    }
  }, [chainId]);

  // Auto-prefetch when chain is available (only in browser, not during build)
  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip during SSR/build
    if (!chainId) return;

    console.log('🚀 useVaultDataPrefetch triggered for chain:', chainId);
    prefetchVaultData();
  }, [chainId]);

  return {
    allVaults: data.allVaults,
    allVaultContracts: data.allVaultContracts,
    processedVaults: data.processedVaults,
    isAllVaultsLoading: data.isAllVaultsLoading,
    isContractsLoading: data.isContractsLoading,
    isProcessedLoading: data.isProcessedLoading,
    lastFetched: data.lastFetched,
    isLoading: data.isAllVaultsLoading || data.isContractsLoading || data.isProcessedLoading,
    isDataFresh: isDataFresh(),
    chainId: chainId,
  };
};
