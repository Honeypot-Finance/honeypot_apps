import { useRouter } from 'next/navigation';
import { Button } from '@/components/button/button-next';
import { useEffect, useMemo, useState } from 'react';
import {
  ADDRESS_ZERO,
  NonfungiblePositionManager,
  computePoolAddress,
  Pool,
  Price,
  priceToClosestTick,
  TickMath,
} from '@cryptoalgebra/sdk';
import { algebraPositionManagerABI } from '@/lib/abis/algebra-contracts/ABIs/algebraPositionManager';
import { useTransactionAwait } from '@/lib/algebra/hooks/common/useTransactionAwait';
import { useWriteContract } from 'wagmi';
import { Address } from 'viem';
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
import { useSimulateAlgebraPositionManagerMulticall } from '@honeypot/shared/wagmi-generated';
import { useToastify } from '@/lib/hooks/useContractToastify';
import { WrappedToastify } from '@/lib/wrappedToastify';
import { Input } from '@/components/algebra/ui/input';
import HoneyContainer from '@/components/CardContianer/HoneyContainer';
import { wallet } from '@honeypot/shared/lib/wallet';
import { useObserver } from 'mobx-react-lite';

// Fee tiers are currently not used in the UI but kept for future reference
// const FEE_TIERS = [
//   { value: 100, label: '0.01%', description: 'Best for stable pairs' },
//   { value: 500, label: '0.05%', description: 'Best for stable pairs' },
//   { value: 3000, label: '0.3%', description: 'Best for most pairs' },
//   { value: 10000, label: '1%', description: 'Best for exotic pairs' },
// ];

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
          poolDeployer: currentChain.contracts?.algebraPoolDeployer,
          initCodeHashManualOverride:
            currentChain.contracts?.algebraPoolInitCodeHash,
        }) as Address)
      : undefined;

  console.log('poolAddress computed:', poolAddress, {
    areCurrenciesSelected,
    isSameToken,
    currencyA: currencyA?.wrapped,
    currencyB: currencyB?.wrapped,
    deployer: currentChain.contracts?.algebraPoolDeployer,
    initCodeHash: currentChain.contracts?.algebraPoolInitCodeHash,
  });

  const [poolState] = usePool(poolAddress);

  const isPoolExists = poolState === PoolState.EXISTS;

  const [selectedFee] = useState(3000);

  const mintInfo = useDerivedMintInfo(
    currencyA ?? undefined,
    currencyB ?? undefined,
    poolAddress ?? undefined,
    selectedFee,
    currencyA ?? undefined,
    undefined,
    !isPoolExists ? [PoolState.NOT_EXISTS, null] : undefined
  );

  // Create pool manually if no pool exists but we have valid inputs
  const manualPool = useMemo(() => {
    if (
      !mintInfo?.pool &&
      currencyA &&
      currencyB &&
      startPriceTypedValue &&
      !isPoolExists
    ) {
      try {
        const tokenA = currencyA.wrapped;
        const tokenB = currencyB.wrapped;

        // Determine token order
        const [token0, token1] = tokenA.sortsBefore(tokenB)
          ? [tokenA, tokenB]
          : [tokenB, tokenA];

        // Parse the price with high precision
        const priceValue = parseFloat(startPriceTypedValue);
        if (isNaN(priceValue) || priceValue <= 0) {
          console.log('Invalid price value:', startPriceTypedValue);
          return undefined;
        }

        // Create Price object - price of token1 in terms of token0
        // If user entered price as "tokenB per tokenA", we need to handle the ordering
        const baseToken = currencyA.wrapped;

        // Determine if we need to invert based on token ordering
        const invertPrice = !baseToken.equals(token0);

        // Use scientific notation to handle very small prices precisely
        // For very small numbers, we need to avoid floating point precision loss
        const priceStr = startPriceTypedValue;

        // Count decimal places to determine precision needed
        const decimalPlaces = priceStr.includes('.')
          ? priceStr.split('.')[1]?.replace(/0+$/, '').length || 0
          : 0;

        const precision = Math.max(decimalPlaces + 6, 18); // At least 18 decimals, more if needed

        // Calculate amounts as BigInt to avoid precision loss
        const baseAmountStr = (BigInt(10) ** BigInt(precision)).toString();
        const quoteAmountStr = (BigInt(Math.floor(priceValue * (10 ** precision)))).toString();

        console.log('Price calculation:', {
          startPriceTypedValue,
          priceValue,
          precision,
          baseAmountStr,
          quoteAmountStr,
        });

        // Create the price (always in terms of token0/token1)
        const price = invertPrice
          ? new Price(
              token1,
              token0,
              baseAmountStr,
              quoteAmountStr
            )
          : new Price(
              token0,
              token1,
              baseAmountStr,
              quoteAmountStr
            );

        const currentTick = priceToClosestTick(price);
        const currentSqrt = TickMath.getSqrtRatioAtTick(currentTick);

        console.log('Creating manual pool:', {
          token0: token0.symbol,
          token1: token1.symbol,
          priceValue,
          invertPrice,
          currentTick,
          currentSqrt: currentSqrt.toString(),
          price: price.toSignificant(18),
        });

        // Validate tick is within acceptable range
        if (currentTick < TickMath.MIN_TICK || currentTick > TickMath.MAX_TICK) {
          console.error('Tick out of range:', { currentTick, MIN_TICK: TickMath.MIN_TICK, MAX_TICK: TickMath.MAX_TICK });
          WrappedToastify.error({
            title: 'Invalid Price',
            message: 'Price is out of acceptable range. Please enter a different price.',
          });
          return undefined;
        }

        return new Pool(
          token0,
          token1,
          selectedFee,
          currentSqrt,
          ADDRESS_ZERO,
          0,
          currentTick,
          60,
          []
        );
      } catch (error) {
        console.error('Error creating manual pool:', error);
        return undefined;
      }
    }
    return undefined;
  }, [
    mintInfo?.pool,
    currencyA,
    currencyB,
    startPriceTypedValue,
    isPoolExists,
    selectedFee,
  ]);

  const poolForCalldata = mintInfo?.pool || manualPool;

  const { calldata, value } = useMemo(() => {
    if (!poolForCalldata)
      return {
        calldata: undefined,
        value: undefined,
      };

    return NonfungiblePositionManager.createCallParameters(
      poolForCalldata,
      ADDRESS_ZERO
    );
  }, [poolForCalldata]);

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
        enabled: Boolean(calldata && value !== undefined),
      },
    }
  );

  console.log('config', {
    createPoolConfig,
    calldata,
    value,
    mintInfo,
    poolState,
    isPoolExists,
    poolAddress,
    errorMessage: mintInfo?.errorMessage,
    errorCode: mintInfo?.errorCode,
    invalidPool: mintInfo?.invalidPool,
    hasPool: !!mintInfo?.pool,
    noLiquidity: mintInfo?.noLiquidity,
    price: mintInfo?.price?.toSignificant(6),
    invalidRange: mintInfo?.invalidRange,
  });

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
      selectCurrency(SwapField.INPUT, undefined);
      selectCurrency(SwapField.OUTPUT, undefined);
      typeStartPriceInput('');
    };
  }, []);

  const handleButtonClick = async () => {
    console.log('Button clicked', {
      isPoolExists,
      poolState,
      poolAddress,
      createPoolConfig,
      calldata,
      value,
      mintInfo
    });
    
    if (isPoolExists && poolAddress) {
      console.log('Pool exists, redirecting to:', `/pool-detail/${poolAddress}`);
      router.push(`/pool-detail/${poolAddress}`);
      return;
    }
    
    if (poolState === PoolState.EXISTS && poolAddress) {
      console.log('Pool state is EXISTS, redirecting to:', `/pool-detail/${poolAddress}`);
      router.push(`/pool-detail/${poolAddress}`);
      return;
    }

    if (createPoolConfig && createPoolConfig.request) {
      console.log('Creating pool with config:', createPoolConfig.request);
      createPool(createPoolConfig.request);
    } else if (calldata && value !== undefined) {
      // Directly call createPool if we have calldata but simulation failed
      console.log('Creating pool directly with calldata:', { calldata, value });
      createPool({
        address: currentChain.contracts?.algebraPositionManager as Address,
        abi: algebraPositionManagerABI,
        functionName: 'multicall',
        args: Array.isArray(calldata) ? [calldata as Address[]] : [[calldata] as Address[]],
        value: BigInt(value || 0),
      });
    } else {
      console.error('Cannot create pool: missing config or calldata', {
        hasCalldata: !!calldata,
        hasValue: value !== undefined,
        hasConfig: !!createPoolConfig,
        startPriceTypedValue,
        mintInfo,
        manualPool,
        poolForCalldata,
      });
      WrappedToastify.error({
        title: 'Missing Price',
        message: 'Please enter an initial price for the pool before creating it.',
      });
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
