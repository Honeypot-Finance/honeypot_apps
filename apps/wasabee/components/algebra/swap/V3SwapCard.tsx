import SwapPairV3 from './SwapPair/SwapPairV3';
import SwapButtonV3 from './SwapButton/SwapButotnV3';
import SwapParamsV3 from './SwapParams/SwapParamsV3';
import CardContainer from '../../CardContianer/v3';
import PoweredByAlgebra from '../common/PoweredByAlgebra';

import { Token } from '@honeypot/shared';

interface V3SwapCardProps {
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

export function V3SwapCard({
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
}: V3SwapCardProps) {
  return (
    <CardContainer bordered={bordered}>
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
      <SwapParamsV3 />
      <SwapButtonV3 onSwapSuccess={onSwapSuccess} />
      <PoweredByAlgebra />
    </CardContainer>
  );
}

export default V3SwapCard;
