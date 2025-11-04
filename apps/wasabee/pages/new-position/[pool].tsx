import PageContainer from '@/components/algebra/common/PageContainer';
import PageTitle from '@/components/algebra/common/PageTitle';
import LiquidityChart from '@/components/algebra/create-position/LiquidityChart';
import RangeSelector from '@/components/algebra/create-position/RangeSelector';
import PresetTabs from '@/components/algebra/create-position/PresetTabs';
import { Bound } from '@cryptoalgebra/sdk';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { Address } from 'viem';
import AmountsSection from '@/components/algebra/create-position/AmountsSection';
import { useCurrency } from '@/lib/algebra/hooks/common/useCurrency';
import { ManageLiquidity } from '@/types/algebra/types/manage-liquidity';
import {
  useDerivedMintInfo,
  useMintActionHandlers,
  useMintState,
  useRangeHopCallbacks,
} from '@/lib/algebra/state/mintStore';
import {
  useReadAlgebraPoolToken0,
  useReadAlgebraPoolToken1,
} from '@honeypot/shared/wagmi-generated';
import { DynamicFormatAmount } from '@honeypot/shared/lib/utils/formatAmount';
import { useParams, useSearchParams } from 'next/navigation';
import { Button } from '@nextui-org/react';
import Container from '@/components/multichain-design/Container';
import Image from 'next/image';

type NewPositionPageParams = Record<'pool', Address>;

const NewPositionPage = () => {
  const router = useRouter();
  const { pool: poolAddress } = router.query as { pool: Address };
  const searchParams = useSearchParams();
  const leftrange = searchParams?.get('leftrange');
  const rightrange = searchParams?.get('rightrange');
  const [useNative, setUseNative] = useState(true);

  const { data: token0 } = useReadAlgebraPoolToken0({
    address: poolAddress,
  });

  const { data: token1 } = useReadAlgebraPoolToken1({
    address: poolAddress,
  });

  const currencyA = useCurrency(token0, useNative);
  const currencyB = useCurrency(token1, useNative);

  const mintInfo = useDerivedMintInfo(
    currencyA ?? undefined,
    currencyB ?? undefined,
    poolAddress,
    100,
    currencyA ?? undefined,
    undefined
  );

  const { [Bound.LOWER]: priceLower, [Bound.UPPER]: priceUpper } =
    mintInfo.pricesAtTicks;

  const price = useMemo(() => {
    if (!mintInfo.price) return;

    return mintInfo.invertPrice
      ? mintInfo.price.invert().toSignificant(5)
      : mintInfo.price.toSignificant(5);
  }, [mintInfo]);

  const currentPrice = useMemo(() => {
    if (!mintInfo.price) return;
    return DynamicFormatAmount({
      amount: price ?? '',
      decimals: 5,
      endWith: currencyB?.symbol,
      className: 'text-white',
    });
  }, [mintInfo.price, price]);

  const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = useMemo(() => {
    return mintInfo.ticks;
  }, [mintInfo]);

  const {
    getDecrementLower,
    getIncrementLower,
    getDecrementUpper,
    getIncrementUpper,
  } = useRangeHopCallbacks(
    currencyA ?? undefined,
    currencyB ?? undefined,
    mintInfo.tickSpacing,
    tickLower,
    tickUpper,
    mintInfo.pool
  );

  const { onLeftRangeInput, onRightRangeInput } = useMintActionHandlers(
    mintInfo.noLiquidity
  );

  const { startPriceTypedValue } = useMintState();

  useEffect(() => {
    if (leftrange && rightrange) {
      onLeftRangeInput(leftrange as string);
      onRightRangeInput(rightrange as string);
    } else if (leftrange) {
      onLeftRangeInput(leftrange as string);
    } else if (rightrange) {
      onRightRangeInput(rightrange as string);
    } else if (!leftrange && !rightrange) {
      onLeftRangeInput('0');
      onRightRangeInput('∞');
    }
  }, [leftrange, rightrange, mintInfo.poolState]);

  return (
    <div className="container mx-auto font-gliker">
      <PageContainer>
        <div className="max-w-screen-xl mx-auto px-2 sm:px-4 md:px-8">
          <Button
            onClick={() => router.push('/pools')}
            className="flex items-center gap-2 text-white text-xl px-0 mb-6"
          >
            <Image
              src="/images/icons/left_arrow.svg"
              alt="Back"
              width={27}
              height={27}
            />
            <span className="text-white/70">Back to Pools</span>
          </Button>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-[#4E3318] flex items-center justify-center flex-shrink-0">
              <Image
                src="/images/bera/labo-bera.svg"
                alt="Bera"
                width={28}
                height={28}
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Create position
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
            {/* Section 1: Select Range */}
            <div className="flex flex-col">
              <div className="bg-[#1B1308] rounded-lg p-6 border border-[#3B2712]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <h2 className="text-lg font-semibold text-white">
                    1. Select Range
                  </h2>
                  <PresetTabs
                    currencyA={currencyA}
                    currencyB={currencyB}
                    mintInfo={mintInfo}
                  />
                </div>

                <div className="flex flex-col md:flex-row md:flex-wrap gap-4 mb-6">
                  <div className="flex-1 min-w-0">
                    <RangeSelector
                      priceLower={priceLower}
                      priceUpper={priceUpper}
                      getDecrementLower={getDecrementLower}
                      getIncrementLower={getIncrementLower}
                      getDecrementUpper={getDecrementUpper}
                      getIncrementUpper={getIncrementUpper}
                      onLeftRangeInput={onLeftRangeInput}
                      onRightRangeInput={onRightRangeInput}
                      currencyA={currencyA}
                      currencyB={currencyB}
                      mintInfo={mintInfo}
                      disabled={!startPriceTypedValue && !mintInfo.price}
                    />
                  </div>

                  <div className="flex flex-col gap-2 w-full md:w-auto md:min-w-[200px]">
                    <div className="text-sm uppercase !text-white">
                      Current Price
                    </div>
                    <div className="bg-[#271A0C] border border-[#3B2712] rounded-lg px-4 py-3 !text-white font-semibold text-lg text-center">
                      {currentPrice}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <LiquidityChart
                    currencyA={currencyA}
                    currencyB={currencyB}
                    currentPrice={price ? parseFloat(price) : undefined}
                    priceLower={priceLower}
                    priceUpper={priceUpper}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Enter Amounts */}
            <div className="flex flex-col">
              <div className="bg-[#1B1308] rounded-lg p-6 border border-[#3B2712]">
                <h2 className="text-lg font-semibold text-white mb-6">
                  2. Enter amount
                </h2>
                <AmountsSection
                  currencyA={currencyA}
                  currencyB={currencyB}
                  mintInfo={mintInfo}
                  useNative={useNative}
                  setUseNative={setUseNative}
                  manageLiquidity={ManageLiquidity.ADD}
                />
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
};

export default NewPositionPage;
