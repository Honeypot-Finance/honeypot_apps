import PageContainer from '@/components/algebra/common/PageContainer';
import ActiveFarming from '@/components/algebra/farming/ActiveFarming';
import MyPositions from '@/components/algebra/pool/MyPositions';
import MyPositionsToolbar from '@/components/algebra/pool/MyPositionsToolbar';
import PoolHeader from '@/components/algebra/pool/PoolHeader';
import PositionCard from '@/components/algebra/position/PositionCard';
import { Button } from '@/components/algebra/ui/button';
import { Skeleton } from '@/components/algebra/ui/skeleton';
import { useActiveFarming } from '@/lib/algebra/hooks/farming/useActiveFarming';
import { useClosedFarmings } from '@/lib/algebra/hooks/farming/useClosedFarmings';
import { usePool } from '@/lib/algebra/hooks/pools/usePool';
import { usePositions } from '@/lib/algebra/hooks/positions/usePositions';
import { getPositionAPR } from '@/lib/algebra/utils/positions/getPositionAPR';
import { getPositionFees } from '@/lib/algebra/utils/positions/getPositionFees';
import { formatAmountWithAlphabetSymbol } from '@/lib/algebra/utils/common/formatAmount';
import { Position, ZERO } from '@cryptoalgebra/sdk';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import {
  useEffect,
  useMemo,
  useState,
  useDeferredValue,
  startTransition,
  useCallback,
} from 'react';
import { useAccount } from 'wagmi';
import JSBI from 'jsbi';
import {
  useSinglePoolQuery,
  usePoolFeeDataQuery,
  useNativePriceQuery,
  Pool,
} from '@/lib/algebra/graphql/generated/graphql';
import { FormattedPosition } from '@/types/algebra/types/formatted-position';
import { Address, zeroAddress } from 'viem';
import { cn } from '@/lib/tailwindcss';

import { Token } from '@honeypot/shared/lib/contract/token/token';
import CardContainer from '@/components/CardContianer/v3';
import { useRouter } from 'next/router';
import { wallet } from '@honeypot/shared/lib/wallet';
import { observer } from 'mobx-react-lite';
import { LoadingContainer } from '@/components/LoadingDisplay/LoadingDisplay';
import { Tab, Tabs } from '@nextui-org/react';
import PoolStatsCard from '@/components/algebra/pool/PoolStatsCard';
import dynamic from 'next/dynamic';


const TopPoolPositions = dynamic(
  () => import('@/components/algebra/pool/TopPoolPositions'),
  {
    loading: () => (
      <div className="w-full h-[300px] bg-gray-100 rounded-xl animate-pulse" />
    ),
    ssr: false,
  }
);

