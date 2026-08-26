import { FtoPairContract } from '@/services/contract/launches/fto/ftopair-contract';
import { AsyncState, ValueState } from '@honeypot/shared';
import { wallet } from '@honeypot/shared/lib/wallet';
import { Input } from '@nextui-org/react';
import { Button } from '../button';
import { motion, Variants } from 'framer-motion';
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

const ANIMATION_DURATION = 100; //ms
const HP_BAR_URL = '/images/memewar/HP_BAR.png';

const JANI_FTO_ADDRESS = '0x2c504e661750e03aa9252c67e771dc059a521863';
const POTS_FTO_ADDRESS = '0x93f8beabd145a61067ef2fca38c4c9c31d47ab7e';
const BULLA_FTO_ADDRESS = '0xa8c0dda3dff715dd6093101c585d25addc5046c8';
const IVX_FTO_ADDRESS = '0xa9edde04fc958264b1d6ad6153cffe26b1c79411';

const JANI_LAUNCH_TOKEN_ADDRESS = '0x180f30908b7c92ff2d65609088ad17bf923b42dc';
const POTS_LAUNCH_TOKEN_ADDRESS = '0xfad73c80d67d3cb4a929d1c0faf33a820620ae41';
const BULLA_LAUNCH_TOKEN_ADDRESS = '0x5da73142f3c8d8d749db4459b2fcc9024fad024e';
const IVX_LAUNCH_TOKEN_ADDRESS = '0x2da7ec28dae827ea513da752bc161e55147b4d66';

const tHpotAddress = '0xfc5e3743E9FAC8BB60408797607352E24Db7d65E'.toLowerCase();

export interface Props {
  isEnd?: boolean;
}

