import Loader from '@/components/algebra/common/Loader';
import { Button } from '@/components/button/button-next';
import { useApprove } from '@/lib/algebra/hooks/common/useApprove';
import { useTransactionAwait } from '@/lib/algebra/hooks/common/useTransactionAwait';
import { IDerivedMintInfo } from '@/lib/algebra/state/mintStore';
import { TransactionType } from '@/lib/algebra/state/pendingTransactionsStore';
import { useUserState } from '@/lib/algebra/state/userStore';
import { ApprovalState } from '@/types/algebra/types/approve-state';
import {
  Percent,
  Currency,
  NonfungiblePositionManager,
  Field,
  ZERO,
  ADDRESS_ZERO,
  algebraPositionManagerABI,
} from '@cryptoalgebra/sdk';
import { Address, getContract } from 'viem';
import JSBI from 'jsbi';
import { useMemo } from 'react';
import { useAccount, useContractWrite } from 'wagmi';
import { useSimulateAlgebraPositionManagerMulticall } from '@honeypot/shared/wagmi-generated';
import { wallet } from '@honeypot/shared/lib/wallet';
import { ContractWrite } from '@honeypot/shared/lib/utils/utils';
import { useObserver } from 'mobx-react-lite';
interface AddLiquidityButtonProps {
  baseCurrency: Currency | undefined | null;
  quoteCurrency: Currency | undefined | null;
  mintInfo: IDerivedMintInfo;
  poolAddress: Address | undefined;
}

const ZERO_PERCENT = new Percent('0');
const DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE = new Percent(50, 10_000);

