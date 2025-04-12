import { useUSDCValue } from '@/lib/algebra/hooks/common/useUSDCValue';
import {
  computePoolAddress,
  Currency,
  CurrencyAmount,
  maxAmountSpend,
  Native,
  tryParseAmount,
} from '@cryptoalgebra/sdk';
import { useCallback, useMemo, useEffect, useState } from 'react';
import TokenCard from '../TokenCard';
import {
  ArrowLeftRight,
  ChevronDownIcon,
  ChevronsUpDownIcon,
  ChevronUpIcon,
  Loader,
} from 'lucide-react';
import useWrapCallback, {
  WrapType,
} from '@/lib/algebra/hooks/swap/useWrapCallback';
import {
  useDerivedSwapInfo,
  useSwapState,
  useSwapActionHandlers,
  useDerivedSwapInfoWithoutSwapState,
} from '@/lib/algebra/state/swapStore';
import { SwapField, SwapFieldType } from '@/types/algebra/types/swap-field';
import TokenCardV3 from '../TokenCard/TokenCardV3';
import { ExchangeSvg } from '@/components/svg/exchange';
import { chart } from '@/services/chart';
import { Token } from '@/services/contract/token';
import { PairContract } from '@/services/contract/dex/liquidity/pair-contract';
import { Token as AlgebraToken } from '@cryptoalgebra/sdk';
import { wallet } from '@/services/wallet';
import { AlgebraPoolContract } from '@/services/contract/algebra/algebra-pool-contract';
import { Address, zeroAddress } from 'viem';
import TokenCardV3Independent from '../TokenCard/TokenCardVIndependent';
import { useMediaQuery } from '@/lib/algebra/hooks/common/useMediaQuery';
import { Button, Checkbox, Input } from '@nextui-org/react';

import {
  ItemSelect,
  SelectState,
  SelectItem,
} from '@/components/ItemSelect/v3';
import { TokenSelector } from '@/components/TokenSelector/v3';
import { ChevronDoubleRightIcon } from '@heroicons/react/24/outline';
import { BigNumber } from 'bignumber.js';
import SwapParamsV3Independent from '../SwapParams/SwapParamsV3Independent';
import XSwapParams from '../SwapParams/XSwapParams';
import { xSwap } from '@/services/xswap';
import { observer } from 'mobx-react-lite';
import { DynamicFormatAmount } from '@/lib/algebra/utils/common/formatAmount';
import { ApprovalState } from '@/types/algebra/types/approve-state';
import { useApproveCallbackFromTrade } from '@/lib/algebra/hooks/common/useApprove';

interface SwapPairV3Props {
  fromTokenAddress?: string;
  toTokenAddress?: string;
  disableSelection?: boolean;
  isUpdatingPriceChart?: boolean;
  staticFromTokenList?: Token[];
  staticToTokenList?: Token[];
  isInputNative?: boolean;
  isOutputNative?: boolean;
  disableFromSelection?: boolean;
  disableToSelection?: boolean;
  inputCurrency?: Currency;
  outputCurrency?: Currency;
  independentField: SwapFieldType;
  setInputCurrency: (currency: Currency | undefined) => void;
  setOutputCurrency: (currency: Currency | undefined) => void;
  setIndependentField: (field: SwapFieldType) => void;
  typedValue: string;
  setTypedValue: (value: string) => void;
  onUserInput: (field: SwapFieldType, value: string) => void;
  isSelected: boolean;
  setIsSelected: (value: boolean) => void;
}

