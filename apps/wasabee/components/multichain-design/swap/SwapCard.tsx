import SwapPairV3 from './SwapPair/SwapPairV3';
import SwapButtonV3 from './SwapButton/SwapButtonV3';
import SwapParamsV3 from './SwapParams/SwapParamsV3';
import { Token } from '@honeypot/shared';
import Container from '../Container';
import Settings from '../Buttons/SettingButton';

interface SwapCardMultichain {
  fromTokenAddress?: string;
  toTokenAddress?: string;
  disableSelection?: boolean;
  disableFromSelection?: boolean;
  disableToSelection?: boolean;
  bordered?: boolean;
  borderHeight?: string;
  onSwapSuccess?: () => void;
  isUpdatingPriceChart?: boolean;
  staticFromTokenList?: Token[];
  staticToTokenList?: Token[];
  isInputNative?: boolean;
  isOutputNative?: boolean;
}

export function SwapCardMultichainDesign({
  fromTokenAddress,
  toTokenAddress,
  disableSelection,
  bordered = true,
  isUpdatingPriceChart = false,
  staticFromTokenList,
  staticToTokenList,
  isInputNative,
  isOutputNative,
  disableFromSelection,
  disableToSelection,
  onSwapSuccess,
}: SwapCardMultichain) {
  return (
    <Container className="">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-2xl font-medium">Swap</h2>
        <button className=" rounded-[1rem] bg-[#2A1F14] hover:bg-[#3A2F24] transition-colors">
          <Settings />
        </button>
      </div>

      {/* Swap Pair Section */}
      <div className="flex-1">
        <SwapPairV3
          fromTokenAddress={fromTokenAddress}
          toTokenAddress={toTokenAddress}
          disableSelection={disableSelection}
          isUpdatingPriceChart={isUpdatingPriceChart}
          staticFromTokenList={staticFromTokenList}
          staticToTokenList={staticToTokenList}
          isInputNative={isInputNative}
          isOutputNative={isOutputNative}
          disableFromSelection={disableFromSelection}
          disableToSelection={disableToSelection}
        />
      </div>

      {/* Swap Parameters */}
      <div className="mt-4">
        <SwapParamsV3 />
      </div>

      {/* Swap Button */}
      <SwapButtonV3 onSwapSuccess={onSwapSuccess} />
    </Container>
  );
}

export default SwapCardMultichainDesign;
