import { useMemo } from 'react';
import { useToken } from 'wagmi';
import { Address } from 'viem';
import { Token } from '@cryptoalgebra/sdk';
import { ExtendedNative } from '@cryptoalgebra/sdk';
import { ADDRESS_ZERO } from '@cryptoalgebra/sdk';
import { wallet } from '@honeypot/shared/lib/wallet';
import { useObserver } from 'mobx-react-lite';

export function useAlgebraToken(address: Address | undefined) {
  const isETH = address === ADDRESS_ZERO;
  const { currentChainId, currentChain } = useObserver(() => {
    return {
      currentChainId: wallet.currentChainId,
      currentChain: wallet.currentChain,
    };
  });

  const { data: tokenData, isLoading, error } = useToken({
    address: isETH ? undefined : address,
    chainId: currentChainId,
    enabled: !!address && address !== ADDRESS_ZERO,
  });

  return useMemo(() => {
    if (!address) return;

    if (address === ADDRESS_ZERO)
      return ExtendedNative.onChain(
        currentChainId,
        currentChain.nativeToken.symbol,
        currentChain.nativeToken.name
      );

    // Log for debugging
    if (error) {
      console.error('Failed to load token data:', { address, chainId: currentChainId, error });
    }

    // If still loading on BSC, create a temporary token to prevent infinite loops
    if (isLoading) {
      // Token data loading
      if (currentChainId === 56) {
        // For BSC, create a temporary token while loading to prevent UI issues
        const validatedToken = currentChain.validatedTokensInfo[address.toLowerCase()];
        if (validatedToken) {
          return new Token(
            currentChainId,
            address,
            validatedToken.decimals || 18,
            validatedToken.symbol || 'Loading...',
            validatedToken.name || 'Loading Token'
          );
        }
        // Return a temporary token to prevent null issues
        return new Token(currentChainId, address, 18, 'Loading...', 'Loading Token');
      }
      return undefined;
    }

    // If we have token data, use it
    if (tokenData) {
      const { symbol, name, decimals } = tokenData;
      return new Token(currentChainId, address, decimals, symbol, name);
    }

    // Fallback: Try to create token with default values if on BSC
    // This helps when the RPC doesn't return token data immediately
    if (currentChainId === 56) {
      // Using fallback for BSC token
      // Try to get from validated tokens first
      const validatedToken = currentChain.validatedTokensInfo[address.toLowerCase()];
      if (validatedToken && 'decimals' in validatedToken) {
        // Found validated token
        return new Token(
          currentChainId,
          address,
          validatedToken.decimals || 18,
          validatedToken.symbol || 'Unknown',
          validatedToken.name || 'Unknown Token'
        );
      }
      // Check if it's USDC specifically
      if (address.toLowerCase() === '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d') {
        // Creating USDC token manually
        return new Token(currentChainId, address, 18, 'USDC', 'USD Coin');
      }
      // Last resort: return a default token (common for BSC tokens)
      // Using generic fallback for token
      return new Token(currentChainId, address, 18, 'Unknown', 'Unknown Token');
    }

    return undefined;
  }, [address, tokenData, isLoading, error, currentChainId, currentChain]);
}
