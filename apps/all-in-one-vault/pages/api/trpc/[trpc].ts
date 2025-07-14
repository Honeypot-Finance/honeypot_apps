/**
 * This file contains tRPC's HTTP response handler
 */
import * as trpcNext from '@trpc/server/adapters/next';
import { appRouter } from '@/server/_app';
import { createContext } from '@/server/trpc';

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext,
  /**
   * @link https://trpc.io/docs/v11/context
   */
  /**
   * @link https://trpc.io/docs/v11/error-handling
   */
  onError({ error }) {
    if (error.code === 'INTERNAL_SERVER_ERROR') {
      // send to bug reporting
      console.error('Something went wrong', error);
    }
  },
  /**
   * @link https://trpc.io/docs/v11/caching#api-response-caching
   */
  // responseMeta() {
  //   // ...
  // },
});
