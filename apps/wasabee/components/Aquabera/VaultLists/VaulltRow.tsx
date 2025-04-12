import { LoadingDisplay } from '@/components/LoadingDisplay/LoadingDisplay';
import TokenLogo from '@/components/TokenLogo/TokenLogo';
import { getSingleVaultDetails } from '@/lib/algebra/graphql/clients/vaults';
import { DynamicFormatAmount } from '@/lib/algebra/utils/common/formatAmount';
import { useInfoClient } from '@/lib/hooks/useSubgraphClients';
import { ICHIVaultContract } from '@/services/contract/aquabera/ICHIVault-contract';
import { Token } from '@/services/contract/token';
import { wallet } from '@/services/wallet';
import {
  useReadIchiVaultAllowToken0,
  useReadIchiVaultAllowToken1,
} from '@/wagmi-generated';
import { Skeleton, Tooltip } from '@nextui-org/react';
import { InfoIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useState } from 'react';
import { VaultTag } from '../VaultTag';

export const VaultRow = observer(({ vault }: { vault: ICHIVaultContract }) => {
  const [vaultContract, setVaultContract] = useState<
    ICHIVaultContract | undefined
  >(undefined);
  const infoClient = useInfoClient();
  const tokenA = Token.getToken({
    address: vault.token0?.address ?? '',
    chainId: wallet.currentChainId.toString(),
  });
  const tokenB = Token.getToken({
    address: vault.token1?.address ?? '',
    chainId: wallet.currentChainId.toString(),
  });
  const loading = useMemo(() => {
    return (
      !vaultContract ||
      !tokenA ||
      !tokenB ||
      !vaultContract?.tvlUSD ||
      !vaultContract?.pool?.volume_24h_USD ||
      !vaultContract?.pool?.fees_24h_USD
    );
  }, [
    vaultContract,
    tokenA,
    tokenB,
    vaultContract?.pool,
    vaultContract?.tvlUSD,
    vaultContract?.pool?.volume_24h_USD,
    vaultContract?.pool?.fees_24h_USD,
  ]);

  const isTokenAAllowed = useReadIchiVaultAllowToken0({
    address: vault.address,
  });

  const isTokenBAllowed = useReadIchiVaultAllowToken1({
    address: vault.address,
  });

  useEffect(() => {
    if (!vault) return;

    async function getVaultsContracts() {
      if (!vault) return;
      const vaultContract = await getSingleVaultDetails(
        infoClient,
        vault.address
      );

      if (vaultContract) {
        Promise.all([
          vaultContract?.getTotalAmounts(),
          vaultContract?.getTotalSupply(),
          vaultContract?.getBalanceOf(wallet.account),
        ]);

        vaultContract?.token0?.init(false, {
          loadIndexerTokenData: true,
        });

        vaultContract?.token1?.init(false, {
          loadIndexerTokenData: true,
        });

        return vaultContract;
      }
    }

    getVaultsContracts().then((vaultContract) => {
      setVaultContract(vaultContract);
    });
  }, [vault]);

  const volume = Number(vault.pool?.volume_24h_USD || 0);

  const fees = Number(vault.pool?.fees_24h_USD || 0);

  if (loading) {
    return (
      <tr>
        <td colSpan={6}>
          <Skeleton className="h-12 bg-yellow-500" />
        </td>
      </tr>
    );
  }

  return (
    <tr
      className="transition-colors bg-white text-black hover:bg-gray-50 cursor-pointer"
      onClick={() => (window.location.href = `/vault/${vault.address}`)}
    >
      {/* Token pair */}
      <td className="py-4 px-6">
        <div>
          {vaultContract?.vaultTag && (
            <VaultTag
              tag={vaultContract.vaultTag.tag}
              bgColor={vaultContract.vaultTag.bgColor}
              textColor={vaultContract.vaultTag.textColor}
              tooltip={vaultContract.vaultTag.tooltip}
            />
          )}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <TokenLogo
                token={tokenA}
                addtionalClasses="translate-x-[25%]"
                size={24}
              />
              <TokenLogo
                token={tokenB}
                addtionalClasses="translate-x-[-25%]"
                size={24}
              />
            </div>
            <div className="flex flex-col">
              <p className="text-black font-medium">
                {tokenA.symbol}/{tokenB.symbol}
              </p>
            </div>
          </div>
        </div>
      </td>
      {/* allow token */}
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {isTokenAAllowed.data && <TokenLogo token={tokenA} size={24} />}
            {isTokenBAllowed.data && <TokenLogo token={tokenB} size={24} />}
          </div>
          <div className="flex">
            <p className="text-black font-medium">
              {isTokenAAllowed.data && tokenA.symbol}
              {isTokenBAllowed.data && tokenB.symbol}
            </p>
          </div>
        </div>
      </td>
      {/* vault address */}
      {/* <td className="py-4 px-6 text-black">{vault.id}</td> */}
      {/* apr */}
      <td className="py-4 px-6 text-right text-black">
        {DynamicFormatAmount({
          amount: vaultContract?.tvlUSD ?? 0,
          decimals: 3,
          beginWith: ' $',
        })}
      </td>
      {/* volume */}
      <td className="py-4 px-6 text-right text-black">
        {DynamicFormatAmount({
          amount: volume ?? 0,
          decimals: 3,
          beginWith: ' $',
        })}
      </td>
      {/* fees */}
      <td className="py-4 px-6 text-right text-black">
        {DynamicFormatAmount({
          amount: fees ?? 0,
          decimals: 3,
          beginWith: ' $',
        })}
      </td>
      <td className="py-4 px-6 text-right text-black">
        <div className="h-full flex justify-end items-center gap-2">
          {vaultContract?.apr.toFixed(2)}%
          <Tooltip
            content={
              <div>
                <p>1d: {vaultContract?.detailedApr.feeApr_1d.toFixed(5)}%</p>
                <p>3d: {vaultContract?.detailedApr.feeApr_3d.toFixed(5)}%</p>
                <p>7d: {vaultContract?.detailedApr.feeApr_7d.toFixed(5)}%</p>
                <p>30d: {vaultContract?.detailedApr.feeApr_30d.toFixed(5)}%</p>
              </div>
            }
          >
            <span className="text-gray-500">
              <InfoIcon className="w-4 h-4" />
            </span>
          </Tooltip>
        </div>
      </td>
    </tr>
  );
});

export default VaultRow;
