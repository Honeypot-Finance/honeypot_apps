import { DEFAULT_CHAIN_ID } from '@/config/algebra/default-chain-id';
import { networksMap } from '@honeypot/shared/config/chains/network';
import type { NextApiResponse, NextApiRequest, PageConfig } from 'next';

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const INFO_GRAPH =
    networksMap[DEFAULT_CHAIN_ID].subgraphAddresses.algebra_info;

  try {
    //   const chainId = request.query.chain;
    //   if (!chainId) {
    //     return response.status(400).json({
    //       s: 'error',
    //       errmsg: 'chainId is required',
    //     });
    //   }
    if (!INFO_GRAPH) {
      return response.status(400).json({
        s: 'error',
        errmsg: 'INFO_GRAPH is not defined',
      });
    }

    return response.redirect(INFO_GRAPH);

    // if (request.method === 'GET') {
    //   console.log('INFO_GRAPH', INFO_GRAPH);
    //   return response.redirect(INFO_GRAPH);
    // } else if (request.method === 'POST') {
    //   const result = await infoClient.query({
    //     query: request.body.query,
    //     variables: request.body.variables,
    //   });

    //   return response.status(200).json(result);
    // }
  } catch (error) {
    console.error('GraphQL proxy error:', error);
    return response.status(500).json({
      s: 'error',
      errmsg: 'Failed to fetch data from GraphQL endpoint',
    });
  }
}
