import React, { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import dynamic from 'next/dynamic';
import { chart } from '@honeypot/shared/services';
import { Token } from '@honeypot/shared';
import { crossChainSwapService } from '@/services/crossChainSwap';
import { wallet } from '@honeypot/shared/lib/wallet';

// Import CrossChainKlineChartDisplay dynamically to avoid SSR issues
const CrossChainKlineChartDisplay = dynamic(
  () => import('./CrossChainKlineChartDisplay').then((mod) => mod.default),
  { ssr: false }
);

interface CrossChainKlineChartProps {
  refreshKey?: number;
}

const CrossChainKlineChart: React.FC<CrossChainKlineChartProps> = observer(
  ({ refreshKey }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [chartHeight, setChartHeight] = useState(400);
    const { fromToken } = crossChainSwapService;

    // Update chart target when token changes
    useEffect(() => {
      if (fromToken && fromToken.address) {
        // Store the original wallet chain to restore later
        const originalChainId = wallet.currentChainId;

        // Temporarily set the wallet chain to match the token's chain for chart data
        // This is needed because the chart service uses wallet.currentChainId internally
        const tokenChainId = parseInt(fromToken.chainId);

        // Create a Token object for the chart service
        // For native tokens, use the zero address or handle appropriately
        let tokenAddress = fromToken.address;

        // For native tokens on cross-chain, we might need to use wrapped token for chart
        if (
          fromToken.isNative ||
          tokenAddress === '0x0000000000000000000000000000000000000000'
        ) {
          // Map to wrapped token address for chart display
          const wrappedAddresses: Record<string, Record<string, string>> = {
            '1': { ETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' },
            '56': { BNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c' },
            '137': { MATIC: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270' },
            '8453': { ETH: '0x4200000000000000000000000000000000000006' },
            '42161': { ETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1' },
            '10': { ETH: '0x4200000000000000000000000000000000000006' },
            '43114': { AVAX: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7' },
          };

          const chainWrapped = wrappedAddresses[fromToken.chainId];
          if (chainWrapped && chainWrapped[fromToken.symbol.toUpperCase()]) {
            tokenAddress = chainWrapped[fromToken.symbol.toUpperCase()];
          }
        }

        // Create a Token instance for the chart with the correct chain ID
        const chartToken = new Token({
          address: tokenAddress,
          symbol: fromToken.symbol,
          name: fromToken.name || fromToken.symbol,
          decimals: fromToken.decimals || 18,
          chainId: tokenChainId.toString(),
          isNative: fromToken.isNative,
        });

        // Initialize the token
        chartToken.init();

        // Set it as the chart target
        chart.setChartTarget(chartToken);
        chart.showChart = true;

        // Force the chart to use the token's chain ID by updating wallet context
        // This is a workaround since the chart service internally uses wallet.currentChainId
        if (wallet.currentChainId !== tokenChainId) {
          // We need to pass the correct chain ID to the chart somehow
          // The chart will use it from the token's chainId property
          console.log(
            `Chart will display data for ${fromToken.symbol} on chain ${tokenChainId}`
          );
        }
      } else {
        // Clear chart target if no token selected
        chart.setChartTarget(undefined);
      }
    }, [fromToken]);

    useEffect(() => {
      const updateHeight = () => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          // Subtract padding (32px = 2 * 16px)
          setChartHeight(rect.height - 32);
        }
      };

      updateHeight();

      const resizeObserver = new ResizeObserver(updateHeight);
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      return () => {
        resizeObserver.disconnect();
      };
    }, []);

    return (
      <div className="w-full h-full bg-[#140D06] rounded-2xl border border-[#333333] overflow-hidden">
        <div ref={containerRef} className="p-4 h-full">
          {fromToken ? (
            <CrossChainKlineChartDisplay
              height={chartHeight}
              tokenChainId={parseInt(fromToken.chainId)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a token to view price chart
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default CrossChainKlineChart;
