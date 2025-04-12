import { ICHIVaultContract } from '@/services/contract/aquabera/ICHIVault-contract';

import {
  AccountVaultSharesDocument,
  AccountVaultSharesQuery,
  AccountVaultSharesQueryResult,
  VaultShare,
  VaultsSortedByHoldersDocument,
  VaultsSortedByHoldersQuery,
  SingleVaultDetailsDocument,
  SingleVaultDetailsQuery,
  IchiVault,
  MultipleVaultDetailsDocument,
  MultipleVaultDetailsQuery,
} from '../generated/graphql';
import { Address } from 'viem';
import { Token } from '@/services/contract/token';
import { poolQueryToContract } from './pool';
import BigNumber from 'bignumber.js';
import { useInfoClient } from '@/lib/hooks/useSubgraphClients';
import { ApolloClient } from '@apollo/client';
import { createClientHook } from '../clientUtils';

// Variables for vault debounce mechanism
let vaultRequestIds: string[] = [];
let vaultRequestTimeout: NodeJS.Timeout | null = null;
let vaultRequestResolvers: ((vaults: ICHIVaultContract[]) => void)[] = [];

// Debounce function for bulk vault requests
const bulkGetVaultDebounce = async (
  vaultId: string,
  client: ApolloClient<any>
): Promise<ICHIVaultContract[]> => {
  vaultRequestIds.push(vaultId);

  return new Promise((resolve) => {
    vaultRequestResolvers.push(resolve);

    if (vaultRequestTimeout) {
      clearTimeout(vaultRequestTimeout);
    }

    vaultRequestTimeout = setTimeout(async () => {
      const idsToFetch = [...new Set(vaultRequestIds)]; // de-dupe
      const multipleVaultData = await getMultipleVaultsData(idsToFetch, client);
      console.log(multipleVaultData);

      // Clear queue before resolving
      vaultRequestIds = [];
      vaultRequestTimeout = null;

      // Resolve all waiting promises
      for (const r of vaultRequestResolvers) {
        r(multipleVaultData.map(vaultQueryResToVaultContract));
      }

      vaultRequestResolvers = [];
    }, 500);
  });
};

// Function to get multiple vaults data
export async function getMultipleVaultsData(
  vaultIds: string[],
  client: ApolloClient<any>
): Promise<IchiVault[]> {
  if (!vaultIds || vaultIds.length === 0) return [];

  try {
    const result = await client.query({
      query: MultipleVaultDetailsDocument,
      variables: {
        vaultIds: vaultIds.map((id) => id.toLowerCase()),
      },
    });

    if (!result.data || !result.data.ichiVaults) {
      return [];
    }

    return result.data.ichiVaults
      .filter((vault: IchiVault | null): vault is IchiVault => vault !== null)
      .map((vault: IchiVault) => vault);
  } catch (error) {
    console.error('Error fetching multiple vault details:', error);
    return [];
  }
}

export const vaultQueryResToVaultContract = (
  vault: IchiVault
): ICHIVaultContract => {
  const vaultContract = ICHIVaultContract.getVault({
    address: vault.id as Address,
    allowToken0: vault.allowTokenA,
    allowToken1: vault.allowTokenB,
    holderCount: BigInt(vault.holdersCount ?? 0),
    isInitialized: true,
    apr: Number(vault.feeApr_1d),
    detailedApr: {
      feeApr_1d: Number(vault.feeApr_1d),
      feeApr_3d: Number(vault.feeApr_3d),
      feeApr_7d: Number(vault.feeApr_7d),
      feeApr_30d: Number(vault.feeApr_30d),
    },
  });

  if (!vaultContract) {
    throw new Error('Vault contract not found');
  }

  vaultContract.token0 = new Token({
    address: vault.tokenA as Address,
  });

  vaultContract.token1 = new Token({
    address: vault.tokenB as Address,
  });

  vaultContract.recentTransactions = [
    ...vault.vaultDeposits,
    ...vault.vaultWithdraws,
  ].sort((a, b) => Number(b.createdAtTimestamp) - Number(a.createdAtTimestamp));

  vaultContract.pool = poolQueryToContract(vault.pool);

  vaultContract.token0.init();
  vaultContract.token1.init();

  return vaultContract;
};

export async function getAccountVaultsList(
  client: ApolloClient<any>,
  accountAddress: string
): Promise<AccountVaultSharesQuery> {
  console.log(AccountVaultSharesDocument);

  const vaults = await client.query<AccountVaultSharesQuery>({
    query: AccountVaultSharesDocument,
    variables: {
      AccountId: accountAddress.toLowerCase(),
    },
  });

  console.log(vaults);

  return vaults.data;
}

export async function getVaultPageData(
  client: ApolloClient<any>,
  search?: string
): Promise<VaultsSortedByHoldersQuery> {
  const vaults = await client.query<VaultsSortedByHoldersQuery>({
    query: VaultsSortedByHoldersDocument,
    variables: {
      search: search ?? '',
    },
  });

  return vaults.data;
}

export async function getSingleVaultDetails(
  client: ApolloClient<any>,
  vaultId: string
): Promise<ICHIVaultContract | null> {
  try {
    // Use the debounce mechanism instead of direct query
    const vaults = await bulkGetVaultDebounce(vaultId, client);
    return (
      vaults.find(
        (vault) => vault.address.toLowerCase() === vaultId.toLowerCase()
      ) || null
    );
  } catch (error) {
    console.error('Error fetching vault details:', error);
    return null;
  }
}

// 创建一个自定义Hook来包装这些函数
export const useVaultsClient = createClientHook(useInfoClient, {
  getAccountVaultsList,
  getVaultPageData,
  getSingleVaultDetails,
});
