import CurrencyLogo from '@/components/algebra/common/CurrencyLogo';
import PageTitle from '@/components/algebra/common/PageTitle';
import { Skeleton } from '@/components/algebra/ui/skeleton';
import { TokenLogo } from '@honeypot/shared/components/TokenLogo/TokenLogo';
import { useCurrency } from '@/lib/algebra/hooks/common/useCurrency';
import { formatPercent } from '@/lib/algebra/utils/common/formatPercent';
import { AlgebraPoolContract } from '@/services/contract/algebra/algebra-pool-contract';
import { Address } from 'viem';

import { Token } from '@honeypot/shared/lib/contract/token/token';
import { Pool } from '@cryptoalgebra/sdk';
import { observer } from 'mobx-react-lite';
import { wallet } from '@honeypot/shared/lib/wallet';
import { Button, Link } from '@nextui-org/react';
import Settings from '@/components/algebra/common/Settings';

interface PoolHeaderProps {
  pool: Pool | null;
  poolId: Address | null;
  token0: Token | null;
  token1: Token | null;
}

const PoolHeader = observer(
  ({ pool, token0, token1, poolId }: PoolHeaderProps) => {
    const poolFee = pool && formatPercent.format(pool.fee / 10_00000);

    // Logo component to avoid duplication
    const TokenPairLogos = () => (
      <div className="flex">
        <div className="z-10">
          {token0?.address && (
            <TokenLogo
              size={40}
              token={Token.getToken({
                address: token0.address,
                chainId: wallet.currentChainId.toString(),
              })}
            />
          )}
        </div>
        <div className="-ml-4">
          {token1?.address && (
            <TokenLogo
              size={40}
              token={Token.getToken({
                address: token1.address,
                chainId: wallet.currentChainId.toString(),
              })}
            />
          )}
        </div>
      </div>
    );

    // Button component to avoid duplication
    const ActionButtons = ({ isMobile = false }) => (
      <div
        className={`inline-flex flex-wrap ${
          isMobile ? 'flex-row' : 'md:flex-nowrap'
        } rounded-[16px] border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] gap-x-3 p-2 ${
          isMobile ? 'w-full' : 'w-full md:w-auto'
        } gap-2`}
      >
        {token0?.address && token1?.address && (
          <Link
            href={`/swap?inputCurrency=${token0?.address}&outputCurrency=${token1?.address}`}
            className="w-full md:w-auto"
          >
            <Button className="w-full rounded-[8px] border border-black bg-[#FFCD4D] p-2 text-[#202020] shadow-[2px_2px_0px_0px_#000] hover:translate-y-[2px] hover:shadow-[2px_1px_0px_0px_#000] active:translate-y-[2px] active:shadow-none">
              Swap
            </Button>
          </Link>
        )}
        {poolId && (
          <Link
            href={`/new-position/${poolId}`}
            className={`${isMobile ? 'w-full' : 'w-full md:w-auto'}`}
            as="a"
          >
            <Button
              className="w-full rounded-[8px] border border-black bg-[#FFCD4D] p-2 text-[#202020] shadow-[2px_2px_0px_0px_#000] hover:translate-y-[2px] hover:shadow-[2px_1px_0px_0px_#000] active:translate-y-[2px] active:shadow-none"
              onPress={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = `/new-position/${poolId}`;
                }
              }}
            >
              Create Position
            </Button>
          </Link>
        )}
      </div>
    );

    return (
      <div className="flex flex-col w-full">
        {/* Mobile view: Logo, Name and Settings in one row */}
        <div className="flex items-center w-full justify-between mb-3 sm:hidden">
          <div className="flex items-center gap-3.5">
            <TokenPairLogos />

            {/* Token title - mobile only */}
            {token0?.symbol && token1?.symbol ? (
              <h1 className="scroll-m-20 text-xl font-bold tracking-tight">
                {`${token0?.symbol} / ${token1?.symbol}`}
              </h1>
            ) : (
              <Skeleton className="w-[150px] h-[32px] bg-card" />
            )}

            {/* Fee badge - mobile, appears next to title */}
            {poolFee && (
              <span className="px-2 py-1 text-sm font-medium rounded-full text-[#479FFF] border border-[#E18A20]/40 bg-[#E18A20]/20">{`${poolFee}`}</span>
            )}
          </div>

          {/* Settings - mobile only */}
          <div>{token0?.symbol && token1?.symbol && <Settings />}</div>
        </div>

        {/* Desktop view: Custom layout with buttons before settings */}
        {token0?.symbol && token1?.symbol ? (
          <div className="hidden sm:block">
            <div className="flex items-center justify-between w-full mb-3">
              {/* Left side: Logos and title */}
              <div className="flex items-center gap-3.5">
                <TokenPairLogos />
                <h1 className="scroll-m-20 text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
                  {`${token0?.symbol} / ${token1?.symbol}`}
                </h1>
                <span className="px-3 py-2 font-medium rounded-full text-[#479FFF] border border-[#E18A20]/40 bg-[#E18A20]/20">{`${poolFee}`}</span>
              </div>

              {/* Right side: Buttons and settings */}
              <div className="flex items-center gap-4">
                <ActionButtons />
                <Settings />
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden sm:block">
            <Skeleton className="w-[200px] h-[40px] bg-card" />
          </div>
        )}

        {/* Mobile buttons row - full width */}
        {token0?.symbol && token1?.symbol && (
          <div className="block sm:hidden w-full">
            <ActionButtons isMobile={true} />
          </div>
        )}
      </div>
    );
  }
);

export default PoolHeader;
