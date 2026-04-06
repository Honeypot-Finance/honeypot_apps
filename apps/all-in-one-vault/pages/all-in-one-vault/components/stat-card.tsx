import React, { useMemo } from 'react';
import { Card, Tooltip } from '@nextui-org/react';
import { useReadContract } from 'wagmi';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import {
  ALL_IN_ONE_VAULT_PROXY,
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
import { useOnChainReceipts } from '@/hooks/useOnChainReceipts';

export default function StatCard() {
  const { totalWeight: totalWeightItems } = useOnChainReceipts();

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

  const { data: lbgtBalanceData } = useReadContract({
    address: ESTIMATED_REWARDS,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: ALL_IN_ONE_VAULT_PROXY
      ? [ALL_IN_ONE_VAULT_PROXY as `0x${string}`]
      : undefined,
  });

  // LBGT Lifetime
  const { data: totalClaimedData } = useApolloQuery(TOTAL_CLAIMED, {
    client: statsClient,
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });
  const lbgtLifetime = totalClaimedData?.globals?.items[0]?.totalClaimed || 0;

  // decimals
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
          ? formatNumber(((lbgtLifetime / Math.pow(10, decimals)) * 4) / 9)
          : '0.0',
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
                {stat.label === 'LBGT Lifetime' && (
                  <Tooltip
                    content={
                      <div className="text-center max-w-xs">
                        <div className="text-xs">
                          Berapaw take a 50% fee from all LBGT mint from this
                          vault while returning 40% bribeback to this vault to
                          strengthen the bribe power. The actual fee is 10% of
                          all BGT or 20% of the delivered BGT. The delivered BGT
                          is half the emission to this vault.
                        </div>
                      </div>
                    }
                    placement="top"
                    closeDelay={100}
                    classNames={{
                      base: 'z-50',
                      content:
                        'bg-black text-white px-3 py-2 rounded text-xs max-w-xs',
                    }}
                  >
                    <div className="inline-flex">
                      <AiOutlineQuestionCircle className="text-gray-500 hover:text-gray-700 cursor-help text-base" />
                    </div>
                  </Tooltip>
                )}
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
