import { useRouter } from 'next/router';
import { TokenLogo } from '@honeypot/shared';
import { getAccountVaultsList } from '@/lib/algebra/graphql/clients/vaults';
import { AccountVaultSharesQuery } from '@/lib/algebra/graphql/generated/graphql';

import { ICHIVaultContract } from '@honeypot/shared';

import { Token } from '@honeypot/shared';
import { wallet } from '@honeypot/shared/lib/wallet';
import { useEffect, useState } from 'react';
import { Currency } from '@cryptoalgebra/sdk';
import { DepositToVaultModal } from '../modals/DepositToVaultModal';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { observer } from 'mobx-react-lite';
import MyVaultRow from './MyVaultRow';
import { useSubgraphClient } from '@honeypot/shared';
import { Button } from '@/components/algebra/ui/button';

type SortField =
  | 'pair'
  | 'allow_token'
  | 'tvl'
  | 'volume'
  | 'fees'
  | 'shares'
  | 'user_tvl'
  | 'apr';
type SortDirection = 'asc' | 'desc';

interface MyAquaberaVaultsProps {
  searchString?: string;
  sortBy?: string;
  prefetchedData?: AccountVaultSharesQuery | null;
  prefetchedContracts?: ICHIVaultContract[] | null;
}

export const MyAquaberaVaults = observer(
  ({ searchString = '', sortBy = 'apr', prefetchedData, prefetchedContracts }: MyAquaberaVaultsProps) => {
    const [vaultsContracts, setVaultsContracts] = useState<ICHIVaultContract[]>(
      prefetchedContracts || []
    );
    const [myVaults, setMyVaults] = useState<AccountVaultSharesQuery | undefined>(prefetchedData || undefined);
    const [sortField, setSortField] = useState<SortField>('tvl');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const infoClient = useSubgraphClient('algebra_info');

    const getAllowToken = (vault: any) => {
      return vault.allowToken;
    };

    useEffect(() => {
      if (!wallet.isInit || !myVaults) {
        return;
      }

      // Skip if we already have prefetched contracts
      if (prefetchedContracts && prefetchedContracts.length > 0) {
      
        return;
      }

      // Clear existing contracts before adding new ones
      setVaultsContracts([]);

      myVaults.vaultShares.forEach((vault) => {
        const vaultContract = ICHIVaultContract.getVault({
          token0: vault.vault.tokenA,
          token1: vault.vault.tokenB,
          address: vault.vault.id as `0x${string}`,
          apr: Number(vault.vault.feeApr_1d),
          detailedApr: {
            feeApr_1d: Number(vault.vault.feeApr_1d),
            feeApr_3d: Number(vault.vault.feeApr_3d),
            feeApr_7d: Number(vault.vault.feeApr_7d),
            feeApr_30d: Number(vault.vault.feeApr_30d),
          },
        });
        if (vaultContract) {
          setVaultsContracts((prev) => [...prev, vaultContract]);
        }
      });
    }, [wallet.isInit, myVaults, prefetchedContracts]);

    useEffect(() => {
      if (!wallet.isInit) return;
      
      // If we have prefetched data, use it
      if (prefetchedData) {
        setMyVaults(prefetchedData);
        return;
      }
      
      loadMyVaults(wallet.account);
    }, [wallet.isInit, wallet.account, prefetchedData]);

    const loadMyVaults = async (accountAddress: string) => {
      const myVaultsQuery = await getAccountVaultsList(
        infoClient,
        accountAddress
      );
      setMyVaults(myVaultsQuery);
    };

    const handleSort = (field: SortField) => {
      if (sortField === field) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setSortField(field);
        setSortDirection('desc');
      }
    };

    const getSortedVaults = () => {
      if (!vaultsContracts.length) return [];

      const filteredVaults = vaultsContracts.filter((vault) => {
        if (!searchString) return true;

        const tokenA = Token.getToken({
          address: vault.token0?.address ?? '',
          chainId: wallet.currentChainId.toString(),
        });
        const tokenB = Token.getToken({
          address: vault.token1?.address ?? '',
          chainId: wallet.currentChainId.toString(),
        });

        const searchLower = searchString.toLowerCase();
        return (
          vault.address.toLowerCase().includes(searchLower) ||
          tokenA.symbol.toLowerCase().includes(searchLower) ||
          tokenB.symbol.toLowerCase().includes(searchLower)
        );
      });

      return [...filteredVaults].sort((a, b) => {
        const multiplier = sortDirection === 'asc' ? 1 : -1;

        switch (sortField) {
          case 'pair': {
            return (
              multiplier *
              (a.token0?.symbol?.localeCompare(b.token0?.symbol ?? '') ?? 0)
            );
          }
          case 'allow_token':
            return (
              multiplier *
              getAllowToken(a)?.symbol.localeCompare(getAllowToken(b)?.symbol)
            );
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
          case 'shares':
            return multiplier * (Number(a.userShares) - Number(b.userShares));
          case 'user_tvl':
            return multiplier * (Number(a.userTVLUSD) - Number(b.userTVLUSD));
          case 'apr':
            return multiplier * (Number(a.apr) - Number(b.apr));
          default:
            return 0;
        }
      });
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
          <span className={label.length > 4 ? 'text-[13px]' : 'text-base'}>
            {label}
          </span>
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

    const sortedVaults = getSortedVaults();

    // 当 sortBy 变化时更新排序字段
    useEffect(() => {
      setSortField(sortBy as SortField);
    }, [sortBy]);

    return (
      <div className="w-full">
        {/* Mobile view - card layout for small screens */}
        <div className="sm:hidden">
          {!sortedVaults.length ? (
            <div className="text-center py-8 text-black">No results.</div>
          ) : (
            sortedVaults.map((vault) => (
              <div
                key={vault.address}
                className="mb-4 p-4 bg-white custom-dashed-3xl"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="font-medium">Token Pair</div>
                  <div className="flex items-center">
                    <div className="flex items-center">
                      <TokenLogo
                        token={Token.getToken({
                          address: vault.token0?.address ?? '',
                          chainId: wallet.currentChainId.toString(),
                        })}
                        addtionalClasses="translate-x-[25%]"
                        size={20}
                      />
                      <TokenLogo
                        token={Token.getToken({
                          address: vault.token1?.address ?? '',
                          chainId: wallet.currentChainId.toString(),
                        })}
                        addtionalClasses="translate-x-[-25%]"
                        size={20}
                      />
                    </div>
                    <span className="font-bold ml-2">
                      {
                        Token.getToken({
                          address: vault.token0?.address ?? '',
                          chainId: wallet.currentChainId.toString(),
                        }).symbol
                      }
                      /
                      {
                        Token.getToken({
                          address: vault.token1?.address ?? '',
                          chainId: wallet.currentChainId.toString(),
                        }).symbol
                      }
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-3">
                  <div className="font-medium">Allow Token</div>
                  {vault.allowToken0 && (
                    <div className="flex items-center gap-1">
                      <TokenLogo
                        token={Token.getToken({
                          address: vault.token0?.address ?? '',
                          chainId: wallet.currentChainId.toString(),
                        })}
                        size={20}
                      />
                      <span>
                        {
                          Token.getToken({
                            address: vault.token0?.address ?? '',
                            chainId: wallet.currentChainId.toString(),
                          }).symbol
                        }
                      </span>
                    </div>
                  )}
                  {vault.allowToken1 && (
                    <div className="flex items-center gap-1">
                      <TokenLogo
                        token={Token.getToken({
                          address: vault.token1?.address ?? '',
                          chainId: wallet.currentChainId.toString(),
                        })}
                        size={20}
                      />
                      <span>
                        {
                          Token.getToken({
                            address: vault.token1?.address ?? '',
                            chainId: wallet.currentChainId.toString(),
                          }).symbol
                        }
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mb-3">
                  <div className="font-medium">Your TVL</div>
                  <div className="font-medium">
                    $
                    {Number(vault.userTVLUSD || 0).toLocaleString('en-US', {
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>

                <div className="flex justify-between items-center mb-3">
                  <div className="font-medium">APR</div>
                  <div className="font-bold text-green-600">
                    {Number(vault.apr || 0).toLocaleString('en-US', {
                      maximumFractionDigits: 2,
                    })}
                    %
                  </div>
                </div>

                <div className="mt-4 flex justify-center gap-2">
                  <Button
                    className="w-1/2 border border-[#2D2D2D] bg-[#FFCD4D] hover:bg-[#FFD56A] text-black rounded-2xl shadow-[2px_2px_0px_0px_#000] px-2 py-2 text-xs"
                    onClick={() => {
                      window.open(`/vault/${vault.address}`, '_blank');
                    }}
                  >
                    View Vault
                  </Button>
                  <Button
                    className="w-1/2 border border-[#2D2D2D] bg-white hover:bg-gray-50 text-black rounded-2xl shadow-[2px_2px_0px_0px_#000] px-2 py-2 text-xs"
                    onClick={() => {
                      window.open(
                        `/swap?inputCurrency=${vault.token0?.address}&outputCurrency=${vault.token1?.address}`,
                        '_blank'
                      );
                    }}
                  >
                    Swap
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop view - table layout for medium screens and up */}
        <div className="hidden sm:block w-full overflow-x-auto custom-dashed-3xl sm:p-6 sm:bg-[#271A0C]">
          <table className="w-full">
            <thead>
              <tr>
                <SortHeader field="pair" label="Token Pair" align="left" />
                <SortHeader
                  field="allow_token"
                  label="Allow Token"
                  align="left"
                />
                <SortHeader field="user_tvl" label="Your TVL" />
                <SortHeader field="apr" label="APR" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#4D4D4D]">
              {!sortedVaults.length ? (
                <tr className="hover:bg-white border-white h-full">
                  <td colSpan={6} className="h-24 text-center text-black">
                    No results.
                  </td>
                </tr>
              ) : (
                sortedVaults.map((vault) => {
                  return <MyVaultRow key={vault.address} vault={vault} />;
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
);

export default MyAquaberaVaults;
