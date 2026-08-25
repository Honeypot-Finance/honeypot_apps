import { FtoPairContract } from '@/services/contract/launches/fto/ftopair-contract';
import { observer } from 'mobx-react-lite';
import { Button } from '@/components/button/button-next';
import Link from 'next/link';
import { HTMLAttributes } from 'react';
import { cn } from '@/lib/tailwindcss';
import Image from 'next/image';
import {
  OptionsDropdown,
  optionsPresets,
} from '../../OptionsDropdown/OptionsDropdown';
import { motion } from 'framer-motion';
import { itemPopUpVariants } from '@/lib/animation';
import { MemePairContract } from '@/services/contract/launches/pot2pump/memepair-contract';
import ProgressBar from '../../atoms/ProgressBar/ProgressBar';
import { AmountFormat } from '../../AmountFormat';
import Countdown from 'react-countdown';
import BigNumber from 'bignumber.js';
import { Pot2Pump } from '@/lib/algebra/graphql/clients/type';

import { Token } from '@honeypot/shared';
import { useProjectInfo } from '@/hooks/useProjectInfo';
import { wallet } from '@honeypot/shared/lib/wallet';

type launchCardVariants = 'list' | 'detail' | 'trending';

const ComponentContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-1 odd:last:col-span-2',
        className
      )}
    >
      {children}
    </div>
  );
};

//-------------------------------------Detail Components-------------------------------------//
const TimeLineComponent = observer(({ pair }: { pair: MemePairContract }) => {
  const endedDisplay = <span>Ended!</span>;

  return (
    <ComponentContainer className="shrink-0 flex items-start">
      <h6 className="text-xs opacity-60">End Time</h6>
      <div className="flex items-center gap-2 text-sm">
        <span className="font-bold">
          {pair?.endTime && (
            <Countdown
              date={Number(pair?.endTime) * 1000}
              renderer={({ days, hours, minutes, seconds, completed }) => {
                if (completed || pair.raisedTokenMinCap) {
                  return endedDisplay;
                } else {
                  return (
                    <span>
                      {days ? `${days}d ` : ''}
                      {hours ? `${hours}h ` : ''}
                      {minutes ? `${minutes}m ` : ''}
                      {seconds ? `${seconds}s ` : ''}
                    </span>
                  );
                }
              }}
            />
          )}
        </span>
      </div>
    </ComponentContainer>
  );
});

const LaunchProgress = observer(({ pair }: { pair: MemePairContract }) => {
  return (
    <>
      {pair.depositedRaisedToken && pair.raisedTokenMinCap && (
        <ComponentContainer>
          <h6 className="text-xs">Progress</h6>
          <div className="flex items-center gap-2 text-sm w-[80%]">
            <ProgressBar
              label={
                (
                  (pair.depositedRaisedToken.toNumber() /
                    (pair.raisedTokenMinCap.toNumber() / Math.pow(10, 18))) *
                  100
                ).toFixed(2) + '%'
              }
              value={
                (pair.depositedRaisedToken.toNumber() /
                  (pair.raisedTokenMinCap.toNumber() / Math.pow(10, 18))) *
                100
              }
            />
          </div>
        </ComponentContainer>
      )}
    </>
  );
});

const TotalLaunched = observer(({ pair }: { pair: Pot2Pump }) => {
  return (
    <ComponentContainer>
      <h6 className="text-xs">Total launched</h6>
      <div className="flex items-center gap-2 text-sm">
        {/* <TotalRaisedSvg /> */}
        <span className="font-bold">
          {new BigNumber(pair.DepositLaunchToken).toFormat(3)}
          &nbsp;
          {pair?.launchToken?.name}
        </span>
      </div>
    </ComponentContainer>
  );
});

const Participants = observer(
  ({ pair }: { pair: FtoPairContract | MemePairContract }) => {
    return (
      <ComponentContainer>
        <h6 className="text-xs">Participants</h6>
        <div className="flex items-center gap-2 text-sm">
          {/* <TotalRaisedSvg /> */}
          <span className="font-bold">
            {pair?.participantsCount ? pair.participantsCount.toFormat(0) : '-'}
          </span>
        </div>
      </ComponentContainer>
    );
  }
);

