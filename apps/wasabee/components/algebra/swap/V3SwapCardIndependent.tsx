import SwapPairV3 from './SwapPair/SwapPairV3';
import SwapButtonV3 from './SwapButton/SwapButotnV3';
import SwapParamsV3 from './SwapParams/SwapParamsV3';
import CardContainer from '../../CardContianer/v3';
import PoweredByAlgebra from '../common/PoweredByAlgebra';
import { Token } from '@/services/contract/token';
import { SwapFieldType } from '@/types/algebra/types/swap-field';
import { SwapField } from '@/types/algebra/types/swap-field';
import { useCallback, useState } from 'react';
import { ADDRESS_ZERO, Currency } from '@cryptoalgebra/sdk';
import SwapParamsV3Independent from './SwapParams/SwapParamsV3Independent';
import SwapPairV3Independent from './SwapPair/SwapPairV3Independent';
import { Address } from 'viem';
import { useDerivedSwapInfoWithoutSwapState } from '@/lib/algebra/state/swapStore';
import SwapButtonV3Independent from './SwapButton/SwapButotnV3Independent';
import { SwapCallEstimate } from '@/lib/algebra/hooks/swap/useSwapCallback';
import { SuccessfulCall } from '@/lib/algebra/hooks/swap/useSwapCallback';

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
  setBestCall: (
    bestCall: SuccessfulCall | SwapCallEstimate | undefined
  ) => void;
}

export function V3SwapCardIndependent({
  disableSelection,
  bordered = true,
  isUpdatingPriceChart = false,
  staticFromTokenList,
  staticToTokenList,
  isInputNative,
  isOutputNative,
  disableFromSelection,
  disableToSelection,
  setBestCall,
}: V3SwapCardProps) {
  const [independentField, setIndependentField] = useState<SwapFieldType>(
    SwapField.INPUT
  );
  const [inputCurrency, setInputCurrency] = useState<Currency | undefined>(
    undefined
  );
  const [outputCurrency, setOutputCurrency] = useState<Currency | undefined>(
    undefined
  );
  const [typedValue, setTypedValue] = useState<string>('');

  const onUserInput = useCallback(
    (field: SwapFieldType, value: string) => {
      setTypedValue(value);
      if (field === SwapField.INPUT) {
        setIndependentField(SwapField.INPUT);
      } else {
        setIndependentField(SwapField.OUTPUT);
      }
    },
    [setIndependentField]
  );

  return (
    <CardContainer>
      <SwapPairV3Independent
        fromTokenAddress={
          inputCurrency?.isNative
            ? ADDRESS_ZERO
            : inputCurrency?.wrapped?.address
        }
        toTokenAddress={
          outputCurrency?.isNative
            ? ADDRESS_ZERO
            : outputCurrency?.wrapped?.address
        }
        disableSelection={disableSelection}
        isUpdatingPriceChart={isUpdatingPriceChart}
        staticFromTokenList={staticFromTokenList}
        staticToTokenList={staticToTokenList}
        isInputNative={isInputNative}
        isOutputNative={isOutputNative}
        disableFromSelection={disableFromSelection}
        disableToSelection={disableToSelection}
        independentField={independentField}
        setIndependentField={setIndependentField}
        typedValue={typedValue}
        setTypedValue={setTypedValue}
        inputCurrency={inputCurrency}
        outputCurrency={outputCurrency}
        setInputCurrency={setInputCurrency}
        setOutputCurrency={setOutputCurrency}
        onUserInput={onUserInput}
      />
      <SwapParamsV3Independent
        inputCurrency={inputCurrency}
        outputCurrency={outputCurrency}
        independentField={independentField}
        typedValue={typedValue}
      />
      <SwapButtonV3Independent
        inputCurrency={inputCurrency}
        outputCurrency={outputCurrency}
        independentField={independentField}
        typedValue={typedValue}
        onUserInput={onUserInput}
        setBestCall={setBestCall}
      />
      <PoweredByAlgebra />
    </CardContainer>
  );
}

export default V3SwapCardIndependent;
