import { Address } from 'viem';
import { Currency, ExtendedNative, Token, WNATIVE } from '@cryptoalgebra/sdk';
import { ADDRESS_ZERO } from '@cryptoalgebra/sdk';
import { useAlgebraToken } from './useAlgebraToken';
import { wallet } from '@honeypot/shared/lib/wallet';
import { useObserver } from 'mobx-react-lite';

export function useCurrency(
  address: Address | undefined,
  withNative?: boolean
): Currency | ExtendedNative | undefined {
  const { currentChainId, currentChain } = useObserver(() => {
    return {
      currentChainId: wallet.currentChainId,
      currentChain: wallet.currentChain,
    };
  });
  // Get the actual wrapped native token address from WNATIVE
  const wrappedNativeAddress = WNATIVE[currentChainId]?.address;
  
  const isWNative =
    address && wrappedNativeAddress && 
    address.toLowerCase() === wrappedNativeAddress.toLowerCase();

  const isNative = address === ADDRESS_ZERO;
  
  console.log('useCurrency called:', {
    address,
    ADDRESS_ZERO,
    isNative,
    isWNative,
    wrappedNativeAddress
  });

  const token = useAlgebraToken(isNative || isWNative ? ADDRESS_ZERO : address);

  const extendedEther = ExtendedNative.onChain(
    currentChainId,
    currentChain.nativeToken.symbol,
    currentChain.nativeToken.name
  );

  if (withNative) return isNative || isWNative ? extendedEther : token;
  
  // For wrapped native tokens, return the wrapped token from extendedEther
  if (isWNative) {
    return extendedEther.wrapped;
  }
  
  // Return tokens as-is
  return isNative ? extendedEther : token;
}
