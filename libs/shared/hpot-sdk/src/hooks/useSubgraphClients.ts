import { useMemo } from 'react';
import {
  InMemoryCache,
  ApolloClient,
  NormalizedCacheObject,
  createHttpLink,
} from '@apollo/client';
import { useObserver } from 'mobx-react-lite';
import { wallet } from '../lib/wallet/wallet';
import { networksMap } from '../config/chains/chain';
import { SubgraphEndpointType } from '../config/subgraphEndPoint';

const ApolloClientsRecord: Record<
  string,
  Record<SubgraphEndpointType, ApolloClient<NormalizedCacheObject>>
> = {};
const ApolloProxyClientsRecord: Record<
  string,
  Record<SubgraphEndpointType, ApolloClient<NormalizedCacheObject>>
> = {};

const createProxiedClient = (
  endpoint: SubgraphEndpointType,
  chainId: string
) => {
  if (ApolloProxyClientsRecord[chainId]?.[endpoint]) {
    return ApolloProxyClientsRecord[chainId][endpoint];
  }
  const client = new ApolloClient({
    link: createHttpLink({
      uri: `/api/graphql/${endpoint}?chainId=${chainId}`,
      credentials: 'same-origin',
    }),
    cache: new InMemoryCache(),
  });

  if (!ApolloProxyClientsRecord[chainId]) {
    ApolloProxyClientsRecord[chainId] = {
      algebra_info: null as any,
      algebra_farming: null as any,
      bgt_market: null as any,
      lbp: null as any,
      wasabee_ido: null as any,
      limit_order: null as any,
    };
  }

  ApolloProxyClientsRecord[chainId][endpoint] = client;

  return client;
};

export function useProxiedSubgraphClient(
  endpoint: SubgraphEndpointType
): ApolloClient<any> {
  const chainId = useObserver(() => wallet.currentChainId);
  const client = useMemo(
    () => createProxiedClient(endpoint, chainId.toString()),
    [endpoint, chainId]
  );

  return client;
}

export function useSubgraphClient(
  endpoint: SubgraphEndpointType
): ApolloClient<any> {
  const chainId = useObserver(() => wallet.currentChainId);
  const client = useMemo(
    () => getSubgraphClientByChainId(chainId.toString(), endpoint),
    [chainId, endpoint]
  );

  return client;
}

export function getSubgraphClientByChainId(
  chainId: string,
  endpoint: SubgraphEndpointType
) {
  if (ApolloClientsRecord[chainId]?.[endpoint]) {
    return ApolloClientsRecord[chainId][endpoint];
  }
  const LBP_GRAPH = networksMap[chainId].subgraphAddresses[endpoint];
  const client = new ApolloClient({
    uri: LBP_GRAPH,
    ssrMode: true,
    queryDeduplication: false,
    cache: new InMemoryCache(),
    defaultOptions: {
      query: {
        errorPolicy: 'all',
      },
    },
  });

  if (!ApolloClientsRecord[chainId]) {
    ApolloClientsRecord[chainId] = {
      algebra_info: null as any,
      algebra_farming: null as any,
      bgt_market: null as any,
      lbp: null as any,
      wasabee_ido: null as any,
      limit_order: null as any,
    };
  }

  ApolloClientsRecord[chainId][endpoint] = client;
  return client;
}
