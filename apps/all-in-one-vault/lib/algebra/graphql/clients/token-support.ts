import { ApolloClient, gql } from '@apollo/client';
import { TokenSupportQueryQuery, TokenSupportQueryDocument } from '../__generated__/graphql';

export async function getListTokenSupport(client: ApolloClient<any>) {
  const { data } = await client.query<TokenSupportQueryQuery>({
    query: TokenSupportQueryDocument,
    fetchPolicy: 'network-only',
  });
  return data.supportReceipts.items;
}