const PoolPage = observer(() => {
  const { address: account } = useAccount();
  const [token0, setToken0] = useState<Token | null>(null);
  const [token1, setToken1] = useState<Token | null>(null);

  const router = useRouter();
  const { pool: poolId } = router.query as { pool: Address | undefined };

  const [selectedPositionId, selectPosition] = useState<number | null>();

  const [, poolEntity] = usePool(poolId ?? zeroAddress);

  const { data: poolInfo } = useSinglePoolQuery({
    variables: {
      poolId: poolId?.toLowerCase() ?? '',
    },
  });

  const { data: poolFeeData } = usePoolFeeDataQuery({
    variables: {
      poolId: poolId?.toLowerCase() ?? '',
    },
  });

  const { data: bundles } = useNativePriceQuery();
  const nativePrice = bundles?.bundles[0].maticPriceUSD;

  // Defer heavy calculations to avoid blocking
  const deferredPoolInfo = useDeferredValue(poolInfo);
  const deferredNativePrice = useDeferredValue(nativePrice);

  useEffect(() => {
    if (!wallet.isInit) return;
    if (poolInfo?.pool?.token0.id) {
      startTransition(() => {
        setToken0(
          Token.getToken({
            address: poolInfo.pool!.token0.id,
            force: true,
            chainId: wallet.currentChainId.toString(),
          })
        );
      });
    }
  }, [poolInfo?.pool?.token0.id, wallet.isInit]);

  useEffect(() => {
    if (!wallet.isInit) return;
    if (poolInfo?.pool?.token1.id) {
      startTransition(() => {
        setToken1(
          Token.getToken({
            address: poolInfo.pool!.token1.id,
            force: true,
            chainId: wallet.currentChainId.toString(),
          })
        );
      });
    }
  }, [poolInfo?.pool?.token1.id, wallet.isInit]);

  const { farmingInfo, deposits, isFarmingLoading, areDepositsLoading } =
    useActiveFarming({
      poolId: poolId ? (poolId.toLowerCase() as Address) : zeroAddress,
      poolInfo: poolInfo,
    });

  const { closedFarmings } = useClosedFarmings({
    poolId: poolId ? (poolId.toLowerCase() as Address) : zeroAddress,
    poolInfo: poolInfo,
  });

  const [positionsFees, setPositionsFees] = useState<any>();
  const [positionsAPRs, setPositionsAPRs] = useState<any>();

  const { positions, loading: positionsLoading } = usePositions();

  // Memoize filtered positions separately
  const filteredPositions = useMemo(() => {
    if (!positions || !poolEntity || !poolId) return [];

    console.log(positions);

    return positions
      .filter(({ pool }) => pool.toLowerCase() === poolId?.toLowerCase())
      .map((position) => ({
        positionId: position.tokenId,
        position: new Position({
          pool: poolEntity,
          liquidity: position.liquidity.toString(),
          tickLower: Number(position.tickLower),
          tickUpper: Number(position.tickUpper),
        }),
      }));
  }, [positions, poolEntity, poolId]);

  // Debounce expensive fee calculations
  useEffect(() => {
    if (!filteredPositions.length) return;

    const timeoutId = setTimeout(() => {
      async function getPositionsFees() {
        const fees = await Promise.all(
          filteredPositions.map(({ positionId, position }) =>
            getPositionFees(position.pool, positionId)
          )
        );
        startTransition(() => {
          setPositionsFees(fees);
        });
      }
      getPositionsFees();
    }, 100); // Small delay to batch operations

    return () => clearTimeout(timeoutId);
  }, [filteredPositions]);

  // Debounce expensive APR calculations
  useEffect(() => {
    if (!poolId || !filteredPositions.length) return;

    const timeoutId = setTimeout(() => {
      async function getPositionsAPRs() {
        const aprs = await Promise.all(
          filteredPositions.map(({ position }) =>
            getPositionAPR(
              poolId?.toLowerCase() as Address,
              position,
              deferredPoolInfo?.pool,
              poolFeeData?.poolDayDatas,
              deferredNativePrice
            )
          )
        );
        startTransition(() => {
          setPositionsAPRs(aprs);
        });
      }

      if (
        filteredPositions &&
        deferredPoolInfo?.pool &&
        poolFeeData?.poolDayDatas &&
        bundles?.bundles &&
        poolId.toLowerCase()
      )
        getPositionsAPRs();
    }, 150); // Slightly longer delay for heavier calculation

    return () => clearTimeout(timeoutId);
  }, [
    filteredPositions,
    deferredPoolInfo,
    poolId,
    poolFeeData,
    bundles,
    deferredNativePrice,
  ]);

  // Memoize expensive formatting functions
  const formatLiquidityUSD = useCallback(
    (position: Position) => {
      if (!deferredPoolInfo?.pool || !deferredNativePrice) return 0;

      const amount0USD =
        Number(position.amount0.toSignificant()) *
        (Number(deferredPoolInfo.pool.token0.derivedMatic) *
          Number(deferredNativePrice));
      const amount1USD =
        Number(position.amount1.toSignificant()) *
        (Number(deferredPoolInfo.pool.token1.derivedMatic) *
          Number(deferredNativePrice));

      return amount0USD + amount1USD;
    },
    [deferredPoolInfo?.pool, deferredNativePrice]
  );

  const formatFeesUSD = useCallback(
    (idx: number) => {
      if (
        !positionsFees ||
        !positionsFees[idx] ||
        !deferredPoolInfo?.pool ||
        !deferredNativePrice
      )
        return 0;

      const fees0USD = positionsFees[idx][0]
        ? Number(positionsFees[idx][0].toSignificant()) *
          (Number(deferredPoolInfo.pool.token0.derivedMatic) *
            Number(deferredNativePrice))
        : 0;
      const fees1USD = positionsFees[idx][1]
        ? Number(positionsFees[idx][1].toSignificant()) *
          (Number(deferredPoolInfo.pool.token1.derivedMatic) *
            Number(deferredNativePrice))
        : 0;

      return fees0USD + fees1USD;
    },
    [positionsFees, deferredPoolInfo?.pool, deferredNativePrice]
  );

  const formatAPR = useCallback(
    (idx: number) => {
      if (!positionsAPRs || !positionsAPRs[idx]) return 0;
      return positionsAPRs[idx];
    },
    [positionsAPRs]
  );

  // Break down heavy positions data calculation
  const positionsData = useMemo(() => {
    if (!filteredPositions || !poolEntity || !deposits) return [];

    // Process in smaller chunks to avoid blocking
    return filteredPositions.map(({ positionId, position }, idx) => {
      const currentPosition = deposits.deposits.find(
        (deposit) => Number(deposit.id) === Number(positionId)
      );

      return {
        id: positionId,
        isClosed: JSBI.EQ(position.liquidity, ZERO),
        outOfRange:
          poolEntity.tickCurrent < position.tickLower ||
          poolEntity.tickCurrent > position.tickUpper,
        range: `${formatAmountWithAlphabetSymbol(
          position.token0PriceLower.toFixed(6),
          6
        )} — ${formatAmountWithAlphabetSymbol(
          position.token0PriceUpper.toFixed(6),
          6
        )}`,
        liquidityUSD: formatLiquidityUSD(position),
        feesUSD: formatFeesUSD(idx),
        apr: formatAPR(idx),
        inFarming: Boolean(currentPosition?.eternalFarming),
        position: position, // Add position entity for range visualization
        poolEntity: poolEntity, // Add pool entity for range visualization
      } as FormattedPosition;
    });
  }, [
    filteredPositions,
    poolEntity,
    deposits,
    formatLiquidityUSD,
    formatFeesUSD,
    formatAPR,
  ]);

  const selectedPosition = useMemo(() => {
    if (!positionsData || !selectedPositionId) return;

    return positionsData.find(
      ({ id }) => Number(id) === Number(selectedPositionId)
    );
  }, [selectedPositionId, positionsData]);

  const noPositions =
    (!positionsLoading || !isFarmingLoading || !areDepositsLoading) &&
    positionsData.length === 0 &&
    poolEntity;

  return (
    <div className="container mx-auto font-gliker">
      <div className="max-w-screen-xl mx-auto px-2 sm:px-4 md:px-8">
        <Button
          onClick={() => router.push('/pools')}
          className="flex items-center gap-2 text-white text-xl px-0"
        >
          <Image
            src="/images/icons/left_arrow.svg"
            alt="Back"
            width={27}
            height={27}
          />
          <span className="text-white/70">Back to Pools</span>
        </Button>
      </div>
      <PageContainer>
        <CardContainer className="gap-y-6 border-none bg-transparent !px-0">
          <LoadingContainer isLoading={!poolEntity}>
            <PoolHeader
              pool={poolEntity}
              token0={token0}
              token1={token1}
              poolId={poolId ? poolId : zeroAddress}
            />

            <div className="w-full">
              <PoolStatsCard pool={poolInfo?.pool as Pool} />
            </div>

            <Tabs
              classNames={{
                base: 'relative w-full [&>div]:!mt-0 [&>div]:!pt-0',
                tabList: 'flex rounded-lg bg-[#1A0F06] p-1 gap-1 w-auto !mb-0 !pb-0',
                cursor: 'bg-[#6B4423] rounded-md',
                panel: 'w-full !mt-0 !pt-0',
                tab: 'px-4 py-2 text-sm font-medium min-w-[100px]',
                tabContent:
                  'text-white group-data-[selected=true]:text-white group-data-[selected=false]:text-white group-data-[selected=false]:opacity-50',
              }}
            >
              <Tab
                key="top-positions"
                title={
                  <span className="text-xs sm:text-base">Top Positions</span>
                }
              >
                {poolEntity && (
                  <TopPoolPositions
                    poolId={poolId ? poolId : zeroAddress}
                    poolEntity={poolEntity}
                  />
                )}
              </Tab>
              <Tab
                key="my-positions"
                title={
                  <span className="text-xs sm:text-base">My Positions</span>
                }
              >
                {!account ? (
                  <NoAccount />
                ) : positionsLoading ||
                  isFarmingLoading ||
                  areDepositsLoading ? (
                  <LoadingState />
                ) : noPositions ? (
                  <NoPositions poolId={poolId ? poolId : zeroAddress} />
                ) : (
                  <>
                    <MyPositions
                      positions={positionsData}
                      poolId={poolId ? poolId : zeroAddress}
                      selectedPosition={selectedPosition?.id}
                      selectPosition={(positionId) =>
                        selectPosition((prev) =>
                          prev === positionId ? null : positionId
                        )
                      }
                      farming={farmingInfo}
                      closedFarmings={closedFarmings}
                    />
                    {farmingInfo &&
                      deposits &&
                      !isFarmingLoading &&
                      !areDepositsLoading && (
                        <div className="mt-8">
                          <h2 className="font-semibold text-xl text-white mb-4">
                            Farming
                          </h2>
                          <ActiveFarming
                            deposits={deposits && deposits.deposits}
                            farming={farmingInfo}
                            positionsData={positionsData}
                          />
                        </div>
                      )}
                  </>
                )}
              </Tab>
            </Tabs>
          </LoadingContainer>
        </CardContainer>
      </PageContainer>
    </div>
  );
});

