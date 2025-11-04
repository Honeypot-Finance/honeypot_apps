import { usePool } from '@/lib/algebra/hooks/pools/usePool';
import {
  usePosition,
  usePositionInFarming,
} from '@/lib/algebra/hooks/positions/usePositions';
import { Position } from '@cryptoalgebra/sdk';
import PositionNFT from '../PositionNFT';
import { Skeleton } from '@/components/algebra/ui/skeleton';
import PositionRangeChart from '../PositionRangeChart';
import TokenRatio from '@/components/algebra/create-position/TokenRatio';
import RemoveLiquidityModal from '@/components/algebra/modals/RemoveLiquidityModal';
import ActiveFarmingCard from '../ActiveFarmingCard';
import ClosedFarmingCard from '../ClosedFarmingCard';
import { IncreaseLiquidityModal } from '@/components/algebra/modals/IncreaseLiquidityModal';
import { useCurrency } from '@/lib/algebra/hooks/common/useCurrency';
import { EternalFarming } from '@/lib/algebra/graphql/generated/graphql';
import { useDerivedMintInfo } from '@/lib/algebra/state/mintStore';
import { formatUSD } from '@/lib/algebra/utils/common/formatUSD';
import { Farming } from '@/types/algebra/types/farming-info';
import { FormattedPosition } from '@/types/algebra/types/formatted-position';
import { DynamicFormatAmount } from '@honeypot/shared/lib/utils/formatAmount';
import { useTransactionAwait } from '@/lib/algebra/hooks/common/useTransactionAwait';
import { NonfungiblePositionManager } from '@cryptoalgebra/sdk';
import { usePositionFees } from '@/lib/algebra/hooks/positions/usePositionFees';
import { useAccount, useContractWrite } from 'wagmi';
import { Address } from 'viem';
import { useSimulateAlgebraPositionManagerMulticall } from '@honeypot/shared/wagmi-generated';
import { TransactionType } from '@/lib/algebra/state/pendingTransactionsStore';
import { useState, useMemo } from 'react';

