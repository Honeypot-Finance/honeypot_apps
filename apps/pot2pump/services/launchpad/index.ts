import dayjs from 'dayjs';
import { wallet } from './../wallet';
import BigNumber from 'bignumber.js';
import { FtoPairContract } from '../contract/launches/fto/ftopair-contract';
import {
  AsyncState,
  OldIndexerPaginationState,
  PageInfo,
  PaginationState,
  ValueState,
} from './../utils';
import { trpc, trpcClient } from '@/lib/trpc';
import { createSiweMessage } from '@/lib/siwe';
import { Token } from './../contract/token';
import { parseEventLogs } from 'viem';
import { ERC20ABI } from '@/lib/abis/erc20';
import { MemePairContract } from './../contract/launches/pot2pump/memepair-contract';
import { PageRequest } from './../indexer/indexerTypes';
import { fetchPairsList } from '@/lib/algebra/graphql/clients/pair';
import { FilterState } from '@/constants/pot2pump.type';
import { simulateContract } from 'viem/actions';

export const PAGE_LIMIT = 9;

export type launchpadType = 'fto' | 'meme';

export enum ProjectStatus {
  All = 'all',
  Processing = 'processing',
  Success = 'success',
  Fail = 'fail',
}

export type PairFilter = {
  search: string;
  status: 'all' | 'processing' | 'success' | 'fail';
  showNotValidatedPairs: boolean;
  limit: number;
  tvlRange?: {
    min?: number;
    max?: number;
  };
  participantsRange?: {
    min?: number;
    max?: number;
  };
};

export type SubgraphProjectFilter = {
  status?: 'all' | 'processing' | 'success' | 'fail';
  search?: string;
  currentPage?: number;
  limit?: number;
  hasNextPage?: boolean;
  creator?: string;
  participant?: string;
  orderBy?: string;
  orderDirection?: string;
  userAccountId?: string;
} & FilterState;

export const defaultPairFilters: {
  all: PairFilter;
  myPairs: PairFilter;
  participatedPairs: PairFilter;
} = {
  all: {
    search: '',
    status: 'processing',
    showNotValidatedPairs: true,
    limit: PAGE_LIMIT,
  },
  myPairs: {
    search: '',
    status: 'all',
    showNotValidatedPairs: true,
    limit: PAGE_LIMIT,
  },
  participatedPairs: {
    search: '',
    status: 'all',
    showNotValidatedPairs: true,
    limit: PAGE_LIMIT,
  },
} as const;

export const statusTextToNumber = (status: string) => {
  switch (status) {
    case ProjectStatus.Processing:
      return 3;
    case ProjectStatus.Success:
      return 0;
    case ProjectStatus.Fail:
      return 1;
    default:
      return -1;
  }
};

function calculateTimeDifference(timestamp: number): string {
  if (timestamp.toString().length !== 13) {
    return 'Invaild';
  }
  const now = dayjs();
  const targetTime = dayjs(timestamp);

  const diffDays = now.diff(targetTime, 'days');

  if (Math.abs(diffDays) >= 1) {
    return `${diffDays} ${diffDays > 0 ? 'days later' : 'days ago'}`;
  }

  const diffHours = now.diff(targetTime, 'hours');

  if (Math.abs(diffHours) >= 1) {
    return `${diffHours} ${diffHours > 0 ? 'hours later' : 'hours ago'}`;
  }

  const diffMinutes = now.diff(targetTime, 'minutes');
  return `${diffMinutes} ${diffMinutes > 0 ? 'minutes later' : 'minutes ago'}`;
}

class LaunchPad {
  currentLaunchpadType = new ValueState<launchpadType>({
    value: 'meme',
  });

