// pages/vault/[address].tsx
import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';
import { ICHIVaultContract } from '@honeypot/shared/lib/contract/aquabera/ICHIVault-contract';
import { Address, isAddress, zeroAddress } from 'viem';
import { Button } from '@/components/algebra/ui/button';
import { TokenLogo } from '@honeypot/shared/components/TokenLogo/TokenLogo';
import { DepositToVaultModal } from '@/components/Aquabera/modals/DepositToVaultModal';
import { wallet } from '@honeypot/shared/lib/wallet';
import { Token as AlgebraToken } from '@cryptoalgebra/sdk';
import { WithdrawFromVaultModal } from '@/components/Aquabera/modals/WithdrawFromVaultModal';
import { getSingleVaultDetails } from '@honeypot/shared/lib/graphql';
import BigNumber from 'bignumber.js';
import { DynamicFormatAmount } from '@honeypot/shared/lib/utils/formatAmount';
import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import CardContainer from '@/components/CardContianer/v3';
import Copy from '@/components/Copy/v3';
import { HiExternalLink } from 'react-icons/hi';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { cn, Tooltip } from '@nextui-org/react';
import { useSubgraphClient } from '@honeypot/shared/hooks/useSubgraphClients';
import { VaultTag } from '@/components/Aquabera/VaultTag';

