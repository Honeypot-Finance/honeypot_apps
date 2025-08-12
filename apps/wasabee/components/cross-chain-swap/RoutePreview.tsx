import React from 'react';
import { observer } from 'mobx-react-lite';
import { Token, DynamicFormatAmount, Network } from '@honeypot/shared';
import { ArrowRight, Clock, DollarSign, Zap, Route } from 'lucide-react';
import { UniversalTokenLogo } from './UniversalTokenLogo';
import Image from 'next/image';

interface RoutePreviewProps {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  fromChain: Network | null;
  toChain: Network | null;
  variant?: 'light' | 'dark';
  priceImpact?: number;
  estimatedTime?: number;
  feeInUSD?: string;
}

const RoutePreview: React.FC<RoutePreviewProps> = observer(({
  fromToken,
  toToken,
  fromAmount,
  toAmount,
  fromChain,
  toChain,
  variant = 'light',
  priceImpact: providedPriceImpact,
  estimatedTime: providedEstimatedTime,
  feeInUSD
}) => {
  const isDark = variant === 'dark';
  
  const calculatedPriceImpact = React.useMemo(() => {
    if (providedPriceImpact !== undefined) {
      return providedPriceImpact;
    }
    
    if (!fromAmount || !toAmount) {
      return 0;
    }
    
    // Fallback calculation based on token amounts only
    const fromValue = parseFloat(fromAmount);
    const toValue = parseFloat(toAmount);
    
    if (fromValue === 0) return 0;
    
    return Math.abs((fromValue - toValue) / fromValue) * 100;
  }, [fromAmount, toAmount, providedPriceImpact]);

  const displayTime = providedEstimatedTime 
    ? `~${Math.round(providedEstimatedTime / 60)} min`
    : (fromChain?.chainId === toChain?.chainId ? '~30s' : '~2-5 min');
  
  const exchangeRate = parseFloat(toAmount) / parseFloat(fromAmount) || 0;

  return (
    <div className={`rounded-2xl p-4 space-y-3 border ${
      isDark 
        ? 'bg-[#141414] border-[#2a2a2a]' 
        : 'bg-gray-50 border-gray-200'
    }`}>
      {/* Exchange Rate */}
      <div className="flex items-center justify-between">
        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Exchange Rate
        </span>
        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
          1 {fromToken.symbol} = {DynamicFormatAmount({
            amount: exchangeRate,
            decimals: 6
          })} {toToken.symbol}
        </span>
      </div>

      {/* Price Impact */}
      <div className="flex items-center justify-between">
        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Price Impact
        </span>
        <span className={`text-sm font-medium ${
          calculatedPriceImpact > 5 ? 'text-red-500' : calculatedPriceImpact > 3 ? 'text-orange-500' : 'text-green-500'
        }`}>
          {calculatedPriceImpact.toFixed(2)}%
        </span>
      </div>

      {/* Fee */}
      {feeInUSD && (
        <div className="flex items-center justify-between">
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Network Fee
          </span>
          <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            ${parseFloat(feeInUSD).toFixed(2)}
          </span>
        </div>
      )}

      {/* Estimated Time */}
      <div className="flex items-center justify-between">
        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Estimated Time
        </span>
        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {displayTime}
        </span>
      </div>

      {/* Route Visualization */}
      <div className={`pt-3 border-t ${isDark ? 'border-[#2a2a2a]' : 'border-gray-200'}`}>
        <div className={`text-sm font-medium mb-3 flex items-center gap-2 ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <Route className="w-4 h-4" />
          <span>Route</span>
        </div>
        
        <div className="flex items-center justify-between">
          {/* From */}
          <div className="flex flex-col items-center gap-1">
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              {fromChain?.chain.name || 'Unknown'}
            </div>
            <div className="flex items-center gap-2">
              <UniversalTokenLogo token={fromToken} size={24} />
              <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {fromToken.symbol}
              </span>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center gap-1">
            <div className={`h-px w-8 ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`} />
            <ArrowRight className={`w-4 h-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <div className={`h-px w-8 ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`} />
          </div>

          {/* To */}
          <div className="flex flex-col items-center gap-1">
            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              {toChain?.chain.name || 'Unknown'}
            </div>
            <div className="flex items-center gap-2">
              <UniversalTokenLogo token={toToken} size={24} />
              <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {toToken.symbol}
              </span>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            isDark ? 'bg-[#2a2a2a] text-gray-300' : 'bg-white border border-gray-200'
          }`}>
            1. Deposit
          </div>
          <ArrowRight className={`w-3 h-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            isDark ? 'bg-[#2a2a2a] text-gray-300' : 'bg-white border border-gray-200'
          }`}>
            2. Swap
          </div>
          <ArrowRight className={`w-3 h-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            isDark ? 'bg-[#2a2a2a] text-gray-300' : 'bg-white border border-gray-200'
          }`}>
            3. Withdraw
          </div>
        </div>
      </div>
    </div>
  );
});

export default RoutePreview;