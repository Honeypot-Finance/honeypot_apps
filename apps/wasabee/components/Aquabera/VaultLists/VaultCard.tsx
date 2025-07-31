import { Button } from '@/components/algebra/ui/button';
import { TokenLogo } from '@honeypot/shared';

import { getSingleVaultDetails } from '@honeypot/shared';

import { ICHIVaultContract } from '@honeypot/shared';

import { Token } from '@honeypot/shared';
import { wallet } from '@honeypot/shared/lib/wallet';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { Skeleton } from '@nextui-org/react';
import { VaultTag } from '../VaultTag';
import Link from 'next/link';
import { getSubgraphClientByChainId } from '@honeypot/shared';

interface VaultCardProps {
  vault: ICHIVaultContract;
}

const VaultCard = observer(({ vault }: VaultCardProps) => {
  const [vaultContract, setVaultContract] = useState<
    ICHIVaultContract | undefined
  >(undefined);
  const [loading, setLoading] = useState(false);

  const tokenA = Token.getToken({
    address: vault.token0?.address ?? '',
    chainId: wallet.currentChainId.toString(),
  });
  const tokenB = Token.getToken({
    address: vault.token1?.address ?? '',
    chainId: wallet.currentChainId.toString(),
  });
  const infoClient = getSubgraphClientByChainId(
    wallet.currentChainId.toString(),
    'algebra_info'
  );

  useEffect(() => {
    if (!vault) return;

    async function initializeVault() {
      try {
        const vaultContract = await getSingleVaultDetails(
          infoClient,
          vault.address
        );

        if (vaultContract) {
         
          Promise.all([
            vaultContract?.getTotalAmounts(),
            vaultContract?.getTotalSupply(),
            vaultContract?.getBalanceOf(wallet.account),
          ])

          vaultContract?.token0?.init(false, {
            loadIndexerTokenData: true,
          });

          vaultContract?.token1?.init(false, {
            loadIndexerTokenData: true,
          });

          setVaultContract(vaultContract);
        }
      } catch (error) {
        console.error('Error initializing vault:', error);
      }
    }

    initializeVault();
  }, [vault, tokenA, tokenB]);

  if (loading) {
    return <Skeleton className="h-64 mb-4 bg-gray-200 custom-dashed-3xl" />;
  }

  // Use vaultContract for data if available, otherwise fall back to the original vault
  const displayVault = vaultContract || vault;
  
  // Show loading only if we don't have basic vault data
  if (!vault || !tokenA || !tokenB) {
    return <Skeleton className="h-64 mb-4 bg-gray-200 custom-dashed-3xl" />;
  }

  return (
    <div className="mb-4 p-4 bg-white custom-dashed-3xl">
      {(vaultContract?.vaultTag || vault.vaultTag) && (
        <VaultTag
          tag={(vaultContract?.vaultTag || vault.vaultTag)!.tag}
          bgColor={(vaultContract?.vaultTag || vault.vaultTag)!.bgColor}
          textColor={(vaultContract?.vaultTag || vault.vaultTag)!.textColor}
          tooltip={(vaultContract?.vaultTag || vault.vaultTag)!.tooltip}
        />
      )}
      <div className="flex justify-between items-center mb-3">
        <div className="font-medium">Token Pair</div>
        <div className="flex items-center">
          <div className="flex items-center">
            <TokenLogo
              token={tokenA}
              addtionalClasses="translate-x-[25%]"
              size={20}
            />
            <TokenLogo
              token={tokenB}
              addtionalClasses="translate-x-[-25%]"
              size={20}
            />
          </div>
          <span className="font-bold">
            {tokenA?.symbol || (vault as any).token0Symbol || 'Unknown'}/{tokenB?.symbol || (vault as any).token1Symbol || 'Unknown'}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <div className="font-medium">Allow Token</div>
        <div className="flex items-center gap-2">
          {vault.allowToken0 && (
            <div className="flex items-center gap-1">
              <TokenLogo token={tokenA} size={20} />
              <span>{tokenA?.symbol || (vault as any).token0Symbol || 'Unknown'}</span>
            </div>
          )}
          {vault.allowToken1 && (
            <div className="flex items-center gap-1">
              <TokenLogo token={tokenB} size={20} />
              <span>{tokenB?.symbol || (vault as any).token1Symbol || 'Unknown'}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <div className="font-medium">Vault TVL</div>
        <div>
          {(() => {
           
            const tvlValue = Number((vault as any).cachedTvlUSD || displayVault.tvlUSD || vault.tvlUSD || 0);
            return `$${tvlValue.toLocaleString('en-US', {
              maximumFractionDigits: 2,
            })}`;
          })()}
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <div className="font-medium">24h Volume</div>
        <div>
          $
          {Number(displayVault.pool?.volume_24h_USD || 0).toLocaleString(
            'en-US',
            { maximumFractionDigits: 2 }
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <div className="font-medium">24h Fees</div>
        <div>
          $
          {Number(displayVault.pool?.fees_24h_USD || 0).toLocaleString(
            'en-US',
            { maximumFractionDigits: 2 }
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <div className="font-medium">APR</div>
        <div className="font-bold text-green-600">
          {Number(displayVault.apr || vault.apr || 0).toLocaleString('en-US', {
            maximumFractionDigits: 2,
          })}
          %
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <Link
          href={`/vault/${displayVault.address}`}
          className="w-full border border-[#2D2D2D] bg-[#FFCD4D] hover:bg-[#FFD56A] text-black rounded-2xl shadow-[2px_2px_0px_0px_#000] px-4 py-2 text-center"
        >
          View Vault
        </Link>
      </div>
    </div>
  );
});

export default VaultCard;
