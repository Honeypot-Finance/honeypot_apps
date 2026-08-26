import { FtoPairContract } from '@/services/contract/launches/fto/ftopair-contract';
import { AsyncState, ValueState } from '@honeypot/shared';
import { wallet } from '@honeypot/shared/lib/wallet';
import { card, Input, Select, SelectItem } from '@nextui-org/react';
import { Button } from '../button';
import { animate, motion, Variants } from 'framer-motion';
import { observer, useLocalObservable } from 'mobx-react-lite';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useBalance } from 'wagmi';

import { Token } from '@honeypot/shared';
import { DiscussionArea } from '../Discussion/DiscussionArea/DiscussionArea';
import { swap } from '@/services/swap';
import { liquidity } from '@/services/liquidity';
import { amountFormatted } from '@/lib/format';
import { MemeWarParticipant, memewarStore } from '@/services/memewar';
import { WarppedNextSelect } from '../wrappedNextUI/Select/Select';
import BigNumber from 'bignumber.js';
import dynamic from 'next/dynamic';
import { popmodal } from '@/services/popmodal';
import { toCompactLocaleString } from '@/lib/utils';
import { TokenLogo } from '@honeypot/shared';
import { MemePairContract } from '@/services/contract/launches/pot2pump/memepair-contract';
import { LaunchDetailSwapCard } from '../SwapCard/MemeSwap';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const ANIMATION_DURATION = 500; //ms
const HP_BAR_URL = '/images/memewar/HP_BAR.png';

export interface Props {
  isEnd?: boolean;
}

export const MemeWarBannerV2 = observer((props: Props) => {
  useEffect(() => {
    if (!wallet.isInit) {
      return;
    }

    memewarStore.reloadParticipants();
  }, [wallet.isInit]);

  useEffect(() => {
    if (!memewarStore.isInit) {
      return;
    }
    let interval: NodeJS.Timeout;
    const startUpdateScoreInterval = async () => {
      memewarStore.updateAllParticipantScore().then(() => {
        interval = setTimeout(() => {
          startUpdateScoreInterval();
        }, 10000);
      });
    };

    startUpdateScoreInterval();

    return () => {
      clearTimeout(interval);
    };
  }, [memewarStore.isInit]);

  return memewarStore.isInit ? (
    <div className="flex m-auto flex-col gap-5 md:max-w-[min(1024px,80vw)]">
      <div>
        <div className="flex justify-between text-center">
          <h2 className="w-full text-center text-xl md:text-5xl font-[MEMEH] mb-2">
            OG MEME WAR
          </h2>
        </div>

        <MemeWarSupportSection />
        <div className="flex justify-between text-center">
          <p className="max-w-[600px] m-auto">
            X: # of peeps who HODL their favorite ticker <br />
            Y: total market-cap - the divine measure of peeps collective faith
          </p>
        </div>
        <MemeWarPariticipantRaceChart />
      </div>
      <DiscussionArea pairDatabaseId={-9999} isSide />
    </div>
  ) : (
    <div className="flex justify-center items-center h-[500px]">
      <h1>Loading...</h1>
    </div>
  );
});

