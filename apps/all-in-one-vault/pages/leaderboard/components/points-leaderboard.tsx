import { useState, useMemo, useEffect } from 'react';
import { debounce } from 'lodash';
import { Tabs, Tab, Link, Tooltip } from '@nextui-org/react';
import {
  fetchLoyaltyAccounts,
  LoyaltyAccount,
  CURRENCY_IDS,
  getCurrencyName,
} from '../services/snagSolutionsApi';

interface CurrencyLeaderboardProps {
  currencyId: string;
  currencyName: string;
}

const CurrencyLeaderboard = ({
  currencyId,
  currencyName,
}: CurrencyLeaderboardProps) => {
  const [searchInput, setSearchInput] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [accounts, setAccounts] = useState<LoyaltyAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [startingAfter, setStartingAfter] = useState<string | undefined>(
    undefined
  );
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Create debounced search handler
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchAddress(value);
        setPage(1);
        setStartingAfter(undefined);
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
    setStartingAfter(undefined);
  };

  // Handle address click to populate search
  const handleAddressClick = (address: string, e: React.MouseEvent) => {
    e.preventDefault();
    setSearchInput(address);
    debouncedSearch(address);
  };

  // Fetch accounts
  useEffect(() => {
    const loadAccounts = async () => {
      setLoading(true);
      try {
        const response = await fetchLoyaltyAccounts({
          loyaltyCurrencyId: currencyId,
          limit: pageSize,
          startingAfter,
          sortDir: 'desc',
          walletAddress: searchAddress || undefined,
        });
        console.log('Loyalty accounts response:', response);
        console.log('Currency ID:', currencyId);
        console.log('Accounts data:', response.data);
        setAccounts(response.data || []);
        setHasMore(response.hasNextPage);
      } catch (error) {
        console.error('Failed to fetch loyalty accounts:', error);
        console.error('Error details:', error);
        setAccounts([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, [currencyId, startingAfter, searchAddress]);

  // Handle pagination
  const handleNextPage = () => {
    if (accounts.length > 0 && hasMore) {
      const lastAccount = accounts[accounts.length - 1];
      setStartingAfter(lastAccount.id);
      setPage((p) => p + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setStartingAfter(undefined);
      setPage(1);
    }
  };

  const shortenAddressString = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatPoints = (amount: number) => {
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="w-full">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#FFCD4D] to-[#FFA500] rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold text-black mb-1">
              Finish missions to earn more points!
            </h3>
            <p className="text-black/80 text-sm">
              Complete tasks and climb the leaderboard
            </p>
          </div>
          <Link
            href="https://points.honeypotfinance.xyz"
            target="_blank"
            className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-black/90 transition-colors whitespace-nowrap"
          >
            View Missions
          </Link>
        </div>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 mb-6">
        <div className="bg-[#202020] rounded-2xl p-5">
          <div className="text-gray-400 text-sm mb-2">Currency Type</div>
          <div className="text-white text-xl font-medium">{currencyName}</div>
        </div>
      </div>

      {/* Search Bar */}
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
              : loading
              ? 'Searching...'
              : accounts.length > 0
              ? `Found ${accounts.length} results`
              : 'No results found'}
          </div>
        )}
      </div>

      {/* Leaderboard Table */}
      <div className="bg-[#202020] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#5C5C5C]">
          <h2 className="text-xl text-white font-bold">
            {currencyName} Leaderboard
          </h2>
        </div>
        <div className="p-6">
          <div className="border border-[#5C5C5C] rounded-lg overflow-auto">
            <table className="w-full">
              <thead className="bg-[#323232] text-white border-b border-[#5C5C5C]">
                <tr>
                  <th className="py-4 px-6 text-left text-base font-medium whitespace-nowrap">
                    Rank
                  </th>
                  <th className="py-4 px-6 text-left text-base font-medium whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-[#FFCD4D] rounded"></div>
                      Address
                    </div>
                  </th>
                  <th className="py-4 px-6 text-center text-base font-medium whitespace-nowrap">
                    Points
                  </th>
                </tr>
              </thead>
              <tbody className="text-white divide-y divide-[#5C5C5C]">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="py-4 px-6 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : accounts.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-4 px-6 text-center">
                      No data available
                    </td>
                  </tr>
                ) : (
                  accounts.map((account, index) => {
                    const walletAddress =
                      account.user?.walletAddress || 'Unknown';
                    const rank = (page - 1) * pageSize + index + 1;

                    return (
                      <tr
                        key={account.id}
                        className="hover:bg-[#2a2a2a] transition-colors"
                      >
                        <td className="py-4 px-6 text-base">
                          {rank}
                        </td>
                        <td className="py-4 px-6 text-base font-mono text-blue-400">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-[#FFCD4D] rounded"></div>
                            {walletAddress !== 'Unknown' ? (
                              <Tooltip
                                content={
                                  <div className="text-center">
                                    <div>{walletAddress}</div>
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
                                      handleAddressClick(walletAddress, e)
                                    }
                                    className="text-blue-400 cursor-pointer hover:text-blue-300 transition-colors"
                                  >
                                    {shortenAddressString(walletAddress)}
                                  </span>
                                  <Link
                                    href={`https://berascan.com/address/${walletAddress}`}
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
                            ) : (
                              <span className="text-gray-500">Unknown</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center text-base">
                          {formatPoints(account.amount)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="px-6 py-4 flex justify-end border-t border-gray-700">
          <div className="flex items-center gap-6 max-w-[400px]">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePreviousPage}
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
                onClick={handleNextPage}
                disabled={!hasMore || loading}
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

            {loading && (
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

const PointsLeaderboard = () => {
  const [selectedCurrency, setSelectedCurrency] = useState<string>('lp');

  return (
    <div className="w-full">
      <Tabs
        selectedKey={selectedCurrency}
        onSelectionChange={(key) => setSelectedCurrency(key.toString())}
        className="w-full"
        classNames={{
          tabList: 'bg-[#1a1a1a] border border-[#5C5C5C] rounded-lg',
          tab: 'text-white data-[selected=true]:text-[#FFCD4D]',
          tabContent: 'text-white',
          panel: 'pt-6',
        }}
      >
        <Tab key="lp" title="LP Points">
          <CurrencyLeaderboard
            currencyId={CURRENCY_IDS.LP_POINTS}
            currencyName={getCurrencyName(CURRENCY_IDS.LP_POINTS)}
          />
        </Tab>
        <Tab key="dex" title="DEX Points">
          <CurrencyLeaderboard
            currencyId={CURRENCY_IDS.DEX_POINTS}
            currencyName={getCurrencyName(CURRENCY_IDS.DEX_POINTS)}
          />
        </Tab>
        <Tab key="social" title="Social Points">
          <CurrencyLeaderboard
            currencyId={CURRENCY_IDS.SOCIAL_POINTS}
            currencyName={getCurrencyName(CURRENCY_IDS.SOCIAL_POINTS)}
          />
        </Tab>
      </Tabs>
    </div>
  );
};

export default PointsLeaderboard;
