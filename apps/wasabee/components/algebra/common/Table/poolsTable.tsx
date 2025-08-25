import { Pool } from './poolsColumns';
import { cn } from '@/lib/tailwindcss';
import { Search, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Tab, Tabs, Tooltip } from '@nextui-org/react';
import { popmodal } from '@/services/popmodal';

import { Token } from '@honeypot/shared';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/algebra/ui/button';
import { TokenLogo } from '@honeypot/shared';
import CreatePoolForm from '../../create-pool/CreatePoolForm';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { LoadingDisplay } from '@/components/LoadingDisplay/LoadingDisplay';
import { formatExtremelyLargeNumber } from '@/lib/format';
import { observer, useObserver } from 'mobx-react-lite';
import { wallet } from '@honeypot/shared/lib/wallet';
import { formatUSD } from '@/lib/algebra/utils/common/formatUSD';
import { optionsPresets } from '@/components/OptionsDropdown/OptionsDropdown';
import { OptionsDropdown } from '@/components/OptionsDropdown/OptionsDropdown';
import { TbSwitch, TbSwitchHorizontal } from 'react-icons/tb';
import { ChevronDown } from 'lucide-react';
import { useBitgetEvents } from '@/lib/algebra/graphql/clients/bitget_event';
import Image from 'next/image';
import Link from 'next/link';

interface PoolsTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  columnsMy: ColumnDef<TData, TValue>[];
  data: TData[];
  userPools: TData[];
  action?: (args?: any) => void;
  defaultSortingID?: string;
  link?: string;
  showPagination?: boolean;
  searchID?: string;
  loading?: boolean;
  sorting: any;
  setSorting: any;
  defaultFilter?: string;
  showOptions?: boolean;
  handleSearch: (data: string) => void;
}

type SortField =
  | 'pool'
  | 'tvl'
  | 'volume'
  | 'apr'
  | 'unclaimedFees'
  | 'feesUSD'
  | 'user_tvl';
type SortDirection = 'asc' | 'desc';

