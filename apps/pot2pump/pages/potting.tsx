import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { observer } from 'mobx-react-lite';
import { wallet } from '@honeypot/shared/lib/wallet';
import { Tab, Tabs } from '@nextui-org/react';
import { NextLayoutPage } from '@/types/nextjs';
import { useCallback, useEffect, useState } from 'react';
import { LaunchCardV3 } from '@/components/LaunchCard/v3';
import { FaCrown } from 'react-icons/fa';
import Pagination from '@/components/Pagination/Pagination';
import launchpad, {
  defaultPairFilters,
  PAGE_LIMIT,
} from '@/services/launchpad';
import { Filter } from '@/components/pot2pump/FilterModal';
import { MemePairContract } from '@/services/contract/launches/pot2pump/memepair-contract';
import { defaultContainerVariants, itemPopUpVariants } from '@/lib/animation';
import { Pot2PumpPottingService } from '@/services/launchpad/pot2pump/potting';
import { Pot2PumpService } from '@/services/launchpad/pot2pump';
import { WrappedNextInputSearchBar } from '@/components/wrappedNextUI/SearchBar/WrappedInputSearchBar';
import { FilterState } from '@/constants/pot2pump.type';
import { defaultFilterState } from '@/constants/pot2pump';
import { hasValue, removeEmptyFields } from '@/lib/utils';
import { Address } from 'viem';
import {
  canClaimPot2Pump,
  canRefundPot2Pump,
} from '@/lib/algebra/graphql/clients/pot2pump';
import { Button } from '@/components/button/v3';
import { cn } from '@/lib/utils';