const PositionCard = ({
  selectedPosition,
  farming,
  closedFarmings,
}: {
  selectedPosition: FormattedPosition | undefined;
  farming?: Farming | null;
  closedFarmings?: EternalFarming[] | null;
}) => {
  const { loading, position } = usePosition(selectedPosition?.id);
  const [useNative, setUseNative] = useState(true);
  const positionInFarming = usePositionInFarming(selectedPosition?.id);
  const positionInEndedFarming = closedFarmings?.filter(
    (closedFarming) => closedFarming.id === positionInFarming?.eternalFarming
  )[0];

  const token0 = position?.token0;
  const token1 = position?.token1;
  const currencyA = useCurrency(token0, useNative);
  const currencyB = useCurrency(token1, useNative);
  const [, pool] = usePool(position?.pool);

  const positionEntity =
    pool &&
    position &&
    new Position({
      pool,
      liquidity: position.liquidity.toString(),
      tickLower: Number(position.tickLower),
      tickUpper: Number(position.tickUpper),
    });

  const mintInfo = useDerivedMintInfo(
    currencyA,
    currencyB,
    position?.pool,
    100,
    currencyA,
    positionEntity || undefined
  );

  const [positionLiquidityUSD, positionFeesUSD, positionAPR] = selectedPosition
    ? [
        DynamicFormatAmount({
          amount: selectedPosition.liquidityUSD.toString(),
          decimals: 3,
          endWith: '$',
        }),
        DynamicFormatAmount({
          amount: selectedPosition.feesUSD.toString(),
          decimals: 5,
          endWith: '$',
        }),
        `${selectedPosition.apr.toFixed(2)}%`,
      ]
    : [];

  // 收集费用功能相关代码
  const { address: account } = useAccount();

  const { amount0, amount1 } = usePositionFees(
    pool ?? undefined,
    selectedPosition?.id,
    false
  );

  const zeroRewards = amount0?.equalTo('0') && amount1?.equalTo('0');

  const { calldata, value } = useMemo(() => {
    if (!account || !amount0 || !amount1 || !selectedPosition)
      return { calldata: undefined, value: undefined };

    return NonfungiblePositionManager.collectCallParameters({
      tokenId: selectedPosition.id.toString(),
      expectedCurrencyOwed0: amount0,
      expectedCurrencyOwed1: amount1,
      recipient: account,
    });
  }, [selectedPosition?.id, amount0, amount1, account]);

  const { data: collectConfig } = useSimulateAlgebraPositionManagerMulticall({
    args: calldata && [calldata as `0x${string}`[]],
    value: BigInt(value || 0),
  });

  const { data: collectData, writeContract: collect } = useContractWrite();

  const { isLoading } = useTransactionAwait(collectData, {
    title: 'Collect fees',
    tokenA: mintInfo.currencies.CURRENCY_A?.wrapped.address as Address,
    tokenB: mintInfo.currencies.CURRENCY_B?.wrapped.address as Address,
    type: TransactionType.POOL,
  });

  const handleCollectFees = () => {
    if (!collectConfig || !collect) return;
    collect(collectConfig.request);
  };

  if (!selectedPosition || loading)
    return (
      <div className="flex flex-col gap-4 rounded-lg p-6 bg-[#140E06] border border-[#3B2712] w-full h-full min-h-[400px]">
        <div className="text-gray-400 flex flex-col gap-2 text-center justify-center items-center h-full">
          Select a position to view details
        </div>
      </div>
    );

  return (
    <div className="flex flex-col gap-4 rounded-lg p-0 bg-transparent text-white">
      {/* Header and Stats Section */}
      <div className="bg-[#271A0C] rounded-lg p-4">
        <div className="flex gap-4 mb-4">
          {/* Left side - Stats */}
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white mb-3">{`Position #${selectedPosition?.id}`}</h2>

            <div className="space-y-3">
              <div>
                <div className="text-xs uppercase text-gray-400 mb-1">LIQUIDITY</div>
                <div className="text-base font-semibold text-white">
                  {positionLiquidityUSD || <Skeleton className="w-16 h-5 bg-[#3B2712]" />}
                </div>
              </div>

              <div>
                <div className="text-xs uppercase text-gray-400 mb-1">APR</div>
                <div className="text-base font-semibold text-[#FDB500]">
                  {positionAPR || <Skeleton className="w-16 h-5 bg-[#3B2712]" />}
                </div>
              </div>

              <div>
                <div className="text-xs uppercase text-gray-400 mb-1">UNCOLLECTED FEES</div>
                <div className="text-base font-semibold text-white">{positionFeesUSD}</div>
              </div>
            </div>
          </div>

          {/* Right side - NFT */}
          <div className="flex-shrink-0">
            <PositionNFT positionId={selectedPosition.id} />
          </div>
        </div>

        <button
          className="w-full bg-[#6B4423] hover:bg-[#7D5434] text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleCollectFees}
          disabled={zeroRewards || isLoading}
        >
          {isLoading ? 'Collecting...' : 'Collect fees'}
        </button>
      </div>

      {/* Token Ratio */}
      <div className="bg-[#271A0C] rounded-lg p-3">
        <div className="text-xs uppercase text-gray-400 mb-2">TOKEN RATIO</div>
        <TokenRatio mintInfo={mintInfo} />
        {positionEntity && (
          <div className="flex justify-between text-sm text-gray-300 mt-3">
            <div>{`${positionEntity.amount0.toFixed(2)} ${
              currencyA?.symbol
            }`}</div>
            <div>{`${positionEntity.amount1.toFixed(2)} ${
              currencyB?.symbol
            }`}</div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="space-y-2">
        {positionEntity && (
          <IncreaseLiquidityModal
            tokenId={Number(selectedPosition.id)}
            currencyA={currencyA}
            currencyB={currencyB}
            mintInfo={mintInfo}
            useNative={useNative}
            setUseNative={setUseNative}
          />
        )}
        {positionEntity && Number(positionEntity.liquidity) > 0 && (
          <RemoveLiquidityModal positionId={selectedPosition.id} />
        )}
      </div>

      {positionInFarming && farming && !positionInEndedFarming && (
        <div className="bg-[#271A0C] rounded-lg p-3">
          <div className="text-xs uppercase text-gray-400 mb-2">FARMING</div>
          <ActiveFarmingCard
            farming={farming}
            selectedPosition={positionInFarming}
          />
        </div>
      )}

      {positionInEndedFarming && (
        <div className="bg-[#271A0C] rounded-lg p-3">
          <div className="text-xs uppercase text-gray-400 mb-2">CLOSED FARMING</div>
          <ClosedFarmingCard
            positionInEndedFarming={positionInEndedFarming}
            selectedPosition={selectedPosition}
          />
        </div>
      )}
    </div>
  );
};

export default PositionCard;