const PoolsTable = observer(
  <TData, TValue>({
    columns,
    columnsMy,
    data,
    userPools,
    action,
    link,
    showPagination = true,
    loading,
    defaultFilter = 'trending',
    showOptions = true,
    handleSearch,
  }: PoolsTableProps<TData, TValue>) => {
    const walletClient = useObserver(() => {
      return wallet.walletClient;
    });
    const zeroAddress = '0x0000000000000000000000000000000000000000';
    const [selectedFilter, setSelectedFilter] = useState<string>(defaultFilter);
    const [search, setSearch] = useState('');
    const [sortField, setSortField] = useState<SortField>('tvl');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [page, setPage] = useState(1);

    const filters = [
      { key: 'trending', label: 'All Pools' },
      { key: 'myPools', label: 'My Pools' },
    ];
    const bitgetEventsData = useBitgetEvents(wallet.account.toLowerCase());

    const [tableData, setTableData] = useState<
      (Pool & { userTVLUSD: number })[]
    >([]);

    const [showSortDropdown, setShowSortDropdown] = useState(false);

    useEffect(() => {
      if (!wallet.isInit) return;
      if (selectedFilter === 'myPools') {
        setTableData(userPools as (Pool & { userTVLUSD: number })[]);
      } else {
        setTableData(data as (Pool & { userTVLUSD: number })[]);
      }
    }, [data, selectedFilter, userPools, wallet.isInit]);

    useEffect(() => {
      const timer = setTimeout(() => {
        handleSearch(search.toLowerCase());
      }, 500);

      return () => clearTimeout(timer);
    }, [search]);

    const handleSort = (field: SortField) => {
      setPage(1);
      if (sortField === field) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setSortField(field);
        setSortDirection('desc');
      }
    };

    const getSortedPools = () => {
      const sortedPools = [...tableData].sort((a, b) => {
        const multiplier = sortDirection === 'asc' ? 1 : -1;

        switch (sortField) {
          case 'pool':
            return (
              multiplier *
              (a.pair.token0.symbol + a.pair.token1.symbol).localeCompare(
                b.pair.token0.symbol + b.pair.token1.symbol
              )
            );
          case 'tvl':
            return multiplier * (Number(a.tvlUSD) - Number(b.tvlUSD));
          case 'user_tvl':
            return multiplier * (Number(a.userTVLUSD) - Number(b.userTVLUSD));
          case 'volume':
            return multiplier * (Number(a.volume24USD) - Number(b.volume24USD));
          case 'apr':
            return multiplier * (Number(a.apr24h) - Number(b.apr24h));
          case 'unclaimedFees':
            return (
              multiplier * (Number(a.unclaimedFees) - Number(b.unclaimedFees))
            );
          case 'feesUSD':
            return multiplier * (Number(a.fees24USD) - Number(b.fees24USD));
          default:
            return 0;
        }
      });

      return sortedPools.slice((page - 1) * 10, page * 10);
    };

    const SortHeader = ({
      field,
      label,
      align = 'right',
    }: {
      field: SortField;
      label: string;
      align?: 'left' | 'right' | 'center';
    }) => (
      <th
        className={`py-4 px-6 bg-transparent cursor-pointer transition-colors text-[#4D4D4D]`}
        onClick={() => handleSort(field)}
      >
        <div
          className={`flex items-center gap-2 ${
            align === 'right'
              ? 'justify-end'
              : align === 'center'
              ? 'justify-center'
              : ''
          }`}
        >
          <span>{label}</span>
          <div className="flex flex-col">
            <ChevronUpIcon
              className={`h-3 w-3 ${
                sortField === field && sortDirection === 'asc'
                  ? 'text-black'
                  : 'text-[#4D4D4D]'
              }`}
            />
            <ChevronDownIcon
              className={`h-3 w-3 ${
                sortField === field && sortDirection === 'desc'
                  ? 'text-black'
                  : 'text-[#4D4D4D]'
              }`}
            />
          </div>
        </div>
      </th>
    );

    const sortOptions = [
      { key: 'tvl', label: 'TVL' },
      { key: 'volume', label: 'Volume' },
      { key: 'fees', label: 'Fees' },
      { key: 'apr', label: 'APR' },
    ];

    return (
      <div className="flex flex-col gap-4 w-full">
        {showOptions && (
          <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
              <div className="flex justify-between items-center w-full sm:w-auto">
                <Tabs
                  classNames={{
                    base: 'relative w-auto',
                    tabList:
                      'flex rounded-2xl border border-[#202020] bg-white p-4 shadow-[2px_2px_0px_0px_#000] py-2 px-3.5 z-10',
                    cursor:
                      'bg-[#FFCD4D] border border-black shadow-[2px_2px_0px_0px_#000000] text-sm',
                    panel: 'w-full',
                    tab: 'px-2 sm:px-3 text-xs sm:text-sm',
                    tabContent: '!text-[#202020]',
                  }}
                  onSelectionChange={(key) => {
                    if (key === 'myPools' && !wallet.account) {
                      popmodal.openModal({
                        content: (
                          <div className="p-6 bg-white rounded-2xl">
                            <h2 className="text-xl font-bold mb-4 text-black">
                              Connect Wallet
                            </h2>
                            <p className="text-black mb-4">
                              Please connect your wallet to view your pools.
                            </p>
                            <div className="flex justify-end">
                              <Button
                                className="border border-[#2D2D2D] bg-[#FFCD4D] hover:bg-[#FFD56A] text-black rounded-2xl shadow-[2px_2px_0px_0px_#000] px-4 py-2"
                                onClick={() => {
                                  popmodal.closeModal();
                                  window.location.href = '/login';
                                }}
                              >
                                Connect Wallet
                              </Button>
                            </div>
                          </div>
                        ),
                        boarderLess: true,
                      });
                      return;
                    }
                    setSelectedFilter(key === 'all' ? 'trending' : 'myPools');
                    setPage(1);
                  }}
                  defaultSelectedKey={
                    selectedFilter === 'trending' ? 'all' : 'myPools'
                  }
                >
                  <Tab key="all" title="All Pools" />
                  <Tab key="myPools" title="My Pools" />
                </Tabs>

                <div className="flex items-center gap-2">
                  <Button
                    className="sm:hidden border border-[#2D2D2D] bg-[#FFCD4D] hover:bg-[#FFD56A] text-black rounded-2xl shadow-[2px_2px_0px_0px_#000] px-3 py-1.5 text-xs"
                    onClick={() => {
                      popmodal.openModal({
                        content: <CreatePoolForm />,
                        boarderLess: true,
                        shouldCloseOnInteractOutside: false,
                      });
                    }}
                    disabled={
                      !wallet?.account || wallet?.account === zeroAddress
                    }
                  >
                    Create Pool
                  </Button>
                </div>
              </div>

              <div className="sm:hidden w-full">
                <div className="w-full relative">
                  <button
                    onClick={() => {
                      const dropdownState = !showSortDropdown;
                      setShowSortDropdown(dropdownState);
                    }}
                    className="bg-[#271A0C] border border-[#2D2D2D] rounded-xl shadow-[2px_2px_0px_0px_#000] px-3 py-1.5 text-xs text-black w-full flex justify-between items-center"
                  >
                    <span>
                      Sort by:{' '}
                      {sortOptions.find((option) => option.key === sortField)
                        ?.label || 'TVL'}
                    </span>
                    <ChevronDown className="h-4 w-4 text-black" />
                  </button>

                  {showSortDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#2D2D2D] rounded-xl shadow-[2px_2px_0px_0px_#000] p-1 w-full z-50">
                      {sortOptions.map((option) => (
                        <div
                          key={option.key}
                          className={`text-black text-sm p-2 cursor-pointer w-full ${
                            sortField === option.key
                              ? 'bg-[#FFCD4D] rounded-lg'
                              : ''
                          }`}
                          onClick={() => {
                            setSortField(option.key as SortField);
                            setSortDirection('desc');
                            setShowSortDropdown(false);
                          }}
                        >
                          {option.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="relative w-full sm:w-[450px] md:w-[500px]">
                <input
                  placeholder="Search"
                  value={search}
                  type="text"
                  onChange={(event) => setSearch(event.target.value)}
                  className="border border-[#2D2D2D] bg-white text-black pl-10 pr-4 py-2 h-12 w-full rounded-2xl shadow-[2px_2px_0px_0px_#000] placeholder:text-[#4D4D4D]/70 focus:outline-none"
                />
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4D4D4D]"
                  size={20}
                />
              </div>

              <div className="hidden sm:block">
                <Button
                  className={cn(
                    'flex items-center gap-x-1 p-2.5 cursor-pointer border border-[#2D2D2D] bg-[#FFCD4D] rounded-2xl shadow-[2px_2px_0px_0px_#000] hover:bg-[#FFD666]'
                  )}
                  onClick={() =>
                    popmodal.openModal({
                      content: <CreatePoolForm />,
                      boarderLess: true,
                      shouldCloseOnInteractOutside: false,
                    })
                  }
                  disabled={!wallet?.account || wallet?.account === zeroAddress}
                >
                  <Plus className="text-black" />
                  <span className="text-black">Create Pool</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile view - card layout for small screens */}
        <div className="md:hidden w-full bg-[#140D06] rounded-2xl border border-[#2a2318] p-4">
          {!loading ? (
            getSortedPools().length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {selectedFilter === 'myPools' && wallet.account
                  ? "You don't have any pools yet. Create a pool to get started."
                  : 'No results found.'}
              </div>
            ) : (
              getSortedPools().map((pool: Pool & { userTVLUSD: number }) => (
                <div
                  key={pool.id}
                  className="mb-4 p-4 bg-[#1F1409] rounded-lg border border-[#2a2318]"
                  onClick={() => {
                    if (action) {
                      action(pool.id);
                    } else if (link) {
                      window.location.href = `/${link}/${pool.id}`;
                    }
                  }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="font-medium text-gray-500">Pool</div>
                    <div className="flex items-center">
                      <div className="flex items-center gap-1">
                        <TokenLogo
                          token={Token.getToken({
                            address: pool.pair.token0.id,
                            chainId: wallet.currentChainId.toString(),
                          })}
                          addtionalClasses="translate-x-[25%]"
                          size={20}
                        />
                        <TokenLogo
                          token={Token.getToken({
                            address: pool.pair.token1.id,
                            chainId: wallet.currentChainId.toString(),
                          })}
                          addtionalClasses="translate-x-[-25%]"
                          size={20}
                        />
                      </div>
                      <div className="font-bold text-white">
                        {pool.pair.token0.symbol}/{pool.pair.token1.symbol}
                      </div>
                    </div>
                  </div>

                  {defaultFilter === 'trending' && (
                    <>
                      <div className="flex justify-between items-center mb-3">
                        <div className="font-medium text-gray-500">TVL</div>
                        <div className="text-white">{formatExtremelyLargeNumber(pool.tvlUSD)}</div>
                      </div>

                      <div className="flex justify-between items-center mb-3">
                        <div className="font-medium text-gray-500">Volume 24H</div>
                        <div className="flex flex-col items-end">
                          <span className="text-white">
                            {formatExtremelyLargeNumber(pool.volume24USD)}
                          </span>
                          <span
                            className={`text-xs ${
                              Number(pool.change24h) > 0 && 'text-[#4ADE80]'
                            } ${
                              Number(pool.change24h) < 0 && 'text-[#FF5555]'
                            }`}
                          >
                            {Number(pool.change24h) > 0 ? '+' : ''}
                            {Number(pool.change24h).toFixed(2)}%
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mb-3">
                        <div className="font-medium text-gray-500">Fee 24H</div>
                        <div className="text-white">{formatUSD.format(pool.fees24USD)}</div>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between items-center mb-3">
                    <div className="font-medium text-gray-500">APR</div>
                    <div className="font-bold text-green-500">
                      {Number(pool.apr24h).toFixed(2)}%
                    </div>
                  </div>

                  {defaultFilter === 'myPools' && (
                    <>
                      <div className="flex justify-between items-center mb-3">
                        <div className="font-medium text-gray-500">My TVL</div>
                        <div className="text-white">{formatExtremelyLargeNumber(pool.userTVLUSD)}</div>
                      </div>

                      <div className="flex justify-between items-center mb-3">
                        <div className="font-medium text-gray-500">Unclaimed Fees</div>
                        <div className="text-white">
                          ${Number(pool.unclaimedFees).toLocaleString()}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="mt-4 flex justify-center gap-2">
                    <Button
                      className="w-1/2 border border-[#2D2D2D] bg-[#FFCD4D] hover:bg-[#FFD56A] text-black rounded-2xl shadow-[2px_2px_0px_0px_#000] px-2 py-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/pool-detail/${pool.id}`;
                      }}
                    >
                      View Pool
                    </Button>
                    <Button
                      className="w-1/2 border border-[#2D2D2D] bg-white hover:bg-gray-50 text-black rounded-2xl shadow-[2px_2px_0px_0px_#000] px-2 py-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/swap?inputCurrency=${pool.pair.token0.id}&outputCurrency=${pool.pair.token1.id}`;
                      }}
                    >
                      Swap
                    </Button>
                  </div>
                </div>
              ))
            )
          ) : (
            <LoadingDisplay />
          )}
        </div>

        {/* Desktop view - table layout for medium screens and up */}
        <div className="hidden md:block w-full bg-[#140D06] rounded-2xl border border-[#2a2318] p-6 overflow-x-auto">
          {!loading ? (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left text-sm text-gray-500 font-normal pb-4">Pool</th>
                  {defaultFilter === 'trending' && (
                    <>
                      <th className="text-left text-sm text-gray-500 font-normal pb-4">
                        <div className="flex items-center gap-1 justify-end cursor-pointer" onClick={() => handleSort('tvl')}>
                          TVL
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </th>
                      <th className="text-left text-sm text-gray-500 font-normal pb-4">
                        <div className="flex items-center gap-1 justify-end cursor-pointer" onClick={() => handleSort('volume')}>
                          Volume 24H
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </th>
                      <th className="text-left text-sm text-gray-500 font-normal pb-4">
                        <div className="flex items-center gap-1 justify-end cursor-pointer" onClick={() => handleSort('feesUSD')}>
                          Fee 24H
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </th>
                    </>
                  )}
                  <th className="text-left text-sm text-gray-500 font-normal pb-4">
                    <div className="flex items-center gap-1 justify-end cursor-pointer" onClick={() => handleSort('apr')}>
                      APR
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </th>
                  {defaultFilter === 'myPools' && (
                    <>
                      <th className="text-left text-sm text-gray-500 font-normal pb-4">
                        <div className="flex items-center gap-1 justify-end cursor-pointer" onClick={() => handleSort('user_tvl')}>
                          My TVL
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </th>
                      <th className="text-left text-sm text-gray-500 font-normal pb-4">
                        <div className="flex items-center gap-1 justify-center cursor-pointer" onClick={() => handleSort('unclaimedFees')}>
                          Unclaimed Fees
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </th>
                    </>
                  )}
                  <th className="text-left text-sm text-gray-500 font-normal pb-4 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {!getSortedPools().length ? (
                  <tr className="h-full w-full">
                    <td
                      colSpan={columns.length}
                      className="h-24 text-center text-gray-500"
                    >
                      {selectedFilter === 'myPools' && wallet.account
                        ? "You don't have any pools yet. Create a pool to get started."
                        : 'No results found.'}
                    </td>
                  </tr>
                ) : (
                  getSortedPools().map(
                    (pool: Pool & { userTVLUSD: number }, index) => (
                      <tr
                        key={pool.id}
                        className={`border-b border-[#2a2318] transition-colors cursor-pointer ${
                          index % 2 === 0 
                            ? 'bg-transparent hover:bg-[#0A0704]' // Even rows - darker
                            : 'bg-[#1F1409] hover:bg-[#241809]'   // Odd rows - lighter background
                        }`}
                        onClick={() => {
                          if (action) {
                            action(pool.id);
                          } else if (link) {
                            window.location.href = `/${link}/${pool.id}`;
                          }
                        }}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <TokenLogo
                                token={Token.getToken({
                                  address: pool.pair.token0.id,
                                  chainId: wallet.currentChainId.toString(),
                                })}
                                addtionalClasses="translate-x-[25%]"
                                size={24}
                              />
                              <TokenLogo
                                token={Token.getToken({
                                  address: pool.pair.token1.id,
                                  chainId: wallet.currentChainId.toString(),
                                })}
                                addtionalClasses="translate-x-[-25%]"
                                size={24}
                              />
                            </div>
                            <div className="flex flex-col">
                              <p className="text-white font-medium">
                                {pool.pair.token0.symbol}/
                                {pool.pair.token1.symbol}
                              </p>
                              <p className="text-gray-500 text-sm">
                                base fee {pool.fee}%
                              </p>
                            </div>
                            <div>
                              {bitgetEventsData?.eventPools.find(
                                (eventPool) => eventPool.pool.id === pool.id
                              ) ? (
                                <Tooltip content="Bitget Campaign">
                                  <Link
                                    href={`/bitget-campaign`}
                                    className="rounded-full z-10 flex items-center justify-center"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // window.location.href = `/bitget-campaign`;
                                    }}
                                  >
                                    <Image
                                      src="/images/bera/smoking_bera.png"
                                      alt="Bitget"
                                      width={20}
                                      height={20}
                                    />
                                  </Link>
                                </Tooltip>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        {defaultFilter === 'trending' && (
                          <>
                            <td className="py-4 px-6 text-right">
                              <div className="flex flex-col">
                                <span className="text-white font-mono">
                                  {formatExtremelyLargeNumber(pool.tvlUSD)}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <div className="flex flex-col">
                                <span className="text-white font-mono">
                                  {formatExtremelyLargeNumber(pool.volume24USD)}
                                </span>
                                <span
                                  className={`text-xs ${
                                    Number(pool.change24h) > 0 &&
                                    'text-[#4ADE80]'
                                  } ${
                                    Number(pool.change24h) < 0 &&
                                    'text-[#FF5555]'
                                  }`}
                                >
                                  {Number(pool.change24h) > 0 ? '+' : ''}
                                  {Number(pool.change24h).toFixed(2)}%
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <div className="flex flex-col">
                                <span className="text-white">
                                  {formatUSD.format(pool.fees24USD)}
                                </span>
                              </div>
                            </td>
                          </>
                        )}
                        <td className="py-4 px-6 text-right">
                          <div className="flex flex-col">
                            <span className="text-white">
                              {Number(pool.apr24h).toFixed(2)}%
                            </span>
                          </div>
                        </td>
                        {defaultFilter === 'myPools' && (
                          <>
                            <td className="py-4 px-6 text-right">
                              <div className="flex flex-col">
                                <span className="text-white">
                                  {formatExtremelyLargeNumber(pool.userTVLUSD)}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <span className="text-white">
                                ${Number(pool.unclaimedFees).toLocaleString()}
                              </span>
                            </td>
                          </>
                        )}
                        <td className="py-4 px-6 text-center">
                          <OptionsDropdown
                            className="min-h-0 h-[unset] bg-white text-black"
                            options={[
                              optionsPresets.copy({
                                copyText: pool.id,
                                displayText: 'Copy Pool address',
                                copysSuccessText: 'Pool address copied',
                              }),
                              optionsPresets.viewOnExplorer({
                                address: pool.id,
                              }),
                              {
                                icon: <TbSwitchHorizontal />,
                                display: 'Swap',
                                onClick: () => {
                                  window.location.href = `/swap?inputCurrency=${pool.pair.token0.id}&outputCurrency=${pool.pair.token1.id}`;
                                },
                              },
                            ]}
                          />
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          ) : (
            <LoadingDisplay />
          )}

          {showPagination && tableData.length > 10 && (
            <div className="py-4">
              <div className="flex flex-row justify-between items-center gap-4">
                <span className="text-gray-500 text-sm">
                  Page {page} of {Math.ceil(tableData.length / 10)}
                </span>
                <div className="flex gap-x-2">
                  <Button
                    className="border border-[#2a2318] bg-[#1F1409] hover:bg-[#241809] text-white rounded-lg px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm"
                    disabled={page === 1}
                    onClick={() => {
                      setPage(page - 1);
                    }}
                  >
                    Previous
                  </Button>
                  <Button
                    className="border border-[#2a2318] bg-[#1F1409] hover:bg-[#241809] text-white rounded-lg px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm"
                    disabled={page === Math.ceil(tableData.length / 10)}
                    onClick={() => {
                      setPage(page + 1);
                    }}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default PoolsTable;
