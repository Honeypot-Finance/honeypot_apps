import { ALGEBRA_ROUTER } from "@/config/algebra/addresses";
import { STABLECOINS } from "@/config/algebra/tokens";
import { useCurrency } from "@/lib/algebra/hooks/common/useCurrency";
import {
  useBestTradeExactIn,
  useBestTradeExactOut,
} from "@/lib/algebra/hooks/swap/useBestTrade";
import useSwapSlippageTolerance from "@/lib/algebra/hooks/swap/useSwapSlippageTolerance";
import { SwapFieldType, SwapField } from "@/types/algebra/types/swap-field";
import { TradeStateType } from "@/types/algebra/types/trade-state";
import {
  useReadAlgebraPoolGlobalState,
  useReadAlgebraPoolTickSpacing,
} from "@/wagmi-generated";
import {
  ADDRESS_ZERO,
  Currency,
  CurrencyAmount,
  Percent,
  TickMath,
  Trade,
  TradeType,
  computePoolAddress,
} from "@cryptoalgebra/sdk";
import JSBI from "jsbi";
import { useCallback, useMemo } from "react";
import { Address, parseUnits } from "viem";
import { useAccount, useBalance } from "wagmi";
import { useNeedAllowance } from "../hooks/common/useNeedAllowance";
import { create } from "zustand";

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
  typedValue: "",
  [SwapField.INPUT]: {
    currencyId: ADDRESS_ZERO,
  },
  [SwapField.OUTPUT]: {
    currencyId: STABLECOINS.USDT.address as Address,
  },
  wasInverted: false,
  lastFocusedField: SwapField.INPUT,
  actions: {
    selectCurrency: (field, currencyId) => {
      console.log('[swapStore.selectCurrency] Called:', { field, currencyId });
      const otherField =
        field === SwapField.INPUT ? SwapField.OUTPUT : SwapField.INPUT;

      if (currencyId && currencyId === get()[otherField].currencyId) {
        console.log('[swapStore.selectCurrency] Same currency, switching');
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
        console.log('[swapStore.selectCurrency] Setting currency for field:', field);
        set({
          [field]: { currencyId },
        });
      }
      console.log('[swapStore.selectCurrency] New state:', {
        INPUT: get()[SwapField.INPUT].currencyId,
        OUTPUT: get()[SwapField.OUTPUT].currencyId,
      });
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
    typeInput: (field, typedValue) => {
      console.log('[swapStore.typeInput] Called:', { field, typedValue });
      set({
        independentField: field,
        lastFocusedField: field,
        typedValue,
      });
      console.log('[swapStore.typeInput] New state:', {
        independentField: field,
        typedValue,
      });
    },
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
      console.log('[onCurrencySelection] Called:', {
        field,
        currency: {
          symbol: currency?.symbol,
          isToken: currency?.isToken,
          isNative: currency?.isNative,
          address: currency?.isToken ? currency.address : 'N/A'
        }
      });
      const currencyId = currency.isToken
        ? currency.address
        : currency.isNative
          ? ADDRESS_ZERO
          : "";
      
      console.log('[onCurrencySelection] Computed currencyId:', currencyId);
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
    return undefined;
  }
  try {
    const typedValueParsed = parseUnits(value, currency.decimals).toString();
    if (typedValueParsed !== "0") {
      return CurrencyAmount.fromRawAmount(currency, typedValueParsed);
    }
  } catch (error) {
    console.debug(`Failed to parse input amount: "${value}"`, error);
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

  console.log('[useDerivedSwapInfo] State:', {
    inputCurrencyId,
    outputCurrencyId,
    inputCurrency: inputCurrency ? {
      symbol: inputCurrency.symbol,
      isNative: inputCurrency.isNative,
      address: inputCurrency.isToken ? inputCurrency.address : 'native'
    } : null,
    outputCurrency: outputCurrency ? {
      symbol: outputCurrency.symbol,
      isNative: outputCurrency.isNative,
      address: outputCurrency.isToken ? outputCurrency.address : 'native'
    } : null,
    typedValue,
    independentField
  });

  const isExactIn: boolean = independentField === SwapField.INPUT;
  const parsedAmount = useMemo(
    () => {
      const result = tryParseAmount(
        typedValue,
        (isExactIn ? inputCurrency : outputCurrency) ?? undefined
      );
      console.log('[useDerivedSwapInfo] parsedAmount:', {
        typedValue,
        isExactIn,
        currency: isExactIn ? inputCurrency?.symbol : outputCurrency?.symbol,
        parsedAmount: result?.toExact(),
        rawAmount: result?.quotient?.toString()
      });
      return result;
    },
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
    inputCurrency?.isNative ? undefined : inputCurrency?.address || "",
    outputCurrency?.isNative ? undefined : outputCurrency?.address || "",
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
  }

  // Only show "Enter an amount" if tokens are selected but no amount is entered
  if (!parsedAmount && currencies[SwapField.INPUT] && currencies[SwapField.OUTPUT]) {
    inputError = inputError ?? `Enter an amount`;
  }

  console.log('[useDerivedSwapInfo] Error check:', {
    account: !!account,
    hasInputCurrency: !!currencies[SwapField.INPUT],
    hasOutputCurrency: !!currencies[SwapField.OUTPUT],
    inputCurrencySymbol: currencies[SwapField.INPUT]?.symbol,
    outputCurrencySymbol: currencies[SwapField.OUTPUT]?.symbol,
    hasParsedAmount: !!parsedAmount,
    parsedAmountValue: parsedAmount?.toExact(),
    typedValue,
    inputError
  });

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
    toggledTrade?.maximumAmountIn(allowedSlippage),
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
      (computePoolAddress({
        tokenA: currencies[SwapField.INPUT]!.wrapped,
        tokenB: currencies[SwapField.OUTPUT]!.wrapped,
      }).toLowerCase() as Address);

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
