import {
  ALL_IN_ONE_VAULT,
  ALL_IN_ONE_VAULT_PROXY,
  BURN_TO_VAULT,
  ESTIMATED_REWARDS,
} from '@/config/algebra/addresses';
import { TOTAL_WEIGHT } from '@/lib/algebra/graphql/queries/total-weight';
import {
  formatRewards,
  formatSmallScientific,
} from '../../utils/helper-function';
// import { TOTAL_WEIGHT } from '@/lib/algebra/graphql/queries/total-weight';
import { useQueryClient } from '@tanstack/react-query';
import { Card } from '@nextui-org/react';
import { memo, useMemo } from 'react';
import { erc20Abi } from 'viem';
import { useAccount, useReadContract } from 'wagmi';
import { Token } from '@honeypot/shared';
import { wallet } from '@honeypot/shared/lib/wallet';
import { TokenLogo } from '@honeypot/shared';

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
  receiptWeight: '0',
  estimatedRewards: '-',
};

const SummaryCard = memo(function SummaryCard({
  data = DEFAULT_DATA,
  className = '',
  isLoading = false,
}: SummaryCardProps) {
  // Helper function to get LBGT token instance
  const getLBGTTokenInstance = () => {
    return Token.getToken({
      address: ESTIMATED_REWARDS,
      chainId: wallet.currentChainId.toString(),
    });
  };

  // Get LBGT token instance
  const lbgtToken = getLBGTTokenInstance();
  const formatValue = useMemo(
    () => (value: string | number | bigint) => {
      if (isLoading) return '...';
      if (typeof value === 'number') {
        return value.toLocaleString('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 4,
        });
      }
      if (typeof value === 'bigint') {
        return Number(value).toLocaleString('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 4,
        });
      }
      return value || '-';
    },
    [isLoading]
  );

  // estimated reward = (receipt.receiptWeight * poolReward) / totalWeight
  const { address } = useAccount();
  // Read totalWeightData from Tanstack Query cache (written by StatCard)
  const queryClient = useQueryClient();
  const totalWeightData = queryClient.getQueryData(['totalWeightData']) as any;
  console.log('📊 totalWeightData', totalWeightData);
  const totalWeight = totalWeightData;

  // const { data: reward } = useReadContract({
  //   address: `0x938f83738ccd5b4217862fa4b521b015f3355eb4`,
  //   abi: rewardAbi,
  //   functionName: 'previewLbgtMint',
  //   args: address && REWARD_VAULT ? [address, REWARD_VAULT] : undefined,
  // });

  // decimals
  const { data: decimals } = useReadContract({
    address: ESTIMATED_REWARDS,
    abi: erc20Abi,
    functionName: `decimals`,
  });

  // LBGT Balance
  const { data: lbgtBalanceData } = useReadContract({
    address: ESTIMATED_REWARDS,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: ALL_IN_ONE_VAULT_PROXY
      ? [ALL_IN_ONE_VAULT_PROXY as `0x${string}`]
      : undefined,
  });
  const totalWeightItems =
    totalWeight &&
    totalWeight.globals &&
    totalWeight.globals.items &&
    totalWeight.globals.items[0]
      ? totalWeight.globals.items[0].totalWeight
      : undefined;
  // estimated reward = (receipt.receiptWeight * poolReward) / totalWeight
  console.log(
    '📊 estimate reward',
    'receiptWeight:',
    Number(data.receiptWeight),
    'lbgtBalanceData:',
    Number(lbgtBalanceData),
    'totalWeightItems:',
    totalWeightItems,
    'decimals:',
    decimals
  );
  const formatNumber = (
    value: number | string,
    minFraction?: number,
    maxFraction?: number
  ) => {
    if (isNaN(Number(value))) return '0';
    return Number(value).toLocaleString('en-US', {
      minimumFractionDigits: minFraction ?? 0,
      maximumFractionDigits: maxFraction ?? 0,
    });
  };
  const formatReceiptWeight = (value: string | number) => {
    const numValue = Number(value);
    if (isNaN(numValue) || numValue === 0) return '0';
    if (numValue < 0.01) return '<0.01';
    return numValue.toFixed(2);
  };

  const formatBalance = (value: string | number) => {
    const numValue = Number(value);
    if (isNaN(numValue) || numValue === 0) return '0';
    if (numValue < 0.01) return '<0.01';
    return numValue.toFixed(2);
  };

  const summaryItems = useMemo(
    () => [
      {
        label: 'Weight/Token',
        value: formatNumber(data.weightPerToken, 0, 5),
        key: 'weightPerToken',
      },
      {
        label: 'Balance',
        value: formatBalance(data.balance),
        key: 'balance',
      },
      {
        label: 'Receipt-weight',
        value: formatReceiptWeight(data.receiptWeight),
        key: 'receiptWeight',
      },
      {
        label: 'Estimated Rewards',
        value:
          data.receiptWeight !== undefined &&
          lbgtBalanceData !== undefined &&
          totalWeightItems !== undefined &&
          decimals !== undefined
            ? (() => {
                const receiptWeight = Number(data.receiptWeight);
                const poolReward = Number(lbgtBalanceData);
                const totalWeight = Number(totalWeightItems);

                if (
                  receiptWeight === 0 ||
                  poolReward === 0 ||
                  totalWeight === 0
                ) {
                  return '0';
                }

                // receiptWeight is in display units (weightPerToken already /1e4 * amount)
                // Convert back to raw units to match totalWeight scale
                const receiptWeightRaw = receiptWeight * 1e4;
                // Account for the new deposit increasing totalWeight
                const adjustedTotalWeight = totalWeight + receiptWeightRaw;
                const estimatedWei = (receiptWeightRaw * poolReward) / adjustedTotalWeight;
                const estimated = estimatedWei / Math.pow(10, decimals);

                console.log('Calculation:', {
                  receiptWeight,
                  poolReward,
                  totalWeight,
                  estimatedWei,
                  estimated,
                  decimals,
                });

                return formatSmallScientific(estimated);
              })()
            : '-',
        key: 'estimatedRewards',
      },
    ],
    [data, lbgtBalanceData, totalWeightItems, decimals]
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
                aria-label={`${item.label}: ${item.value ?? '-'}`}
              >
                {!isLoading && (
                  <div className="flex items-center justify-center gap-2">
                    {item.key === 'estimatedRewards' && lbgtToken && (
                      <div>
                        <TokenLogo
                          token={lbgtToken}
                          size={20}
                          disableTooltip={false}
                        />
                      </div>
                    )}
                    <span>
                      {item.key === 'balance' || item.key === 'receiptWeight'
                        ? item.value
                        : formatValue(item.value ?? '-')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
});

export default SummaryCard;
