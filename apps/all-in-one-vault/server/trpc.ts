// Re-export everything from the shared library's TRPC setup
export {
  getUser,
  createContext,
  t,
  router,
  publicProcedure,
  authProcedure,
  rateLimitMiddleware,
} from '@honeypot/shared/server/trpc';