const TotalRaised = observer(
  ({ pair }: { pair: FtoPairContract | MemePairContract }) => {
    return (
      <ComponentContainer>
        <h6 className="text-xs">Total raised</h6>
        <div className="flex items-center gap-2 text-sm">
          {/* <TotalRaisedSvg /> */}
          <span className="font-bold">
            {pair?.depositedRaisedToken
              ? pair.depositedRaisedToken.toFormat(3)
              : '-'}
            &nbsp;
            {pair?.raiseToken?.displayName}
          </span>
        </div>
      </ComponentContainer>
    );
  }
);

const TokenPrice = observer(
  ({ pair }: { pair: FtoPairContract | MemePairContract }) => {
    return (
      <div className="flex flex-col items-center gap-1  odd:last:col-span-2">
        <h6 className="text-xs">Token Price</h6>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-bold">
            <AmountFormat amount={pair?.price?.toFixed()}></AmountFormat>{' '}
            {pair?.raiseToken?.displayName}
          </span>
        </div>
      </div>
    );
  }
);

const UserDeposited = observer(({ pair }: { pair: FtoPairContract }) => {
  return (
    <ComponentContainer>
      <h6 className="text-xs">Your Deposit</h6>
      <div className="flex items-center gap-2 text-sm">
        {/* <TotalRaisedSvg /> */}
        <span className="font-bold">
          {pair?.userDepositedRaisedToken
            ? (
                pair.userDepositedRaisedToken.toNumber() /
                Math.pow(10, pair.raiseToken?.decimals ?? 18)
              ).toFixed(3)
            : '-'}
          &nbsp;
          {pair?.raiseToken?.displayName}
        </span>
      </div>
    </ComponentContainer>
  );
});

//-------------------------------------Action Components-------------------------------------//
const ClaimAction = observer(
  ({ pair }: { pair: FtoPairContract | MemePairContract }) => {
    return (
      <>
        {pair.canClaimLP && (
          <div>
            <Button
              className="w-full"
              onClick={() => {
                pair.claimLP.call();
              }}
              style={{
                backgroundColor: 'green',
              }}
            >
              Claim LP
            </Button>
          </div>
        )}
      </>
    );
  }
);

const RefundAction = observer(({ pair }: { pair: MemePairContract }) => {
  return (
    <>
      {pair.canRefund && (
        <div>
          <Button
            className="w-full"
            onClick={() => {
              pair.refund.call();
            }}
            style={{
              backgroundColor: 'green',
            }}
          >
            Refund
          </Button>
        </div>
      )}
    </>
  );
});

const ToTokenDetailsPage = observer(
  ({ pair }: { pair: FtoPairContract | MemePairContract }) => {
    return (
      <Link href={`/launch-detail/${pair?.launchedToken?.address}`}>
        <Button className="w-full">View Token</Button>
      </Link>
    );
  }
);

const BuyToken = observer(
  ({ pair }: { pair: FtoPairContract | MemePairContract }) => {
    return (
      <>
        {pair.state === 0 && (
          <Link
            href={`/swap?inputCurrency=${pair.raiseToken?.address}&outputCurrency=${pair.launchedToken?.address}`}
          >
            <Button className="w-full">Buy Token</Button>
          </Link>
        )}
      </>
    );
  }
);

const AddLP = observer(
  ({ pair }: { pair: FtoPairContract | MemePairContract }) => {
    return (
      <>
        {pair.state === 0 && (
          <Link
            href={`/pool?inputCurrency=${pair.launchedToken?.address}&outputCurrency=${pair.raiseToken?.address}`}
          >
            <Button className="w-full">Add LP</Button>
          </Link>
        )}
      </>
    );
  }
);

// const ProjectActions = ({
//   pair,
// }: {
//   projectType: projectType;
//   pair: Pot2Pump;
// }) => {
//   <>
//     <ClaimAction pair={pair} />
//     <RefundAction pair={pair} />
//     <ToTokenDetailsPage pair={pair} />
//     <BuyToken pair={pair} />
//     <AddLP pair={pair} />
//   </>;
// };

