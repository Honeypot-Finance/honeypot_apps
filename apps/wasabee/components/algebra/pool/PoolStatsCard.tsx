import {
  Pool,
  useActiveFarmingsQuery,
} from '@/lib/algebra/graphql/generated/graphql';
import { DynamicFormatAmount } from '@honeypot/shared/lib/utils/formatAmount';
import { useMemo } from 'react';
import { Address } from 'viem';

import { Token } from '@honeypot/shared/lib/contract/token/token';
import { TokenLogo } from '@honeypot/shared/components/TokenLogo/TokenLogo';
import { wallet } from '@honeypot/shared/lib/wallet';
import { useSubgraphClient } from '@honeypot/shared/hooks/useSubgraphClients';

interface PoolStatsCardProps {
  pool: Pool | null | undefined;
}

export default function PoolStatsCard({ pool }: PoolStatsCardProps) {
  // Hooks need to be called unconditionally at the top
  const farmingClient = useSubgraphClient('algebra_farming');
  const { data: activeFarmings } = useActiveFarmingsQuery({
    client: farmingClient,
  });

  const derivedPoolInfo = useMemo(() => {
    if (!pool) return null;

    const {
      id,
      token0,
      token1,
      fee,
      totalValueLockedUSD,
      feesUSD,
      txCount,
      volumeUSD,
      token0Price,
      createdAtTimestamp,
      liquidity,
      aprPercentage,
    } = pool;

    const apr = Number(aprPercentage || 0);

    const activeFarming = activeFarmings?.eternalFarmings.find(
      (farming) => farming.pool === id
    );

    return {
      id: id as Address,
      pair: {
        token0: Token.getToken({
          address: token0.id,
          chainId: wallet.currentChainId.toString(),
        }),
        token1: Token.getToken({
          address: token1.id,
          chainId: wallet.currentChainId.toString(),
        }),
      },
      fee: Number(fee) / 10_000,
      tvlUSD: Number(totalValueLockedUSD),
      volume24USD: 0,
      fees24USD: 0,
      poolMaxApr: apr,
      poolAvgApr: apr,
      farmApr: 0,
      avgApr: apr,
      feesUSD,
      hasActiveFarming: Boolean(activeFarming),
      createdAtTimestamp,
      liquidity,
      token0Price,
      changeHour: 0,
      change24h: 0,
      changeWeek: 0,
      changeMonth: 0,
      txCount,
      volumeUSD,
      marketCap: token0.marketCap,
      apr24h: apr.toString(),
      tick: pool?.tick,
    };
  }, [pool, activeFarmings]);

  if (!pool || !derivedPoolInfo) return null;

  return (
    <div className="p-6 flex flex-col bg-[#140E06] border border-[#3B2712] rounded-lg text-white animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-white">Pool Stats</h2>
        <div className="px-3 py-1.5 bg-[#FFCD4D] text-xs font-medium rounded-full text-black">
          {derivedPoolInfo.fee.toFixed(2)}% Fee
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-medium mb-2 text-gray-400">
            Tokens
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div
              key={derivedPoolInfo.pair.token0.symbol}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-[#271A0C] border border-[#3B2712]"
            >
              <TokenLogo
                token={derivedPoolInfo.pair.token0}
                size={20}
                addtionalClasses="w-5 h-5"
              />
              <span className="text-sm font-medium text-white">
                {derivedPoolInfo.pair.token0.symbol}
              </span>
            </div>
            <div
              key={derivedPoolInfo.pair.token1.symbol}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-[#271A0C] border border-[#3B2712]"
            >
              <TokenLogo
                token={derivedPoolInfo.pair.token1}
                size={20}
                addtionalClasses="w-5 h-5"
              />
              <span className="text-sm font-medium text-white">
                {derivedPoolInfo.pair.token1.symbol}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-medium mb-2 text-gray-400">
            Performance
          </h3>
          <div className="flex flex-col gap-1 p-3 rounded-lg bg-[#271A0C] border border-[#3B2712]">
              <h4 className="text-xs text-gray-400">TVL</h4>
              <span className="text-lg font-bold text-white">
                $
                {DynamicFormatAmount({
                  amount: derivedPoolInfo.tvlUSD,
                  decimals: 2,
                })}
              </span>
            </div>
        </div>
      </div>
    </div>
  );
}
