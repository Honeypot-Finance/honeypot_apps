import React, { useMemo, useCallback } from 'react';
import { Card } from '@nextui-org/react';
import { useAccount, useReadContract } from 'wagmi';
import { RECEIPTS_LIST } from '@/lib/algebra/graphql/queries/receipts-list';
import { TOTAL_WEIGHT } from '@/lib/algebra/graphql/queries/total-weight';
import {
  ALL_IN_ONE_VAULT,
  ALL_IN_ONE_VAULT_PROXY,
  BURN_TO_VAULT,
  ESTIMATED_REWARDS,
} from '@/config/algebra/addresses';
import { erc20Abi } from 'viem';
import {
  ApolloClient,
  InMemoryCache,
  useQuery as useApolloQuery,
} from '@apollo/client';
import { TOTAL_CLAIMED } from '@/lib/algebra/graphql/queries/total-claimed';
import { formatNumber } from '../../../utils/helper-function';
export default function StatCard() {
  const { address } = useAccount();
  const allInOneVaultClient = useMemo(
    () =>
      new ApolloClient({
        uri: 'https://api.ghostlogs.xyz/gg/pub/5018d16a-abf4-432d-b8a9-760dc08bcb8d',
        cache: new InMemoryCache(),
        defaultOptions: {
          query: {
            errorPolicy: 'all',
          },
        },
      }),
    []
  );

  const statsClient = useMemo(
    () =>
      new ApolloClient({
        uri: 'https://api.ghostlogs.xyz/gg/pub/4d9fda23-4a22-4b3a-9c0f-37077d3edf84',
        cache: new InMemoryCache(),
        defaultOptions: {
          query: {
            errorPolicy: 'all',
          },
        },
      }),
    []
  );

  // Total Weight
  const {
    data: totalWeightData,
    // loading: totalWeightLoading,
    // error: totalWeightError,
  } = useApolloQuery(TOTAL_WEIGHT, {
    client: statsClient,
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });
  const totalWeightItems = totalWeightData?.globals?.items[0]?.totalWeight;

  // LBGT Balance
  const { data: lbgtBalanceData } = useReadContract({
    address: ESTIMATED_REWARDS,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: ALL_IN_ONE_VAULT_PROXY ? [ALL_IN_ONE_VAULT_PROXY as `0x${string}`] : undefined,
  });

  // LBGT Lifetime
  const { data: totalClaimedData } = useApolloQuery(TOTAL_CLAIMED, {
    client: statsClient,
    skip: !address,
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });
  const lbgtLifetime = totalClaimedData?.globals?.items[0]?.totalClaimed || 0;

  const { data: poolReward } = useReadContract({
    address: `0xbaadcc2962417c01af99fb2b7c75706b9bd6babe`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: ALL_IN_ONE_VAULT ? [ALL_IN_ONE_VAULT as `0x${string}`] : undefined,
  });

  // decimals
  const { data: decimals } = useReadContract({
    address: ESTIMATED_REWARDS,
    abi: erc20Abi,
    functionName: `decimals`,
  });

  // estimated rewards
  const { data: estimatedRewards } = useReadContract({
    address: ESTIMATED_REWARDS,
    abi: erc20Abi,
    functionName: `balanceOf`,
    args: BURN_TO_VAULT ? [BURN_TO_VAULT as `0x${string}`] : undefined,
  });

  const { data: receiptsData } = useApolloQuery(RECEIPTS_LIST, {
    client: allInOneVaultClient,
    variables: { user: address || '' },
    skip: !address,
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });

  const listReceipts = receiptsData?.receipts?.items || [];

  // Calculate estimated rewards for each receipt
  const calculateEstimatedRewards = useCallback(
    (receiptWeight: string): number => {
      if (!receiptWeight || !totalWeightItems || !poolReward) return 0;

      if (
        receiptWeight === '-' ||
        receiptWeight === '0' ||
        String(receiptWeight) === '0'
      )
        return 0;

      try {
        const receiptWeightStr = String(receiptWeight);
        if (!/^\d+(\.\d+)?$/.test(receiptWeightStr)) {
          return 0;
        }

        const receiptWeightBigInt = BigInt(
          Math.floor(parseFloat(receiptWeightStr))
        );
        const totalWeightBigInt = BigInt(totalWeightItems);
        const poolRewardBigInt = BigInt(poolReward);

        if (totalWeightBigInt === BigInt(0)) {
          return 0;
        }

        return Number(
          (receiptWeightBigInt * poolRewardBigInt) / totalWeightBigInt
        );
      } catch (error) {
        console.error('Error calculating estimated rewards:', error);
        return 0;
      }
    },
    [totalWeightItems, poolReward]
  );

  // Calculate totals
  const { totalBalance, totalLifetime, totalWeight } = useMemo(() => {
    let balance = 0;
    let lifetime = 0;
    let weight = 0;

    listReceipts.forEach((receipt: any) => {
      const estimatedRewards = calculateEstimatedRewards(receipt.receiptWeight);
      balance += estimatedRewards;
      weight += parseFloat(receipt.receiptWeight || '0');

      // Add to lifetime if receipt is claimed
      if (receipt.isClaimed) {
        lifetime += estimatedRewards;
      }
    });

    return {
      totalBalance: balance,
      totalLifetime: lifetime,
      totalWeight: weight,
    };
  }, [listReceipts, totalWeightItems, poolReward, calculateEstimatedRewards]);

  const formatRewards = (value: number) => {
    if (decimals === undefined) return '-';
    return (value / Math.pow(10, decimals)).toFixed(1);
  };

  const statsData = address
    ? [
        {
          label: 'Total Weight',
          value:
            totalWeightItems !== undefined
              ? formatNumber(totalWeightItems)
              : '0.0',
        },
        {
          label: 'LBGT Balance',
          value:
            lbgtBalanceData !== undefined && decimals !== undefined
              ? formatNumber(Number(lbgtBalanceData) / Math.pow(10, decimals))
              : '0.0',
        },
        {
          label: 'LBGT Lifetime',
          value:
            decimals !== undefined
              ? formatNumber(lbgtLifetime / Math.pow(10, decimals))
              : '0.0',
        },
      ]
    : [
        { label: 'Total Weight', value: '0.0' },
        { label: 'LBGT Balance', value: '0.0' },
        { label: 'LBGT Lifetime', value: '0.0' },
      ];

  return (
    <div className="flex flex-col justify-center w-full rounded-2xl gap-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {statsData.map((stat, index) => (
          <Card
            key={index}
            className="border-2 border-dashed border-black bg-white/90 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)]"
          >
            <div className="p-4 text-center">
              <div className="text-sm text-gray-600 mb-1 font-theader">
                {stat.label}
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {stat.value}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
