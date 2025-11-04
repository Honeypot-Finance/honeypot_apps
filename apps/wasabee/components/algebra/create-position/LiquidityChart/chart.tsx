// import { formatNumber } from "app/functions"
import {
  BarChart,
  ResponsiveContainer,
  XAxis,
  Bar,
  Cell,
  Tooltip,
} from 'recharts';
import { useState, useMemo } from 'react';
import { Currency } from '@cryptoalgebra/sdk';

interface CustomBarProps {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  isCurrent: boolean;
}

interface CustomTooltipProps {
  props: any;
  currencyA: Currency | undefined;
  currencyB: Currency | undefined;
  currentPrice: number | undefined;
}

interface ChartProps {
  formattedData: any;
  currencyA: Currency | undefined;
  currencyB: Currency | undefined;
  leftPrice: string | undefined;
  rightPrice: string | undefined;
  currentPrice: number | undefined;
  isSorted: boolean | undefined;
  zoom: number;
}

const CustomBar = ({
  x,
  y,
  width,
  height,
  fill,
  isCurrent,
}: CustomBarProps) => {
  return (
    <g>
      <defs>
        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="100%">
          <stop offset="0" stopColor="#2797ff" />
          <stop offset="1" stopColor="rgba(35, 133, 222, 0.05)" />
        </linearGradient>
      </defs>
      {isCurrent && (
        <text
          x={x + 10}
          y={y - 10}
          fill="#FFFFFF"
          fontSize={'14px'}
          fontWeight={600}
          textAnchor="middle"
        >
          Current Price
        </text>
      )}
      <rect
        x={x}
        y={y}
        fill={fill}
        width={width > 2 ? width : 2}
        height={height}
        rx="4"
      />
    </g>
  );
};

const CustomTooltip = ({ props, currencyA, currencyB }: CustomTooltipProps) => {
  const price0 = props?.payload?.[0]?.payload.price0;
  const price1 = props?.payload?.[0]?.payload.price1;
  // const tvlToken0 = props?.payload?.[0]?.payload.tvlToken0
  // const tvlToken1 = props?.payload?.[0]?.payload.tvlToken1

  return (
    <div className="flex flex-col gap-2 p-4 rounded-2xl bg-[#13192894] backdrop-blur-sm">
      <div className="flex gap-4 justify-between">
        <div>{`${currencyA?.symbol} Price:`}</div>
        <div>{`${
          price0
            ? `${Number(price0).toLocaleString(undefined, {
                maximumSignificantDigits: 3,
              })} ${currencyB?.symbol}`
            : ''
        }`}</div>
      </div>
      <div className="flex gap-4 justify-between">
        <div>{`${currencyB?.symbol} Price:`}</div>
        <div>{`${
          price1
            ? `${Number(price1).toLocaleString(undefined, {
                maximumSignificantDigits: 3,
              })} ${currencyA?.symbol}`
            : ''
        }`}</div>
      </div>
      {/* {currentPrice && price0 && currentPrice > price1 ? <div className="flex gap-4 justify-between">
            <div>{`${currencyA?.symbol} Locked: `}</div>
            <div>{`${tvlToken0 ? formatNumber(tvlToken0) : ''} ${currencyA?.symbol}`}</div>
        </div> : <div className="flex gap-4 justify-between">
            <div>{`${currencyB?.symbol} Locked: `}</div>
            <div>{`${tvlToken1 ? formatNumber(tvlToken1) : ''} ${currencyB?.symbol}`}</div>
        </div>} */}
    </div>
  );
};

export function Chart({
  formattedData,
  currencyA,
  currencyB,
  leftPrice,
  rightPrice,
  currentPrice,
  isSorted,
  zoom,
}: ChartProps) {
  const [focusBar, setFocusBar] = useState<number | undefined>(undefined);

  // Check if there's valid range data
  const hasValidRange = leftPrice && rightPrice;

  // Check if there are any active positions
  const hasOtherPositions = useMemo(() => {
    if (!formattedData) return false;
    return formattedData.some((data: any) => data.activeLiquidity > 0);
  }, [formattedData]);

  return (
    <>
      {hasValidRange ? (
        <ResponsiveContainer width={'100%'} height={250}>
          <BarChart
            data={formattedData}
            margin={{
              top: 30,
              right: 0,
              left: 0,
              bottom: 0,
            }}
            barCategoryGap={zoom > 30 ? 3 : 1.5}
            onMouseMove={(state) => {
              if (state.isTooltipActive) {
                setFocusBar(state.activeTooltipIndex);
              } else {
                setFocusBar(undefined);
              }
            }}
            className="[&>svg]:overflow-visible"
          >
            <Tooltip
              cursor={false}
              content={(props) => (
                <CustomTooltip
                  props={props}
                  currencyA={currencyA}
                  currencyB={currencyB}
                  currentPrice={currentPrice}
                />
              )}
            />

            <XAxis
              reversed={true}
              tick={(props) => {
                const isSmallScreen =
                  props.width < 600 && props.visibleTicksCount > 10;
                const isEdgeTick =
                  (props.index >= 1 && props.index <= 2) ||
                  (props.index >= props.visibleTicksCount - 2 &&
                    props.index <= props.visibleTicksCount);

                if (!props?.payload || props.index % 2 === 0)
                  return <text></text>;

                return (
                  <text
                    x={props.x}
                    y={props.y + 20}
                    fill="#FFFFFF"
                    textAnchor="middle"
                    fontSize={'12px'}
                    width={'12px'}
                  >
                    {!isSmallScreen || isEdgeTick
                      ? props.payload.value.toFixed(3)
                      : ''}
                  </text>
                );
              }}
              dataKey={isSorted ? 'price0' : 'price1'}
              interval={12}
              offset={0}
              tickLine={false}
              tickFormatter={(v) => v.toFixed(3)}
            />

            <Bar
              dataKey={hasOtherPositions ? 'activeLiquidity' : 'defaultHeight'}
              fill="#2172E5"
              isAnimationActive={false}
              shape={(props: any) => {
                // If no other positions, set a default height
                const isInRange =
                  props.payload.price0 >= Number(leftPrice) &&
                  props.payload.price0 <= Number(rightPrice);

                const height = hasOtherPositions
                  ? props.height
                  : isInRange
                  ? 150
                  : 0;

                const baseY = 60; // Base Y position for the bars
                const y = hasOtherPositions ? props.y : baseY;

                const x = props.x;

                return (
                  <CustomBar
                    height={height}
                    width={props.width}
                    x={x}
                    y={y}
                    fill={props.fill}
                    isCurrent={props.isCurrent}
                  />
                );
              }}
            >
              {formattedData?.map((entry: any, index: number) => {
                let fill = '#FFF8E7';

                const value = isSorted ? entry.price0 : entry.price1;

                if (focusBar === index) {
                  fill = '#FFE7B3';
                } else if (entry.isCurrent) {
                  fill = '#FFCD4D';
                } else if (leftPrice && rightPrice) {
                  if (
                    Number(value) >= Number(leftPrice) &&
                    Number(value) <= Number(rightPrice)
                  ) {
                    fill = '#FFE199';
                  }
                }

                return <Cell key={`cell-${index}`} fill={fill} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="w-full h-[250px] flex items-center justify-center bg-[#131929] rounded-xl">
          <div className="text-center">
            <div className="text-white/50 text-sm mb-2">
              Select a price range to view liquidity distribution
            </div>
            <div className="flex flex-col items-center gap-2">
              <svg
                className="w-16 h-16 text-[#2797ff]/30"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span className="text-[#2797ff]/50 text-xs">
                Chart will appear here
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
