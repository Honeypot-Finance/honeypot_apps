import { FtoPairContract } from '@/services/contract/launches/fto/ftopair-contract';
import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import { HTMLAttributes, useEffect } from 'react';
import { cn } from '@/lib/tailwindcss';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { itemPopUpVariants } from '@/lib/animation';
import { MemePairContract } from '@/services/contract/launches/pot2pump/memepair-contract';
import ProgressBar from '../../atoms/ProgressBar/ProgressBar';
import BigNumber from 'bignumber.js';
import { wallet } from '@honeypot/shared/lib/wallet';
import {
  LaunchProgress,
  FtoProjectActions,
  MemeProjectActions,
} from './components';
import {
  DynamicFormatAmount,
  formatAmountWithAlphabetSymbol,
  formatAmountWithScientificNotation,
} from '@/lib/algebra/utils/common/formatAmount';
import { Button } from '@/components/button/button-next';
import { PottingModalButton } from '@/components/atoms/Pot2PumpComponents/PottingModalButton';
import { PumpingModalButton } from '@/components/atoms/Pot2PumpComponents/PumpingModalButton';
import {
  getLaunchContractType,
  LaunchContract,
  LaunchContractType,
} from '@/services/contract/launches/base-launch-contract';
import { DynamicStringWrapper } from '@/components/atoms/DynamicStringWrapper/DynamicStringWrapper';

export type launchCardVariants =
  | 'list'
  | 'detail'
  | 'trending'
  | 'simple'
  | 'featured';

