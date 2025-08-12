import { useCurrency } from '@/lib/algebra/hooks/common/useCurrency';
import {
  useBestTradeExactIn,
  useBestTradeExactOut,
} from '@/lib/algebra/hooks/swap/useBestTrade';
import useSwapSlippageTolerance from '@/lib/algebra/hooks/swap/useSwapSlippageTolerance';
import { SwapFieldType, SwapField } from '@/types/algebra/types/swap-field';
import { TradeStateType } from '@/types/algebra/types/trade-state';
import {
  useReadAlgebraPoolGlobalState,
  useReadAlgebraPoolTickSpacing,
} from '@honeypot/shared/wagmi-generated';
import {
  ADDRESS_ZERO,
  Currency,
  CurrencyAmount,
  Percent,
  TickMath,
  Trade,
  TradeType,
  computePoolAddress,
} from '@cryptoalgebra/sdk';
import JSBI from 'jsbi';
import { useCallback, useMemo } from 'react';
import { Address, parseUnits } from 'viem';
import { useAccount, useBalance } from 'wagmi';
import { useNeedAllowance } from '../hooks/common/useNeedAllowance';
import { create } from 'zustand';
import { wallet } from '@honeypot/shared/lib/wallet';

interface SwapState {
  readonly independentField: SwapFieldType;
  readonly typedValue: string;
  readonly [SwapField.INPUT]: {
    readonly currencyId: Address | undefined;
  };
  readonly [SwapField.OUTPUT]: {
    readonly currencyId: Address | undefined;
  };
  readonly wasInverted: boolean;
  readonly lastFocusedField: SwapFieldType;
  actions: {
    selectCurrency: (
      field: SwapFieldType,
      currencyId: string | undefined
    ) => void;
    switchCurrencies: () => void;
    typeInput: (field: SwapFieldType, typedValue: string) => void;
  };
}

export const useSwapState = create<SwapState>((set, get) => ({
  independentField: SwapField.INPUT,
  typedValue: '',
  [SwapField.INPUT]: {
    currencyId: ADDRESS_ZERO,
  },
  [SwapField.OUTPUT]: {
    currencyId: ADDRESS_ZERO,
  },
  wasInverted: false,
  lastFocusedField: SwapField.INPUT,
  actions: {
    selectCurrency: (field, currencyId) => {
      const otherField =
        field === SwapField.INPUT ? SwapField.OUTPUT : SwapField.INPUT;

      if (currencyId && currencyId === get()[otherField].currencyId) {
        // Auto-switching tokens - update localStorage for both fields
        if (typeof window !== 'undefined') {
          // Update the field being selected
          if (currencyId === ADDRESS_ZERO) {
            // Native token - remove from localStorage
            if (field === SwapField.INPUT) {
              localStorage.removeItem('swapInputToken');
            } else {
              localStorage.removeItem('swapOutputToken');
            }
          } else {
            // Regular token - set in localStorage
            if (field === SwapField.INPUT) {
              localStorage.setItem('swapInputToken', currencyId);
            } else {
              localStorage.setItem('swapOutputToken', currencyId);
            }
          }

          // Update the other field (the one being swapped)
          const otherCurrencyId = get()[field].currencyId;
          if (otherCurrencyId === ADDRESS_ZERO) {
            // Native token - remove from localStorage
            if (otherField === SwapField.INPUT) {
              localStorage.removeItem('swapInputToken');
            } else {
              localStorage.removeItem('swapOutputToken');
            }
          } else if (otherCurrencyId && otherCurrencyId !== ADDRESS_ZERO) {
            // Regular token - set in localStorage
            if (otherField === SwapField.INPUT) {
              localStorage.setItem('swapInputToken', otherCurrencyId);
            } else {
              localStorage.setItem('swapOutputToken', otherCurrencyId);
            }
          }
        }

        set({
          independentField:
            get().independentField === SwapField.INPUT
              ? SwapField.OUTPUT
              : SwapField.INPUT,
          lastFocusedField:
            get().independentField === SwapField.INPUT
              ? SwapField.OUTPUT
              : SwapField.INPUT,
          [field]: { currencyId },
          [otherField]: { currencyId: get()[field].currencyId },
        });
      } else {
        // Regular selection - update localStorage for the selected field only
        if (typeof window !== 'undefined' && currencyId) {
          if (currencyId === ADDRESS_ZERO) {
            // Native token - remove from localStorage
            if (field === SwapField.INPUT) {
              localStorage.removeItem('swapInputToken');
            } else {
              localStorage.removeItem('swapOutputToken');
            }
          } else {
            // Regular token - set in localStorage
            if (field === SwapField.INPUT) {
              localStorage.setItem('swapInputToken', currencyId);
            } else {
              localStorage.setItem('swapOutputToken', currencyId);
            }
          }
        }

        set({
          [field]: { currencyId },
        });
      }
    },
    switchCurrencies: () =>
      set({
        independentField:
          get().independentField === SwapField.INPUT
            ? SwapField.OUTPUT
            : SwapField.INPUT,
        lastFocusedField:
          get().independentField === SwapField.INPUT
            ? SwapField.OUTPUT
            : SwapField.INPUT,
        [SwapField.INPUT]: { currencyId: get()[SwapField.OUTPUT].currencyId },
        [SwapField.OUTPUT]: { currencyId: get()[SwapField.INPUT].currencyId },
      }),
    typeInput: (field, typedValue) =>
      set({
        independentField: field,
        lastFocusedField: field,
        typedValue,
      }),
  },
}));

