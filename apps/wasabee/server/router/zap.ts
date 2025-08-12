import {
  authProcedure,
  publicProcedure,
  rateLimitMiddleware,
  router,
} from '../trpc';
import z from 'zod';
import { discussionService } from '../service/discussion';
import {
  Address,
  createWalletClient,
  http,
  isAddress,
  maxUint256,
  parseEther,
  publicActions,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { berachainTestnetbArtio } from 'viem/chains';
import { chainsMap } from '@honeypot/shared/config/chains/chainBaseConfig';
import { ADDRESS_ZERO } from '@cryptoalgebra/sdk';

if (!process.env.OOGABOOGA_ZAP_PRIVATE_KEY)
  throw new Error('PRIVATE_KEY is required');
if (!process.env.OOGABOOGA_ZAP_PUBLIC_API_URL)
  throw new Error('PUBLIC_API_URL is required');
if (!process.env.OOGABOOGA_ZAP_API_KEY) throw new Error('API_KEY is required');

const OOGABOOGA_ZAP_PRIVATE_KEY = process.env
  .OOGABOOGA_ZAP_PRIVATE_KEY as Address;
const OOGABOOGA_ZAP_PUBLIC_API_URL = process.env.OOGABOOGA_ZAP_PUBLIC_API_URL;
const OOGABOOGA_ZAP_API_KEY = process.env.OOGABOOGA_ZAP_API_KEY;

const privateAccount = privateKeyToAccount(OOGABOOGA_ZAP_PRIVATE_KEY);
const client = createWalletClient({
  chain: berachainTestnetbArtio,
  transport: http(),
  account: privateAccount,
}).extend(publicActions);

export const zapRouter = router({
  zapSwap: publicProcedure
    .input(
      z.object({
        from: z
          .string()
          .refine((value) => isAddress(value), { message: 'Invalid address' }),
        to: z
          .string()
          .refine((value) => isAddress(value), { message: 'Invalid address' }),
        amount: z.string(), // in real amount instead of bigint
        slippage: z.number().optional(),
        chainId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const { from, to, amount, slippage, chainId } = input;
      const swapParams = {
        tokenIn: from, // Address of the token swapping from (HONEY)
        tokenOut: to, // Address of the token swapping to (BERA)
        amount: parseEther(amount), // Amount of tokenIn to swap
        to: privateAccount.address, // Address to send tokenOut to (optional and defaults to `from`)
        slippage: 0.01, // Range from 0 to 1 to allow for price slippage
      };
      const headers = {
        Authorization: `Bearer ${OOGABOOGA_ZAP_API_KEY}`,
      };

      const getAllowance = async (token: Address, from: Address) => {
        // Native token does not require approvals for allowance
        if (token === ADDRESS_ZERO) return maxUint256;

        const publicApiUrl = new URL(
          `${OOGABOOGA_ZAP_PUBLIC_API_URL}/v1/approve/allowance`
        );
        publicApiUrl.searchParams.set('token', token);
        publicApiUrl.searchParams.set('from', from);

        const res = await fetch(publicApiUrl, {
          headers,
        });
        const json = await res.json();
        return json.allowance;
      };
    }),
});
