import PageContainer from "@/components/algebra/common/PageContainer";
import PageTitle from "@/components/algebra/common/PageTitle";
import LiquidityChart from "@/components/algebra/create-position/LiquidityChart";
import RangeSelector from "@/components/algebra/create-position/RangeSelector";
import PresetTabs from "@/components/algebra/create-position/PresetTabs";
import { Bound } from "@cryptoalgebra/sdk";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Address } from "viem";
import AmountsSection from "@/components/algebra/create-position/AmountsSection";
import { useCurrency } from "@/lib/algebra/hooks/common/useCurrency";
import { ManageLiquidity } from "@/types/algebra/types/manage-liquidity";
import {
  useDerivedMintInfo,
  useMintActionHandlers,
  useMintState,
  useRangeHopCallbacks,
} from "@/lib/algebra/state/mintStore";
import {
  useReadAlgebraPoolToken0,
  useReadAlgebraPoolToken1,
} from "@/wagmi-generated";
import { DynamicFormatAmount } from "@/lib/algebra/utils/common/formatAmount";

type NewPositionPageParams = Record<"pool", Address>;

const NewPositionPage = () => {
  const router = useRouter();
  const { pool: poolAddress } = router.query as { pool: Address };
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
  const a = 1;

  const currentPrice = useMemo(() => {
    if (!mintInfo.price) return;
    return DynamicFormatAmount({
      amount: price ?? "",
      decimals: 5,
      endWith: currencyB?.symbol,
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
    return () => {
      onLeftRangeInput("");
      onRightRangeInput("");
    };
  }, []);

  return (
    <PageContainer>
      <div className="max-w-[1200px] w-full mx-auto bg-[#FFCD4D] rounded-3xl relative overflow-hidden">
        {/* 顶部装饰边框 */}
        <div className="bg-[url('/images/pumping/outline-border.png')] bg-contain bg-repeat-x bg-left-top h-[60px] absolute -top-1 left-0 w-full"></div>

        <div className="max-w-[1200px] w-full mx-auto px-6 pt-[60px] pb-[70px]">
          {/* <PageTitle title={"Create Position"} /> */}
          <div className="font-gliker text-[rgba(32,32,32,1)] text-2xl">
            Create Position
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-8 gap-x-0 gap-y-8 w-full lg:gap-8 text-left mt-6">
            <div className="col-span-5">
              <div className="flex max-md:flex-col md:items-center justify-between w-full mb-6 gap-4">
                <h2 className="text-base text-[#202020] font-gliker">
                  1. Select Range
                </h2>
                <PresetTabs
                  currencyA={currencyA}
                  currencyB={currencyB}
                  mintInfo={mintInfo}
                />
              </div>

              <div className="flex flex-col w-full">
                <div className="w-full rounded-[32px] bg-white space-y-4 px-6 py-8 border-[1px] border-[#000000] shadow-[4px_4px_0px_0px_rgba(210,154,13,1)]">
                  <div className="flex w-full flex-col md:flex-row gap-4 flex-wrap">
                    <div className="range-selector-container">
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

                    <div className="md:ml-auto flex-1 flex flex-col gap-y-3 flex-shrink-0 min-w-[235px]">
                      <div className="text-[rgba(32,32,32,1)] font-gliker text-base">
                        CURRENT PRICE
                      </div>
                      <div className="font-bold text-xl text-black border-[1px] border-[#000000] shadow-[1px_2px_0px_0px_rgba(32,32,32,1),1px_1px_0px_0px_rgba(32,32,32,1)] rounded-[16px] px-4 h-[64px] line-[64px] leading-[64px]">
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
            </div>

            <div className="flex flex-col col-span-3">
              <div className="text-[rgba(32,32,32,1)] mb-6 leading-[44px] font-gliker text-base mt-[-10px]">
                2. Enter Amounts
              </div>
              <div className="w-full rounded-[32px] bg-white space-y-4 px-6 py-8 border-[1px] border-[#000000] shadow-[4px_4px_0px_0px_rgba(210,154,13,1)]">
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

        {/* 底部装饰边框 */}
        <div className="absolute -bottom-1 left-0 w-full">
          <div className="bg-[url('/images/pool-detail/bottom-border.svg')] bg-contain bg-repeat-x bg-left-bottom h-[70px] w-full"></div>
        </div>
      </div>
    </PageContainer>
  );
};

export default NewPositionPage;
