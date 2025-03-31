import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { ERC20ABI } from '@/lib/abis/erc20';
import {
  decodeEventLog,
  formatUnits,
  keccak256,
  maxUint256,
  parseEther,
  parseUnits,
} from 'viem';
import { LiquidityBootstrapPoolFactoryAddress } from '@/services/network';
import { waitForTransactionReceipt } from '@wagmi/core';
import { config } from '@/config/wagmi';
import { WrappedToastify } from '@/lib/wrappedToastify';
import { LiquidityBootstrapPoolFactoryABI } from '@/lib/abis/LiquidityBootstrapPoolFactory';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import useMulticall3 from '../hooks/useMulticall3';
import { formatErc20Data } from '@/services/lib/helper';
import { useMutation } from '@tanstack/react-query';
import FjordHoneySdk, { TCreatePool } from '@/services/fjord_honeypot_sdk';
import { berachainTestnet } from '@/lib/chain';
import { FormContainer } from './Components';
import { Button } from '@nextui-org/react';
type FomatedTokenType = {
  allowance: bigint;
  balanceOf: bigint;
  decimals: number;
  name: string;
  symbol: string;
};

type Props = {};

const SummaryItem = ({ title, value }: { title: string; value: string }) => {
  return (
    <div className="flex flex-col items-center md:items-start gap-1 max-md:w-[130px] max-md:text-center">
      <div className="text-sm md:text-base font-semibold">{title}</div>
      <div className="text-[12px] leading-4">{value}</div>
    </div>
  );
};

const ApprovalsCard = ({
  step,
  title,
  buttonTitle,
  onClick,
  isLoading,
  status,
  disabled,
  isApproved,
}: {
  step: number;
  title: string;
  buttonTitle: string;
  onClick: () => void;
  isLoading: boolean;
  status?: 'idle' | 'pending' | 'success' | 'error';
  disabled?: boolean;
  isApproved: boolean;
}) => {
  return (
    <div
      className="py-4 px-4 flex flex-col w-full md:w-[196px] h-[192px] gap-4 items-center !bg-[#FBCA4E] border border-black rounded-2xl relative"
      style={{
        background:
          "url('/images/launch-project/subtract-sticky.png'), url('/images/launch-project/subtract-bg.png')",
        backgroundSize: '300% 42px, cover',
        backgroundRepeat: 'no-repeat, no-repeat',
      }}
    >
      <div className="absolute top-0 left-4">
        <img src="/images/launch-project/step-tag.png" alt="step-tag" />
        <p className="absolute top-1 left-1/2 -translate-x-1/2 text-sm font-semibold">
          0{step}
        </p>
      </div>

      <div className="absolute top-0 left-0 right-0 flex justify-center">
        <img
          src="/images/launch-project/token-bg.svg"
          alt="token-bg"
          className=""
        />
        <div className="w-[40px] h-[40px] border border-black rounded-full bg-[#C4C4C4] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
        {/* {title} */}
      </div>
      <div className="w-full h-full flex flex-col justify-end relative z-50">
        <p className="text-sm text-[#33250F] mb-2 text-center">{title}</p>
        <div className="w-full h-[6px] bg-[#211708] rounded-[32px] mb-4" />
        {isApproved && title == 'Approve' ? (
          <Button
            className="bg-white w-full min-h-8 h-8 border border-black text-[10px] text-[#211708]"
            isDisabled={true}
            onClick={onClick}
          >
            Approved
          </Button>
        ) : (
          <Button
            className="bg-white w-full min-h-8 h-8 border border-black text-[10px] text-[#211708]"
            isDisabled={isLoading || disabled}
            onClick={onClick}
          >
            {!isLoading ? buttonTitle : 'Loading...'}
          </Button>
        )}
      </div>
    </div>
  );
};

