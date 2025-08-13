import { TokenLogo } from '@honeypot/shared';
import { ICHIVaultContract } from '@honeypot/shared';
import { observer } from 'mobx-react-lite';
import { VaultTag } from '../VaultTag';
import Link from 'next/link';

interface VaultCardProps {
  vault: ICHIVaultContract;
}

const VaultCard = observer(({ vault }: VaultCardProps) => {
  console.log(vault, '#[vaultreinit vault');

  // Use fully initialized tokens from parent - no additional setup needed!
  const tokenA = vault.token0;
  const tokenB = vault.token1;

  return (
    <div className="mb-4 p-4 bg-[#271A0C] custom-dashed-3xl">
      {vault?.vaultTag && (
        <VaultTag
          tag={vault.vaultTag.tag}
          bgColor={vault.vaultTag.bgColor}
          textColor={vault.vaultTag.textColor}
          tooltip={vault.vaultTag.tooltip}
        />
      )}
      <div className="flex justify-between items-center mb-3">
        <div className="font-medium">Token Pair</div>
        <div className="flex items-center">
          <div className="flex items-center">
            {tokenA && (
              <TokenLogo
                token={tokenA}
                addtionalClasses="translate-x-[25%]"
                size={20}
              />
            )}
            {tokenB && (
              <TokenLogo
                token={tokenB}
                addtionalClasses="translate-x-[-25%]"
                size={20}
              />
            )}
          </div>
          <span className="font-bold">
            {tokenA?.symbol || 'Token'}/{tokenB?.symbol || 'Token'}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <div className="font-medium">Allow Token</div>
        {vault.allowToken0 && tokenA && (
          <div className="flex items-center gap-1">
            <TokenLogo token={tokenA} size={20} />
            <span>{tokenA?.symbol || 'Token'}</span>
          </div>
        )}
        {vault.allowToken1 && tokenB && (
          <div className="flex items-center gap-1">
            <TokenLogo token={tokenB} size={20} />
            <span>{tokenB?.symbol || 'Token'}</span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-3">
        <div className="font-medium">Vault TVL</div>
        <div>
          $
          {Number(vault.tvlUSD || 0).toLocaleString('en-US', {
            maximumFractionDigits: 2,
          })}
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <div className="font-medium">24h Volume</div>
        <div>
          $
          {Number(vault.pool?.volume_24h_USD || 0).toLocaleString('en-US', {
            maximumFractionDigits: 2,
          })}
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <div className="font-medium">24h Fees</div>
        <div>
          $
          {Number(vault.pool?.fees_24h_USD || 0).toLocaleString('en-US', {
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

      <div className="mt-4 flex justify-center">
        <Link
          href={`/vault/${vault.address}`}
          className="w-full border border-[#2D2D2D] bg-[#FFCD4D] hover:bg-[#FFD56A] text-black rounded-2xl shadow-[2px_2px_0px_0px_#000] px-4 py-2 text-center"
        >
          View Vault
        </Link>
      </div>
    </div>
  );
});

export default VaultCard;
