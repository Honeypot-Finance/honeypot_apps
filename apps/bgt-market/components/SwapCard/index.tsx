import { observer, useLocalObservable } from 'mobx-react-lite';
import { TokenSelector } from '@honeypot/shared';
import { SwapAmount } from '../SwapAmount/index';
import { swap } from '@/services/swap';
import { ExchangeSvg } from '../svg/exchange';
import { Button } from '@/components/button';

import { Token } from '@honeypot/shared';
import { SpinnerContainer } from '../Spinner';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { isEthAddress } from '@/lib/address';
import { wallet } from '@honeypot/shared/lib/wallet';
import { amountFormatted } from '../../lib/format';
import { AmountFormat } from '../AmountFormat';
import ChartData from '../svg/chartData';
import { liquidity } from '@/services/liquidity';
import { chart } from '@/services/chart';
import { LoadingContainer } from '../LoadingDisplay/LoadingDisplay';
import { ItemSelect, SelectItem, SelectState } from '../ItemSelect';
import { Slider } from '@nextui-org/react';
import Image from 'next/image';
import { FaLongArrowAltRight } from 'react-icons/fa';
import { TokenLogo } from '@honeypot/shared';
import { Slippage } from './Slippage';
import BigNumber from 'bignumber.js';
import { useInterval } from '@/lib/hooks';

interface ISwapCard {
  allowChart?: boolean;
  enableSwap?: boolean;
}

