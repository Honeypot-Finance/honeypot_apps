'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { chart } from '@honeypot/shared/services';
import { Token } from '@honeypot/shared/lib/contract/token/token';
import { RotateCcw } from 'lucide-react';
import { getBaseUrl } from '@/lib/trpc';
import { TbChartArea, TbChartHistogram } from 'react-icons/tb';
import { networksMap } from '@honeypot/shared/config/chains/network';

// TradingView type definitions
declare global {
  interface Window {
    TradingView: any;
    tvWidget: any;
    Datafeeds: any;
  }
}

// Format number utility
const formatNumber = (number: number) => {
  if (isNaN(number)) return 0;
  number = +number;
  if (number === 0) return 0;
  if (number < 0) number = Math.abs(number);

  if (number >= 1000) return new Intl.NumberFormat('en-US').format(number);
  else if (number > 100)
    return parseFloat(String(number)).toFixed(2).toString();
  else if (number > 1) return parseFloat(String(number)).toFixed(3).toString();
  else if (number > 1e-4)
    return parseFloat(parseFloat(String(number)).toExponential(4)).toString();
  else {
    const endNumbers = Number(number)
      .toExponential()
      .split('e')[0]
      .replace('.', '')
      .substring(0, 4);
    const zeros = -Math.floor(Math.log10(number) + 1);
    let subNumber;
    if (zeros > 9) {
      subNumber =
        String.fromCharCode(parseInt(`2081`, 16)) +
        String.fromCharCode(parseInt(`208${zeros - 10}`, 16));
    } else {
      subNumber = String.fromCharCode(parseInt(`208${zeros}`, 16));
    }
    return '0.0' + subNumber + endNumbers;
  }
};

interface CrossChainKlineChartDisplayProps {
  height?: number | string;
  tokenChainId: number;
}

// Custom strParams that uses the provided chain ID
const strParamsWithChain = (
  token: Token,
  chainId: number,
  tokenNumber: number,
  currencyCode: string
) => {
  return (
    token.name +
    ':' +
    networksMap[chainId as number].chain.id +
    ':' +
    token.address +
    ':' +
    tokenNumber +
    ':' +
    currencyCode
  );
};

