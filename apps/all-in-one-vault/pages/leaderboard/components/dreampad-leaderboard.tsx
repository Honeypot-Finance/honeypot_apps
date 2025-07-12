import { useState, useMemo } from 'react';
import { debounce } from 'lodash';
import { Link, Tooltip } from '@nextui-org/react';
import { formatNumberWithUnit } from '@/lib/utils';
import { useLbpLaunchList } from '@honeypot/shared';
import { truncateHash } from '@/lib/algebra/utils/common/truncateHash';
import Image from 'next/image';

interface StatsCard {
  title: string;
  value: string | number;
  subValue?: string;
  decimals?: number;
}

const DreampadLeaderboard = () => {
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
  const { data: lbpData, loading: lbpLoading } = useLbpLaunchList();

  // Process and sort data by total raised amount
  const processedData = useMemo(() => {
    if (!lbpData) return [];

    // Filter by search if needed
    let filteredData = lbpData;
    if (searchAddress) {
      filteredData = lbpData.filter(
        (item) =>
          item.address?.toLowerCase().includes(searchAddress.toLowerCase()) ||
          item.owner?.toLowerCase().includes(searchAddress.toLowerCase())
      );
    }

    // Sort by total raised amount (descending)
    const sortedData = [...filteredData].sort((a, b) => {
      const aRaised = a.fundsRaised?.toNumber() || 0;
      const bRaised = b.fundsRaised?.toNumber() || 0;
      return bRaised - aRaised;
    });

    return sortedData.map((item, index) => ({
      rank: index + 1,
      walletAddress: item.owner,
      projectName: item.shareToken?.name || 'Unknown',
      tokenSymbol: item.shareToken?.symbol || 'N/A',
      totalRaised: item.fundsRaised?.toNumber() || 0,
      assetTokenSymbol: item.assetToken?.symbol || 'BERA',
      status: item.launchStatusDisplay || 'Unknown',
      imageUrl: item.imageUrl,
      pairAddress: item.address,
    }));
  }, [lbpData, searchAddress]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!lbpData) return null;

    const totalProjects = lbpData.length;
    const totalRaised = lbpData.reduce(
      (sum, item) => sum + (item.fundsRaised?.toNumber() || 0),
      0
    );
    const liveProjects = lbpData.filter(
      (item) => item.launchStatusDisplay === 'Started'
    ).length;
    const completedProjects = lbpData.filter(
      (item) =>
        item.launchStatusDisplay === 'Ended' ||
        item.launchStatusDisplay === 'Closed'
    ).length;

    return {
      totalProjects,
      totalRaised,
      liveProjects,
      completedProjects,
    };
  }, [lbpData]);

  const statsCards: StatsCard[] = [
    {
      title: 'Total Projects',
      value: stats?.totalProjects || 0,
      decimals: 0,
    },
    {
      title: 'Total Raised',
      value: stats?.totalRaised || 0,
      decimals: 2,
      subValue: 'BERA',
    },
    {
      title: 'Live Projects',
      value: stats?.liveProjects || 0,
      decimals: 0,
    },
    {
      title: 'Completed Projects',
      value: stats?.completedProjects || 0,
      decimals: 0,
    },
  ];

  // Pagination
  const paginatedData = processedData.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const totalPages = Math.ceil(processedData.length / pageSize);
  const hasMore = page < totalPages;

  return (
    <div className="w-full">
      {/* 顶部统计卡片 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-[#202020] rounded-2xl p-5">
            <div className="text-gray-400 text-sm mb-2">{stat.title}</div>
            <div className="text-white text-xl font-medium">
              {lbpLoading
                ? 'Loading...'
                : stat.subValue
                ? `${formatNumberWithUnit(Number(stat.value))} ${stat.subValue}`
                : formatNumberWithUnit(Number(stat.value))}
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
            placeholder="Search by project address or owner address..."
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
            {lbpLoading
              ? 'Searching...'
              : processedData.length > 0
              ? `Found ${processedData.length} results`
              : 'No results found'}
          </div>
        )}
      </div>

      {/* 交易数据表格 */}
      <div className="bg-[#202020] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#5C5C5C]">
          <h2 className="text-xl text-white font-bold">Dreampad Leaderboard</h2>
        </div>
        <div className="p-6">
          <div className="border border-[#5C5C5C] rounded-lg overflow-auto">
            <table className="w-full">
              <thead className="bg-[#323232] text-white border-b border-[#5C5C5C]">
                <tr>
                  <th className="py-4 px-6 text-left text-base font-medium whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-[#FFCD4D] rounded"></div>
                      Project
                    </div>
                  </th>
                  <th className="py-4 px-6 text-left text-base font-medium whitespace-nowrap">
                    Owner
                  </th>
                  <th className="py-4 px-6 text-center text-base font-medium whitespace-nowrap">
                    Status
                  </th>
                  <th className="py-4 px-6 text-center text-base font-medium whitespace-nowrap">
                    Total Raised
                  </th>
                </tr>
              </thead>
              <tbody className="text-white divide-y divide-[#5C5C5C]">
                {lbpLoading ? (
                  <tr>
                    <td colSpan={4} className="py-4 px-6 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item) => (
                    <tr
                      key={item.pairAddress}
                      className="hover:bg-[#2a2a2a] transition-colors"
                    >
                      <td className="py-4 px-6 text-base">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-[#FFCD4D] rounded"></div>
                          <div className="flex items-center gap-2">
                            <Image
                              src="/images/honey.png"
                              alt={item.projectName}
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {item.projectName}
                              </span>
                              <span className="text-sm text-gray-400">
                                ${item.tokenSymbol}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-base font-mono text-blue-400">
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
                              {truncateHash(item.walletAddress)}
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
                      </td>
                      <td className="py-4 px-6 text-center text-base">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === 'Started'
                              ? 'bg-green-500/20 text-green-400'
                              : item.status === 'Ended' ||
                                item.status === 'Closed'
                              ? 'bg-blue-500/20 text-blue-400'
                              : item.status === 'Not Started'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center text-base font-medium">
                        {formatNumberWithUnit(item.totalRaised)}{' '}
                        {item.assetTokenSymbol}
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
                disabled={!hasMore || lbpLoading}
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

            {lbpLoading && (
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

export default DreampadLeaderboard;
