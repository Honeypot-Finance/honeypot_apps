import { useUserBgtVaults } from '@/lib/hooks/useUserBgtVaults';
import { BGTVault } from '@/services/contract/bgt-market/bgt-vault';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useState } from 'react';
import { Address, formatEther } from 'viem';
import { LoadingDisplay } from '../LoadingDisplay/LoadingDisplay';
import Button from '../button/v3';
import { wallet } from '@honeypot/shared/lib/wallet';
import { ADDRESS_ZERO } from '@cryptoalgebra/sdk';
import { truncate } from '@/lib/format';
import { Tooltip } from '@nextui-org/react';
import Image from 'next/image';
import { bgtRegistry } from '@/services/contract/bgt-registry';

export const UserBgtVaults = observer(() => {
  const { bgtVaults, loading } = useUserBgtVaults();

  return (
    <div className="w-full h-full rounded-[24px]  bg-white p-5 overflow-hidden">
      <div className="flex items-center gap-2">
        <span className="w-full text-black text-base md:text-xl font-bold text-center">
          My Vaults
        </span>
      </div>
      {loading ? (
        <div className="w-full h-full p-10">
          <LoadingDisplay />
        </div>
      ) : (
        <div className="flex flex-col gap-2 overflow-y-scroll h-[calc(100%-20px)]">
          {bgtVaults
            .filter((vault) => Number(vault.userBgtInVault) > 0)
            .map((vault) => (
              <Tooltip content={vault.name} closeDelay={0}>
                <div
                  className="relative flex justify-between items-center m-1 p-2 rounded-md bg-black/10 text-black group overflow-hidden"
                  key={vault.address}
                >
                  <span className="flex justify-center">
                    <Image
                      src={vault.logoURI}
                      alt={''}
                      width={20}
                      height={20}
                    />
                  </span>
                  <span>{truncate(vault.name, 8)}</span>{' '}
                  <span className="flex justify-center">
                    {Number(formatEther(BigInt(vault.userBgtInVault))).toFixed(
                      5
                    )}{' '}
                    BGT
                  </span>
                  <div className="absolute w-[95%] transition-all duration-300 translate-y-full group-hover:translate-y-0">
                    {vault.bgtVaultApproved ? (
                      <Button
                        className="bg-[red] w-full m-0"
                        onPress={() => vault.setOperator(ADDRESS_ZERO)}
                      >
                        Unapprove
                      </Button>
                    ) : (
                      <Button
                        className="bg-[green] w-full m-0"
                        onPress={() =>
                          vault.setOperator(
                            bgtRegistry.addresses.bgtMarket as Address
                          )
                        }
                      >
                        Approve
                      </Button>
                    )}
                  </div>
                </div>
              </Tooltip>
            ))}

          {bgtVaults.filter((vault) => Number(vault.userBgtInVault) > 0)
            .length === 0 && (
            <div className="flex justify-center text-black/50 h-[200px] items-center">
              No Vaults
            </div>
          )}
        </div>
      )}
    </div>
  );
});
