import { truncate } from '@/lib/format';
import { wallet } from '@/services/wallet';
import { Tab, Tabs } from '@nextui-org/react';
import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { useAccount } from 'wagmi';
import { MyPools } from './MyPools';
import PortfolioTab from './Portfolio';
import { ProtfolioBalanceChart } from './ProtfolioBalanceChart';
import { portfolio } from '@/services/portfolio';
import {
  getLiquidatorDatas,
  UserPoolProfit,
} from '@/lib/algebra/graphql/clients/userProfit';
import { formatAmountWithAlphabetSymbol } from '@/lib/algebra/utils/common/formatAmount';
import CardContainer from '@/components/CardContianer/v3';
import Image from 'next/image';
import Copy from '@/components/Copy/v3';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/router';
import { useInfoClient } from '@/lib/hooks/useSubgraphClients';

export const Profile = observer(() => {
  const { chainId } = useAccount();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(0);
  const [timeRange, setTimeRange] = useState<'1D' | '1W' | '1M'>('1D');
  const [userPoolsProfit, setUserPoolsProfit] = useState<UserPoolProfit[]>([]);
  const router = useRouter();
  const urlParams = router.query as { tab: string };
  const infoclient = useInfoClient();

  useEffect(() => {
    if (wallet.account) {
      getLiquidatorDatas(infoclient, wallet.account).then((data) => {
        setUserPoolsProfit(data);
      });
    }
  }, [wallet.account, getLiquidatorDatas]);

  useEffect(() => {
    if (chartContainerRef.current) {
      setChartWidth(chartContainerRef.current.offsetWidth);
    }
  }, []);

  return (
    <div className="w-full max-w-[1200px] mx-auto px-2 sm:px-4 xl:px-0 font-gliker">
      <div className="flex flex-col gap-4 sm:gap-6">
        {wallet.isInit && (
          <div className="space-y-8 sm:space-y-16">
            <CardContainer showBottomBorder={false}>
              <div className="flex flex-col md:flex-row justify-between items-start w-full sm:py-5 sm:px-4 md:px-8">
                <div className="flex md:flex-col gap-4 sm:gap-8 justify-between w-full">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <Image
                      width={72}
                      height={72}
                      alt="avatar"
                      src="/images/v3/avatar.svg"
                      className="stroke-1 stroke-black drop-shadow-[0_1px_0_#000] w-11 h-11 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-[72px] lg:h-[72px]"
                    />
                    <div className="flex flex-col gap-0.5 sm:gap-1">
                      <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-[#0D0D0D] text-shadow-[1px_2px_0_#AF7F3D] text-stroke-0.5 text-stroke-white">
                        My Account
                      </p>
                      <div className="flex items-center gap-1 sm:gap-2 w-full text-[#4D4D4D]">
                        <Link
                          target="_blank"
                          className="text-[#4D4D4D] hover:text-[#0D0D0D] hover:underline decoration-2 transition-colors"
                          href={`${wallet.currentChain.chain.blockExplorers?.default.url}address/${wallet.account}`}
                        >
                          {truncate(wallet.account, 8)}
                        </Link>
                        <Copy value={wallet.account} copyTip="Copy address" />
                      </div>
                    </div>
                  </div>

                  <span className="flex flex-col items-start p-1 sm:p-2">
                    <span className="text-[#0D0D0D] text-xs sm:text-sm md:text-base mb-1 sm:mb-2 md:mb-4">
                      Token Value
                    </span>
                    <div className="text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-none text-shadow-[1.081px_2.162px_0px_#AF7F3D] text-stroke-1.5 text-stroke-black">
                      {formatAmountWithAlphabetSymbol(
                        portfolio.totalBalanceFormatted,
                        2
                      )}{' '}
                      USD
                    </div>
                  </span>
                </div>

                <div className="w-full md:w-[511px] flex-col gap-2 mt-6 md:mt-0">
                  <div
                    className="h-30 w-full rounded-lg overflow-hidden"
                    ref={chartContainerRef}
                  >
                    <ProtfolioBalanceChart
                      userPoolsProfits={userPoolsProfit}
                      timeRange={timeRange}
                      onTimeRangeChange={setTimeRange}
                    />
                  </div>
                </div>
              </div>
            </CardContainer>

            <Tabs
              aria-label="Options"
              defaultSelectedKey={urlParams.tab || 'portfolio'}
              classNames={{
                base: 'relative w-full',
                tabList:
                  'flex rounded-2xl border border-[#202020] bg-white p-2 md:p-4 shadow-[4px_4px_0px_0px_#202020,-4px_4px_0px_0px_#202020] py-1 md:py-2 px-2 md:px-3.5 absolute left-1/2 -translate-x-1/2 z-10 -top-5',
                tab: 'text-sm md:text-base px-2 md:px-3 py-1 md:py-2',
                panel: cn(
                  'flex flex-col h-full w-full gap-y-4 justify-center items-center bg-[#FFCD4D] rounded-2xl text-[#202020]',
                  'px-4 md:px-8 pt-[70px] pb-[70px]',
                  "bg-[url('/images/card-container/honey/honey-border.png'),url('/images/card-container/dark/bottom-border.svg')]",
                  'bg-[position:-65px_top,_-85px_bottom]',
                  'bg-[size:auto_65px,_auto_65px]',
                  'bg-repeat-x',
                  '!mt-0'
                ),
              }}
              onSelectionChange={(key) => {
                if (key === 'portfolio') {
                  portfolio.initPortfolio();
                }
              }}
            >
              <Tab key="portfolio" title="Portfolio">
                <PortfolioTab />
              </Tab>
              <Tab key="my-pools" title="My Pools">
                <MyPools />
              </Tab>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
});

export default Profile;
