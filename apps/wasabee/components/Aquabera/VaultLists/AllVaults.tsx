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
import { useAccount } from 'wagmi';
import { ProcessedVault } from '@/lib/cache/vaults-cache';

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
  prefetchedProcessedVaults?: ProcessedVault[] | null;
  prfetchedDataChainId: number | undefined;
}

export function AllAquaberaVaults({
  searchString = '',
  sortBy = 'apr',
  onDataLoaded,
  prefetchedData,
  prefetchedContracts,
  prefetchedProcessedVaults,
  prfetchedDataChainId,
}: AllAquaberaVaultsProps) {
  const { chainId } = useAccount();
  const [vaults, setVaults] = useState<VaultsSortedByHoldersQuery | undefined>(
    undefined
  );
  const [vaultsContracts, setVaultsContracts] = useState<ICHIVaultContract[]>(
    []
  );
  const [processedVaults, setProcessedVaults] = useState<ProcessedVault[]>(
    []
  );
  const [isLoadingCachedData, setIsLoadingCachedData] = useState(false);
  const [cacheError, setCacheError] = useState<string | null>(null);

  // Cache configuration
  const CACHE_KEY_PREFIX = chainId;
  const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

  // Generate cache key based on vaults data
  const cacheKey = useMemo(() => {
    if (!vaults?.ichiVaults?.length) return '';
    return `${chainId}-${vaults.ichiVaults
      .map((v) => v.id)
      .join('-')}`;
  }, [vaults]);

  // Fetch cached vault data from API
  const fetchCachedVaultData = async () => {
    if (!chainId) return;

    try {
      setIsLoadingCachedData(true);
      setCacheError(null);
      
      console.log(`Fetching cached vault data for chain ${chainId}...`);
      console.log(`Current chainId from useAccount: ${chainId}, type: ${typeof chainId}`);
      const startTime = Date.now();
      
      // Add a timeout to avoid long waits
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      try {
        const response = await fetch(`/api/vaults/cached?chainId=${chainId}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch cached vault data: ${response.statusText}`);
        }

        const data = await response.json();
        const endTime = Date.now();
        
        console.log(`Cached vault data fetched in ${endTime - startTime}ms for chain ${chainId}`);
        console.log(`Received ${data.vaults?.length || 0} vaults from chain ${data.chainId}`);
        
        if (data.success && data.vaults) {
          setProcessedVaults(data.vaults);
          if (onDataLoaded) {
            onDataLoaded();
          }
        } else {
          throw new Error('Invalid response format');
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      console.error('Error fetching cached vault data:', error);
      setCacheError(error instanceof Error ? error.message : 'Unknown error');
      
      // Fallback strategies
      if (prefetchedProcessedVaults && prefetchedProcessedVaults.length > 0) {
        console.log('💾 Using prefetched processed vaults as fallback');
        setProcessedVaults(prefetchedProcessedVaults);
      } else if (prefetchedContracts && prefetchedContracts.length > 0) {
        console.log('💾 Using prefetched contracts as fallback');
        setVaultsContracts(prefetchedContracts);
      } else {
        console.log('❌ No fallback data available, will trigger subgraph fetch');
        // Clear error to allow subgraph fetching
        setCacheError(null);
      }
    } finally {
      setIsLoadingCachedData(false);
    }
  };

  useEffect(() => {
    console.log('🔄 AllVaults useEffect triggered', {
      chainId,
      hasPrefetchedProcessedVaults: !!prefetchedProcessedVaults,
      prefetchedProcessedVaultsLength: prefetchedProcessedVaults?.length || 0,
      prfetchedDataChainId,
      chainsMatch: prfetchedDataChainId === chainId
    });

    setVaults(undefined);
    setVaultsContracts([]);
    setProcessedVaults([]);
    setCacheError(null);
    
    // Priority 1: Use prefetched processed vaults (fastest)
    if (
      prefetchedProcessedVaults &&
      prfetchedDataChainId === chainId &&
      prefetchedProcessedVaults.length > 0
    ) {
      console.log('✅ Using prefetched processed vaults', prefetchedProcessedVaults.length);
      setProcessedVaults(prefetchedProcessedVaults);
      if (onDataLoaded) {
        onDataLoaded();
      }
      return;
    }

    // Priority 2: Fetch from cached API
    console.log('🔄 Fetching from cached API...');
    fetchCachedVaultData();

  }, [chainId])

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
                chainId: chainId?.toString() || '80084',
                name: cached.token0.name,
                symbol: cached.token0.symbol,
                decimals: cached.token0.decimals,
              })
              : null;

            const token1 = cached.token1
              ? Token.getToken({
                address: cached.token1.address,
                chainId: chainId?.toString() || '80084',
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

  // Fetch from subgraph as fallback when cache fails or for search
  useEffect(() => {
    const initVaults = async () => {
      // Skip if we already have data
      if (processedVaults.length > 0 || vaultsContracts.length > 0) return;
      
      // Skip if still loading cached data
      if (isLoadingCachedData) return;
      
      // Skip if no wallet/client
      if (!wallet.isInit || !infoClient) return;
      
      // Only fetch from subgraph in these cases:
      // 1. When searching (searchString exists)
      // 2. When cache failed and we have no data (cacheError exists and no processedVaults)
      const shouldFetchFromSubgraph = searchString || (cacheError && processedVaults.length === 0);
      
      if (!shouldFetchFromSubgraph) return;

      try {
        console.log(`🔄 Fetching from subgraph - searchString: "${searchString}", cacheError: ${!!cacheError}`);
        const res = await getVaultPageData(infoClient, searchString);
        setVaults(res);

        if (onDataLoaded) {
          onDataLoaded();
        }
      } catch (error) {
        console.error('Error loading vaults from subgraph:', error);
      }
    };

    initVaults();
  }, [searchString, onDataLoaded, infoClient, processedVaults.length, vaultsContracts.length, isLoadingCachedData, cacheError]);

  useEffect(() => {
    if (!vaults?.ichiVaults?.length || !infoClient || !cacheKey) {
      return;
    }





    // Skip if we already have loaded data
    if (vaultsContracts.length > 0) {
      return;
    }

    const storageKey = `${CACHE_KEY_PREFIX}${cacheKey}`;



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
    const sourceVaults = processedVaults.length > 0 
      ? processedVaults.map(convertProcessedToContract)
      : vaultsContracts;
      
    if (!sourceVaults.length) return 0;

    // Calculate pages based on filtered results
    let filteredCount = sourceVaults.length;
    if (searchString) {
      filteredCount = sourceVaults.filter((vault) => {
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
  }, [vaultsContracts, processedVaults, searchString]);

  const [sortedVaults, setSortedVaults] = useState<any[]>([]);
  const [isLoadingFromCache, setIsLoadingFromCache] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const isLoading = useMemo(() => {
    const hasData = vaultsContracts.length > 0 || processedVaults.length > 0;
    const hasPrefetchedData = (prefetchedContracts && prefetchedContracts.length > 0) || 
                              (prefetchedProcessedVaults && prefetchedProcessedVaults.length > 0);

    // If we have prefetched data or actual data, never show loading
    if (hasData || hasPrefetchedData) {
      return false;
    }

    // Show loading if we're fetching cached data or loading from cache
    return isLoadingCachedData || isLoadingFromCache;
  }, [vaultsContracts.length, processedVaults.length, isLoadingCachedData, isLoadingFromCache, prefetchedContracts, prefetchedProcessedVaults]);

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

  // Convert processed vault to compatible format for display
  const convertProcessedToContract = (vault: ProcessedVault): any => {
    // Create a minimal vault-like object for display purposes
    return {
      address: vault.address,
      apr: vault.apr,
      detailedApr: vault.detailedApr,
      tvlUSD: vault.tvlUSD,
      token0: vault.token0 ? {
        address: vault.token0.id,
        symbol: vault.token0.symbol,
        name: vault.token0.name,
        decimals: vault.token0.decimals,
        logoURI: vault.token0.logoURI,
      } : null,
      token1: vault.token1 ? {
        address: vault.token1.id,
        symbol: vault.token1.symbol,
        name: vault.token1.name,
        decimals: vault.token1.decimals,
        logoURI: vault.token1.logoURI,
      } : null,
      pool: vault.pool,
      name: vault.name,
      fee: vault.fee,
      allowToken0: vault.allowToken0,
      allowToken1: vault.allowToken1,
      vaultTag: vault.vaultTag,
    };
  };

  const sortAndFilter = () => {
    // Prioritize processed vaults, fallback to vault contracts
    const sourceVaults = processedVaults.length > 0 
      ? processedVaults.map(convertProcessedToContract)
      : vaultsContracts;

    // Filter vaults based on search string
    let filteredVaults = sourceVaults;
    if (searchString) {
      filteredVaults = sourceVaults.filter((vault) => {
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
    if (!vaultsContracts.length && !processedVaults.length) return;
    sortAndFilter();
  }, [vaultsContracts, processedVaults, sortField, sortDirection, page, searchString]);

  return (
    <div className="w-full">
      {/* Mobile view - card layout for small screens */}
      <div className="sm:hidden bg-[#140D06] rounded-2xl border border-[#2a2318] p-4">
        {cacheError && (
          <div className="text-center py-4 text-red-500 mb-4">
            <p>Error loading vaults: {cacheError}</p>
            <button 
              onClick={() => fetchCachedVaultData()} 
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
            >
              Retry
            </button>
          </div>
        )}
        {!isLoading && !isSearching ? (
          vaultsContracts.length === 0 && processedVaults.length === 0 ? (
            <>
              <div className="text-center py-8 text-gray-500">
                No vaults available.
                {/* Debug info */}
                <div className="text-xs mt-2 text-gray-400">
                  Chain: {chainId}, Loading: {isLoadingCachedData.toString()}, Error: {cacheError || 'none'}
                </div>
              </div>
            </>
          ) : !sortedVaults.length ? (
            <>
              <div className="text-center py-8 text-gray-500">
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
      <div className="hidden sm:block w-full bg-[#140D06] rounded-2xl border border-[#2a2318] p-6 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left text-sm text-gray-500 font-normal pb-4 cursor-pointer">
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
              <th className="text-left text-sm text-gray-500 font-normal pb-4 cursor-pointer min-w-[180px]">
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
              <th className="text-left text-sm text-gray-500 font-normal pb-4 cursor-pointer">
                <div
                  className="flex items-center gap-1 justify-end"
                  onClick={() => handleSort('tvl')}
                >
                  <span>Vault TVL</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </th>
              <th className="text-left text-sm text-gray-500 font-normal pb-4 cursor-pointer">
                <div
                  className="flex items-center gap-1 justify-end"
                  onClick={() => handleSort('volume')}
                >
                  <span>Pool 24h Volume</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </th>
              <th className="text-left text-sm text-gray-500 font-normal pb-4 cursor-pointer">
                <div
                  className="flex items-center gap-1 justify-end"
                  onClick={() => handleSort('fees')}
                >
                  <span>Pool 24h Fees</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </th>
              <th className="text-left text-sm text-gray-500 font-normal pb-4 cursor-pointer">
                <div
                  className="flex items-center gap-1 justify-end"
                  onClick={() => handleSort('apr')}
                >
                  <span>APR</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
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
              <tr className="h-full">
                <td colSpan={6} className="h-24 text-center text-gray-500">
                  No results.
                </td>
              </tr>
            ) : (
              sortedVaults.map((vault, index) => {
                return <VaultRow key={vault.address} vault={vault} index={index} />;
              })
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && !isSearching && (
        <div className="py-4">
          <div className="flex flex-row justify-between items-center gap-4">
            <span className="text-gray-500 text-sm">
              Page {page} of {pages}
            </span>
            <div className="flex gap-x-2">
              <Button
                className="border border-[#2a2318] bg-[#1F1409] hover:bg-[#241809] text-white rounded-lg px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                className="border border-[#2a2318] bg-[#1F1409] hover:bg-[#241809] text-white rounded-lg px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm"
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
