import { useRouter } from 'next/navigation';
import { Button } from '@/components/button/button-next';
import { useEffect, useMemo, useState } from 'react';
import {
  ADDRESS_ZERO,
  NonfungiblePositionManager,
  algebraPositionManagerABI,
  computePoolAddress,
} from '@cryptoalgebra/sdk';
import { useTransactionAwait } from '@/lib/algebra/hooks/common/useTransactionAwait';
import { useContractWrite, useWriteContract } from 'wagmi';
import { Address, getContract, maxInt256 } from 'viem';
import Loader from '@/components/algebra/common/Loader';
import { PoolState, usePool } from '@/lib/algebra/hooks/pools/usePool';
import SelectPair from '../SelectPair';
import {
  useMintState,
  useDerivedMintInfo,
} from '@/lib/algebra/state/mintStore';
import { TransactionType } from '@/lib/algebra/state/pendingTransactionsStore';
import {
  useDerivedSwapInfo,
  useSwapState,
} from '@/lib/algebra/state/swapStore';
import { SwapField } from '@/types/algebra/types/swap-field';
import { useSimulateAlgebraPositionManagerMulticall } from '@/wagmi-generated';
import { useToastify } from '@/lib/hooks/useContractToastify';
import { Input } from '@/components/algebra/ui/input';
import HoneyContainer from '@/components/CardContianer/HoneyContainer';
import { wallet } from '@honeypot/shared/lib/wallet';
import { useObserver } from 'mobx-react-lite';

const FEE_TIERS = [
  { value: 100, label: '0.01%', description: 'Best for stable pairs' },
  { value: 500, label: '0.05%', description: 'Best for stable pairs' },
  { value: 3000, label: '0.3%', description: 'Best for most pairs' },
  { value: 10000, label: '1%', description: 'Best for exotic pairs' },
];

