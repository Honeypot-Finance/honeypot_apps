import { ADDRESS_ZERO, Pool } from '@cryptoalgebra/sdk';
import { Address } from 'viem';
import { useCurrency } from '../common/useCurrency';
import { useEffect, useMemo, useState } from 'react';
import {
  useReadAlgebraPoolTickSpacing,
  useReadAlgebraPoolGlobalState,
  useReadAlgebraPoolLiquidity,
  useReadAlgebraPoolToken0,
  useReadAlgebraPoolToken1,
} from '@honeypot/shared/wagmi-generated';
import { getCode } from 'viem/actions';
import { wallet } from '@honeypot/shared/lib/wallet';

export const PoolState = {
  LOADING: 'LOADING',
  NOT_EXISTS: 'NOT_EXISTS',
  EXISTS: 'EXISTS',
  INVALID: 'INVALID',
} as const;

export type PoolStateType = (typeof PoolState)[keyof typeof PoolState];

export function usePool(
  address: Address | undefined
): [PoolStateType, Pool | null] {
  const [code, setCode] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!address || !wallet.isInit) return;
    getCode(wallet.publicClient, {
      address: address as Address,
    }).then((code) => {
      setCode(code);
    });
  }, [address, wallet.isInit]);

  const {
    data: tickSpacing,
    isLoading: isTickSpacingLoading,
    isError: isTickSpacingError,
  } = useReadAlgebraPoolTickSpacing({
    address,
  });

  const {
    data: globalState,
    isLoading: isGlobalStateLoading,
    isError: isGlobalStateError,
  } = useReadAlgebraPoolGlobalState({
    address,
  });

  const {
    data: liquidity,
    isLoading: isLiquidityLoading,
    isError: isLiquidityError,
  } = useReadAlgebraPoolLiquidity({
    address,
  });

  const {
    data: token0Address,
    isLoading: isLoadingToken0,
    isError: isToken0Error,
  } = useReadAlgebraPoolToken0({
    address,
  });

  const {
    data: token1Address,
    isLoading: isLoadingToken1,
    isError: isToken1Error,
  } = useReadAlgebraPoolToken1({
    address,
  });

  const token0 = useCurrency(token0Address ?? undefined);
  const token1 = useCurrency(token1Address ?? undefined);

  console.log('poolError', {
    isTickSpacingError,
    isGlobalStateError,
    isLiquidityError,
    isToken0Error,
    isToken1Error,
  });
  const isPoolError =
    (isTickSpacingError && Boolean(address)) ||
    (isGlobalStateError && Boolean(address)) ||
    (isLiquidityError && Boolean(address)) ||
    (isToken0Error && Boolean(address)) ||
    (isToken1Error && Boolean(address));

  const isPoolLoading = !code
    ? false
    : Boolean(address) &&
      (isTickSpacingLoading ||
        isGlobalStateLoading ||
        isLiquidityLoading ||
        isLoadingToken0 ||
        isLoadingToken1);

  const isTokensLoading = !code
    ? false
    : Boolean(address) && (!token0 || !token1);

  return useMemo(() => {
    if (isPoolError) return [PoolState.INVALID, null];
    if (isPoolLoading || isTokensLoading) return [PoolState.LOADING, null];
    if (!address) return [PoolState.INVALID, null];

    if (!tickSpacing || !globalState || liquidity === undefined)
      return [PoolState.NOT_EXISTS, null];

    if (globalState[0] === BigInt(0) || !token0 || !token1)
      return [PoolState.NOT_EXISTS, null];

    try {
      return [
        PoolState.EXISTS,
        new Pool(
          token0.wrapped,
          token1.wrapped,
          globalState[2],
          globalState[0].toString(),
          ADDRESS_ZERO,
          Number(liquidity),
          globalState[1],
          tickSpacing
        ),
      ];
    } catch (error) {
      console.error('Error creating pool:', error);
      return [PoolState.NOT_EXISTS, null];
    }
  }, [
    address,
    token0,
    token1,
    globalState,
    liquidity,
    tickSpacing,
    isPoolError,
    isPoolLoading,
    isTokensLoading,
  ]);
}