export function useSwapActionHandlers(): {
  onCurrencySelection: (field: SwapFieldType, currency: Currency) => void;
  onSwitchTokens: () => void;
  onUserInput: (field: SwapFieldType, typedValue: string) => void;
} {
  const {
    actions: { selectCurrency, switchCurrencies, typeInput },
  } = useSwapState();

  const onCurrencySelection = useCallback(
    (field: SwapFieldType, currency: Currency) => {
      const currencyId = currency.isToken
        ? currency.address
        : currency.isNative
        ? ADDRESS_ZERO
        : '';
      
      console.log('onCurrencySelection:', {
        field,
        currency,
        isToken: currency.isToken,
        isNative: currency.isNative,
        address: currency.isToken ? currency.address : 'N/A',
        currencyId,
        ADDRESS_ZERO
      });
      
      selectCurrency(field, currencyId);
    },
    [selectCurrency]
  );

  const onSwitchTokens = useCallback(() => {
    switchCurrencies();
  }, [switchCurrencies]);

  const onUserInput = useCallback(
    (field: SwapFieldType, typedValue: string) => {
      typeInput(field, typedValue);
    },
    [typeInput]
  );

  return {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
  };
}

export function tryParseAmount<T extends Currency>(
  value?: string,
  currency?: T
): CurrencyAmount<T> | undefined {
  if (!value || !currency) {
    console.log('tryParseAmount: Missing value or currency', { value, currency });
    return undefined;
  }
  try {
    console.log('tryParseAmount: Parsing', {
      value,
      currency: currency.symbol,
      decimals: currency.decimals,
      chainId: currency.chainId,
    });
    const typedValueParsed = parseUnits(value, currency.decimals).toString();
    console.log('tryParseAmount: Parsed raw amount', typedValueParsed);
    if (typedValueParsed !== '0') {
      const result = CurrencyAmount.fromRawAmount(currency, typedValueParsed);
      console.log('tryParseAmount: Created CurrencyAmount', result.toSignificant());
      return result;
    }
    console.log('tryParseAmount: Parsed to zero');
  } catch (error) {
    console.error(`Failed to parse input amount: "${value}"`, error);
  }
  return undefined;
}