export const MemeWarBanner = observer((props: Props) => {
  const GameScreen = useRef<HTMLDivElement>(null);
  const initPair = useCallback(async (address: string) => {
    const pair = new FtoPairContract({ address });
    await pair.init();
    pair.raiseToken?.init();
    pair.launchedToken?.init();
    return pair;
  }, []);

  const getSuccessScore = async (address: string) => {
    const poolPair = await liquidity.getPairByTokens(
      address.toLowerCase(),
      tHpotAddress.toLowerCase()
    );

    await poolPair?.init();
    await poolPair?.getReserves();

    console.log('poolPair', poolPair);

    const launchTokenReserve =
      poolPair?.token0.address.toLowerCase() === address.toLowerCase()
        ? poolPair?.reserves?.reserve0
        : poolPair?.reserves?.reserve1;
    const hpotReserve =
      poolPair?.token0.address.toLowerCase() === tHpotAddress.toLowerCase()
        ? poolPair?.reserves?.reserve0
        : poolPair?.reserves?.reserve1;
    const launchTokenAmount =
      poolPair?.token0.address.toLowerCase() === address.toLowerCase()
        ? await poolPair?.token0.getTotalSupply()
        : await poolPair?.token1.getTotalSupply();

    if (!launchTokenReserve || !hpotReserve || !launchTokenAmount) {
      return 0;
    }

    return (
      (hpotReserve.toNumber() / launchTokenReserve.toNumber()) *
      (launchTokenAmount.toNumber() / Math.pow(10, 18))
    );
  };

  const state = useLocalObservable(() => ({
    pairs: {
      JANI: {
        ADDRESS: JANI_FTO_ADDRESS,
        SUPPORT_AMOUNT: '',
        set_SUPPORT_AMOUNT: (amount: string) => {
          state.pairs.JANI.SUPPORT_AMOUNT = amount;
        },
        pair: new AsyncState(async () => initPair(JANI_FTO_ADDRESS)),
        successScore: new AsyncState(async () =>
          getSuccessScore(JANI_LAUNCH_TOKEN_ADDRESS)
        ),
        icon: '/images/memewar/JANI_ICON.png',
        finalScore: 16_883_055,
      },
      POT: {
        ADDRESS: POTS_FTO_ADDRESS,
        SUPPORT_AMOUNT: '',
        set_SUPPORT_AMOUNT: (amount: string) => {
          state.pairs.POT.SUPPORT_AMOUNT = amount;
        },
        pair: new AsyncState(async () => initPair(POTS_FTO_ADDRESS)),
        successScore: new AsyncState(async () =>
          getSuccessScore(POTS_LAUNCH_TOKEN_ADDRESS)
        ),
        icon: '/images/memewar/POT_ICON.png',

        finalScore: 85_906_400,
      },
      BULLA: {
        ADDRESS: BULLA_FTO_ADDRESS,
        SUPPORT_AMOUNT: '',
        set_SUPPORT_AMOUNT: (amount: string) => {
          state.pairs.BULLA.SUPPORT_AMOUNT = amount;
        },
        pair: new AsyncState(async () => initPair(BULLA_FTO_ADDRESS)),
        successScore: new AsyncState(async () =>
          getSuccessScore(BULLA_LAUNCH_TOKEN_ADDRESS)
        ),
        icon: '/images/memewar/BULLAS_ICON.png',
        finalScore: 28_600_103,
      },
      IVX: {
        ADDRESS: IVX_FTO_ADDRESS,
        SUPPORT_AMOUNT: '',
        set_SUPPORT_AMOUNT: (amount: string) => {
          state.pairs.IVX.SUPPORT_AMOUNT = amount;
        },
        pair: new AsyncState(async () => initPair(IVX_FTO_ADDRESS)),
        successScore: new AsyncState(async () =>
          getSuccessScore(IVX_LAUNCH_TOKEN_ADDRESS)
        ),
        icon: '/images/memewar/IVX_ICON.png',
        finalScore: 695_585,
      },
    },
    T_HPOT_TOKEN: new AsyncState(async () => {
      const token = await Token.getToken({
        chainId: wallet.currentChainId.toString(),
        address: tHpotAddress,
      });
      await token.init();
      return token;
    }),
  }));

  const [gameState, setGameState] = useState<{
    showPopBoard: boolean;
    popBoardRender: string;
    player1: {
      health: number;
      attack: number;
      animationVariants: Variants;
      currentAnimation: string;
      animationTimeOut: NodeJS.Timeout | undefined;
    };
    player2: {
      health: number;
      attack: number;
      animationVariants: Variants;
      currentAnimation: string;
      animationTimeOut: NodeJS.Timeout | undefined;
    };
  }>({
    showPopBoard: false,
    popBoardRender: 'Click on one of the characters to attack',
    player1: {
      health: 50,
      attack: 10,
      animationVariants: {
        idle: { x: 0, opacity: 1, y: 0 },
        attack: { x: `0px` },
        attackMiddle: { x: `0}px` },
        hit: { x: -10, y: 5, opacity: 0.8 },
        die: { x: 0, y: 100 },
      },
      currentAnimation: 'idle',
      animationTimeOut: undefined,
    },
    player2: {
      health: 50,
      attack: 10,
      animationVariants: {
        idle: { x: 0, opacity: 1, y: 0 },
        attack: { x: `-0px` },
        attackMiddle: { x: `-0px` },
        hit: { x: 10, y: 5, opacity: 0.8 },
        die: { x: 0, y: 100 },
      },
      currentAnimation: 'idle',
      animationTimeOut: undefined,
    },
  });

  useEffect(() => {
    if (!GameScreen.current) {
      return;
    }

    setGameState((prev) => {
      return {
        ...prev,
        player1: {
          ...prev.player1,
          animationVariants: {
            ...prev.player1.animationVariants,
            attack: { x: `${GameScreen.current!.clientWidth / 2}px` },
            attackMiddle: {
              x: `${GameScreen.current!.clientWidth / 4}px`,
            },
          },
        },
        player2: {
          ...prev.player2,
          animationVariants: {
            ...prev.player2.animationVariants,
            attack: { x: `-${GameScreen.current!.clientWidth / 2}px` },
            attackMiddle: {
              x: `-${GameScreen.current!.clientWidth / 4}px`,
            },
          },
        },
      };
    });
  }, [GameScreen.current?.clientWidth, GameScreen]);

  useEffect(() => {
    if (!wallet.isInit) {
      return;
    }

    Object.values(state.pairs).forEach((pair) => {
      pair.pair.call().then(() => {
        if (pair.pair.value?.state === 0) {
          pair.successScore.call();
        }
      });
    });

    state.T_HPOT_TOKEN.call();
  }, [wallet.isInit]);

  const showPopBoard = (text: string) => {
    setGameState({
      ...gameState,
      showPopBoard: true,
      popBoardRender: text,
    });
  };

  const hidePopBoard = () => {
    setGameState({
      ...gameState,
      showPopBoard: false,
      popBoardRender: '',
    });
  };

  const autoAttack = async (target: 'player1' | 'player2', count: number) => {
    let i = 0;
    const interval = setInterval(() => {
      if (i === count) {
        clearInterval(interval);
        return;
      }

      handleAttack(target);
      i++;
    }, 200);
  };

  const playAnimation = async (
    target: 'player1' | 'player2',
    animation: string
  ) => {
    if (target === 'player1') {
      gameState.player1.animationTimeOut &&
        clearTimeout(gameState.player1.animationTimeOut);

      setGameState((prev) => {
        return {
          ...prev,
          player1: {
            ...prev.player1,
            currentAnimation: animation,
            animationTimeOut: setTimeout(() => {
              setGameState({
                ...gameState,
                player1: {
                  ...gameState.player1,
                  currentAnimation: 'idle',
                },
              });
            }, ANIMATION_DURATION),
          },
        };
      });
    } else {
      gameState.player2.animationTimeOut &&
        clearTimeout(gameState.player2.animationTimeOut);

      setGameState((prev) => {
        return {
          ...prev,
          player2: {
            ...prev.player2,
            currentAnimation: animation,
            animationTimeOut: setTimeout(() => {
              setGameState({
                ...gameState,
                player2: {
                  ...gameState.player2,
                  currentAnimation: 'idle',
                },
              });
            }, ANIMATION_DURATION),
          },
        };
      });
    }
  };

  const handleAttackMiddle = () => {
    playAnimation('player1', 'attackMiddle');
    playAnimation('player2', 'attackMiddle');
  };

  const handleAttack = (target: 'player1' | 'player2') => {
    if (target === 'player1') {
      playAnimation('player1', 'hit');
      playAnimation('player2', 'attack');
    } else {
      playAnimation('player2', 'hit');
      playAnimation('player1', 'attack');
    }
  };

  return props.isEnd ? (
    <div className="w-full">
      {' '}
      <h2 className="w-full text-center text-xl md:text-5xl font-[MEMEH] mb-2">
        preparing for the next round <br /> will be back thoon!
      </h2>
      <div
        id="scoreboard"
        className="relative w-full h-full z-10 flex justify-between"
      >
        {Object.values(state.pairs).map((pair) => {
          return (
            pair.pair.value && (
              <div
                key={pair.pair.value?.address}
                className="flex flex-col items-center z-10"
              >
                <Link
                  href={`/launch-detail/${pair.pair.value?.launchedToken?.address}`}
                >
                  <Image
                    src={pair.icon}
                    alt=""
                    width={100}
                    height={100}
                    className="w-10 h-10 md:w-20 md:h-20 object-contain"
                  />
                </Link>
                <div className="relative flex justify-center items-center h-8">
                  <Image
                    src={HP_BAR_URL}
                    alt=""
                    width={200}
                    height={50}
                    className="w-full h-full object-contain"
                  />
                  <h3 className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-black">
                    {pair.finalScore.toLocaleString('en-US', {
                      style: 'decimal',
                      maximumFractionDigits: 0,
                    })}
                  </h3>
                </div>
              </div>
            )
          );
        })}
      </div>
    </div>
  ) : (
    <div className="lg:grid lg:grid-cols-[80%_20%] gap-2">
      <div ref={GameScreen}>
        <div className="flex justify-between text-center">
          <h2 className="w-full text-center text-xl md:text-5xl font-[MEMEH] mb-2">
            MEME WAR
          </h2>
        </div>

        <div className="relative grid grid-rows-[30%_1fr] w-full aspect-video">
          <Image
            src="/images/memewar/BG.png"
            className="absolute w-full h-full"
            alt=""
            width={1480}
            height={1480}
          />
          <div
            id="scoreboard"
            className="relative w-full h-full z-10 flex justify-between"
          >
            <Image
              src="/images/memewar/TOP_BANNER_V2.png"
              alt=""
              width={2000}
              height={500}
              className="absolute w-full h-full object-contain object-top top-0 z-0"
            />
            {Object.values(state.pairs).map((pair) => {
              return (
                pair.pair.value && (
                  <div
                    key={pair.pair.value?.address}
                    className="flex flex-col items-center z-10"
                  >
                    <Link
                      href={`/launch-detail/${pair.pair.value?.launchedToken?.address}`}
                    >
                      <Image
                        src={pair.icon}
                        alt=""
                        width={100}
                        height={100}
                        className="w-10 h-10 md:w-20 md:h-20 object-contain"
                      />
                    </Link>
                    <div className="relative flex justify-center items-center h-8">
                      <Image
                        src={HP_BAR_URL}
                        alt=""
                        width={200}
                        height={50}
                        className="w-full h-full object-contain"
                      />
                      <h3 className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-black">
                        {pair.pair.value.state != 0
                          ? pair.pair.value?.depositedRaisedToken?.toFixed(0) ||
                            'loading...'
                          : Math.max(
                              pair.successScore.value ?? 0,
                              pair.pair.value?.depositedRaisedToken?.toNumber() ??
                                0
                            ).toLocaleString('en-US', {
                              style: 'decimal',
                              maximumFractionDigits: 0,
                            })}
                      </h3>
                    </div>
                  </div>
                )
              );
            })}
          </div>
          <div className="relative grow h-full z-10">
            <motion.div
              initial="idle"
              variants={gameState.player1.animationVariants}
              animate={gameState.player1.currentAnimation}
              transition={{
                duration: ANIMATION_DURATION / 1000,
              }}
              onClick={() => handleAttack('player1')}
              className="absolute left-0 h-full bottom-0 w-[80px] sm:w-[150px] md:w-[200px] lg:w-[300px] cursor-pointer"
            >
              <Image
                src="/images/memewar/JANIS.png"
                alt=""
                width={300}
                height={300}
                className="absolute w-full h-full object-contain object-bottom"
              />
            </motion.div>

            <Image
              onClick={() => handleAttackMiddle()}
              src="/images/memewar/BULLAS.png"
              alt=""
              width={300}
              height={300}
              className="absolute w-[80px] sm:w-[150px] md:w-[200px] lg:w-[300px] h-full object-contain object-bottom left-[50%] translate-x-[-50%] cursor-pointer"
            />

            <motion.div
              initial="idle"
              variants={gameState.player2.animationVariants}
              animate={gameState.player2.currentAnimation}
              transition={{
                duration: ANIMATION_DURATION / 1000,
              }}
              onClick={() => handleAttack('player2')}
              className="absolute w-[80px] h-full sm:w-[150px] md:w-[200px] lg:w-[300px] bottom-0 right-0 cursor-pointer"
            >
              <Image
                src="/images/memewar/POTS.png"
                alt=""
                width={300}
                height={300}
                className="absolute w-full h-full object-contain object-bottom"
              />
            </motion.div>
          </div>
          {gameState.showPopBoard && (
            <div className=" absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[50%] text-white z-50">
              {gameState.popBoardRender}
            </div>
          )}
        </div>
        <div className="text-center">
          your tHpot balance:{' '}
          {amountFormatted(state.T_HPOT_TOKEN.value?.balance, {
            fixed: 2,
            decimals: 0,
            symbol: ' tHPOT',
          }) || 'loading...'}
        </div>
        <div className="grid md:grid-cols-2 mt-1 gap-5">
          {
            //render all pairs
            Object.entries(state.pairs).map(([key, value]) => {
              return (
                <div key={key}>
                  <h3>{key}</h3>
                  <div className="flex justify-center items-center gap-2">
                    <Button
                      isDisabled={
                        value.SUPPORT_AMOUNT == '' ||
                        Number(value.SUPPORT_AMOUNT) <= 0
                      }
                      onClick={async () => {
                        if (value.pair.value?.state === 3) {
                          value.pair.value?.deposit
                            .call({
                              amount: value.SUPPORT_AMOUNT,
                            })
                            .then(async () => {
                              await value.pair.value?.raiseToken?.getBalance();
                              value.pair.value?.getDepositedRaisedToken();
                              handleAttackMiddle();
                            });
                        } else {
                          swap.setFromToken(state.T_HPOT_TOKEN.value!);
                          swap.setToToken(value.pair.value?.launchedToken!);
                          swap.setFromAmount(value.SUPPORT_AMOUNT);

                          await new Promise((resolve) => {
                            setTimeout(() => {
                              resolve(undefined);
                            }, 1000);
                          });

                          swap.swapExactTokensForTokens
                            .call()
                            .then(async () => {
                              await value.pair.value?.raiseToken?.getBalance();
                              value.pair.value?.getDepositedRaisedToken();
                              handleAttackMiddle();
                            });
                        }

                        //attack 3 times
                        handleAttackMiddle();
                      }}
                    >
                      Support {key}
                    </Button>
                    <Input
                      placeholder="Amount"
                      onChange={(e) => value.set_SUPPORT_AMOUNT(e.target.value)}
                    />
                  </div>
                </div>
              );
            })
          }
          <div className=" relative w-full flex justify-around items-center col-span-2 h-[200px] border-4 border-black rounded-[1rem] overflow-hidden">
            <Image
              src="/images/memewar/janivspot.webp"
              alt=""
              width={300}
              height={300}
              className="w-full h-full object-cover object-top absolute brightness-50"
            />
            <h3 className="z-10 text-3xl">Complete quest to earn prize</h3>
            <Link
              href={'https://www.cubquests.com/quests/jani-vs-pot'}
              target="_blank"
            >
              <Button className="z-10">Explore</Button>
            </Link>
          </div>
        </div>
      </div>
      <DiscussionArea pairDatabaseId={-9999} isSide />
    </div>
  );
});

export default MemeWarBanner;
