import { truncate } from '@/lib/format';
import { wallet } from '@honeypot/shared/lib/wallet';
import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import { MyPools } from './MyPools';
import CardContainer from '@/components/CardContianer/v3';
import Image from 'next/image';
import Copy from '@/components/Copy/v3';
import { cn } from '@/lib/utils';

export const Profile = observer(() => {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-2 sm:px-4 xl:px-0 font-gliker">
      <div className="flex flex-col gap-6 sm:gap-8">
        {wallet.isInit && (
          <>
            <CardContainer showBottomBorder={false}>
              <div className="flex items-center gap-3 sm:gap-4 w-full sm:py-5 sm:px-4 md:px-8">
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
            </CardContainer>

            {wallet.currentChain.supportDEX && (
              <div
                className={cn(
                  'flex flex-col h-full w-full gap-y-4 justify-center items-center bg-[#140D06] rounded-2xl text-white',
                  'px-4 md:px-8 py-8',
                  'border border-[#3B2712]'
                )}
              >
                <h2 className="text-xl font-bold text-white self-start mb-2">
                  My Pools
                </h2>
                <MyPools />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});

export default Profile;
