import { trpcClient } from '@honeypot/shared';

export interface ChainUserData {
  id: string;
  total_account: number;
}

export function useTotalUsersFromDB() {
  const fetchTotalUsers = async () => {
    try {
      const totalUsers = await trpcClient.subgraphMetaData.getTotalUsersAcrossChains.query();
      return totalUsers;
    } catch (error) {
      console.error('Error fetching total users from DB:', error);
      return 0;
    }
  };

  const fetchChainBreakdown = async (): Promise<ChainUserData[]> => {
    try {
      const chainData = await trpcClient.subgraphMetaData.getSubgraphMetaData.query();
      return chainData;
    } catch (error) {
      console.error('Error fetching chain breakdown from DB:', error);
      return [];
    }
  };

  return { fetchTotalUsers, fetchChainBreakdown };
}