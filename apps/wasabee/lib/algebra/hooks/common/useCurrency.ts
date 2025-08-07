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
  

  const token = useAlgebraToken(isNative ? ADDRESS_ZERO : address);

  const extendedEther = ExtendedNative.onChain(
    currentChainId,
    currentChain.nativeToken.symbol,
    currentChain.nativeToken.name
  );
  

  if (withNative) return isNative || isWNative ? extendedEther : token;
  
  // For wrapped native tokens, create a Token with the correct symbol from chain config
  if (isWNative && currentChain.wrappedNativeToken) {
    const wrappedConfig = currentChain.wrappedNativeToken;
    // Use the token from useAlgebraToken if available, as it's already cached
    if (token) {
      return token;
    }
    // Otherwise create the wrapped token with correct symbol
    const wrappedToken = new Token(
      currentChainId,
      wrappedNativeAddress,
      wrappedConfig.decimals || 18,
      wrappedConfig.symbol || 'WBERA',
      wrappedConfig.name || 'Wrapped BERA'
    );
    
    // Set the wrapped property to itself (wrapped tokens wrap to themselves)
    Object.defineProperty(wrappedToken, 'wrapped', {
      get() { return this; }
    });
    
    return wrappedToken;
  }
  
  // Return tokens as-is
  return isNative ? extendedEther : token;
}
