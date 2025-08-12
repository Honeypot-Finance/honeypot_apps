import dayjs from 'dayjs';
import { wallet } from '@honeypot/shared/lib/wallet';
import BigNumber from 'bignumber.js';
import { FtoPairContract } from '../contract/launches/fto/ftopair-contract';
import {
  AsyncState,
  OldIndexerPaginationState,
  PageInfo,
  PaginationState,
  ValueState,
} from '@honeypot/shared';
import { trpc, trpcClient } from '@/lib/trpc';
import { createSiweMessage } from '@/lib/siwe';
import { Token } from '@honeypot/shared';
import { parseEventLogs } from 'viem';
import { ERC20ABI } from '@/lib/abis/erc20';
import { MemePairContract } from './../contract/launches/pot2pump/memepair-contract';
import { PageRequest } from './../indexer/indexerTypes';
import { fetchPairsList } from '@/lib/algebra/graphql/clients/pair';
import { FilterState } from '@/constants/pot2pump.type';

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
      // First simulate the transaction to check for errors
      const simulateTransaction = async () => {
        try {
          console.log('Simulating transaction with params:', {
            launchType,
            provider,
            raisedToken,
            tokenName,
            tokenSymbol,
            tokenAmount,
            poolHandler,
            raisingCycle,
          });

          if (launchType === 'fto') {
            // Use the contract's simulate method directly from viem
            const simulateResult = await this.ftofactoryContract.contract.simulate.createFTO([
              provider as `0x${string}`,
              raisedToken as `0x${string}`,
              tokenName,
              tokenSymbol,
              BigInt(new BigNumber(tokenAmount).multipliedBy(1e18).toFixed()),
              wallet.currentChain.contracts.algebraSwapRouter as `0x${string}`,
              BigInt(raisingCycle),
            ], {
              account: wallet.account as `0x${string}`,
            });
            console.log('FTO simulation successful:', simulateResult);
          } else {
            // Use the contract's simulate method directly from viem
            const simulateResult = await this.memeFactoryContract.contract.simulate.createPair([
              {
                raisedToken: raisedToken as `0x${string}`,
                name: tokenName,
                symbol: tokenSymbol,
                swapHandler: wallet.currentChain.contracts
                  .algebraPositionManager as `0x${string}`,
              },
            ], {
              account: wallet.account as `0x${string}`,
            });
            console.log('Meme pair simulation successful:', simulateResult);
          }
        } catch (error) {
          console.error('Transaction simulation failed:', error);
          console.error('Error details:', {
            message: (error as any)?.message,
            cause: (error as any)?.cause,
            data: (error as any)?.data,
            shortMessage: (error as any)?.shortMessage,
            details: (error as any)?.details,
            args: (error as any)?.args,
            functionName: (error as any)?.functionName,
            contractAddress: (error as any)?.contractAddress,
          });
          
          // Provide more detailed error message
          const errorMessage = (error as any)?.shortMessage || 
                              (error as any)?.message || 
                              'Transaction simulation failed. Please check your inputs and try again.';
          
          throw new Error(`Transaction simulation failed: ${errorMessage}`);
        }
      };

      // Simulate first
      await simulateTransaction();

      // If simulation succeeds, execute the actual transaction
      const targetLaunchContractFunc = async () => {
        console.log('Executing actual transaction after successful simulation');
        if (launchType === 'fto') {
          return this.ftofactoryContract.createFTO.call([
            provider as `0x${string}`,
            raisedToken as `0x${string}`,
            tokenName,
            tokenSymbol,
            BigInt(new BigNumber(tokenAmount).multipliedBy(1e18).toFixed()),
            wallet.currentChain.contracts.algebraSwapRouter as `0x${string}`,
            BigInt(raisingCycle),
          ]);
        } else {
          return this.memeFactoryContract.createPair.call([
            {
              raisedToken: raisedToken as `0x${string}`,
              name: tokenName,
              symbol: tokenSymbol,
              swapHandler: wallet.currentChain.contracts
                .algebraPositionManager as `0x${string}`,
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
    return wallet.currentChain.raisedTokenData.some(
      (ftoToken) =>
        ftoToken.address?.toLowerCase() === tokenAddress.toLowerCase()
    );
  }

  setCurrentLaunchpadType = (type: launchpadType) => {
    this.currentLaunchpadType.setValue(type);
  };
}

const launchpad = new LaunchPad();

export default launchpad;
