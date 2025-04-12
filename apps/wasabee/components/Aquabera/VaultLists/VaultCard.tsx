import { Button } from '@/components/algebra/ui/button';
import TokenLogo from '@/components/TokenLogo/TokenLogo';
import { getSingleVaultDetails } from '@/lib/algebra/graphql/clients/vaults';
import { ICHIVaultContract } from '@/services/contract/aquabera/ICHIVault-contract';
import { Token } from '@/services/contract/token';
import { wallet } from '@/services/wallet';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { Skeleton } from '@nextui-org/react';
import { VaultTag } from '../VaultTag';
import Link from 'next/link';
import { getInfoClientByChainId } from '@/lib/hooks/useSubgraphClients';

interface VaultCardProps {
  vault: ICHIVaultContract;
}

const VaultCard = observer(({ vault }: VaultCardProps) => {
  const [vaultContract, setVaultContract] = useState<
    ICHIVaultContract | undefined
  >(undefined);
  const [loading, setLoading] = useState(true);
  const tokenA = Token.getToken({
    address: vault.token0?.address ?? '',
    chainId: wallet.currentChainId.toString(),
  });
  const tokenB = Token.getToken({
    address: vault.token1?.address ?? '',
    chainId: wallet.currentChainId.toString(),
  });
  const infoClient = getInfoClientByChainId(wallet.currentChainId.toString());

  useEffect(() => {
    if (!vault) return;

    async function initializeVault() {
      try {
        setLoading(true);
        const vaultContract = await getSingleVaultDetails(
          infoClient,
          vault.address
        );

        if (vaultContract) {
          await Promise.all([
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

          setVaultContract(vaultContract);
        }
      } catch (error) {
        console.error('Error initializing vault:', error);
      } finally {
        setLoading(false);
      }
    }

    initializeVault();
  }, [vault, tokenA, tokenB]);

  if (loading) {
    return <Skeleton className="h-64 mb-4 bg-white custom-dashed-3xl" />;
  }

  // Use vaultContract for data if available, otherwise fall back to the original vault
  const displayVault = vaultContract || vault;

  return (
    <div className="mb-4 p-4 bg-white custom-dashed-3xl">
      {vaultContract?.vaultTag && (
        <VaultTag
          tag={vaultContract.vaultTag.tag}
          bgColor={vaultContract.vaultTag.bgColor}
          textColor={vaultContract.vaultTag.textColor}
          tooltip={vaultContract.vaultTag.tooltip}
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
            {tokenA.symbol}/{tokenB.symbol}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <div className="font-medium">Allow Token</div>
        {vault.allowToken0 && (
          <div className="flex items-center gap-1">
            <TokenLogo token={tokenA} size={20} />
            <span>{tokenA.symbol}</span>
          </div>
        )}
        {vault.allowToken1 && (
          <div className="flex items-center gap-1">
            <TokenLogo token={tokenB} size={20} />
            <span>{tokenB.symbol}</span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-3">
        <div className="font-medium">Vault TVL</div>
        <div>
          $
          {Number(displayVault.tvlUSD || 0).toLocaleString('en-US', {
            maximumFractionDigits: 2,
          })}
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
          {Number(displayVault.apr || 0).toLocaleString('en-US', {
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
