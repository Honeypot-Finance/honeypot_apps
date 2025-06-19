import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { TableAction } from './generic-table';
import {
  formatDistanceToNow,
  format,
  differenceInSeconds,
  differenceInDays,
  formatDuration,
  intervalToDuration,
} from 'date-fns';
import { useWriteContract } from 'wagmi';
import { AllInOneVaultABI } from '@/lib/abis';

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
    cell: ({ row }) => <span>{row.getValue('weight')}</span>,
  },
  {
    accessorKey: 'rewards',
    header: 'Estimated Rewards',
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue('rewards')}</span>
    ),
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
            const hash = await claimReceipt({
              address: `0x20F4b92054F745c19ea3f3053B77372e73332945`,
              abi: AllInOneVaultABI,
              functionName: 'claim',
              args: [BigInt(data.id)],
            });
            console.log('Claim transaction hash:', hash);
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
    enableSorting: false,
  },
];