const CrossChainKlineChartDisplay = observer(
  ({ height = 400, tokenChainId }: CrossChainKlineChartDisplayProps) => {
    const [timeZone, setTimeZone] = useState<string>('UTC');
    const [currentInterval, setCurrentInterval] = useState('60');
    const chartWrapRef = useRef<HTMLDivElement>(null);
    const [chartWidth, setChartWidth] = useState(200);
    const listener = useRef<any>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
      setIsMobile(window.innerWidth < 640);
    }, []);

    const intervals = [
      { text: '1s', resolution: '1S' },
      { text: '15s', resolution: '15S' },
      { text: '30s', resolution: '30S' },
      { text: '1m', resolution: '1' },
      { text: '5m', resolution: '5' },
      { text: '1H', resolution: '60' },
      { text: '4H', resolution: '240' },
      { text: '1D', resolution: 'D' },
    ];

    useEffect(() => {
      const initChart = async () => {
        if (typeof window === 'undefined' || !window.TradingView) {
          return;
        }

        if (
          chart.chartTarget &&
          chartWrapRef.current &&
          !window.tvWidget &&
          chartWidth > 0
        ) {
          try {
            // Override the symbol resolution to use the token's chain ID
            window.Datafeeds.UDFCompatibleDatafeed.prototype.resolveSymbol =
              function (
                symbolName: string,
                onSymbolResolvedCallback: any,
                onResolveErrorCallback: any
              ) {
                onSymbolResolvedCallback({
                  ticker: symbolName,
                  name: symbolName.split(':')[0],
                  type: 'crypto',
                  session: '24x7',
                  timezone: timeZone,
                  exchange: '',
                  minmov: 1,
                  pricescale: 100000000,
                  has_intraday: true,
                  volume_precision: 6,
                });
              };

            window.Datafeeds.UDFCompatibleDatafeed.prototype.subscribeBars = (
              symbolInfo: any,
              resolution: any,
              onRealtimeCallback: any,
              subscribeUID: any,
              onResetCacheNeededCallback: any
            ) => {
              listener.current = {
                onRealtimeCallback,
                resolution,
              };
            };

            const datafeed = new window.Datafeeds.UDFCompatibleDatafeed(
              `${getBaseUrl()}/api/udf-data-feed`,
              5000
            );

            // Use the token's chain ID instead of wallet's current chain
            const symbol = strParamsWithChain(
              chart.chartTarget as Token,
              tokenChainId,
              chart.tokenNumber,
              chart.currencyCode
            );

            console.log('Initializing chart with symbol:', symbol);

            window.tvWidget = new window.TradingView.widget({
              symbol: symbol,
              interval: currentInterval as any,
              container: 'tv_chart_container',
              width: chartWidth,
              height: isMobile ? 350 : Number(height),
              formatting_price_precision: 10,
              timezone: timeZone as any,
              datafeed: datafeed,
              library_path: '/charting_library/',
              locale: 'en',
              disabled_features: [
                'use_localstorage_for_settings',
                'header_symbol_search',
                'header_compare',
                'header_undo_redo',
                'border_around_the_chart',
                'header_saveload',
                'drawing_templates',
                'volume_force_overlay',
                ...(isMobile ? ['left_toolbar'] : []),
              ],
              enabled_features: [
                ...(isMobile ? [] : ['left_toolbar']),
                'control_bar',
                'header_resolutions',
                'timeframes_toolbar',
                'header_fullscreen_button',
                'study_dialog',
                'trading_notifications',
                'fullscreen_button',
                'screenshot_button',
              ],
              toolbar_bg: '#202020',
              header_widget_dom_node: 'trading_view_header',
              timeframes: intervals,
              charts_storage_url: 'https://saveload.tradingview.com',
              charts_storage_api_version: '1.1',
              client_id: 'tradingview.com',
              user_id: 'public_user_id',
              preset: 'mobile',
              custom_css_url: '/css/tradingViews.css',
              loading_screen: {
                backgroundColor: '#202020',
                foregroundColor: '#FFCD4D',
              },
              theme: 'dark',
              overrides: {
                'paneProperties.backgroundType': 'solid',
                'paneProperties.background': '#202020',
                'scalesProperties.lineColor': '#202020',
                'mainSeriesProperties.candleStyle.barColorsOnPrevClose': true,
                'mainSeriesProperties.haStyle.barColorsOnPrevClose': true,
                'mainSeriesProperties.barStyle.barColorsOnPrevClose': true,
                'mainSeriesProperties.candleStyle.upColor': '#089981',
                'mainSeriesProperties.candleStyle.borderUpColor': '#089981',
                'mainSeriesProperties.candleStyle.downColor': '#F23645',
                'mainSeriesProperties.candleStyle.borderDownColor': '#F23645',
                'mainSeriesProperties.candleStyle.wickUpColor': '#089981',
                'mainSeriesProperties.candleStyle.wickDownColor': '#F23645',
                ...(isMobile
                  ? {
                      'scalesProperties.fontSize': 10,
                      'scalesProperties.textColor': '#808080',
                      'scalesProperties.scaleSeriesOnly': true,
                      'mainSeriesProperties.priceAxisProperties.autoScale': true,
                      'mainSeriesProperties.priceAxisProperties.percentage': false,
                      'mainSeriesProperties.priceAxisProperties.log': false,
                      'scalesProperties.showLeftScale': false,
                      'scalesProperties.showRightScale': true,
                      'scalesProperties.alignLabels': true,
                      'paneProperties.rightMargin': 5,
                      'paneProperties.leftMargin': 5,
                    }
                  : {}),
              },
              fullscreen: false,
            });

            window.tvWidget.onChartReady(() => {
              const chart = window.tvWidget.chart();
              chart.priceFormatter().format = formatNumber;
            });
          } catch (error) {
            console.error('Error initializing chart:', error);
          }
        }
      };

      initChart();

      return () => {
        if (window.tvWidget) {
          try {
            window.tvWidget.remove();
            window.tvWidget = null;
          } catch (error) {
            console.error('Error removing chart:', error);
          }
        }
      };
    }, [
      chartWidth,
      height,
      chart.chartTarget,
      currentInterval,
      isMobile,
      timeZone,
      tokenChainId,
    ]);

    useEffect(() => {
      const resizeChart = () => {
        if (chartWrapRef.current) {
          setChartWidth(chartWrapRef.current.offsetWidth);
        }
      };

      resizeChart();
      window.addEventListener('resize', resizeChart);

      return () => {
        window.removeEventListener('resize', resizeChart);
      };
    }, []);

    return (
      <div className="relative w-full h-full" ref={chartWrapRef}>
        <div id="tv_chart_container" className="w-full h-full" />
      </div>
    );
  }
);

export default CrossChainKlineChartDisplay;