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
        
        console.log(`Client-side pools data fetched in ${endTime - startTime}ms for chain ${currentChainId}`);
        console.log(`Received ${data.pools?.length || 0} pools from chain ${data.chainId}`);
        
        setProcessedPools(data.pools || []);
      } catch (err) {
        console.error('Failed to fetch pools data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch pools data');
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
    <div className="max-w-[1200px] mx-auto px-4 xl:px-0 font-gliker w-full mt-5">
      {/* TODO: Add pool bg img */}
      <Tabs
        selectedKey={currentTab}
        onSelectionChange={(key) =>
          setCurrentTab(key as 'aquabera' | 'algebra')
        }
        classNames={{
          tab: 'px-2 sm:px-3 sm:h-10 text-xs sm:text-sm',
          base: 'relative w-full',
          cursor: 'bg-[#202020] !text-white/80 px-2 py-3',
          tabList:
            'flex rounded-[16px] border border-[#333333] bg-[#271A0C] shadow-[4px_4px_0px_0px_#202020,-4px_4px_0px_0px_#202020] p-2 sm:p-3 absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 max-w-[90%] sm:max-w-none',
          panel: cn(
            'flex flex-col h-full w-full gap-y-4 items-center bg-[#140D06] rounded-2xl text-white',
            'px-4 sm:px-8 pt-[70px] pb-[70px]',
            // "bg-[url('/images/card-container/honey/honey-border.png'),url('/images/card-container/dark/bottom-border.svg')]",
            'bg-[position:-65px_top,_-85px_bottom]',
            'bg-[size:auto_65px,_auto_65px]',
            'bg-repeat-x',
            '!mt-0',
            'h-auto'
          ),
          tabContent: 'text-[#202020] text-sm sm:text-base',
        }}
        aria-label="Pool options"
      >
        <Tab
          key="aquabera"
          title={<span className="text-xs sm:text-base">Concentrated Liquidity</span>}
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
  );
});

export default PoolsPage;