const MemeLaunchPage: NextLayoutPage = observer(() => {
  const [pottingProjects, setPottingProjects] =
    useState<Pot2PumpPottingService>();
  const [myProjects, setMyProjects] = useState<Pot2PumpService>();
  const [mostSuccessProjects, setMostSuccessProjects] = useState<
    MemePairContract[] | null
  >(null);
  const [filters, setFilters] = useState<FilterState>(defaultFilterState);
  const [search, setSearch] = useState('');
  const [canClaimPot2PumpList, setCanClaimPot2PumpList] = useState<
    MemePairContract[]
  >([]);
  const [canRefundPot2PumpList, setCanRefundPot2PumpList] = useState<
    MemePairContract[]
  >([]);

  const updateMostSuccessProjects = useCallback(() => {
    mostSuccessProjects?.forEach((pair) => {
      pair.getDepositedRaisedToken();
    });
  }, [mostSuccessProjects]);

  useEffect(() => {
    const updateInterval = setInterval(() => {
      updateMostSuccessProjects();
    }, 2000);
    return () => clearInterval(updateInterval);
  }, [updateMostSuccessProjects]);

  useEffect(() => {
    if (!wallet.isInit) {
      return;
    }
    const newProjects = new Pot2PumpPottingService();
    setPottingProjects(newProjects);
    newProjects.projectsPage.reloadPage();
  }, [wallet.isInit]);

  useEffect(() => {
    console.log('pottingProjects', pottingProjects);
    if (pottingProjects) {
      console.log('hasValue(filters)', hasValue(filters), filters);
      if (hasValue(filters)) {
        pottingProjects.projectsPage.updateFilter({
          search: search.length > 0 ? search : undefined,
          currentPage: 0,
          limit: PAGE_LIMIT,
          hasNextPage: true,
          ...removeEmptyFields(filters),
        });
      } else {
        pottingProjects.projectsPage.updateFilter({
          search: search.length > 0 ? search : undefined,
          currentPage: 0,
          limit: PAGE_LIMIT,
          hasNextPage: true,
          ...defaultFilterState,
        });
      }
    }
  }, [filters, pottingProjects, search]);

  const onChangeFilter = (data: any) => {
    console.log('onChangeFilter', data);
    setSearch('');
    setFilters(data);
  };

  const initPot2Pumps = () => {
    const newPumpingProjects = new Pot2PumpService();
    setMyProjects(newPumpingProjects);
    newPumpingProjects.myLaunches.reloadPage();
    newPumpingProjects.participatedPairs.reloadPage();
    canClaimPot2Pump(wallet.account).then((res) => {
      setCanClaimPot2PumpList(res);
    });
    canRefundPot2Pump(wallet.account).then((res) => {
      setCanRefundPot2PumpList(res);
    });
  };

  useEffect(() => {
    if (!wallet.isInit) {
      return;
    }
    initPot2Pumps();
  }, [wallet.isInit]);

  return (
    <div className="w-full grow flex flex-col font-gliker">
      <div className="px-2 md:px-6 w-full xl:max-w-[1200px] mx-auto flex flex-col sm:gap-y-4">
        {mostSuccessProjects && mostSuccessProjects.length > 0 && (
          <div className="flex flex-col">
            <div className="relative flex flex-row items-end justify-between">
              <Image
                src={'/images/pumping/lying-bear.png'}
                width={150}
                height={0}
                alt="lying bear"
                className="w-20 sm:w-[150px]"
              />
              <Image
                src={'/images/pumping/Trading.png'}
                width={180}
                height={0}
                alt="Trading"
                className="mb-4 sm:mb-8 absolute left-1/2 transform -translate-x-1/2 w-40 sm:w-[180px]"
              />
              <Image
                src={'/images/pumping/victory-bear.png'}
                width={240}
                height={0}
                alt="victory bear"
                className="w-24 sm:w-60"
              />
            </div>
            <div className="border-3 border-[#FFCD4D] bg-[#FFCD4D] rounded-3xl overflow-hidden">
              <div className="bg-[url('/images/pumping/outline-border.png')] bg-top h-16"></div>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={defaultContainerVariants}
                className="w-full flex flex-col lg:flex-row gap-2 flex-grow-[1] p-8"
              >
                {mostSuccessProjects.map((pair: MemePairContract, idx) => (
                  <motion.div
                    variants={itemPopUpVariants}
                    key={pair.address}
                    className={
                      'relative flex-1 ' + (idx !== 0 && 'hidden lg:block')
                    }
                  >
                    <motion.div
                      className="absolute top-0 left-0 z-10"
                      initial={{
                        rotate: 0,
                      }}
                      whileHover={{
                        rotate: [0, -10, 10, -10, 10, -10, 10, -10, 10, 0],
                      }}
                      transition={{
                        times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8],
                        duration: 1,
                      }}
                    >
                      {idx === 0 && (
                        <FaCrown className="absolute top-0 left-2 rotate-[-30deg] translate-x-[-50%] translate-y-[-100%] scale-[300%] md:scale-[300%] fill-yellow-300" />
                      )}
                      {idx === 1 && (
                        <FaCrown className="absolute top-0 left-1 rotate-[-30deg] translate-x-[-50%] translate-y-[-100%] md:scale-[200%] fill-gray-300" />
                      )}
                      {idx === 2 && (
                        <FaCrown className="absolute top-0 left-0 rotate-[-30deg] translate-x-[-30%] translate-y-[-50%] md:scale-[100%] fill-amber-800" />
                      )}
                    </motion.div>
                    <LaunchCardV3
                      pair={pair}
                      action={<></>}
                      type="trending"
                      className="p-0"
                    />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        )}

        <div className="w-full relative space-y-4">
          <div className="py-2 sm:py-0 sm:absolute right-0 top-20">
            <div className="flex gap-2 justify-end">
              <Button>
                <Link
                  href="/launch-token?launchType=meme"
                  className="text-black font-bold"
                >
                  Launch Token
                </Link>
              </Button>

              {canClaimPot2PumpList?.length > 0 && (
                <Button
                  onPress={() => {
                    wallet.contracts.memeFacade.claimAllUserLP
                      .call(
                        [
                          wallet.account as Address,
                          canClaimPot2PumpList.map(
                            (pair) => pair.launchedToken?.address as Address
                          ),
                        ],
                        {
                          gas: BigInt(10000000),
                        }
                      )
                      .then(() => {
                        initPot2Pumps();
                      });
                  }}
                  disabled={!wallet.account}
                >
                  Claim All
                </Button>
              )}
              {canRefundPot2PumpList.length > 0 && (
                <Button
                  onPress={() => {
                    wallet.contracts.memeFacade.refundAllUserToken
                      .call(
                        [
                          wallet.account as Address,
                          canRefundPot2PumpList.map(
                            (pair) => pair.launchedToken?.address as Address
                          ),
                        ],
                        {
                          gas: BigInt(10000000),
                        }
                      )
                      .then(() => {
                        initPot2Pumps();
                      });
                  }}
                  disabled={!wallet.account}
                >
                  Refund All
                </Button>
              )}
              <Filter
                filtersList={[
                  {
                    key: 2,
                    label: 'Participants Count',
                    category: 'participants',
                  },
                  {
                    key: 3,
                    label: 'Pumping Percentage',
                    category: 'depositraisedtokenpercentage',
                  },
                  {
                    key: 4,
                    label: 'Token',
                    category: 'raiseToken',
                  },
                ]}
                filters={filters}
                setFilters={onChangeFilter}
                pumpingProjects={pottingProjects}
              />
            </div>
          </div>

          <div
            id="filter"
            className="flex flex-col sm:flex-row items-center gap-2 my-4 sm:my-0"
          >
            <WrappedNextInputSearchBar
              className="border border-[#FFCD4D] shadow-[1px_2px_0px_0px_#9B7D2F] placeholder:text-xs"
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
          </div>

          <Tabs
            aria-label="Options"
            classNames={{
              tabList: 'bg-transparent',
              tabContent: 'text-xs sm:text-base p-0 sm:p-2',
              tab: cn(
                'rounded-md sm:rounded-lg',
                'border-0 backdrop-blur-[100px]',
                'flex flex-col items-center gap-1 sm:gap-2.5'
              ),
            }}
            className="next-tab"
          >
            <Tab key="all" title="All MEMEs">
              {pottingProjects && (
                <Pagination
                  paginationState={pottingProjects.projectsPage}
                  render={(pair) => (
                    <LaunchCardV3
                      pair={pair}
                      action={<></>}
                      key={pair.address}
                      type="simple"
                    />
                  )}
                  classNames={{
                    itemsContainer:
                      'grid gap-8 grid-cols-1 md:grid-cols-2 xl:gap-6 xl:grid-cols-3',
                  }}
                />
              )}
            </Tab>
            {wallet.isInit && (
              <>
                <Tab key="my" title="My MEMEs">
                  {myProjects && (
                    <Pagination
                      paginationState={myProjects.myLaunches}
                      render={(project) => (
                        <LaunchCardV3
                          key={project.address}
                          pair={project}
                          action={<></>}
                          type="simple"
                        />
                      )}
                      classNames={{
                        itemsContainer:
                          'grid gap-8 grid-cols-1 md:grid-cols-2 xl:gap-6 xl:grid-cols-3',
                      }}
                    />
                  )}
                </Tab>
                <Tab key="participated-launch" title="Participated MEMEs">
                  {myProjects && (
                    <Pagination
                      paginationState={myProjects.participatedPairs}
                      render={(project) => (
                        <LaunchCardV3
                          key={project.address}
                          pair={project}
                          action={<></>}
                          type="simple"
                        />
                      )}
                      classNames={{
                        itemsContainer:
                          'grid gap-8 grid-cols-1 md:grid-cols-2 xl:gap-6 xl:grid-cols-3',
                      }}
                    />
                  )}
                </Tab>
              </>
            )}
            {/* <Tab href="/launch" title="To Fto projects->" /> */}
            {/* <Tab
              href="https://bartio.bonds.yeetit.xyz/"
              target="_blank"
              title={
                <div className="flex items-center text-yellow-400">
                  <Image
                    className="size-4"
                    src="/images/partners/yeet_icon.png"
                    alt=""
                    width={100}
                    height={100}
                  />
                  <span className="flex items-center justify-center gap-2">
                    Try Yeet Bond <FaExternalLinkAlt className="inline-block" />
                  </span>
                </div>
              }
            /> */}
            {/* <Tab
              title={
                <Link
                  href="/memewar"
                  className="flex items-center text-rose-600"
                >
                  <span className="flex items-center justify-center gap-2">
                    Meme War ⚔️
                  </span>
                </Link>
              }
            /> */}
          </Tabs>
        </div>
      </div>
    </div>
  );
});

export default MemeLaunchPage;
