import Loader from '@/components/algebra/common/Loader';
import TokenLogo from '@/components/TokenLogo/TokenLogo';
import { MAX_UINT128 } from '@/config/algebra/max-uint128';
import { usePoolPlugins } from '@/lib/algebra/hooks/pools/usePoolPlugins';
import useWrapCallback, {
  WrapType,
} from '@/lib/algebra/hooks/swap/useWrapCallback';
import {
  useDerivedSwapInfo,
  useDerivedSwapInfoWithoutSwapState,
  useSwapState,
} from '@/lib/algebra/state/swapStore';
import {
  computeRealizedLPFeePercent,
  warningSeverity,
} from '@/lib/algebra/utils/swap/prices';
import { AlgebraBasePluginContract } from '@/services/contract/algebra/algebra-base-plugin';
import { AlgebraPoolContract } from '@/services/contract/algebra/algebra-pool-contract';
import { Token } from '@/services/contract/token';
import { wallet } from '@/services/wallet';
import { SwapField, SwapFieldType } from '@/types/algebra/types/swap-field';
import { TradeState } from '@/types/algebra/types/trade-state';
import {
  ADDRESS_ZERO,
  computePoolAddress,
  Currency,
  Percent,
  Trade,
  TradeType,
  unwrappedToken,
} from '@cryptoalgebra/sdk';
import { ChevronDownIcon, ChevronRightIcon, ZapIcon } from 'lucide-react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { FaLongArrowAltRight } from 'react-icons/fa';
import { Address } from 'viem';

