'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { chart } from '@honeypot/shared/services';
import { TokenLogo } from '@honeypot/shared';

import { Token } from '@honeypot/shared';
import { RotateCcw } from 'lucide-react';
import { getBaseUrl } from '@/lib/trpc';
import { strParams } from '@/lib/advancedChart.util';
import { TbChartArea, TbChartHistogram } from 'react-icons/tb';
import Link from 'next/link';
import Image from 'next/image';
import codexIcon from '@/public/images/partners/codex_white.png';
import { wallet } from '@honeypot/shared/lib/wallet';
import dynamic from 'next/dynamic';

// 为 Window 对象添加 TradingView 相关的类型定义
declare global {
  interface Window {
    TradingView: any;
    tvWidget: any;
    Datafeeds: any;
  }
}

// 格式化数字的工具函数
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

interface KlineChartProps {
  height?: number | string;
  onReady?: () => void;
  refreshKey?: any;
}

// 添加图表类型定义
type ChartType =
  | 'Bars'
  | 'Candles'
  | 'Line'
  | 'Area'
  | 'Heikin Ashi'
  | 'Hollow Candles'
  | 'Baseline'
  | 'High-low'
  | 'Columns';

// 使用动态导入并禁用SSR
const KlineChart = dynamic(() => Promise.resolve(KlineChartComponent), {
  ssr: false,
});

