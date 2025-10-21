import {
  Pool,
  PoolHourData,
  PoolDayData,
} from '@/lib/algebra/graphql/generated/graphql';
import {
  Area,
  AreaChart,
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
    if (!pool.poolDayData) return;

    let filteredData: PoolDayData[] | PoolHourData[] = [];
    const now = Math.floor(Date.now() / 1000);

    // Filter data based on time range
    switch (selectedTimeRange) {
      case '1D':
        filteredData = [...pool.poolHourData]
          .filter((day) => now - day.periodStartUnix <= 86400)
          .sort((a, b) => a.periodStartUnix - b.periodStartUnix);
        break;
      case '1W':
        filteredData = [...pool.poolDayData]
          .filter((day) => now - day.date <= 604800)
          .sort((a, b) => a.date - b.date);
        break;
      case '1M':
        filteredData = [...pool.poolDayData]
          .filter((day) => now - day.date <= 2592000)
          .sort((a, b) => a.date - b.date);
        break;
      case '6M':
        filteredData = [...pool.poolDayData]
          .filter((day) => now - day.date <= 15552000)
          .sort((a, b) => a.date - b.date);
        break;
      case 'ALL':
        filteredData = [...pool.poolDayData].sort((a, b) => a.date - b.date);
        break;
    }

    // Map data based on selected chart type
    const mappedData = filteredData.map((timeData) => ({
      date:
        timeData.__typename === 'PoolDayData'
          ? timeData.date
          : timeData.__typename === 'PoolHourData'
          ? timeData.periodStartUnix
          : 0,
      value: parseFloat(
        selectedChartType === 'tvl'
          ? timeData.tvlUSD
          : selectedChartType === 'volume'
          ? timeData.volumeUSD
          : timeData.feesUSD
      ),
    }));

    setCurrentChartData(mappedData);
  }, [pool, selectedChartType, selectedTimeRange]);

  return (
    <div className="w-full h-[400px] bg-[#271A0C] rounded-[24px] p-4 border border-black shadow-[4px_4px_0px_0px_#D29A0D]">
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-4">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'tvl', label: 'TVL' },
            { key: 'volume', label: 'Volume' },
            { key: 'fees', label: 'Fees' },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={cn(
                'px-4 py-2 rounded-lg bg-[#86715B] text-sm flex-1 sm:flex-none',
                selectedChartType === key && 'bg-black text-white'
              )}
              onClick={() => setSelectedChartType(key as chartType)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {(['1D', '1W', '1M', '6M', 'ALL'] as timeRange[]).map((range) => (
            <button
              key={range}
              className={cn(
                'px-3 py-1 rounded-lg bg-[#86715B] text-xs flex-1 sm:flex-none',
                selectedTimeRange === range && 'bg-black text-white'
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
              <stop offset="5%" stopColor="#FFCD4D" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#FFCD4D" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
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
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#FFCD4D"
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
      <div className="bg-white p-2 rounded-lg border border-black shadow-md">
        <p className="text-sm font-medium text-black">
          {labelFormatter ? labelFormatter(label, 0) : label}
        </p>
        <p className="text-sm font-medium text-black">
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