const NoPositions = ({ poolId }: { poolId: Address }) => (
  <div className="flex flex-col items-center justify-center animate-fade-in py-16 px-8">
    <Image
      src="/images/bera/labo-bera.svg"
      alt="No positions"
      width={200}
      height={200}
      className="mb-6"
    />
    <h2 className="text-2xl font-bold text-white mb-2">
      You don't have positions for this pool
    </h2>
    <p className="text-gray-400 text-base mb-6">
      Create a position in a few easy steps!
    </p>
    <Button className="gap-2" asChild>
      <Link
        className={cn(
          'flex items-center gap-x-2 px-6 py-3 cursor-pointer bg-[#FDB500] rounded-lg hover:bg-[#FFD666] text-black font-medium'
        )}
        href={`/new-position/${poolId.toLowerCase()}`}
      >
        <Plus className="text-black w-5 h-5" />
        <span className="text-black">Create Position</span>
      </Link>
    </Button>
  </div>
);

const NoAccount = () => {
  return (
    <div className="flex flex-col items-start p-8 bg-card border border-card-border rounded-3xl animate-fade-in text-white">
      <h2 className="text-2xl font-bold">Connect Wallet</h2>
      <p className="text-md font-semibold my-4">
        Connect your account to view or create positions
      </p>
    </div>
  );
};

const LoadingState = () => (
  <div className="flex flex-col w-full gap-4 p-4">
    {[1, 2, 3, 4].map((v) => (
      <Skeleton
        key={`position-skeleton-${v}`}
        className="w-full h-[50px] bg-card-light rounded-xl"
      />
    ))}
  </div>
);

export default PoolPage;
