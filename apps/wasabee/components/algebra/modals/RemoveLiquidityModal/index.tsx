import Loader from '@/components/algebra/common/Loader';
import { Button } from '@/components/algebra/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/algebra/ui/dialog';
import { Slider } from '@/components/algebra/ui/slider';
import { Deposit } from '@/lib/algebra/graphql/generated/graphql';
import { useTransactionAwait } from '@/lib/algebra/hooks/common/useTransactionAwait';
import {
  usePosition,
  usePositions,
} from '@/lib/algebra/hooks/positions/usePositions';
import {
  useBurnState,
  useBurnActionHandlers,
  useDerivedBurnInfo,
} from '@/lib/algebra/state/burnStore';
import { TransactionType } from '@/lib/algebra/state/pendingTransactionsStore';
import { useUserState } from '@/lib/algebra/state/userStore';
import { NonfungiblePositionManager, Percent } from '@cryptoalgebra/sdk';
import { Address } from 'viem';
import { useEffect, useMemo, useState } from 'react';
import { useAccount, useContractWrite } from 'wagmi';
import { useSimulateAlgebraPositionManagerMulticall } from '@honeypot/shared/wagmi-generated';
import { HoneyContainer } from '@/components/CardContianer';
import { useSubgraphClient } from '@honeypot/shared';

interface RemoveLiquidityModalProps {
  positionId: number;
}

type SliderValue = number[];

const RemoveLiquidityModal = ({ positionId }: RemoveLiquidityModalProps) => {
  const [sliderValue, setSliderValue] = useState<SliderValue>([50]);
  const farmingClient = useSubgraphClient('algebra_farming');
  const { txDeadline } = useUserState();
  const { address: account } = useAccount();

  const { refetch: refetchAllPositions } = usePositions();

  const { position, refetch: refetchPosition } = usePosition(positionId);

  const { percent } = useBurnState();

  const { onPercentSelect } = useBurnActionHandlers();

  const derivedInfo = useDerivedBurnInfo(position, false);

  const {
    position: positionSDK,
    liquidityPercentage,
    feeValue0,
    feeValue1,
  } = derivedInfo;

  const { calldata, value } = useMemo(() => {
    if (
      !positionSDK ||
      !positionId ||
      !liquidityPercentage ||
      !feeValue0 ||
      !feeValue1 ||
      !account ||
      percent === 0
    )
      return { calldata: undefined, value: undefined };

    return NonfungiblePositionManager.removeCallParameters(positionSDK, {
      tokenId: String(positionId),
      liquidityPercentage,
      slippageTolerance: new Percent(1, 100),
      deadline: Date.now() + txDeadline * 1000,
      collectOptions: {
        expectedCurrencyOwed0: feeValue0,
        expectedCurrencyOwed1: feeValue1,
        recipient: account,
      },
    });
  }, [
    positionId,
    positionSDK,
    txDeadline,
    feeValue0,
    feeValue1,
    liquidityPercentage,
    account,
    percent,
  ]);

  const { data: removeLiquidityConfig } =
    useSimulateAlgebraPositionManagerMulticall({
      args: calldata && [calldata as `0x${string}`[]],
      value: BigInt(value || 0),
      query: {
        enabled: Boolean(calldata),
      },
    });

  const { data: removeLiquidityData, writeContract: removeLiquidity } =
    useContractWrite();

  const { isLoading: isRemoveLoading, isSuccess } = useTransactionAwait(
    removeLiquidityData,
    {
      title: 'Removing liquidity',
      tokenA: position?.token0 as Address,
      tokenB: position?.token1 as Address,
      type: TransactionType.POOL,
    }
  );

  const isDisabled =
    sliderValue[0] === 0 || isRemoveLoading || !removeLiquidity;

  useEffect(() => {
    onPercentSelect(sliderValue[0]);
  }, [sliderValue]);

  const [isOpen, setIsOpen] = useState(false);

  const handleCloseModal = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isSuccess) return;
    let interval: NodeJS.Timeout;

    /* pool positions refetch */
    Promise.all([refetchPosition(), refetchAllPositions()])

      /* farming deposits refetch */
      .then(() => {
        handleCloseModal?.();
        if (sliderValue[0] !== 100) return;
        interval = setInterval(
          () =>
            farmingClient.refetchQueries({
              include: ['Deposits'],
              onQueryUpdated: (query, { result: diff }) => {
                const currentPos = diff.deposits.find(
                  (deposit: Deposit) =>
                    deposit.id.toString() === positionId.toString()
                );
                if (!currentPos) return;

                if (currentPos.eternalFarming === null) {
                  clearInterval(interval);
                } else {
                  query.refetch().then();
                }
              },
            }),
          2000
        );
      });

    return () => clearInterval(interval);
  }, [isSuccess]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={'outline'}
          className="w-full rounded-md border-2 border-[rgba(225,138,32,0.40)] bg-[rgba(225,138,32,0.40)] backdrop-blur-sm"
        >
          Remove Liquidity
        </Button>
      </DialogTrigger>
      <DialogContent
        className="min-w-[500px] rounded-3xl p-0 bg-[#322111] border-none"
        style={{ borderRadius: '32px' }}
      >
        <HoneyContainer>
          <DialogHeader>
            <DialogTitle className="font-bold select-none">
              Remove Liquidity
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-6">
            <h2 className="text-3xl font-bold select-none">{`${sliderValue}%`}</h2>

            <div className="flex gap-2">
              {[25, 50, 75, 100].map((v) => (
                <Button
                  key={`liquidity-percent-${v}`}
                  disabled={isRemoveLoading}
                  variant={'icon'}
                  className="border border-card-border"
                  size={'sm'}
                  onClick={() => setSliderValue([v])}
                >
                  {v}%
                </Button>
              ))}
            </div>

            <Slider
              value={sliderValue}
              id="liquidity-percent"
              max={100}
              defaultValue={sliderValue}
              step={1}
              onValueChange={(v: SliderValue) => setSliderValue(v)}
              className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4 bg-[#9D5E28]/20 rounded-lg"
              aria-label="Liquidity Percent"
              disabled={isRemoveLoading}
            />

            <Button
              className="w-full rounded-md border-2 border-[rgba(225,138,32,0.40)] bg-[rgba(225,138,32,0.40)] backdrop-blur-sm"
              disabled={isDisabled}
              onClick={() =>
                removeLiquidityConfig &&
                removeLiquidity(removeLiquidityConfig.request)
              }
            >
              {isRemoveLoading ? <Loader /> : 'Remove Liquidity'}
            </Button>
          </div>
        </HoneyContainer>
      </DialogContent>
    </Dialog>
  );
};

RemoveLiquidityModal.whyDidYouRender = true;

export default RemoveLiquidityModal;
