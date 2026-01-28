import { infoClient } from ".";
import {
  LiquidatorDataDocument,
  LiquidatorDataQuery,
  LiquidatorDataQueryVariables,
} from "../generated/graphql";

export interface UserPoolProfit {
  account: string;
  pool: {
    address: string;
    poolDaysData: any[];
    poolHoursData: any[];
  };
  depositedUsd: number;
  collectedFeesUSD: number;
  totalValueUSD: number;
  profit: number;
}
[];

export const getLiquidatorDatas = async (
  account: string
): Promise<UserPoolProfit[]> => {
  const liquidatorDataQuery = await infoClient.query<
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
      pool: { totalValueLockedUSD, feesUSD },
    } = liquidatorDatas[i];
    const [account, poolAddress] = id.split("#");
    const depositedUsd = Number(totalLiquidityUsd);
    const collectedFeesUSD = Number(feesUSD);
    const totalValueUSD = Number(totalValueLockedUSD);
    const profit = (depositedUsd / totalValueUSD) * collectedFeesUSD;

    const pool = {
      address: poolAddress,
      poolDaysData: [] as any[],
      poolHoursData: [] as any[],
    };

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
