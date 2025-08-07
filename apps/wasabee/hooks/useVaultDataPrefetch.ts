import { useEffect, useState } from 'react';
import { wallet } from '@honeypot/shared/lib/wallet';
import { useSubgraphClient } from '@honeypot/shared';
import {
  getAccountVaultsList,
  getVaultPageData,
  getSingleVaultDetails,
} from '@/lib/algebra/graphql/clients/vaults';
import {
  AccountVaultSharesQuery,
  VaultsSortedByHoldersQuery,
} from '@/lib/algebra/graphql/generated/graphql';
import { ICHIVaultContract } from '@honeypot/shared';

interface VaultDataStore {
  myVaults: AccountVaultSharesQuery | null;
  allVaults: VaultsSortedByHoldersQuery | null;
  allVaultContracts: ICHIVaultContract[] | null;
  myVaultContracts: ICHIVaultContract[] | null;
  isMyVaultsLoading: boolean;
  isAllVaultsLoading: boolean;
  isContractsLoading: boolean;
  lastFetched: number;
}

export interface VaultDataPrefetchReturn extends VaultDataStore {
  isLoading: boolean;
  prefetchVaultData: () => Promise<void>;
  isDataFresh: boolean;
}

const DATA_DURATION = 5 * 60 * 1000; // 5 minutes

// Global data to persist across component unmounts
let globalVaultData: VaultDataStore = {
  myVaults: null,
  allVaults: null,
  allVaultContracts: null,
  myVaultContracts: null,
  isMyVaultsLoading: false,
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

  // Process my vault contracts with full initialization
  const processMyVaultContracts = async (
    vaultShares: any[]
  ): Promise<ICHIVaultContract[]> => {
    if (typeof window === 'undefined') return []; // Skip during SSR/build

    try {
      const myVaultContracts = await Promise.all(
        vaultShares.map(async (vaultShare) => {
          try {
            const vaultContract = ICHIVaultContract.getVault({
              token0: vaultShare.vault.tokenA,
              token1: vaultShare.vault.tokenB,
              address: vaultShare.vault.id as `0x${string}`,
              apr: Number(vaultShare.vault.feeApr_1d),
              detailedApr: {
                feeApr_1d: Number(vaultShare.vault.feeApr_1d),
                feeApr_3d: Number(vaultShare.vault.feeApr_3d),
                feeApr_7d: Number(vaultShare.vault.feeApr_7d),
                feeApr_30d: Number(vaultShare.vault.feeApr_30d),
              },
            });

            if (vaultContract && wallet.account) {
              // Initialize with full data loading
              await Promise.all([
                vaultContract.getTotalAmounts(),
                vaultContract.getTotalSupply(),
                vaultContract.getBalanceOf(wallet.account),
                vaultContract.token0?.init(true, {
                  loadIndexerTokenData: true,
                }),
                vaultContract.token1?.init(true, {
                  loadIndexerTokenData: true,
                }),
              ]);
            }

            return vaultContract;
          } catch (error) {
            console.error(
              `Error processing user vault ${vaultShare.vault.id}:`,
              error
            );
            return null;
          }
        })
      );

      const validContracts = myVaultContracts.filter(
        Boolean
      ) as ICHIVaultContract[];

      return validContracts;
    } catch (error) {
      console.error('Error processing my vault contracts:', error);
      return [];
    }
  };

  const fetchMyVaults = async () => {
    if (!wallet.isInit || !wallet.account || !infoClient) return;

    setData((prev) => ({
      ...prev,
      isMyVaultsLoading: true,
      isContractsLoading: true,
    }));
    globalVaultData.isMyVaultsLoading = true;
    globalVaultData.isContractsLoading = true;

    try {
      const myVaultsData = await getAccountVaultsList(
        infoClient,
        wallet.account
      );

      // Process vault contracts with full initialization
      const myVaultContracts = await processMyVaultContracts(
        myVaultsData.vaultShares
      );

      const newData = {
        ...globalVaultData,
        myVaults: myVaultsData,
        myVaultContracts,
        isMyVaultsLoading: false,
        isContractsLoading: false,
        lastFetched: Date.now(),
      };

      globalVaultData = newData;
      setData(newData);
    } catch (error) {
      console.error('Error fetching my vaults:', error);
      const newData = {
        ...globalVaultData,
        isMyVaultsLoading: false,
        isContractsLoading: false,
      };
      globalVaultData = newData;
      setData(newData);
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
    // Skip if data is fresh and both datasets with contracts are available
    if (
      isDataFresh() &&
      data.allVaults &&
      data.allVaultContracts &&
      data.myVaults &&
      data.myVaultContracts
    ) {
      return;
    }

    // Skip if already loading both datasets
    if (data.isMyVaultsLoading && data.isAllVaultsLoading) {
      return;
    }

    // Fetch both datasets in parallel for maximum speed
    const promises: Promise<void>[] = [];

    // Always fetch all vaults if not fresh or not available
    if (
      !data.isAllVaultsLoading &&
      (!data.allVaults || !data.allVaultContracts || !isDataFresh())
    ) {
      promises.push(fetchAllVaults());
    }

    // Only fetch my vaults if wallet is connected and data is not fresh
    if (
      !data.isMyVaultsLoading &&
      (!data.myVaults || !data.myVaultContracts || !isDataFresh()) &&
      wallet.isInit &&
      wallet.account
    ) {
      promises.push(fetchMyVaults());
    }

    if (promises.length > 0) {
      await Promise.all(promises);
    }
  };

  // Auto-prefetch when wallet is ready (only in browser, not during build)
  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip during SSR/build
    if (!wallet.isInit || !infoClient) return;

    prefetchVaultData();
  }, [wallet.isInit, wallet.account, infoClient]);

  // Refresh data when wallet account changes
  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip during SSR/build
    if (!wallet.account) return;

    // Clear my vaults data when account changes
    globalVaultData.myVaults = null;
    globalVaultData.myVaultContracts = null;
    setData((prev) => ({ ...prev, myVaults: null, myVaultContracts: null }));

    // Fetch new data
    prefetchVaultData();
  }, [wallet.account]);

  return {
    myVaults: data.myVaults,
    allVaults: data.allVaults,
    allVaultContracts: data.allVaultContracts,
    myVaultContracts: data.myVaultContracts,
    isMyVaultsLoading: data.isMyVaultsLoading,
    isAllVaultsLoading: data.isAllVaultsLoading,
    isContractsLoading: data.isContractsLoading,
    lastFetched: data.lastFetched,
    isLoading:
      data.isMyVaultsLoading ||
      data.isAllVaultsLoading ||
      data.isContractsLoading,
    prefetchVaultData,
    isDataFresh: isDataFresh(),
  };
};
