import { ICHIVaultContract } from '@honeypot/shared';
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
} from '../generated/graphql';
import {
  ACCOUNT_VAULT_SHARES,
  VAULTS_SORTED_BY_HOLDERS,
  SINGLE_VAULT_DETAILS,
} from '../queries/vaults';
import { Address } from 'viem';

import { Token } from '@honeypot/shared';
import { poolQueryToContract } from './pool';
import BigNumber from 'bignumber.js';
import { getSubgraphClientByChainId } from '@honeypot/shared';
import { wallet } from '@honeypot/shared/lib/wallet';

export const vaultQueryResToVaultContract = (
  vault: IchiVault
): ICHIVaultContract => {
  const vaultContract = new ICHIVaultContract({
    address: vault.id as Address,
    allowToken0: vault.allowTokenA,
    allowToken1: vault.allowTokenB,
    holderCount: BigInt(vault.holdersCount),
    isInitialized: true,
  });

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

  // This app keeps its own PairContract; the shared one additionally declares
  // apr_24h / volumeChange24h, which nothing on this path reads.
  vaultContract.pool = poolQueryToContract(vault.pool) as any;

  vaultContract.token0.init();
  vaultContract.token1.init();

  return vaultContract;
};

export async function getAccountVaultsList(
  accountAddress: string
): Promise<AccountVaultSharesQuery> {
  const infoClient = getSubgraphClientByChainId(
    wallet.currentChainId.toString(),
    'algebra_info'
  );
  console.log(AccountVaultSharesDocument);

  const vaults = await infoClient.query<AccountVaultSharesQuery>({
    query: AccountVaultSharesDocument,
    variables: {
      AccountId: accountAddress.toLowerCase(),
    },
  });

  console.log(vaults);

  return vaults.data;
}

export async function getVaultPageData(
  search?: string
): Promise<VaultsSortedByHoldersQuery> {
  console.log(VAULTS_SORTED_BY_HOLDERS);
  const infoClient = getSubgraphClientByChainId(
    wallet.currentChainId.toString(),
    'algebra_info'
  );
  const vaults = await infoClient.query<VaultsSortedByHoldersQuery>({
    query: VaultsSortedByHoldersDocument,
    variables: {
      search: search ?? '',
    },
  });

  return vaults.data;
}

export async function getSingleVaultDetails(
  vaultId: string
): Promise<ICHIVaultContract | null> {
  try {
    const infoClient = getSubgraphClientByChainId(
      wallet.currentChainId.toString(),
      'algebra_info'
    );
    const result = await infoClient.query<SingleVaultDetailsQuery>({
      query: SingleVaultDetailsDocument,
      variables: {
        vaultId: vaultId.toLowerCase(),
      },
    });

    if (!result.data) {
      throw new Error('No data returned from query');
    }

    // Add data validation and transformation here if needed
    return vaultQueryResToVaultContract(result.data.ichiVault as IchiVault);
  } catch (error) {
    console.error('Error fetching vault details:', error);
    // Return an empty or default response structure
    return null;
  }
}
