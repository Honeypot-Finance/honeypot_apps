import { gql } from '@apollo/client';

export const VAULTS_SORTED_BY_HOLDERS = gql`
  query VaultsSortedByHolders($search: String) {
    ichiVaults(
      first: 100
      orderBy: holdersCount
      orderDirection: desc
      where: { searchString_contains_nocase: $search }
    ) {
      ...VaultField
    }
  }
`;

export const ACCOUNT_VAULT_SHARES = gql`
  query AccountVaultShares($AccountId: ID!) {
    vaultShares(where: { user_: { id: $AccountId }, vaultShareBalance_gt: 0 }) {
      ...VaultSharesField
      id
    }
  }
`;

export const VAULT_USER_FRAMGMENT = gql`
  fragment VaultUserField on Account {
    id
  }
`;

export const VAULT_SHARE_FRAGMENT = gql`
  fragment VaultSharesField on VaultShare {
    id
    vault {
      ...VaultField
    }
    vaultShareBalance
  }
`;

export const VAULT_FRAGMENT = gql`
  fragment VaultField on IchiVault {
    id
    sender
    tokenA
    allowTokenA
    tokenB
    allowTokenB
    count
    createdAtTimestamp
    holdersCount
    totalShares
    feeApr_1d
    feeApr_3d
    feeApr_7d
    feeApr_30d
    pool {
      ...PoolField
    }
  }
`;

export const POOL_FRAGMENT = gql`
  fragment PoolField on Pool {
    id
    totalValueLockedUSD
    token0 {
      id
      symbol
      name
      decimals
    }
    token1 {
      id
      symbol
      name
      decimals
    }
    poolDayData(first: 30, orderBy: date, orderDirection: desc) {
      date
      volumeUSD
      feesUSD
      tvlUSD
    }
  }
`;

export const MULTIPLE_VAULT_DETAILS = gql`
  query MultipleVaultDetails($vaultIds: [ID!]!) {
    ichiVaults(where: { id_in: $vaultIds }) {
      ...VaultField
      vaultShares {
        id
        vaultShareBalance
      }
      vaultDeposits(
        orderBy: createdAtTimestamp
        orderDirection: desc
        first: 100
      ) {
        id
        createdAtTimestamp
        amount0
        amount1
        shares
        to
      }
      vaultWithdraws(
        orderBy: createdAtTimestamp
        orderDirection: desc
        first: 100
      ) {
        id
        createdAtTimestamp
        amount0
        amount1
        shares
        to
      }
      vaultCollectFees(
        orderBy: createdAtTimestamp
        orderDirection: desc
        first: 100
      ) {
        id
        createdAtTimestamp
        feeAmount0
        feeAmount1
        sender
      }
    }
  }
`;

export const SINGLE_VAULT_DETAILS = gql`
  query SingleVaultDetails($vaultId: ID!) {
    ichiVault(id: $vaultId) {
      ...VaultField
      vaultShares {
        id
        vaultShareBalance
      }
      vaultDeposits(
        orderBy: createdAtTimestamp
        orderDirection: desc
        first: 100
      ) {
        id
        createdAtTimestamp
        amount0
        amount1
        shares
        to
      }
      vaultWithdraws(
        orderBy: createdAtTimestamp
        orderDirection: desc
        first: 100
      ) {
        id
        createdAtTimestamp
        amount0
        amount1
        shares
        to
      }
      vaultCollectFees(
        orderBy: createdAtTimestamp
        orderDirection: desc
        first: 100
      ) {
        id
        createdAtTimestamp
        feeAmount0
        feeAmount1
        sender
      }
    }
  }
  ${VAULT_FRAGMENT}
`;
