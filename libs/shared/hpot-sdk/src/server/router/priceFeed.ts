import { TokenPriceDataFeed } from './../../lib/priceFeed/tokenPriceDataFeed';
import { publicProcedure, router } from '../trpc';
import z from 'zod';
import { DefinedPriceFeed } from './../../lib/priceFeed/PriceFeedProviders/';
import {
  ChartDataResponse,
  TokenCurrentPriceResponseType,
} from './../../lib/priceFeed/priceFeedTypes';

const definedApiKey = process.env['DEFINED_API_KEY'] || '';
console.log('🔑 Defined API Key configured:', definedApiKey ? 'Yes' : 'No (will fail!)');
const priceFeed = new TokenPriceDataFeed(new DefinedPriceFeed(definedApiKey), true); // Enable debug mode

export const priceFeedRouter = router({
  getSingleTokenPrice: publicProcedure
    .input(
      z.object({
        chainId: z.string(),
        tokenAddress: z.string(),
      })
    )
    .query(
      async ({
        input,
      }): Promise<ApiResponseType<TokenCurrentPriceResponseType>> => {
        const res = await priceFeed.getTokenCurrentPrice(
          input.tokenAddress,
          input.chainId
        );

        if (res.status === 'error') {
          return {
            status: 'error',
            message: res.message,
          };
        } else {
          return {
            status: 'success',
            data: res.data,
            message: 'Success',
          };
        }
      }
    ),
  getMultipleTokenPrice: publicProcedure
    .input(
      z.object({
        chainId: z.string(),
        tokenAddresses: z.array(z.string()),
      })
    )
    .query(
      async ({
        input,
      }): Promise<ApiResponseType<TokenCurrentPriceResponseType[]>> => {
        const res = await priceFeed.getMultipleTokenCurrentPrice(
          input.tokenAddresses,
          input.chainId
        );

        if (res.status === 'error') {
          return {
            status: 'error',
            message: 'Error fetching token prices',
          };
        } else {
          return {
            status: 'success',
            data: res.data,
            message: 'Success',
          };
        }
      }
    ),
  getChartData: publicProcedure
    .input(
      z.object({
        chainId: z.string(),
        tokenAddress: z.string(),
        from: z.number(),
        to: z.number(),
        resolution: z.union([
          z.literal('1'),
          z.literal('5'),
          z.literal('15'),
          z.literal('30'),
          z.literal('60'),
          z.literal('240'),
          z.literal('720'),
          z.literal('1D'),
          z.literal('7D'),
        ]),
        tokenNumber: z.number().optional(),
        currencyCode: z.enum(['USD', 'TOKEN']).optional(),
      })
    )
    .output(z.any())
    .query(async ({ input }): Promise<ApiResponseType<ChartDataResponse>> => {
      const ttl = () => {
        if (input.resolution === '1D') return '1d';
        if (input.resolution === '7D') return '7d';
        if (input.resolution === '720') return '1h';
        if (input.resolution === '240') return '1h';
        if (input.resolution === '60') return '1h';
        return 5 * 1000;
      };
      const res = await priceFeed.getChartData({
        address: input.tokenAddress,
        networkId: input.chainId,
        from: input.from,
        to: input.to,
        resolution: input.resolution,
        tokenNumber: input.tokenNumber,
        currencyCode: input.currencyCode,
      });

      if (res.status === 'error') {
        return {
          status: 'error',
          message: res.message,
        };
      } else {
        return {
          status: 'success',
          data: res.data,
          message: 'Success',
        };
      }
    }),
  getTokenHistoricalPrice: publicProcedure
    .input(
      z.object({
        chainId: z.string(),
        tokenAddress: z.string(),
        from: z.number(),
        to: z.number(),
      })
    )
    .query(
      async ({
        input,
      }): Promise<ApiResponseType<TokenCurrentPriceResponseType[]>> => {
        const res = await priceFeed.getTokenHistoricalPrice(
          input.tokenAddress,
          input.chainId,
          input.from,
          input.to
        );

        if (res.status === 'error') {
          return {
            status: 'error',
            message: res.message,
          };
        } else {
          return {
            status: 'success',
            data: res.data,
            message: 'Success',
          };
        }
      }
    ),
});
