import { pg } from './../../lib/db/db';

type SubgraphMetaData = {
  id: string;
  total_account: number;
};

export const subgraphMetaDataService = {
  getSubgraphMetaData: async () => {
    const result = await pg<SubgraphMetaData[]>`SELECT * FROM subgraph_meta_data`;
    return result;
  },
  
  getSubgraphMetaDataByChain: async (chainId: string) => {
    const result = await pg<SubgraphMetaData[]>`SELECT * FROM subgraph_meta_data WHERE id = ${chainId}`;
    return result[0] || null;
  },
  
  getTotalUsersAcrossChains: async () => {
    const result = await pg<{ total: number }[]>`SELECT SUM(total_account) as total FROM subgraph_meta_data`;
    return result[0]?.total || 0;
  },
};