export const MemeWarSupportSection = observer(() => {
  return (
    <div className="flex flex-col m-2 gap-5 md:max-w-[min(1024px,80vw)] md:m-auto">
      <div className=" *:my-4">
        <div className="text-center">
          your tHpot balance:{' '}
          {amountFormatted(memewarStore.tHpotToken?.balance, {
            fixed: 2,
            decimals: 0,
            symbol: ' tHPOT',
          }) || 'loading...'}
        </div>
        <WarppedNextSelect
          items={Object.entries(memewarStore.memewarParticipants)}
          onChange={(e) => {
            memewarStore.setSelectedSupportParticipant(
              memewarStore.memewarParticipants[e.target.value].pair!
            );
          }}
        >
          {Object.entries(memewarStore.memewarParticipants).map(
            ([key, value]) => {
              return (
                <SelectItem key={key} value={key}>
                  {value.participantName}
                </SelectItem>
              );
            }
          )}
        </WarppedNextSelect>{' '}
        <div className="flex justify-center items-center gap-2">
          <Button
            isDisabled={false}
            onClick={async () => {
              if (memewarStore.selectedSupportParticipantPair?.state === 3) {
                memewarStore.selectedSupportParticipantPair.deposit.call({
                  amount: memewarStore.supportAmount.toFixed(0),
                });
              } else {
                if (
                  !memewarStore.tHpotToken ||
                  !memewarStore.selectedSupportParticipantPair ||
                  !memewarStore.selectedSupportParticipantPair.launchedToken
                ) {
                  console.error('missing data');
                  return;
                }
                swap.setFromToken(memewarStore.tHpotToken);
                swap.setToToken(
                  memewarStore.selectedSupportParticipantPair.launchedToken
                );
                swap.setFromAmount(memewarStore.supportAmount.toFixed(0));

                await new Promise((resolve) => {
                  setTimeout(() => {
                    resolve(undefined);
                  }, 1000);
                });

                swap.swapExactTokensForTokens.call();
              }
            }}
          >
            Support
          </Button>
          <Input
            placeholder="Amount"
            onChange={(e) => {
              memewarStore.supportAmount = new BigNumber(e.target.value);
            }}
          />
        </div>
        <div className="bg-black relative w-full flex flex-col justify-center items-center col-span-2 h-[200px] border-4 border-black rounded-[1rem] overflow-hidden">
          <Image
            src="/images/memewar/janivspot.webp"
            alt=""
            width={300}
            height={300}
            className="w-full h-full object-cover object-center absolute brightness-25 opacity-10"
          />
          <Image
            src="/images/memewar/janivspot.webp"
            alt=""
            width={300}
            height={300}
            className="w-full h-full object-contain object-top absolute brightness-50 opacity-80 shadow-lg"
          />
          <h3 className="z-10 text-3xl">Complete quest to earn prize</h3>
          <Link
            href={
              'https://www.cubquests.com/campaigns/berachaindevs?quest=honeypot-finance'
            }
            target="_blank"
          >
            <Button className="z-10">Explore</Button>
          </Link>
        </div>
      </div>
    </div>
  );
});

export const MemeWarPariticipantRaceChart = observer(() => {
  const state: {
    series: ApexAxisChartSeries;
    options: ApexCharts.ApexOptions;
  } = {
    series: memewarStore.sortedMemewarParticipants.map((participant) => {
      return {
        name: participant.participantName,
        data: [
          {
            x: Number(participant.token?.swapCount) ?? 0,
            y: participant.currentScore.toNumber(),
            meta: { participant },
          },
        ],
      };
    }),
    options: {
      title: {
        text: 'Meme War Tracker',
        align: 'center',
        style: {
          color: 'white',
          fontSize: '2rem',
        },
        offsetY: 30,
      },
      chart: {
        type: 'scatter',
        animations: {
          enabled: false,
        },
        zoom: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
        events: {
          markerClick(e, chart, options) {
            console.log(e, chart, options);
            const target =
              memewarStore.sortedMemewarParticipants[options.seriesIndex];

            console.log(
              target.pair?.raiseToken?.address,
              target.pair?.launchedToken?.address
            );

            popmodal.openModal({
              content: (
                <LaunchDetailSwapCard
                  noBoarder
                  memePairContract={target.pair as MemePairContract}
                  inputAddress={target.pair?.raiseToken?.address}
                  outputAddress={target.pair?.launchedToken?.address}
                  extraTokenAction={
                    <a
                      href={`
                      /launch-detail/${target.pair?.launchedToken?.address}
                    `}
                    >
                      {target.pair?.launchedToken && (
                        <Button>
                          <TokenLogo token={target.pair?.launchedToken} />
                          View {target.participantName} detail
                        </Button>
                      )}
                    </a>
                  }
                />
              ),
            });
            // window
            //   .open(`/launch-detail/${target.pairAddress}`, "_blank")
            //   ?.focus();
          },
        },
      },
      colors: ['orange'],
      xaxis: {
        tickAmount: 10,
        // min: 0,
        // max: 40,
        title: {
          text: 'Holders →',
          offsetY: -40,
          style: {
            color: 'white',
          },
        },
        axisBorder: {
          show: true,
          offsetY: 25,
          offsetX: -45,
        },
        labels: {
          show: true,
        },
        axisTicks: {
          show: true,
        },
      },
      yaxis: {
        title: {
          text: 'Market Cap →',
          offsetX: 10,
          style: {
            color: 'white',
          },
        },
        labels: {
          show: true,
          formatter: (value) => {
            return toCompactLocaleString(value, {
              maximumFractionDigits: 0,
            });
          },
        },
        axisBorder: {
          show: true,
          offsetY: 25,
          offsetX: 6,
        },

        tickAmount: 10,
        axisTicks: {
          show: true,
        },
        // tickAmount: 7,
      },
      markers: {
        size: 20,
      },
      grid: {
        borderColor: 'transparent',
        show: false,
        padding: {
          left: 60,
          right: 30,
          top: 30,
          bottom: 30,
        },
      },
      stroke: {
        show: false,
      },
      tooltip: {
        enabled: true,
        x: {
          // formatter: (value) => `Tx Count: ${value}`,
        },
        y: {
          title: {
            formatter: (seriesName) => `${seriesName}`,
          },
        },
        custom(options) {
          const target =
            memewarStore.sortedMemewarParticipants[options.seriesIndex];
          return `
            <div class="p-2 bg-black/20 rounded-md text-center">
              <h3>${target.participantName}</h3>
              <p>Market Cap: ${toCompactLocaleString(target.currentScore, {
                maximumFractionDigits: 3,
              })}</p>
              <button
                class="text-primary  underline"
              >
                click to buy
              </button>
            </div>
          `;
        },
        theme: 'dark',
        fillSeriesColor: true,
        fixed: {
          enabled: true,
          offsetY: -20,
        },
      },

      fill: {
        type: 'image',
        opacity: 1,
        image: {
          src: memewarStore.sortedMemewarParticipants.map((participant) => {
            return participant.iconUrl || participant.pair?.logoUrl || '';
          }),
          width: 40,
          height: 40,
        },
      },

      legend: {
        show: false,
        labels: {
          useSeriesColors: true,
        },
      },
    },
  };

  return (
    <div className="relative w-full h-[80vh] md:h-auto m-auto flex-col flex-1 p-2 bg-black/20 rounded-md md:aspect-video max-h-[95vh] max-w-[95%]">
      <Chart
        options={state.options}
        series={state.series}
        type="scatter"
        width="100%"
        height={'100%'}
      />
    </div>
  );
});

