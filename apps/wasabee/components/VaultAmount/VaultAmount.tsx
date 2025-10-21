import { Input } from '@/components/input';
import { InputProps } from '@nextui-org/react';

import { Token } from '@honeypot/shared/lib/contract/token/token';
import { TokenSelector } from '@honeypot/shared/components/TokenSelector';
import { cn } from '@/lib/tailwindcss';
import { TokenLogo } from '@honeypot/shared/components/TokenLogo/TokenLogo';

import { ICHIVaultContract } from '@honeypot/shared/lib/contract/aquabera/ICHIVault-contract';
import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';

type VaultAmountProps = {
  vaultContract: ICHIVaultContract;
  onAmountChange: (amount0: string, amount1: string) => void;
  values: { amount0: string; amount1: string };
};

export const VaultAmount = observer(
  ({ vaultContract, onAmountChange, values }: VaultAmountProps) => {
    const [vault, setVault] = useState<ICHIVaultContract | null>(null);
    useEffect(() => {
      setVault(vaultContract);
    }, [vaultContract]);

    return (
      <div className="flex-1 w-full flex flex-col gap-y-3">
        {/* Token A Section - Only shown if allowed */}
        {vault?.allowToken0 && (
          <>
            <div className="text-black flex items-center justify-between">
              <span>Token A</span>
              <div className="flex items-center gap-x-2">
                <div>Balance: {vault?.token0?.balanceFormatted}</div>
                <div
                  className="cursor-pointer underline"
                  onClick={() => {
                    onAmountChange(
                      vault?.token0?.balance.toFixed() ?? '0',
                      values.amount1
                    );
                  }}
                >
                  Max
                </div>
              </div>
            </div>
            <div className="w-full rounded-2xl border border-black shadow-[0px_332px_93px_0px_rgba(0,0,0,0.00),0px_212px_85px_0px_rgba(0,0,0,0.01),0px_119px_72px_0px_rgba(0,0,0,0.05),0px_53px_53px_0px_rgba(0,0,0,0.09),0px_13px_29px_0px_rgba(0,0,0,0.10)] flex items-center justify-between px-4 py-2.5 gap-x-2">
              {vault?.token0 && <TokenLogo token={vault.token0} />}
              <Input
                type="number"
                placeholder="0.00"
                isClearable
                value={values.amount0}
                onChange={(e) => onAmountChange(e.target.value, values.amount1)}
                onClear={() => onAmountChange('0', values.amount1)}
                isInvalid={
                  vault?.token0 &&
                  Number(values.amount0) > vault.token0.balance.toNumber()
                }
                classNames={{
                  base: cn(
                    'text-right',
                    '!bg-transparent',
                    '[&_*]:!bg-transparent',
                    'data-[invalid=true]:!bg-transparent'
                  ),
                  inputWrapper: cn(
                    '!bg-transparent',
                    'border-none',
                    'shadow-none',
                    '!transition-none',
                    'data-[invalid=true]:!bg-transparent',
                    'group-data-[invalid=true]:!bg-transparent'
                  ),
                  input: cn(
                    '!bg-transparent',
                    '!text-[#202020]',
                    'text-right',
                    'text-xl',
                    '!pr-0',
                    '[appearance:textfield]',
                    '[&::-webkit-outer-spin-button]:appearance-none',
                    '[&::-webkit-inner-spin-button]:appearance-none',
                    'data-[invalid=true]:!bg-transparent'
                  ),
                  clearButton: cn(
                    'opacity-70',
                    'hover:opacity-100',
                    '!text-black',
                    '!p-0'
                  ),
                }}
              />
            </div>
          </>
        )}

        {/* Token B Section - Only shown if allowed */}
        {vault?.allowToken1 && (
          <>
            <div className="text-black flex items-center justify-between">
              <span>Token B</span>
              <div className="flex items-center gap-x-2">
                <div>Balance: {vault?.token1?.balanceFormatted}</div>
                <div
                  className="cursor-pointer underline"
                  onClick={() => {
                    onAmountChange(
                      values.amount0,
                      vault?.token1?.balance.toFixed() ?? '0'
                    );
                  }}
                >
                  Max
                </div>
              </div>
            </div>
            <div className="w-full rounded-2xl border border-black shadow-[0px_332px_93px_0px_rgba(0,0,0,0.00),0px_212px_85px_0px_rgba(0,0,0,0.01),0px_119px_72px_0px_rgba(0,0,0,0.05),0px_53px_53px_0px_rgba(0,0,0,0.09),0px_13px_29px_0px_rgba(0,0,0,0.10)] flex items-center justify-between px-4 py-2.5 gap-x-2">
              {vault?.token1 && <TokenLogo token={vault.token1} />}
              <Input
                type="number"
                placeholder="0.00"
                isClearable
                value={values.amount1}
                onChange={(e) => onAmountChange(values.amount0, e.target.value)}
                onClear={() => onAmountChange(values.amount0, '0')}
                isInvalid={
                  vault?.token1 &&
                  Number(values.amount1) > vault.token1.balance.toNumber()
                }
                classNames={{
                  base: cn(
                    'text-right',
                    '!bg-transparent',
                    '[&_*]:!bg-transparent',
                    'data-[invalid=true]:!bg-transparent'
                  ),
                  inputWrapper: cn(
                    '!bg-transparent',
                    'border-none',
                    'shadow-none',
                    '!transition-none',
                    'data-[invalid=true]:!bg-transparent',
                    'group-data-[invalid=true]:!bg-transparent'
                  ),
                  input: cn(
                    '!bg-transparent',
                    '!text-[#202020]',
                    'text-right',
                    'text-xl',
                    '!pr-0',
                    '[appearance:textfield]',
                    '[&::-webkit-outer-spin-button]:appearance-none',
                    '[&::-webkit-inner-spin-button]:appearance-none',
                    'data-[invalid=true]:!bg-transparent'
                  ),
                  clearButton: cn(
                    'opacity-70',
                    'hover:opacity-100',
                    '!text-black',
                    '!p-0'
                  ),
                }}
              />
            </div>
          </>
        )}
      </div>
    );
  }
);
