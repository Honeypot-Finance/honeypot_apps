import { ftoRouter } from './router/fto';
import { discussionRouter } from './router/discussion';
import { publicProcedure, router, t } from './trpc';
import { tokenRouter } from './router/token';
import { aiLaunchProjectRouter } from './router/AILaunchProject';
import { lbpRouter } from './router/lbp';

export const appRouter = router({
  projects: ftoRouter,
  discussionRouter: discussionRouter,
  token: tokenRouter,
  aiLaunchProject: aiLaunchProjectRouter,
  lbp: lbpRouter,
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