export const MemeWarPariticipantCardListDisplay = observer(() => {
  return (
    <div className="relative flex justify-end flex-col flex-1 gap-2">
      {Object.values(memewarStore.sortedMemewarParticipants).map(
        (participant, idx) => {
          return (
            <MemeWarPariticipantCard
              key={participant.pairAddress}
              rank={(idx + 1).toString()}
              {...participant}
            />
          );
        }
      )}
    </div>
  );
});

export const MemeWarPariticipantCard = observer(
  (participant: MemeWarParticipant & { rank?: string }) => {
    //animate every time participant score changes
    const [currentScore, setCurrentScore] = useState(participant.currentScore);
    const [currentScale, setCurrentScale] = useState(1);

    useEffect(() => {
      if (currentScore.eq(participant.currentScore)) return;
      setCurrentScore(participant.currentScore);
      setCurrentScale(1.1);

      setTimeout(() => {
        setCurrentScale(1);
      }, ANIMATION_DURATION);
    }, [currentScore, participant.currentScore]);

    return (
      participant.pair && (
        <motion.div
          animate={{ scale: currentScale }}
          key={participant.pair.address}
          className="flex w-full items-center z-10 justify-center md:justify-end transition-all gap-4"
        >
          <h2 className="flex justify-center items-center font-[MEMEH] text-[3rem] w-[5rem]">
            {participant.rank == '1' ? '👑' : participant.rank}
          </h2>
          <Link href={`/launch-detail/${participant.pair.address}`}>
            <Image
              src={
                !!participant.iconUrl
                  ? participant.iconUrl
                  : participant.pair.logoUrl
              }
              alt=""
              width={100}
              height={100}
              className="w-10 h-10 md:w-20 md:h-20 object-contain rounded-full cursor-pointer"
            />
          </Link>
          <div className="relative flex flex-col justify-center items-center h-8 ">
            <div className="flex w-full justify-start items-start">
              {participant.participantName}
            </div>
            <div className="relative">
              <Image
                src={HP_BAR_URL}
                alt=""
                width={200}
                height={50}
                className="w-full h-full object-contain"
              />
              <h3 className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-black">
                {participant.pair.state != 0
                  ? participant.pair?.depositedRaisedToken?.toFixed(0) ||
                    'loading...'
                  : Math.max(
                      participant.currentScore.toNumber(),
                      participant.pair?.depositedRaisedToken?.toNumber() ?? 0
                    ).toLocaleString('en-US', {
                      style: 'decimal',
                      maximumFractionDigits: 0,
                    })}
              </h3>
            </div>
          </div>
        </motion.div>
      )
    );
  }
);

export default MemeWarBannerV2;
