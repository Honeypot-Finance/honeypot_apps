import { ftoRouter } from './router/fto';
import { priceFeedRouter } from './router/priceFeed';
import { discussionRouter } from './router/discussion';
import { publicProcedure, router, t } from './trpc';
import { tokenRouter } from './router/token';
import { metadataRouter } from './router/metadata';
import { aiLaunchProjectRouter } from './router/AILaunchProject';
import { lbpRouter } from './router/lbp';
import { subgraphMetaDataRouter } from './router/subgraphMetaData';
export const appRouter = router({
  projects: ftoRouter,
  priceFeed: priceFeedRouter,
  discussionRouter: discussionRouter,
  token: tokenRouter,
  metadata: metadataRouter,
  aiLaunchProject: aiLaunchProjectRouter,
  lbp: lbpRouter,
  subgraphMetaData: subgraphMetaDataRouter,
});

// Export only the type of a router!
// This prevents us from importing server code on the client.
export type AppRouter = typeof appRouter;

const createCaller = t.createCallerFactory(appRouter);
export const caller = createCaller({
  user: null,
  //@ts-ignore
  req: null,
});
