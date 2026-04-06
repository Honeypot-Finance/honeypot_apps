import CardContainer from '@/components/card-contianer/v3';
import SelectionSection from './components/selection-section';
import AllInOneVaultTable from './components/all-in-one-vault-table';
import { useState, useCallback, useEffect } from 'react';
import { useChainId } from 'wagmi';
import { useBerachainGuard } from '@/hooks/useBerachainGuard';
import StatCard from './components/stat-card';
import { OnChainReceiptsProvider } from '@/hooks/useOnChainReceipts';

export default function AllInOneVault() {
  const [refetchReceiptsFn, setRefetchReceiptsFn] = useState<
    (() => void) | null
  >(null);
  const [mounted, setMounted] = useState(false);

  const chainId = useChainId();
  const {
    isOnBerachain,
    showNetworkChangeDialog,
    onDialogClose,
    onConfirmNetworkChange,
  } = useBerachainGuard();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRefetchReceipts = useCallback(() => {
    if (refetchReceiptsFn && typeof refetchReceiptsFn === 'function') {
      refetchReceiptsFn();
    } else {
      console.warn('Refetch function not available yet');
    }
  }, [refetchReceiptsFn]);

  // Prevent hydration mismatch by only rendering after client-side mount
  if (!mounted) {
    return null;
  }

  // Check if the current chain is Berachain
  if (!isOnBerachain) {
    return (
      <div className="w-full flex flex-col justify-center items-center px-4 font-gliker">
        <div className="xl:max-w-[1200px] w-full">
          <CardContainer>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  The current All-in-one-vault is only support Berachain, so
                  that you need to change to Berachain again to continue
                </p>
              </div>
            </div>
          </CardContainer>
        </div>
      </div>
    );
  }

  return (
    <>
      <OnChainReceiptsProvider>
        <div className="w-full flex flex-col justify-center items-center px-4 font-gliker">
          <CardContainer className="xl:max-w-[1200px]">
            <StatCard />
            <AllInOneVaultTable onRefetchExpose={setRefetchReceiptsFn} />
            <SelectionSection onRefetchReceipts={handleRefetchReceipts} />
          </CardContainer>
        </div>
      </OnChainReceiptsProvider>
    </>
  );
}
