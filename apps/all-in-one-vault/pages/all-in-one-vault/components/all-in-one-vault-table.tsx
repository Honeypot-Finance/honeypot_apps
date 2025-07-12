import GenericTanstackTable from '@/components/Table/generic-table';
import { columns, ReceiptTableData } from '@/components/Table/table.config';
import { useClaimReceipt } from '@/hooks/useClaimReceipt';
import React, { useEffect, useMemo, useState } from 'react';
import {
  handleCooldownComplete,
  updateClaimedReceipt,
} from '../../../utils/helper-function';
import {
  ApolloClient,
  InMemoryCache,
  useQuery as useApolloQuery,
} from '@apollo/client';
import { RECEIPTS_LIST } from '@/lib/algebra/graphql/queries/receipts-list';
import { TOTAL_WEIGHT } from '@/lib/algebra/graphql/queries/total-weight';
import { ALL_IN_ONE_VAULT } from '@/config/algebra/addresses';
import { useAccount, useReadContract } from 'wagmi';
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
  const [refreshKey, setRefreshKey] = useState(0);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
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

  const { claimingReceiptId, isConfirmed } = useClaimReceipt();

  const {
    data: totalWeightData,
    // loading: totalWeightLoading,
    // error: totalWeightError,
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

  const {
    data: receiptsData,
    loading: receiptsLoading,
    error: receiptsError,
    refetch: refetchReceipts,
    networkStatus,
  } = useApolloQuery(RECEIPTS_LIST, {
    client: allInOneVaultClient,
    variables: { user: address || '' },
    skip: !address,
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });
  const listReceipts = receiptsData?.receipts?.items || [];
  const totalWeightItems = totalWeightData?.globals?.items[0]?.totalWeight;

  // Manual refresh handler
  const handleManualRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      console.log('🔄 Manual refresh triggered');
      const result = await refetchReceipts();
      console.log('📊 Refetch data:', result.data);
    } catch (error) {
      console.error('❌ Manual refresh failed:', error);
    } finally {
      setIsManualRefreshing(false);
    }
  };

  // Track previous receipt count to detect new data
  const [previousReceiptCount, setPreviousReceiptCount] = useState(0);

  useEffect(() => {
    if (onRefetchExpose) {
      console.log('🔗 Exposing refetch function to parent component');
      onRefetchExpose(() => {
        console.log('🔄 Refetch called from parent');
        return refetchReceipts();
      });
    }
  }, [onRefetchExpose, refetchReceipts]);

  useEffect(() => {
    if (listReceipts) {
      const transformedData = transformReceiptData(
        listReceipts,
        totalWeightItems ? String(totalWeightItems) : undefined,
        poolReward ? String(poolReward) : undefined
      );
      setCurrentTableData(transformedData);

      // Only refetch if we have new receipts (count increased)
      if (
        listReceipts.length > previousReceiptCount &&
        previousReceiptCount > 0
      ) {
        console.log('🔄 New receipts detected, refetching data...');
        refetchReceipts();
      }

      setPreviousReceiptCount(listReceipts.length);
    }
  }, [
    receiptsData,
    refreshKey,
    refetchReceipts,
    listReceipts.length,
    previousReceiptCount,
    totalWeightItems,
    poolReward,
    listReceipts,
  ]);

  // Handle successful query completion and auto-refetch for new data
  useEffect(() => {
    if (
      !receiptsLoading &&
      !receiptsError &&
      receiptsData &&
      networkStatus === 7
    ) {
      // NetworkStatus 7 means query completed successfully
      console.log('✅ Query completed successfully, checking for updates...');
      // Set a timeout to refetch after a short delay to check for new data
      const timeout = setTimeout(() => {
        if (listReceipts.length > 0) {
          refetchReceipts();
        }
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [
    receiptsData,
    receiptsLoading,
    receiptsError,
    networkStatus,
    refetchReceipts,
    listReceipts.length,
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (listReceipts) {
        setRefreshKey((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [listReceipts, receiptsData]);

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

  useEffect(() => {
    if (isConfirmed && claimingReceiptId) {
      updateClaimedReceipt(claimingReceiptId, setCurrentTableData);
      refetchReceipts();
    }
  }, [isConfirmed, claimingReceiptId, refetchReceipts]);

  if (receiptsError) {
    console.error('Error loading receipts:', receiptsError);
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
            onClick={() => refetchReceipts()}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (receiptsLoading && !receiptsData) {
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
