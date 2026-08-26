import { truncate } from '@/lib/format';
import { wallet } from '@honeypot/shared/lib/wallet';
import { Tab, Tabs } from '@nextui-org/react';
import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
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
import { notificationService } from '@/services/notification';
import { Notification } from '@/components/atoms/Notification/Notification';
import { UserOrderListHeyBgt } from '@/components/BGT-Vault/OrdersList/UserOrderListHeyBgt';
import { globalService } from '@/services/global';
import { UserOrderListBgtMarket } from '@/components/BGT-Vault/OrdersList/UserOrderListBgtMarket';
import { usePollingBlockNumber } from '@/lib/hooks/useBlockNumber';
import { bgtRegistry } from '@/services/contract/bgt-registry';

export const Profile = observer(() => {
  const [notify, setNotify] = useState(false);

  const { block } = usePollingBlockNumber();

  useEffect(() => {
    if (bgtRegistry.heyBgt) {
      bgtRegistry.heyBgt.getBeraPrice();
    }
  }, [block, bgtRegistry.heyBgt]);

  useEffect(() => {
    setNotify(
      notificationService.isClaimableProject ||
        notificationService.isRefundableProject
    );
  }, [
    notificationService.isClaimableProject,
    notificationService.isRefundableProject,
  ]);
  return (
    <div className="w-full max-w-[1200px] mx-auto px-2 sm:px-4 xl:px-0 font-gliker">
      <div className="flex flex-col gap-4 sm:gap-6">
        <div className="space-y-8 sm:space-y-16">
          <CardContainer showBottomBorder={false}>
            <div className="flex justify-between items-start w-full py-3 sm:py-5 px-4 sm:px-8">
              <div className="flex flex-col gap-4 sm:gap-8">
                <div className="flex items-center gap-2 sm:gap-4">
                  <Image
                    width={56}
                    height={56}
                    alt="avatar"
                    src="/images/v3/avatar.svg"
                    className="stroke-1 stroke-black drop-shadow-[0_1px_0_#000] sm:w-[72px] sm:h-[72px]"
                  />
                  <div className="flex flex-col gap-1">
                    <p className="text-2xl sm:text-3xl text-[#0D0D0D] text-shadow-[1px_2px_0_#AF7F3D] text-stroke-0.5 text-stroke-white">
                      My Account
                    </p>
                    {wallet.account ? (
                      <div className="flex items-center justify-between w-full text-[#4D4D4D] text-sm sm:text-base">
                        <Link
                          target="_blank"
                          className="text-[#4D4D4D] hover:text-[#0D0D0D] hover:underline decoration-2 transition-colors truncate flex-1 min-w-0"
                          href={`https://berascan.com/address/${wallet.account}`}
                        >
                          {truncate(wallet.account || '', 16)}
                        </Link>
                        <Copy
                          value={wallet.account}
                          copyTip="Copy address"
                          className="ml-2 flex-shrink-0"
                        />
                      </div>
                    ) : (
                      <div>Connect Wallet to see detail</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContainer>

          {wallet.account && (
            <Tabs
              aria-label="Options"
              classNames={{
                base: 'relative w-full',
                tabList:
                  'flex rounded-2xl border border-[#202020] bg-white p-2 sm:p-4 shadow-[4px_4px_0px_0px_#202020,-4px_4px_0px_0px_#202020] py-1.5 sm:py-2 px-2.5 sm:px-3.5 absolute left-1/2 -translate-x-1/2 z-10 -top-5 text-sm sm:text-base transition-all duration-300',
                panel: cn(
                  'flex flex-col h-full w-full gap-y-4 justify-center items-center bg-[#FFCD4D] rounded-2xl text-[#202020]',
                  'px-4 sm:px-8 pt-[50px] sm:pt-[70px] pb-[50px] sm:pb-[70px]',
                  "bg-[url('/images/card-container/honey/honey-border.png'),url('/images/card-container/dark/bottom-border.svg')]",
                  'bg-[position:-65px_top,_-85px_bottom]',
                  'bg-[size:auto_65px,_auto_65px]',
                  'bg-repeat-x',
                  '!mt-0',

                  globalService.BgtMarketBaseToken === 'BERA' &&
                    'bg-[#453100] text-white',
                  globalService.BgtMarketBaseToken === 'HONEY' &&
                    'bg-[#FFCD4D] text-black'
                ),
              }}
            >
              <Tab key="my-orders" title="My Orders">
                {globalService.BgtMarketBaseToken === 'HONEY' ? (
                  <UserOrderListHeyBgt />
                ) : (
                  <UserOrderListBgtMarket />
                )}
              </Tab>
              {/* <Tab key="transaction-history" title="Fill History"></Tab> */}
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
});

export default Profile;
