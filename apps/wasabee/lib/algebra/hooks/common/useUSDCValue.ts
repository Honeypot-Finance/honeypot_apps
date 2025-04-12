import {
  ADDRESS_ZERO,
  Currency,
  CurrencyAmount,
  Price,
  tryParseAmount,
} from '@cryptoalgebra/sdk';
import { useMemo } from 'react';
import {
  useNativePriceQuery,
  useSingleTokenQuery,
} from '../../graphql/generated/graphql';
import { DynamicFormatAmount } from '../../utils/common/formatAmount';

export function useUSDCPrice(currency: Currency | undefined) {
  const { data: bundles } = useNativePriceQuery();

  const { data: token } = useSingleTokenQuery({
    variables: {
      tokenId: currency?.wrapped.address.toLowerCase() || ADDRESS_ZERO,
    },
  });

  return useMemo(() => {
    if (!currency || !bundles?.bundles?.[0] || !token?.token) return 0;

    const tokenUSDValue =
      Number(token.token.derivedMatic) *
      Number(bundles.bundles[0].maticPriceUSD);

    return tokenUSDValue;
  }, [currency, bundles, token]);
}

export function useUSDCValue(
  currencyAmount: CurrencyAmount<Currency> | undefined | null
) {
  const priceDisplay = useUSDCPrice(currencyAmount?.currency);

  return useMemo(() => {
    return DynamicFormatAmount({
      amount: Number(currencyAmount?.toSignificant()) * priceDisplay,
      decimals: 5,
      endWith: ' $',
    });
  }, [currencyAmount, priceDisplay]);
}
