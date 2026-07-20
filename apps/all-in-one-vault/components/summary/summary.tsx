import {
  ALL_IN_ONE_VAULT_PROXY,
  ESTIMATED_REWARDS,
} from '@/config/algebra/addresses';
import {
  formatSmallScientific,
} from '../../utils/helper-function';
import { Card } from '@nextui-org/react';
import { memo, useMemo } from 'react';
import { erc20Abi } from 'viem';
import { useReadContract } from 'wagmi';
import { Token } from '@honeypot/shared';
import { wallet } from '@honeypot/shared/lib/wallet';
import { TokenLogo } from '@honeypot/shared';
import { useOnChainReceipts } from '@/hooks/useOnChainReceipts';

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
  // Helper function to get the reward token (WBERA) instance
  const getRewardTokenInstance = () => {
    return Token.getToken({
      address: ESTIMATED_REWARDS,
      chainId: wallet.currentChainId.toString(),
    });
  };

  // Get reward token instance
  const rewardToken = getRewardTokenInstance();
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
  const { totalWeight: onChainTotalWeight } = useOnChainReceipts();

  // decimals
  const { data: decimals } = useReadContract({
    address: ESTIMATED_REWARDS,
    abi: erc20Abi,
    functionName: `decimals`,
  });

  // Reward token (WBERA) balance held by the vault
  const { data: rewardBalanceData } = useReadContract({
    address: ESTIMATED_REWARDS,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: ALL_IN_ONE_VAULT_PROXY
      ? [ALL_IN_ONE_VAULT_PROXY as `0x${string}`]
      : undefined,
  });
  const totalWeightItems = onChainTotalWeight;
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
          rewardBalanceData !== undefined &&
          totalWeightItems !== undefined &&
          decimals !== undefined
            ? (() => {
                const receiptWeight = Number(data.receiptWeight);
                const poolReward = Number(rewardBalanceData);
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

                return formatSmallScientific(estimated);
              })()
            : '-',
        key: 'estimatedRewards',
      },
    ],
    [data, rewardBalanceData, totalWeightItems, decimals]
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
                    {item.key === 'estimatedRewards' && rewardToken && (
                      <div>
                        <TokenLogo
                          token={rewardToken}
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
