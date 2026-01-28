import { UserPoolProfit } from "@/lib/algebra/graphql/clients/userProfit";
import { createChart, ColorType, UTCTimestamp } from "lightweight-charts";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useRef } from "react";

export const ProtfolioBalanceChart = observer(
  ({
    timeRange,
    userPoolsProfits,
    onTimeRangeChange,
  }: {
    timeRange: "1D" | "1W" | "1M";
    userPoolsProfits: UserPoolProfit[];
    onTimeRangeChange: (range: "1D" | "1W" | "1M") => void;
  }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);

    const chartData = useMemo(() => {
      const now = new Date();
      const ranges = {
        "1D": 24 * 60 * 60 * 1000, // 1 day in ms
        "1W": 7 * 24 * 60 * 60 * 1000,
        "1M": 30 * 24 * 60 * 60 * 1000,
      };

      const startTime = now.getTime() - ranges[timeRange];

      // Aggregate data based on time range
      const data = userPoolsProfits.reduce(
        (acc, pool) => {
          const hourData = timeRange === "1D" ? pool.pool.poolHoursData : [];
          const dayData = timeRange !== "1D" ? pool.pool.poolDaysData : [];
          const relevantData = timeRange === "1D" ? hourData : dayData;

          relevantData.forEach((dataPoint) => {
            const timestamp = new Date(
              ("date" in dataPoint
                ? dataPoint.date
                : dataPoint.periodStartUnix) * 1000
            ).getTime();
            if (timestamp >= startTime) {
              const time = Math.floor(timestamp / 1000) as UTCTimestamp;
              if (!acc[time]) {
                acc[time] = 0;
              }
              acc[time] += Number(dataPoint.feesUSD);
            }
          });
          return acc;
        },
        {} as Record<number, number>
      );

      // Convert to array format required by the chart
      return Object.entries(data)
        .map(([time, value]) => ({
          time: Number(time) as UTCTimestamp,
          value,
        }))
        .sort((a, b) => a.time - b.time);
    }, [userPoolsProfits, timeRange]);

    useEffect(() => {
      if (!chartContainerRef.current) return;

      const chart = createChart(chartContainerRef.current, {
        width: 511,
        height: 280,
        layout: {
          background: { type: ColorType.Solid, color: "transparent" },
          textColor: "#9ca3af",
        },
        grid: {
          vertLines: { visible: false },
          horzLines: { color: "rgba(255,255,255,0.05)" },
        },
        rightPriceScale: {
          borderVisible: false,
        },
        timeScale: {
          borderVisible: false,
        },
      });

      const areaSeries = chart.addAreaSeries({
        lineColor: "#22c55e",
        topColor: "rgba(34, 197, 94, 0.3)",
        bottomColor: "rgba(34, 197, 94, 0.0)",
        lineWidth: 2,
      });

      areaSeries.setData(chartData);
      chart.timeScale().fitContent();

      return () => {
        chart.remove();
      };
    }, [chartData]);

    const timeRanges: Array<"1D" | "1W" | "1M"> = ["1D", "1W", "1M"];

    return (
      <div>
        <div className="flex gap-2 mb-2">
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => onTimeRangeChange(range)}
              className={`px-3 py-1 text-xs rounded ${
                timeRange === range
                  ? "bg-green-500 text-white"
                  : "bg-gray-800 text-gray-400"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
        <div ref={chartContainerRef} />
      </div>
    );
  }
);

export default ProtfolioBalanceChart;
