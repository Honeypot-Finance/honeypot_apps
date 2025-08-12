import { wallet } from '@honeypot/shared/lib/wallet';
import { Currency, Token } from '@cryptoalgebra/sdk';
import { useObserver } from 'mobx-react-lite';
import { useMemo } from 'react';
import { useChainId } from 'wagmi';

export function useAllCurrencyCombinations(
  currencyA?: Currency,
  currencyB?: Currency
): [Token, Token][] {
  const chainId = useChainId();
  const { currentChain } = useObserver(() => {
    return {
      currentChain: wallet.currentChain,
    };
  });

  const [tokenA, tokenB] = chainId
    ? [currencyA?.wrapped, currencyB?.wrapped]
    : [undefined, undefined];
  
  // Remove debug logging to prevent loops

  const bases: Token[] = useMemo(() => {
    if (!chainId) return [];

    const baseTokens = currentChain.validatedTokens.map(
      (token) => {
        const t = new Token(
          chainId,
          token.address,
          token.decimals,
          token.symbol,
          token.name
        );
        // For native tokens, use their wrapped version
        if (token.isNative && chainId === 56) {
          // Return WBNB for native BNB
          return new Token(
            56,
            '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
            18,
            'WBNB',
            'Wrapped BNB'
          );
        }
        return t.wrapped;
      }
    ) ?? [];
    
    return baseTokens;
  }, [chainId, currentChain]);

  const basePairs: [Token, Token][] = useMemo(
    () =>
      bases
        .flatMap((base): [Token, Token][] =>
          bases.map((otherBase) => [base, otherBase])
        )
        .filter(([t0, t1]) => !t0.equals(t1)),
    [bases]
  );

  return useMemo(
    () =>
      tokenA && tokenB
        ? [
            [tokenA, tokenB] as [Token, Token],
            ...bases.map((base): [Token, Token] => [tokenA, base]),
            ...bases.map((base): [Token, Token] => [tokenB, base]),
            ...basePairs,
          ]
            .filter(([t0, t1]) => !t0.equals(t1))
            .filter(([t0, t1], i, otherPairs) => {
              const firstIndexInOtherPairs = otherPairs.findIndex(
                ([t0Other, t1Other]) => {
                  return (
                    (t0.equals(t0Other) && t1.equals(t1Other)) ||
                    (t0.equals(t1Other) && t1.equals(t0Other))
                  );
                }
              );
              return firstIndexInOtherPairs === i;
            })
        : [],
    [tokenA, tokenB, bases, basePairs, chainId]
  );
}
