import { cn } from '@/lib/utils';
import { observer } from 'mobx-react-lite';
import { wallet } from '@honeypot/shared/lib/wallet';
import { Tab, Tabs } from '@nextui-org/react';
import { NextLayoutPage } from '@/types/nextjs';
import type { GetServerSideProps } from 'next';
import { getSubgraphClientByChainId } from '@honeypot/shared';
import { DEFAULT_CHAIN_ID } from '@/config/algebra/default-chain-id';
import {
  PoolsListDocument,
  ActiveFarmingsDocument,
  type PoolsListQuery,
  type ActiveFarmingsQuery,
} from '@/lib/algebra/graphql/generated/graphql';
import { useEffect, useState } from 'react';
import PoolsList from '@/components/algebra/pools/PoolsList';
import AquaberaList from '@/components/Aquabera/VaultLists/VaultLists';
import { useVaultDataPrefetch } from '@/hooks/useVaultDataPrefetch';

type PoolsPageProps = {
  initialPools?: PoolsListQuery['pools'];
  initialActiveFarmings?: ActiveFarmingsQuery['eternalFarmings'];
};

const PoolsPage: NextLayoutPage = observer(({
  initialPools = [],
  initialActiveFarmings = [],
}: PoolsPageProps) => {
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

  if (typeof window !== 'undefined' && wallet.currentChain?.supportDEX === false) {
    return (
      <div className="w-full flex items-center justify-center pb-6 sm:pb-12 overflow-x-hidden">
        <div className="text-center">
          <p className="text-lg">DEX is not supported on this chain</p>
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
           <PoolsList initialPools={initialPools} initialActiveFarmings={initialActiveFarmings} />
        
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

export const getServerSideProps: GetServerSideProps<PoolsPageProps> = async (
  ctx
) => {
  try {
    const chainId = DEFAULT_CHAIN_ID.toString();
    const infoClient = getSubgraphClientByChainId(chainId, 'algebra_info');
    const farmingClient = getSubgraphClientByChainId(chainId, 'algebra_farming');

    const [poolsRes, farmingsRes] = await Promise.all([
      infoClient.query({
        query: PoolsListDocument,
        variables: { search: '' },
        fetchPolicy: 'no-cache',
      }),
      farmingClient.query({
        query: ActiveFarmingsDocument,
        fetchPolicy: 'no-cache',
      }),
    ]);

    return {
      props: {
        initialPools: poolsRes.data?.pools ?? [],
        initialActiveFarmings: farmingsRes.data?.eternalFarmings ?? [],
      },
    };
  } catch (e) {
    console.error('SSR pools fetch failed', e);
    return { props: { initialPools: [], initialActiveFarmings: [] } };
  }
};
