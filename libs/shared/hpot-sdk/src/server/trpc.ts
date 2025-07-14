import { TRPCError, initTRPC } from '@trpc/server';
import superjson from 'superjson';
import type {
  CreateNextContextOptions,
  NextApiRequest,
} from '@trpc/server/adapters/next';
import { SiweMessage } from 'siwe';
import { userService } from './service/user';
import requestIp from 'request-ip';
import { createCache } from '../lib/kv/kv';

const ipCache = createCache('ip-limit');

export const getUser = async (req: NextApiRequest) => {
  if (req.headers['message'] && req.headers['signature']) {
    const message = Buffer.from(
      req.headers['message'] as string,
      'base64'
    ).toString('utf-8');
    const signature = Buffer.from(
      req.headers['signature'] as string,
      'base64'
    ).toString('utf-8');
    try {
      const siweMessage = new SiweMessage(message);

      const res = await siweMessage.verify({ signature });
      const address = res.data.address.toLowerCase();
      const user = await userService.getUser({
        provider: address,
      });
      return user;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
};

export const createContext = async ({ req, res }: CreateNextContextOptions) => {
  const user = await getUser(req);
  // Set appropriate timeout for serverless functions
  req.socket.setTimeout(25000); // 25 seconds (less than Vercel's 30s limit)

  // Add connection cleanup on request end
  req.on('close', () => {
    console.log('Request closed, cleaning up resources...');
  });

  return {
    user,
    req,
    res,
  };
};
// You can use any variable name you like.
// We use t to keep things simple.
export const t = initTRPC.context<typeof createContext>().meta<{}>().create({
  transformer: superjson,
});
export const router = t.router;
export const publicProcedure = t.procedure;

export const authProcedure = publicProcedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx,
  });
});

export const rateLimitMiddleware =
  ({ limit, duration }: { limit?: number; duration?: number } = {}) =>
  async ({ ctx, next }: any) => {
    const { req, res } = ctx;
    const ip = JSON.stringify(requestIp.getClientIp(req));
    limit = limit || 60;
    duration = duration || 1000 * 60;
    let cache = await ipCache.get<{
      usage: number;
      expires: number;
    }>(ip);

    if (cache?.expires && cache.expires < Date.now()) {
      console.log('cache expired');
      console.log('cache', cache);
      const emptyCache = {
        usage: 0,
        expires: Date.now() + duration,
      };
      await ipCache.set(ip, emptyCache);
      cache = emptyCache;
    }

    const currentUsage = (cache?.usage || 0) + 1;
    const isRateLimited = currentUsage > limit;
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader(
      'X-RateLimit-Remaining',
      isRateLimited ? 0 : limit - currentUsage
    );

    // console.log("currentUsage", currentUsage, "limit", limit);

    if (currentUsage > limit) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Rate limit exceeded',
      });
    } else {
      const expires = cache?.expires ? cache.expires : Date.now() + duration;
      await ipCache.set(
        ip,
        {
          usage: currentUsage,
          expires,
        },
        { px: expires }
      );
    }
    return next({
      ctx,
    });
  };
