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
import { MdOutlineLoop } from 'react-icons/md';

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
        } gap-x-3 ${isMobile ? 'w-full' : 'w-full md:w-auto'} gap-2`}
      >
        {token0?.address && token1?.address && (
          <Link
            href={`/swap?inputCurrency=${token0?.address}&outputCurrency=${token1?.address}`}
            className="w-full md:w-auto"
          >
            <Button className="w-full rounded-xl bg-white hover:bg-gray-100 py-4 px-6 text-black font-medium flex items-center gap-2 min-w-[120px] justify-center h-12">
              <MdOutlineLoop className="w-5 h-5" />
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
              className="w-full rounded-xl bg-[#6B4423] hover:bg-[#7D5434] py-4 px-6 text-white font-medium flex items-center gap-2 min-w-[160px] justify-center h-12"
              onPress={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = `/new-position/${poolId}`;
                }
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M12 8V16M8 12H16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Create position
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
              <h1 className="scroll-m-20 text-xl tracking-tight">
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
        </div>

        {/* Desktop view: Custom layout with buttons before settings */}
        {token0?.symbol && token1?.symbol ? (
          <div className="hidden sm:block">
            <div className="flex items-center justify-between w-full mb-3">
              {/* Left side: Logos and title */}
              <div className="flex items-center gap-3.5">
                <TokenPairLogos />
                <h1 className="scroll-m-20 text-2xl tracking-tight md:text-3xl lg:text-4xl">
                  {`${token0?.symbol} / ${token1?.symbol}`}
                </h1>
                <span className="px-3 py-1 font-medium rounded-md text-white border border-[#5A4A4A]/40 bg-[#FFFFFF0D]">{`${poolFee}`}</span>
              </div>

              {/* Right side: Buttons */}
              <div className="flex items-center gap-4">
                <ActionButtons />
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
