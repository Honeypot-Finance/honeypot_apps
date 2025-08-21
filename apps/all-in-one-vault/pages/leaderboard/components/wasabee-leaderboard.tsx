import { useState, useMemo, useEffect } from 'react';
import { debounce } from 'lodash';
import { Link, Tooltip } from '@nextui-org/react';
import { useWasabeeLeaderboard } from '@/hooks/useWasabeeLeaderboard';
import { useWasabeeAccounts } from '@/hooks/useWasabeeAccounts';
import { useTotalUsersFromDB, ChainUserData } from '@/hooks/useTotalUsersFromDB';
import { formatNumberWithUnit } from '@/lib/utils';

interface LeaderboardItem {
  rank: number;
  walletAddress: string;
  username?: string;
  xp: number;
  totalVolume?: number;
  transactions?: number;
  lastActive?: string;
  swapCount?: number;
}

interface StatsCard {
  title: string;
  value: string | number | React.ReactNode;
  subValue?: string;
  decimals?: number;
}

const WasabeeLeaderboard = () => {
  const [searchInput, setSearchInput] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Create debounced search handler
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchAddress(value);
        setPage(1); // Reset to first page when searching
      }, 300),
    []
  );

  // Handle search input changes
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    debouncedSearch(value);
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchInput('');
    setSearchAddress('');
    setPage(1);
  };

  // Handle address click to populate search
  const handleAddressClick = (address: string, e: React.MouseEvent) => {
    e.preventDefault();
    setSearchInput(address);
    debouncedSearch(address);
  };

  // Real data hooks
  const { stats, loading: statsLoading } = useWasabeeLeaderboard();
  const { fetchTotalUsers, fetchChainBreakdown } = useTotalUsersFromDB();
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [chainBreakdown, setChainBreakdown] = useState<ChainUserData[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const {
    accounts,
    loading: accountsLoading,
    hasMore,
    loadMore,
  } = useWasabeeAccounts(page, pageSize, searchAddress);

  // Fetch total users and chain breakdown from database
  useEffect(() => {
    const loadUserData = async () => {
      setUsersLoading(true);
      const [total, breakdown] = await Promise.all([
        fetchTotalUsers(),
        fetchChainBreakdown()
      ]);
      setTotalUsers(total);
      setChainBreakdown(breakdown);
      setUsersLoading(false);
    };
    loadUserData();
  }, []);

  // Format chain names for display
  const getChainDisplayName = (chainId: string) => {
    const chainNames: Record<string, string> = {
      'bera': 'Berachain',
      'bsc': 'BSC',
      'ethereum': 'Ethereum',
      'base': 'Base'
    };
    return chainNames[chainId.toLowerCase()] || chainId.toUpperCase();
  };

  const statsCards: StatsCard[] = [
    {
      title: 'Users',
      value: usersLoading ? 'Loading...' : (
        <div className="flex items-center gap-2">
          <span>{totalUsers.toLocaleString()}</span>
          {chainBreakdown.length > 0 && (
            <Tooltip
              content={
                <div className="p-2">
                  <div className="text-sm font-semibold mb-2">Users by Chain</div>
                  {chainBreakdown.map((chain) => (
                    <div key={chain.id} className="flex justify-between gap-4 text-xs">
                      <span>{getChainDisplayName(chain.id)}:</span>
                      <span className="font-mono">{chain.total_account.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              }
              placement="bottom"
              classNames={{
                base: 'z-50',
                content: 'bg-black text-white rounded-lg max-w-none',
              }}
            >
              <svg 
                className="w-4 h-4 text-gray-400 hover:text-white cursor-help transition-colors" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </Tooltip>
          )}
        </div>
      ),
      decimals: 2,
    },
    stats
      ? {
          title: stats.totalTrades.title,
          value: stats.totalTrades.value,
          decimals: 0,
        }
      : { title: 'Total Trades', value: '-' },
    stats
      ? {
          title: stats.totalVolume.title,
          value: stats.totalVolume.value,
          decimals: 2,
          subValue: 'USD',
        }
      : { title: 'Total Volume', value: '-' },
    stats
      ? {
          title: stats.tvl.title,
          value: stats.tvl.value,
          decimals: 2,
          subValue: 'USD',
        }
      : { title: 'TVL', value: '-' },
    stats
      ? {
          title: stats.totalFees.title,
          value: stats.totalFees.value,
          decimals: 2,
          subValue: 'USD',
        }
      : { title: 'Total Fees', value: '-' },
  ];

  const shortenAddressString = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatVolume = (volume: number) => {
    return `$${formatNumberWithUnit(volume)}`;
  };

  // Use the exact same formatting function as original Wasabee
  const formatExtremelyLargeNumber = (
    number: number | string,
    decimals = 2,
    options = { addPrefix: true }
  ) => {
    const rawNumber =
      typeof number === 'string' && number.startsWith('$')
        ? number.slice(1)
        : number;

    const num = parseFloat(rawNumber.toString());
    if (isNaN(num) || num === 0) {
      return options.addPrefix
        ? `$${num.toFixed(decimals)}`
        : num.toFixed(decimals);
    }

    if (num < 1000) {
      return options.addPrefix
        ? `$${num.toFixed(decimals)}`
        : num.toFixed(decimals);
    }

    const units = ['', 'K', 'M', 'B', 'T'];
    let unitIndex = 0;
    let value = num;

    while (value >= 1000 && unitIndex < units.length - 1) {
      value = value / 1000;
      unitIndex++;
    }

    const unit = units[Math.min(unitIndex, units.length - 1)];
    return options.addPrefix
      ? `$${value.toFixed(decimals)}${unit}`
      : `${value.toFixed(decimals)}${unit}`;
  };

  return (
    <div className="w-full">
      {/* 顶部统计卡片 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-[#202020] rounded-2xl p-3 md:p-5">
            <div className="text-gray-400 text-xs sm:text-sm mb-1 md:mb-2">
              {stat.title}
            </div>
            <div className="text-white text-sm sm:text-base md:text-xl font-medium truncate">
              {statsLoading
                ? 'Loading...'
                : typeof stat.value === 'string' || typeof stat.value === 'number'
                ? (typeof stat.value === 'string' && stat.value.startsWith('$')
                  ? formatExtremelyLargeNumber(
                      stat.value.slice(1).replace(/,/g, ''),
                      stat.decimals,
                      { addPrefix: true }
                    )
                  : stat.subValue === 'USD'
                  ? formatExtremelyLargeNumber(stat.value, stat.decimals, {
                      addPrefix: true,
                    })
                  : formatExtremelyLargeNumber(stat.value, stat.decimals, {
                      addPrefix: false,
                    }))
                : stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* 搜索栏 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div className="flex gap-2 flex-1 w-full sm:max-w-md">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by full wallet address (0x...)"
            className="w-full bg-[#1a1b1f] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm md:text-base"
          />
          {searchInput && (
            <button
              onClick={handleClearSearch}
              className="px-3 py-2 bg-[#2a2a2a] rounded-lg text-white hover:bg-[#3a3a3a] transition-colors text-sm md:text-base whitespace-nowrap"
            >
              Clear
            </button>
          )}
        </div>
        {searchInput && (
          <div className="text-gray-400 text-xs sm:text-sm sm:ml-4">
            {!/^0x[a-fA-F0-9]{40}$/.test(searchInput)
              ? searchInput.startsWith('0x')
                ? `Need ${42 - searchInput.length} more characters`
                : 'Address must start with 0x'
              : accountsLoading
              ? 'Searching...'
              : accounts.length > 0
              ? `Found ${accounts.length} results`
              : 'No results found'}
          </div>
        )}
      </div>

      {/* 交易数据表格 */}
      <div className="bg-[#202020] rounded-2xl overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[#5C5C5C]">
          <h2 className="text-lg sm:text-xl text-white font-bold">
            Wasabee Leaderboard
          </h2>
        </div>
        <div className="p-3 sm:p-6">
          <div className="border border-[#5C5C5C] rounded-lg overflow-auto">
            <table className="w-full">
              <thead className="bg-[#323232] text-white border-b border-[#5C5C5C]">
                <tr>
                  <th className="py-3 sm:py-4 px-2 sm:px-6 text-left text-xs sm:text-sm md:text-base font-medium">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="hidden sm:block w-3 h-3 md:w-4 md:h-4 bg-[#FFCD4D] rounded"></div>
                      <span className="whitespace-nowrap">Address</span>
                    </div>
                  </th>
                  <th className="py-3 sm:py-4 px-2 sm:px-6 text-left text-xs sm:text-sm md:text-base font-medium">
                    <span className="whitespace-nowrap">Volume</span>
                  </th>
                  <th className="py-3 sm:py-4 px-2 sm:px-6 text-center text-xs sm:text-sm md:text-base font-medium">
                    <span className="whitespace-nowrap">Swaps</span>
                  </th>
                </tr>
              </thead>
              <tbody className="text-white divide-y divide-[#5C5C5C]">
                {accountsLoading ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-3 sm:py-4 px-2 sm:px-6 text-center"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : (
                  accounts.map((item, index) => (
                    <tr
                      key={item.walletAddress}
                      className="hover:bg-[#2a2a2a] transition-colors"
                    >
                      <td className="py-3 sm:py-4 px-2 sm:px-6 text-xs sm:text-sm md:text-base font-mono text-blue-400">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <div className="hidden sm:block w-3 h-3 md:w-4 md:h-4 bg-[#FFCD4D] rounded"></div>
                          <Tooltip
                            content={
                              <div className="text-center">
                                <div>{item.walletAddress}</div>
                                <div className="text-xs mt-1 opacity-75">
                                  Click to search
                                </div>
                              </div>
                            }
                            placement="top"
                            classNames={{
                              base: 'z-50',
                              content:
                                'bg-black text-white px-2 py-1 rounded text-xs max-w-none',
                            }}
                          >
                            <div className="flex gap-1 sm:gap-2 items-center">
                              <span
                                onClick={(e) =>
                                  handleAddressClick(item.walletAddress, e)
                                }
                                className="text-blue-400 cursor-pointer hover:text-blue-300 transition-colors text-xs sm:text-sm md:text-base"
                              >
                                {shortenAddressString(item.walletAddress)}
                              </span>
                              <Link
                                href={`https://berascan.com/address/${item.walletAddress}`}
                                target="_blank"
                                className="text-gray-400 hover:text-white transition-colors"
                                title="Open in Berascan"
                              >
                                <svg
                                  className="w-3 h-3 sm:w-4 sm:h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                  />
                                </svg>
                              </Link>
                            </div>
                          </Tooltip>
                        </div>
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-6 text-xs sm:text-sm md:text-base">
                        {formatVolume(item.totalSpend)}
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-6 text-center text-xs sm:text-sm md:text-base">
                        {item.swapCount}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-700">
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-3">
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-start">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-[#2a2a2a] rounded-lg text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3a3a3a] transition-colors"
              >
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="sm:inline hidden">Previous</span>
              </button>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Page</span>
                <span className="px-2 sm:px-3 py-1 bg-[#1a1a1a] rounded text-white min-w-[32px] sm:min-w-[40px] text-center text-sm">
                  {page}
                </span>
              </div>
              <button
                onClick={() => {
                  if (hasMore) {
                    setPage((p) => p + 1);
                  }
                }}
                disabled={!hasMore || accountsLoading}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-[#2a2a2a] rounded-lg text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3a3a3a] transition-colors"
              >
                <span className="sm:inline hidden">Next</span>
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {accountsLoading && (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <svg
                  className="animate-spin h-3 w-3 sm:h-4 sm:w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Loading...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WasabeeLeaderboard;
