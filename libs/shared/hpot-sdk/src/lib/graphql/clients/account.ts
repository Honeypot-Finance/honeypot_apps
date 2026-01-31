import {
  AllAccountsQuery,
  SingleAccountDetailsDocument,
  SingleAccountDetailsQuery,
  SingleAccountDetailsQueryVariables,
} from '../generated/graphql';
import { All_Accounts } from '../queries/account';
import { useSubgraphClient } from './../../../hooks/useSubgraphClients';
import { ApolloClient } from '@apollo/client';
import { createClientHook } from '../clientUtils';

export async function getAccountsPageData(client: ApolloClient<any>) {
  const accountsQuery = await client.query<AllAccountsQuery>({
    query: All_Accounts,
    fetchPolicy: 'network-only',
    variables: { orderBy: 'platformTxCount', orderDirection: 'desc' },
  });

  return accountsQuery.data;
}

export async function getSingleAccountDetails(
  client: ApolloClient<any>,
  accountId: string
) {
  try {
    const accountQuery = await client.query<
      SingleAccountDetailsQuery,
      SingleAccountDetailsQueryVariables
    >({
      query: SingleAccountDetailsDocument,
      variables: { accountId: accountId.toLowerCase() },
      fetchPolicy: 'network-only',
    });

    if (!accountQuery.data) {
      throw new Error('No data returned from single account query');
    }

    return accountQuery.data;
  } catch (error) {
    console.error('Error fetching single account details:', error);
    throw error;
  }
}

export const useAccount = createClientHook(
  () => useSubgraphClient('algebra_info'),
  {
    getAccountsPageData,
    getSingleAccountDetails,
  }
);