export function useDerivedSwapInfo(): {
  currencies: { [field in SwapFieldType]?: Currency };
  currencyBalances: { [field in SwapFieldType]?: CurrencyAmount<Currency> };
  parsedAmount: CurrencyAmount<Currency> | undefined;
  inputError?: string;
  tradeState: {
    trade: Trade<Currency, Currency, TradeType> | null;
    state: TradeStateType;
    fee?: bigint[] | null;
  };
  toggledTrade: Trade<Currency, Currency, TradeType> | undefined;
  tickAfterSwap: number | null | undefined;
  allowedSlippage: Percent;
  poolFee: number | undefined;
  tick: number | undefined;
  tickSpacing: number | undefined;
  poolAddress: Address | undefined;
} {
  const { address: account } = useAccount();

  const {
    independentField,
    typedValue,
    [SwapField.INPUT]: { currencyId: inputCurrencyId },
    [SwapField.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState();

  const inputCurrency = useCurrency(inputCurrencyId);
  const outputCurrency = useCurrency(outputCurrencyId);
  
  // Remove debug logging to prevent loops

  const isExactIn: boolean = independentField === SwapField.INPUT;
  const parsedAmount = useMemo(() => {
    const currency = (isExactIn ? inputCurrency : outputCurrency) ?? undefined;
    const result = tryParseAmount(typedValue, currency);
    // Remove debug log
    return result;
  }, [typedValue, isExactIn, inputCurrency, outputCurrency]);

  const bestTradeExactIn = useBestTradeExactIn(
    isExactIn ? parsedAmount : undefined,
    outputCurrency ?? undefined
  );

  const bestTradeExactOut = useBestTradeExactOut(
    inputCurrency ?? undefined,
    !isExactIn ? parsedAmount : undefined
  );

  const trade = (isExactIn ? bestTradeExactIn : bestTradeExactOut) ?? undefined;

  const [addressA, addressB] = [
    inputCurrency?.isNative ? undefined : inputCurrency?.address || '',
    outputCurrency?.isNative ? undefined : outputCurrency?.address || '',
  ] as Address[];

  const { data: inputCurrencyBalance } = useBalance({
    address: account,
    token: addressA,
    // watch: true,
  });
  const { data: outputCurrencyBalance } = useBalance({
    address: account,
    token: addressB,
    //watch: true,
  });

  const currencyBalances = {
    [SwapField.INPUT]:
      inputCurrency &&
      inputCurrencyBalance &&
      CurrencyAmount.fromRawAmount(
        inputCurrency,
        inputCurrencyBalance.value.toString()
      ),
    [SwapField.OUTPUT]:
      outputCurrency &&
      outputCurrencyBalance &&
      CurrencyAmount.fromRawAmount(
        outputCurrency,
        outputCurrencyBalance.value.toString()
      ),
  };

  const currencies: { [field in SwapFieldType]?: Currency } = {
    [SwapField.INPUT]: inputCurrency ?? undefined,
    [SwapField.OUTPUT]: outputCurrency ?? undefined,
  };

  let inputError: string | undefined;
  if (!account) {
    inputError = `Connect Wallet`;
  }

  if (!currencies[SwapField.INPUT] || !currencies[SwapField.OUTPUT]) {
    inputError = inputError ?? `Select a token`;
    console.log('Currency selection error:', {
      inputCurrency: currencies[SwapField.INPUT]?.symbol,
      outputCurrency: currencies[SwapField.OUTPUT]?.symbol,
      inputCurrencyId,
      outputCurrencyId,
    });
  }

  if (!parsedAmount && typedValue && typedValue !== '') {
    inputError = inputError ?? `Enter an amount`;
    console.log('Parse amount error despite typed value:', {
      typedValue,
      inputCurrency: currencies[SwapField.INPUT]?.symbol,
      outputCurrency: currencies[SwapField.OUTPUT]?.symbol,
      isExactIn,
    });
  } else if (!typedValue || typedValue === '') {
    inputError = inputError ?? `Enter an amount`;
  }

  const toggledTrade = trade.trade ?? undefined;

  const tickAfterSwap =
    trade.priceAfterSwap &&
    TickMath.getTickAtSqrtRatio(
      JSBI.BigInt(
        trade.priceAfterSwap[trade.priceAfterSwap.length - 1].toString()
      )
    );

  const allowedSlippage = useSwapSlippageTolerance(toggledTrade);

  const [balanceIn, amountIn] = [
    currencyBalances[SwapField.INPUT],
    toggledTrade?.maximumAmountIn(allowedSlippage), // TODO: check if this is correct
  ];

  if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
    inputError = `Insufficient ${amountIn.currency.symbol} balance`;
  }

  const isWrap =
    currencies.INPUT &&
    currencies.OUTPUT &&
    currencies.INPUT.wrapped.equals(currencies.OUTPUT.wrapped);

  const poolAddress = isWrap
    ? undefined
    : currencies[SwapField.INPUT] &&
      currencies[SwapField.OUTPUT] &&
      (() => {
        try {
          return computePoolAddress({
            tokenA: currencies[SwapField.INPUT]!.wrapped,
            tokenB: currencies[SwapField.OUTPUT]!.wrapped,
            initCodeHashManualOverride: wallet.currentChain?.contracts?.algebraPoolInitCodeHash,
            poolDeployer: wallet.currentChain?.contracts?.algebraPoolDeployer,
          }).toLowerCase() as Address;
        } catch (error) {
          console.warn('Failed to compute pool address in swapStore:', error);
          return undefined;
        }
      })();

  const { data: globalState } = useReadAlgebraPoolGlobalState({
    address: poolAddress,
  });

  const { data: tickSpacing } = useReadAlgebraPoolTickSpacing({
    address: poolAddress,
  });

  return {
    currencies,
    currencyBalances,
    parsedAmount,
    inputError,
    tradeState: trade,
    toggledTrade,
    tickAfterSwap,
    allowedSlippage,
    poolFee: globalState && globalState[2],
    tick: globalState && globalState[1],
    tickSpacing: tickSpacing,
    poolAddress,
  };
}

export function useDerivedSwapInfoWithoutSwapState({
  inputCurrencyId,
  outputCurrencyId,
  independentField,
  typedValue,
}: {
  inputCurrencyId: Address | undefined;
  outputCurrencyId: Address | undefined;
  independentField: SwapFieldType;
  typedValue: string;
}): {
  currencies: { [field in SwapFieldType]?: Currency };
  currencyBalances: { [field in SwapFieldType]?: CurrencyAmount<Currency> };
  parsedAmount: CurrencyAmount<Currency> | undefined;
  inputError?: string;
  tradeState: {
    trade: Trade<Currency, Currency, TradeType> | null;
    state: TradeStateType;
    fee?: bigint[] | null;
  };
  toggledTrade: Trade<Currency, Currency, TradeType> | undefined;
  tickAfterSwap: number | null | undefined;
  allowedSlippage: Percent;
  poolFee: number | undefined;
  tick: number | undefined;
  tickSpacing: number | undefined;
  poolAddress: Address | undefined;
} {
  const { address: account } = useAccount();

  const inputCurrency = useCurrency(inputCurrencyId);
  const outputCurrency = useCurrency(outputCurrencyId);

  const isExactIn: boolean = independentField === SwapField.INPUT;
  const parsedAmount = useMemo(
    () =>
      tryParseAmount(
        typedValue,
        (isExactIn ? inputCurrency : outputCurrency) ?? undefined
      ),
    [typedValue, isExactIn, inputCurrency, outputCurrency]
  );

  const bestTradeExactIn = useBestTradeExactIn(
    isExactIn ? parsedAmount : undefined,
    outputCurrency ?? undefined
  );

  const bestTradeExactOut = useBestTradeExactOut(
    inputCurrency ?? undefined,
    !isExactIn ? parsedAmount : undefined
  );

  const trade = (isExactIn ? bestTradeExactIn : bestTradeExactOut) ?? undefined;

  const [addressA, addressB] = [
    inputCurrency?.isNative ? undefined : inputCurrency?.address || '',
    outputCurrency?.isNative ? undefined : outputCurrency?.address || '',
  ] as Address[];

  const { data: inputCurrencyBalance } = useBalance({
    address: account,
    token: addressA,
    // watch: true,
  });
  const { data: outputCurrencyBalance } = useBalance({
    address: account,
    token: addressB,
    //watch: true,
  });

  const currencyBalances = {
    [SwapField.INPUT]:
      inputCurrency &&
      inputCurrencyBalance &&
      CurrencyAmount.fromRawAmount(
        inputCurrency,
        inputCurrencyBalance.value.toString()
      ),
    [SwapField.OUTPUT]:
      outputCurrency &&
      outputCurrencyBalance &&
      CurrencyAmount.fromRawAmount(
        outputCurrency,
        outputCurrencyBalance.value.toString()
      ),
  };

  const currencies: { [field in SwapFieldType]?: Currency } = {
    [SwapField.INPUT]: inputCurrency ?? undefined,
    [SwapField.OUTPUT]: outputCurrency ?? undefined,
  };

  let inputError: string | undefined;
  if (!account) {
    inputError = `Connect Wallet`;
  }

  if (!currencies[SwapField.INPUT] || !currencies[SwapField.OUTPUT]) {
    inputError = inputError ?? `Select a token`;
    console.log('Currency selection error:', {
      inputCurrency: currencies[SwapField.INPUT]?.symbol,
      outputCurrency: currencies[SwapField.OUTPUT]?.symbol,
      inputCurrencyId,
      outputCurrencyId,
    });
  }

  if (!parsedAmount && typedValue && typedValue !== '') {
    inputError = inputError ?? `Enter an amount`;
    console.log('Parse amount error despite typed value:', {
      typedValue,
      inputCurrency: currencies[SwapField.INPUT]?.symbol,
      outputCurrency: currencies[SwapField.OUTPUT]?.symbol,
      isExactIn,
    });
  } else if (!typedValue || typedValue === '') {
    inputError = inputError ?? `Enter an amount`;
  }

  const toggledTrade = trade.trade ?? undefined;

  const tickAfterSwap =
    trade.priceAfterSwap &&
    TickMath.getTickAtSqrtRatio(
      JSBI.BigInt(
        trade.priceAfterSwap[trade.priceAfterSwap.length - 1].toString()
      )
    );

  const allowedSlippage = useSwapSlippageTolerance(toggledTrade);

  const [balanceIn, amountIn] = [
    currencyBalances[SwapField.INPUT],
    toggledTrade?.maximumAmountIn(allowedSlippage), // TODO: check if this is correct
  ];

  if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
    inputError = `Insufficient ${amountIn.currency.symbol} balance`;
  }

  const isWrap =
    currencies.INPUT &&
    currencies.OUTPUT &&
    currencies.INPUT.wrapped.equals(currencies.OUTPUT.wrapped);

  const poolAddress = isWrap
    ? undefined
    : currencies[SwapField.INPUT] &&
      currencies[SwapField.OUTPUT] &&
      (() => {
        try {
          return computePoolAddress({
            tokenA: currencies[SwapField.INPUT]!.wrapped,
            tokenB: currencies[SwapField.OUTPUT]!.wrapped,
            initCodeHashManualOverride: wallet.currentChain?.contracts?.algebraPoolInitCodeHash,
            poolDeployer: wallet.currentChain?.contracts?.algebraPoolDeployer,
          }).toLowerCase() as Address;
        } catch (error) {
          console.warn('Failed to compute pool address in swapStore:', error);
          return undefined;
        }
      })();

  const { data: globalState } = useReadAlgebraPoolGlobalState({
    address: poolAddress,
  });

  const { data: tickSpacing } = useReadAlgebraPoolTickSpacing({
    address: poolAddress,
  });

  return {
    currencies,
    currencyBalances,
    parsedAmount,
    inputError,
    tradeState: trade,
    toggledTrade,
    tickAfterSwap,
    allowedSlippage,
    poolFee: globalState && globalState[2],
    tick: globalState && globalState[1],
    tickSpacing: tickSpacing,
    poolAddress,
  };
}

