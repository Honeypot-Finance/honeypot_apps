import {
  Currency,
  CurrencyAmount,
  encodeRouteToPath,
} from "@cryptoalgebra/sdk";
import { useMemo } from "react";
import { useContractReads } from "wagmi";
import { useAllRoutes } from "./useAllRoutes";
import { algebraQuoterV2ABI } from "@/lib/abis/algebra-contracts/ABIs";
import { wallet } from "@honeypot/shared/lib/wallet";
import { useObserver } from "mobx-react-lite";
import { contractAddresses } from "@honeypot/shared";
import { Address } from "viem";

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
  const { currentChainId } = useObserver(() => ({
    currentChainId: wallet.currentChainId,
  }));

  const { routes, loading: routesLoading } = useAllRoutes(
    exactInput ? amountIn?.currency : currencyIn,
    !exactInput ? amountOut?.currency : currencyOut
  );

  const quoterAddress = useMemo(() => {
    const chainConfig = contractAddresses[currentChainId.toString()];
    const address = chainConfig?.algebraQuoterV2 || contractAddresses.default?.algebraQuoterV2;
    
    console.log('[useQuotesResults] Quoter address:', {
      currentChainId,
      quoterAddress: address,
      chainConfig: !!chainConfig,
      hasAlgebraQuoterV2: !!chainConfig?.algebraQuoterV2
    });
    
    return address as Address;
  }, [currentChainId]);

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

  const functionName = exactInput ? "quoteExactInput" : "quoteExactOutput";

  const {
    data: quotesResults,
    isLoading,
    refetch,
  } = useContractReads({
    contracts: quoteInputs.map((quote: any) => ({
      address: quoterAddress,
      abi: algebraQuoterV2ABI,
      functionName: functionName,
      args: quote,
    })),
    // watch: true,
    // cacheTime: 5_000,
  });

  return {
    data: quotesResults,
    isLoading: isLoading || routesLoading,
    refetch,
  };
}
