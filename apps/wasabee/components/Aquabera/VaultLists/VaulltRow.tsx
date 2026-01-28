import { TokenLogo } from '@honeypot/shared/components/TokenLogo/TokenLogo';
import { DynamicFormatAmount } from '@honeypot/shared/lib/utils/formatAmount';
import { ICHIVaultContract } from '@honeypot/shared/lib/contract/aquabera/ICHIVault-contract';
import {
  useReadIchiVaultAllowToken0,
  useReadIchiVaultAllowToken1,
} from '@honeypot/shared/wagmi-generated';
import { Skeleton, Tooltip } from '@nextui-org/react';
import { InfoIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { VaultTag } from '../VaultTag';

export const VaultRow = observer(({ vault, index }: { vault: ICHIVaultContract, index?: number }) => {
  // Use fully initialized tokens from parent - no additional setup needed!
  const tokenA = vault.token0;
  const tokenB = vault.token1;

  const isTokenAAllowed = useReadIchiVaultAllowToken0({
    address: vault.address,
  });

  const isTokenBAllowed = useReadIchiVaultAllowToken1({
    address: vault.address,
  });

  return (
    <tr
      className="bg-[#1C1208] hover:bg-[#241809] transition-colors cursor-pointer rounded-lg"
      onClick={() => (window.location.href = `/vault/${vault.address}`)}
    >
      {/* Token pair */}
      <td className="py-5 px-6 rounded-l-lg">
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
              <p className="text-white font-medium">
                {tokenA?.symbol || 'Token'}/{tokenB?.symbol || 'Token'}
              </p>
            </div>
          </div>
        </div>
      </td>
      {/* allow token */}
      <td className="py-5 px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {isTokenAAllowed.data && tokenA && <TokenLogo token={tokenA} size={24} />}
            {isTokenBAllowed.data && tokenB && <TokenLogo token={tokenB} size={24} />}
          </div>
          <div className="flex">
            <p className="text-white font-medium">
              {isTokenAAllowed.data && tokenA?.symbol}
              {isTokenBAllowed.data && tokenB?.symbol}
            </p>
          </div>
        </div>
      </td>
      <td className="py-5 px-6 text-right text-white">
        {DynamicFormatAmount({
          amount: vault.tvlUSD ?? 0,
          decimals: 3,
          beginWith: ' $',
        })}
      </td>
      <td className="py-5 px-6 text-right text-white rounded-r-lg">
      </td>
    </tr>
  );
});

export default VaultRow;
