import { Pool } from './poolsColumns';
import { cn } from '@/lib/tailwindcss';
import { Search, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Tab, Tabs } from '@nextui-org/react';
import { popmodal } from '@/services/popmodal';

import { Token, wallet } from '@honeypot/shared';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/algebra/ui/button';
import { TokenLogo } from '@honeypot/shared';
import CreatePoolForm from '../../create-pool/CreatePoolForm';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { LoadingDisplay } from '@/components/LoadingDisplay/LoadingDisplay';

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

type SortField = 'pool' | 'tvl' | 'volume' | 'apr' | 'unclaimedFees';
type SortDirection = 'asc' | 'desc';

const PoolsTable = <TData, TValue>({
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
  const [selectedFilter, setSelectedFilter] = useState<string>(defaultFilter);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('tvl');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [page, setPage] = useState(1);

  const filters = [
    { key: 'trending', label: 'All Pools' },
    { key: 'myPools', label: 'My Pools' },
  ];

  const [tableData, setTableData] = useState<Pool[]>([]);

  useEffect(() => {
    if (selectedFilter === 'myPools') {
      setTableData(userPools as Pool[]);
    } else {
      setTableData(data as Pool[]);
    }
  }, [data, selectedFilter, userPools]);

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
        case 'volume':
          return multiplier * (Number(a.volume24USD) - Number(b.volume24USD));
        case 'apr':
          return multiplier * (Number(a.apr24h) - Number(b.apr24h));
        case 'unclaimedFees':
          return (
            multiplier * (Number(a.unclaimedFees) - Number(b.unclaimedFees))
          );
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
      className={`py-4 px-6 cursor-pointer transition-colors text-[#4D4D4D]`}
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

  return (
    <div className="flex flex-col gap-4 w-full">
      {showOptions && (
        <div className="flex flex-col xl:flex-row gap-4 w-full xl:justify-between xl:items-center">
          <div className="flex items-center xl:gap-x-6 w-full xl:w-fit justify-between">
            <Tabs
              classNames={{
                base: 'relative w-full',
                tabList:
                  'flex rounded-2xl border border-[#202020] bg-white p-4 shadow-[2px_2px_0px_0px_#000] py-2 px-3.5 ml-auto z-10',
                cursor:
                  'bg-[#FFCD4D] border border-black shadow-[2px_2px_0px_0px_#000000] text-sm',
                panel: 'w-full',
                tabContent: '!text-[#202020]',
              }}
              onSelectionChange={(key) =>
                setSelectedFilter(key === 'all' ? 'trending' : 'myPools')
              }
              defaultSelectedKey={
                selectedFilter === 'trending' ? 'all' : 'myPools'
              }
            >
              <Tab key="all" title="All Pools" />
              <Tab key="myPools" title="My Pools" />
            </Tabs>
            <div className="relative">
              <input
                placeholder="Search"
                value={search}
                type="text"
                onChange={(event) => setSearch(event.target.value)}
                className="border border-[#2D2D2D] bg-white text-black pl-10 pr-4 py-2 h-12 w-[319px] rounded-2xl shadow-[2px_2px_0px_0px_#000] placeholder:text-[#4D4D4D]/70 focus:outline-none"
              />
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4D4D4D]"
                size={20}
              />
            </div>
          </div>
          <div className="flex items-center gap-x-5">
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
            >
              <Plus className="text-black" />
              <span className="text-black">Create Pool</span>
            </Button>
          </div>
        </div>
      )}

      <div className="custom-dashed-3xl w-full p-6 bg-white">
        {!loading ? (
          <table className="w-full">
            <thead>
              <tr>
                <SortHeader field="pool" label="Pool" align="left" />
                <SortHeader field="tvl" label="TVL" />
                <SortHeader field="volume" label="Volume 24H" />
                <SortHeader field="apr" label="APR" />
                {defaultFilter === 'myPools' && (
                  <SortHeader
                    field="unclaimedFees"
                    label="Unclaimed Fees"
                    align="center"
                  />
                )}
                <th className="py-4 px-6 text-center text-[#4D4D4D]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#4D4D4D]">
              {!getSortedPools().length ? (
                <tr className="hover:bg-white border-white h-full">
                  <td colSpan={5} className="h-24 text-center text-black">
                    No results.
                  </td>
                </tr>
              ) : (
                getSortedPools().map((pool) => (
                  <tr
                    key={pool.id}
                    className="transition-colors bg-[#86715B] text-black hover:bg-gray-50 cursor-pointer"
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
                          <p className="text-black font-medium">
                            {pool.pair.token0.symbol}/{pool.pair.token1.symbol}
                          </p>
                          <p className="text-black/60 text-sm">
                            base fee {pool.fee}%
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex flex-col">
                        <span className="text-black">
                          ${Number(pool.tvlUSD).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex flex-col">
                        <span className="text-black">
                          ${Number(pool.volume24USD).toLocaleString()}
                        </span>
                        <span
                          className={`text-xs ${
                            Number(pool.change24h) >= 0
                              ? 'text-[#4ADE80]'
                              : 'text-[#FF5555]'
                          }`}
                        >
                          {Number(pool.change24h) >= 0 ? '+' : ''}
                          {Number(pool.change24h).toFixed(2)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex flex-col">
                        <span className="text-black">
                          {Number(pool.apr24h).toFixed(2)}%
                        </span>
                      </div>
                    </td>
                    {defaultFilter === 'myPools' && (
                      <td className="py-4 px-6 text-center">
                        <span className="text-black">
                          ${Number(pool.unclaimedFees).toLocaleString()}
                        </span>
                      </td>
                    )}
                    <td className="py-4 px-6 text-center">
                      <Button
                        className="bg-transparent"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (action) {
                            action(pool.id);
                          } else if (link) {
                            window.location.href = `/${link}/${pool.id}`;
                          }
                        }}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <LoadingDisplay />
        )}

        {showPagination && tableData.length > 10 && (
          <div className="p-4 border-t border-[#2D2D2D]">
            <div className="flex justify-between items-center">
              <span className="text-black">
                Page {page} of {Math.ceil(tableData.length / 10)}
              </span>
              <div className="flex gap-x-2">
                <Button
                  className="border border-[#2D2D2D] bg-white hover:bg-gray-50 text-black rounded-2xl shadow-[2px_2px_0px_0px_#000] px-4 py-2"
                  disabled={page === 1}
                  onClick={() => {
                    setPage(page - 1);
                  }}
                >
                  Previous
                </Button>
                <Button
                  className="border border-[#2D2D2D] bg-white hover:bg-gray-50 text-black rounded-2xl shadow-[2px_2px_0px_0px_#000] px-4 py-2"
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
};

export default PoolsTable;
