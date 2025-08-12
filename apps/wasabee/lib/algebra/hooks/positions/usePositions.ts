import {
  Token,
  algebraPositionManagerABI,
  computePoolAddress,
} from '@cryptoalgebra/sdk';
import { useMemo } from 'react';
import { useAccount, useContractReads, useReadContracts } from 'wagmi';
import { Address } from 'viem';
import { useDepositsQuery } from '../../graphql/generated/graphql';
import { useReadAlgebraPositionManagerBalanceOf } from '@honeypot/shared/wagmi-generated';
import { useObserver } from 'mobx-react-lite';
import { wallet } from '@honeypot/shared/lib/wallet';
import { useSubgraphClient } from '@honeypot/shared';

export interface PositionFromTokenId {
  tokenId: number;
  feeGrowthInside0LastX128: bigint;
  feeGrowthInside1LastX128: bigint;
  liquidity: bigint;
  nonce: string;
  operator: string;
  tickLower: bigint;
  tickUpper: bigint;
  token0: Address;
  token1: Address;
  tokensOwed0: bigint;
  tokensOwed1: bigint;
  pool: Address;
}

function usePositionsFromTokenIds(tokenIds: any[] | undefined): {
  isLoading: boolean;
  positions: PositionFromTokenId[] | undefined;
  refetch: () => void;
} {
  const inputs = useMemo(
    () => (tokenIds ? tokenIds.map((tokenId) => tokenId) : []),
    [tokenIds]
  );
  const ALGEBRA_POSITION_MANAGER = useObserver(
    () => wallet.currentChain.contracts.algebraPositionManager
  );

  const {
    data: results,
    isLoading,
    isError,
    error,
    refetch,
  } = useReadContracts({
    contracts: inputs.map((x) => ({
      address: ALGEBRA_POSITION_MANAGER,
      abi: algebraPositionManagerABI,
      functionName: 'positions',
      args: [[Number(x)]],
    })),
    // cacheTime: 10_000,
  });

  const { address: account } = useAccount();

  const positions = useMemo(() => {
    if (!isLoading && !isError && tokenIds && !error) {
      // @ts-ignore
      return results
        ?.filter((v) => !v.error)
        .map((call, i) => {
          const tokenId = tokenIds[i];
          const result = call.result as any;

          const pool = computePoolAddress({
            tokenA: new Token(wallet.currentChainId, result[2], 18),
            tokenB: new Token(wallet.currentChainId, result[3], 18),
          }) as Address;

          return {
            tokenId,
            feeGrowthInside0LastX128: result[8],
            feeGrowthInside1LastX128: result[9],
            liquidity: result[7],
            nonce: result[0],
            operator: result[1],
            tickLower: result[5],
            tickUpper: result[6],
            token0: result[2],
            token1: result[3],
            tokensOwed0: result[10],
            tokensOwed1: result[11],
            pool,
          };
        });
    }
    return undefined;
    // @ts-ignore
  }, [isLoading, isError, error, results, tokenIds, account, refetch]);

  return useMemo(() => {
    return {
      isLoading,
      positions,
      refetch,
    };
  }, [isLoading, positions, refetch]);
}

export function usePositions() {
  const { address: account } = useAccount();
  const ALGEBRA_POSITION_MANAGER = useObserver(
    () => wallet.currentChain.contracts.algebraPositionManager
  );
  const { data: balanceResult, isLoading: balanceLoading } =
    useReadAlgebraPositionManagerBalanceOf({
      args: account ? [account] : undefined,
      // cacheTime: 10_000,
    });

  const tokenIdsArgs: [Address, number][] = useMemo(() => {
    if (!balanceResult || !account) return [];

    const tokenRequests: any[] = [];

    for (let i = 0; i < balanceResult; i++) {
      tokenRequests.push([account, i]);
    }

    return tokenRequests;
  }, [account, balanceResult]);

  const { data: tokenIdResults, isLoading: someTokenIdsLoading } =
    useReadContracts({
      contracts: tokenIdsArgs.map((args) => ({
        address: ALGEBRA_POSITION_MANAGER,
        abi: algebraPositionManagerABI,
        functionName: 'tokenOfOwnerByIndex',
        args,
      })),
      query: {
        gcTime: 5 * 60 * 1000,
      },
      // cacheTime: 10_000,
    });

  const tokenIds = useMemo(() => {
    if (!account || !tokenIdResults) return [];
    return tokenIdResults
      .map(({ result }) => result)
      .filter((result): result is bigint => !!result);
  }, [account, tokenIdResults]);

  const {
    positions,
    isLoading: positionsLoading,
    refetch,
  } = usePositionsFromTokenIds(tokenIds);

  return {
    loading: someTokenIdsLoading || balanceLoading || positionsLoading,
    positions,
    refetch,
  };
}

export function usePosition(tokenId: string | number | undefined): {
  loading: boolean;
  position: PositionFromTokenId | undefined;
  refetch: () => void;
} {
  const tokenIdArr = useMemo(() => {
    if (!tokenId) return;
    return [tokenId];
  }, [tokenId]);

  const { isLoading, positions, refetch } =
    usePositionsFromTokenIds(tokenIdArr);

  return useMemo(() => {
    return {
      loading: isLoading,
      position: positions?.[0],
      refetch,
    };
  }, [isLoading, positions, refetch]);
}

export function usePositionInFarming(tokenId: string | number | undefined) {
  const { position } = usePosition(tokenId);
  const farmingClient = useSubgraphClient('algebra_farming');

  const { address: account } = useAccount();

  const { data: deposits } = useDepositsQuery({
    variables: {
      owner: account ? account : undefined,
      pool: position?.pool,
    },
    client: farmingClient,
  });

  if (!deposits) return;
  const openedPositions = deposits.deposits.filter(
    (deposit) => deposit.eternalFarming !== null
  );

  const positionInFarming = openedPositions.find(
    (deposit) => Number(deposit.id) === Number(tokenId)
  );

  if (!positionInFarming) return;
  return positionInFarming;
}
