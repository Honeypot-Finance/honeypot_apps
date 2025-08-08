import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './../../server/_app';
import superjson from 'superjson';
import { createTRPCReact } from '@trpc/react-query';

export function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // For browser requests, always use the current origin
    // This ensures we use the correct port in development
    const origin = window.location.origin;
    console.log('[tRPC] Using origin for API calls:', origin);
    return origin;
  }

  if (process.env['VERCEL_URL'])
    // reference for vercel.com
    return `https://${process.env['VERCEL_URL']}`;

  if (process.env['RENDER_INTERNAL_HOSTNAME'])
    // reference for render.com
    return `http://${process.env['RENDER_INTERNAL_HOSTNAME']}:${process.env['PORT']}`;

  // assume localhost
  return `http://localhost:${process.env['PORT'] ?? 3000}`;
}

// export const trpc = createTRPCNext<AppRouter>({
//   config(opts: any) {
//     return {
//       links: [
//         httpBatchLink({
//           /**
//            * If you want to use SSR, you need to use the server's full URL
//            * @link https://trpc.io/docs/v11/ssr
//            **/
//           url: `${getBaseUrl()}/api/trpc`,

//           // You can pass any HTTP headers you wish here
//           async headers() {
//             return {
//               // authorization: getAuthCookie(),
//             };
//           },
//         }),
//       ],
//     };
//   },
//   /**
//    * @link https://trpc.io/docs/v11/ssr
//    **/
//   ssr: false,
// });

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      transformer: superjson,
      // fetch: async (input, init) => {
      //   const res = await fetch(input,init)
      //   if (res.ok === false && res.status === 400) {
      //     const cloned = res.clone()
      //     const data = await cloned.json()
      //     toast.error(data[0]?.error.message)
      //   }

      //   return res
      // },
      url: `${getBaseUrl()}/api/trpc`,
      async headers() {
        const headers = {} as Record<string, string>;
        if (
          typeof window !== 'undefined' &&
          localStorage.getItem('message') &&
          localStorage.getItem('signature')
        ) {
          headers['message'] = localStorage.getItem('message') as string;
          headers['signature'] = localStorage.getItem('signature') as string;
        }
        return headers;
      },
    }),
  ],
});

export const trpc = createTRPCReact<AppRouter>();
export const trpcQueryClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      // You can pass any HTTP headers you wish here
      transformer: superjson,
      async headers() {
        const headers = {} as Record<string, string>;
        if (
          typeof window !== 'undefined' &&
          localStorage.getItem('message') &&
          localStorage.getItem('signature')
        ) {
          headers['message'] = localStorage.getItem('message') as string;
          headers['signature'] = localStorage.getItem('signature') as string;
        }
        return headers;
      },
    }),
  ],
});