export const AddLiquidityButton = ({
  baseCurrency,
  quoteCurrency,
  mintInfo,
  poolAddress,
}: AddLiquidityButtonProps) => {
  const { address: account } = useAccount();
  const ALGEBRA_POSITION_MANAGER = useObserver(
    () => wallet.currentChain.contracts.algebraPositionManager
  );

  const { txDeadline } = useUserState();

  const useNative = baseCurrency?.isNative
    ? baseCurrency
    : quoteCurrency?.isNative
    ? quoteCurrency
    : undefined;

  const { calldata, value } = useMemo(() => {
    console.log('mintInfo', mintInfo);
    console.log('ALGEBRA_POSITION_MANAGER', ALGEBRA_POSITION_MANAGER);
    if (!account || !mintInfo.position) {
      console.log('Missing account or position:', {
        account,
        position: mintInfo.position,
      });
      return { calldata: undefined, value: undefined };
    }

    if (JSBI.EQ(mintInfo.position.liquidity, ZERO)) {
      console.log('Position liquidity is zero');
      return { calldata: undefined, value: undefined };
    }

    return NonfungiblePositionManager.addCallParameters(mintInfo.position, {
      slippageTolerance: mintInfo.outOfRange
        ? ZERO_PERCENT
        : DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE,
      recipient: account,
      deadline: Date.now() + txDeadline,
      deployer: ADDRESS_ZERO,
      useNative,
      createPool: mintInfo.noLiquidity,
    });
  }, [mintInfo, account, txDeadline, useNative]);

  const { approvalState: approvalStateA, approvalCallback: approvalCallbackA } =
    useApprove(
      mintInfo.parsedAmounts[Field.CURRENCY_A],
      ALGEBRA_POSITION_MANAGER
    );
  const { approvalState: approvalStateB, approvalCallback: approvalCallbackB } =
    useApprove(
      mintInfo.parsedAmounts[Field.CURRENCY_B],
      ALGEBRA_POSITION_MANAGER
    );

  const showApproveA =
    approvalStateA === ApprovalState.NOT_APPROVED ||
    approvalStateA === ApprovalState.PENDING;

  const showApproveB =
    approvalStateB === ApprovalState.NOT_APPROVED ||
    approvalStateB === ApprovalState.PENDING;

  const isReady = useMemo(() => {
    return Boolean(
      (mintInfo.depositADisabled
        ? true
        : approvalStateA === ApprovalState.APPROVED) &&
        (mintInfo.depositBDisabled
          ? true
          : approvalStateB === ApprovalState.APPROVED) &&
        !mintInfo.errorMessage &&
        !mintInfo.invalidRange
    );
  }, [mintInfo, approvalStateA, approvalStateB]);

  const { data: addLiquidityData, writeContract: addLiquidity } =
    useContractWrite();

  const { data: addLiquidityConfig, error } =
    useSimulateAlgebraPositionManagerMulticall({
      args: calldata && [calldata as `0x${string}`[]],
      query: {
        enabled: Boolean(calldata && isReady),
      },
      value: BigInt(value || 0),
    });

  const { isLoading: isAddingLiquidityLoading, data } = useTransactionAwait(
    addLiquidityData,
    {
      title: 'Add liquidity',
      tokenA: baseCurrency?.wrapped.address as Address,
      tokenB: quoteCurrency?.wrapped.address as Address,
      type: TransactionType.POOL,
    },
    `/pool-detail/${poolAddress}`
  );

  console.log('data', data);

  if (mintInfo.errorMessage)
    return (
      <Button
        disabled
        className="w-full h-[56px] rounded-[12px] !text-[18px] !bg-[#FB9A1B] !border-[3px] !border-[#C87304] text-black font-semibold opacity-50"
      >
        {mintInfo.errorMessage}
      </Button>
    );

  if (showApproveA || showApproveB)
    return (
      <div className="flex w-full gap-2">
        {showApproveA && (
          <Button
            disabled={approvalStateA === ApprovalState.PENDING}
            className="w-full h-[56px] rounded-[12px] !text-[18px] !bg-[#FB9A1B] !border-[3px] !border-[#C87304] text-black font-semibold hover:bg-[#FFA931]"
            onClick={() => approvalCallbackA && approvalCallbackA()}
          >
            {approvalStateA === ApprovalState.PENDING ? (
              <Loader />
            ) : (
              `Approve ${mintInfo.currencies.CURRENCY_A?.symbol}`
            )}
          </Button>
        )}
        {showApproveB && (
          <Button
            disabled={approvalStateB === ApprovalState.PENDING}
            className="w-full h-[56px] rounded-[12px] !text-[18px] !bg-[#FB9A1B] !border-[3px] !border-[#C87304] text-black font-semibold hover:bg-[#FFA931]"
            onClick={() => approvalCallbackB && approvalCallbackB()}
          >
            {approvalStateB === ApprovalState.PENDING ? (
              <Loader />
            ) : (
              `Approve ${mintInfo.currencies.CURRENCY_B?.symbol}`
            )}
          </Button>
        )}
      </div>
    );

  return (
    <Button
      disabled={!isReady}
      onPress={async () => {
        console.log('addLiquidityConfig', addLiquidityConfig);
        console.log('calldata', calldata);
        console.log('value', value);
        console.log('error', error);

        if (addLiquidityConfig && addLiquidityConfig.request) {
          addLiquidity(addLiquidityConfig.request);
        } else if (calldata && value !== undefined && isReady) {
          // Fallback: directly call the contract when simulation fails
          console.log('Using fallback for liquidity addition');
          addLiquidity({
            address: ALGEBRA_POSITION_MANAGER as Address,
            abi: algebraPositionManagerABI,
            functionName: 'multicall',
            args: [calldata as `0x${string}`[]],
            value: BigInt(value || 0),
          });
        } else {
          console.error('Cannot add liquidity: missing config or calldata', {
            hasCalldata: !!calldata,
            hasValue: value !== undefined,
            isReady,
            hasConfig: !!addLiquidityConfig,
            error,
          });
        }
      }}
      className="whitespace-nowrap w-full h-[56px] rounded-[12px] !text-[18px] !bg-[#FB9A1B] !border-[3px] !border-[#C87304] text-black font-semibold hover:bg-[#FFA931] disabled:opacity-50"
    >
      {isAddingLiquidityLoading ? <Loader /> : 'Create Position'}
    </Button>
  );
};

export default AddLiquidityButton;
