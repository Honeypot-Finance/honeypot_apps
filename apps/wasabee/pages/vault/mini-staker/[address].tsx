// pages/vault/[address].tsx
import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';
import { ICHIVaultContract } from '@honeypot/shared';
import { Address, isAddress, zeroAddress } from 'viem';
import { Button } from '@/components/algebra/ui/button';
import { TokenLogo } from '@honeypot/shared';
import { DepositToVaultModal } from '@/components/Aquabera/modals/DepositToVaultModal';
import { wallet } from '@honeypot/shared/lib/wallet';
import { Token as AlgebraToken } from '@cryptoalgebra/sdk';
import { WithdrawFromVaultModal } from '@/components/Aquabera/modals/WithdrawFromVaultModal';
import { getSingleVaultDetails } from '@honeypot/shared';
import BigNumber from 'bignumber.js';
import { DynamicFormatAmount } from '@honeypot/shared';
import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import CardContainer from '@/components/CardContianer/v3';
import Copy from '@/components/Copy/v3';
import { HiExternalLink } from 'react-icons/hi';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { cn, Tooltip } from '@nextui-org/react';
import { useSubgraphClient } from '@honeypot/shared';
import { InfoIcon } from 'lucide-react';
import { VaultTag } from '@/components/Aquabera/VaultTag';
import { BGTVault } from '@honeypot/shared/lib/contract/rewardVault/bgt-vault';

export const VaultDetail = observer(() => {
  const router = useRouter();
  const { address } = router.query;
  const [vault, setVault] = useState<ICHIVaultContract | null>(null);
  const infoClient = useSubgraphClient('algebra_info');
  const [miniVaultStaker, setMiniVaultStaker] = useState<string[]>([]);
  const [createVaultStakerAmount, setCreateVaultStakerAmount] =
    useState<string>('0');

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
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {vault?.bgtVaultAddress && (
              <div className="rounded-[24px] border border-black bg-orange-300 px-4 md:px-10 py-6 shadow-[4px_4px_0px_0px_#D29A0D] sm:col-span-2 md:col-span-3">
                <div className="flex  gap-2 justify-between items-center">
                  <h3 className="text-base text-white mb-2">
                    <span className="text-sm text-black rounded-full bg-white px-2 py-1">
                      Mini Vault Staker
                    </span>
                  </h3>
                  <div className="flex gap-2">
                    <div className="flex gap-2 items-center  bg-white rounded-[8px] border border-black p-2">
                      <input
                        type="number"
                        value={createVaultStakerAmount}
                        onChange={(e) =>
                          setCreateVaultStakerAmount(e.target.value)
                        }
                        placeholder="Amount"
                        className="w-32 rounded-[8px] border border-black bg-white p-2 text-[#202020] shadow-[2px_2px_0px_0px_#000] focus:outline-none"
                      />
                      <Button
                        onClick={() =>
                          wallet.contracts.vaultStakerFactory
                            .createVaultStakerDefault(
                              wallet.account as Address,
                              new BGTVault({
                                address: vault?.bgtVaultAddress as Address,
                              }),
                              Number(createVaultStakerAmount)
                            )
                            .then(() => {
                              wallet.contracts.vaultStakerFactory
                                .getMiniVaultStaker(
                                  vault?.bgtVaultAddress as Address
                                )
                                .then((stakers) =>
                                  setMiniVaultStaker(
                                    stakers.map((s) => s.toString())
                                  )
                                );
                            })
                        }
                        disabled={!wallet.account || !wallet.walletClient}
                        className="w-full md:w-auto ml-[-1px] rounded-[8px] border border-black bg-[#FFCD4D] p-2 text-[#202020] shadow-[2px_2px_0px_0px_#000] hover:translate-y-[2px] hover:shadow-[2px_1px_0px_0px_#000] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Create Vault Staker
                      </Button>
                    </div>
                    {vault?.userShares && vault?.userShares > BigInt(0) && (
                      <Button
                        onClick={() =>
                          wallet.contracts.vaultStakerFactory
                            .stakeMiniVaultStakerDefault(
                              vault.bgtVaultAddress as Address,
                              vault
                            )
                            .then(() => refreshVaultData())
                        }
                        disabled={!wallet.account || !wallet.walletClient}
                        className="w-full md:w-auto ml-[-1px] rounded-[8px] border border-black bg-[#FFCD4D] p-2 text-[#202020] shadow-[2px_2px_0px_0px_#000] hover:translate-y-[2px] hover:shadow-[2px_1px_0px_0px_#000] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Stake
                      </Button>
                    )}
                    <Button
                      onClick={() =>
                        wallet.contracts.vaultStakerFactory.unstakeMiniVaultStaker(
                          vault.bgtVaultAddress as Address
                        )
                      }
                      disabled={!wallet.account || !wallet.walletClient}
                      className="w-full md:w-auto ml-[-1px] rounded-[8px] border border-black bg-[#FFCD4D] p-2 text-[#202020] shadow-[2px_2px_0px_0px_#000] hover:translate-y-[2px] hover:shadow-[2px_1px_0px_0px_#000] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Unstake
                    </Button>
                    <Button
                      onClick={() =>
                        wallet.contracts.vaultStakerFactory.mintLbgtDefault(
                          vault.bgtVaultAddress as Address
                        )
                      }
                      disabled={!wallet.account || !wallet.walletClient}
                      className="w-full md:w-auto ml-[-1px] rounded-[8px] border border-black bg-[#FFCD4D] p-2 text-[#202020] shadow-[2px_2px_0px_0px_#000] hover:translate-y-[2px] hover:shadow-[2px_1px_0px_0px_#000] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Mint LBGT
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <p>
                    Your Unstaked Shares:{' '}
                    {vault?.userShares && vault?.userShares > BigInt(0)
                      ? vault?.userShares.toString()
                      : 0}
                  </p>
                </div>
              </div>
            )}

            <div className="rounded-[24px] border border-black bg-[#271A0C] px-4 md:px-10 py-6 shadow-[4px_4px_0px_0px_#D29A0D]">
              <h3 className="text-base text-white mb-2">Total Supply</h3>
              <div className="space-y-1">
                <p className="text-xs md:text-xl font-bold text-[#202020]">
                  {DynamicFormatAmount({
                    amount: vault?.totalSupply.total0.toString() ?? 0,
                    decimals: 3,
                    endWith: vault?.token0?.symbol,
                  })}
                </p>
                <p className="text-xs md:text-xl font-bold text-[#202020]">
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
                <p className="text-xs md:text-xl font-bold text-[#202020] flex flex-col md:flex-row justify-between gap-2">
                  {DynamicFormatAmount({
                    amount: BigNumber(
                      vault?.userTokenAmounts.total0.toString() ?? 0
                    ).toString(),
                    decimals: 3,
                    endWith: vault?.token0?.symbol,
                  })}
                </p>
                <p className="text-xs md:text-xl font-bold text-[#202020]">
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
              <p className="text-xs md:text-xl font-bold text-[#202020]">
                {vault?.totalsupplyShares &&
                vault?.totalsupplyShares > BigInt(0)
                  ? (
                      (Number(vault?.userShares) /
                        Number(vault?.totalsupplyShares)) *
                      100
                    ).toFixed(2)
                  : '0'}
                %
              </p>
            </div>
          </div>
        </div>
      </CardContainer>
    </div>
  );
});

export default VaultDetail;
