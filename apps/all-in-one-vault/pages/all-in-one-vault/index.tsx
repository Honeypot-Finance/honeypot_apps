import CardContainer from '@/components/card-contianer/v3';
import StatCard from './components/stat-card';
import SelectionSection from './components/selection-section';
import AllInOneVaultTable from './components/all-in-one-vault-table';
import { useState, useCallback } from 'react';

export default function AllInOneVault() {
  const [refetchReceiptsFn, setRefetchReceiptsFn] = useState<(() => void) | null>(null);

  const handleRefetchReceipts = useCallback(() => {
    if (refetchReceiptsFn && typeof refetchReceiptsFn === 'function') {
      refetchReceiptsFn();
    } else {
      console.warn('Refetch function not available yet');
    }
  }, [refetchReceiptsFn]);

  return (
    <div className="w-full flex flex-col justify-center items-center px-4 font-gliker">
      <CardContainer className="xl:max-w-[1200px]">
        <StatCard />
        <AllInOneVaultTable onRefetchExpose={setRefetchReceiptsFn} />
        <SelectionSection onRefetchReceipts={handleRefetchReceipts} />
      </CardContainer>
    </div>
  );
}
