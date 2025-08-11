import {
  Currency,
  CurrencyAmount,
  encodeRouteToPath,
} from '@cryptoalgebra/sdk';
import { useMemo } from 'react';
import { useContractReads } from 'wagmi';
import { useAllRoutes } from './useAllRoutes';
import { algebraQuoterV2ABI } from '@/lib/abis/algebra-contracts/ABIs';
import { useObserver } from 'mobx-react-lite';
import { wallet } from '@honeypot/shared/lib/wallet';

export function useQuotesResults({
  exactInput,
  amountIn,
  amountOut,
  currencyIn,
  currencyOut,
}: {
  exactInput: boolean;
  amountIn?: CurrencyAmount<Currency>;
  amountOut?: CurrencyAmount<Currency>;
  currencyIn?: Currency;
  currencyOut?: Currency;
}) {
  const { routes, loading: routesLoading } = useAllRoutes(
    exactInput ? amountIn?.currency : currencyIn,
    !exactInput ? amountOut?.currency : currencyOut
  );
  const ALGEBRA_QUOTER_V2 = useObserver(
    () => wallet.currentChain.contracts.algebraQuoterV2
  );

  const quoteInputs = useMemo(() => {
    return routes.map((route) => [
      encodeRouteToPath(route, !exactInput),
      exactInput
        ? amountIn
          ? `0x${amountIn.quotient.toString(16)}`
          : undefined
        : amountOut
        ? `0x${amountOut.quotient.toString(16)}`
        : undefined,
    ]);
  }, [amountIn, amountOut, routes, exactInput]);

  const functionName = exactInput ? 'quoteExactInput' : 'quoteExactOutput';

  const {
    data: quotesResults,
    isLoading,
    refetch,
  } = useContractReads({
    contracts: quoteInputs.map((quote: any) => ({
      address: ALGEBRA_QUOTER_V2,
      abi: algebraQuoterV2ABI,
      functionName: functionName,
      args: quote,
    })),
    // watch: true,
    // cacheTime: 5_000,
  });

  // Debug logging
  if (quotesResults && quotesResults.length > 0) {
    console.log('Quote results:', {
      routes: routes.map(r => r.pools.map(p => `${p.token0.symbol}/${p.token1.symbol}`).join(' -> ')),
      quotesResults,
      exactInput,
      amountIn: amountIn?.toSignificant(),
      amountOut: amountOut?.toSignificant(),
    });
  }

  return {
    data: quotesResults,
    isLoading: isLoading || routesLoading,
    refetch,
  };
}
