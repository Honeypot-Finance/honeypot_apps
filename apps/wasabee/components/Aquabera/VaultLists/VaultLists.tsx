import {
  Link,
  Tab,
  Tabs,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button as NextUIButton,
} from '@nextui-org/react';
import MyAquaberaVaults from './MyVaults';
import AllAquaberaVaults from './AllVaults';
import { Search, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import aquabera from '@/public/images/partners/aquabera.svg';
import Image from 'next/image';
import { VaultDataPrefetchReturn } from '@/hooks/useVaultDataPrefetch';

interface AquaberaListProps {
  prefetchedData?: VaultDataPrefetchReturn;
}

export function AquaberaList({ prefetchedData }: AquaberaListProps) {
  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [sortField, setSortField] = useState('apr');
  const [dataLoaded, setDataLoaded] = useState(false);

  // Debug log
  console.log('🏗️ AquaberaList prefetchedData:', {
    hasAllVaults: !!prefetchedData?.allVaults,
    hasAllVaultContracts: !!prefetchedData?.allVaultContracts,
    hasProcessedVaults: !!prefetchedData?.processedVaults,
    processedVaultsLength: prefetchedData?.processedVaults?.length || 0,
    chainId: prefetchedData?.chainId,
    isLoading: prefetchedData?.isLoading
  });

  const sortOptions = [
    { key: 'apr', label: 'APR' },
    { key: 'tvl', label: 'TVL' },
    { key: 'volume', label: 'Volume' },
    { key: 'fees', label: 'Fees' },
    { key: 'pair', label: 'Token Pair' },
  ];

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleDataLoaded = () => {
    setDataLoaded(true);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 移动端布局 */}
      <div className="flex sm:hidden justify-between items-center w-full">
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(key.toString())}
          classNames={{
            tab: 'px-4 py-2 text-sm font-medium',
            base: '',
            tabList:
              'flex rounded-lg border border-[#2a2318] bg-[#1A0F06] p-1 gap-1',
            cursor:
              'bg-[#6B4423] rounded-md',
            panel: 'w-full',
            tabContent: 'text-white group-data-[selected=true]:text-white group-data-[selected=false]:text-gray-400',
          }}
        >
          <Tab key="all" title="Vaults" />
          <Tab key="my" title="My Vaults" />
        </Tabs>

        <Dropdown>
          <DropdownTrigger>
            <NextUIButton
              className="bg-[#1A0F06] border border-[#2a2318] rounded-lg px-3 py-1.5 text-xs text-white"
              endContent={<ChevronDown className="h-4 w-4 text-gray-400" />}
            >
              Sort by:{' '}
              {sortOptions.find((option) => option.key === sortField)?.label}
            </NextUIButton>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Sort options"
            className="bg-[#1A0F06] border border-[#2a2318] rounded-lg p-1"
            onAction={(key) => {
              setSortField(key.toString());
            }}
          >
            {sortOptions.map((option) => (
              <DropdownItem
                key={option.key}
                className={`text-white text-sm p-2 rounded ${sortField === option.key ? 'bg-[#6B4423]' : ''
                  }`}
              >
                {option.label}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>

      {/* PC端布局 */}
      <div className="hidden sm:flex sm:justify-between sm:items-center w-full">
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(key.toString())}
          classNames={{
            tab: 'px-4 py-2 text-sm font-medium min-w-[100px]',
            base: '',
            tabList:
              'flex rounded-lg border border-[#2a2318] bg-[#1A0F06] p-1 gap-1',
            cursor:
              'bg-[#6B4423] rounded-md',
            panel: 'w-full',
            tabContent: 'text-white group-data-[selected=true]:text-white group-data-[selected=false]:text-gray-400',
          }}
        >
          <Tab key="all" title="Vaults" />
          <Tab key="my" title="My Vaults" />
        </Tabs>

        <div className="relative w-[319px]">
          <input
            placeholder="Search"
            value={search}
            type="text"
            onChange={(event) => handleSearch(event.target.value)}
            className="border border-[#2a2318] bg-[#1A0F06] text-white pl-10 pr-4 py-2 h-12 w-full rounded-lg placeholder:text-gray-500 focus:outline-none focus:border-[#6B4423]"
          />
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            size={20}
          />
        </div>
      </div>

      {/* 移动端搜索框 */}
      <div className="sm:hidden relative w-full">
        <input
          placeholder="Search"
          value={search}
          type="text"
          onChange={(event) => handleSearch(event.target.value)}
          className="border border-[#2a2318] bg-[#1A0F06] text-white pl-10 pr-4 py-2 h-12 w-full rounded-lg placeholder:text-gray-500 focus:outline-none focus:border-[#6B4423]"
        />
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          size={20}
        />
      </div>

      <div className="w-full">
        {selectedTab === 'all' ? (
          <AllAquaberaVaults
            searchString={search}
            sortBy={sortField}
            key={`all-${sortField}-${search}`}
            onDataLoaded={handleDataLoaded}
            prefetchedData={prefetchedData?.allVaults}
            prefetchedContracts={prefetchedData?.allVaultContracts}
            prefetchedProcessedVaults={prefetchedData?.processedVaults}
            prfetchedDataChainId={prefetchedData?.chainId}
          />
        ) : (
          <MyAquaberaVaults
            searchString={search}
            sortBy={sortField}
            key={`my-${sortField}-${search}`}
          />
        )}
      </div>
    </div>
  );
}

export default AquaberaList;
