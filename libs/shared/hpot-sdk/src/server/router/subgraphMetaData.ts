import { publicProcedure, router } from '../trpc';
import z from 'zod';
import { subgraphMetaDataService } from '../service/subgraphMetaData';

export const subgraphMetaDataRouter = router({
  getSubgraphMetaData: publicProcedure
    .query(async () => {
      return subgraphMetaDataService.getSubgraphMetaData();
    }),
    
  getSubgraphMetaDataByChain: publicProcedure
    .input(
      z.object({
        chainId: z.string(),
      })
    )
    .query(async ({ input }) => {
      return subgraphMetaDataService.getSubgraphMetaDataByChain(input.chainId);
    }),
    
  getTotalUsersAcrossChains: publicProcedure
    .query(async () => {
      return subgraphMetaDataService.getTotalUsersAcrossChains();
    }),
});