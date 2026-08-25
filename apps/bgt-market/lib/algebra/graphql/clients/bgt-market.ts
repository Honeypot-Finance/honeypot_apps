import { ApolloClient, gql, InMemoryCache } from '@apollo/client';

import { GetBgtVaultsQueryVariables } from '../generated/graphql';
import { useEffect, useState } from 'react';

const BERA_CHAIN_API_URL = 'https://api.berachain.com/';

// Berachain enforces a client-name header on api.berachain.com; requests
// without it are rejected. Keep this identifier stable — it is how the
// Berachain Foundation attributes our traffic.
const BERA_CHAIN_CLIENT_NAME = 'honeypot-finance';

const bgtClient = new ApolloClient({
  uri: BERA_CHAIN_API_URL,
  headers: {
    'x-graphql-client-name': BERA_CHAIN_CLIENT_NAME,
  },
  ssrMode: true,
  cache: new InMemoryCache(),
});

export const useBGTVaults = () => {
  const [bgtVaults, setBgtVaults] = useState<
    {
      address: string;
      metadata: {
        name: string;
        logoURI: string;
        url: string;
        protocolName: string;
        description: string;
      };
    }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const vaultSql = gql`
    query GetVaults(
      $where: GqlRewardVaultFilter
      $pageSize: Int
      $skip: Int
      $orderBy: GqlRewardVaultOrderBy = bgtCapturePercentage
      $orderDirection: GqlRewardVaultOrderDirection = desc
      $search: String
    ) {
      polGetRewardVaults(
        where: $where
        first: $pageSize
        skip: $skip
        orderBy: $orderBy
        orderDirection: $orderDirection
        search: $search
      ) {
        pagination {
          currentPage
          totalCount
          __typename
        }
        vaults {
          ...ApiVault
          __typename
        }
        __typename
      }
    }

    fragment ApiVault on GqlRewardVault {
      id: vaultAddress
      vaultAddress
      address: vaultAddress
      isVaultWhitelisted
      dynamicData {
        allTimeReceivedBGTAmount
        apr
        bgtCapturePercentage
        activeIncentivesValueUsd
        activeIncentivesRateUsd
        __typename
      }
      stakingToken {
        address
        name
        symbol
        decimals
        __typename
      }
      metadata {
        name
        logoURI
        url
        protocolName
        description
        __typename
      }
      activeIncentives {
        ...ApiVaultIncentive
        __typename
      }
      __typename
    }

    fragment ApiVaultIncentive on GqlRewardVaultIncentive {
      active
      remainingAmount
      remainingAmountUsd
      incentiveRate
      tokenAddress
      token {
        address
        name
        symbol
        decimals
        __typename
      }
      __typename
    }
  `;

  useEffect(() => {
    bgtClient
      .query({
        query: vaultSql,
        variables: {
          orderBy: 'bgtCapturePercentage',
          orderDirection: 'desc',
          skip: 0,
          pageSize: 1000,
          where: { includeNonWhitelisted: false },
        },
      })
      .then((res) => {
        setBgtVaults(
          res.data?.polGetRewardVaults.vaults as {
            address: string;
            metadata: {
              name: string;
              logoURI: string;
              url: string;
              protocolName: string;
              description: string;
            };
          }[]
        );
        setLoading(false);
      });
  }, []);

  return {
    data: bgtVaults,
    loading,
    error,
  };
};