const Confirm = (props: Props) => {
  const { getValues } = useFormContext();
  const account = useAccount();

  const { writeContractAsync } = useWriteContract();
  const [approvalTokenStatus, setApprovalTokenStatus] = useState<{
    loading: boolean;
    status: 'idle' | 'pending' | 'success' | 'error';
  }>({
    loading: false,
    status: 'idle',
  });
  const [createPoolLoading, setPoolLoading] = useState(false);
  const router = useRouter();

  const {
    startTime,
    endTime,
    projectTokenQuantity,
    customTotalSupplyType,
    customTotalSupply,
    assetTokenAddress,
    projectToken,
    assetTokenQuantity,
  } = getValues();

  const { mutateAsync: createPoolAsync } = useMutation({
    mutationFn: async (data: TCreatePool) => FjordHoneySdk.createPool(data),
  });

  const { data } = useReadContract({
    abi: LiquidityBootstrapPoolFactoryABI,
    address: LiquidityBootstrapPoolFactoryAddress,
    functionName: 'factorySettings',
  });

  const {
    data: tokens,
    isLoading: tokensDataLoading,
    refetch,
  } = useMulticall3({
    queryKey: [assetTokenAddress, projectToken],
    contractCallContext: [
      {
        abi: ERC20ABI as any,
        contractAddress: assetTokenAddress,
        reference: 'assetToken',
        calls: [
          {
            methodName: 'balanceOf',
            reference: 'balanceOf',
            methodParameters: [account?.address],
          },
          {
            methodName: 'allowance',
            reference: 'allowance',
            methodParameters: [
              account?.address,
              LiquidityBootstrapPoolFactoryAddress,
            ],
          },
          {
            methodName: 'decimals',
            reference: 'decimals',
            methodParameters: [],
          },
          {
            methodName: 'name',
            reference: 'name',
            methodParameters: [],
          },
          {
            methodName: 'symbol',
            reference: 'symbol',
            methodParameters: [],
          },
        ],
      },
      {
        abi: ERC20ABI as any,
        contractAddress: projectToken,
        reference: 'projectToken',
        calls: [
          {
            methodName: 'balanceOf',
            reference: 'balanceOf',
            methodParameters: [account?.address],
          },
          {
            methodName: 'allowance',
            reference: 'allowance',
            methodParameters: [
              account?.address,
              LiquidityBootstrapPoolFactoryAddress,
            ],
          },
          {
            methodName: 'decimals',
            reference: 'decimals',
            methodParameters: [],
          },
          {
            methodName: 'name',
            reference: 'name',
            methodParameters: [],
          },
          {
            methodName: 'symbol',
            reference: 'symbol',
            methodParameters: [],
          },
        ],
      },
    ],
  });

  const formatedAssetToken = formatErc20Data(
    tokens?.results?.assetToken?.callsReturnContext ?? []
  ) as FomatedTokenType;

  const formatedProjectToken = formatErc20Data(
    tokens?.results?.projectToken?.callsReturnContext ?? []
  ) as FomatedTokenType;

  const [, platformFee, swapFee] = data ?? [];

  const SummaryItemData = [
    {
      title: 'Swap Fee',
      value: `${swapFee ? swapFee / 1000 : 0}%`,
    },
    {
      title: 'Platform Fee',
      value: `${platformFee ? platformFee / 1000 : 0}%`,
    },
    {
      title: 'Project Token Quantity',
      value: projectTokenQuantity,
    },
    {
      title: 'Collateral Token Quantity',
      value: customTotalSupplyType ? customTotalSupply : 0,
    },
    {
      title: 'Start Time',
      value: dayjs(startTime).format('MM/DD/YYYY HH:mm'),
    },
    {
      title: 'End Time',
      value: dayjs(endTime).format('MM/DD/YYYY HH:mm'),
    },
    {
      title: 'Duration',
      value: `${(
        (dayjs(endTime).unix() - dayjs(startTime).unix()) /
        86400
      ).toFixed(2)}  Days`,
    },
  ];

  const isAssetTokenApproved =
    +formatUnits(
      formatedAssetToken?.allowance || BigInt(0),
      formatedAssetToken?.decimals || 18
    ) -
      assetTokenQuantity >=
    0;

  const isProjectTokenApproved =
    +formatUnits(
      formatedProjectToken?.allowance || BigInt(0),
      formatedProjectToken?.decimals || 18
    ) -
      projectTokenQuantity >=
    0;

  const handleApprovalTokens = async () => {
    const { assetTokenAddress, projectToken } = getValues();
    try {
      setApprovalTokenStatus((prev) => ({
        ...prev,
        loading: true,
        status: 'pending',
      }));
      if (!isAssetTokenApproved) {
        const txHash1 = await writeContractAsync({
          abi: ERC20ABI,
          address: assetTokenAddress,
          functionName: 'approve',
          args: [LiquidityBootstrapPoolFactoryAddress, maxUint256],
        });

        // ts-ignore
        await waitForTransactionReceipt(config, { hash: txHash1 });
      }

      if (!isProjectTokenApproved) {
        const txHash2 = await writeContractAsync({
          abi: ERC20ABI,
          address: projectToken,
          functionName: 'approve',
          args: [LiquidityBootstrapPoolFactoryAddress, maxUint256],
        });

        // ts-ignore
        await waitForTransactionReceipt(config, { hash: txHash2 });
      }
      await refetch();
      setApprovalTokenStatus((prev) => ({ loading: false, status: 'success' }));
    } catch (error) {
      console.log(error);
      setApprovalTokenStatus((prev) => ({ loading: false, status: 'error' }));
    }
    WrappedToastify.success({ message: 'Approved Token Successfully ' });
  };

  const handleCreatePool = async () => {
    const {
      name,
      description,
      assetTokenAddress,
      projectToken,
      lbpType,
      startTime,
      endTime,
      startWeight,
      endWeight,
      projectTokenQuantity,
      assetTokenQuantity,
      tokenClaimDelayHours,
      tokenClaimDelayMinutes,
      projectTokenLogo,
      saleBanner,
      projectLink,
      lbpDescription,
      projectName,
    } = getValues();
    const sellingAllowed = lbpType === 'buy-sell';
    if (account.address) {
      try {
        setPoolLoading(true);

        const salt = projectToken + assetTokenAddress;

        const txHash = await writeContractAsync({
          abi: LiquidityBootstrapPoolFactoryABI,
          address: LiquidityBootstrapPoolFactoryAddress,
          functionName: 'createLiquidityBootstrapPool',
          args: [
            {
              asset: assetTokenAddress,
              share: projectToken,
              creator: account.address,
              whitelistMerkleRoot:
                '0x0000000000000000000000000000000000000000000000000000000000000000',
              sellingAllowed: sellingAllowed,
              saleStart: dayjs(startTime).unix(),
              saleEnd: dayjs(endTime).unix(),
              minAssetsIn: BigInt(0),
              minPercAssetsSeeding: 0,
              minSharesSeeding: BigInt(0),
              redemptionDelay:
                tokenClaimDelayHours * 60 * 60 + tokenClaimDelayMinutes * 60,
              weightStart: parseEther(`${startWeight / 100}`),
              weightEnd: parseEther(`${endWeight / 100}`),
              maxSharePrice: maxUint256,
              maxTotalAssetsIn: BigInt(0),
              maxSharesOut: maxUint256,
              maxTotalAssetsInDeviation: 10,
              vestCliff: 0,
              vestEnd: 0,
              virtualAssets: BigInt(0),
            },
            parseUnits(
              `${projectTokenQuantity}`,
              formatedProjectToken?.decimals ?? 18
            ),
            parseUnits(
              `${assetTokenQuantity}`,
              formatedAssetToken?.decimals ?? 18
            ),
            keccak256(salt as `0x${string}`),
          ],
        });

        // ts-ignore
        const res = await waitForTransactionReceipt(config, { hash: txHash });
        let poolAddress: string | null = null;

        res.logs.forEach((log) => {
          try {
            const decode = decodeEventLog({
              abi: LiquidityBootstrapPoolFactoryABI,
              data: log.data,
              topics: log.topics,
            });

            if (decode.eventName == 'PoolCreated') {
              poolAddress = decode.args.pool;
            }
          } catch (error) {}
        });
        if (poolAddress) {
          await createPoolAsync({
            address: poolAddress,
            name: projectName,
            description: lbpDescription,
            chainId: berachainTestnet.id,
            owner: account.address as string,
            endsAt: dayjs(endTime).toDate(),
            startsAt: dayjs(startTime).toDate(),
            swapCount: 0,
            swapFee: '0.3',
            swapEnabled: sellingAllowed,
            blockNumber: +res.blockNumber.toString(),
            sellingAllowed: sellingAllowed,
            assetTokenAddress: assetTokenAddress,
            assetTokenName: formatedAssetToken.name,
            assetTokenSymbol: formatedAssetToken.symbol,
            shareTokenAddress: projectToken,
            shareTokenName: formatedProjectToken.name,
            shareTokenSymbol: formatedProjectToken.symbol,
            txHash: txHash,
            assetTokenDecimals: formatedAssetToken.decimals,
            assetsInitial: '',
            fundsRaised: 0,
            lbpMarketcap: '',
            liquidity: '',
            shareTokenDecimals: formatedProjectToken.decimals,
            sharesInitial: '',
            sharesReleased: '',
            volume: '',
            weightStart: parseEther(`${startWeight / 100}`).toString(),
            weightEnd: parseEther(`${endWeight / 100}`).toString(),
            assetsCurrent: parseUnits(
              `${assetTokenQuantity}`,
              formatedAssetToken?.decimals ?? 18
            ).toString(),
            numberParticipants: 0,
            sharesCurrent: parseUnits(
              `${projectTokenQuantity}`,
              formatedProjectToken?.decimals ?? 18
            ).toString(),
            bannerUrl: saleBanner,
            imageUrl: projectTokenLogo,
            learnMoreUrl: projectLink,
            redemptionDelay:
              tokenClaimDelayHours * 60 * 60 + tokenClaimDelayMinutes * 60,
          });
          router.push(`/dreampad/lbp-detail/${poolAddress}`);
        }
      } catch (error) {
        console.log(error);
        WrappedToastify.error({
          message: 'Something went wrong! Please try again',
        });
      }
      setPoolLoading(false);
    }
  };

  const isBothTokenApproved = isProjectTokenApproved && isAssetTokenApproved;
  const isBothSufficientBalance =
    +formatUnits(
      formatedAssetToken?.balanceOf || BigInt(0),
      formatedAssetToken?.decimals || 18
    ) -
      assetTokenQuantity >=
      0 &&
    +formatUnits(
      formatedProjectToken?.balanceOf || BigInt(0),
      formatedProjectToken?.decimals || 18
    ) -
      projectTokenQuantity >=
      0;

  return (
    <FormContainer>
      <h3 className="text-[23px] md:text-2xl md:leading-[26px] font-semibold">
        Quick Summary
      </h3>
      <div className="flex flex-col gap-9">
        <div className="mt-3 md:mt-6 flex flex-wrap justify-between px-3 py-5 md:p-6 border border-black rounded-2xl shadow-field gap-y-4">
          {SummaryItemData.map((d) => (
            <SummaryItem title={d.title} value={d.value} key={d.value} />
          ))}
        </div>
        <div>
          <h3 className="text-2xl leading-[26px] font-semibold mb-6">
            Final Approvals
          </h3>
          <div className="flex flex-col md:flex-row gap-3.5">
            <ApprovalsCard
              step={1}
              title={'Approve'}
              buttonTitle="Approve"
              onClick={handleApprovalTokens}
              isLoading={approvalTokenStatus.loading || tokensDataLoading}
              status={approvalTokenStatus.status}
              isApproved={isBothTokenApproved}
            />
            <ApprovalsCard
              disabled={
                !isAssetTokenApproved ||
                !isProjectTokenApproved ||
                !isBothSufficientBalance
              }
              isLoading={createPoolLoading}
              onClick={handleCreatePool}
              step={2}
              title={'Schedule Sale '}
              buttonTitle={
                !isBothSufficientBalance ? 'Insufficient balance' : 'Approve'
              }
              isApproved={isBothTokenApproved}
            />
          </div>
        </div>
      </div>
    </FormContainer>
  );
};

export default Confirm;