const KlineChartComponent = observer(
  ({ height = 400, onReady, refreshKey }: KlineChartProps) => {
    // 获取时区信息，但仅在客户端执行
    const [timeZone, setTimeZone] = useState<string>('UTC');
    const [currentInterval, setCurrentInterval] = useState('60');
    const chartWrapRef = useRef<HTMLDivElement>(null);
    const [chartWidth, setChartWidth] = useState(200);
    const listener = useRef<any>(null);
    const [priceType, setPriceType] = useState<'PRICE' | 'MCAP'>('PRICE');
    const [currencyType, setCurrencyType] = useState<'USD' | 'BERA'>('USD');
    const [chartType, setChartType] = useState<ChartType>('Candles');
    const [showChartTypeMenu, setShowChartTypeMenu] = useState(false);
    const [showTrades, setShowTrades] = useState(true);
    const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
    const [showIntervalMenu, setShowIntervalMenu] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // 在组件挂载时设置时区和移动设备检测
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

    // 添加图表类型选项
    const chartTypes: { type: ChartType; icon: JSX.Element }[] = [
      {
        type: 'Bars',
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6 3.5a.5.5 0 01.5.5v4h2a.5.5 0 010 1h-2v7.5a.5.5 0 01-1 0V14H3a.5.5 0 010-1h2.5V4a.5.5 0 01.5-.5z"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M13.5 3.5a.5.5 0 01.5.5v7h2.5a.5.5 0 010 1H14v4.5a.5.5 0 01-1 0v-10h-2a.5.5 0 010-1h2V4a.5.5 0 01.5-.5z"
            />
          </svg>
        ),
      },
      {
        type: 'Candles',
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M3 6a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 019 6v8a1.5 1.5 0 01-1.5 1.5h-3A1.5 1.5 0 013 14V6zm1.5-.5A.5.5 0 004 6v8a.5.5 0 00.5.5h3A.5.5 0 008 14V6a.5.5 0 00-.5-.5h-3z"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10.5 8A1.5 1.5 0 0112 6.5h3A1.5 1.5 0 0116.5 8v4a1.5 1.5 0 01-1.5 1.5h-3a1.5 1.5 0 01-1.5-1.5V8zm1.5-.5a.5.5 0 00-.5.5v4a.5.5 0 00.5.5h3a.5.5 0 00.5-.5V8a.5.5 0 00-.5-.5h-3z"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6 2.5a.5.5 0 01.5.5v2a.5.5 0 01-1 0V3a.5.5 0 01.5-.5z"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M13.5 4.5a.5.5 0 01.5.5v2a.5.5 0 01-1 0V5a.5.5 0 01.5-.5z"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M13.5 12.5a.5.5 0 01.5.5v2a.5.5 0 01-1 0v-2a.5.5 0 01.5-.5z"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6 14.5a.5.5 0 01.5.5v2a.5.5 0 01-1 0v-2a.5.5 0 01.5-.5z"
            />
          </svg>
        ),
      },
      {
        type: 'Line',
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M17.79 3.593a.5.5 0 01.117.698L15.257 8h-2.833l-1.066 6.393-4.27-3.202-3.698 4.621a.5.5 0 11-.78-.624l4.302-5.379 3.73 2.798L11.576 7h3.167l2.35-3.29a.5.5 0 01.698-.117z"
            />
          </svg>
        ),
      },
      {
        type: 'Area',
        icon: <TbChartArea size={16} />,
      },
      {
        type: 'Heikin Ashi',
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M3 7.738a1.5 1.5 0 011.5-1.5h3a1.5 1.5 0 011.5 1.5v8.184a1.5 1.5 0 01-1.5 1.5h-3a1.5 1.5 0 01-1.5-1.5V7.738zm1.5-.5a.5.5 0 00-.5.5v8.184a.5.5 0 00.5.5h3a.5.5 0 00.5-.5V7.738a.5.5 0 00-.5-.5h-3z"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10.5 5.514a1.5 1.5 0 011.5-1.5h3a1.5 1.5 0 011.5 1.5v5.316a1.5 1.5 0 01-1.5 1.5h-3a1.5 1.5 0 01-1.5-1.5V5.514zm1.5-.5a.5.5 0 00-.5.5v5.316a.5.5 0 00.5.5h3a.5.5 0 00.5-.5V5.514a.5.5 0 00-.5-.5h-3z"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6 4.014a.5.5 0 01.5.5v2a.5.5 0 01-1 0v-2a.5.5 0 01.5-.5z"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M13.5 2.014a.5.5 0 01.5.5v2a.5.5 0 01-1 0v-2a.5.5 0 01.5-.5z"
            />
          </svg>
        ),
      },
      {
        type: 'Hollow Candles',
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M3.5 6a1 1 0 011-1h3a1 1 0 011 1v8a1 1 0 01-1 1h-3a1 1 0 01-1-1V6z" />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M3 6a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 019 6v8a1.5 1.5 0 01-1.5 1.5h-3A1.5 1.5 0 013 14V6zm1.5-.5A.5.5 0 004 6v8a.5.5 0 00.5.5h3A.5.5 0 008 14V6a.5.5 0 00-.5-.5h-3z"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10.5 8A1.5 1.5 0 0112 6.5h3A1.5 1.5 0 0116.5 8v4a1.5 1.5 0 01-1.5 1.5h-3a1.5 1.5 0 01-1.5-1.5V8zm1.5-.5a.5.5 0 00-.5.5v4a.5.5 0 00.5.5h3a.5.5 0 00.5-.5V8a.5.5 0 00-.5-.5h-3z"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6 2.5a.5.5 0 01.5.5v2a.5.5 0 01-1 0V3a.5.5 0 01.5-.5z"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M13.5 4.5a.5.5 0 01.5.5v2a.5.5 0 01-1 0V5a.5.5 0 01.5-.5z"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M13.5 12.5a.5.5 0 01.5.5v2a.5.5 0 01-1 0v-2a.5.5 0 01.5-.5z"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6 14.5a.5.5 0 01.5.5v2a.5.5 0 01-1 0v-2a.5.5 0 01.5-.5z"
            />
          </svg>
        ),
      },
      {
        type: 'Baseline',
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12.757 9.468a.5.5 0 11-.951.308l-1.437-4.424-2.296 4.415L6.366 7.59 5.262 9.842a.5.5 0 01-.898-.44L6.17 5.716l1.733 2.212 2.68-5.155 2.174 6.695zm1.26 3.88a.5.5 0 00-.951.31l1.234 3.801 1.59-3.761a.5.5 0 10-.92-.39l-.547 1.292-.406-1.252zm-10.656.375a.5.5 0 00-.898-.44L1.226 15.81a.5.5 0 00.898.44l1.237-2.527zm13.71-3.6a.5.5 0 00.46-.306l1.255-2.97a.5.5 0 00-.921-.39l-1.255 2.97a.5.5 0 00.46.695zm-15.396.94a.5.5 0 000 1h.469a.5.5 0 000-1h-.47zm2.346 0a.5.5 0 000 1h.938a.5.5 0 000-1h-.938zm2.815 0a.5.5 0 000 1h.938a.5.5 0 000-1h-.938zm2.815 0a.5.5 0 000 1h.939a.5.5 0 100-1H9.65zm2.816 0a.5.5 0 000 1h.938a.5.5 0 000-1h-.938zm2.815 0a.5.5 0 100 1h.939a.5.5 0 100-1h-.939zm2.815 0a.5.5 0 000 1h.47a.5.5 0 000-1h-.47z"
            />
          </svg>
        ),
      },
      {
        type: 'High-low',
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M3 4.475a1.5 1.5 0 011.5-1.5h3a1.5 1.5 0 011.5 1.5v11.05a1.5 1.5 0 01-1.5 1.5h-3a1.5 1.5 0 01-1.5-1.5V4.475zm1.5-.5a.5.5 0 00-.5.5v11.05a.5.5 0 00.5.5h3a.5.5 0 00.5-.5V4.475a.5.5 0 00-.5-.5h-3z"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10.5 7.342a1.5 1.5 0 011.5-1.5h3a1.5 1.5 0 011.5 1.5v5.316a1.5 1.5 0 01-1.5 1.5h-3a1.5 1.5 0 01-1.5-1.5V7.342zm1.5-.5a.5.5 0 00-.5.5v5.316a.5.5 0 00.5.5h3a.5.5 0 00.5-.5V7.342a.5.5 0 00-.5-.5h-3z"
            />
          </svg>
        ),
      },
      {
        type: 'Columns',
        icon: <TbChartHistogram size={16} />,
      },
    ];

    const initOnReady = useCallback(() => {
      if (typeof window === 'undefined') return;

      try {
        window.Datafeeds.UDFCompatibleDatafeed.prototype.resolveSymbol =
          function (
            symbolName: string,
            onSymbolResolvedCallback: any,
            onResolveErrorCallback: any
          ) {
            onSymbolResolvedCallback({
              name: symbolName,
              ticker: '',
              description: '',
              type: 'stock',
              exchange: 'DEX',
              minmove2: 0,
              session: '24x7',
              timezone: timeZone,
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

        if (chart.chartTarget) {
          window.tvWidget = new window.TradingView.widget({
            symbol: strParams(
              chart.chartTarget as Token,
              wallet.currentChainId,
              chart.tokenNumber,
              chart.currencyCode
            ),
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
                    'mainSeriesProperties.priceAxisProperties.percentage':
                      false,
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

            // 设置初始图表类型
            try {
              switch (chartType) {
                case 'Bars':
                  chart.setChartType(0);
                  break;
                case 'Candles':
                  chart.setChartType(1);
                  break;
                // ... 其他类型
              }
            } catch (error) {
              console.error('Error setting initial chart type:', error);
            }

            onReady?.();
          });
        }
      } catch (error) {
        console.error('Error initializing chart:', error);
      }
    }, [
      chartWidth,
      height,
      chart.chartTarget,
      onReady,
      currentInterval,
      isMobile,
      timeZone,
      chartType,
    ]);

    useEffect(() => {
      const resizeChart = () => {
        if (chartWrapRef.current) {
          const newWidth = chartWrapRef.current.clientWidth;
          const newIsMobile = window.innerWidth < 640;

          setChartWidth(newWidth);
          if (newIsMobile !== isMobile) {
            setIsMobile(newIsMobile);
            if (window.tvWidget) {
              initOnReady();
            }
          }
        }
      };
      resizeChart();
      window.addEventListener('resize', resizeChart);
      return () => window.removeEventListener('resize', resizeChart);
    }, [chartWidth, isMobile, initOnReady]);

    useEffect(() => {
      initOnReady();
    }, [initOnReady, currentInterval, refreshKey]);

    const handleIndicatorsClick = () => {
      if (window.tvWidget) {
        // 获取图表实例
        const chart = window.tvWidget.chart();
        // 打开指标对话框
        window.tvWidget.chart().executeActionById('insertIndicator');
      }
    };

    const handleHideTradesClick = () => {
      if (window.tvWidget) {
        const chart = window.tvWidget.chart();
        try {
          chart.executeActionById('toggleTrades');
          setShowTrades(!showTrades); // 切换状态
        } catch (error) {
          console.error('Error toggling trades:', error);
        }
      }
    };

    const handlePriceMCapClick = () => {
      const newType = priceType === 'PRICE' ? 'MCAP' : 'PRICE';
      setPriceType(newType);
      // 切换价格/市值显示
      if (window.tvWidget) {
        // 将 PRICE 映射为 USD，将 MCAP 映射为 TOKEN
        chart.setCurrencyCode(newType === 'PRICE' ? 'USD' : 'TOKEN');
        initOnReady();
      }
    };

    const handleUSDBeraClick = () => {
      const newType = currencyType === 'USD' ? 'BERA' : 'USD';
      setCurrencyType(newType);
      if (window.tvWidget) {
        chart.setCurrencyCode(newType === 'USD' ? 'USD' : 'TOKEN');
        initOnReady();
      }
    };

    // 添加切换图表类型的处理函数
    const handleChartTypeChange = (type: ChartType) => {
      console.log('Changing chart type to:', type); // 添加日志
      setChartType(type);
      setShowChartTypeMenu(false);

      if (window.tvWidget) {
        const chart = window.tvWidget.chart();
        try {
          switch (type) {
            case 'Bars':
              chart.setChartType(0); // 修改类型值
              break;
            case 'Candles':
              chart.setChartType(1); // 修改类型值
              break;
            case 'Line':
              chart.setChartType(2); // 修改类型值
              break;
            case 'Area':
              chart.setChartType(3); // 修改类型值
              break;
            case 'Heikin Ashi':
              chart.setChartType(8);
              break;
            case 'Hollow Candles':
              chart.setChartType(9);
              break;
            case 'Baseline':
              chart.setChartType(10);
              break;
            case 'High-low':
              chart.setChartType(12);
              break;
            case 'Columns':
              chart.setChartType(13);
              break;
          }
        } catch (error) {
          console.error('Error setting chart type:', error);
        }
      } else {
        console.error('TradingView widget not initialized');
      }
    };

    // 添加点击外部关闭下拉菜单的处理
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          (showChartTypeMenu &&
            !(event.target as Element).closest('.chart-type-dropdown')) ||
          (showIntervalMenu &&
            !(event.target as Element).closest('.interval-dropdown'))
        ) {
          setShowChartTypeMenu(false);
          setShowIntervalMenu(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [showChartTypeMenu, showIntervalMenu]);

    return (
      <div className="w-full relative rounded-2xl bg-[#202020] overflow-hidden p-2 sm:p-4">
        {chart.isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#202020]/50 z-10">
            <RotateCcw className="w-8 h-8 animate-spin text-[#FFCD4D]" />
          </div>
        )}
        <div className="flex flex-col gap-1">
          {/* Token Info */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {chart.TargetLogoDisplay.map((token: Token) => {
                if (!token) {
                  return <></>;
                }

                return <TokenLogo key={token.address} token={token} />;
              })}
            </div>
            <span className="text-white text-base sm:text-lg font-bold">
              {chart.chartLabel}
            </span>
          </div>

          {/* Price and Change */}
          <div className="flex items-center gap-2">
            <span className="text-white text-2xl sm:text-3xl font-bold">
              {chart.currentPrice?.toFixed(6)}
            </span>
            <span
              className={`text-sm sm:text-base ${
                chart.chartPricePercentageChange >= 0
                  ? 'text-[#089981]'
                  : 'text-[#F23645]'
              }`}
            >
              {chart.chartPricePercentageChange >= 0 ? '▲' : '▼'}{' '}
              {isNaN(chart.chartPricePercentageChange) ? "This pair has no activity yet. Graph is not available" : `${chart.chartPricePercentageChange.toFixed(2)}%`}
            </span>
          </div>
        </div>

        <div className="flex items-center my-4 bg-[#202020] flex-wrap gap-y-2">
          <div className="relative shrink-0">
            <div className="hidden sm:block space-x-1">
              {intervals.map((interval) => (
                <button
                  key={interval.text}
                  onClick={() => setCurrentInterval(interval.resolution)}
                  className={`text-xs sm:text-sm transition-colors ${
                    currentInterval === interval.resolution
                      ? 'text-[#FFCD4D]'
                      : 'text-[#808080] hover:text-[#FFCD4D]'
                  }`}
                >
                  {interval.text}
                </button>
              ))}
            </div>

            <div className="sm:hidden interval-dropdown">
              <button
                onClick={() => setShowIntervalMenu(!showIntervalMenu)}
                className="text-xs sm:text-sm text-[#808080] hover:text-[#FFCD4D] transition-colors flex items-center gap-1"
              >
                <span>
                  {
                    intervals.find((i) => i.resolution === currentInterval)
                      ?.text
                  }
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform ${
                    showIntervalMenu ? 'rotate-180' : ''
                  }`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {showIntervalMenu && (
                <div
                  className="absolute top-full left-0 mt-1 bg-[#1E1E1E] border border-gray-700 rounded-md py-1 z-50 min-w-[120px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {intervals.map((interval) => (
                    <button
                      key={interval.text}
                      onClick={() => {
                        setCurrentInterval(interval.resolution);
                        setShowIntervalMenu(false);
                      }}
                      className={`w-full px-4 py-1.5 text-left text-xs sm:text-sm hover:bg-[#2A2A2A] ${
                        currentInterval === interval.resolution
                          ? 'text-[#FFCD4D]'
                          : 'text-[#808080]'
                      }`}
                    >
                      {interval.text}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="h-[20px] mx-2 w-[1px] bg-gray-600" />

          <div className="relative chart-type-dropdown">
            <button
              onClick={() => setShowChartTypeMenu(!showChartTypeMenu)}
              className="text-xs sm:text-sm text-[#808080] hover:text-[#FFCD4D] transition-colors flex items-center gap-1 justify-center"
            >
              <span className="opacity-60">
                {chartTypes.find((ct) => ct.type === chartType)?.icon}
              </span>
            </button>

            {showChartTypeMenu && (
              <div
                className="absolute top-full left-0 mt-1 bg-[#1E1E1E] border border-gray-700 rounded-md py-1 z-50 min-w-[180px]"
                onClick={(e) => e.stopPropagation()}
              >
                {chartTypes.map(({ type, icon }) => (
                  <button
                    key={type}
                    onClick={() => handleChartTypeChange(type)}
                    className={`w-full px-4 py-1.5 flex items-center gap-3 hover:bg-[#2A2A2A] ${
                      chartType === type ? 'text-[#FFCD4D]' : 'text-[#808080]'
                    }`}
                  >
                    <span className="opacity-60">{icon}</span>
                    <span className="flex-1 text-left whitespace-nowrap text-xs sm:text-sm">
                      {type}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-[20px] mx-2 w-[1px] bg-gray-600" />

          <button
            onClick={handleIndicatorsClick}
            className="text-xs sm:text-sm text-[#808080] hover:text-[#FFCD4D] transition-all duration-75 flex items-center gap-0.5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 20 20"
              stroke="currentColor"
              strokeWidth="0.5"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.5 5.5a2.5 2.5 0 015 0v.321a.5.5 0 01-1 0V5.5a1.5 1.5 0 00-3 0V8H11a.5.5 0 010 1H8.5v5.5a2.5 2.5 0 01-5 0 .5.5 0 111 0 1.5 1.5 0 003 0V9H5a.5.5 0 010-1h2.5V5.5zm6.707 9l1.647 1.646a.5.5 0 01-.708.708L13.5 15.207l-1.646 1.647a.5.5 0 01-.708-.707l1.647-1.647-1.647-1.646a.5.5 0 01.708-.707l1.646 1.646 1.646-1.646a.5.5 0 01.708.707L14.207 14.5z"
              />
            </svg>
            Indicators
          </button>

          <div className="h-[20px] mx-2 w-[1px] bg-gray-600" />

          <button
            onClick={handleHideTradesClick}
            className="text-xs sm:text-sm text-[#808080] hover:text-[#FFCD4D] transition-colors shrink-0"
          >
            {showTrades ? 'Hide' : 'Show'} trades
          </button>

          <div className="h-[20px] mx-2 w-[1px] bg-gray-600" />
          <button
            onClick={handlePriceMCapClick}
            className={`text-xs sm:text-sm transition-colors ${
              priceType === 'PRICE' ? 'text-[#FFCD4D]' : 'text-[#808080]'
            }`}
          >
            Price
          </button>
          <span className="text-[#808080] mx-0.5">/</span>
          <button
            onClick={handlePriceMCapClick}
            className={`text-xs sm:text-sm transition-colors ${
              priceType === 'MCAP' ? 'text-[#FFCD4D]' : 'text-[#808080]'
            }`}
          >
            MCap
          </button>
          <div className="h-[20px] mx-2 w-[1px] bg-gray-600" />
          <button
            onClick={handleUSDBeraClick}
            className={`text-xs sm:text-sm transition-colors ${
              currencyType === 'USD' ? 'text-[#FFCD4D]' : 'text-[#808080]'
            }`}
          >
            USD
          </button>
          <span className="text-[#808080] mx-0.5">/</span>
          <button
            onClick={handleUSDBeraClick}
            className={`text-xs sm:text-sm transition-colors ${
              currencyType === 'BERA' ? 'text-[#FFCD4D]' : 'text-[#808080]'
            }`}
          >
            BERA
          </button>
        </div>

        <div ref={chartWrapRef} className="relative my-4">
          <div
            id="tv_chart_container"
            style={{
              width: '100%',
              height: isMobile ? '350px' : '500px',
              transition: 'opacity 0.3s ease-out',
            }}
          />
        </div>
        {/* 截图弹窗 */}
        {screenshotUrl && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#202020] p-4 rounded-lg max-w-[90%] max-h-[90%]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white text-lg">Screenshot</h3>
                <button
                  onClick={() => setScreenshotUrl(null)}
                  className="text-[#808080] hover:text-[#FFCD4D] transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <Image
                src={screenshotUrl}
                alt="Chart Screenshot"
                width={800}
                height={600}
                className="max-w-full"
              />
              <div className="mt-4 flex justify-end">
                <a
                  href={screenshotUrl}
                  download="chart-screenshot.png"
                  className="px-4 py-2 bg-[#FFCD4D] text-black rounded hover:bg-[#ffcd4dd0] transition-colors"
                >
                  Download
                </a>
              </div>
            </div>
          </div>
        )}
        <Link
          href="https://www.codex.io/"
          target="_blank"
          className="text-center text-sm text-[#808080] hover:text-[#FFCD4D] transition-colors flex items-center  gap-1"
        >
          price feed powered by{' '}
          <Image src={codexIcon} alt="Codex" width={50} height={50} />
        </Link>
      </div>
    );
  }
);

export default KlineChart;
