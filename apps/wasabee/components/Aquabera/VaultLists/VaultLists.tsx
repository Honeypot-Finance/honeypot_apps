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
            tab: 'px-2 text-xs',
            base: '',
            tabList:
              'flex rounded-2xl border border-[#202020] bg-white p-4 shadow-[2px_2px_0px_0px_#000] py-2 px-2 z-10',
            cursor:
              'bg-[#FFCD4D] border border-black shadow-[2px_2px_0px_0px_#000000] text-sm',
            panel: 'w-full',
            tabContent: '!text-[#202020]',
          }}
        >
          <Tab key="all" title="Vaults" />
          <Tab key="my" title="My Vaults" />
        </Tabs>

        <Dropdown>
          <DropdownTrigger>
            <NextUIButton
              className="bg-white border border-[#2D2D2D] rounded-xl shadow-[2px_2px_0px_0px_#000] px-3 py-1.5 text-xs text-black"
              endContent={<ChevronDown className="h-4 w-4 text-black" />}
            >
              Sort by:{' '}
              {sortOptions.find((option) => option.key === sortField)?.label}
            </NextUIButton>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Sort options"
            className="bg-white border border-[#2D2D2D] rounded-xl shadow-[2px_2px_0px_0px_#000] p-1"
            onAction={(key) => {
              setSortField(key.toString());
            }}
          >
            {sortOptions.map((option) => (
              <DropdownItem
                key={option.key}
                className={`text-black text-sm p-2 ${sortField === option.key ? 'bg-[#FFCD4D]' : ''
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
            tab: 'px-3 text-sm',
            base: '',
            tabList:
              'flex rounded-2xl border border-[#202020] bg-white p-4 shadow-[2px_2px_0px_0px_#000] py-2 px-2 z-10',
            cursor:
              'bg-[#FFCD4D] border border-black shadow-[2px_2px_0px_0px_#000000] text-sm',
            panel: 'w-full',
            tabContent: '!text-[#202020]',
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
            className="border border-[#2D2D2D] bg-white text-black pl-10 pr-4 py-2 h-12 w-full rounded-2xl shadow-[2px_2px_0px_0px_#000] placeholder:text-[#4D4D4D]/70 focus:outline-none"
          />
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4D4D4D]"
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
          className="border border-[#2D2D2D] bg-white text-black pl-10 pr-4 py-2 h-12 w-full rounded-2xl shadow-[2px_2px_0px_0px_#000] placeholder:text-[#4D4D4D]/70 focus:outline-none"
        />
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4D4D4D]"
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