  projectsPage = new OldIndexerPaginationState<
    PairFilter,
    FtoPairContract | MemePairContract
  >({
    namespace: 'projectsPage',
    filter: defaultPairFilters.all,
    LoadNextPageFunction: async (
      filter: PairFilter,
      pageRequest: PageRequest
    ) => {
      if (!filter.showNotValidatedPairs) {
        return {
          items: await this.loadVerifiedProjects(),
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: '',
            endCursor: '',
          },
        };
      } else {
        if (this.currentLaunchpadType.value === 'meme') {
          return (await this.LoadMoreProjectPage(pageRequest)) as {
            items: MemePairContract[];
            pageInfo: PageInfo;
          };
        } else {
          return (await this.LoadMoreProjectPage(pageRequest)) as {
            items: FtoPairContract[];
            pageInfo: PageInfo;
          };
        }
      }
    },
  });

  myLaunches = new OldIndexerPaginationState<PairFilter, FtoPairContract>({
    filter: defaultPairFilters.myPairs,
    LoadNextPageFunction: async (filter, pageRequest) => {
      return (await this.LoadMoreMyProjectsPage(pageRequest)) as {
        items: FtoPairContract[];
        pageInfo: PageInfo;
      };
    },
  });

  participatedPairs = new OldIndexerPaginationState<
    PairFilter,
    MemePairContract
  >({
    filter: defaultPairFilters.participatedPairs,
    LoadNextPageFunction: async (filter, pageRequest) => {
      return (await this.LoadMoreParticipatedPage(pageRequest)) as {
        items: MemePairContract[];
        pageInfo: PageInfo;
      };
    },
  });

  set pairFilterSearch(search: string) {
    this.projectsPage.updateFilter({ search });
    this.myLaunches.updateFilter({ search });
    this.participatedPairs.updateFilter({ search });
  }

  set pairFilterStatus(status: 'all' | 'processing' | 'success' | 'fail') {
    this.projectsPage.updateFilter({ status });
    this.myLaunches.updateFilter({ status });
    this.participatedPairs.updateFilter({ status });
  }

  set showNotValidatedPairs(show: boolean) {
    this.projectsPage.updateFilter({ showNotValidatedPairs: show });
    this.myLaunches.updateFilter({ showNotValidatedPairs: show });
    this.participatedPairs.updateFilter({ showNotValidatedPairs: show });
  }

  get memeFactoryContract() {
    return wallet.contracts.memeFactory;
  }

  get memefacadeContract() {
    return wallet.contracts.memeFacade;
  }

  get ftofactoryContract() {
    return wallet.contracts.ftofactory;
  }

  get ftofacadeContract() {
    return wallet.contracts.ftofacade;
  }

  allPairsLength = async () =>
    await this.ftofactoryContract.allPairsLength.call();

  getPairAddress = async (index: bigint) =>
    await this.ftofactoryContract.allPairs.call([index]);

  async mostSuccessfulFtos(): Promise<FtoPairContract[]> {
    const mostSuccessfulFtos =
      await trpcClient.indexerFeedRouter.getMostSuccessfulFtos.query({
        chainId: String(wallet.currentChainId),
        limit: 5,
      });

    if (mostSuccessfulFtos.status === 'success') {
      return mostSuccessfulFtos.data?.pairs.map((pairAddress) => {
        const pair = new FtoPairContract({
          address: pairAddress.id,
        });

        const raisedToken = this.isRaiseToken(pairAddress.token1.id)
          ? Token.getToken({
              ...pairAddress.token1,
              address: pairAddress.token1.id,
            })
          : Token.getToken({
              address: pairAddress.token0.id,
            });

        const launchedToken =
          raisedToken.address.toLowerCase() ===
          pairAddress.token1.id.toLowerCase()
            ? Token.getToken({
                ...pairAddress.token0,
                address: pairAddress.token0.id,
              })
            : Token.getToken({
                ...pairAddress.token1,
                address: pairAddress.token1.id,
              });

        if (!pair.isInit) {
          pair.init({
            raisedToken: raisedToken,
            launchedToken: launchedToken,
            depositedLaunchedToken: pairAddress.depositedLaunchedToken,
            depositedRaisedToken: pairAddress.depositedRaisedToken,
            startTime: pairAddress.createdAt,
            endTime: pairAddress.endTime,
            ftoState: Number(pairAddress.status),
          });
        }

        return pair;
      });
    } else {
      return [];
    }
  }

  async trendingMEMEs(): Promise<MemePairContract[]> {
    const mostSuccessfulFtos =
      await trpcClient.indexerFeedRouter.getTrendingMEMEPairs.query();
    if (mostSuccessfulFtos.status === 'success') {
      return mostSuccessfulFtos.data?.pairs.items.map((pairAddress) => {
        const pair = MemePairContract.loadContract(pairAddress.id, {
          address: pairAddress.id,
        });

        const raisedToken = this.isRaiseToken(pairAddress.token1.id)
          ? Token.getToken({
              ...pairAddress.token1,
              address: pairAddress.token1.id,
            })
          : Token.getToken({
              address: pairAddress.token0.id,
            });

        const launchedToken =
          raisedToken.address.toLowerCase() ===
          pairAddress.token1.id.toLowerCase()
            ? Token.getToken({
                ...pairAddress.token0,
                address: pairAddress.token0.id,
              })
            : Token.getToken({
                ...pairAddress.token1,
                address: pairAddress.token1.id,
              });

        if (!pair.isInit) {
          pair.init({
            raisedToken: raisedToken,
            launchedToken: launchedToken,
            depositedLaunchedToken: pairAddress.depositedLaunchedToken,
            depositedRaisedToken: pairAddress.depositedRaisedToken,
            endTime: pairAddress.endTime,
            ftoState: Number(pairAddress.status),
          });
        }

        return pair;
      });
    } else {
      return [];
    }
  }

  loadVerifiedProjects = async () => {
    this.setFtoPageLoading(true);
    let projects = [];
    if (this.currentLaunchpadType.value === 'meme') {
      projects = await Promise.all(
        wallet.currentChain.validatedMemeAddresses.map(async (pairAddress) => {
          const pair = MemePairContract.loadContract(pairAddress, {
            address: pairAddress,
          });
          await pair.init();
          return pair;
        })
      );
    } else {
      projects = await Promise.all(
        wallet.currentChain.validatedFtoAddresses.map(async (pairAddress) => {
          const pair = new FtoPairContract({
            address: pairAddress,
          });
          await pair.init();
          return pair;
        })
      );
    }

    this.setFtoPageLoading(false);
    return projects;
  };

  LoadMoreProjectPage = async (pageRequest: PageRequest) => {
    let res;

    if (this.currentLaunchpadType.value === 'meme') {
      res = await fetchPairsList({
        filter: this.projectsPage.filter,
        pageRequest: pageRequest,
      });
    } else {
      res = await trpcClient.indexerFeedRouter.getFilteredFtoPairs.query({
        filter: this.projectsPage.filter,
        chainId: String(wallet.currentChainId),
        pageRequest: pageRequest,
        projectType: this.currentLaunchpadType.value,
      });
    }

    if (res.status === 'success') {
      const data = {
        items: res.data.pairs.map((pairAddress) => {
          const pair =
            this.currentLaunchpadType.value === 'fto'
              ? new FtoPairContract({
                  address: pairAddress.id,
                  participantsCount: new BigNumber(
                    pairAddress.participantsCount
                  ),
                })
              : MemePairContract.loadContract(pairAddress.id, {
                  address: pairAddress.id,
                  participantsCount: new BigNumber(
                    pairAddress.participantsCount
                  ),
                });

          const raisedToken = this.isRaiseToken(pairAddress.token1.id)
            ? Token.getToken({
                ...pairAddress.token1,
                address: pairAddress.token1.id,
                decimals: Number(pairAddress.token1.decimals),
              })
            : Token.getToken({
                address: pairAddress.token0.id,
              });

          const launchedToken =
            raisedToken.address.toLowerCase() ===
            pairAddress.token1.id.toLowerCase()
              ? Token.getToken({
                  ...pairAddress.token0,
                  address: pairAddress.token0.id,
                  decimals: Number(pairAddress.token0.decimals),
                })
              : Token.getToken({
                  ...pairAddress.token1,
                  address: pairAddress.token1.id,
                  decimals: Number(pairAddress.token1.decimals),
                });

          pair.init({
            raisedToken: raisedToken,
            launchedToken: launchedToken,
            depositedLaunchedToken: pairAddress.depositedLaunchedToken,
            depositedRaisedToken: pairAddress.depositedRaisedToken,
            startTime: pairAddress.createdAt,
            endTime: pairAddress.endTime,
            ftoState: Number(pairAddress.status),
          });

          return pair;
        }),
        pageInfo: res.data.pageInfo,
      };
      return data;
    } else {
      return {
        items: [],
        pageInfo: {
          hasNextPage: true,
          hasPreviousPage: false,
          startCursor: '',
          endCursor: '',
        },
      };
    }
  };

  LoadMoreParticipatedPage = async (pageRequest: PageRequest) => {
    const res =
      await trpcClient.indexerFeedRouter.getParticipatedProjects.query({
        filter: this.participatedPairs.filter,
        chainId: String(wallet.currentChainId),
        pageRequest: pageRequest,
        type: this.currentLaunchpadType.value,
        walletAddress: wallet.account,
      });

    if (res.status === 'success') {
      const data = {
        items: res.data.participateds.items.map((pairAddress) => {
          const pair =
            this.currentLaunchpadType.value === 'fto'
              ? new FtoPairContract({
                  address: pairAddress.pairId,
                  participantsCount: new BigNumber(
                    pairAddress.pair.participantsCount
                  ),
                })
              : MemePairContract.loadContract(pairAddress.pairId, {
                  address: pairAddress.pairId,
                  participantsCount: new BigNumber(
                    pairAddress.pair.participantsCount
                  ),
                });

          const raisedToken = this.isRaiseToken(pairAddress.pair.token1.id)
            ? Token.getToken({
                ...pairAddress.pair.token1,
                address: pairAddress.pair.token1.id,
              })
            : Token.getToken({
                address: pairAddress.pair.token0.id,
              });

          const launchedToken =
            raisedToken.address.toLowerCase() ===
            pairAddress.pair.token1.id.toLowerCase()
              ? Token.getToken({
                  ...pairAddress.pair.token0,
                  address: pairAddress.pair.token0.id,
                })
              : Token.getToken({
                  ...pairAddress.pair.token1,
                  address: pairAddress.pair.token1.id,
                });

          pair.init({
            raisedToken: raisedToken,
            launchedToken: launchedToken,
            depositedLaunchedToken: pairAddress.pair.depositedLaunchedToken,
            depositedRaisedToken: pairAddress.pair.depositedRaisedToken,
            startTime: pairAddress.pair.createdAt,
            endTime: pairAddress.pair.endTime,
            ftoState: Number(pairAddress.pair.status),
          });

          return pair;
        }),
        pageInfo: res.data.participateds.pageInfo,
      };
      return data;
    } else {
      return {
        items: [],
        pageInfo: {
          hasNextPage: true,
          hasPreviousPage: false,
          startCursor: '',
          endCursor: '',
        },
      };
    }
  };

  LoadMoreMyProjectsPage = async (pageRequest: PageRequest) => {
    const res = await trpcClient.indexerFeedRouter.getFilteredFtoPairs.query({
      filter: this.myLaunches.filter,
      chainId: String(wallet.currentChainId),
      provider: wallet.account,
      projectType: this.currentLaunchpadType.value,
      pageRequest: pageRequest,
    });

    if (res.status === 'success') {
      const data = {
        items: res.data.pairs.map((pairAddress) => {
          const pair =
            this.currentLaunchpadType.value === 'fto'
              ? new FtoPairContract({
                  address: pairAddress.id,
                  participantsCount: new BigNumber(
                    pairAddress.participantsCount
                  ),
                })
              : MemePairContract.loadContract(pairAddress.id, {
                  address: pairAddress.id,
                  participantsCount: new BigNumber(
                    pairAddress.participantsCount
                  ),
                });

          const raisedToken = this.isRaiseToken(pairAddress.token1.id)
            ? Token.getToken({
                ...pairAddress.token1,
                address: pairAddress.token1.id,
              })
            : Token.getToken({
                address: pairAddress.token0.id,
              });

          const launchedToken =
            raisedToken.address.toLowerCase() ===
            pairAddress.token1.id.toLowerCase()
              ? Token.getToken({
                  ...pairAddress.token0,
                  address: pairAddress.token0.id,
                })
              : Token.getToken({
                  ...pairAddress.token1,
                  address: pairAddress.token1.id,
                });

          pair.init({
            raisedToken: raisedToken,
            launchedToken: launchedToken,
            depositedLaunchedToken: pairAddress.depositedLaunchedToken,
            depositedRaisedToken: pairAddress.depositedRaisedToken,
            startTime: pairAddress.createdAt,
            endTime: pairAddress.endTime,
            ftoState: Number(pairAddress.status),
          });

          return pair;
        }),
        pageInfo: res.data.pageInfo,
      };
      return data;
    } else {
      return {
        items: [],
        pageInfo: {
          hasNextPage: true,
          hasPreviousPage: false,
          startCursor: '',
          endCursor: '',
        },
      };
    }
  };

  createLaunchProject = new AsyncState<({}: any) => Promise<string>>(
    async ({
      launchType,
      provider,
      raisedToken,
      tokenName,
      tokenSymbol,
      tokenAmount,
      poolHandler,
      raisingCycle,
      description,
      twitter,
      website,
      telegram,
      logoUrl,
      bannerUrl,
    }: {
      launchType: 'fto' | 'meme';
      provider: string;
      raisedToken: string;
      tokenName: string;
      tokenSymbol: string;
      tokenAmount: number;
      poolHandler: string;
      raisingCycle: number;
      description: string;
      twitter: string;
      website: string;
      telegram: string;
      logoUrl: string;
      bannerUrl: string;
    }): Promise<string> => {
      const targetLaunchContractFunc = async () => {
        if (launchType === 'fto') {
          return this.ftofactoryContract.createFTO.call([
            provider as `0x${string}`,
            raisedToken as `0x${string}`,
            tokenName,
            tokenSymbol,
            BigInt(new BigNumber(tokenAmount).multipliedBy(1e18).toFixed()),
            wallet.currentChain.contracts.routerV3 as `0x${string}`,
            BigInt(raisingCycle),
          ]);
        } else {
          try {
            simulateContract(wallet.walletClient, {
              abi: this.memeFactoryContract.abi,
              address: wallet.currentChain.contracts
                .memeFactory as `0x${string}`,
              functionName: 'createPair',
              args: [
                {
                  raisedToken: raisedToken as `0x${string}`,
                  name: tokenName,
                  symbol: tokenSymbol,
                  swapHandler: wallet.currentChain.contracts
                    .routerV3 as `0x${string}`,
                },
              ],
            });
          } catch (e) {
            console.log('error', e);
          }

          return this.memeFactoryContract.createPair.call([
            {
              raisedToken: raisedToken as `0x${string}`,
              name: tokenName,
              symbol: tokenSymbol,
              swapHandler: wallet.currentChain.contracts
                .routerV3 as `0x${string}`,
            },
          ]);
        }
      };

      const res = await targetLaunchContractFunc();

      const logs = parseEventLogs({
        logs: res.logs,
        abi: ERC20ABI,
      });

      const getPairAddress = () => {
        if (launchType === 'fto') {
          return res.logs[res.logs.length - 1]?.address as string;
        } else {
          return (logs[0].args as any).to;
        }
      };

      const pairAddress = getPairAddress();

      // use random default project logo
      const ICON_COUNT = 5;
      const randomIcon = Math.floor(Math.random() * ICON_COUNT) + 1;

      const url = logoUrl || `/images/default-project-icons/${randomIcon}.png`;

      await trpcClient.projects.createProject.mutate({
        pair: pairAddress.toLowerCase(),
        chain_id: wallet.currentChainId,
        provider: provider,
        project_type: launchType,
        projectName: tokenName,
        project_logo: url,
        banner_url: bannerUrl,
        description,
        twitter,
        website,
        telegram,
      });

      return pairAddress as string;
    }
  );

  updateProject = new AsyncState(
    async (data: {
      pair: string;
      chain_id: number;
      twitter: string;
      telegram: string;
      website: string;
      description: string;
      projectName: string;
    }) => {
      console.log('updateProject wallet', wallet);
      await createSiweMessage(
        wallet.account,
        'Sign In With Honeypot',
        wallet.walletClient
      );

      await trpcClient.projects.createOrUpdateProjectInfo.mutate(data);
    }
  );

  updateProjectLogo = new AsyncState(
    async (data: { logo_url: string; pair: string; chain_id: number }) => {
      await createSiweMessage(
        wallet.account,
        'Sign In With Honeypot',
        wallet.walletClient
      );

      await trpcClient.projects.updateProjectLogo.mutate(data);
    }
  );

  updateProjectBanner = new AsyncState(
    async (data: { banner_url: string; pair: string; chain_id: number }) => {
      await createSiweMessage(
        wallet.account,
        'Sign In With Honeypot',
        wallet.walletClient
      );

      await trpcClient.projects.updateProjectBanner.mutate(data);
    }
  );

  isRaiseToken(tokenAddress: string): boolean {
    return wallet.currentChain.contracts.ftoTokens.some(
      (ftoToken) =>
        ftoToken.address?.toLowerCase() === tokenAddress.toLowerCase()
    );
  }

  setCurrentPageInfo = (pageInfo: PageInfo) => {
    this.projectsPage.pageInfo = pageInfo;
  };

  setFtoPageIsInit = (isInit: boolean) => {
    this.projectsPage.isInit = isInit;
  };

  setFtoPageLoading = (isLoading: boolean) => {
    this.projectsPage.isLoading = isLoading;
  };

  setCurrentLaunchpadType = (type: launchpadType) => {
    this.currentLaunchpadType.setValue(type);
  };
}

const launchpad = new LaunchPad();

export default launchpad;
