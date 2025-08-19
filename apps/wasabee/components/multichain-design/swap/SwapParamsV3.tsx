import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import {
  useDerivedSwapInfo,
  useSwapState,
} from '@/lib/algebra/state/swapStore';
import useWrapCallback, {
  WrapType,
} from '@/lib/algebra/hooks/swap/useWrapCallback';
import { SwapField } from '@/types/algebra/types/swap-field';
import { TradeType } from '@cryptoalgebra/sdk';

const SwapParamsV3 = () => {
  const {
    toggledTrade: trade,
    allowedSlippage,
    currencies,
  } = useDerivedSwapInfo();

  const { typedValue } = useSwapState();
  const [isExpanded, setIsExpanded] = useState(false);

  const { wrapType } = useWrapCallback(
    currencies[SwapField.INPUT],
    currencies[SwapField.OUTPUT],
    typedValue
  );

  if (wrapType !== WrapType.NOT_APPLICABLE) return null;

  if (!trade) {
    return null; // Don't show anything if there's no trade
  }

  const minimumReceived =
    trade.tradeType === TradeType.EXACT_INPUT
      ? `${trade.minimumAmountOut(allowedSlippage).toSignificant(6)} ${
          trade.outputAmount.currency.symbol
        }`
      : `${trade.maximumAmountIn(allowedSlippage).toSignificant(6)} ${
          trade.inputAmount.currency.symbol
        }`;

  return (
    <div className="w-full">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-sm text-gray-400 hover:text-gray-300 transition-colors py-2"
      >
        <span>Recommended</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isExpanded && (
        <div className="bg-[#1A1410] rounded-xl p-4 border border-[#333333] space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Route:</span>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-orange-500 rounded-full inline-block"></span>
              <span className="text-white">Uniswap</span>
              <span className="text-gray-400">→</span>
              <span className="w-4 h-4 bg-orange-500 rounded-full inline-block"></span>
              <span className="text-white">Paraswap</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Fee:</span>
            <span className="text-white">1.00%</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">LP Fee:</span>
            <span className="text-white">0.39 BERA</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Minimum Received:</span>
            <span className="text-white">1,238 HONEY</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Slippage Tolerance:</span>
            <span className="text-white">{allowedSlippage.toFixed(2)}%</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwapParamsV3;
