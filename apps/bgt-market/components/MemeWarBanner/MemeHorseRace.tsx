import React, { useState, useEffect, useRef, useMemo } from 'react';
import styled from 'styled-components';
import Image from 'next/image';
import raceFieldBg from 'public/images/horserace/race_field.png';

import { Token } from '@honeypot/shared';
import { V3SwapCard } from '@/components/algebra/swap/V3SwapCard';
import { wallet } from '@honeypot/shared/lib/wallet';
import { observer } from 'mobx-react-lite';
import { getAllRacers, Racer } from '@/lib/algebra/graphql/clients/racer';
import {
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
} from '@nextui-org/react';
import { useSpring, animated } from 'react-spring';
import { getTokenTop10Holders } from '@/lib/algebra/graphql/clients/token';
import { TokenTop10HoldersQuery } from '@/lib/algebra/graphql/generated/graphql';
import BigNumber from 'bignumber.js';
import { poolsByTokenPair } from '@/lib/algebra/graphql/clients/pool';
import { useRouter } from 'next/router';
import { ExternalLink } from 'lucide-react';
import { Copy } from '@/components/Copy';
import { VscCopy } from 'react-icons/vsc';

const START_TIMESTAMP = 1734436800;
const END_TIMESTAMP = 1734825600;

const RaceTrack = styled.div<{ totalRacers: number }>`
  width: 100%;
  height: ${(props) => Math.min(70, props.totalRacers * 15)}vh;
  background-image: url(${raceFieldBg.src});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 20px;
  border-radius: 10px;
  position: relative;
  overflow-y: auto;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 10px;
  }
`;

const ContentWrapper = styled.div<{ totalRacers: number }>`
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;

  h2 {
    margin-bottom: 10px;
  }
`;

const RaceLanesContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  min-height: 0;
`;

const RaceLane = styled.div`
  height: 80px;
  position: relative;
  border-radius: 8px;
  display: flex;
  align-items: center;
  margin: 5px 0;
`;

const RaceTrail = styled.div<{ position: number }>`
  position: absolute;
  left: 0;
  height: 8px;
  width: ${(props) => props.position}%;
  background: linear-gradient(
    to right,
    rgba(255, 215, 0, 1),
    rgba(255, 215, 0, 0.5)
  );
  border-radius: 4px;
  transition: width 0.5s ease;
  opacity: 1;
  visibility: visible;
  min-width: 15%;
`;

const RacerIcon = styled.div<{
  position: number;
  isDead?: boolean;
  isEndTime?: boolean;
}>`
  position: absolute;
  left: ${(props) => (props.isDead ? 0 : props.position)}%;
  transform: translateX(-50%);
  transition: left 0.5s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  opacity: ${(props) => (props.isDead ? 0.5 : 1)};
`;

const RankIndicator = styled.div`
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 24px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const TimeSlider = styled.input`
  width: 100%;
  margin: 20px 0;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.2);
  outline: none;
  opacity: 0.7;
  transition: opacity 0.2s;
  position: relative;
  display: block;

  &:hover {
    opacity: 1;
  }

  &::-webkit-slider-thumb {
    position: relative;
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #ffcd4d;
    cursor: pointer;
    transition: transform 0.2s;
    transform: translateY(-50%);
    top: 50%;

    &:hover {
      transform: translateY(-50%) scale(1.2);
    }
  }

  &::-moz-range-thumb {
    position: relative;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #ffcd4d;
    cursor: pointer;
    border: none;
    transition: transform 0.2s;
    transform: translateY(-50%);
    top: 50%;

    &:hover {
      transform: translateY(-50%) scale(1.2);
    }
  }

  &::-webkit-slider-runnable-track {
    width: 100%;
    height: 4px;
    background: linear-gradient(
      to right,
      #ffcd4d 0%,
      #ffcd4d var(--value, 0%),
      rgba(255, 255, 255, 0.2) var(--value, 0%)
    );
    border-radius: 2px;
  }

  &::-moz-range-track {
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
  }

  &::-moz-range-progress {
    height: 4px;
    background: #ffcd4d;
    border-radius: 2px;
  }
`;

