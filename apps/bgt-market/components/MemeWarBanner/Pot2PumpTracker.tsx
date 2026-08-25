import { toCompactLocaleString } from '@/lib/utils';
import { popmodal } from '@/services/popmodal';
import { Button } from '@nextui-org/react';
import { observer } from 'mobx-react-lite';
import dynamic from 'next/dynamic';
import { TokenLogo } from '@honeypot/shared';
import { useEffect, useState } from 'react';
import { fetchMemetrackerList, Pair } from '@/lib/algebra/graphql/clients/pair';
import { wallet } from '@honeypot/shared/lib/wallet';

import { Token } from '@honeypot/shared';
import { trpcClient } from '@/lib/trpc';
import { MemePairContract } from '@/services/contract/launches/pot2pump/memepair-contract';
import { LaunchDetailSwapCard } from '../SwapCard/MemeSwap';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export const Pot2PumpTracker = observer(() => {
  const [chartSeriesData, setChartSeriesData] = useState<
    (Pair & {
      logoUrl?: string;
    })[]
  >([]);

  useEffect(() => {
    if (!wallet.isInit) {
      return;
    }

    fetchMemetrackerList({
      chainId: wallet.currentChainId.toString(),
    }).then(async (data) => {
      const pairs: (Pair & {
        logoUrl?: string;
      })[] = data.data.pairs;

      for (const pair of pairs) {
        const databaseInfo = trpcClient.projects.getProjectInfo.query({
          pair: pair.id,
          chain_id: wallet.currentChainId,
        });

        pair.logoUrl = (await databaseInfo)?.logo_url;
      }
      setChartSeriesData(pairs);
    });
  }, [wallet.isInit]);

  const state: {
    series: ApexAxisChartSeries;
    options: ApexCharts.ApexOptions;
  } = {
    series: chartSeriesData.map((pair) => {
      return {
        name: pair.token0?.symbol,
        data: [
          {
            x: Number(pair.token0?.holderCount) ?? 0,
            y:
              Number(pair.token0.derivedUSD) *
              (Number(pair.token0.totalSupply) /
                Math.pow(10, Number(pair.token0.decimals))),
            meta: { pair },
          },
        ],
      };
    }),

    options: {
      title: {
        text: 'Meme Token Tracker',
        align: 'center',
        style: {
          color: 'white',
          fontSize: '2rem',
        },
        offsetY: 30,
      },
      chart: {
        type: 'scatter',
        animations: {
          enabled: false,
        },
        zoom: {
          enabled: true,
          type: 'xy',
          allowMouseWheelZoom: true,
          autoScaleYaxis: true,
        },
        toolbar: {
          show: true,
          tools: {
            download: false,
            selection: false,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true,
          },
        },
        events: {
          markerClick(e, chart, options) {
            console.log(e, chart, options);
            const target = chartSeriesData[options.seriesIndex];

            popmodal.openModal({
              content: (
                <LaunchDetailSwapCard
                  noBoarder
                  memePairContract={target as unknown as MemePairContract}
                  inputAddress={target.token1.id}
                  outputAddress={target.token0.id}
                />
              ),
            });
            // window
            //   .open(`/launch-detail/${target.pairAddress}`, "_blank")
            //   ?.focus();
          },
        },
      },
      colors: ['orange'],
      xaxis: {
        tickAmount: 10,
        // min: 0,
        // max: 40,
        title: {
          text: 'Holders →',
          offsetY: -40,
          style: {
            color: 'white',
          },
        },
        axisBorder: {
          show: true,
          offsetY: 25,
          offsetX: -45,
        },
        labels: {
          show: true,
        },
        axisTicks: {
          show: true,
        },
      },
      yaxis: {
        title: {
          text: 'Market Cap →',
          offsetX: 10,
          style: {
            color: 'white',
          },
        },
        labels: {
          show: true,
          formatter: (value) => {
            return toCompactLocaleString(value, {
              maximumFractionDigits: 0,
            });
          },
        },
        axisBorder: {
          show: true,
          offsetY: 25,
          offsetX: 6,
        },

        tickAmount: 10,
        axisTicks: {
          show: true,
        },
        // tickAmount: 7,
      },
      markers: {
        size: 20,
      },
      grid: {
        borderColor: 'transparent',
        show: false,
        padding: {
          left: 60,
          right: 30,
          top: 30,
          bottom: 30,
        },
      },
      stroke: {
        show: false,
      },
      tooltip: {
        enabled: true,
        x: {
          // formatter: (value) => `Tx Count: ${value}`,
        },
        y: {
          title: {
            formatter: (seriesName) => `${seriesName}`,
          },
        },
        custom(options) {
          const target = chartSeriesData[options.seriesIndex];
          return `
              <div class="p-2 bg-black/20 rounded-md text-center">
                <h3>${target.token0.symbol}</h3>
                <p>Market Cap: ${toCompactLocaleString(
                  Number(target.token0.derivedUSD) *
                    (Number(target.token0.totalSupply) /
                      Math.pow(10, Number(target.token0.decimals))),
                  {
                    maximumFractionDigits: 3,
                  }
                )}</p> 
                <button
                  class="text-primary  underline"
                >
                  click to buy
                </button>
              </div>
            `;
        },
        theme: 'dark',
        fillSeriesColor: true,
        fixed: {
          enabled: true,
          offsetY: -20,
        },
      },

      fill: {
        type: 'image',
        opacity: 1,
        image: {
          src: chartSeriesData.map((pair) => {
            return pair.logoUrl || '';
          }),
          width: 40,
          height: 40,
        },
      },

      legend: {
        show: false,
        labels: {
          useSeriesColors: true,
        },
      },
    },
  };

  return (
    <div className="relative w-full h-[80vh] md:h-auto m-auto flex-col flex-1 p-2 bg-black/80 rounded-md md:aspect-video max-h-[95vh] max-w-[95%]">
      {state && (
        <Chart
          options={state.options}
          series={state.series}
          type="scatter"
          width="100%"
          height={'100%'}
        />
      )}
    </div>
  );
});
