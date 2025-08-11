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
  const [sortField, setSortField] = useState<SortField>(sortBy as SortField);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const infoClient = useSubgraphClient('algebra_info');

  useEffect(() => {
    const initVaults = async () => {
      if (!wallet.isInit || !infoClient) return;

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
  }, [wallet.isInit, searchString, onDataLoaded, infoClient]);

  useEffect(() => {
    if (!wallet.isInit || !vaults?.ichiVaults?.length) {
      return;
    }

    // 清空现有合约列表
    const newVaultsContracts: ICHIVaultContract[] = [];

    vaults.ichiVaults.forEach((vault) => {
      const vaultContract = ICHIVaultContract.getVault({
        token0: vault.tokenA,
        token1: vault.tokenB,
        address: vault.id as `0x${string}`,
        apr: Number(vault.feeApr_1d),
        detailedApr: {
          feeApr_1d: Number(vault.feeApr_1d),
          feeApr_3d: Number(vault.feeApr_3d),
          feeApr_7d: Number(vault.feeApr_7d),
          feeApr_30d: Number(vault.feeApr_30d),
        },
      });

      if (vaultContract) {
        newVaultsContracts.push(vaultContract);
      }
    });

    // 只有当有新合约时才更新状态
    if (newVaultsContracts.length > 0) {
      setVaultsContracts(newVaultsContracts);
    }
  }, [wallet.isInit, vaults]);

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
  }, [vaultsContracts, sortField, sortDirection, page]);

  return (
    <div className="w-full">
      {/* Mobile view - card layout for small screens */}
      <div className="sm:hidden">
        {!vaults ? (
          <div className="text-center py-8 text-black">Loading...</div>
        ) : vaultsContracts.length === 0 ? (
          <div className="text-center py-8 text-black">
            No vaults available.
          </div>
        ) : !sortedVaults.length ? (
          <div className="text-center py-8 text-black">
            No results match your criteria.
          </div>
        ) : (
          sortedVaults.map((vault) => (
            <VaultCard key={vault.address} vault={vault} />
          ))
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
            {!sortedVaults.length ? (
              <tr className="hover:bg-white border-white h-full">
                <td colSpan={5} className="h-24 text-center text-black">
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