const AnimatedValue = styled.span<{ changed: boolean }>`
  display: inline-block;
  transition: all 0.3s ease-in-out;
  background-color: ${(props) =>
    props.changed ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
`;

const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 20px;
`;

const TableContainer = styled.div`
  margin-top: 20px;
  position: relative;
  z-index: 1;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  padding: 16px;
  backdrop-filter: blur(10px);
`;

const DeadRacers = [
  {
    racerAddress: '0x6e504fcb8519820499ec2518bd912016b373c5dc',
    deadTime: 1734710400,
  },
  {
    racerAddress: '0xd92e5d89cfe82bb0c0f95a3f4b0ee5ddb22e5e87',
    deadTime: 1734710400,
  },
  {
    racerAddress: '0x24dc27d117aca1d8c0aace33bd840026c9a52e28',
    deadTime: 1734710400,
  },
  {
    racerAddress: '0x04457d8063168e7008df0f6d10961622a316dd1c',
    deadTime: 1734710400,
  },
];

const formatMarketCap = (value: number) => {
  if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
  return value.toFixed(2);
};

const LerpingValue = ({
  value,
  formatter = (val: number) => val.toFixed(3),
}: {
  value: number;
  formatter?: (val: number) => string;
}) => {
  const { number } = useSpring({
    from: { number: 0 },
    number: value,
    config: { duration: 300 },
    immediate: false,
  });

  return <animated.span>{number.to((val) => formatter(val))}</animated.span>;
};

export interface MemeHorseRaceProps {
  showRaceTrack?: boolean;
  showTable?: boolean;
}

interface RacerWithToken extends Racer {
  tokenOnchainData?: Token;
  volume24h?: number;
  tvl?: number;
  currentPrice?: number;
  priceChange24h?: number;
}

const TopHoldersModal = observer(
  ({
    racer,
    holders,
    isOpen,
    onClose,
  }: {
    racer: RacerWithToken;
    holders: TokenTop10HoldersQuery;
    isOpen: boolean;
    onClose: () => void;
  }) => {
    const TotalHoldingValue =
      holders.token?.holders?.reduce(
        (acc, holder) => acc + Number(holder.holdingValue),
        0
      ) || 0;

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        hideCloseButton={false}
        placement="center"
        size="4xl"
        classNames={{
          base: 'bg-transparent',
          wrapper: 'bg-transparent',
          closeButton: 'right-4 top-4 text-white z-50',
          body: 'p-0',
        }}
      >
        <ModalContent className="bg-transparent max-w-[1000px] w-[90vw]">
          <div className="relative">
            <div className="bg-[url('/images/pumping/outline-border.png')] h-[50px] absolute top-0 left-0 w-full bg-contain bg-[left_-90px_top] bg-repeat-x"></div>

            <div className="pt-14 px-6 pb-6 bg-[#FFCD4D]">
              <ModalHeader className="p-0">
                <div className="flex items-center gap-4">
                  <Image
                    src={racer.tokenOnchainData?.logoURI || ''}
                    alt={racer.tokenOnchainData?.symbol || ''}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-black">
                      {racer.tokenOnchainData?.symbol} Top Holders
                    </h3>
                    <p className="text-gray-600">
                      {racer.tokenOnchainData?.name}
                    </p>
                  </div>
                </div>
              </ModalHeader>

              <ModalBody className="p-0 mt-6">
                <div className="w-full rounded-[32px] bg-[#202020] space-y-4 px-4 py-6 custom-dashed">
                  <div className="border border-[#5C5C5C] rounded-2xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-[#323232]">
                        <tr>
                          <th className="py-2 px-2 sm:px-4 text-left text-sm sm:text-base font-medium text-white">
                            Rank
                          </th>
                          <th className="py-2 px-2 sm:px-4 text-left text-sm sm:text-base font-medium text-white">
                            Address
                          </th>
                          <th className="py-2 px-2 sm:px-4 text-right text-sm sm:text-base font-medium text-white">
                            Balance
                          </th>
                          <th className="py-2 px-2 sm:px-4 text-right text-sm sm:text-base font-medium text-white">
                            Percentage
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-white divide-y divide-[#5C5C5C]">
                        {holders.token?.holders?.map((holder, index) => (
                          <tr
                            key={holder.id}
                            className="hover:bg-[#2a2a2a] transition-colors"
                          >
                            <td className="py-2 px-2 sm:px-4 text-sm sm:text-base whitespace-nowrap">
                              <span className="flex items-center gap-2">
                                {index === 0 ? '👑' : index + 1}
                              </span>
                            </td>
                            <td className="py-2 px-2 sm:px-4 text-sm sm:text-base whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <a
                                  href={`https://berascan.com/address/${holder.account.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-[#FFCD4D] flex items-center gap-1"
                                >
                                  {holder.account.id}
                                  <ExternalLink className="size-3" />
                                </a>
                                <Copy
                                  className="p-1 hover:bg-[#3a3a3a] rounded flex items-center justify-center min-w-[24px]"
                                  value={holder.account.id}
                                  content="Copy address"
                                >
                                  <VscCopy className="size-3.5" />
                                </Copy>
                              </div>
                            </td>
                            <td className="py-2 px-2 sm:px-4 text-right text-sm sm:text-base whitespace-nowrap">
                              <div className="flex flex-col sm:flex-row justify-end items-end gap-1">
                                <span>
                                  {BigNumber(holder.holdingValue)
                                    .dividedBy(1e18)
                                    .toFixed(0)}
                                </span>
                                <span className="text-sm text-gray-400">
                                  {holders.token?.symbol}
                                </span>
                              </div>
                            </td>
                            <td className="py-2 px-2 sm:px-4 text-right text-sm sm:text-base whitespace-nowrap">
                              <span className="text-[#FFCD4D] font-medium">
                                {(
                                  (holder.holdingValue / TotalHoldingValue) *
                                  100
                                ).toFixed(2)}
                                %
                              </span>
                            </td>
                          </tr>
                        )) || []}
                      </tbody>
                    </table>
                  </div>
                </div>
              </ModalBody>
            </div>

            <div className="bg-[url('/images/card-container/honey/bottom-border.svg')] bg-left-top h-6 absolute -bottom-1 left-0 w-full bg-contain"></div>
          </div>
        </ModalContent>
      </Modal>
    );
  }
);