const SwapParamsV3Independent = ({
  inputCurrency,
  outputCurrency,
  independentField,
  typedValue,
}: {
  inputCurrency?: Currency;
  outputCurrency?: Currency;
  independentField: SwapFieldType;
  typedValue: string;
}) => {
  const {
    tradeState,
    toggledTrade: trade,
    allowedSlippage,
    poolAddress,
    currencies,
  } = useDerivedSwapInfoWithoutSwapState({
    inputCurrencyId: inputCurrency?.wrapped?.address as Address,
    outputCurrencyId: outputCurrency?.wrapped?.address as Address,
    independentField: independentField,
    typedValue: typedValue,
  });

  const { wrapType } = useWrapCallback(
    currencies[SwapField.INPUT],
    currencies[SwapField.OUTPUT],
    typedValue
  );

  const [isExpanded, toggleExpanded] = useState(false);
  const [slidingFee, setSlidingFee] = useState<number>();

  const { dynamicFeePlugin } = usePoolPlugins(poolAddress);

  useEffect(() => {
    if (!trade || !tradeState.fee) return undefined;

    async function getFees() {
      if (!trade || !tradeState.fee) return undefined;
      const fees = [];

      for (const route of trade?.swaps) {
        for (const pool of route.route.pools) {
          const address = computePoolAddress({
            tokenA: pool.token0,
            tokenB: pool.token1,
          });

          const poolContract = new AlgebraPoolContract({ address });

          const plugin = await poolContract.contract.read.plugin();

          const pluginContract = new AlgebraBasePluginContract({
            address: plugin,
          });

          let beforeSwap: [string, number, number];

          try {
            beforeSwap = await pluginContract.contract.simulate
              .beforeSwap(
                [
                  wallet.currentChain.contracts.algebraSwapRouter,
                  ADDRESS_ZERO,
                  //isZeroToOne,
                  false,
                  BigInt(
                    trade!.tradeType === TradeType.EXACT_INPUT
                      ? trade?.inputAmount?.toExact() ?? 0
                      : trade?.outputAmount?.toExact() ?? 0
                  ),
                  MAX_UINT128,
                  false,
                  '0x',
                ],
                { account: address as Address }
              )
              .then((v) => v.result as [string, number, number]);

            console.log('beforeSwap', beforeSwap);
          } catch (error) {
            beforeSwap = ['', 0, 0];
          }
          const [, overrideFee, pluginFee] = beforeSwap || ['', 0, 0];

          if (overrideFee) {
            fees.push(overrideFee + pluginFee);
          } else {
            fees.push(pool.fee + pluginFee);
          }
        }
      }

      let p = 100;
      for (const fee of fees) {
        p *= 1 - Number(fee) / 1_000_000;
      }

      setSlidingFee(100 - p);
    }

    getFees();
  }, [trade, tradeState.fee]);

  const { realizedLPFee, priceImpact } = useMemo(() => {
    // console.log("trade", trade?.priceImpact);
    try {
      if (
        !trade ||
        !trade.priceImpact ||
        !trade.inputAmount ||
        !trade.outputAmount
      ) {
        return { realizedLPFee: undefined, priceImpact: undefined };
      }

      const realizedLpFeePercent = computeRealizedLPFeePercent(trade);
      const realizedLPFee = trade.inputAmount.multiply(realizedLpFeePercent);
      const priceImpact = trade.priceImpact.subtract(realizedLpFeePercent);
      return { priceImpact, realizedLPFee };
    } catch (error) {
      console.error('Error calculating fees:', error);
      return { realizedLPFee: undefined, priceImpact: undefined };
    }
  }, [trade]);

  const LPFeeString = realizedLPFee
    ? `${realizedLPFee.toSignificant(4)} ${realizedLPFee.currency.symbol}`
    : '-';

  if (wrapType !== WrapType.NOT_APPLICABLE) return;

  return trade ? (
    <div className="flex flex-col w-full rounded-2xl cursor-pointer">
      <div className="w-full custom-dashed p-4">
        <div
          className="flex flex-col w-full"
          onClick={() => toggleExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 w-full justify-between text-black font-bold text-base">
              <div className="flex items-center gap-2 ">
                <div className="bg-[#FFB800] p-2 rounded-lg">
                  <ZapIcon className="w-4 h-4 text-black" />
                </div>
                <span className="">
                  {slidingFee && `${slidingFee?.toFixed(4)}% fee`}
                </span>
              </div>
              <div className="flex items-center py-3 justify-between">
                <span className="">
                  (Price Impact <PriceImpact priceImpact={priceImpact} />)
                </span>
              </div>
            </div>
            <ChevronDownIcon
              className={`w-6 h-6 text-black transition-transform duration-300 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </div>

          {isExpanded && (
            <div className="flex flex-col divide-y divide-black/10">
              <div className="flex items-center py-3 justify-between">
                <span className="text-black text-sm font-medium">Route</span>
                <SwapRoute trade={trade} />
              </div>

              <div className="flex items-center py-3 justify-between">
                <span className="text-black text-sm font-medium">
                  {trade.tradeType === TradeType.EXACT_INPUT
                    ? 'Minimum received'
                    : 'Maximum sent'}
                </span>
                <span className="text-black text-sm font-medium">
                  {trade.tradeType === TradeType.EXACT_INPUT
                    ? `${trade
                        .minimumAmountOut(allowedSlippage)
                        .toSignificant(6)} ${
                        trade.outputAmount.currency.symbol
                      }`
                    : `${trade
                        .maximumAmountIn(allowedSlippage)
                        .toSignificant(6)} ${
                        trade.inputAmount.currency.symbol
                      }`}
                </span>
              </div>

              <div className="flex items-center py-3 justify-between">
                <span className="text-black text-sm font-medium">LP Fee</span>
                <span className="text-black text-sm font-medium">
                  {LPFeeString}
                </span>
              </div>

              <div className="flex items-center py-3 justify-between">
                <span className="text-black text-sm font-medium">
                  Slippage tolerance
                </span>
                <span className="text-black text-sm font-medium">
                  {allowedSlippage.toFixed(2)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  ) : trade !== undefined || tradeState.state === TradeState.LOADING ? (
    <div className="flex justify-center mb-1 bg-card-dark py-3 px-3 rounded-lg">
      <Loader size={17} />
    </div>
  ) : (
    <div className="text-md mb-1 text-center text-white/70 bg-card-dark py-2 px-3 rounded-lg">
      Select an amount for swap
    </div>
  );
};

const SwapRoute = ({
  trade,
}: {
  trade: Trade<Currency, Currency, TradeType>;
}) => {
  const path = trade.route.tokenPath;

  return (
    <div className="flex items-center gap-1">
      {path.map((token, idx, path) => {
        return (
          <Fragment key={`token-path-${idx}`}>
            <div>
              <TokenLogo
                token={Token.getToken({
                  address: token.address,
                  chainId: wallet.currentChainId.toString(),
                })}
              />
            </div>

            {idx != path.length - 1 && <FaLongArrowAltRight />}
            {/* <div>{unwrappedToken(token).symbol}</div>
            {idx === path.length - 1 ? null : <ChevronRightIcon size={16} />} */}
          </Fragment>
        );
      })}
    </div>
  );
};

const PriceImpact = ({ priceImpact }: { priceImpact: Percent | undefined }) => {
  const severity = warningSeverity(priceImpact);

  const color =
    severity === 3 || severity === 4
      ? 'text-[#FF5449]'
      : severity === 2
      ? 'text-orange-600'
      : 'text-black';

  return (
    <span className={`${color} text-sm font-medium`}>
      {priceImpact ? `${priceImpact.multiply(-1).toFixed(2)}%` : '-'}
    </span>
  );
};

export default SwapParamsV3Independent;