const XSwapPair = observer(
  ({
    fromTokenAddress,
    toTokenAddress,
    disableSelection,
    isUpdatingPriceChart,
    staticFromTokenList,
    staticToTokenList,
    isInputNative,
    isOutputNative,
    disableFromSelection,
    disableToSelection,
    inputCurrency,
    outputCurrency,
    independentField,
    typedValue,
    setInputCurrency,
    setOutputCurrency,
    setIndependentField,
    setTypedValue,
    onUserInput,
    isSelected,
    setIsSelected,
  }: SwapPairV3Props) => {
    const {
      toggledTrade: trade,
      currencyBalances,
      parsedAmount,
      currencies,
      allowedSlippage,
    } = useDerivedSwapInfoWithoutSwapState({
      inputCurrencyId: fromTokenAddress as Address,
      outputCurrencyId: toTokenAddress as Address,
      independentField: independentField,
      typedValue: typedValue,
    });

    const isMobile = useMediaQuery('(max-width: 1024px)');
    const [mobileExpanded, setMobileExpanded] = useState(false);
    const baseCurrency = currencies[SwapField.INPUT];
    const quoteCurrency = currencies[SwapField.OUTPUT];
    const baseToken = Token.getToken({
      address: baseCurrency?.wrapped.address ?? '',
      chainId: wallet.currentChainId.toString(),
      isNative: baseCurrency?.isNative ?? false,
    });
    const quoteToken = Token.getToken({
      address: quoteCurrency?.wrapped.address ?? '',
      chainId: wallet.currentChainId.toString(),
      isNative: quoteCurrency?.isNative ?? false,
    });

    const dependentField: SwapFieldType =
      independentField === SwapField.INPUT ? SwapField.OUTPUT : SwapField.INPUT;

    const handleInputSelect = useCallback(
      (inputCurrency: Currency) => {
        setInputCurrency(inputCurrency);
      },
      [setInputCurrency]
    );

    const handleOutputSelect = useCallback(
      (outputCurrency: Currency) => {
        setOutputCurrency(outputCurrency);
      },
      [setOutputCurrency]
    );

    const handleTypeInput = useCallback(
      (value: string) => {
        onUserInput(SwapField.INPUT, value);
      },
      [onUserInput]
    );
    const handleTypeOutput = useCallback(
      (value: string) => {
        onUserInput(SwapField.OUTPUT, value);
      },
      [onUserInput]
    );

    const { wrapType } = useWrapCallback(
      currencies[SwapField.INPUT],
      currencies[SwapField.OUTPUT],
      typedValue
    );

    const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE;

    const parsedAmountA =
      independentField === SwapField.INPUT ? parsedAmount : trade?.inputAmount;

    const parsedAmountB =
      independentField === SwapField.OUTPUT
        ? parsedAmount
        : trade?.outputAmount;

    const parsedAmounts = useMemo(
      () =>
        showWrap
          ? {
              [SwapField.INPUT]: parsedAmount,
              [SwapField.OUTPUT]: parsedAmount,
            }
          : {
              [SwapField.INPUT]: parsedAmountA,
              [SwapField.OUTPUT]: parsedAmountB,
            },
      [parsedAmount, showWrap, parsedAmountA, parsedAmountB]
    );

    const maxInputAmount: CurrencyAmount<Currency> | undefined = maxAmountSpend(
      currencyBalances[SwapField.INPUT]
    );
    const showMaxButton = Boolean(
      maxInputAmount?.greaterThan(0) &&
        !parsedAmounts[SwapField.INPUT]?.equalTo(maxInputAmount)
    );

    const handleMaxInput = useCallback(() => {
      maxInputAmount && onUserInput(SwapField.INPUT, maxInputAmount.toExact());
    }, [maxInputAmount, onUserInput]);

    const fiatValueInputFormatted = useUSDCValue(
      tryParseAmount(
        parsedAmounts[SwapField.INPUT]?.toSignificant(
          Math.floor(
            (parsedAmounts[SwapField.INPUT]?.currency.decimals || 6) / 2
          )
        ),
        baseCurrency
      )
    );

    const fiatValueOutputFormatted = useUSDCValue(
      tryParseAmount(
        parsedAmounts[SwapField.OUTPUT]?.toSignificant(
          Math.floor(
            (parsedAmounts[SwapField.OUTPUT]?.currency.decimals || 6) / 2
          )
        ),
        quoteCurrency
      )
    );

    const formattedAmounts = {
      [independentField]: typedValue,
      [dependentField]: showWrap
        ? parsedAmounts[
            independentField as keyof typeof parsedAmounts
          ]?.toExact() ?? ''
        : parsedAmounts[dependentField as keyof typeof parsedAmounts]?.toFixed(
            Math.floor(
              (parsedAmounts[dependentField as keyof typeof parsedAmounts]
                ?.currency.decimals || 6) / 2
            )
          ) ?? '',
    };

    const { approvalState, approvalCallback } = useApproveCallbackFromTrade(
      trade,
      allowedSlippage
    );

    useEffect(() => {
      const initializeTokens = async () => {
        if (fromTokenAddress) {
          const token = Token.getToken({
            address: fromTokenAddress,
            chainId: wallet.currentChainId.toString(),
            isNative: isInputNative,
          });
          // await token.init(false, {
          //   loadIndexerTokenData: true,
          //   loadLogoURI: true,
          // });

          if (!token) {
            return;
          }

          handleInputSelect(
            Object.assign(
              new AlgebraToken(
                wallet.currentChainId,
                token.address,
                Number(token.decimals),
                token.symbol,
                token.name
              ),
              {
                isNative: isInputNative,
                isToken: !isInputNative,
              }
            )
          );
        }

        if (toTokenAddress) {
          const token = Token.getToken({
            address: toTokenAddress,
            chainId: wallet.currentChainId.toString(),
            isNative: isOutputNative,
          });
          // await token.init(false, {
          //   loadIndexerTokenData: true,
          //   loadLogoURI: true,
          // });
          if (!token) {
            return;
          }

          handleOutputSelect(
            Object.assign(
              new AlgebraToken(
                wallet.currentChainId,
                token.address,
                Number(token.decimals),
                token.symbol,
                token.name
              ),
              {
                isNative: isOutputNative,
                isToken: !isOutputNative,
              }
            )
          );
        }
      };

      initializeTokens();
    }, [
      fromTokenAddress,
      handleInputSelect,
      handleOutputSelect,
      isInputNative,
      isOutputNative,
      toTokenAddress,
    ]);

    useEffect(() => {
      if (!isUpdatingPriceChart) {
        return;
      }
      if (
        baseCurrency &&
        quoteCurrency &&
        (baseCurrency?.isNative || quoteCurrency?.isNative) &&
        baseCurrency?.wrapped.address == quoteCurrency?.wrapped.address
      ) {
        chart.setChartLabel(`${baseCurrency.wrapped.symbol}`);
        Token.getToken({
          address: baseCurrency.wrapped.address,
          chainId: wallet.currentChainId.toString(),
        })
          .init()
          .then((token) => {
            chart.setChartTarget(token);
            chart.setCurrencyCode('USD');
          });
      } else if (baseCurrency && quoteCurrency) {
        const pairContract = new AlgebraPoolContract({
          address: computePoolAddress({
            tokenA: baseCurrency.wrapped,
            tokenB: quoteCurrency.wrapped,
          }),
        });
        pairContract.init().then((pair) => {
          chart.setChartLabel(`${baseCurrency.symbol}/${quoteCurrency.symbol}`);
          chart.setCurrencyCode('TOKEN');
          chart.setTokenNumber(
            baseCurrency.wrapped.address.toLowerCase() ===
              pair?.token0.value?.address.toLowerCase()
              ? 0
              : 1
          );
          chart.setChartTarget(pairContract);
        });
      } else if (baseCurrency) {
        chart.setChartLabel(`${baseCurrency.symbol}`);
        Token.getToken({
          address: baseCurrency.wrapped.address,
          chainId: wallet.currentChainId.toString(),
        })
          .init()
          .then((token) => {
            chart.setCurrencyCode('USD');
            chart.setChartTarget(token);
          });
      } else if (quoteCurrency) {
        chart.setChartLabel(`${quoteCurrency.symbol}`);
        Token.getToken({
          address: quoteCurrency.wrapped.address,
          chainId: wallet.currentChainId.toString(),
        })
          .init()
          .then((token) => {
            chart.setCurrencyCode('USD');
            chart.setChartTarget(token);
          });
      }
    }, [baseCurrency, quoteCurrency, isUpdatingPriceChart]);

    return (
      <div className="flex flex-col gap-1 relative bg-white custom-dashed px-[18px] py-6 w-full">
        {!isMobile && (
          <div className="grid grid-cols-12 gap-4 justify-between items-center">
            <div className="w-full flex justify-center items-center">
              <Checkbox isSelected={isSelected} onValueChange={setIsSelected} />
            </div>
            <div className="flex flex-col items-center col-span-2">
              <div>
                Balance:{' '}
                {DynamicFormatAmount({
                  amount: baseToken?.balance.toFixed(18),
                  decimals: 4,
                })}
              </div>
              <div>
                (
                {DynamicFormatAmount({
                  amount: baseToken?.balance
                    .times(baseToken?.derivedUSD ?? 0)
                    .toString(),
                  decimals: 4,
                  endWith: '$',
                })}
                )
              </div>
              <TokenSelector
                staticTokenList={staticFromTokenList}
                value={
                  baseCurrency?.wrapped.address
                    ? Token.getToken({
                        address: baseCurrency?.wrapped.address,
                        chainId: wallet.currentChainId.toString(),
                        isNative: baseCurrency.isNative,
                      })
                    : undefined
                }
                disableSelection={disableSelection || disableFromSelection}
                onSelect={async (token) => {
                  await token.init();
                  handleInputSelect(
                    token.isNative
                      ? Native.onChain(
                          wallet.currentChainId,
                          wallet.currentChain.nativeToken.symbol,
                          wallet.currentChain.nativeToken.name
                        )
                      : new AlgebraToken(
                          wallet.currentChainId,
                          token.address,
                          Number(token.decimals),
                          token.symbol,
                          token.name
                        )
                  );
                }}
                disableTools={true}
              />
            </div>

            <div className="flex flex-col items-center col-span-1">
              <Input
                value={!!typedValue ? typedValue : '0'}
                onChange={(e) => handleTypeInput(e.target.value)}
              />
            </div>

            <div className="flex flex-col items-center col-span-3">
              <ItemSelect
                selectState={
                  new SelectState({
                    value: BigNumber(typedValue)
                      .div(
                        BigNumber(
                          Token.getToken({
                            address: baseCurrency?.wrapped.address ?? '',
                            chainId: wallet.currentChainId.toString(),
                            isNative: baseCurrency?.isNative ?? false,
                          })?.balance
                        )
                      )
                      .toFixed(18),
                    onSelectChange: (value) => {
                      handleTypeInput(
                        BigNumber(value)
                          .times(
                            BigNumber(
                              Token.getToken({
                                address: baseCurrency?.wrapped.address ?? '',
                                chainId: wallet.currentChainId.toString(),
                                isNative: baseCurrency?.isNative ?? false,
                              })?.balance
                            )
                          )
                          .toFixed(18)
                      );
                    },
                  })
                }
              >
                <SelectItem className="rounded-[30px] px-[24px]" value={0.25}>
                  25%
                </SelectItem>
                <SelectItem className="rounded-[30px] px-[24px]" value={0.5}>
                  50%
                </SelectItem>
                <SelectItem className="rounded-[30px] px-[24px]" value={1}>
                  100%
                </SelectItem>
              </ItemSelect>
            </div>
            <div className="grid grid-cols-5 gap-4 items-center col-span-5">
              <div className="col-span-2">
                <XSwapParams
                  inputCurrency={inputCurrency}
                  outputCurrency={outputCurrency}
                  independentField={independentField}
                  typedValue={typedValue}
                />
              </div>
              <div className="col-span-2 text-center flex flex-col items-center">
                <div>
                  Output:{' '}
                  {DynamicFormatAmount({
                    amount: trade?.outputAmount.toFixed(18) ?? 0,
                    decimals: 4,
                  })}
                  <br />(
                  {DynamicFormatAmount({
                    amount: (
                      Number(trade?.outputAmount.toFixed(18)) *
                      Number(quoteToken?.derivedUSD)
                    ).toFixed(18),
                    decimals: 4,
                    endWith: '$',
                  })}
                  )
                </div>
                <TokenSelector
                  staticTokenList={staticToTokenList}
                  value={
                    quoteCurrency?.wrapped.address
                      ? Token.getToken({
                          address: quoteCurrency?.wrapped.address,
                          chainId: wallet.currentChainId.toString(),
                          isNative: quoteCurrency.isNative,
                        })
                      : undefined
                  }
                  disableSelection={disableSelection || disableToSelection}
                  onSelect={async (token) => {
                    await token.init();
                    handleOutputSelect(
                      token.isNative
                        ? Native.onChain(
                            wallet.currentChainId,
                            wallet.currentChain.nativeToken.symbol,
                            wallet.currentChain.nativeToken.name
                          )
                        : new AlgebraToken(
                            wallet.currentChainId,
                            token.address,
                            Number(token.decimals),
                            token.symbol,
                            token.name
                          )
                    );
                  }}
                  disableTools={true}
                />
              </div>

              <Button
                isDisabled={approvalState !== ApprovalState.NOT_APPROVED}
                disabled={approvalState !== ApprovalState.NOT_APPROVED}
                onPress={() => approvalCallback && approvalCallback()}
                className="bg-[#FFCD4D] border border-black shadow-[2px_2px_0px_0px_#000000] text-sm text-black hover:bg-[#fff6e0] hover:border-black hover:shadow-[2px_2px_0px_0px_#000000] transition-all duration-300"
              >
                {approvalState === ApprovalState.PENDING ? (
                  <Loader />
                ) : approvalState === ApprovalState.APPROVED ? (
                  'Approved'
                ) : (
                  `Approve`
                )}
              </Button>
            </div>
          </div>
        )}

        {isMobile && !mobileExpanded && (
          <div className="flex flex-col gap-4 justify-between items-center">
            <div className="w-full flex justify-center items-center">
              <span className="mr-2"> Swap This Asset: </span>
              <Checkbox isSelected={isSelected} onValueChange={setIsSelected} />
            </div>
            <div className="flex flex-row gap-4 justify-between items-center">
              <TokenSelector
                staticTokenList={staticFromTokenList}
                value={
                  baseCurrency?.wrapped.address
                    ? Token.getToken({
                        address: baseCurrency?.wrapped.address,
                        chainId: wallet.currentChainId.toString(),
                        isNative: baseCurrency.isNative,
                      })
                    : undefined
                }
                disableSelection={disableSelection || disableFromSelection}
                onSelect={async (token) => {
                  await token.init();
                  handleOutputSelect(
                    token.isNative
                      ? Native.onChain(
                          wallet.currentChainId,
                          wallet.currentChain.nativeToken.symbol,
                          wallet.currentChain.nativeToken.name
                        )
                      : new AlgebraToken(
                          wallet.currentChainId,
                          token.address,
                          Number(token.decimals),
                          token.symbol,
                          token.name
                        )
                  );
                }}
                disableTools={true}
              />
              <TokenSelector
                staticTokenList={staticToTokenList}
                value={
                  quoteCurrency?.wrapped.address
                    ? Token.getToken({
                        address: quoteCurrency?.wrapped.address,
                        chainId: wallet.currentChainId.toString(),
                        isNative: quoteCurrency.isNative,
                      })
                    : undefined
                }
                disableSelection={disableSelection || disableToSelection}
                onSelect={async (token) => {
                  await token.init();
                  handleOutputSelect(
                    token.isNative
                      ? Native.onChain(
                          wallet.currentChainId,
                          wallet.currentChain.nativeToken.symbol,
                          wallet.currentChain.nativeToken.name
                        )
                      : new AlgebraToken(
                          wallet.currentChainId,
                          token.address,
                          Number(token.decimals),
                          token.symbol,
                          token.name
                        )
                  );
                }}
                disableTools={true}
              />
            </div>

            <div className="flex flex-row gap-4 justify-between items-center text-black">
              {Number(formattedAmounts[SwapField.INPUT] ?? 0).toFixed(5)}
              <ChevronDoubleRightIcon className="size-4" />
              {Number(formattedAmounts[SwapField.OUTPUT] ?? 0).toFixed(5)}
              <span>({fiatValueInputFormatted})</span>
            </div>
            <Button onPress={() => setMobileExpanded(true)}>
              <ChevronDownIcon className="size-4" />
            </Button>
          </div>
        )}

        {isMobile && mobileExpanded && (
          <div className="flex flex-col gap-4 justify-between items-center">
            <TokenCardV3Independent
              staticTokenList={staticFromTokenList}
              value={formattedAmounts[SwapField.INPUT] || ''}
              currency={baseCurrency}
              otherCurrency={quoteCurrency}
              handleTokenSelection={handleInputSelect}
              handleValueChange={handleTypeInput}
              handleMaxValue={handleMaxInput}
              fiatValue={fiatValueInputFormatted}
              showMaxButton={showMaxButton}
              showBalance={true}
              label="From"
              disableSelection={disableSelection || disableFromSelection}
            />

            <TokenCardV3Independent
              staticTokenList={staticToTokenList}
              value={formattedAmounts[SwapField.OUTPUT] || ''}
              currency={quoteCurrency}
              otherCurrency={baseCurrency}
              handleTokenSelection={handleOutputSelect}
              handleValueChange={handleTypeOutput}
              fiatValue={fiatValueOutputFormatted ?? undefined}
              showBalance={true}
              label="To"
              disableSelection={disableSelection || disableToSelection}
              showSettings={false}
            />
            <Button onPress={() => setMobileExpanded(false)}>
              <ChevronUpIcon className="size-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }
);

export default XSwapPair;
