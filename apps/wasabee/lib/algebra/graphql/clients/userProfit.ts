import {
  LiquidatorDataDocument,
  LiquidatorDataQuery,
  LiquidatorDataQueryVariables,
  PoolDayData,
  PoolHourData,
} from '../generated/graphql';
import { useSubgraphClient } from '@honeypot/shared/hooks/useSubgraphClients';
import { ApolloClient } from '@apollo/client';
import { createClientHook } from '../clientUtils';

export interface UserPoolProfit {
  account: string;
  pool: {
    address: string;
    poolDaysData: PoolDayData[];
    poolHoursData: PoolHourData[];
  };
  depositedUsd: number;
  collectedFeesUSD: number;
  totalValueUSD: number;
  profit: number;
}
[];

export const getLiquidatorDatas = async (
  client: ApolloClient<any>,
  account: string
): Promise<UserPoolProfit[]> => {
  console.log('getLiquidatorDatas', account, client);
  const liquidatorDataQuery = await client.query<
    LiquidatorDataQuery,
    LiquidatorDataQueryVariables
  >({
    query: LiquidatorDataDocument,
    variables: {
      account: account.toLowerCase(),
    },
  });

  const liquidatorDatas = liquidatorDataQuery.data.liquidatorDatas;

  const userPoolsProfit = [];

  for (let i = 0; i < liquidatorDatas.length; i++) {
    const {
      id,
      totalLiquidityUsd,
      pool: { totalValueLockedUSD, feesUSD, poolDayData, poolHourData },
    } = liquidatorDatas[i];
    const [account, poolAddress] = id.split('#');
    const depositedUsd = Number(totalLiquidityUsd);
    const collectedFeesUSD = Number(feesUSD);
    const totalValueUSD = Number(totalValueLockedUSD);
    const profit = (depositedUsd / totalValueUSD) * collectedFeesUSD;

    const pool = {
      address: poolAddress,
      poolDaysData: [] as any[],
      poolHoursData: [] as any[],
    };

    for (let j = 0; j < poolHourData?.length; j++) {
      const prevId = j === 0 ? 0 : j - 1;
      const {
        feesUSD: fee,
        periodStartUnix: timestamp,
        txCount,
      } = poolHourData[j];
      const { feesUSD: prevFee } = poolHourData[prevId];
      const feesUSD = Number(fee);
      const date = timestamp;
      const change =
        Number(prevFee) === 0 ? 100 : ((fee - prevFee) / prevFee) * 100;

      pool.poolHoursData.push({
        feesUSD,
        date,
        txCount,
        change: `${change.toFixed(2)}%`,
      });
    }

    for (let j = 0; j < poolDayData.length; j++) {
      const prevId = j === 0 ? 0 : j - 1;
      const { feesUSD: fee, date: timestamp, txCount } = poolDayData[j];
      const { feesUSD: prevFee } = poolDayData[prevId];
      const feesUSD = Number(fee);
      const date = timestamp;
      const change =
        Number(prevFee) === 0 ? 100 : ((fee - prevFee) / prevFee) * 100;

      pool.poolDaysData.push({
        feesUSD,
        date,
        txCount,
        change: `${change.toFixed(2)}%`,
      });
    }

    userPoolsProfit.push({
      account,
      pool,
      depositedUsd,
      collectedFeesUSD,
      totalValueUSD,
      profit,
    });
  }

  return userPoolsProfit;
};
