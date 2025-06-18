import { ApolloClient } from '@apollo/client';
import { Receipt, ReceiptsListDocument } from '../__generated__/graphql';
import { getSubgraphClientByChainId, wallet } from '@honeypot/shared';

export async function fetchListReceiptsPerUser(
  client: ApolloClient<any>,
  accountId: string
) {
  const infoClient = getSubgraphClientByChainId(
      wallet.currentChainId.toString(),
      'algebra_info'
  );
  const listReceiptsPerUsers = await infoClient.query<any>({
    query: ReceiptsListDocument,
    variables: { accountId: accountId.toLowerCase() },
    fetchPolicy: 'network-only',
  });

  return listReceiptsPerUsers.data.receipts as Receipt[];
}
