import { cn } from '@/lib/utils';
import { observer } from 'mobx-react-lite';
import { wallet } from '@honeypot/shared/lib/wallet';
import { Tab, Tabs } from '@nextui-org/react';
import { NextLayoutPage } from '@/types/nextjs';
import { type ProcessedPool } from '@/lib/cache/pools-cache';
import { useEffect, useState } from 'react';
import PoolsList from '@/components/algebra/pools/PoolsList';
import AquaberaList from '@/components/Aquabera/VaultLists/VaultLists';
import { useVaultDataPrefetch } from '@/hooks/useVaultDataPrefetch';
import { useChainId } from 'wagmi';

const PoolsPage: NextLayoutPage = observer(() => {
  const [currentTab, setCurrentTab] = useState<'aquabera' | 'algebra'>(
    'aquabera'
  );
  const [processedPools, setProcessedPools] = useState<ProcessedPool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Prefetch vault data immediately when page loads
  const vaultData = useVaultDataPrefetch();
  const chainId = useChainId();
  // Fetch pools data on client side based on current chain
  useEffect(() => {
    const fetchPoolsData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get the current chain ID from wallet
        const currentChainId = chainId;
        console.log(`Fetching pools data from client for chain ${chainId}...`);
        const startTime = Date.now();

        // Pass chain ID as query parameter
        const response = await fetch(`/api/pools/cached?chainId=${chainId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch pools data: ${response.statusText}`);
        }

        const data = await response.json();
        const endTime = Date.now();

        console.log(
          `Client-side pools data fetched in ${
            endTime - startTime
          }ms for chain ${currentChainId}`
        );
        console.log(
          `Received ${data.pools?.length || 0} pools from chain ${data.chainId}`
        );

        setProcessedPools(data.pools || []);
      } catch (err) {
        console.error('Failed to fetch pools data:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to fetch pools data'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPoolsData();
  }, [chainId]); // Re-fetch when chain changes

  if (!wallet.currentChain.supportDEX) {
    return (
      <div className="w-full flex items-center justify-center pb-6 sm:pb-12 overflow-x-hidden">
        <div className="text-center">
          <p className="text-lg">DEX is not supported on this chain</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full flex items-center justify-center pb-6 sm:pb-12 overflow-x-hidden">
        <div className="text-center">
          <p className="text-lg text-red-500">Error loading pools: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center pb-6 sm:pb-12 pt-8">
      <div className="w-full xl:mx-auto xl:max-w-[1200px] 2xl:max-w-[1500px] px-2 sm:px-4 md:px-8 xl:px-0  min-h-[100vh]">
        {/* TODO: Add pool bg img */}
        <Tabs
          selectedKey={currentTab}
          onSelectionChange={(key) =>
            setCurrentTab(key as 'aquabera' | 'algebra')
          }
          classNames={{
            tab: 'flex-1 h-12 text-base font-medium data-[selected=true]:text-white data-[selected=false]:text-gray-400',
            base: 'relative w-full',
            cursor: 'bg-[#6B4423] rounded-lg w-full',
            tabList: 'flex gap-0 rounded-none bg-[#1B1308] mb-6 w-full',
            panel: cn('w-full bg-transparent rounded-2xl p-0 ', '!mt-0'),
            tabContent: 'text-inherit',
          }}
          aria-label="Pool options"
        >
          <Tab
            key="aquabera"
            title={
              <span className="text-xs sm:text-base">
                Concentrated Liquidity
              </span>
            }
          >
            <PoolsList
              initialProcessedPools={processedPools}
              isClientLoading={isLoading}
            />
          </Tab>
          <Tab
            key="algebra"
            title={
              <span className="text-xs sm:text-base">Automated Vaults</span>
            }
          >
            <AquaberaList prefetchedData={vaultData} />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
});

export default PoolsPage;