export const LaunchCardComponentContainer = ({
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

const ProjectActions = ({
  projectType,
  pair,
  type,
}: {
  projectType: LaunchContractType;
  pair: LaunchContract;
  type: launchCardVariants;
}) => {
  return (
    <MemeProjectActions
      pair={pair as MemePairContract}
      type={type}
    ></MemeProjectActions>
  );
};

//-------------------------------------Launch Card Variants-------------------------------------//
const DetailLaunchCard = observer(
  ({
    pair,
    type,
    action,
    theme = 'light',
  }: // projectType,
  {
    pair: LaunchContract;
    action: React.ReactNode;
    // projectType: LaunchContractType;
    type: launchCardVariants;
    theme?: 'light' | 'dark';
  }) => {
    return (
      <div
        className={cn(
          "flex flex-col h-full justify-between gap-y-4 bg-white px-4 py-6 rounded-3xl relative overflow-hidden bg-[url('/images/card-container/honey/top-border.svg')] bg-[length:auto_24px] bg-left-top bg-repeat-x pt-6",
          theme === 'dark'
            ? 'shadow-[1px_3px_0px_0px_#202020] border-[#202020] border-[1.5px]'
            : 'shadow-[2px_2px_0px_0px_#FFCD4D] border-none'
        )}
      >
        {/* <OptionsDropdown
          className="ml-auto text-black absolute -top-1.5 right-3.5"
          options={[
            optionsPresets.copy({
              copyText: pair?.launchedToken?.address ?? "",
              displayText: "Copy Token address",
              copysSuccessText: "Token address copied",
            }),
            optionsPresets.importTokenToWallet({
              token: pair?.launchedToken,
            }),
            optionsPresets.share({
              shareUrl: `${window.location.origin}/launch-detail/${pair?.address}`,
              displayText: "Share this project",
              shareText:
                projectType === "meme"
                  ? "My Meme FTO eats bonding burves for breakfast. Inflate & innovation with Boneypot. Den moon 🌙: " +
                    pair?.projectName
                  : "Checkout this Token: " + pair?.projectName,
            }),
            optionsPresets.viewOnExplorer({
              address: pair?.address ?? "",
            }),
          ]}
        /> */}
        <div className="text-[#202020] space-y-4 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-xl">{pair?.launchedToken?.name}</h3>
              <p className="text-sm text-[#202020]/[0.67]">
                {pair?.launchedToken?.symbol}
              </p>
            </div>
            <Image
              alt="logo"
              width={48}
              height={48}
              objectFit="cover"
              className="rounded-full max-h-12"
              src={!!pair.logoUrl ? pair.logoUrl : '/images/empty-logo.png'}
            />
          </div>
          <LaunchProgress pair={pair} className="my-3" />
          <div className="grid grid-cols-3 gap-2 text-black justify-start">
            {/* <div>
              <p className="text-xs opacity-60">Total Raised Token</p>
              <p className="font-semibold">
                <span>
                  {pair?.depositedRaisedToken && pair.raiseToken
                    ? "$" +
                      pair.depositedRaisedToken
                        .multipliedBy(pair?.raiseToken?.derivedUSD || 0)
                        .toFormat(3)
                    : "-"}
                  &nbsp;
                  {pair?.raiseToken?.displayName}
                </span>
              </p>
            </div> */}
            {pair.state === 3 && (
              <div>
                <p className="text-xs opacity-60">Participants Count</p>
                <p className="font-semibold">
                  <span>
                    {pair?.participantsCount
                      ? pair.participantsCount.toFormat(0)
                      : '-'}
                  </span>
                </p>
              </div>
            )}

            {pair.depositedRaisedTokenWithoutDecimals?.gt(0) && (
              <div>
                <p className="text-xs opacity-60">Your Deposit</p>
                <p className="font-semibold">
                  <span className="">
                    {DynamicFormatAmount({
                      amount: pair.userDepositedRaisedToken?.toString() ?? '0',
                      decimals: 2,
                      endWith: pair.raiseToken?.symbol,
                    })}
                  </span>{' '}
                  (
                  <span>
                    {DynamicFormatAmount({
                      amount:
                        pair.userDepositedRaisedTokenUSDAmount?.toString() ??
                        '0',
                      decimals: 2,
                      endWith: '$',
                    })}
                  </span>
                  )
                </p>
              </div>
            )}

            {pair.state === 0 && (
              <>
                {' '}
                <div>
                  <p className="text-xs opacity-60">Token Holders</p>
                  <p className="font-semibold">
                    <span>
                      {pair?.launchedToken?.holderCount
                        ? pair.launchedToken.holderCount
                        : '--'}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs opacity-60">LP Count</p>
                  <p className="font-semibold">
                    <span>
                      {pair?.launchedToken?.poolCount
                        ? pair.launchedToken.poolCount
                        : '--'}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs opacity-60">Volume</p>
                  <p className="font-semibold">
                    <span>
                      {pair?.launchedToken?.volumeUSD
                        ? DynamicFormatAmount({
                            amount: Number(pair.launchedToken.volumeUSD),
                            beginWith: '$',
                            decimals: 3,
                          })
                        : '--'}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs opacity-60">Liquidity</p>
                  <p className="font-semibold">
                    <span>
                      {pair?.launchedToken?.totalValueLockedUSD
                        ? DynamicFormatAmount({
                            amount: Number(
                              pair.raisedandLaunchTokenPairPool
                                ?.totalValueLockedUSD
                            ),
                            beginWith: '$',
                            decimals: 3,
                          })
                        : '--'}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs opacity-60">Current Price</p>
                  <p className="font-semibold">
                    <span>
                      {pair?.launchedToken?.derivedUSD
                        ? DynamicFormatAmount({
                            amount: Number(pair.launchedToken.derivedUSD),
                            beginWith: '$',
                            decimals: 3,
                          })
                        : '--'}
                    </span>
                  </p>
                </div>
                <div className="">
                  <p className="text-xs opacity-60">Price Change(24h)</p>
                  <p className="font-semibold">
                    <span
                      className={cn(
                        Number(pair?.launchedToken?.priceChange24hPercentage) >
                          1
                          ? 'text-green-500'
                          : 'text-red-500',
                        Number(
                          pair?.launchedToken?.priceChange24hPercentage
                        ) === 0 && 'text-black'
                      )}
                    >
                      {pair?.launchedToken?.priceChange24hPercentage &&
                        DynamicFormatAmount({
                          amount:
                            Number(
                              pair?.launchedToken?.priceChange24hPercentage
                            ) ?? 0,
                          decimals: 2,
                          endWith: '%',
                        })}
                    </span>
                  </p>
                </div>
              </>
            )}
          </div>
          <div className="w-full h-[1px] bg-[#202020]"></div>
          <div className="flex flex-col text-black">
            <div className="w-full flex gap-4 flex-col sm:flex-row justify-center sm:items-end flex-wrap *:basis-1 grow-[1] *:grow-[1]">
              <ProjectActions
                projectType={getLaunchContractType(pair)}
                pair={pair}
                type={type}
              />
              {action}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

const TrendingLaunchCard = observer(
  ({
    pair,
    projectType,
  }: {
    pair: LaunchContract;
    projectType: LaunchContractType;
  }) => {
    if (getLaunchContractType(pair) === 'lbp') return <></>;
    else if (getLaunchContractType(pair) === 'fto') return <></>;
    else if (getLaunchContractType(pair) === 'meme') {
      return (
        <Link
          className="flex flex-col gap-y-4 bg-white px-4 py-6 border-none rounded-3xl shadow-[2px_2px_0px_0px_#925425] relative overflow-hidden"
          href={`/launch-detail/${pair?.launchedToken?.address}`}
        >
          <div className="bg-[url('/images/pumping/inline-border.png')] bg-top h-6 absolute top-0 left-0 w-full bg-contain"></div>
          <Image
            alt="banner"
            width={256}
            height={0}
            objectFit="cover"
            className="w-full h-[108px] rounded-xl"
            src={
              !!pair.bannerUrl
                ? pair.bannerUrl
                : '/images/pumping/trade-card-bg.png'
            }
          />
          <div className="text-[#202020]">
            <div className="flex justify-between items-start mt-4">
              <div>
                <h3 className="font-bold text-xl">
                  {pair?.launchedToken?.name}
                </h3>
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
                src={!!pair.logoUrl ? pair.logoUrl : '/images/empty-logo.png'}
              />
            </div>

            <div className="space-y-1.5 mt-4 text-black">
              <span className="text-sm text-[#202020]/80">Total Raised</span>
              <div className="flex justify-between items-center">
                <span className="font-semibold">
                  {(pair as MemePairContract)?.depositedRaisedToken
                    ? (pair as MemePairContract).depositedRaisedToken?.toFormat(
                        0
                      )
                    : '-'}
                </span>
                <span>
                  {(pair as MemePairContract).raisedTokenMinCap &&
                    ((pair as MemePairContract).raisedTokenMinCap
                      ?.div(Math.pow(10, 18))
                      .toFixed(0) ??
                      0)}
                  &nbsp;
                  {pair?.raiseToken?.displayName}
                </span>
              </div>
              <ProgressBar
                className="rounded-[24px] border border-black bg-white shadow-[2px_2px_0px_0px_#D29A0D]"
                value={
                  (pair as MemePairContract)?.depositedRaisedToken &&
                  (pair as MemePairContract).raisedTokenMinCap
                    ? ((
                        pair as MemePairContract
                      ).depositedRaisedToken?.toNumber() ??
                        0 /
                          (((
                            pair as MemePairContract
                          ).raisedTokenMinCap?.toNumber() ?? 0) /
                            Math.pow(10, 18))) * 100
                    : 0
                }
              />
              <div className="flex justify-end text-sm">
                <span className="font-bold">
                  {(pair as MemePairContract)?.depositedRaisedToken &&
                  (pair as MemePairContract).raisedTokenMinCap
                    ? new BigNumber(
                        (
                          pair as MemePairContract
                        ).depositedRaisedToken?.toNumber() ?? 0
                      )
                        .div(
                          new BigNumber(
                            (
                              pair as MemePairContract
                            ).raisedTokenMinCap?.toNumber() ?? 0
                          ).div(Math.pow(10, 18))
                        )
                        .times(100)
                        .toFixed(2)
                    : '-'}{' '}
                  %
                </span>
              </div>
            </div>
          </div>
        </Link>
      );
    } else return <></>;
  }
);

const SimpleLaunchCard = observer(
  ({ pair, theme }: { pair: LaunchContract; theme: 'light' | 'dark' }) => {
    if (getLaunchContractType(pair) === 'lbp') return <></>;
    else if (getLaunchContractType(pair) === 'fto') return <></>;
    else if (getLaunchContractType(pair) === 'meme') {
      return (
        <div className="relative group">
          <Link
            href={`/launch-detail/${pair?.launchedToken?.address}`}
            className={cn(
              'flex flex-col text-sm gap-y-1 bg-white px-4 py-6  rounded-3xl relative transition-all duration-100 overflow-hidden cursor-pointer',
              theme === 'dark'
                ? 'shadow-[1px_3px_0px_0px_#202020] border-[#202020] border-[1.5px]'
                : 'shadow-[2px_2px_0px_0px_#FFCD4D] hover:bg-[#ffe6a8] border-none'
            )}
          >
            <div className="bg-[url('/images/card-container/honey/top-border.svg')] bg-[length:auto_24px] bg-repeat-x pt-6 h-6 absolute top-0 left-0 w-full bg-left-top"></div>
            <div className="flex gap-4 w-full justify-center items-center">
              <div>
                <Image
                  alt="logo"
                  width={100}
                  height={100}
                  objectFit="cover"
                  className="rounded-full"
                  src={!!pair.logoUrl ? pair.logoUrl : '/images/empty-logo.png'}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 flex-grow-[1] text-[#202020]">
                <div className="flex flex-col gap-y-2">
                  <h3 className="font-bold text-md">
                    <DynamicStringWrapper
                      string={pair?.launchedToken?.name ?? ''}
                      maxLength={10}
                    />
                  </h3>
                  <p className="text-sm text-[#202020]/[0.67]">
                    <DynamicStringWrapper
                      string={pair?.launchedToken?.symbol ?? ''}
                      maxLength={10}
                    />
                  </p>
                </div>
                <div className="flex-grow-[1]  gap-y-2 text-right text-sm flex flex-col justify-start items-end">
                  <div>
                    {pair.state === 3 &&
                      pair?.participantsCount &&
                      pair.participantsCount.toFormat(0) + ' Participants'}
                    {pair.state === 0 &&
                      pair?.launchedToken?.holderCount &&
                      pair?.launchedToken?.holderCount + ' Holders'}
                  </div>
                  {pair.state === 0 && (
                    <div className="font-bold text-lg whitespace-nowrap">
                      {DynamicFormatAmount({
                        amount: pair.launchedToken?.derivedUSD ?? '0',
                        decimals: 3,
                        endWith: '$',
                      })}
                    </div>
                  )}
                </div>
                <div className="col-span-2">
                  {pair.state === 3 && <LaunchProgress pair={pair} />}
                </div>
              </div>
            </div>

            {pair.state === 0 && (
              <div className="grid grid-cols-3 gap-1 text-black">
                <div className="text-md font-bold text-right col-span-3 flex flex-row justify-start items-center">
                  <p className="flex flex-row gap-2 items-start justify-between w-full text-left">
                    {/* <span>
                    Price Change:{" "}
                    <span
                      className={cn(
                        Number(pair?.launchedToken?.initialUSD) &&
                          Number(pair?.launchedToken?.derivedUSD) &&
                          (Number(pair?.launchedToken?.derivedUSD) >
                          Number(pair?.launchedToken?.initialUSD)
                            ? "text-green-500"
                            : "text-red-500")
                      )}
                    >
                      {pair.priceChangeDisplay}
                    </span>
                  </span> */}
                    <span>
                      Change 24h:{' '}
                      <span
                        className={cn(
                          Number(
                            pair?.launchedToken?.priceChange24hPercentage
                          ) &&
                            Number(
                              pair?.launchedToken?.priceChange24hPercentage
                            ) > 0
                            ? 'text-green-500'
                            : 'text-red-500'
                        )}
                      >
                        {DynamicFormatAmount({
                          amount:
                            pair?.launchedToken?.priceChange24hPercentage ??
                            '0',
                          decimals: 2,
                          endWith: '%',
                        })}
                      </span>
                    </span>
                    <div className="text-right flex flex-row gap-2 items-center *:flex-grow-[1]">
                      <span>TX:</span>
                      <span className="text-green-400">
                        {pair?.launchedTokenBuyCount?.toFixed(0) ?? 0}
                      </span>
                      <span>/</span>
                      <span className="text-red-400">
                        {pair?.launchedTokenSellCount?.toFixed(0) ?? 0}
                      </span>
                    </div>
                  </p>
                </div>
                <div className="text-xs ">
                  <p className="text-xs opacity-60">Volume</p>
                  <p className="font-semibold">
                    <span>
                      {pair?.launchedToken?.volumeUSD
                        ? '$ ' +
                          formatAmountWithAlphabetSymbol(
                            pair.launchedToken?.volumeUSD ?? '0',
                            5
                          )
                        : '--'}
                    </span>
                  </p>
                </div>
                <div className="text-xs ">
                  <p className="text-xs opacity-60">Liquidity</p>
                  <p className="font-semibold">
                    <span>
                      {pair?.raisedandLaunchTokenPairPool?.totalValueLockedUSD
                        ? '$ ' +
                          formatAmountWithAlphabetSymbol(
                            pair.raisedandLaunchTokenPairPool
                              ?.totalValueLockedUSD ?? '0',
                            5
                          )
                        : '--'}
                    </span>
                  </p>
                </div>{' '}
                <div className="text-xs ">
                  <p className="text-xs opacity-60">Market Cap</p>
                  <p className="font-semibold">
                    <span>
                      {pair?.launchedToken?.marketCap
                        ? '$ ' +
                          formatAmountWithAlphabetSymbol(
                            pair.launchedToken?.marketCap?.toString() ?? '0',
                            5
                          )
                        : '--'}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </Link>

          {wallet.isInit && pair.state === 3 && (
            <PottingModalButton
              pair={pair as MemePairContract}
              className="pop-button absolute bottom-0 right-0 translate-y-1/2 -translate-x-1/4 z-10 opacity-0 group-hover:opacity-100"
            />
          )}
          {wallet.isInit && pair.state === 0 && (
            <PumpingModalButton
              pair={pair as MemePairContract}
              className="absolute bottom-0 right-0 translate-y-1/2 -translate-x-1/4 z-10 opacity-0 group-hover:opacity-100"
            />
          )}
        </div>
      );
    } else return <></>;
  }
);

const FeaturedLaunchCard = observer(({ pair }: { pair: LaunchContract }) => {
  if (getLaunchContractType(pair) === 'lbp') return <></>;
  else if (getLaunchContractType(pair) === 'fto') return <></>;
  else if (getLaunchContractType(pair) === 'meme') {
    return (
      <div className="flex min-h-[160px] bg-white p-2 sm:p-6 border-none shadow-[2px_2px_0px_0px_#FFCD4D] relative transition-all duration-100 rounded-lg sm:rounded-3xl sm:custom-dashed">
        <div className="flex flex-col sm:flex-row gap-6 w-full">
          <div className="flex flex-row gap-6">
            <Image
              alt={pair?.launchedToken?.name || 'logo'}
              width={160}
              height={160}
              objectFit="cover"
              sizes="(max-width: 640px) 128px, 160px"
              src={!!pair.logoUrl ? pair.logoUrl : '/images/empty-logo.png'}
              className="border border-[#202020]/60 rounded-xl size-32 sm:size-40"
            />
            <div className="flex-1 flex-shrink-0 flex flex-col gap-y-2 sm:gap-y-4">
              <div className="flex flex-col gap-1">
                <h2 className="font-bold text-lg sm:text-2xl">
                  {pair?.launchedToken?.symbol}
                </h2>
                <p className="text-sm sm:text-base text-[#202020]/[0.67]">
                  {pair?.launchedToken?.name}
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-sm sm:text-base">
                  <span className="text-[#202020]/60">Token Price: </span>
                  <span className="font-bold">
                    {DynamicFormatAmount({
                      amount: pair.launchedToken?.derivedUSD ?? '0',
                      decimals: 5,
                      beginWith: '$',
                    })}
                  </span>
                </div>

                <div className="text-sm sm:text-base">
                  <span className="text-[#202020]/60">Price Change(24h): </span>
                  <span
                    className={cn(
                      'font-bold',
                      Number(pair?.launchedToken?.priceChange24hPercentage) &&
                        Number(pair?.launchedToken?.priceChange24hPercentage) >
                          0
                        ? 'text-green-500'
                        : 'text-red-500'
                    )}
                  >
                    {formatAmountWithAlphabetSymbol(
                      pair?.launchedToken?.priceChange24hPercentage ?? '0',
                      2
                    )}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex-shrink-0">
            <div className="w-full bg-[#FEF6C7] rounded-2xl border border-[#202020] text-xs sm:text-sm p-3 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-2 sm:gap-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base font-medium text-[#202020]/60">
                    Market Cap:
                  </span>
                  <span className="font-bold">
                    {formatAmountWithAlphabetSymbol(
                      pair.launchedToken?.marketCap?.toString() ?? '0',
                      5
                    )}
                    $
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base font-medium text-[#202020]/60">
                    TX:
                  </span>
                  <div className="font-bold">
                    <span className="text-green-500">
                      {pair?.launchedTokenBuyCount?.toFixed(0) ?? 0}
                    </span>
                    <span className="mx-1">/</span>
                    <span className="text-red-500">
                      {pair?.launchedTokenSellCount?.toFixed(0) ?? 0}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base font-medium text-[#202020]/60">
                    Holders:
                  </span>
                  <span className="font-bold">
                    {pair?.launchedToken?.holderCount ?? 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base font-medium text-[#202020]/60">
                    Volume:
                  </span>
                  <span className="font-bold">
                    $
                    {pair?.launchedToken?.volumeUSD
                      ? formatAmountWithAlphabetSymbol(
                          pair.launchedToken?.volumeUSD ?? '0',
                          5
                        )
                      : '--'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base font-medium text-[#202020]/60">
                    Liquidity
                  </span>
                  <span className="font-bold">
                    $
                    {pair?.raisedandLaunchTokenPairPool?.totalValueLockedUSD
                      ? formatAmountWithAlphabetSymbol(
                          pair.raisedandLaunchTokenPairPool
                            ?.totalValueLockedUSD ?? '0',
                          5
                        )
                      : '--'}
                  </span>
                </div>
              </div>

              <div className="flex mt-4 sm:mt-6">
                <div className="flex w-full rounded-lg bg-white border border-[#202020] p-0.5 sm:p-1">
                    <Link
                    className="flex-1 w-full bg-[#FFCD4D] text-[#202020] rounded-lg border-none font-bold text-sm sm:text-base flex items-center justify-center hover:opacity-85"
                    href={`/launch-detail/${pair?.launchedToken?.address}`}
                    >
                    Token Details
                    </Link>
                  {pair.state === 0 ? (
                    <PumpingModalButton
                      pair={pair as MemePairContract}
                      className="flex-1 bg-transparent text-[#202020] rounded-lg hover:bg-[#FFCD4D] border-none font-bold text-sm sm:text-base"
                    />
                  ) : (
                    <Button className="flex-1 bg-transparent text-[#202020] rounded-lg hover:bg-[#FFCD4D] border-none font-bold text-sm sm:text-base">
                      Pumping
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else return <></>;
});

export const LaunchCardV3 = observer(
  ({
    pair,
    type,
    action,
    className,
    theme = 'light',
  }: {
    type?: launchCardVariants;
    pair?: LaunchContract | null;
    action: React.ReactNode;
    theme?: 'light' | 'dark';
  } & Partial<HTMLAttributes<any>>) => {
    const projectType: LaunchContractType = pair
      ? getLaunchContractType(pair)
      : 'meme';

    useEffect(() => {
      if (pair) {
        pair.loadRaisedandLaunchTokenPairPool();
      }
    }, [pair]);

    if (!pair) return <></>;
    return (
      <>
        {!wallet.currentChain?.blacklist?.memeBlacklist?.includes(
          pair?.address?.toLowerCase() || ''
        ) ? (
          <motion.div
            initial="hidden"
            animate="visible"
            whileInView="visible"
            variants={itemPopUpVariants}
            className={cn('w-full h-full', className)}
          >
            {(!type || type === 'detail') && pair && (
              // FIXME: height issue
              <DetailLaunchCard
                pair={pair}
                action={action}
                type="detail"
                theme={theme}
                // projectType={projectType}
              />
            )}

            {type === 'list' && pair && <div>To be implemented</div>}

            {type === 'trending' && pair && (
              <TrendingLaunchCard pair={pair} projectType={projectType} />
            )}
            {type === 'simple' && pair && (
              <SimpleLaunchCard pair={pair} theme={theme} />
            )}
            {type === 'featured' && pair && <FeaturedLaunchCard pair={pair} />}
          </motion.div>
        ) : (
          <></>
        )}
      </>
    );
  }
);
