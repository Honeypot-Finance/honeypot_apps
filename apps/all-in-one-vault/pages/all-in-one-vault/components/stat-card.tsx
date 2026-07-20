import React from 'react';
import { Card } from '@nextui-org/react';
import { useReadContract } from 'wagmi';
import {
  ALL_IN_ONE_VAULT_PROXY,
  ESTIMATED_REWARDS,
} from '@/config/algebra/addresses';
import { erc20Abi } from 'viem';
import { formatNumber } from '../../../utils/helper-function';
import { useOnChainReceipts } from '@/hooks/useOnChainReceipts';

export default function StatCard() {
  const { totalWeight: totalWeightItems } = useOnChainReceipts();

  const { data: rewardBalanceData } = useReadContract({
    address: ESTIMATED_REWARDS,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: ALL_IN_ONE_VAULT_PROXY
      ? [ALL_IN_ONE_VAULT_PROXY as `0x${string}`]
      : undefined,
  });

  const { data: decimals } = useReadContract({
    address: ESTIMATED_REWARDS,
    abi: erc20Abi,
    functionName: `decimals`,
  });

  const statsData = [
    {
      label: 'Current Total Weight',
      value:
        totalWeightItems !== undefined
          ? formatNumber(Number(totalWeightItems) / 1e4)
          : '0.0',
    },
    {
      label: 'WBERA Balance',
      value:
        rewardBalanceData !== undefined && decimals !== undefined
          ? formatNumber(Number(rewardBalanceData) / Math.pow(10, decimals))
          : '0.0',
    },
    {
      label: 'WBERA Lifetime',
      // TODO: Restore when a reliable data source replaces the stalled ghostlogs subgraph
      value: '-',
    },
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
              <div className="text-sm text-gray-600 mb-1 font-theader flex items-center justify-center gap-1">
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
