import { cn } from '@/lib/utils';
import { observer } from 'mobx-react-lite';
import { wallet } from '@honeypot/shared/lib/wallet';
import { Tab, Tabs } from '@nextui-org/react';
import { NextLayoutPage } from '@/types/nextjs';
import { useEffect, useState } from 'react';
import PoolsList from '@/components/algebra/pools/PoolsList';
import AquaberaList from '@/components/Aquabera/VaultLists/VaultLists';
import { useVaultDataPrefetch } from '@/hooks/useVaultDataPrefetch';

const PoolsPage: NextLayoutPage = observer(() => {
  const [currentTab, setCurrentTab] = useState<'aquabera' | 'algebra'>(
    'aquabera'
  );
  const [shouldPrefetch, setShouldPrefetch] = useState(false);

  // Prefetch vault data immediately when page loads
  const vaultData = useVaultDataPrefetch();

  // Start prefetching the tab after a delay to prioritize current tab loading
  useEffect(() => {
    const prefetchTimer = setTimeout(() => {
      setShouldPrefetch(true);
    }, 100); 

    return () => clearTimeout(prefetchTimer);
  }, []);

  if (!wallet.currentChain.supportDEX) {
    return (
      <div className="w-full flex items-center justify-center pb-6 sm:pb-12 overflow-x-hidden">
        <div className="text-center">
          <p className="text-lg">DEX is not supported on this chain</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center pb-6 sm:pb-12 pt-8">
      <div className="w-full xl:mx-auto xl:max-w-[1200px] 2xl:max-w-[1500px] px-2 sm:px-4 md:px-8 xl:px-0">
        <Tabs
          selectedKey={currentTab}
          onSelectionChange={(key) =>
            setCurrentTab(key as 'aquabera' | 'algebra')
          }
          classNames={{
            tab: 'flex-1 h-12 text-base font-medium data-[selected=true]:text-white data-[selected=false]:text-gray-400',
            base: 'relative w-full',
            cursor: 'bg-[#6B4423] rounded-lg w-full',
            tabList:
              'flex gap-0 rounded-none bg-transparent border-b-2 border-[#2a2318] mb-6 w-full',
            panel: cn(
              'w-full bg-[#140D06] rounded-2xl border border-[#2a2318] p-0',
              '!mt-0'
            ),
            tabContent: 'text-inherit',
          }}
          aria-label="Pool options"
        >
          <Tab
            key="algebra"
            title="Concentrated Liquidity"
          >
            <PoolsList />
          </Tab>
          <Tab
            key="aquabera"
            title="Automated Vaults"
          >
            <AquaberaList prefetchedData={vaultData} />
          </Tab>
        </Tabs>

        {/* Prefetch the pools tab component in background after initial load */}
        {shouldPrefetch && (
          <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', visibility: 'hidden', pointerEvents: 'none' }}>
             <PoolsList />
          </div>
        )}
      </div>
    </div>
  );
});

export default PoolsPage;
