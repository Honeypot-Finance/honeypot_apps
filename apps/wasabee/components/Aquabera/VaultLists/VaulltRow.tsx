import { TokenLogo } from '@honeypot/shared';
import { DynamicFormatAmount } from '@honeypot/shared';
import { ICHIVaultContract } from '@honeypot/shared';
import {
  useReadIchiVaultAllowToken0,
  useReadIchiVaultAllowToken1,
} from '@honeypot/shared/wagmi-generated';
import { Skeleton, Tooltip } from '@nextui-org/react';
import { InfoIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { VaultTag } from '../VaultTag';

export const VaultRow = observer(({ vault }: { vault: ICHIVaultContract }) => {
  // Use fully initialized tokens from parent - no additional setup needed!
  const tokenA = vault.token0;
  const tokenB = vault.token1;

  const isTokenAAllowed = useReadIchiVaultAllowToken0({
    address: vault.address,
  });

  const isTokenBAllowed = useReadIchiVaultAllowToken1({
    address: vault.address,
  });

  const volume = Number(vault.pool?.volume_24h_USD || 0);
  const fees = Number(vault.pool?.fees_24h_USD || 0);

  return (
    <tr
      className="transition-colors bg-[#86715B] text-black hover:bg-gray-50 cursor-pointer"
      onClick={() => (window.location.href = `/vault/${vault.address}`)}
    >
      {/* Token pair */}
      <td className="py-4 px-6">
        <div>
          {vault?.vaultTag && (
            <VaultTag
              tag={vault.vaultTag.tag}
              bgColor={vault.vaultTag.bgColor}
              textColor={vault.vaultTag.textColor}
              tooltip={vault.vaultTag.tooltip}
            />
          )}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {tokenA && <TokenLogo
                token={tokenA}
                addtionalClasses="translate-x-[25%]"
                size={24}
              />}
              {tokenB && <TokenLogo
                token={tokenB}
                addtionalClasses="translate-x-[-25%]"
                size={24}
              />}
            </div>
            <div className="flex flex-col">
              <p className="text-black font-medium">
                {tokenA?.symbol || 'Token'}/{tokenB?.symbol || 'Token'}
              </p>
            </div>
          </div>
        </div>
      </td>
      {/* allow token */}
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {isTokenAAllowed.data && tokenA && <TokenLogo token={tokenA} size={24} />}
            {isTokenBAllowed.data && tokenB && <TokenLogo token={tokenB} size={24} />}
          </div>
          <div className="flex">
            <p className="text-black font-medium">
              {isTokenAAllowed.data && tokenA?.symbol}
              {isTokenBAllowed.data && tokenB?.symbol}
            </p>
          </div>
        </div>
      </td>
      {/* vault address */}
      {/* <td className="py-4 px-6 text-black">{vault.id}</td> */}
      {/* apr */}
      <td className="py-4 px-6 text-right text-black">
        {DynamicFormatAmount({
          amount: vault.tvlUSD ?? 0,
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
          {vault.apr?.toFixed(2) || '0.00'}%
          <Tooltip
            content={
              <div>
                <p>1d: {vault.detailedApr?.feeApr_1d?.toFixed(5) || '0.00000'}%</p>
                <p>3d: {vault.detailedApr?.feeApr_3d?.toFixed(5) || '0.00000'}%</p>
                <p>7d: {vault.detailedApr?.feeApr_7d?.toFixed(5) || '0.00000'}%</p>
                <p>30d: {vault.detailedApr?.feeApr_30d?.toFixed(5) || '0.00000'}%</p>
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
