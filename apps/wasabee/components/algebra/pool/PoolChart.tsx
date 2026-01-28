import {
  Pool,
} from '@/lib/algebra/graphql/generated/graphql';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { DynamicFormatAmount } from '@honeypot/shared/lib/utils/formatAmount';
import { format } from 'date-fns';

interface PoolChartProps {
  pool: Pool;
}

type chartType = 'tvl' | 'volume' | 'fees';
type timeRange = '1D' | '1W' | '1M' | '6M' | 'ALL';

const PoolChart = observer(({ pool }: PoolChartProps) => {
  const [currentChartData, setCurrentChartData] = useState<
    {
      date: number;
      value: number;
    }[]
  >([]);
  const [selectedChartType, setSelectedChartType] = useState<chartType>('tvl');
  const [selectedTimeRange, setSelectedTimeRange] = useState<timeRange>('ALL');

  useEffect(() => {
    // Time-series data (poolDayData/poolHourData) is not available on BSC subgraph
    // Chart will show empty state
    setCurrentChartData([]);
  }, [pool, selectedChartType, selectedTimeRange]);

  return (
    <div className="w-full h-[400px] bg-[#140E06] rounded-lg p-6 border border-[#3B2712]">
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-4">
        <div className="flex flex-wrap gap-1 bg-[#2D2115] p-1 rounded-lg">
          {[
            { key: 'tvl', label: 'TVL' },
            { key: 'volume', label: 'Volume' },
            { key: 'fees', label: 'Fees' },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={cn(
                'px-4 py-2 rounded-md text-sm flex-1 sm:flex-none transition-colors',
                selectedChartType === key
                  ? 'bg-[#FDB500] text-black font-medium'
                  : 'bg-transparent text-white/70 hover:text-white'
              )}
              onClick={() => setSelectedChartType(key as chartType)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1 bg-[#2D2115] p-1 rounded-lg">
          {(['1D', '1W', '1M', '6M', 'ALL'] as timeRange[]).map((range) => (
            <button
              key={range}
              className={cn(
                'px-3 py-2 rounded-md text-xs flex-1 sm:flex-none transition-colors',
                selectedTimeRange === range
                  ? 'bg-[#FDB500] text-black font-medium'
                  : 'bg-transparent text-white/70 hover:text-white'
              )}
              onClick={() => setSelectedTimeRange(range)}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={400 - 100}>
        <AreaChart data={currentChartData}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FDB500" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#FDB500" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: '#9CA3AF' }}
            tickFormatter={(unixTime) => {
              const date = new Date(unixTime * 1000);
              return selectedTimeRange === '1D'
                ? format(date, 'HH:mm')
                : selectedTimeRange === '1W'
                ? format(date, 'EEE')
                : selectedTimeRange === '1M'
                ? format(date, 'MMM d')
                : format(date, 'MMM d, yyyy');
            }}
          />
          <YAxis
            orientation="right"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: '#9CA3AF' }}
            tickMargin={15}
          />
          <CartesianGrid
            strokeDasharray="5 5"
            stroke="white"
            strokeOpacity={0.1}
            vertical={true}
            horizontal={false}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#FDB500"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorValue)"
          />
          <Tooltip
            content={(props: TooltipProps<number, string>) => (
              <CustomTooltip
                {...props}
                labelFormatter={(unixTime: number) => {
                  const date = new Date(unixTime * 1000);
                  return selectedTimeRange === '1D'
                    ? format(date, 'MMM d, yyyy HH:mm')
                    : format(date, 'MMM d, yyyy');
                }}
              />
            )}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});

const CustomTooltip = ({
  active,
  payload,
  label,
  labelFormatter,
}: TooltipProps<number, string> & {
  labelFormatter?: (value: any, index?: number) => string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1A0F06] p-3 rounded-lg border border-[#6B4423]">
        <p className="text-xs text-gray-400 mb-1">
          {labelFormatter ? labelFormatter(label, 0) : label}
        </p>
        <p className="text-sm font-medium text-white">
          {DynamicFormatAmount({
            amount: payload[0].value?.toString() ?? '0',
            decimals: 2,
            endWith: '$',
          })}
        </p>
      </div>
    );
  }
  return null;
};

export default PoolChart;
