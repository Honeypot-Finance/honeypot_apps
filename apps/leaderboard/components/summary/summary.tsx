import { ALL_IN_ONE_VAULT } from '@/config/algebra/addresses';
import { TOTAL_WEIGHT } from '@/lib/algebra/graphql/queries/total-weight';
import {
  useQuery as useApolloQuery,
  ApolloClient,
  InMemoryCache,
} from '@apollo/client';
import { Card } from '@nextui-org/react';
import { memo, useMemo } from 'react';
import { erc20Abi } from 'viem';
import { useReadContract } from 'wagmi';

interface SummaryData {
  weightPerToken: string | number;
  balance: string | number;
  receiptWeight: string | number;
  estimatedRewards: string | number;
}

interface SummaryCardProps {
  data?: SummaryData;
  className?: string;
  currentToken?: string;
  weightPerCurrentToken?: string;
  isLoading?: boolean;
}

const DEFAULT_DATA: SummaryData = {
  weightPerToken: '-',
  balance: '-',
  receiptWeight: '-',
  estimatedRewards: '-',
};

const SummaryCard = memo(function SummaryCard({
  data = DEFAULT_DATA,
  className = '',
  isLoading = false,
}: SummaryCardProps) {
  const formatValue = useMemo(
    () => (value: string | number | bigint) => {
      if (isLoading) return '...';
      if (typeof value === 'number') {
        return value.toLocaleString('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 6,
        });
      }
      if (typeof value === 'bigint') {
        return Number(value).toLocaleString('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 6,
        });
      }
      return value || '-';
    },
    [isLoading]
  );

  const totalWeightClient = useMemo(
    () =>
      new ApolloClient({
        uri: 'https://api.ghostlogs.xyz/gg/pub/948b257a-20a9-442f-b38f-70fec580a732',
        cache: new InMemoryCache(),
        defaultOptions: {
          query: {
            errorPolicy: 'all',
          },
        },
      }),
    []
  );

  // estimated reward = (receipt.receiptWeight * poolReward) / totalWeight
  const {
    data: totalWeight,
    loading: totalWeightLoading,
    error: totalWeightError,
  } = useApolloQuery(TOTAL_WEIGHT, {
    client: totalWeightClient,
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });
  const { data: poolReward } = useReadContract({
    address: `0xbaadcc2962417c01af99fb2b7c75706b9bd6babe`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: ALL_IN_ONE_VAULT ? [ALL_IN_ONE_VAULT as `0x${string}`] : undefined,
  });
  const totalWeightItems = totalWeight?.globals?.items[0].totalWeight || {};
  const estimatedRewards =
    poolReward && data.receiptWeight && totalWeightItems
      ? Number((BigInt(data.receiptWeight) * poolReward) / totalWeightItems)
      : 0;

  const summaryItems = useMemo(
    () => [
      {
        label: 'Weight/Token',
        value: data.weightPerToken,
        key: 'weightPerToken',
      },
      {
        label: 'Balance',
        value: data.balance,
        key: 'balance',
      },
      {
        label: 'Receipt-weight',
        value: data.receiptWeight,
        key: 'receiptWeight',
      },
      {
        label: 'Estimated Rewards',
        value: estimatedRewards,
        key: 'estimatedRewards',
      },
    ],
    [data, estimatedRewards]
  );

  return (
    <Card
      className={`border-2 border-dashed border-black bg-white/90 mb-6 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all duration-200 ${className}`}
    >
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          {summaryItems.map((item) => (
            <div key={item.key} className="space-y-2">
              <div className="text-sm font-medium text-neutral-950 mb-1 font-theader">
                {item.label}
              </div>
              <div
                className={`text-lg font-semibold text-gray-900 ${
                  isLoading ? 'animate-pulse bg-gray-200 rounded h-6' : ''
                }`}
                aria-label={`${item.label}: ${formatValue(item.value)}`}
              >
                {!isLoading && formatValue(item.value)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
});

export default SummaryCard;
