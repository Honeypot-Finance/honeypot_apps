import { createCache, kv } from '@/lib/kv';
import { publicProcedure, router } from '../trpc';
import requestIp from 'request-ip';
import { TRPCError } from '@trpc/server';
import dayjs from 'dayjs';
import { LRUCache } from 'lru-cache';
import { createPublicClientByChain } from '@/lib/client';
import BigNumber from 'bignumber.js';
import {
  createWalletClient,
  defineChain,
  http,
  parseGwei,
  nonceManager,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { defichainEvm, mainnet } from 'viem/chains';
import { z } from 'zod';

const ethPublicClient = createPublicClientByChain({
  ...mainnet,
  rpcUrls: {
    default: {
      http: [
        'https://cloudflare-eth.com',
        'https://eth.llamarpc.com',
        'https://rpc.ankr.com/eth',
        'https://eth-pokt.nodies.app',
        'ttps://eth-mainnet.public.blastapi.io',
      ],
    },
  },
});
// const account = privateKeyToAccount(
//   process.env.FAUCET_PRIVATE_KEY! as `0x${string}`,
//   {
//     nonceManager,
//   }
// );

// const walletClient = createWalletClient({
//   account,
//   chain: berachainBartioTestnet,
//   transport: http(),
// });

const ipCache = createCache('ip');
const requestStatus = {} as Record<string, boolean>;
const interval = 1000 * 60 * 60 * 24;
const faucetAmount = 0.05;

export const tokenRouter = router({
  queryNativeFaucet: publicProcedure
    .input(
      z.object({
        address: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { req } = ctx;
      // const ip = requestIp.getClientIp(req);
      const cachedValue = await ipCache.get<{
        claimableUntil: number;
      }>(input.address);
      if (!cachedValue) {
        return {
          claimable: true,
        };
      } else {
        return {
          claimable: false,
          claimableUntil: cachedValue.claimableUntil,
        };
      }
    }),
  // applyNativeFaucet: publicProcedure
  //   .input(
  //     z.object({
  //       address: z.string(),
  //     })
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     const { req } = ctx;
  //     const ip = requestIp.getClientIp(req);
  //     const address = input.address as `0x${string}`;

  //     if (!ip) {
  //       throw new TRPCError({
  //         code: "BAD_REQUEST",
  //         message: "Invalid IP",
  //       });
  //     }
  //     if (requestStatus[JSON.stringify(ip!)] === true) {
  //       throw new TRPCError({
  //         code: "BAD_REQUEST",
  //         message: "Please wait for the last request to finish",
  //       });
  //     }
  //     requestStatus[JSON.stringify(ip!)] = true;
  //     const [ipCacheValue, addressCacheValue] = await Promise.all([
  //       ipCache.get<{
  //         claimableUntil: number;
  //       }>(JSON.stringify(ip!)),
  //       ipCache.get<{
  //         claimableUntil: number;
  //       }>(address),
  //     ]);
  //     if (ipCacheValue?.claimableUntil) {
  //       requestStatus[JSON.stringify(ip!)] = false;
  //       throw new TRPCError({
  //         code: "BAD_REQUEST",
  //         message: `Your IP can claim after ${new Date(
  //           ipCacheValue.claimableUntil
  //         ).toLocaleString()}`,
  //       });
  //     } else if (addressCacheValue?.claimableUntil) {
  //       requestStatus[JSON.stringify(ip!)] = false;
  //       throw new TRPCError({
  //         code: "BAD_REQUEST",
  //         message: `Your address can claim after ${new Date(
  //           addressCacheValue.claimableUntil
  //         ).toLocaleString()}`,
  //       });
  //     } else {
  //       const ethBalance = await ethPublicClient.getBalance({
  //         address: address as `0x${string}`,
  //       });
  //       console.log("ethBalance", ethBalance.toString());
  //       if (new BigNumber(ethBalance.toString()).lt(0.01 * 10 ** 18)) {
  //         requestStatus[JSON.stringify(ip!)] = false;
  //         throw new TRPCError({
  //           code: "BAD_REQUEST",
  //           message:
  //             "Please make sure your account has at least 0.01ETH to claim",
  //         });
  //       }
  //       let sendRes: any;
  //       let hash = "";
  //       try {
  //         hash = await walletClient.sendTransaction({
  //           to: address as `0x${string}`,
  //           value: BigInt(faucetAmount * 10 ** 18),
  //         });
  //         console.log("hash", hash);
  //         sendRes = await beraPublicClient.waitForTransactionReceipt({
  //           hash: hash as `0x${string}`,
  //         });
  //         console.log("sendRes", sendRes);
  //       } catch (error) {
  //         console.error(error);
  //         requestStatus[JSON.stringify(ip!)] = false;
  //         throw new TRPCError({
  //           code: "BAD_REQUEST",
  //           message: "Claimed failed, Please try again later",
  //         });
  //       }
  //       if (sendRes.status === "success") {
  //         await Promise.all([
  //           ipCache.set(
  //             JSON.stringify(ip!),
  //             {
  //               claimableUntil: Date.now() + interval,
  //             },
  //             {
  //               px: interval,
  //             }
  //           ),
  //           ipCache.set(
  //             address,
  //             {
  //               claimableUntil: Date.now() + interval,
  //             },
  //             {
  //               px: interval,
  //             }
  //           ),
  //         ]);
  //       } else {
  //         requestStatus[JSON.stringify(ip!)] = false;
  //         throw new TRPCError({
  //           code: "BAD_REQUEST",
  //           message: "Claimed failed, Please try again later",
  //         });
  //       }

  //       requestStatus[JSON.stringify(ip!)] = false;
  //       return {
  //         hash,
  //       };
  //     }
  //   }),
});