//-------------------------------------Launch Card Variants-------------------------------------//
const DetailLaunchCard = observer(
  ({
    pair,
    action,
    projectType,
  }: {
    pair: MemePairContract;
    action: React.ReactNode;
    projectType: 'meme' | 'fto';
  }) => {
    const { projectInfo } = useProjectInfo(pair.address);

    // 计算进度百分比
    const progressPercentage = new BigNumber(pair.depositedRaisedToken ?? 0)
      .div(new BigNumber(pair.raisedTokenMinCap ?? 0))
      .times(100)
      .toFixed(2);

    // 计算进度值
    const progressValue = new BigNumber(pair.depositedRaisedToken ?? 0)
      .div(new BigNumber(pair.raisedTokenMinCap ?? 0))
      .toNumber();

    return (
      <div className="flex flex-col gap-y-4 bg-white px-4 py-6 border-none rounded-3xl shadow-[2px_2px_0px_0px_#FFCD4D] relative overflow-hidden">
        <OptionsDropdown
          className="absolute right-0 top-[1rem] text-black"
          options={[
            optionsPresets.copy({
              copyText: pair?.launchedToken?.address ?? '',
              displayText: 'Copy Token address',
              copysSuccessText: 'Token address copied',
            }),
            optionsPresets.importTokenToWallet({
              token: Token.getToken({
                chainId: wallet.currentChainId.toString(),
                address: pair?.launchedToken?.address ?? '',
              }),
            }),
            optionsPresets.share({
              shareUrl: `${window.location.origin}/launch-detail/${pair.launchedToken?.address}`,
              displayText: 'Share this project',
              shareText:
                projectType === 'meme'
                  ? 'My Meme FTO eats bonding burves for breakfast. Inflate & innovation with Boneypot. Den moon 🌙: ' +
                    pair?.launchedToken?.name
                  : 'Checkout this Token: ' + pair?.launchedToken?.name,
            }),
            optionsPresets.viewOnExplorer({
              address: pair?.address ?? '',
            }),
          ]}
        />
        <div className="bg-[url('/images/pumping/inline-border.svg')] h-6 absolute top-0 left-0 w-full bg-contain bg-left-top bg-repeat-x"></div>
        <Image
          alt="banner"
          width={256}
          height={0}
          objectFit="cover"
          className="mx-auto w-fit h-[108px] bg-contain rounded-xl"
          src={projectInfo.banner_url ?? '/images/pumping/trade-card-bg.png'}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/images/pumping/trade-card-bg.png';
          }}
        />
        <span className="break-all text-black">{projectInfo.logo_url}</span>
        <div className="text-[#202020]">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-xl">{pair?.launchedToken?.name}</h3>
              <p className="text-sm  text-[#202020]/[0.67]">
                {pair?.launchedToken?.symbol}
              </p>
            </div>
            <Image
              alt="logo"
              width={48}
              height={48}
              objectFit="cover"
              className="rounded-full"
              src={projectInfo.logo_url ?? '/images/empty-logo.png'}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/empty-logo.png';
              }}
            />
          </div>

          <div className="space-y-1.5 mt-4 text-[#202020]">
            <span className="text-sm opacity-70 space-x-1">
              <span>Progress</span>
              <span className="font-bold">{progressPercentage}%</span>
            </span>
            <ProgressBar
              className="rounded-[24px] border border-black bg-white shadow-[2px_2px_0px_0px_#D29A0D]"
              value={progressValue}
            />
            <div className="flex items-center justify-between text-sm">
              <span className="space-x-0.5">
                <span>
                  {new BigNumber(pair.depositedRaisedToken ?? 0)
                    .div(Math.pow(10, Number(pair.raiseToken?.decimals ?? 18)))
                    .toFixed(3)}
                </span>
                <span> {pair.raiseToken?.name}</span>
              </span>
              <span className="font-bold">{progressPercentage}%</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-black">
          <div>
            <p className="text-xs opacity-60">Total Raised Token</p>
            <p className="font-semibold">
              <span>
                {new BigNumber(pair.depositedRaisedToken ?? 0)
                  .multipliedBy(pair?.raiseToken?.derivedUSD || 0)
                  .toFormat(3)}
                &nbsp;
                {pair?.raiseToken?.name}
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-60">Participants Count</p>
            <p className="font-semibold">
              <span>{pair.participantsCount?.toFormat(0)}</span>
            </p>
          </div>
        </div>
        <div className="w-full h-[1px] bg-[#202020]"></div>
        <div className="flex flex-col text-black">
          <TimeLineComponent pair={pair} />
          <div className="w-full mt-[16px] flex gap-4 flex-col sm:flex-row justify-center sm:items-end flex-wrap *:basis-1 grow-[1] *:grow-[1]">
            {/* <ProjectActions pair={pair} /> */}
            {action}
          </div>
        </div>
      </div>
    );
  }
);

