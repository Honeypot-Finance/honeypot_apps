import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { TableAction } from './generic-table';
import { intervalToDuration } from 'date-fns';
import { useReadContract, useWriteContract } from 'wagmi';
import { AllInOneVaultABI } from '@/lib/abis';
import {
  formatRewards,
  formatSmallScientific,
} from '../../utils/helper-function';
import {
  ALL_IN_ONE_VAULT_PROXY,
  ESTIMATED_REWARDS,
} from '@/config/algebra/addresses';
import { erc20Abi } from 'viem';
import {
  useQuery as useApolloQuery,
  ApolloClient,
  InMemoryCache,
} from '@apollo/client';
import { TOTAL_WEIGHT } from '@/lib/algebra/graphql/queries/total-weight';

export interface StakingData {
  id: string;
  cooldown: string;
  weight: number;
  rewards: string;
  action: TableAction;
  isCooldownActive?: boolean;
}

export interface ReceiptTableData {
  id: string;
  receiptId: string;
  cooldown: string;
  weight: string;
  rewards: string;
  claimableAt: string;
  isClaimed: boolean;
  isCooldownActive: boolean;
  action: {
    label: string;
    variant?: 'default' | 'outline' | 'secondary';
    isDisabled: boolean;
    className: string;
    style?: React.CSSProperties;
    onClick: () => void;
  };
}

const formatCooldownTime = (claimableAt: string): string => {
  const claimableAtTimestamp = parseInt(claimableAt);
  const now = Math.floor(Date.now() / 1000);

  if (now >= claimableAtTimestamp) {
    return '00:00:00';
  }

  const claimableDate = new Date(claimableAtTimestamp * 1000);
  const currentDate = new Date();
  const duration = intervalToDuration({
    start: currentDate,
    end: claimableDate,
  });

  const days = duration.days || 0;
  const hours = duration.hours || 0;
  const minutes = duration.minutes || 0;
  const seconds = duration.seconds || 0;

  if (days > 0) {
    return `${days.toString().padStart(2, '0')}:${hours
      .toString()
      .padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  } else {
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
};

export const columns: ColumnDef<ReceiptTableData>[] = [
  {
    accessorKey: 'receiptId',
    header: 'Receipt ID',
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue('receiptId')}</span>
    ),
    enableSorting: true,
    sortingFn: (rowA, rowB, columnId) => {
      const valueA = parseInt(rowA.getValue(columnId) as string, 10);
      const valueB = parseInt(rowB.getValue(columnId) as string, 10);
      return valueA - valueB;
    },
  },
  {
    accessorKey: 'cooldown',
    header: 'Cooldown time',
    cell: ({ row }) => {
      const data = row.original;
      const claimableAt = parseInt(data.claimableAt);
      const now = Math.floor(Date.now() / 1000);
      const isClaimable = now >= claimableAt;

      const formattedCooldown = formatCooldownTime(data.claimableAt);
      const isZero = formattedCooldown === '00:00:00';

      if (isZero) {
        return (
          <span className="text-green-500 font-medium">
            {formattedCooldown}
          </span>
        );
      }

      return (
        <span className="text-orange-500 font-medium">{formattedCooldown}</span>
      );
    },
  },
  {
    accessorKey: 'weight',
    header: 'Weight',
    cell: ({ row }) => {
      const weight = Number(row.getValue('weight'));
      return <span>{weight / 1e4}</span>;
    },
  },
  {
    accessorKey: 'rewards',
    header: 'Estimated Rewards',
    cell: ({ row }) => {
      const totalWeightClient = useMemo(
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
      const weight = Number(row.getValue('weight'));
      const { data: totalWeight } = useApolloQuery(TOTAL_WEIGHT, {
        client: totalWeightClient,
        errorPolicy: 'all',
        notifyOnNetworkStatusChange: true,
      });
      const { data: lbgtBalanceData } = useReadContract({
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
      const totalWeightItems = totalWeight?.globals?.items[0]?.totalWeight;

      let estimated: string | number | bigint = '-';
      if (
        weight !== undefined &&
        lbgtBalanceData !== undefined &&
        totalWeight !== undefined &&
        decimals !== undefined
      ) {
        const est =
          (Number(weight) * formatRewards(Number(lbgtBalanceData), decimals)) /
          Number(totalWeightItems);
        estimated = formatSmallScientific(est);
      }

      return (
        <span className="font-medium">
          {typeof estimated === 'number'
            ? estimated.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 4,
              })
            : typeof estimated === 'bigint'
            ? Number(estimated).toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 4,
              })
            : estimated || '-'}
        </span>
      );
    },
  },
  {
    accessorKey: 'action',
    header: 'Action',
    cell: ({ row }) => {
      const data = row.original;
      const claimableAt = parseInt(data.claimableAt);
      const now = Math.floor(Date.now() / 1000);
      const isClaimable = now >= claimableAt;
      const {
        data: hash,
        isPending,
        isError: isWriteError,
        error: writeError,
        writeContract: claimReceipt,
      } = useWriteContract();

      let actionConfig;

      if (!isClaimable) {
        actionConfig = {
          label: 'Cooldown',
          isDisabled: true,
          className:
            'bg-gray-400 text-gray-700 px-3 py-1 rounded-md cursor-not-allowed',
        };
      } else if (isClaimable && !data.isClaimed) {
        actionConfig = {
          label: 'Claim',
          isDisabled: false,
          className:
            'px-3 py-1 rounded-md text-black cursor-pointer hover:opacity-80 transition-opacity',
          style: { background: 'rgba(255, 169, 49, 1)' },
          onClick: async () => {
            const payload = {
              address: `0x20F4b92054F745c19ea3f3053B77372e73332945`,
              abi: AllInOneVaultABI,
              functionName: 'claim',
              args: [data.id],
            };
            console.log(payload);
            const hash = await claimReceipt({
              address: `0x9c52cD80455a9ee50610aC90e846e46E04014f6d`,
              abi: AllInOneVaultABI,
              functionName: 'claim',
              args: [BigInt(data.id)],
            });
            console.log(hash);
          },
        };
      } else {
        actionConfig = {
          label: 'Claimed',
          isDisabled: true,
          className: 'px-3 py-1 rounded-md text-gray-600 cursor-not-allowed',
          style: { background: 'rgba(204, 204, 204, 1)' },
        };
      }

      return (
        <button
          className={actionConfig.className}
          style={actionConfig.style}
          disabled={actionConfig.isDisabled}
          onClick={actionConfig.onClick}
        >
          {actionConfig.label}
        </button>
      );
    },
    enableSorting: true, // Enable sorting for this column
    sortingFn: (rowA, rowB, columnId) => {
      // Priority: Cooldown/Claim (0), Claimed (1)
      const getPriority = (label: string) => {
        if (label === 'Claimed') return 1;
        return 0; // Cooldown or Claim
      };
      const labelA = rowA.original.action.label;
      const labelB = rowB.original.action.label;
      const priorityA = getPriority(labelA);
      const priorityB = getPriority(labelB);

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // If same priority, sort by receiptId
      const receiptIdA = parseInt(rowA.original.receiptId, 10);
      const receiptIdB = parseInt(rowB.original.receiptId, 10);
      return receiptIdA - receiptIdB;
    },
  },
];
