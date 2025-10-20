import XSwapCard from '@/components/algebra/swap/xSwapCard';
import { QuickSwapTab } from '@/components/algebra/swap/xswap/QuickSwapTab';
import { HoneyContainer } from '@/components/CardContianer';
import { LoadingDisplay } from '@/components/LoadingDisplay/LoadingDisplay';
import { useMediaQuery } from '@/lib/algebra/hooks/common/useMediaQuery';
import { DynamicFormatAmount } from '@honeypot/shared';
import { wallet } from '@honeypot/shared/lib/wallet';
import { xSwap } from '@/services/xswap';
import { Button, Tabs, Tab } from '@nextui-org/react';
import { cn } from '@/lib/utils';
import { observer } from 'mobx-react-lite';
import { useAccount } from 'wagmi';

const XSwapPage = observer(() => {
  const { address } = useAccount();
  const isMobile = useMediaQuery('(max-width: 1024px)');

  if (!wallet.currentChain.supportDEX) {
    return (
      <div className="w-full flex items-center justify-center pb-6 sm:pb-12 overflow-x-hidden">
        <div className="text-center">
          <p className="text-lg">DEX is not supported on this chain</p>
        </div>
      </div>
    );
  }

  if (!wallet.isInit) {
    return <LoadingDisplay />;
  }

  if (!address) {
    return (
      <HoneyContainer className="w-full max-w-[1240px] mx-auto">
        <div className="w-full flex flex-col gap-4 justify-center items-center h-full min-h-[50vh] ">
          <div className="text-2xl">Connect Wallet to use XSwap</div>
        </div>
      </HoneyContainer>
    );
  }

  if (xSwap.sortedTokens?.length === 0) {
    return (
      <HoneyContainer className="w-full max-w-[1240px] mx-auto">
        <div className="w-full flex flex-col gap-4 justify-center items-center h-full min-h-[50vh] ">
          <div className="text-2xl">No tokens to swap</div>
        </div>
      </HoneyContainer>
    );
  }

  return (
    <div className="w-full px-4 py-4 flex gap-4 justify-start items-start text-xs">
      <HoneyContainer className="w-full max-w-[1024px] mx-auto">
        <Tabs
          classNames={{
            tab: 'px-2 sm:px-3 sm:h-10 text-xs sm:text-sm',
            base: 'relative w-full flex flex-col items-center',
            cursor: 'bg-[#202020] !text-white/80 px-2 py-3',
            tabList:
              'flex rounded-[16px] border border-[#333333] bg-[#271A0C] shadow-[4px_4px_0px_0px_#202020,-4px_4px_0px_0px_#202020] p-2 sm:p-3 w-fit mx-auto',
            panel: cn(
              'flex flex-col h-full w-full gap-y-4 items-center bg-[#140D06] rounded-2xl text-white',
              'px-4 sm:px-8 pt-[70px] pb-[24px]',
              'bg-[position:-65px_top,_-85px_bottom]',
              'bg-[size:auto_65px,_auto_65px]',
              'bg-repeat-x',
              '!mt-0',
              'h-auto'
            ),
            tabContent: 'text-[#202020] text-sm sm:text-base',
          }}
          aria-label="XSwap modes"
        >
          <Tab key="manual" title={<span className="text-xs sm:text-base">Manual</span>}>
            {!isMobile && (
              <div className="md:grid hidden w-full  grid-cols-12 p-2 rounded-lg items-center justify-center text-center">
                <div className="col-span-1">
                  <Button
                    onPress={() => xSwap.selectAllTokens()}
                    className="bg-[#FFCD4D] border border-black shadow-[2px_2px_0px_0px_#000000] text-sm text-black hover:bg-[#fff6e0] hover:border-black hover:shadow-[2px_2px_0px_0px_#000000] transition-all duration-300"
                  >
                    Select All
                  </Button>
                </div>
                <div className="col-span-2">Asset</div>
                <div className="col-span-1">Input</div>
                <div className="col-span-3">
                  <Button
                    className="w-full bg-[#FFCD4D] border border-black shadow-[2px_2px_0px_0px_#000000] text-sm text-black hover:bg-[#fff6e0] hover:border-black hover:shadow-[2px_2px_0px_0px_#000000] transition-all duration-300"
                    onPress={() => xSwap.maxAllTokens()}
                  >
                    Max All
                  </Button>
                </div>
                <div className="col-span-5">OutPut</div>
              </div>
            )}
            <div className="w-full flex flex-col gap-4  max-h-[70vh]  overflow-y-auto">
              {xSwap.sortedTokens?.map((token, idx) => (
                <XSwapCard
                  key={token.address}
                  disableFromSelection={true}
                  staticToTokenList={wallet.currentChain.multiSwapTokens.filter(
                    (t) => t.address !== token.address
                  )}
                  fromToken={token}
                  toToken={
                    wallet.currentChain.multiSwapTokens.find(
                      (t) => t.address !== token.address
                    ) || wallet.currentChain.nativeToken
                  }
                />
              ))}
            </div>
            <div className="w-full flex lg:flex-row flex-col gap-4 justify-end items-center">
              <div className="w-full flex gap-4 justify-center items-center text-center">
                <div className="w-full col-span-1">
                  <span className="text-sm">
                    Total Amount In: <br />
                    {DynamicFormatAmount({
                      amount: xSwap.totalAmountIn,
                      decimals: 4,
                      endWith: '$',
                    })}
                  </span>
                </div>
                <div className="w-full col-span-1">
                  <span className="text-sm">
                    Total Amount Out: <br />
                    {DynamicFormatAmount({
                      amount: xSwap.totalAmountOut,
                      decimals: 4,
                      endWith: '$',
                    })}
                  </span>
                </div>
              </div>
              {xSwap.needsApproval ? (
                <Button
                  onPress={() => {
                    xSwap.approveAllTokens();
                  }}
                  className="w-full bg-[#FFCD4D] border border-black shadow-[2px_2px_0px_0px_#000000] text-sm text-black hover:bg-[#fff6e0] hover:border-black hover:shadow-[2px_2px_0px_0px_#000000] transition-all duration-300"
                >
                  Approve All
                </Button>
              ) : (
                <Button
                  isDisabled={Number(xSwap.totalAmountIn) === 0}
                  onPress={() => {
                    xSwap.handleSwap().then(() => {
                      xSwap.reset();
                    });
                  }}
                  className="w-full bg-[#FFCD4D] border border-black shadow-[2px_2px_0px_0px_#000000] text-sm text-black hover:bg-[#fff6e0] hover:border-black hover:shadow-[2px_2px_0px_0px_#000000] transition-all duration-300"
                >
                  Swap
                </Button>
              )}
            </div>
          </Tab>
          <Tab key="quick" title={<span className="text-xs sm:text-base">Quick</span>}>
            <QuickSwapTab />
          </Tab>
        </Tabs>
      </HoneyContainer>
    </div>
  );
});

export default XSwapPage;
