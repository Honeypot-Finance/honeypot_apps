import { isAddress } from 'viem';
import {
  TokenTop10HoldersDocument,
  TokenTop10HoldersQuery,
  TokenTop10HoldersQueryVariables,
  SingleTokenDocument,
  SingleTokenQuery,
  SingleTokenQueryVariables,
  MultipleTokensQuery,
  MultipleTokensQueryVariables,
  MultipleTokensDocument,
  Token,
} from '../generated/graphql';
import { wallet } from '@/services/wallet';
import { getInfoClientByChainId } from '@/lib/hooks/useSubgraphClients';

let tokenRequestIds: string[] = [];
let tokenRequestTimeout: NodeJS.Timeout | null = null;
let tokenRequestResolvers: ((tokens: Token[]) => void)[] = [];

const bulkGetTokenDebounce = async (tokenId: string): Promise<Token[]> => {
  tokenRequestIds.push(tokenId);

  return new Promise((resolve) => {
    tokenRequestResolvers.push(resolve);

    if (tokenRequestTimeout) {
      clearTimeout(tokenRequestTimeout);
    }

    tokenRequestTimeout = setTimeout(async () => {
      const idsToFetch = [...new Set(tokenRequestIds)]; // de-dupe
      const multipleTokenData = await getMultipleTokensData(
        idsToFetch,
        wallet.currentChainId.toString()
      );

      // Clear queue before resolving
      tokenRequestIds = [];
      tokenRequestTimeout = null;

      // Resolve all waiting promises
      for (const r of tokenRequestResolvers) {
        r(multipleTokenData);
      }
      tokenRequestResolvers = [];
    }, 500);
  });
};

export async function getTokenTop10Holders(tokenId: string) {
  const infoClient = getInfoClientByChainId(wallet.currentChainId.toString());
  const tokenQuery = await infoClient.query<
    TokenTop10HoldersQuery,
    TokenTop10HoldersQueryVariables
  >({
    query: TokenTop10HoldersDocument,
    variables: { tokenId },
  });

  return tokenQuery.data;
}

export async function getSingleTokenData(
  tokenId: string
): Promise<Token | undefined> {
  if (!tokenId || !isAddress(tokenId)) return;
  const tokenData = await bulkGetTokenDebounce(tokenId);
  return tokenData.find((token) => token.id === tokenId) || undefined;
}

export async function getMultipleTokensData(
  tokenIds: string[],
  chainId: string
): Promise<Token[]> {
  if (!tokenIds || tokenIds.length === 0) return [];
  const infoClient = getInfoClientByChainId(chainId);
  const tokenQuery = await infoClient.query<
    MultipleTokensQuery,
    MultipleTokensQueryVariables
  >({
    query: MultipleTokensDocument,
    variables: { tokenIds },
  });
  return tokenQuery.data.tokens as Token[];
}