const CreatePoolForm = () => {
  const router = useRouter();
  const { currencies } = useDerivedSwapInfo();

  const { currentChain } = useObserver(() => {
    return {
      currentChain: wallet.currentChain,
    };
  });

  const {
    actions: { selectCurrency },
  } = useSwapState();

  const {
    startPriceTypedValue,
    actions: { typeStartPriceInput },
  } = useMintState();

  const currencyA = currencies[SwapField.INPUT];
  const currencyB = currencies[SwapField.OUTPUT];

  const areCurrenciesSelected = currencyA && currencyB;

  const isSameToken =
    areCurrenciesSelected && currencyA.wrapped.equals(currencyB.wrapped);

  const poolAddress =
    areCurrenciesSelected && !isSameToken
      ? (computePoolAddress({
          tokenA: currencyA.wrapped,
          tokenB: currencyB.wrapped,
        }) as Address)
      : undefined;

  const [poolState] = usePool(poolAddress);

  const isPoolExists = poolState === PoolState.EXISTS;

  const [selectedFee, setSelectedFee] = useState(3000);

  const mintInfo = useDerivedMintInfo(
    currencyA ?? undefined,
    currencyB ?? undefined,
    poolAddress ?? undefined,
    selectedFee,
    currencyA ?? undefined,
    undefined
  );

  const { calldata, value } = useMemo(() => {
    if (!mintInfo?.pool)
      return {
        calldata: undefined,
        value: undefined,
      };

    return NonfungiblePositionManager.createCallParameters(
      mintInfo.pool,
      ADDRESS_ZERO
    );
  }, [mintInfo?.pool]);

  const { data: createPoolData, writeContract: createPool } = useWriteContract(
    {}
  );

  const { data: createPoolConfig } = useSimulateAlgebraPositionManagerMulticall(
    {
      args: Array.isArray(calldata)
        ? [calldata as Address[]]
        : [[calldata] as Address[]],
      value: BigInt(value || 0),
      query: {
        enabled: Boolean({ calldata }),
      },
    }
  );

  console.log('config', { createPoolConfig, calldata, value, mintInfo });

  const { isLoading, isError, isSuccess } = useTransactionAwait(
    createPoolData,
    {
      title: 'Create Pool',
      tokenA: currencyA?.wrapped.address as Address,
      tokenB: currencyB?.wrapped.address as Address,
      type: TransactionType.POOL,
    },
    `/pool-detail/${poolAddress}`
  );

  useToastify({
    title: 'Create Pool',
    isLoading,
    isSuccess,
    isError,
    message: isLoading ? 'Pending' : isSuccess ? 'Success' : 'Failed',
  });

  useEffect(() => {
    selectCurrency(SwapField.INPUT, undefined);
    selectCurrency(SwapField.OUTPUT, undefined);
    typeStartPriceInput('');

    return () => {
      selectCurrency(SwapField.INPUT, ADDRESS_ZERO);
      selectCurrency(
        SwapField.OUTPUT,
        currentChain.validatedTokens.filter((token) => token.isStableCoin)[0]
          .address
      );
      typeStartPriceInput('');
    };
  }, []);

  const handleButtonClick = async () => {
    if (isPoolExists && poolAddress) {
      router.push(`/pool-detail/${poolAddress}`);
      return;
    }

    if (createPoolConfig) {
      createPool(createPoolConfig?.request);
    }
  };

  return (
    <HoneyContainer>
      <div className="flex flex-col gap-4 p-4 rounded-3xl transition-all text-black">
        <h2 className="font-semibold text-xl">Select Pair</h2>
        <SelectPair
          mintInfo={mintInfo}
          currencyA={currencyA}
          currencyB={currencyB}
        />

        {areCurrenciesSelected && !isSameToken && !isPoolExists && (
          <>
            {/* <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-300">Select Fee Tier</label>
            <div className="grid grid-cols-2 gap-2">
              {FEE_TIERS.map((fee) => (
                <Button
                  key={fee.value}
                  type="button"
                  variant={selectedFee === fee.value ? "default" : "outline"}
                  className={`flex flex-col items-start p-3 h-auto ${
                    selectedFee === fee.value
                      ? "bg-[#F7931A20] border-[#F7931A]"
                      : "bg-[#1A1207] border-[#F7931A20]"
                  }`}
                  onClick={() => setSelectedFee(fee.value)}
                >
                  <span className="font-semibold">{fee.label}</span>
                  <span className="text-xs text-gray-400">
                    {fee.description}
                  </span>
                </Button>
              ))}
            </div>
          </div> */}

            <div className="flex flex-col gap-2">
              <label className="text-sm text-white">
                Initial price ({currencyB?.symbol} per {currencyA?.symbol} )
              </label>
              <Input
                type="number"
                placeholder="0.0"
                value={startPriceTypedValue}
                onChange={(e: { target: { value: string } }) => {
                  console.log('e', e.target.value);
                  typeStartPriceInput(e.target.value);
                }}
                className="bg-white  rounded-md"
                classNames={{
                  input: '!text-black',
                }}
              />
              <p className="text-xs text-white">
                {startPriceTypedValue
                  ? `1 ${currencyB?.symbol} = ${
                      1 / Number(startPriceTypedValue)
                    } ${currencyA?.symbol}`
                  : 'Enter the initial price'}
              </p>
            </div>
          </>
        )}

        <Button
          className="mt-2"
          disabled={
            isLoading ||
            (!startPriceTypedValue && !isPoolExists) ||
            !areCurrenciesSelected ||
            isSameToken
          }
          isDisabled={
            isLoading ||
            (!startPriceTypedValue && !isPoolExists) ||
            !areCurrenciesSelected ||
            isSameToken
          }
          onPress={handleButtonClick}
        >
          {isLoading ? (
            <Loader />
          ) : isSameToken ? (
            'Select another pair'
          ) : !areCurrenciesSelected ? (
            'Select currencies'
          ) : !startPriceTypedValue && !isPoolExists ? (
            'Enter initial price'
          ) : isPoolExists ? (
            'View Existing Pool'
          ) : (
            'Create Pool'
          )}
        </Button>
      </div>
    </HoneyContainer>
  );
};

export default CreatePoolForm;
