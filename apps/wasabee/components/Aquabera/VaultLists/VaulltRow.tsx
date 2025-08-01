import { TokenLogo } from '@honeypot/shared';

import { getSingleVaultDetails } from '@honeypot/shared';
import { DynamicFormatAmount } from '@honeypot/shared';
import { useSubgraphClient } from '@honeypot/shared';
import { ICHIVaultContract } from '@honeypot/shared';
import { Token } from '@honeypot/shared';
import { wallet } from '@honeypot/shared/lib/wallet';
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
  const [isUpdatingData, setIsUpdatingData] = useState(false);
  const infoClient = useSubgraphClient('algebra_info');
  
  const tokenA = Token.getToken({
    address: vault.token0?.address ?? '',
    chainId: wallet.currentChainId.toString(),
  });
  const tokenB = Token.getToken({
    address: vault.token1?.address ?? '',
    chainId: wallet.currentChainId.toString(),
  });
  
  const loading = useMemo(() => {
    // Show loading only if we don't have basic vault data
    return !vault || !tokenA || !tokenB;
  }, [
    vault,
    tokenA,
    tokenB,
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
      setIsUpdatingData(true);
      const vaultContract = await getSingleVaultDetails(
        infoClient,
        vault.address
      );

      if (vaultContract) {
        // Load vault's actual locked amounts for proper TVL calculation
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
      setIsUpdatingData(false);
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

  console.log('#[vaulissue] VaultRow received vault:', {
    address: vault.address,
    allowToken0: vault.allowToken0,
    allowToken1: vault.allowToken1,
    token0Symbol: vault.token0?.symbol,
    token1Symbol: vault.token1?.symbol,
    tvlUSD: vault.tvlUSD,
    totalSupply: vault.totalSupply,
    token0Price: vault.token0?.derivedUSD,
    token1Price: vault.token1?.derivedUSD
  });

  return (
    <tr
      className="transition-colors bg-white text-black hover:bg-gray-50 cursor-pointer"
      onClick={() => (window.location.href = `/vault/${vault.address}`)}
    >
      {/* Token pair */}
      <td className="py-4 px-6">
        <div>
          {(vaultContract?.vaultTag || vault.vaultTag) && (
            <VaultTag
              tag={(vaultContract?.vaultTag || vault.vaultTag)!.tag}
              bgColor={(vaultContract?.vaultTag || vault.vaultTag)!.bgColor}
              textColor={(vaultContract?.vaultTag || vault.vaultTag)!.textColor}
              tooltip={(vaultContract?.vaultTag || vault.vaultTag)!.tooltip}
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
                {tokenA?.symbol || (vault as any).token0Symbol || 'Unknown'}/{tokenB?.symbol || (vault as any).token1Symbol || 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      </td>
      {/* allow token */}
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {(isTokenAAllowed.data || vault.allowToken0) && <TokenLogo token={tokenA} size={24} />}
            {(isTokenBAllowed.data || vault.allowToken1) && <TokenLogo token={tokenB} size={24} />}
          </div>
          <div className="flex">
            <p className="text-black font-medium">
              {(isTokenAAllowed.data || vault.allowToken0) && (tokenA?.symbol || (vault as any).token0Symbol || 'Unknown')}
              {(isTokenBAllowed.data || vault.allowToken1) && (tokenB?.symbol || (vault as any).token1Symbol || 'Unknown')}
            </p>
          </div>
        </div>
      </td>
      {/* vault address */}
      {/* <td className="py-4 px-6 text-black">{vault.id}</td> */}
      {/* apr */}
      <td className="py-4 px-6 text-right text-black">
        {isUpdatingData ? (
          <div className="flex items-center justify-end">
            <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
          </div>
        ) : (
          (() => {
            // Use vault's computed TVL (calculated from actual locked amounts)
            let tvlValue = vaultContract?.tvlUSD || vault.tvlUSD || 0;
            
            // Ensure we have a valid number
            if (isNaN(Number(tvlValue))) {
              tvlValue = 0;
            }
            
            console.log('#[vaulissue] Rendering vault TVL for', vault.address, ':', {
              vaultContractTvl: vaultContract?.tvlUSD,
              vaultTvl: vault.tvlUSD,
              finalTvlValue: tvlValue,
              totalSupply: vaultContract?.totalSupply,
              token0Price: vaultContract?.token0?.derivedUSD,
              token1Price: vaultContract?.token1?.derivedUSD
            });
            return DynamicFormatAmount({
              amount: tvlValue,
              decimals: 3,
              beginWith: ' $',
            });
          })()
        )}
      </td>
      {/* volume */}
      <td className="py-4 px-6 text-right text-black">
        {isUpdatingData ? (
          <div className="flex items-center justify-end">
            <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
          </div>
        ) : (
          DynamicFormatAmount({
            amount: volume ?? 0,
            decimals: 3,
            beginWith: ' $',
          })
        )}
      </td>
      {/* fees */}
      <td className="py-4 px-6 text-right text-black">
        {isUpdatingData ? (
          <div className="flex items-center justify-end">
            <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
          </div>
        ) : (
          DynamicFormatAmount({
            amount: fees ?? 0,
            decimals: 3,
            beginWith: ' $',
          })
        )}
      </td>
      <td className="py-4 px-6 text-right text-black">
        <div className="h-full flex justify-end items-center gap-2">
          {vaultContract?.apr?.toFixed(2) ?? vault.apr?.toFixed(2) ?? '0.00'}%
          <Tooltip
            content={
              <div>
                <p>1d: {vaultContract?.detailedApr?.feeApr_1d?.toFixed(5) ?? vault.detailedApr?.feeApr_1d?.toFixed(5) ?? '0.00000'}%</p>
                <p>3d: {vaultContract?.detailedApr?.feeApr_3d?.toFixed(5) ?? vault.detailedApr?.feeApr_3d?.toFixed(5) ?? '0.00000'}%</p>
                <p>7d: {vaultContract?.detailedApr?.feeApr_7d?.toFixed(5) ?? vault.detailedApr?.feeApr_7d?.toFixed(5) ?? '0.00000'}%</p>
                <p>30d: {vaultContract?.detailedApr?.feeApr_30d?.toFixed(5) ?? vault.detailedApr?.feeApr_30d?.toFixed(5) ?? '0.00000'}%</p>
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