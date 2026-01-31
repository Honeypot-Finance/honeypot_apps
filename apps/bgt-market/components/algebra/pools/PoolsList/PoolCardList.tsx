import { TokenLogo } from '@honeypot/shared';

import { Token } from '@honeypot/shared';
import { wallet } from '@honeypot/shared/lib/wallet';
import { Ellipsis } from 'lucide-react';
import { AvgAPR, Plugins } from '../../common/Table/poolsColumns';
import { formatUSD } from '@/lib/algebra/utils/common/formatUSD';
import { formatPercent } from '@/lib/algebra/utils/common/formatPercent';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';

type TokenAsset = {
  __typename?: string;
  id: string;
  symbol: string;
  name: string;
  decimals: string;
  derivedMatic: string;
};

type Pair = {
  token0: TokenAsset;
  token1: TokenAsset;
};

type Pool = {
  id: string;
  pair: Pair;
  fee: number;
  tvlUSD: number;
  volume24USD: number;
  fees24USD: number;
  poolMaxApr: number;
  poolAvgApr: number;
  farmApr: number;
  avgApr: number;
  hasActiveFarming: boolean;
};

const PoolCardList = observer(({ data }: { data: Pool[] }) => {
  return (
    <div className="xl:hidden flex flex-col gap-y-5">
      {data.map((pool) => {
        const token1 = Token.getToken({
          address: pool.pair.token0.id,
          chainId: wallet.currentChainId.toString(),
        });
        const token2 = Token.getToken({
          address: pool.pair.token1.id,
          chainId: wallet.currentChainId.toString(),
        });

        return (
          <Link
            key={pool.id}
            href={`/pool-detail/${pool.id}`}
            className="honeypot-card px-2.5 py-[14px] break-all space-y-2.5 cursor-pointer"
          >
            <Ellipsis />
            <div className="flex items-center justify-between">
              <span className="text-[#f5f5f5] text-sm">Pool Name</span>
              <div className="flex items-center gap-x-3">
                <div className="flex items-center">
                  <div className="z-10">
                    <TokenLogo size={16} token={token1} />
                  </div>
                  <div className="-ml-1">
                    <TokenLogo size={16} token={token2} />
                  </div>
                </div>
                <span className="text-[#FAFAFC] text-sm">
                  {token1.symbol} - {token2.symbol}
                </span>
                <span className="text-sm text-[#4BDF81]">{`${pool.fee}%`}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/55">Plugins</span>
              <Plugins poolId={pool.id as `0x{string}`} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/55">TVL</span>
              <span className="text-sm text-white">
                {formatUSD.format(pool.tvlUSD)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/55">Volume 24H</span>
              <span className="text-sm text-white">
                {formatUSD.format(pool.volume24USD)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/55">Fees 24H</span>
              <span className="text-sm text-white">
                {formatUSD.format(pool.fees24USD)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/55">Avg. APR</span>
              <AvgAPR
                avgApr={formatPercent.format(pool.poolAvgApr / 100)}
                maxApr={formatPercent.format(pool.poolMaxApr / 100)}
                farmApr={
                  pool.hasActiveFarming
                    ? formatPercent.format(pool.farmApr / 100)
                    : undefined
                }
              >
                {formatPercent.format(pool.poolAvgApr / 100)}
              </AvgAPR>
            </div>
          </Link>
        );
      })}
    </div>
  );
});

export default PoolCardList;
