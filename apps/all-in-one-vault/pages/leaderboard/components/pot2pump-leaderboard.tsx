import { useState, useMemo, useEffect } from 'react';
import { debounce } from 'lodash';
import { Link, Tooltip } from '@nextui-org/react';
import { usePot2PumpLeaderboard } from '@/hooks/usePot2PumpLeaderboard';
import {
  usePot2PumpAccounts,
  Account_OrderBy,
} from '@/hooks/usePot2PumpAccounts';
import { useTotalUsersFromDB, ChainUserData } from '@/hooks/useTotalUsersFromDB';
import { formatNumberWithUnit } from '@/lib/utils';
import { DynamicFormatAmount } from '@/lib/algebra/utils/common/formatAmount';

interface LeaderboardItem {
  rank: number;
  walletAddress: string;
  username?: string;
  xp: number;
  totalVolume?: number;
  transactions?: number;
  lastActive?: string;
  launches?: number;
  participations?: number;
  totalDeposit?: number;
}

interface StatsCard {
  title: string;
  value: string | number | React.ReactNode;
  subValue?: string;
}

const Pot2PumpLeaderboard = () => {
  const [searchInput, setSearchInput] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [accountOrderBy, setAccountOrderBy] = useState<Account_OrderBy>(
    Account_OrderBy.TotalDepositPot2pumpUsd
  );

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
  const { stats, loading: statsLoading } = usePot2PumpLeaderboard();
  const { fetchTotalUsers, fetchChainBreakdown } = useTotalUsersFromDB();
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [chainBreakdown, setChainBreakdown] = useState<ChainUserData[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const {
    accounts,
    loading: accountsLoading,
    hasMore,
    loadMore,
  } = usePot2PumpAccounts(page, pageSize, searchAddress, accountOrderBy);

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
      )
    },
    stats
      ? {
          title: stats.totalMemeCreated.title,
          value: stats.totalMemeCreated.value,
        }
      : { title: 'Total Meme Created', value: '-' },
    stats
      ? {
          title: stats.totalSuccessedMeme.title,
          value: stats.totalSuccessedMeme.value,
        }
      : { title: 'Total Successed Meme', value: '-' },
    stats
      ? {
          title: stats.totalDepositedUSD.title,
          value: DynamicFormatAmount({
            amount: stats.totalDepositedUSD.value || '0',
            decimals: 2,
          }),
        }
      : { title: 'Total Deposited USD', value: '-' },
  ];

  const shortenAddressString = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="w-full">
      {/* 顶部统计卡片 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-[#202020] rounded-2xl p-5">
            <div className="text-gray-400 text-sm mb-2">{stat.title}</div>
            <div className="text-white text-xl font-medium">
              {statsLoading ? 'Loading...' : stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* 搜索栏 */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 flex-1 max-w-md">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by full wallet address (0x...)"
            className="w-full bg-[#1a1b1f] border border-gray-700 rounded-lg px-4 py-2 text-white"
          />
          {searchInput && (
            <button
              onClick={handleClearSearch}
              className="px-4 py-2 bg-[#2a2a2a] rounded-lg text-white hover:bg-[#3a3a3a] transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        {searchInput && (
          <div className="text-gray-400 text-sm ml-4">
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
        <div className="px-6 py-4 border-b border-[#5C5C5C]">
          <h2 className="text-xl text-white font-bold">Pot2Pump Leaderboard</h2>
        </div>
        <div className="p-6">
          <div className="border border-[#5C5C5C] rounded-lg overflow-auto">
            <table className="w-full">
              <thead className="bg-[#323232] text-white border-b border-[#5C5C5C]">
                <tr>
                  <th className="py-4 px-6 text-left text-base font-medium whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-[#FFCD4D] rounded"></div>
                      Address
                    </div>
                  </th>
                  <th
                    className="py-4 px-6 text-center text-base font-medium whitespace-nowrap cursor-pointer"
                    onClick={() =>
                      setAccountOrderBy(Account_OrderBy.Pot2PumpLaunchCount)
                    }
                  >
                    Launches
                  </th>
                  <th
                    className="py-4 px-6 text-center text-base font-medium whitespace-nowrap cursor-pointer"
                    onClick={() =>
                      setAccountOrderBy(Account_OrderBy.ParticipateCount)
                    }
                  >
                    Participations
                  </th>
                  <th
                    className="py-4 px-6 text-center text-base font-medium whitespace-nowrap cursor-pointer"
                    onClick={() =>
                      setAccountOrderBy(Account_OrderBy.TotalDepositPot2pumpUsd)
                    }
                  >
                    Total Deposit
                  </th>
                </tr>
              </thead>
              <tbody className="text-white divide-y divide-[#5C5C5C]">
                {accountsLoading ? (
                  <tr>
                    <td colSpan={4} className="py-4 px-6 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : (
                  accounts.map((item, index) => (
                    <tr
                      key={item.walletAddress}
                      className="hover:bg-[#2a2a2a] transition-colors"
                    >
                      <td className="py-4 px-6 text-base font-mono text-blue-400">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-[#FFCD4D] rounded"></div>
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
                            <div className="flex gap-2">
                              <span
                                onClick={(e) =>
                                  handleAddressClick(item.walletAddress, e)
                                }
                                className="text-blue-400 cursor-pointer hover:text-blue-300 transition-colors"
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
                                  className="w-4 h-4"
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
                      <td className="py-4 px-6 text-center text-base">
                        {item.pot2PumpLaunchCount}
                      </td>
                      <td className="py-4 px-6 text-center text-base">
                        {item.participateCount}
                      </td>
                      <td className="py-4 px-6 text-center text-base">
                        $
                        {formatNumberWithUnit(
                          parseFloat(item.totalDepositPot2pumpUSD)
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="px-6 py-4 flex justify-end border-t border-gray-700">
          <div className="flex items-center gap-6 max-w-[400px]">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3a3a3a] transition-colors"
              >
                <svg
                  className="w-4 h-4"
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
                Previous
              </button>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Page</span>
                <span className="px-3 py-1 bg-[#1a1a1a] rounded text-white min-w-[40px] text-center">
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
                className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3a3a3a] transition-colors"
              >
                Next
                <svg
                  className="w-4 h-4"
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
              <div className="flex items-center gap-2 text-gray-400">
                <svg
                  className="animate-spin h-4 w-4"
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

export default Pot2PumpLeaderboard;