const TrendingLaunchCard = observer(({ pair }: { pair: MemePairContract }) => {
  const { projectInfo } = useProjectInfo(pair.address);

  // 计算进度百分比
  const progressPercentage = new BigNumber(pair.depositedRaisedToken ?? 0)
    .div(new BigNumber(pair.raisedTokenMinCap ?? 0))
    .times(100)
    .toFixed(2);

  // 计算进度值
  const progressValue = new BigNumber(pair.depositedRaisedToken ?? 0)
    .div(new BigNumber(pair.raisedTokenMinCap ?? 0))
    .toNumber();

  return (
    <Link
      className="flex flex-col bg-white px-4 py-6 border-none rounded-3xl shadow-[2px_2px_0px_0px_#925425] relative overflow-hidden"
      href={`/launch-detail/${pair.launchedToken?.address}`}
    >
      <div className="bg-[url('/images/pumping/inline-border.png')] bg-top h-6 absolute top-0 left-0 w-full bg-contain"></div>
      <Image
        alt="banner"
        width={256}
        height={0}
        objectFit="cover"
        className="w-full h-[108px] rounded-xl"
        src={projectInfo.banner_url ?? '/images/pumping/trade-card-bg.png'}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = '/images/pumping/trade-card-bg.png';
        }}
      />
      <div className="text-[#202020]">
        <div className="flex justify-between items-start mt-4">
          <div>
            <h3 className="font-bold text-xl">{pair?.launchedToken?.name}</h3>
            <p className="text-sm text-muted-foreground text-[#202020]/[0.67]">
              {pair?.launchedToken?.symbol}
            </p>
          </div>
          <Image
            alt="logo"
            width={48}
            height={48}
            objectFit="cover"
            className="rounded-full"
            src={projectInfo.logo_url ?? '/images/empty-logo.png'}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/empty-logo.png';
            }}
          />
        </div>

        <div className="space-y-1.5 mt-4 text-black">
          <span className="text-sm text-[#202020]/80">Total Raised</span>
          <div className="flex justify-between items-center">
            <span className="font-semibold">
              {new BigNumber(pair.depositedRaisedToken ?? 0).toFixed(0)}
            </span>
            <span>
              {new BigNumber(pair.raisedTokenMinCap ?? 0)
                .div(Math.pow(10, 18))
                .toFixed(0)}
              &nbsp;
              {pair?.raiseToken?.name}
            </span>
          </div>
          <ProgressBar
            className="rounded-[24px] border border-black bg-white shadow-[2px_2px_0px_0px_#D29A0D]"
            value={progressValue}
          />
          <div className="flex justify-end text-sm">
            <span className="font-bold">{progressPercentage}%</span>
          </div>
        </div>
      </div>
    </Link>
  );
});

export const LaunchCardV3 = observer(
  ({
    pair,
    action,
    type,
    className,
  }: {
    type?: launchCardVariants;
    pair?: MemePairContract;
    action: React.ReactNode;
  } & Partial<HTMLAttributes<any>>) => {
    const projectType: 'meme' | 'fto' = 'meme';

    return (
      <motion.div
        initial="hidden"
        animate="visible"
        whileInView="visible"
        variants={itemPopUpVariants}
        className={cn('w-full', className)}
      >
        {(!type || type === 'detail') && pair && (
          // FIXME: height issue
          <DetailLaunchCard
            pair={pair}
            action={action}
            projectType={projectType}
          />
        )}

        {type === 'list' && pair && <div>To be implemented</div>}

        {type === 'trending' && pair && <TrendingLaunchCard pair={pair} />}
      </motion.div>
    );
  }
);
