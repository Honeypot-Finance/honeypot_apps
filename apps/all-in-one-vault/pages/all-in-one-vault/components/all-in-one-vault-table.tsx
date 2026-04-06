import GenericTanstackTable from '@/components/Table/generic-table';
import { columns, ReceiptTableData } from '@/components/Table/table.config';
import { useClaimReceipt } from '@/hooks/useClaimReceipt';
import { useOnChainReceipts } from '@/hooks/useOnChainReceipts';
import React, { useEffect, useState } from 'react';
import {
  handleCooldownComplete,
} from '../../../utils/helper-function';
import { ALL_IN_ONE_VAULT } from '@/config/algebra/addresses';
import { useReadContract } from 'wagmi';
import { erc20Abi } from 'viem';
import { LoadingDisplay } from '@/components/loading-display/loading-display';
import ErrorIcon from '@/components/svg/ErrorIcon';
import { transformReceiptData } from '../../../utils/helper';

interface AllInOneVaultTableProps {
  onRefetchExpose?: (refetchFn: () => void) => void;
}

export default function AllInOneVaultTable({
  onRefetchExpose,
}: AllInOneVaultTableProps = {}) {
  const [currentTableData, setCurrentTableData] = useState<ReceiptTableData[]>(
    []
  );
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const { claimingReceiptId, isConfirmed } = useClaimReceipt();

  const {
    receipts,
    totalWeight,
    isLoading,
    isError,
    error,
    refetch,
  } = useOnChainReceipts();

  const { data: poolReward } = useReadContract({
    address: `0xbaadcc2962417c01af99fb2b7c75706b9bd6babe`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: ALL_IN_ONE_VAULT ? [ALL_IN_ONE_VAULT as `0x${string}`] : undefined,
  });

  // Manual refresh handler
  const handleManualRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      await refetch();
    } catch (err) {
      console.error('Manual refresh failed:', err);
    } finally {
      setIsManualRefreshing(false);
    }
  };

  useEffect(() => {
    if (onRefetchExpose) {
      onRefetchExpose(() => refetch());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onRefetchExpose]);

  // Transform on-chain receipts into table data
  useEffect(() => {
    if (receipts) {
      const transformedData = transformReceiptData(
        receipts,
        totalWeight,
        poolReward ? String(poolReward) : undefined
      );
      setCurrentTableData(transformedData);
    }
  }, [receipts, totalWeight, poolReward]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 10000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle cooldown completion events
  useEffect(() => {
    const cooldownHandler = (event: CustomEvent) =>
      handleCooldownComplete(event, setCurrentTableData);
    window.addEventListener(
      'cooldown-complete',
      cooldownHandler as EventListener
    );
    return () =>
      window.removeEventListener(
        'cooldown-complete',
        cooldownHandler as EventListener
      );
  }, []);

  // Refetch after claim confirmation
  useEffect(() => {
    if (isConfirmed && claimingReceiptId) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirmed, claimingReceiptId]);

  if (isError) {
    console.error('Error loading receipts:', error);
    return (
      <div className="mb-6 w-full shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] bg-white rounded-xl p-6">
        <div className="flex flex-col items-center justify-center py-8">
          <ErrorIcon />
          <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">
            Failed to load receipts
          </h3>
          <p className="text-gray-600 text-center mb-4">
            There was an error loading your receipt data. Please try again.
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isLoading && receipts.length === 0) {
    return (
      <div className="mb-6 w-full shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] bg-white rounded-xl p-6">
        <div className="flex flex-col items-center justify-center py-8">
          <LoadingDisplay size={100} text="Loading receipts..." />
        </div>
      </div>
    );
  }

  return (
    <GenericTanstackTable
      data={currentTableData}
      columns={columns}
      className="mb-6 w-full shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)]"
      enableSorting={true}
      enableFiltering={true}
      enablePagination={true}
      searchPlaceholder="Search receipts..."
      onRefresh={handleManualRefresh}
      isRefreshing={isManualRefreshing}
    />
  );
}
