import { wallet } from '@honeypot/shared/lib/wallet';
import { getSingleVaultDetails, Token } from '@honeypot/shared';
import { useEffect, useState, useMemo } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/algebra/ui/button';
import { getVaultPageData } from '@/lib/algebra/graphql/clients/vaults';
import { VaultsSortedByHoldersQuery } from '@/lib/algebra/graphql/generated/graphql';
import { ICHIVaultContract } from '@honeypot/shared';
import VaultRow from './VaulltRow';
import { useSubgraphClient } from '@honeypot/shared';
import VaultCard from './VaultCard';
import { Skeleton } from '@nextui-org/react';

type SortField =
  | 'pair'
  | 'allow_token'
  | 'address'
  | 'tvl'
  | 'volume'
  | 'fees'
  | 'apr';
type SortDirection = 'asc' | 'desc';

interface AllAquaberaVaultsProps {
  searchString?: string;
  sortBy?: string;
  onDataLoaded?: () => void;
  prefetchedData?: VaultsSortedByHoldersQuery | null;
  prefetchedContracts?: ICHIVaultContract[] | null;
}

export function AllAquaberaVaults({
  searchString = '',
  sortBy = 'apr',
  onDataLoaded,
  prefetchedData,
  prefetchedContracts,
}: AllAquaberaVaultsProps) {
  const [vaults, setVaults] = useState<VaultsSortedByHoldersQuery | undefined>(prefetchedData || undefined);
  const [vaultsContracts, setVaultsContracts] = useState<ICHIVaultContract[]>(prefetchedContracts || []);

  // Cache configuration
  const CACHE_KEY_PREFIX = 'vault-cache-';
  const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

  // Generate cache key based on vaults data
  const cacheKey = useMemo(() => {
    if (!vaults?.ichiVaults?.length) return '';
    return `${wallet.currentChainId}-${vaults.ichiVaults
      .map((v) => v.id)
      .join('-')}`;
  }, [vaults]);



  // Load vault contracts from localStorage cache
  const getVaultsFromLocalStorage = () => {
    if (!cacheKey) return;

    try {
      const storageKey = `${CACHE_KEY_PREFIX}${cacheKey}`;
      const cached = localStorage.getItem(storageKey);

      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;

        if (age < CACHE_EXPIRY_MS && data?.length > 0) {
          // Convert lightweight cache back to proper vault objects with Token instances
          const reconstructedVaults = data.map((cached: any) => {
            const token0 = cached.token0
              ? Token.getToken({
                address: cached.token0.address,
                chainId: wallet.currentChainId.toString(),
                name: cached.token0.name,
                symbol: cached.token0.symbol,
                decimals: cached.token0.decimals,
              })
              : null;

            const token1 = cached.token1
              ? Token.getToken({
                address: cached.token1.address,
                chainId: wallet.currentChainId.toString(),
                name: cached.token1.name,
                symbol: cached.token1.symbol,
                decimals: cached.token1.decimals,
              })
              : null;

            // Initialize tokens immediately for TokenLogo component
            if (token0) {
              token0.init(false, { loadIndexerTokenData: true });
            }
            if (token1) {
              token1.init(false, { loadIndexerTokenData: true });
            }

            return {
              ...cached,
              token0,
              token1,
            };
          });

          setVaultsContracts(reconstructedVaults);
          setIsLoadingFromCache(false);
        }
      }
    } catch (error) {
      console.error('Cache load error:', error);
    }
  };

  useEffect(() => {
    getVaultsFromLocalStorage();
  }, [cacheKey]);

  const [sortField, setSortField] = useState<SortField>(sortBy as SortField);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const infoClient = useSubgraphClient('algebra_info');

  useEffect(() => {
    const initVaults = async () => {
      if (!wallet.isInit || !infoClient) return;

      // If we have prefetched data and no search string
      if (prefetchedData && !searchString) {
        setVaults(prefetchedData);
        if (onDataLoaded) {
          onDataLoaded();
        }
        return;
      }

      // If prefetched data is null (cleared), reset vaults state
      if (prefetchedData === null && !searchString) {
        setVaults(undefined);
      }

      try {
        // Load data regardless of searchString
        const res = await getVaultPageData(infoClient, searchString);
        setVaults(res);

        if (onDataLoaded) {
          onDataLoaded();
        }
      } catch (error) {
        console.error('Error loading vaults:', error);
      }
    };

    initVaults();
  }, [searchString, onDataLoaded, infoClient, prefetchedData]);

  // Update vault contracts when prefetched contracts change
  useEffect(() => {
    if (prefetchedContracts && prefetchedContracts.length > 0) {
      setVaultsContracts(prefetchedContracts);
    } else if (prefetchedContracts === null) {
      // Clear contracts when prefetched data is cleared (chain change)
      setVaultsContracts([]);
    }
  }, [prefetchedContracts]);

  useEffect(() => {
    if (!vaults?.ichiVaults?.length || !infoClient || !cacheKey) {
      return;
    }



    // Skip if we already have prefetched contract data
    if (prefetchedContracts && prefetchedContracts.length > 0) {
     
      setVaultsContracts(prefetchedContracts);
      return;
    }

    // Skip if we already have loaded data
    if (vaultsContracts.length > 0) {
      return;
    }

    const storageKey = `${CACHE_KEY_PREFIX}${cacheKey}`;

    getVaultsFromLocalStorage();
    
    setIsLoadingFromCache(true);

    const initializeVaultsWithDetailsFromSubgraph = async () => {
      try {
        // Process vaults in parallel for better performance
        const vaultPromises = vaults.ichiVaults.map(async (vault: any) => {
          try {
            const vaultContract = await getSingleVaultDetails(
              infoClient,
              vault.id
            );

            if (vaultContract) {
              // Load additional vault data in parallel
              await Promise.all([
                vaultContract.getTotalAmounts(),
                vaultContract.getTotalSupply(),
                vaultContract.getBalanceOf(wallet.account),
                // Initialize tokens in parallel too
                vaultContract.token0?.init(false, {
                  loadIndexerTokenData: true,
                }),
                vaultContract.token1?.init(false, {
                  loadIndexerTokenData: true,
                }),
              ]);

              return vaultContract;
            }
            return null;
          } catch (error) {
            console.error(`Error loading vault ${vault.id}:`, error);
            return null;
          }
        });

        // Wait for all vaults to be processed in parallel
        const results = await Promise.all(vaultPromises);

        // Filter out null results
        const validVaults = results.filter(
          (vault): vault is ICHIVaultContract => vault !== null
        );

        // Save to localStorage for persistence across tab switches
        try {
          // Only cache the essential display fields (no BigInt issues!)
          const lightweightCache = validVaults.map((vault) => ({
            // Essential fields for display
            address: vault.address,
            apr: vault.apr,
            detailedApr: vault.detailedApr,
            tvlUSD: vault.tvlUSD,

            // Token info for display
            token0: vault.token0
              ? {
                address: vault.token0.address,
                symbol: vault.token0.symbol,
                name: vault.token0.name,
                decimals: vault.token0.decimals,
                logoURI: vault.token0.logoURI,
              }
              : null,

            token1: vault.token1
              ? {
                address: vault.token1.address,
                symbol: vault.token1.symbol,
                name: vault.token1.name,
                decimals: vault.token1.decimals,
                logoURI: vault.token1.logoURI,
              }
              : null,

            // Pool data for display
            pool: vault.pool
              ? {
                volume_24h_USD: vault.pool.volume_24h_USD,
                fees_24h_USD: vault.pool.fees_24h_USD,
              }
              : null,

            // Basic vault info
            name: vault.name,
            fee: vault.fee,
            allowToken0: vault.allowToken0,
            allowToken1: vault.allowToken1,
            vaultTag: vault.vaultTag, // Add vault badge/tag
          }));

          const cacheData = {
            data: lightweightCache,
            timestamp: Date.now(),
          };

          localStorage.setItem(storageKey, JSON.stringify(cacheData));
        } catch (error) {
          console.error('Error saving to localStorage:', error);
        }

        setVaultsContracts(validVaults);
      } catch (error) {
        console.error('Error initializing vaults:', error);
      } finally {
        setIsLoadingFromCache(false);
      }
    };

    initializeVaultsWithDetailsFromSubgraph();
  }, [vaults, infoClient, cacheKey]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const pages = useMemo(() => {
    if (!vaultsContracts.length) return 0;

    // Calculate pages based on filtered results
    let filteredCount = vaultsContracts.length;
    if (searchString) {
      filteredCount = vaultsContracts.filter((vault) => {
        const token0Symbol = vault.token0?.symbol?.toLowerCase() || '';
        const token1Symbol = vault.token1?.symbol?.toLowerCase() || '';
        const searchLower = searchString.toLowerCase();

        return (
          token0Symbol.includes(searchLower) ||
          token1Symbol.includes(searchLower) ||
          vault.address.toLowerCase().includes(searchLower)
        );
      }).length;
    }

    return Math.ceil(filteredCount / rowsPerPage);
  }, [vaultsContracts, searchString]);

  const [sortedVaults, setSortedVaults] = useState<ICHIVaultContract[]>([]);
  const [isLoadingFromCache, setIsLoadingFromCache] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const isLoading = useMemo(() => {
    const hasData = vaultsContracts.length > 0;
    const hasPrefetchedData = prefetchedContracts && prefetchedContracts.length > 0;
    
    // If we have prefetched data or actual data, never show loading
    if (hasData || hasPrefetchedData) {
      return false;
    }

    return isLoadingFromCache;
  }, [vaultsContracts.length, isLoadingFromCache, prefetchedContracts]);

  // Handle search changes - reset page and show loading state
  useEffect(() => {
    setPage(1);

    // Handle search loading state
    if (searchString) {
      setIsSearching(true);

      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 50); //50 ms

      return () => clearTimeout(timer);
    } else {
      setIsSearching(false);
    }
  }, [searchString]);

  const sortAndFilter = () => {
    // Filter vaults based on search string
    let filteredVaults = vaultsContracts;
    if (searchString) {
      filteredVaults = vaultsContracts.filter((vault) => {
        const token0Symbol = vault.token0?.symbol?.toLowerCase() || '';
        const token1Symbol = vault.token1?.symbol?.toLowerCase() || '';
        const searchLower = searchString.toLowerCase();

        return (
          token0Symbol.includes(searchLower) ||
          token1Symbol.includes(searchLower) ||
          vault.address.toLowerCase().includes(searchLower)
        );
      });
    }

    const sortedVaults = [...filteredVaults].sort((a, b) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1;

      switch (sortField) {
        case 'pair': {
          const aSymbol = a.token0?.symbol || '';
          const bSymbol = b.token0?.symbol || '';
          return multiplier * aSymbol.localeCompare(bSymbol);
        }
        case 'allow_token': {
          const aSymbol = a.token0?.symbol || '';
          const bSymbol = b.token0?.symbol || '';
          return multiplier * aSymbol.localeCompare(bSymbol);
        }
        case 'address':
          return multiplier * a.address.localeCompare(b.address);
        case 'tvl':
          return multiplier * (Number(a.tvlUSD || 0) - Number(b.tvlUSD || 0));
        case 'volume':
          return (
            multiplier *
            (Number(a.pool?.volume_24h_USD || 0) -
              Number(b.pool?.volume_24h_USD || 0))
          );
        case 'fees':
          return (
            multiplier *
            (Number(a.pool?.fees_24h_USD || 0) -
              Number(b.pool?.fees_24h_USD || 0))
          );
        case 'apr':
          return multiplier * (Number(a.apr || 0) - Number(b.apr || 0));
        default:
          return 0;
      }
    });

    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedVaults = sortedVaults.slice(start, end);

    // 无论是否有数据，都更新排序后的列表
    setSortedVaults(paginatedVaults);
  };

  useEffect(() => {
    if (!vaultsContracts.length) return;
    sortAndFilter();
  }, [vaultsContracts, sortField, sortDirection, page, searchString]);

  return (
    <div className="w-full">
      {/* Mobile view - card layout for small screens */}
      <div className="sm:hidden">
        {!isLoading && !isSearching ? (
          vaultsContracts.length === 0 ? (
            <>
              <div className="text-center py-8 text-black">
                No vaults available.
              </div>
            </>
          ) : !sortedVaults.length ? (
            <>
              <div className="text-center py-8 text-black">
                No results match your criteria.
              </div>
            </>
          ) : (
            <>
              {sortedVaults.map((vault) => (
                <VaultCard key={vault.address} vault={vault} />
              ))}
            </>
          )
        ) : (
          <>
            {/* Show 5 skeleton loading cards for mobile */}
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={`mobile-loading-${index}`} className="mb-4">
                <Skeleton className="h-64 bg-white custom-dashed-3xl" />
              </div>
            ))}
          </>
        )}
      </div>

      {/* Desktop view - table layout for medium screens and up */}
      <div className="hidden sm:block w-full overflow-x-auto custom-dashed-3xl sm:p-6 sm:bg-[#271A0C]">
        <table className="w-full">
          <thead>
            <tr>
              <th className="py-4 px-6 cursor-pointer text-[#4D4D4D]">
                <div
                  className="flex items-center gap-2"
                  onClick={() => handleSort('pair')}
                >
                  <span>Token Pair</span>
                  <div className="flex flex-col">
                    <ChevronUp
                      className={`h-3 w-3 ${sortField === 'pair' && sortDirection === 'asc'
                        ? 'text-black'
                        : 'text-[#4D4D4D]'
                        }`}
                    />
                    <ChevronDown
                      className={`h-3 w-3 ${sortField === 'pair' && sortDirection === 'desc'
                        ? 'text-black'
                        : 'text-[#4D4D4D]'
                        }`}
                    />
                  </div>
                </div>
              </th>
              <th className="py-4 px-6 cursor-pointer text-[#4D4D4D] min-w-[180px]">
                <div
                  className="flex items-center gap-2"
                  onClick={() => handleSort('pair')}
                >
                  <span>Allow Token</span>
                  <div className="flex flex-col">
                    <ChevronUp
                      className={`h-3 w-3 ${sortField === 'pair' && sortDirection === 'asc'
                        ? 'text-black'
                        : 'text-[#4D4D4D]'
                        }`}
                    />
                    <ChevronDown
                      className={`h-3 w-3 ${sortField === 'pair' && sortDirection === 'desc'
                        ? 'text-black'
                        : 'text-[#4D4D4D]'
                        }`}
                    />
                  </div>
                </div>
              </th>
              <th className="py-4 px-6 cursor-pointer text-right text-[#4D4D4D]">
                <div
                  className="flex items-center gap-2 justify-end"
                  onClick={() => handleSort('tvl')}
                >
                  <span>Vault TVL</span>
                  <div className="flex flex-col">
                    <ChevronUp
                      className={`h-3 w-3 ${sortField === 'tvl' && sortDirection === 'asc'
                        ? 'text-black'
                        : 'text-[#4D4D4D]'
                        }`}
                    />
                    <ChevronDown
                      className={`h-3 w-3 ${sortField === 'tvl' && sortDirection === 'desc'
                        ? 'text-black'
                        : 'text-[#4D4D4D]'
                        }`}
                    />
                  </div>
                </div>
              </th>
              <th className="py-4 px-6 cursor-pointer text-right text-[#4D4D4D]">
                <div
                  className="flex items-center gap-2 justify-end"
                  onClick={() => handleSort('volume')}
                >
                  <span>Pool 24h Volume</span>
                  <div className="flex flex-col">
                    <ChevronUp
                      className={`h-3 w-3 ${sortField === 'volume' && sortDirection === 'asc'
                        ? 'text-black'
                        : 'text-[#4D4D4D]'
                        }`}
                    />
                    <ChevronDown
                      className={`h-3 w-3 ${sortField === 'volume' && sortDirection === 'desc'
                        ? 'text-black'
                        : 'text-[#4D4D4D]'
                        }`}
                    />
                  </div>
                </div>
              </th>
              <th className="py-4 px-6 cursor-pointer text-right text-[#4D4D4D]">
                <div
                  className="flex items-center gap-2 justify-end"
                  onClick={() => handleSort('fees')}
                >
                  <span>Pool 24h Fees</span>
                  <div className="flex flex-col">
                    <ChevronUp
                      className={`h-3 w-3 ${sortField === 'fees' && sortDirection === 'asc'
                        ? 'text-black'
                        : 'text-[#4D4D4D]'
                        }`}
                    />
                    <ChevronDown
                      className={`h-3 w-3 ${sortField === 'fees' && sortDirection === 'desc'
                        ? 'text-black'
                        : 'text-[#4D4D4D]'
                        }`}
                    />
                  </div>
                </div>
              </th>
              <th className="py-4 px-6 cursor-pointer text-right text-[#4D4D4D]">
                <div
                  className="flex items-center gap-2 justify-end"
                  onClick={() => handleSort('apr')}
                >
                  <span>APR</span>
                  <div className="flex flex-col">
                    <ChevronUp
                      className={`h-3 w-3 ${sortField === 'apr' && sortDirection === 'asc'
                        ? 'text-black'
                        : 'text-[#4D4D4D]'
                        }`}
                    />
                    <ChevronDown
                      className={`h-3 w-3 ${sortField === 'apr' && sortDirection === 'desc'
                        ? 'text-black'
                        : 'text-[#4D4D4D]'
                        }`}
                    />
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#4D4D4D]">
            {isLoading || isSearching ? (
              // Show 10 skeleton loading rows
              Array.from({ length: 10 }).map((_, index) => (
                <tr key={`loading-${index}`}>
                  <td colSpan={6}>
                    <Skeleton className="h-12 bg-yellow-500" />
                  </td>
                </tr>
              ))
            ) : !sortedVaults.length ? (
              <tr className="hover:bg-white border-white h-full">
                <td colSpan={6} className="h-24 text-center text-black">
                  No results.
                </td>
              </tr>
            ) : (
              sortedVaults.map((vault) => {
                return <VaultRow key={vault.address} vault={vault} />;
              })
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && !isSearching && (
        <div className="py-4">
          <div className="flex flex-row justify-between items-center gap-4">
            <span className="text-black text-sm">
              Page {page} of {pages}
            </span>
            <div className="flex gap-x-2">
              <Button
                className="border border-[#2D2D2D] bg-white hover:bg-gray-50 text-black rounded-2xl shadow-[2px_2px_0px_0px_#000] px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                className="border border-[#2D2D2D] bg-white hover:bg-gray-50 text-black rounded-2xl shadow-[2px_2px_0px_0px_#000] px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm"
                disabled={page === pages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllAquaberaVaults;
