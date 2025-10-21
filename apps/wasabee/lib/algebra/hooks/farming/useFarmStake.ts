import { useContractWrite, useSimulateContract } from 'wagmi';
import { encodeFunctionData } from 'viem';
import { MaxUint128 } from '@cryptoalgebra/sdk';
import { useFarmCheckApprove } from './useFarmCheckApprove';
import { useEffect, useState } from 'react';
import { useTransactionAwait } from '../common/useTransactionAwait';
import { Address } from 'viem';
import { farmingCenterABI } from '@/lib/abis/algebra-contracts/ABIs';
import { Deposit } from '../../graphql/generated/graphql';
import { TransactionType } from '../../state/pendingTransactionsStore';
import { wallet } from '@honeypot/shared/lib/wallet';
import { useSubgraphClient } from '@honeypot/shared/hooks/useSubgraphClients';

export function useFarmStake({
  tokenId,
  rewardToken,
  bonusRewardToken,
  pool,
  nonce,
}: {
  tokenId: bigint;
  rewardToken: Address;
  bonusRewardToken: Address;
  pool: Address;
  nonce: bigint;
}) {
  const { approved } = useFarmCheckApprove(tokenId);
  const farmingClient = useSubgraphClient('algebra_farming');

  const [isQueryLoading, setIsQueryLoading] = useState<boolean>(false);

  const address =
    tokenId && approved
      ? wallet.currentChain.contracts.algebraFarmingCenter
      : undefined;

  const { data: config } = useSimulateContract({
    address,
    abi: farmingCenterABI,
    functionName: 'enterFarming',
    args: [
      {
        rewardToken,
        bonusRewardToken,
        pool,
        nonce,
      },
      tokenId,
    ],
  });

  const { data: data, writeContractAsync: onStake } = useContractWrite();

  const { isLoading, isSuccess } = useTransactionAwait(data, {
    title: `Farm Stake`,
    tokenId: tokenId.toString(),
    type: TransactionType.FARM,
  });

  useEffect(() => {
    if (!isSuccess) return;

    setIsQueryLoading(true);
    const interval: NodeJS.Timeout = setInterval(
      () =>
        farmingClient.refetchQueries({
          include: ['Deposits'],
          onQueryUpdated: (query, { result: diff }) => {
            const currentPos = diff.deposits.find(
              (deposit: Deposit) => deposit.id.toString() === tokenId.toString()
            );
            if (!currentPos) return;

            if (currentPos.eternalFarming !== null) {
              query.refetch().then(() => {
                setIsQueryLoading(false);
                clearInterval(interval);
              });
            } else {
              query.refetch().then();
            }
          },
        }),
      2000
    );

    return () => clearInterval(interval);
  }, [isSuccess]);

  return {
    isLoading: isQueryLoading || isLoading,
    isSuccess,
    onStake: () => config && onStake(config.request),
  };
}

export function useFarmUnstake({
  tokenId,
  rewardToken,
  bonusRewardToken,
  pool,
  nonce,
  account,
}: {
  tokenId: bigint;
  rewardToken: Address;
  bonusRewardToken: Address;
  pool: Address;
  nonce: bigint;
  account: Address;
}) {
  const [isQueryLoading, setIsQueryLoading] = useState<boolean>(false);
  const farmingClient = useSubgraphClient('algebra_farming');
  const exitFarmingCalldata = encodeFunctionData({
    abi: farmingCenterABI,
    functionName: 'exitFarming',
    args: [
      {
        rewardToken,
        bonusRewardToken,
        pool,
        nonce,
      },
      tokenId,
    ],
  });

  const rewardClaimCalldata = encodeFunctionData({
    abi: farmingCenterABI,
    functionName: 'claimReward',
    args: [rewardToken, account, BigInt(MaxUint128)],
  });

  const bonusRewardClaimCalldata = encodeFunctionData({
    abi: farmingCenterABI,
    functionName: 'claimReward',
    args: [bonusRewardToken, account, BigInt(MaxUint128)],
  });

  const calldatas = [
    exitFarmingCalldata,
    rewardClaimCalldata,
    bonusRewardClaimCalldata,
  ];

  const { data: config } = useSimulateContract({
    address:
      account && tokenId
        ? wallet.currentChain.contracts.algebraFarmingCenter
        : undefined,
    abi: farmingCenterABI,
    functionName: 'multicall',
    args: [calldatas],
  });

  const { data: data, writeContractAsync: onUnstake } = useContractWrite();

  const { isLoading, isSuccess } = useTransactionAwait(data, {
    title: `Farm Unstake`,
    tokenId: tokenId.toString(),
    type: TransactionType.FARM,
  });

  useEffect(() => {
    if (!isSuccess) return;

    setIsQueryLoading(true);
    const interval: NodeJS.Timeout = setInterval(
      () =>
        farmingClient.refetchQueries({
          include: ['Deposits'],
          onQueryUpdated: (query, { result: diff }) => {
            const currentPos = diff.deposits.find(
              (deposit: Deposit) => deposit.id.toString() === tokenId.toString()
            );
            if (!currentPos) return;

            if (currentPos.eternalFarming === null) {
              query.refetch().then(() => {
                setIsQueryLoading(false);
                clearInterval(interval);
              });
            } else {
              query.refetch().then();
            }
          },
        }),
      2000
    );

    return () => clearInterval(interval);
  }, [isSuccess]);

  return {
    isLoading: isLoading || isQueryLoading,
    isSuccess,
    onUnstakes: () => config && onUnstake(config.request),
  };
}