export const VaultDetail = observer(() => {
  const router = useRouter();
  const { address } = router.query;
  const [vault, setVault] = useState<ICHIVaultContract | null>(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [poolTvl, setPoolTvl] = useState<string>('0');
  const [volatility, setVolatility] = useState<string>('0');
  const infoClient = useSubgraphClient('algebra_info');
  const [miniVaultStaker, setMiniVaultStaker] = useState<string[]>([]);

  useEffect(() => {
    if (
      !vault?.bgtVaultAddress ||
      !wallet.isInit ||
      !wallet.account ||
      !wallet.walletClient
    )
      return;

    wallet.contracts.vaultStakerFactory
      .getMiniVaultStaker(vault?.bgtVaultAddress as Address)
      .then((stakers) => setMiniVaultStaker(stakers.map((s) => s.toString())));
  }, [
    vault?.bgtVaultAddress,
    wallet.isInit,
    wallet.account,
    wallet.walletClient,
  ]);

  useEffect(() => {
    if (!wallet.isInit || !wallet.account || !wallet.walletClient) return;

    wallet.contracts.vaultVolatilityCheck
      .currentVolatility(address as string)
      .then((volatility) => {
        setVolatility(volatility?.toString() ?? '0');
      });
  }, [wallet.isInit, wallet.account, wallet.walletClient, address]);

  useEffect(() => {
    if (
      !wallet.isInit ||
      !wallet.account ||
      !address ||
      !isAddress(address as string) ||
      address === zeroAddress ||
      wallet.account === zeroAddress ||
      vault
    )
      return;

    // Fetch token addresses and pool data
    const loadVaultData = async () => {
      const vaultContract = await getSingleVaultDetails(
        infoClient,
        address as string
      );

      if (vaultContract) {
        Promise.all([
          vaultContract?.getTotalAmounts(),
          vaultContract?.getTotalSupply(),
          vaultContract?.getBalanceOf(wallet.account),
        ]);

        setPoolTvl(Number(vaultContract?.pool?.TVL_USD || 0).toString());
      }

      setVault(vaultContract);
      vaultContract?.token0?.init(true, {
        loadIndexerTokenData: true,
      });

      vaultContract?.token1?.init(true, {
        loadIndexerTokenData: true,
      });

      vaultContract?.getBgtVaultAddress();
    };

    loadVaultData();
  }, [address, wallet.isInit, wallet.account]);

  const hasShares = vault?.userShares ?? BigInt(0) > BigInt(0);

  // Add a function to refresh vault data
  const refreshVaultData = useCallback(async () => {
    if (!vault || !wallet.account || wallet.account === zeroAddress) return;

    // Refresh subgraph data
    const vaultDetails = await getSingleVaultDetails(infoClient, vault.address);
    setVault(vaultDetails);
    // Get total supply
    vaultDetails?.getTotalSupply();

    // Get user shares
    vaultDetails?.getBalanceOf(wallet.account);

    vaultDetails?.getTotalAmounts();
  }, [vault, wallet.isInit, wallet.account]);

  return (
    <div className="container mx-auto px-4 font-gliker">
      {/* Add Back Button */}
      <div>
        <Button
          onClick={() => router.push('/pools')}
          className="flex items-center gap-2 text-white text-xl px-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Back to Vaults</span>
        </Button>
      </div>

      <CardContainer className="px-4 md:px-8 justify-start">
        {/* Header Section */}
        <div className="flex flex-col gap-6 w-full">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {vault?.token0 && vault?.token1 && (
                <>
                  <div className="flex -space-x-2">
                    <TokenLogo token={vault?.token0} size={48} />
                    <TokenLogo token={vault?.token1} size={48} />
                  </div>
                  <span className="text-xl md:text-xl font-bold text-honey">
                    {vault?.token0?.symbol}/{vault?.token1?.symbol}
                  </span>
                </>
              )}
            </div>
            <div className="inline-flex flex-wrap md:flex-nowrap rounded-[16px] border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] gap-x-3 p-2 w-full md:w-auto gap-2">
              <Link
                href={`/swap?inputCurrency=${vault?.token0?.address}&outputCurrency=${vault?.token1?.address}`}
                className="w-full md:w-auto"
              >
                <Button
                  disabled={!vault?.token0?.address || !vault?.token1?.address}
                  className="w-full rounded-[8px] border border-black bg-[#FFCD4D] p-2 text-black shadow-[2px_2px_0px_0px_#000] hover:translate-y-[2px] hover:shadow-[2px_1px_0px_0px_#000] active:translate-y-[2px] active:shadow-none"
                >
                  Swap
                </Button>
              </Link>
              <Button
                onClick={() => setIsDepositModalOpen(true)}
                disabled={!wallet.account || !wallet.walletClient}
                className="w-full md:w-auto ml-[-1px] rounded-[8px] border border-black bg-[#FFCD4D] p-2 text-black shadow-[2px_2px_0px_0px_#000] hover:translate-y-[2px] hover:shadow-[2px_1px_0px_0px_#000] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!wallet.walletClient ? 'Connect Wallet' : 'Deposit'}
              </Button>
              {hasShares && (
                <Button
                  onClick={() => setIsWithdrawModalOpen(true)}
                  disabled={!wallet.account}
                  className="w-full md:w-auto ml-[-1px] rounded-[8px] border border-black bg-[#FFCD4D] p-2 text-black shadow-[2px_2px_0px_0px_#000] hover:translate-y-[2px] hover:shadow-[2px_1px_0px_0px_#000] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Withdraw
                </Button>
              )}
              {vault?.bgtVaultAddress && (
                <Link
                  href={`https://hub.berachain.com/vaults/${vault.bgtVaultAddress}/`}
                  target="_blank"
                >
                  <Button className="w-full md:w-auto ml-[-1px] rounded-[8px] border border-black bg-[#FFCD4D] p-2 text-white shadow-[2px_2px_0px_0px_#000] hover:translate-y-[2px] hover:shadow-[2px_1px_0px_0px_#000] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed">
                    Stake
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {vault?.vaultDescription && (
              <div className="rounded-[24px] border border-black bg-[#271A0C] px-4 md:px-10 py-6 shadow-[4px_4px_0px_0px_#D29A0D] sm:col-span-2 md:col-span-3">
                <h3 className="text-base text-white mb-2">
                  <span className="text-sm text-gray-500">
                    {vault?.vaultTag && (
                      <VaultTag
                        tag={vault?.vaultTag?.tag}
                        bgColor={vault?.vaultTag?.bgColor}
                        textColor={vault?.vaultTag?.textColor}
                        tooltip={vault?.vaultTag?.tooltip}
                      />
                    )}
                  </span>
                </h3>
                <div className="space-y-1">{vault?.vaultDescription}</div>
              </div>
            )}

            <div className="rounded-[24px] border border-black bg-[#271A0C] px-4 md:px-10 py-6 shadow-[4px_4px_0px_0px_#D29A0D]">
              <h3 className="text-base text-white mb-2">Total Supply</h3>
              <div className="space-y-1">
                <p className="text-xs md:text-xl font-bold text-white">
                  {DynamicFormatAmount({
                    amount: vault?.totalSupply.total0.toString() ?? 0,
                    decimals: 3,
                    endWith: vault?.token0?.symbol,
                  })}
                </p>
                <p className="text-xs md:text-xl font-bold text-white">
                  {DynamicFormatAmount({
                    amount: vault?.totalSupply.total1.toString() ?? 0,
                    decimals: 3,
                    endWith: vault?.token1?.symbol,
                  })}
                </p>
              </div>
            </div>
            <div className="rounded-[24px] border border-black bg-[#271A0C] px-4 md:px-10 py-6 shadow-[4px_4px_0px_0px_#D29A0D]">
              <h3 className="text-base text-white mb-2">
                Your Asset{' '}
                <span>
                  (
                  {DynamicFormatAmount({
                    amount: vault?.userTVLUSD ?? 0,
                    decimals: 3,
                    endWith: '$',
                  })}
                  )
                </span>
              </h3>
              <div className="space-y-1">
                <p className="text-xs md:text-xl font-bold text-white flex flex-col md:flex-row justify-between gap-2">
                  {DynamicFormatAmount({
                    amount: BigNumber(
                      vault?.userTokenAmounts.total0.toString() ?? 0
                    ).toString(),
                    decimals: 3,
                    endWith: vault?.token0?.symbol,
                  })}
                </p>
                <p className="text-xs md:text-xl font-bold text-white">
                  {DynamicFormatAmount({
                    amount: BigNumber(
                      vault?.userTokenAmounts.total1.toString() ?? 0
                    ).toString(),
                    decimals: 3,
                    endWith: vault?.token1?.symbol,
                  })}
                </p>
              </div>
            </div>
            <div className="rounded-[24px] border border-black bg-[#271A0C] px-4 md:px-10 py-6 shadow-[4px_4px_0px_0px_#D29A0D]">
              <h3 className="text-base text-white mb-2">
                Your Share Percentage
              </h3>
              <p className="text-xs md:text-xl font-bold text-white">
                {vault?.totalsupplyShares &&
                vault?.totalsupplyShares > BigInt(0)
                  ? DynamicFormatAmount({
                      amount:
                        (Number(vault?.userShares) /
                          Number(vault?.totalsupplyShares)) *
                        100,
                      decimals: 3,
                      endWith: '',
                    })
                  : '0'}
                %
              </p>
            </div>
            <div className="rounded-[24px] border border-black bg-[#271A0C] px-4 md:px-10 py-6 shadow-[4px_4px_0px_0px_#D29A0D]">
              <h3 className="text-base text-white mb-2">Vault TVL</h3>
              <p className="text-xs md:text-xl font-bold text-white">
                {DynamicFormatAmount({
                  amount: vault?.tvlUSD ?? 0,
                  decimals: 3,
                  endWith: '$',
                })}
              </p>
            </div>
            <div className="rounded-[24px] border border-black bg-[#271A0C] px-4 md:px-10 py-6 shadow-[4px_4px_0px_0px_#D29A0D]">
              <h3 className="text-base text-white mb-2">Pool TVL</h3>
              <p className="text-xs md:text-xl font-bold text-white">
                {DynamicFormatAmount({
                  amount: poolTvl,
                  decimals: 3,
                  endWith: '$',
                })}
              </p>
            </div>
            <div className="rounded-[24px] border border-black bg-[#271A0C] px-10 py-6 shadow-[4px_4px_0px_0px_#D29A0D] relative">
              <h3 className="text-base text-white mb-2">
                Volatility{' '}
                <span>
                  <Tooltip content="higher the volatility, higher the slippage">
                    <QuestionMarkCircleIcon className="w-4 h-4 inline-block" />
                  </Tooltip>
                </span>
              </h3>
              <p
                className={cn(
                  'text-2xl font-bold text-white',
                  volatility > '500' && 'text-orange-500',
                  volatility > '1000' && 'text-red-500'
                )}
              >
                {volatility}%
              </p>
            </div>
          </div>

          {/* Vault Info */}
          <div className="rounded-[24px] border border-black bg-[#271A0C] px-4 md:px-10 py-6 shadow-[4px_4px_0px_0px_#D29A0D]">
            <h3 className="text-white text-[22px] md:text-[26px] leading-[110%] text-shadow-[1.57px_3.14px_0px_#AF7F3D] text-stroke-1.5 text-stroke-black tracking-[1.04px] font-gliker mb-4">
              Vault Information
            </h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <p className="text-sm text-white mb-2">Vault Address</p>
                <div className="flex items-center text-black justify-between rounded-[16px] border-2 border-[#5A4A4A] bg-white px-4 py-2 shadow-[2px_2px_0px_0px_#202020,2px_4px_0px_0px_#202020]">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <p className="font-mono text-black truncate">{address}</p>
                    <Link
                      href={`${wallet.currentChain.chain.blockExplorers?.default.url}address/${address}`}
                      target="_blank"
                      className="text-black hover:text-black/80 flex-shrink-0"
                    >
                      <HiExternalLink size={20} />
                    </Link>
                  </div>
                  <Copy value={address as string} />
                </div>
              </div>
              <div>
                <p className="text-sm text-white mb-2">Token Addresses</p>
                <div className="flex items-center text-black  justify-between rounded-[16px] border-2 border-[#5A4A4A] bg-white px-4 py-2 shadow-[2px_2px_0px_0px_#202020,2px_4px_0px_0px_#202020] mb-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <p className="font-mono text-black truncate">
                      {vault?.token0?.address}
                    </p>
                    <Link
                      href={`${wallet.currentChain.chain.blockExplorers?.default.url}address/${vault?.token0?.address}`}
                      target="_blank"
                      className="text-black hover:text-black/80 flex-shrink-0"
                    >
                      <HiExternalLink size={20} />
                    </Link>
                  </div>
                  <Copy value={vault?.token0?.address as string} />
                </div>
                <div className="flex items-center  justify-between rounded-[16px] border-2 border-[#5A4A4A] bg-white px-4 py-2 shadow-[2px_2px_0px_0px_#202020,2px_4px_0px_0px_#202020]">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <p className=" text-black font-mono truncate">
                      {vault?.token1?.address}
                    </p>
                    <Link
                      href={`${wallet.currentChain.chain.blockExplorers?.default.url}address/${vault?.token1?.address}`}
                      target="_blank"
                      className="text-black hover:text-black/80 flex-shrink-0"
                    >
                      <HiExternalLink size={20} />
                    </Link>
                  </div>
                  <Copy value={vault?.token1?.address as string} />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          {vault && (
            <div className="rounded-[24px] border border-black bg-[#271A0C] p-4 md:p-6 shadow-[4px_4px_0px_0px_#D29A0D]">
              <h3 className="text-base text-white mb-4">Recent Activity</h3>

              {/* Mobile View */}
              <div className="md:hidden">
                {vault.recentTransactions.slice(0, 10).map((tx) => (
                  <div
                    key={tx.id}
                    className="border-l-4 border-b border-b-gray-200 last:border-b-0 mb-2"
                    style={{
                      borderLeftColor:
                        tx.__typename === 'VaultDeposit'
                          ? '#4CAF50'
                          : '#FF9800',
                    }}
                  >
                    <div className="pl-3 py-2">
                      {/* Top Row: Transaction Type and Date */}
                      <div className="flex justify-between items-center">
                        <div>
                          {tx.__typename === 'VaultDeposit' && (
                            <span className="text-[#4CAF50] font-medium">
                              Deposit
                            </span>
                          )}
                          {tx.__typename === 'VaultWithdraw' && (
                            <span className="text-[#FF9800] font-medium">
                              Withdraw
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-white">
                          {new Date(
                            Number(tx.createdAtTimestamp) * 1000
                          ).toLocaleString()}
                        </div>
                      </div>

                      {/* Amount and Transaction Link in one row */}
                      <div className="mt-1 flex justify-between items-end">
                        <div>
                          {tx.__typename === 'VaultDeposit' && (
                            <div>
                              <div className="text-sm font-medium text-white">
                                {DynamicFormatAmount({
                                  amount: BigNumber(tx.amount0.toString())
                                    .div(10 ** (vault?.token0?.decimals ?? 18))
                                    .toString(),
                                  decimals: 3,
                                  endWith: vault?.token0?.symbol,
                                })}
                              </div>
                              <div className="text-sm font-medium text-white">
                                {DynamicFormatAmount({
                                  amount: BigNumber(tx.amount1.toString())
                                    .div(10 ** (vault?.token1?.decimals ?? 18))
                                    .toString(),
                                  decimals: 3,
                                  endWith: vault?.token1?.symbol,
                                })}
                              </div>
                            </div>
                          )}
                          {tx.__typename === 'VaultWithdraw' && (
                            <div>
                              <div className="text-sm font-medium text-white">
                                {DynamicFormatAmount({
                                  amount: BigNumber(tx.amount0.toString())
                                    .div(10 ** (vault?.token0?.decimals ?? 18))
                                    .toString(),
                                  decimals: 3,
                                  endWith: vault?.token0?.symbol,
                                })}
                              </div>
                              <div className="text-sm font-medium text-white">
                                {DynamicFormatAmount({
                                  amount: BigNumber(tx.amount1.toString())
                                    .div(10 ** (vault?.token1?.decimals ?? 18))
                                    .toString(),
                                  decimals: 3,
                                  endWith: vault?.token1?.symbol,
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                        <div>
                          <Link
                            target="_blank"
                            href={`https://berascan.com/tx/${
                              tx.id.split('-')[0]
                            }`}
                            className="text-gray-500 text-sm underline hover:text-gray-500/80"
                          >
                            View Transaction
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View - Table Format */}
              <div className="hidden md:block">
                <div className="grid grid-cols-4 gap-4 font-medium text-white mb-2 px-3">
                  <div>Type</div>
                  <div>Amount</div>
                  <div>Transaction</div>
                  <div>Time</div>
                </div>

                {vault.recentTransactions.slice(0, 10).map((tx) => (
                  <div
                    key={tx.id}
                    className="grid grid-cols-4 gap-4 py-3 border-b border-gray-200 last:border-b-0 px-3 items-center"
                  >
                    {/* Type */}
                    <div>
                      {tx.__typename === 'VaultDeposit' && (
                        <span className="text-[#4CAF50] font-medium">
                          Deposit
                        </span>
                      )}
                      {tx.__typename === 'VaultWithdraw' && (
                        <span className="text-[#FF9800] font-medium">
                          Withdraw
                        </span>
                      )}
                    </div>

                    {/* Amount */}
                    <div>
                      {tx.__typename === 'VaultDeposit' && (
                        <div>
                          <div className="text-sm font-medium text-white">
                            {DynamicFormatAmount({
                              amount: BigNumber(tx.amount0.toString())
                                .div(10 ** (vault?.token0?.decimals ?? 18))
                                .toString(),
                              decimals: 3,
                              endWith: vault?.token0?.symbol,
                            })}
                          </div>
                          <div className="text-sm font-medium text-white">
                            {DynamicFormatAmount({
                              amount: BigNumber(tx.amount1.toString())
                                .div(10 ** (vault?.token1?.decimals ?? 18))
                                .toString(),
                              decimals: 3,
                              endWith: vault?.token1?.symbol,
                            })}
                          </div>
                        </div>
                      )}
                      {tx.__typename === 'VaultWithdraw' && (
                        <div>
                          <div className="text-sm font-medium text-white">
                            {DynamicFormatAmount({
                              amount: BigNumber(tx.amount0.toString())
                                .div(10 ** (vault?.token0?.decimals ?? 18))
                                .toString(),
                              decimals: 3,
                              endWith: vault?.token0?.symbol,
                            })}
                          </div>
                          <div className="text-sm font-medium text-white">
                            {DynamicFormatAmount({
                              amount: BigNumber(tx.amount1.toString())
                                .div(10 ** (vault?.token1?.decimals ?? 18))
                                .toString(),
                              decimals: 3,
                              endWith: vault?.token1?.symbol,
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Transaction */}
                    <div>
                      <Link
                        target="_blank"
                        href={`${
                          wallet.currentChain.chain.blockExplorers?.default.url
                        }tx/${tx.id.split('-')[0]}`}
                        className="text-gray-500 text-sm underline hover:text-gray-500/80"
                      >
                        {tx.id.split('-')[0].substring(0, 6)}...
                        {tx.id
                          .split('-')[0]
                          .substring(tx.id.split('-')[0].length - 4)}
                      </Link>
                    </div>

                    {/* Date */}
                    <div className="text-sm text-white">
                      {new Date(
                        Number(tx.createdAtTimestamp) * 1000
                      ).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContainer>

      {/* Modals */}
      {vault && vault?.token0 && vault?.token1 && (
        <>
          <DepositToVaultModal
            isOpen={isDepositModalOpen}
            onClose={() => {
              setIsDepositModalOpen(false);
              refreshVaultData(); // Refresh after closing deposit modal
            }}
            vault={vault}
            tokenA={
              new AlgebraToken(
                wallet.currentChainId,
                vault?.token0?.address as `0x${string}`,
                Number(vault?.token0?.decimals ?? 18),
                vault?.token0?.symbol,
                vault?.token0?.name
              )
            }
            tokenB={
              new AlgebraToken(
                wallet.currentChainId,
                vault?.token1?.address as `0x${string}`,
                Number(vault?.token1?.decimals ?? 18),
                vault?.token1?.symbol,
                vault?.token1?.name
              )
            }
          />
          <WithdrawFromVaultModal
            isOpen={isWithdrawModalOpen}
            onClose={() => {
              setIsWithdrawModalOpen(false);
              refreshVaultData(); // Refresh after closing withdraw modal
            }}
            vault={vault}
            maxShares={vault?.userShares ?? BigInt(0)}
          />
        </>
      )}
    </div>
  );
});

export default VaultDetail;
