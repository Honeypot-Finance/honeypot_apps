import { wallet } from '@honeypot/shared/lib/wallet';
import { Token } from '@honeypot/shared';
import { useEffect, useState, useMemo } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/algebra/ui/button';
import { getVaultPageData } from '@/lib/algebra/graphql/clients/vaults';
import { VaultsSortedByHoldersQuery } from '@/lib/algebra/graphql/generated/graphql';
import { ICHIVaultContract } from '@honeypot/shared';
import VaultRow from './VaulltRow';
import { useSubgraphClient } from '@honeypot/shared';
import VaultCard from './VaultCard';
import { useVaultCache } from '@/hooks/useVaultCache';
import { networksMap } from '@honeypot/shared';

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
}

export function AllAquaberaVaults({
  searchString = '',
  sortBy = 'apr',
  onDataLoaded,
}: AllAquaberaVaultsProps) {
  const [vaultsContracts, setVaultsContracts] = useState<ICHIVaultContract[]>(
    []
  );
  const [vaults, setVaults] = useState<VaultsSortedByHoldersQuery>();
  const [isLoading, setIsLoading] = useState(false);
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false);
  const [sortField, setSortField] = useState<SortField>(sortBy as SortField);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const infoClient = useSubgraphClient('algebra_info');
  const { getCachedData, setCachedData, getCacheInfo, getCachedProcessedVaults, setCachedProcessedVaults } = useVaultCache();

  // Get vault tags from chain configuration for immediate display
  const getVaultTagFromConfig = (vaultAddress: string) => {
    const network = networksMap[wallet.currentChainId.toString()];
    if (!network?.validatedVault) {
      return undefined;
    }
    
    const vaultConfig = network.validatedVault.find(
      vault => vault.address.toLowerCase() === vaultAddress.toLowerCase()
    );
    
    return vaultConfig?.vaultTag;
  };

  useEffect(() => {
    const initVaults = async () => {
      if (!wallet.isInit || !infoClient) return;

      // Check cache first
      const cachedData = getCachedData(searchString);
      const cachedProcessedVaults = getCachedProcessedVaults(searchString);
      const cacheInfo = getCacheInfo(searchString);
      
      if (cachedData && !cacheInfo.isStale) {
        // Use cached data immediately
        setVaults(cachedData);
        setIsLoading(false); // Important: Set loading to false for cached data
        
        // If we have cached processed vaults, use them immediately too
        if (cachedProcessedVaults) {
          setVaultsContracts(cachedProcessedVaults);
        }
        
        if (onDataLoaded) {
          onDataLoaded();
        }
        
        // Always update in background for fresh volume/fees data
        setIsBackgroundLoading(true);
        try {
          const freshData = await getVaultPageData(infoClient, searchString);
          setVaults(freshData);
          setCachedData(freshData, searchString);
        } catch (error) {
          console.error('Error updating vaults in background:', error);
        } finally {
          setIsBackgroundLoading(false);
        }
        return;
      }

      // No cache or stale cache - load fresh data
      setIsLoading(true);
      try {
        const res = await getVaultPageData(infoClient, searchString);
        setVaults(res);
        setCachedData(res, searchString);

        if (onDataLoaded) {
          onDataLoaded();
        }
      } catch (error) {
        console.error('Error loading vaults:', error);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };

    initVaults();
  }, [searchString, onDataLoaded, infoClient, getCachedData, getCachedProcessedVaults, getCacheInfo, setCachedData]);

  useEffect(() => {
    if (!wallet.isInit || !vaults?.ichiVaults?.length) {
      return;
    }

    // 清空现有合约列表
    const newVaultsContracts: ICHIVaultContract[] = [];

    vaults.ichiVaults.forEach((vault) => {
      const vaultContract = ICHIVaultContract.getVault({
        token0: Token.getToken({ address: vault.pool?.token0?.id || vault.tokenA.id, chainId: wallet.currentChainId.toString() }),
        token1: Token.getToken({ address: vault.pool?.token1?.id || vault.tokenB.id, chainId: wallet.currentChainId.toString() }),
        address: vault.id as `0x${string}`,
        apr: Number(vault.feeApr_1d),
        detailedApr: {
          feeApr_1d: Number(vault.feeApr_1d),
          feeApr_3d: Number(vault.feeApr_3d),
          feeApr_7d: Number(vault.feeApr_7d),
          feeApr_30d: Number(vault.feeApr_30d),
        },
        allowToken0: vault.allowTokenA || false,
        allowToken1: vault.allowTokenB || false,
        pool: vault.pool ? {
          ...vault.pool,
          // Don't set approximation values - let actual computed values be cached after calculation
        } as any : undefined,
      });

      if (vaultContract) {
        // Don't set approximation values - let actual computed values be cached after calculation
        // Add token symbols as fallbacks
        (vaultContract as any).token0Symbol = vault.pool?.token0?.symbol || 'Unknown';
        (vaultContract as any).token1Symbol = vault.pool?.token1?.symbol || 'Unknown';
        
        // Add vault tag from chain configuration for immediate display
        const vaultTag = getVaultTagFromConfig(vault.id);
        if (vaultTag) {
          vaultContract.vaultTag = vaultTag;
        }
        newVaultsContracts.push(vaultContract);
      }
    });

    // 只有当有新合约时才更新状态
    if (newVaultsContracts.length > 0) {
      setVaultsContracts(newVaultsContracts);
      // Cache the processed vaults
      setCachedProcessedVaults(newVaultsContracts, searchString);
    }
  }, [vaults, searchString, setCachedProcessedVaults]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const pages = useMemo(() => {
    if (!vaults?.ichiVaults) return 0;
    return Math.ceil(vaults.ichiVaults.length / rowsPerPage);
  }, [vaults?.ichiVaults]);

  const [sortedVaults, setSortedVaults] = useState<ICHIVaultContract[]>([]);

  useEffect(() => {
    if (!vaultsContracts.length) return;

    const sortedVaults = [...vaultsContracts].sort((a, b) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1;

      switch (sortField) {
        case 'pair': {
          const aSymbol = Token.getToken({
            address: a.token0?.address ?? '',
            chainId: wallet.currentChainId.toString(),
          }).symbol;
          const bSymbol = Token.getToken({
            address: b.token0?.address ?? '',
            chainId: wallet.currentChainId.toString(),
          }).symbol;
          return multiplier * aSymbol.localeCompare(bSymbol);
        }
        case 'allow_token': {
          const aSymbol = Token.getToken({
            address: a.token0?.address ?? '',
            chainId: wallet.currentChainId.toString(),
          }).symbol;
          const bSymbol = Token.getToken({
            address: b.token0?.address ?? '',
            chainId: wallet.currentChainId.toString(),
          }).symbol;
          return multiplier * aSymbol.localeCompare(bSymbol);
        }
        case 'address':
          return multiplier * a.address.localeCompare(b.address);
        case 'tvl': {
          const aTvl = Number(a.tvlUSD || (a as any).cachedTvlUSD || 0);
          const bTvl = Number(b.tvlUSD || (b as any).cachedTvlUSD || 0);
          return multiplier * (aTvl - bTvl);
        }
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
  }, [vaultsContracts, sortField, sortDirection, page]);

  return (
    <div className="w-full">
      {/* Mobile view - card layout for small screens */}
      <div className="sm:hidden">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            {isBackgroundLoading && (
              <div className="text-sm text-gray-500">
                Updating data...
              </div>
            )}
          </div>
        </div>
        {isLoading ? (
          <div className="text-center py-8 text-black">Loading...</div>
        ) : !vaults ? (
          <div className="text-center py-8 text-black">No data available.</div>
        ) : vaultsContracts.length === 0 ? (
          <div className="text-center py-8 text-black">
            No vaults available.
          </div>
        ) : !sortedVaults.length ? (
          <div className="text-center py-8 text-black">
            No results match your criteria.
          </div>
        ) : (
          <>
            {isBackgroundLoading && (
              <div className="text-center py-2 text-sm text-gray-500">
                Updating data...
              </div>
            )}
            {sortedVaults.map((vault) => (
              <VaultCard 
                key={vault.address} 
                vault={vault} 
                onVaultUpdate={(updatedVault) => {
                  // Update the vault in our cached list
                  const updatedContracts = vaultsContracts.map(v => 
                    v.address === updatedVault.address ? updatedVault : v
                  );
                  setVaultsContracts(updatedContracts);
                  setCachedProcessedVaults(updatedContracts, searchString);
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Desktop view - table layout for medium screens and up */}
      <div className="hidden sm:block w-full overflow-x-auto custom-dashed-3xl sm:p-6 sm:bg-white">
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
                      className={`h-3 w-3 ${
                        sortField === 'pair' && sortDirection === 'asc'
                          ? 'text-black'
                          : 'text-[#4D4D4D]'
                      }`}
                    />
                    <ChevronDown
                      className={`h-3 w-3 ${
                        sortField === 'pair' && sortDirection === 'desc'
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
                      className={`h-3 w-3 ${
                        sortField === 'pair' && sortDirection === 'asc'
                          ? 'text-black'
                          : 'text-[#4D4D4D]'
                      }`}
                    />
                    <ChevronDown
                      className={`h-3 w-3 ${
                        sortField === 'pair' && sortDirection === 'desc'
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
                      className={`h-3 w-3 ${
                        sortField === 'tvl' && sortDirection === 'asc'
                          ? 'text-black'
                          : 'text-[#4D4D4D]'
                      }`}
                    />
                    <ChevronDown
                      className={`h-3 w-3 ${
                        sortField === 'tvl' && sortDirection === 'desc'
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
                      className={`h-3 w-3 ${
                        sortField === 'volume' && sortDirection === 'asc'
                          ? 'text-black'
                          : 'text-[#4D4D4D]'
                      }`}
                    />
                    <ChevronDown
                      className={`h-3 w-3 ${
                        sortField === 'volume' && sortDirection === 'desc'
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
                      className={`h-3 w-3 ${
                        sortField === 'fees' && sortDirection === 'asc'
                          ? 'text-black'
                          : 'text-[#4D4D4D]'
                      }`}
                    />
                    <ChevronDown
                      className={`h-3 w-3 ${
                        sortField === 'fees' && sortDirection === 'desc'
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
                      className={`h-3 w-3 ${
                        sortField === 'apr' && sortDirection === 'asc'
                          ? 'text-black'
                          : 'text-[#4D4D4D]'
                      }`}
                    />
                    <ChevronDown
                      className={`h-3 w-3 ${
                        sortField === 'apr' && sortDirection === 'desc'
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
            {isLoading ? (
              <tr className="hover:bg-white border-white h-full">
                <td colSpan={6} className="h-24 text-center text-black">
                  Loading...
                </td>
              </tr>
            ) : !sortedVaults.length ? (
              <tr className="hover:bg-white border-white h-full">
                <td colSpan={6} className="h-24 text-center text-black">
                  No results.
                </td>
              </tr>
            ) : (
              <>
                {isBackgroundLoading && (
                  <tr className="hover:bg-white border-white">
                    <td colSpan={6} className="h-8 text-center text-sm text-gray-500">
                      Updating data...
                    </td>
                  </tr>
                )}
                {sortedVaults.map((vault) => {
                  return (
                    <VaultRow 
                      key={vault.address} 
                      vault={vault} 
                      onVaultUpdate={(updatedVault) => {
                        // Update the vault in our cached list
                        const updatedContracts = vaultsContracts.map(v => 
                          v.address === updatedVault.address ? updatedVault : v
                        );
                        setVaultsContracts(updatedContracts);
                        setCachedProcessedVaults(updatedContracts, searchString);
                      }}
                    />
                  );
                })}
              </>
            )}
          </tbody>
        </table>
      </div>

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
    </div>
  );
}

export default AllAquaberaVaults;
