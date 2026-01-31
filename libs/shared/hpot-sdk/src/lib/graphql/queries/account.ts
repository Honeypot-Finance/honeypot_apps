import { gql } from "@apollo/client";

export const All_Accounts = gql`
  query AllAccounts(
    $orderBy: Account_orderBy
    $orderDirection: OrderDirection
  ) {
    accounts(first: 100, orderBy: $orderBy, orderDirection: $orderDirection) {
      ...AccountField
    }
  }
`;

export const SINGLE_ACCOUNT_DETAILS = gql`
  query SingleAccountDetails($accountId: ID!) {
    account(id: $accountId) {
      ...AccountField
    }
  }
`;

export const ACCOUNT_FRAGMENT = gql`
  fragment AccountField on Account {
    id
    swapCount
    platformTxCount
    holdingPoolCount
    totalSpendUSD
    vaultShares {
      ...VaultShareField
    }
  }
`;

export const VAULT_SHARE_FRAGMENT = gql`
  fragment VaultShareField on VaultShare {
    id
    vaultShareBalance
    vault {
      ...AlgebraVaultField
    }
  }
`;

export const VAULT_FRAGMENT = gql`
  fragment AlgebraVaultField on IchiVault {
    id
  }
`;

export const TOKEN_FRAGMENT = gql`
  fragment TokenField on Token {
    id
    symbol
    derivedUSD
  }
`;