const SwapModal = observer(
  ({
    tokenAddress,
    isOpen,
    onClose,
  }: {
    tokenAddress: string;
    isOpen: boolean;
    onClose: () => void;
  }) => {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        hideCloseButton={false}
        placement="center"
        classNames={{
          closeButton: 'right-4 top-4 z-50 text-white z-[9999]',
        }}
      >
        <ModalContent className="bg-transparent">
          <V3SwapCard
            fromTokenAddress={wallet.currentChain.platformTokenAddress.HPOT}
            toTokenAddress={tokenAddress}
          />
        </ModalContent>
      </Modal>
    );
  }
);

export const MemeHorseRace = observer(
  ({ showRaceTrack = true, showTable = true }: MemeHorseRaceProps) => {
    const [timeIndex, setTimeIndex] = useState(-1);
    const [tokens, setTokens] = useState<Record<string, Token>>({});
    const [racers, setRacers] = useState<RacerWithToken[]>([]);
    const [prevScores, setPrevScores] = useState<Record<string, number>>({});
    const [changedValues, setChangedValues] = useState<Record<string, boolean>>(
      {}
    );
    const [isInitializing, setIsInitializing] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [scrollPosition, setScrollPosition] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const timeSliderRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const [selectedRacer, setSelectedRacer] = useState<RacerWithToken | null>(
      null
    );
    const [holdersData, setHoldersData] =
      useState<TokenTop10HoldersQuery | null>(null);
    const [selectedTokenAddress, setSelectedTokenAddress] = useState<
      string | null
    >(null);
    const {
      isOpen: isSwapOpen,
      onOpen: onSwapOpen,
      onClose: onSwapClose,
    } = useDisclosure();
    const {
      isOpen: isHoldersOpen,
      onOpen: onHoldersOpen,
      onClose: onHoldersClose,
    } = useDisclosure();

    useEffect(() => {
      const initialize = async () => {
        try {
          // Get initial racers
          const initialRacers = await getAllRacers();

          setRacers(initialRacers);

          // Initialize tokens if wallet is ready
          if (wallet.isInit) {
            const tokenMap: Record<string, Token> = {};
            for (const racer of initialRacers) {
              const token = Token.getToken({ chainId: wallet.currentChainId.toString(), address: racer.tokenAddress });
              await token.init();
              tokenMap[racer.tokenAddress] = token;
            }
            setTokens(tokenMap);
          }

          setIsInitializing(false);

          // Set up interval for updates after initialization
          // const interval = setInterval(async () => {
          //   const updatedRacers = await getAllRacers();
          //   setRacers(updatedRacers);
          // }, 1000);

          // return () => clearInterval(interval);
        } catch (error) {
          console.error('Initialization error:', error);
          setIsInitializing(false);
        }
      };

      initialize();
    }, [wallet.isInit]);

    useEffect(() => {
      // 组件挂载时初始化进度条颜色
      if (timeSliderRef.current) {
        timeSliderRef.current.style.setProperty('--value', '100%');
      }
    }, []);

    const maxTimelineRacer = racers.reduce(
      (prev, current) =>
        current.tokenHourScore.length > prev.tokenHourScore.length
          ? current
          : prev,
      racers[0] || { tokenHourScore: [] }
    );

    const timestamps = [
      ...new Set(
        maxTimelineRacer.tokenHourScore
          .map((score) => parseInt(score.starttimestamp))
          .filter((timestamp) => timestamp <= END_TIMESTAMP)
      ),
    ].sort((a, b) => a - b);

    const getRacerScore = (racer: RacerWithToken, timestamp: number) => {
      if (timestamp < START_TIMESTAMP) {
        return 0;
      }
      const exactScore = racer.tokenHourScore.find(
        (score) => parseInt(score.starttimestamp) === timestamp
      );
      if (exactScore) {
        return parseFloat(exactScore.score);
      }

      const lastValidScore = racer.tokenHourScore
        .filter((score) => parseInt(score.starttimestamp) <= timestamp)
        .sort(
          (a, b) => parseInt(b.starttimestamp) - parseInt(a.starttimestamp)
        )[0];

      return lastValidScore ? parseFloat(lastValidScore.score) : 0;
    };

    const getHourlyChange = (
      racer: RacerWithToken,
      currentTimestamp: number
    ) => {
      const currentScore = getRacerScore(racer, currentTimestamp);

      const oneHourAgoTimestamp = currentTimestamp - 3600;
      const previousScore = getRacerScore(racer, oneHourAgoTimestamp);

      if (previousScore === 0) return 0;
      return ((currentScore - previousScore) / previousScore) * 100;
    };

    const getCurrentScores = () => {
      const currentTimestamp = timestamps[timeIndex];
      console.log(
        'racers',
        racers.map((racer) => ({
          ...racer,
          tokenOnchainData: tokens[racer.tokenAddress],
          currentScore: getRacerScore(racer, currentTimestamp),
          hourlyChange: getHourlyChange(racer, currentTimestamp),
          volume24h: 1200000, // 示例数据，实际应该从API获取
          tvl: 4500000,
          currentPrice: 0.0045,
          priceChange24h: 12.5,
        }))
      );

      return racers.map((racer) => ({
        ...racer,
        tokenOnchainData: tokens[racer.tokenAddress],
        currentScore: getRacerScore(racer, currentTimestamp),
        hourlyChange: getHourlyChange(racer, currentTimestamp),
        volume24h: 1200000, // 示例数据，实际应该从API获取
        tvl: 4500000,
        currentPrice: 0.0045,
        priceChange24h: 12.5,
      }));
      // .sort((a, b) => b.currentScore - a.currentScore);
    };

    const allTimeHighScore = Math.max(
      ...racers.flatMap((racer) =>
        racer.tokenHourScore.map((score) => parseFloat(score.score))
      )
    );

    const currentRacers = useMemo(() => getCurrentScores(), [getCurrentScores]);

    const totalRacers = racers.length;

    const handleTokenClick = (tokenAddress: string) => {
      setSelectedTokenAddress(tokenAddress);
      onSwapOpen();
    };

    const getSortedRacers = () => {
      return currentRacers.sort((a, b) => {
        return b.currentScore - a.currentScore;
      });
    };

    useEffect(() => {
      const currentScores = currentRacers.reduce((acc, racer) => {
        acc[racer.tokenAddress] = racer.currentScore;
        return acc;
      }, {} as Record<string, number>);

      const newChangedValues: Record<string, boolean> = {};
      Object.keys(currentScores).forEach((address) => {
        if (
          prevScores[address] !== undefined &&
          prevScores[address] !== currentScores[address]
        ) {
          newChangedValues[address] = true;
        }
      });

      setChangedValues(newChangedValues);
      setPrevScores(currentScores);

      const timer = setTimeout(() => {
        setChangedValues({});
      }, 300);

      return () => clearTimeout(timer);
    }, [racers]);

    useEffect(() => {
      if (timestamps.length > 0 && timeIndex === -1) {
        setTimeIndex(timestamps.length - 1);
      }
      // 设置进度条颜色
      const sliderElement = document.querySelector(
        'input[type="range"]'
      ) as HTMLInputElement;
      if (sliderElement && timeIndex >= 0) {
        const percent = (timeIndex / (timestamps.length - 1)) * 100;
        sliderElement.style.setProperty('--value', `${percent}%`);
      }
    }, [timestamps.length, timeIndex]);

    useEffect(() => {
      if (containerRef.current) {
        setScrollPosition(containerRef.current.scrollTop);
      }
    }, [racers]);

    useEffect(() => {
      if (containerRef.current && scrollPosition > 0) {
        containerRef.current.scrollTop = scrollPosition;
      }
    }, [scrollPosition]);

    const handleShowHolders = async (tokenId: string) => {
      const targetRacer = racers.find(
        (racer) => racer.tokenAddress === tokenId
      );
      if (!targetRacer) return;

      try {
        setIsLoading(true);
        const data = await getTokenTop10Holders(tokenId);
        setSelectedRacer({
          ...targetRacer,
          tokenOnchainData: tokens[targetRacer.tokenAddress],
        });
        setHoldersData(data);
        onHoldersOpen();
      } catch (error) {
        console.error('Error fetching holders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const handleAddLP = async (tokenAddress: string) => {
      const pools = await poolsByTokenPair(
        tokenAddress,
        wallet.currentChain.platformTokenAddress.HPOT
      );

      if (pools && pools.length > 0) {
        const pool = pools[0];
        //redirect to add liquidity page
        router.push(`/pool-detail/${pool.id}`);
      }
    };

    const handleTimeSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value);
      setTimeIndex(value);
      // 更新进度条颜色
      const percent = (value / (timestamps.length - 1)) * 100;
      e.target.style.setProperty('--value', `${percent}%`);
    };

    // Add a new function to check if the race has ended
    const isRaceEnded = () => {
      return Date.now() / 1000 > END_TIMESTAMP;
    };

    return (
      <>
        <div className="relative space-y-6">
          {isInitializing ? (
            <LoadingWrapper>
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <div className="text-lg text-gray-300">Loading Derby Data...</div>
            </LoadingWrapper>
          ) : racers && racers.length > 0 && timestamps.length > 0 ? (
            <>
              {showRaceTrack && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">
                    Berachain Derby Dashboard
                  </h2>
                  <RaceTrack totalRacers={totalRacers}>
                    <ContentWrapper totalRacers={totalRacers}>
                      <RaceLanesContainer className="md:pl-[120px]">
                        {currentRacers.map((racer) => {
                          const sortedRacers = [...currentRacers].sort(
                            (a, b) => b.currentScore - a.currentScore
                          );
                          const rank = sortedRacers.findIndex(
                            (r) => r.tokenAddress === racer.tokenAddress
                          );

                          const isDead = DeadRacers.some(
                            (deadRacer) =>
                              deadRacer.racerAddress.toLowerCase() ===
                                racer.tokenAddress.toLowerCase() &&
                              timestamps[timeIndex] >= deadRacer.deadTime
                          );

                          const position = isDead
                            ? 0
                            : 85 - rank * (70 / (sortedRacers.length || 1));
                          return (
                            <RaceLane key={racer.tokenAddress}>
                              {!isDead && <RaceTrail position={position} />}
                              <Tooltip content={racer.tokenOnchainData?.symbol}>
                                <RacerIcon
                                  className="relative"
                                  position={position}
                                  isDead={isDead}
                                  isEndTime={
                                    timestamps[timeIndex] === END_TIMESTAMP
                                  }
                                >
                                  {timestamps[timeIndex] === END_TIMESTAMP &&
                                    rank < 3 && (
                                      <RankIndicator>
                                        {rank === 0
                                          ? '👑'
                                          : rank === 1
                                          ? '2'
                                          : '3'}
                                      </RankIndicator>
                                    )}
                                  <div className="relative">
                                    {racer.tokenOnchainData?.logoURI && (
                                      <div
                                        onClick={() =>
                                          !isDead &&
                                          !isRaceEnded() &&
                                          handleTokenClick(racer.tokenAddress)
                                        }
                                        className={`cursor-${
                                          isDead || isRaceEnded()
                                            ? 'default'
                                            : 'pointer'
                                        } transform transition-transform duration-200 ${
                                          !isDead &&
                                          !isRaceEnded() &&
                                          'hover:scale-110'
                                        }`}
                                      >
                                        <Image
                                          src={racer.tokenOnchainData?.logoURI}
                                          alt={
                                            racer.tokenOnchainData?.symbol || ''
                                          }
                                          width={100}
                                          height={100}
                                        />
                                        {isDead && (
                                          <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-red-500 text-6xl font-bold">
                                              X
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    <span className="absolute top-[50%] left-0 translate-x-[-100%] translate-y-[-50%] text-right text-white text-shadow">
                                      MCAP: $
                                      <LerpingValue
                                        value={
                                          racer.currentScore / Math.pow(10, 18)
                                        }
                                        formatter={formatMarketCap}
                                      />
                                    </span>
                                  </div>
                                </RacerIcon>
                              </Tooltip>
                            </RaceLane>
                          );
                        })}
                      </RaceLanesContainer>
                      <TimeSlider
                        ref={timeSliderRef}
                        type="range"
                        min={0}
                        max={timestamps.length - 1}
                        value={timeIndex}
                        onChange={handleTimeSliderChange}
                      />
                    </ContentWrapper>
                  </RaceTrack>
                </div>
              )}

              {showTable && (
                <div className="border border-[#5C5C5C] rounded-2xl overflow-hidden overflow-x-auto w-full">
                  <table className="w-full">
                    <thead className="bg-[#323232] text-white">
                      <tr>
                        <th className="py-2 px-2 sm:px-4 text-left text-sm sm:text-base font-medium w-[10%]">
                          Rank
                        </th>
                        <th className="py-2 px-2 sm:px-4 text-left text-sm sm:text-base font-medium w-[30%]">
                          Token
                        </th>
                        <th className="py-2 px-2 sm:px-4 text-right text-sm sm:text-base font-medium w-[25%]">
                          Market Cap
                        </th>
                        <th className="py-2 px-2 sm:px-4 text-right text-sm sm:text-base font-medium w-[15%]">
                          1h Change
                        </th>
                        <th className="py-2 px-2 sm:px-4 text-right text-sm sm:text-base font-medium w-[20%]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-white divide-y divide-[#5C5C5C]">
                      {getSortedRacers().map((racer, index) => (
                        <tr
                          key={racer.tokenAddress}
                          className="hover:bg-[#2a2a2a] transition-colors"
                        >
                          <td className="py-2 px-2 sm:px-4 text-sm sm:text-base whitespace-nowrap">
                            <span className="flex items-center gap-2">
                              {index === 0 ? `👑` : `${index + 1}.`}
                            </span>
                          </td>
                          <td className="py-2 px-2 sm:px-4 text-sm sm:text-base whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <Image
                                src={racer.tokenOnchainData?.logoURI}
                                alt={racer.tokenOnchainData?.symbol || ''}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {racer.tokenOnchainData?.symbol}
                                </span>
                                <span className="text-sm text-gray-400">
                                  {racer.tokenOnchainData?.name}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-2 px-2 sm:px-4 text-right text-sm sm:text-base whitespace-nowrap">
                            <AnimatedValue
                              changed={changedValues[racer.tokenAddress]}
                            >
                              <LerpingValue
                                value={racer.currentScore / Math.pow(10, 18)}
                                formatter={formatMarketCap}
                              />
                            </AnimatedValue>
                          </td>
                          <td className="py-2 px-2 sm:px-4 text-right text-sm sm:text-base whitespace-nowrap">
                            <span
                              className={
                                racer.hourlyChange >= 0
                                  ? 'text-green-500'
                                  : 'text-red-500'
                              }
                            >
                              {racer.hourlyChange.toFixed(2)}%
                            </span>
                          </td>
                          <td className="py-2 px-2 sm:px-4 text-right text-sm sm:text-base whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              {DeadRacers.some(
                                (deadRacer) =>
                                  deadRacer.racerAddress.toLowerCase() ===
                                  racer.tokenAddress.toLowerCase()
                              ) || isRaceEnded() ? (
                                <button
                                  disabled
                                  className="px-4 py-2 bg-gray-600 cursor-not-allowed rounded text-gray-400 font-medium opacity-50"
                                >
                                  {isRaceEnded() ? 'Race Ended' : 'Dead'}
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() =>
                                      handleTokenClick(racer.tokenAddress)
                                    }
                                    className="px-4 py-2 bg-[#FFCD4D] hover:bg-[#E5B735] rounded text-black font-medium transition-colors"
                                  >
                                    Swap
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleShowHolders(racer.tokenAddress)
                                    }
                                    className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded text-white transition-colors"
                                  >
                                    Holders
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleAddLP(racer.tokenAddress)
                                    }
                                    className="px-4 py-2 bg-[#FFCD4D] hover:bg-[#E5B735] rounded text-black font-medium transition-colors"
                                  >
                                    LP
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <LoadingWrapper>
              <div className="text-lg text-gray-300">
                No race data available
              </div>
            </LoadingWrapper>
          )}
        </div>
        {selectedRacer && holdersData && (
          <TopHoldersModal
            racer={selectedRacer}
            holders={holdersData}
            isOpen={isHoldersOpen}
            onClose={onHoldersClose}
          />
        )}
        {selectedTokenAddress && (
          <SwapModal
            tokenAddress={selectedTokenAddress}
            isOpen={isSwapOpen}
            onClose={onSwapClose}
          />
        )}
      </>
    );
  }
);

export default MemeHorseRace;
