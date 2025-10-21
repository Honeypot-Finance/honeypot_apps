'use client';
import { Button } from '@nextui-org/react';
import EChartsReact from 'echarts-for-react';
import { useEffect, useMemo, useState } from 'react';

import { PairContract } from '@honeypot/shared/lib/contract/dex/liquidity/pair-contract';
import { Token } from '@honeypot/shared/lib/contract/token/token';
import { useAccount } from 'wagmi';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import {
  ChartingLibraryWidgetOptions,
  ResolutionString,
} from '@/public/static/charting_library/charting_library';
import { pairToTicker, tokenToTicker } from '@/lib/advancedChart.util';

import { chart } from '@honeypot/shared/services';
import { observer } from 'mobx-react-lite';
import { wallet } from '@honeypot/shared/lib/wallet';

const TVChartContainer = dynamic(
  () =>
    import('@/components/AdvancedChart/TVChartContainer/TVChartContainer').then(
      (mod) => mod.TVChartContainer
    ),
  { ssr: false }
);

export const AdvancedPriceFeedGraph = observer(() => {
  const [isScriptReady, setIsScriptReady] = useState(false);
  const { chainId } = useAccount();
  const [defaultWidgetProps, setDefaultWidgetProps] = useState<
    Partial<ChartingLibraryWidgetOptions>
  >({
    symbol:
      chart.chartTarget instanceof Token
        ? tokenToTicker(chart.chartTarget, chainId as number)
        : chart.chartTarget instanceof PairContract
        ? pairToTicker(chart.chartTarget, chainId as number)
        : tokenToTicker(
            Token.getToken({
              address: '0xfc5e3743e9fac8bb60408797607352e24db7d65e', //thpot
              chainId: wallet.currentChainId.toString(),
            }),
            chainId as number
          ),
    interval: '1D' as ResolutionString,
    library_path: '/static/charting_library/charting_library/',
    locale: 'en',
    charts_storage_url: 'https://saveload.tradingview.com',
    charts_storage_api_version: '1.1',
    client_id: 'tradingview.com',
    user_id: 'public_user_id',
    fullscreen: false,
    autosize: true,
    theme: 'dark',
  });

  useEffect(() => {
    console.log('chart.chartTarget', chart.chartTarget);
    if (!chainId || !chart.chartTarget) return;
    setDefaultWidgetProps((prev) => {
      return {
        ...prev,
        symbol:
          chart.chartTarget instanceof Token
            ? tokenToTicker(chart.chartTarget, chainId as number)
            : chart.chartTarget instanceof PairContract
            ? pairToTicker(chart.chartTarget, chainId as number)
            : tokenToTicker(
                Token.getToken({
                  address: '0xfc5e3743e9fac8bb60408797607352e24db7d65e', //thpot
                  chainId: wallet.currentChainId.toString(),
                }),
                chainId as number
              ),
      };
    });
  }, [chainId, chart.chartTarget]);

  return (
    <>
      <Script
        src="/static/charting_library/datafeeds/udf/dist/bundle.js"
        strategy="lazyOnload"
        onReady={() => {
          setIsScriptReady(true);
        }}
      />
      {isScriptReady && <TVChartContainer {...defaultWidgetProps} />}
    </>
  );
});

export default AdvancedPriceFeedGraph;