export const SwapCard = observer(
  ({ allowChart = true, enableSwap = true }: ISwapCard) => {
    const isInit = wallet.isInit && liquidity.isInit;
    // const isInit = true;
    const router = useRouter();
    const state = useLocalObservable(() => ({
      selectState: new SelectState({
        value: 0,
        onSelectChange: (value) => {
          swap.setFromAmount(
            (swap.fromToken as Token).balance.times(value).toFixed()
          );
        },
      }),
    }));

    const { inputCurrency, outputCurrency } = router.query as {
      inputCurrency: string;
      outputCurrency: string;
    };

    useEffect(() => {
      if (!wallet.isInit) {
        return;
      }
      liquidity.initPool();
    }, [wallet.isInit]);

    useEffect(() => {
      if (!isInit) {
        return;
      }

      if (inputCurrency && isEthAddress(inputCurrency)) {
        swap.setFromToken(
          Token.getToken({
            chainId: wallet.currentChainId.toString(),
            address: inputCurrency,
          })
        );
      } else {
        swap.setFromToken(
          Token.getToken({
            chainId: wallet.currentChainId.toString(),
            address: '0x6969696969696969696969696969696969696969',
            isNative: true,
          })
        );
      }

      if (outputCurrency && isEthAddress(outputCurrency)) {
        swap.setToToken(
          Token.getToken({
            chainId: wallet.currentChainId.toString(),
            address: outputCurrency,
          })
        );
      } else {
        swap.setToToken(
          Token.getToken({
            chainId: wallet.currentChainId.toString(),
            address: '0xfc5e3743e9fac8bb60408797607352e24db7d65e',
          })
        );
      }
    }, [inputCurrency, outputCurrency, isInit]);

    useInterval(() => {
      swap.onFromAmountChange();
    }, 3000);

    return (
      <SpinnerContainer
        className="flex flex-1 justify-around items-center lg:max-w-[574px]"
        isLoading={false}
      >
        <div className=" flex flex-1 flex-col justify-center items-start gap-[23px] [background:var(--card-color,#271A0C)] p-[20px] rounded-[20px] border-3 border-solid border-[#F7931A10] hover:border-[#F7931A] transition-all">
          <LoadingContainer isLoading={!isInit}>
            <>
              <div className="flex items-center justify-between w-full  text-[color:var(--Button-Gradient,#F7931A)] text-base font-bold leading-3 tracking-[0.16px]">
                {allowChart ? (
                  <span
                    onClick={() => {
                      chart.toggleChart();
                    }}
                  >
                    <ChartData></ChartData>
                  </span>
                ) : (
                  <div></div>
                )}
                <Slippage className="flex justify-between items-center w-full"></Slippage>
              </div>
              <div className="flex flex-col lg:flex-row justify-between items-center w-full">
                <SwapAmount
                  label="From"
                  inputProps={{
                    value: swap.fromAmount,
                    disabled: !swap.fromToken,
                    max: swap.fromToken?.balance.toNumber(),
                    min: 0,
                    isInvalid:
                      Number(swap.fromAmount) >
                        (swap.fromToken as Token)?.balance?.toNumber() ||
                      Number(swap.fromAmount) < 0,
                    errorMessage: 'Insufficient balance',
                    onClear: () => {
                      swap.setFromAmount('0');
                    },
                    onChange: (e) => {
                      swap.setFromAmount(e.target.value);
                    },
                  }}
                ></SwapAmount>
                <div className="flex flex-col items-end w-full lg:w-[unset]">
                  {!!swap.fromToken && (
                    <div className="flex items-center">
                      <div className="text-sub">
                        Balance: {swap.fromToken.balanceFormatted}
                      </div>
                      <div
                        onClick={() => {
                          swap.setFromAmount(
                            (swap.fromToken as Token).balance.toFixed()
                          );
                        }}
                        className=" pb-2 cursor-pointer text-[color:var(--Button-Gradient,#F7931A)] ml-[8px] font-bold  underline"
                      >
                        <Image
                          src={'/images/icons/artisticTexts/MAX.svg'}
                          alt={''}
                          width={40}
                          height={40}
                        ></Image>
                      </div>
                    </div>
                  )}
                  <TokenSelector
                    value={swap.fromToken}
                    onSelect={(token) => {
                      swap.setFromToken(token);
                    }}
                  ></TokenSelector>
                </div>
              </div>
              {swap.fromToken && (
                <div className="w-full flex justify-end items-center">
                  <Slider
                    className="w-full"
                    size="sm"
                    maxValue={
                      (swap.fromToken as Token).balance.toNumber() +
                      Math.pow(0.1, 15)
                    }
                    minValue={0}
                    onChange={(value) => {
                      if (
                        new BigNumber(String(value)) >
                        (swap.fromToken as Token).balance
                      ) {
                        swap.setFromAmount(
                          (swap.fromToken as Token).balance.toFixed()
                        );
                      } else {
                        swap.setFromAmount(String(value));
                      }
                    }}
                    value={Number(swap.fromAmount)}
                    step={Math.pow(0.1, 18)}
                  ></Slider>
                </div>
              )}{' '}
              {swap.fromToken && (
                <ItemSelect
                  selectState={state.selectState}
                  className=" grid grid-cols-2 lg:grid-cols-4 gap-[16px] justify-around w-full"
                >
                  <SelectItem className="rounded-[30px] px-[24px]" value={0.25}>
                    25%
                  </SelectItem>
                  <SelectItem className="rounded-[30px] px-[24px]" value={0.5}>
                    50%
                  </SelectItem>
                  <SelectItem className="rounded-[30px] px-[24px]" value={0.75}>
                    75%
                  </SelectItem>
                  <SelectItem className="rounded-[30px] px-[24px]" value={1}>
                    100%
                  </SelectItem>
                </ItemSelect>
              )}
              <div className="flex w-full items-center gap-[5px]">
                <div className=" h-px flex-[1_0_0] [background:rgba(247,147,26,0.20)] rounded-[100px]"></div>
                {enableSwap && (
                  <ExchangeSvg
                    className=" cursor-pointer hover:rotate-180 transition-all"
                    onClick={() => {
                      swap.switchTokens();
                    }}
                  ></ExchangeSvg>
                )}
                <div className=" h-px flex-[1_0_0] [background:rgba(247,147,26,0.20)] rounded-[100px]"></div>
              </div>
              <div className="flex flex-col lg:flex-row justify-between items-center w-full">
                <SwapAmount
                  label="To"
                  inputProps={{
                    value: swap.toAmount,
                    isClearable: false,
                    disabled: true,
                    onChange: (e) => {
                      swap.setToAmount(e.target.value);
                    },
                  }}
                ></SwapAmount>
                <div className="flex flex-col items-end w-full lg:w-[unset]">
                  {!!swap.toToken && (
                    <div className="flex items-center">
                      <div className="text-sub">
                        Balance: {swap.toToken.balanceFormatted}
                      </div>
                    </div>
                  )}
                  <TokenSelector
                    value={swap.toToken}
                    onSelect={(token) => {
                      swap.setToToken(token);
                    }}
                  ></TokenSelector>
                </div>
              </div>
              {!!swap.price && (
                <div className="flex  w-full lg:w-[529px] max-w-full h-[71px] justify-between items-center border [background:#291C0A] px-5 py-2.5 rounded-2xl border-solid border-[rgba(247,147,26,0.20)]">
                  <div>
                    <div>
                      <AmountFormat
                        amount={swap.price?.toFixed()}
                      ></AmountFormat>
                    </div>
                    <div>
                      {swap.toToken?.displayName} per{' '}
                      {swap.fromToken?.displayName}
                    </div>
                  </div>
                  <div>
                    <div>
                      {amountFormatted(swap.minToAmount, {
                        decimals: 0,
                        fixed: 6,
                      })}{' '}
                      {swap.toToken?.displayName}
                    </div>
                    <div>Minimum Received</div>
                  </div>
                </div>
              )}{' '}
              {swap.routerToken && swap.routerToken.length > 0 && (
                <div className="w-full p-1 flex justify-between items-center rounded-xl  bg-black/50">
                  <>
                    <div>
                      <TokenLogo token={swap.fromToken as Token} />
                    </div>
                    <FaLongArrowAltRight />
                  </>

                  {swap.routerToken.map((token, idx) => {
                    if (idx != 0 && idx !== swap.routerToken!.length - 1) {
                      return (
                        <>
                          <div key={token.address}>
                            <TokenLogo token={token} />
                          </div>
                          <FaLongArrowAltRight />
                        </>
                      );
                    }
                  })}
                  <div>
                    <TokenLogo token={swap.toToken as Token} />
                  </div>
                </div>
              )}
              <Button
                isDisabled={swap.isDisabled}
                isLoading={swap.swapExactTokensForTokens.loading}
                onClick={async () => {
                  await swap.swapExactTokensForTokens.call();
                }}
              >
                {swap.buttonContent}
              </Button>
            </>
          </LoadingContainer>
        </div>
      </SpinnerContainer>
    );
  }
);
