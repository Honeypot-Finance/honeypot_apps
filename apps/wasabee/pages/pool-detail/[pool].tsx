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

// Lazy load heavy components to reduce initial bundle size
const PoolChart = dynamic(() => import('@/components/algebra/pool/PoolChart'), {
  loading: () => (
    <div className="w-full h-[400px] bg-gray-100 rounded-xl animate-pulse" />
  ),
  ssr: false,
});

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

            <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
              {poolInfo?.pool && <PoolChart pool={poolInfo.pool as Pool} />}
              <PoolStatsCard pool={poolInfo?.pool as Pool} />
            </div>

            <Tabs
              classNames={{
                tab: 'px-2 sm:px-3 sm:h-10 text-xs sm:text-sm bg-[#86715B]',
                base: 'relative w-full',
                tabList:
                  'flex rounded-[16px] border border-[#202020] bg-white shadow-[4px_4px_0px_0px_#202020,-4px_4px_0px_0px_#202020] p-2 sm:p-3 z-10 max-w-[90%] sm:max-w-none mx-auto absolute left-1/2 -translate-x-1/2 z-10',
                cursor: 'bg-[#202020] !text-white/80 px-2 py-3',
                panel: cn(
                  'flex flex-col h-full w-full gap-y-4 items-center rounded-2xl text-[#202020]',
                  '!mt-0',
                  'h-auto'
                ),
                tabContent: 'text-[#202020] text-sm sm:text-base',
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
                <div className="w-full bg-black rounded-2xl p-4 custom-dashed-3xl border-white">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-0 gap-y-8 w-full lg:gap-8">
                    <div className="lg:col-span-2">
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
                          {/* <MyPositionsToolbar
                        positionsData={positionsData}
                        poolId={poolId ? poolId : zeroAddress}
                      /> */}
                          <MyPositions
                            positions={positionsData}
                            poolId={poolId ? poolId : zeroAddress}
                            selectedPosition={selectedPosition?.id}
                            selectPosition={(positionId) =>
                              selectPosition((prev) =>
                                prev === positionId ? null : positionId
                              )
                            }
                          />
                          {farmingInfo &&
                            deposits &&
                            !isFarmingLoading &&
                            !areDepositsLoading && (
                              <div>
                                <h2 className="font-semibold text-xl text-left mt-12">
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
                    </div>
                    <div className="flex flex-col gap-8 w-full h-full col-span-1">
                      <PositionCard
                        farming={farmingInfo}
                        closedFarmings={closedFarmings}
                        selectedPosition={selectedPosition}
                      />
                    </div>
                  </div>
                </div>
              </Tab>
            </Tabs>
          </LoadingContainer>
        </CardContainer>
      </PageContainer>
    </div>
  );
});

const NoPositions = ({ poolId }: { poolId: Address }) => (
  <div className=" flex flex-col items-start animate-fade-in font-bold px-8 py-16 rounded-[24px] border border-black bg-white shadow-[4px_4px_0px_0px_#D29A0D]">
    <h2 className="text-2xl font-bold text-black">
      {`You don't have positions for this pool`}
    </h2>
    <p className="text-black text-md font-semibold my-4">{`Let's create one!`}</p>
    <Button className="gap-2" asChild>
      <Link
        className={cn(
          'flex items-center gap-x-1 p-2.5 cursor-pointer border border-[#2D2D2D] bg-[#FFCD4D] rounded-2xl shadow-[2px_2px_0px_0px_#000] hover:bg-[#FFD666]'
        )}
        href={`/new-position/${poolId.toLowerCase()}`}
      >
        <Plus className="text-black" />
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
