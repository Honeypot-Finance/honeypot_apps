import { wallet } from '@honeypot/shared/lib/wallet';

import { Token } from '@honeypot/shared';
import { PairContract } from '@/services/contract/dex/liquidity/pair-contract';
import BigNumber from 'bignumber.js';
import { trpcClient } from '@/lib/trpc';
import { makeAutoObservable, reaction, toJS, when } from 'mobx';
import {
  AsyncState,
  IndexerPaginationState,
  OldIndexerPaginationState,
  StorageState,
  ValueState,
} from '@honeypot/shared';
import { add, debounce, forEach } from 'lodash';
import dayjs from 'dayjs';
import { PageRequest, PairFilter } from './indexer/indexerTypes';
import { Address, zeroAddress } from 'viem';
import { bgtRegistry } from '@/services/contract/bgt-registry';

class Liquidity {
  pairPage = new OldIndexerPaginationState<PairFilter, PairContract>({
    LoadNextPageFunction: async (
      filter: PairFilter,
      pageRequest: PageRequest
    ) => {
      const pairs = await trpcClient.indexerFeedRouter.getFilteredPairs.query({
        filter: filter,
        chainId: String(wallet.currentChainId),
        pageRequest: pageRequest,
      });

      if (pairs.status === 'success') {
        const pariContracts = pairs.data.pairs.map((pair) => {
          const token0 = Token.getToken({
            chainId: wallet.currentChainId.toString(),
            ...pair.token0,
            address: pair.token0.id,
          });
          const token1 = Token.getToken({
            chainId: wallet.currentChainId.toString(),
            ...pair.token1,
            address: pair.token1.id,
          });

          const pairContract = new PairContract({
            token0,
            token1,
            address: pair.id,
            trackedReserveETH: new BigNumber(pair.trackedReserveETH),
            tradingVolumeYesterday: pair.tradingVolumeYesterday,
          });

          if (!this.tokensMap[token0.address]) {
            this.tokensMap[token0.address] = token0;

            token0.init();
          }
          if (!this.tokensMap[token1.address]) {
            this.tokensMap[token1.address] = token1;

            token1.init();
          }
          this.pairsByToken[`${token0.address}-${token1.address}`] =
            pairContract;
          pairContract.init();
          return pairContract;
        });

        return {
          items: pariContracts,
          pageInfo: pairs.data.pageInfo,
        };
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
    },
    filter: {
      searchString: '',
      limit: 10,
      sortingTarget: 'trackedReserveETH',
      sortingDirection: 'desc',
    },
  });

  myPairPage = new OldIndexerPaginationState<PairFilter, PairContract>({
    LoadNextPageFunction: async (filter, pageRequest: PageRequest) => {
      const pairs = await trpcClient.indexerFeedRouter.getHoldingsPairs.query({
        walletAddress: wallet.account,
        chainId: String(wallet.currentChainId),
        filter: filter,
        pageRequest: pageRequest,
      });

      if (pairs.status === 'success') {
        const pariContracts = pairs.data.holdingPairs.map((pair) => {
          const token0 = Token.getToken({
            chainId: wallet.currentChainId.toString(),
            address: pair.pair.token0Id,
            name: pair.pair.token0name,
            symbol: pair.pair.token0symbol,
            derivedETH: pair.pair.token0.derivedETH,
            derivedUSD: pair.pair.token1.derivedUSD,
          });

          const token1 = Token.getToken({
            chainId: wallet.currentChainId.toString(),
            address: pair.pair.token1Id,
            name: pair.pair.token1name,
            symbol: pair.pair.token1symbol,
            derivedETH: pair.pair.token1.derivedETH,
            derivedUSD: pair.pair.token1.derivedUSD,
          });

          const pairContract = new PairContract({
            address: pair.pairId,
            trackedReserveETH: new BigNumber(pair.pair.trackedReserveETH),
            tradingVolumeYesterday: pair.pair.tradingVolumeYesterday,
            token0,
            token1,
          });

          if (!this.tokensMap[token0.address]) {
            this.tokensMap[token0.address] = token0;

            token0.init();
          }

          if (!this.tokensMap[token1.address]) {
            this.tokensMap[token1.address] = token1;

            token1.init();
          }

          this.pairsByToken[`${token0.address}-${token1.address}`] =
            pairContract;

          pairContract.init();

          return pairContract;
        });

        return {
          items: pariContracts,
          pageInfo: pairs.data.pageInfo,
        };
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
    },
    filter: {
      searchString: '',
      limit: 10,
      sortingTarget: 'trackedReserveETH',
      sortingDirection: 'desc',
    },
  });

  pairs: PairContract[] = [];
  pairsByToken: Record<string, PairContract> = {};
  tokensMap: Record<string, Token> = {};
  bundlePrice = 0;
  slippage = 10;
  balanced = true;

  // localTokensMap = new StorageState<Record<string, Token>>({
  //   key: "localTokens_v2",
  //   value: {} as Record<string, Token>,
  //   serialize: (value) => {
  //     const val = value
  //       ? Object.values(value).reduce((acc, token) => {
  //           acc[token.address.toLowerCase()] = token.serialize();
  //           return acc;
  //         }, {} as Record<string, Pick<Token, "address" | "name" | "symbol" | "decimals">>)
  //       : null;
  //     return val;
  //   },
  //   deserialize: (
  //     value: Record<
  //       string,
  //       Pick<Token, "address" | "name" | "symbol" | "decimals">
  //     >
  //   ) => {
  //     const res = Object.values(value).reduce((acc, t) => {
  //       const token = Token.getToken({
  //         ...t,
  //       })
  //       console.log('token', token)
  //       token.priority = 3;
  //       acc[token.address] = token;
  //       return acc;
  //     }, {} as Record<string, Token>);
  //     console.log("deserialize", res);
  //     return res;
  //   },
  //   transform(value: Token) {
  //     this.value![value.address] = value;
  //     return {
  //       ...this.value,
  //     };
  //   },
  // });

  get tokens() {
    const tokensMap = {
      ...wallet.currentChain.validatedTokensInfo,
    };
    const tokens = Object.values(tokensMap);
    if (wallet.currentChain?.nativeToken) {
      tokens.push(wallet.currentChain.nativeToken);
    }
    const sortedTokens = tokens.sort((a, b) => {
      const diff = b.priority - a.priority;
      if (diff === 0) {
        return a.logoURI ? -1 : b.logoURI ? 1 : 0;
      }
      return diff;
    });
    return sortedTokens;
  }

  fromToken: Token | null = null;
  toToken: Token | null = null;
  fromAmount = '';
  toAmount = '';
  deadline = 0;
  isInit = false;

  currentRemovePair: PairContract | null = null;

  currentPair = new AsyncState(async () => {
    if (this.fromToken && this.toToken) {
      const res = await liquidity.getPairByTokens(
        this.fromToken.address,
        this.toToken.address
      );

      return res;
    }
  });

  //whether the sort of from and to token is consistent with the current pair's token0 and token1
  get isTokenPairSortMatch() {
    return (
      this.fromToken?.address === this.currentPair.value?.token0.address &&
      this.toToken?.address === this.currentPair.value?.token1.address
    );
  }

  get routerV2Contract() {
    return bgtRegistry.routerV2;
  }

  get factoryContract() {
    return bgtRegistry.factory;
  }

  get isDisabled() {
    if (!this.balanced) {
      return (
        !this.fromToken ||
        !this.toToken ||
        (!this.fromAmount && !this.toAmount) ||
        Number(this.fromAmount) > this.fromToken.balance.toNumber()
      );
    } else {
      return (
        !this.fromToken ||
        !this.toToken ||
        !this.fromAmount ||
        !this.toAmount ||
        Number(this.toAmount) > this.toToken.balance.toNumber() ||
        Number(this.fromAmount) > this.fromToken.balance.toNumber()
      );
    }
  }

  get buttonContent() {
    if (!this.fromToken || !this.toToken) {
      return 'Select Tokens';
    }
    if (this.currentPair.loading) {
      return 'Loading Pair';
    }
    if (!this.fromAmount || !this.toAmount) {
      return 'Enter Amount';
    }
    if (
      Number(this.toAmount) > this.toToken.balance.toNumber() ||
      Number(this.fromAmount) > this.fromToken.balance.toNumber()
    ) {
      return 'Insufficient Balance';
    }

    return 'Add LP';
  }

  constructor() {
    makeAutoObservable(this);
    reaction(
      () => this.fromToken?.address,
      () => {
        this.currentPair.setValue(undefined);
        if (this.fromToken && this.toToken) {
          this.currentPair.call();
        }
      }
    );
    reaction(
      () => this.toToken?.address,
      () => {
        this.currentPair.setValue(undefined);
        if (this.fromToken && this.toToken) {
          this.currentPair.call();
        }
      }
    );
  }

  onFromAmountInputChange = debounce(async () => {
    if (!this.currentPair.value) {
      return;
    }
    if (this.balanced) {
      if (this.fromAmount) {
        const [toAmount] =
          await this.currentPair.value.getLiquidityAmountOut.call(
            this.fromAmount,
            this.fromToken as Token
          );
        //@ts-ignore
        this.toAmount = toAmount?.toFixed();
      } else {
        this.toAmount = '';
      }
    }
  }, 300);

  onToAmountInputChange = debounce(async () => {
    if (!this.currentPair.value) {
      return;
    }

    if (this.balanced) {
      if (this.toAmount) {
        const [fromAmount] =
          await this.currentPair.value.getLiquidityAmountOut.call(
            this.toAmount,
            this.toToken as Token
          );
        //@ts-ignore
        this.fromAmount = fromAmount.toFixed();
      } else {
        this.fromAmount = '';
      }
    }
  }, 300);

  setCurrentRemovePair(pair: PairContract | null) {
    this.currentRemovePair = pair;
  }

  setFromToken(token: Token) {
    if (
      this.fromToken?.address !== token.address ||
      this.fromToken.isNative !== token.isNative
    ) {
      if (this.toToken?.address === token.address) {
        this.toToken = this.fromToken;
        this.toAmount = '';
      }
      this.fromToken = token;
      this.fromToken.init();
      this.fromAmount = '';
    }
  }

  setFromAmount(amount: string) {
    this.fromAmount = amount;
  }

  setToToken(token: Token) {
    if (
      this.toToken?.address !== token.address ||
      this.toToken.isNative !== token.isNative
    ) {
      if (this.fromToken?.address === token.address) {
        this.fromToken = this.toToken;
        this.fromAmount = '';
      }
      this.toToken = token;
      this.toToken.init();
      this.toAmount = '';
    }
  }

  setToAmount(amount: string) {
    this.toAmount = amount;
  }

  switchTokens() {
    const fromToken = this.fromToken;
    this.fromToken = this.toToken;
    this.toToken = fromToken;
  }

  addLiquidity = new AsyncState(async () => {
    if (!this.balanced) {
      if (
        !this.fromToken ||
        !this.toToken ||
        (!this.fromAmount && !this.toAmount)
      ) {
        return;
      }
    } else {
      if (
        !this.fromToken ||
        !this.toToken ||
        !this.fromAmount ||
        !this.toAmount
      ) {
        return;
      }
    }
    const token0AmountWithDec = !!this.fromAmount
      ? new BigNumber(this.fromAmount)
          .multipliedBy(new BigNumber(10).pow(this.fromToken.decimals))
          .toFixed(0)
      : 0;
    const token1AmountWithDec = !!this.toAmount
      ? new BigNumber(this.toAmount)
          .multipliedBy(new BigNumber(10).pow(this.toToken.decimals))
          .toFixed(0)
      : 0;
    const token1MinAmountWithDec = !!token1AmountWithDec
      ? new BigNumber(token1AmountWithDec)
          .multipliedBy(1 - this.slippage / 100)
          .toFixed(0)
      : 0;
    const token0MinAmountWithDec = !!token0AmountWithDec
      ? new BigNumber(token0AmountWithDec)
          .multipliedBy(1 - this.slippage / 100)
          .toFixed(0)
      : 0;
    const deadline = dayjs().unix() + 60 * (this.deadline || 20);

    console.log('liqidity agrs', [
      this.fromToken.address as `0x${string}`,
      this.toToken.address as `0x${string}`,
      token0AmountWithDec,
      token1AmountWithDec,
      token0MinAmountWithDec,
      token1MinAmountWithDec,
      wallet.account as `0x${string}`,
      deadline,
    ]);

    await Promise.all([
      !!token0AmountWithDec &&
        this.fromToken.approveIfNoAllowance({
          amount: token0AmountWithDec,
          spender: this.routerV2Contract.address,
        }),
      !!token1AmountWithDec &&
        this.toToken.approveIfNoAllowance({
          amount: token1AmountWithDec,
          spender: this.routerV2Contract.address,
        }),
    ]);

    if (!this.balanced) {
      if (this.fromToken.isNative) {
        if (token0AmountWithDec && token0AmountWithDec !== '0') {
          // @ts-ignore
          await wallet.currentChain.nativeToken.deposit.callV2({
            value: BigInt(token0AmountWithDec),
          });
        }

        await this.routerV2Contract.addLiquidityUnbalanced.call([
          this.fromToken.address as `0x${string}`,
          this.toToken.address as `0x${string}`,
          BigInt(token0AmountWithDec),
          BigInt(token1AmountWithDec),
          BigInt(0),
          wallet.account as `0x${string}`,
          BigInt(deadline),
        ]);
      } else if (this.toToken.isNative) {
        if (token1AmountWithDec && token1AmountWithDec !== '0') {
          // @ts-ignore
          await wallet.currentChain.nativeToken.deposit.callV2({
            value: BigInt(token1AmountWithDec),
          });
        }

        await this.routerV2Contract.addLiquidityUnbalanced.call([
          this.fromToken.address as `0x${string}`,
          this.toToken.address as `0x${string}`,
          BigInt(token0AmountWithDec),
          BigInt(token1AmountWithDec),
          BigInt(0),
          wallet.account as `0x${string}`,
          BigInt(deadline),
        ]);
      } else {
        await this.routerV2Contract.addLiquidityUnbalanced.call([
          this.fromToken.address as `0x${string}`,
          this.toToken.address as `0x${string}`,
          BigInt(token0AmountWithDec),
          BigInt(token1AmountWithDec),
          BigInt(0),
          wallet.account as `0x${string}`,
          BigInt(deadline),
        ]);
      }
    } else {
      if (this.fromToken.isNative) {
        console.log('addLiquidityETH', [
          this.toToken.address as `0x${string}`,
          BigInt(token1AmountWithDec),
          BigInt(token1MinAmountWithDec),
          BigInt(token0MinAmountWithDec),
          wallet.account as `0x${string}`,
          BigInt(deadline),
        ]);

        await this.routerV2Contract.addLiquidityETH.call(
          [
            this.toToken.address as `0x${string}`,
            BigInt(token1AmountWithDec),
            BigInt(token1MinAmountWithDec),
            BigInt(token0MinAmountWithDec),
            wallet.account as `0x${string}`,
            BigInt(deadline),
          ],
          {
            value: BigInt(token0AmountWithDec),
          }
        );
      } else if (this.toToken.isNative) {
        await this.routerV2Contract.addLiquidityETH.call([
          this.fromToken.address as `0x${string}`,
          BigInt(token0AmountWithDec),
          BigInt(token0MinAmountWithDec),
          BigInt(token1MinAmountWithDec),
          wallet.account as `0x${string}`,
          BigInt(deadline),
        ]),
          {
            value: BigInt(token1AmountWithDec),
          };
      } else {
        await this.routerV2Contract.addLiquidity.call([
          this.fromToken.address as `0x${string}`,
          this.toToken.address as `0x${string}`,
          BigInt(token0AmountWithDec),
          BigInt(token1AmountWithDec),
          BigInt(token0MinAmountWithDec),
          BigInt(token1MinAmountWithDec),
          wallet.account as `0x${string}`,
          BigInt(deadline),
        ]);
      }
    }

    this.fromAmount = '';
    this.toAmount = '';
    Promise.all([this.fromToken.getBalance(), this.toToken.getBalance()]);
  });

  async initPool() {
    if (this.isInit || !wallet.currentChain) {
      return;
    }

    //init router pairs
    const validatedTokenPairs =
      await trpcClient.indexerFeedRouter.getValidatedTokenPairs.query({
        chainId: String(wallet.currentChainId),
      });

    validatedTokenPairs.status === 'success' &&
      validatedTokenPairs.data.pairs.forEach((pair) => {
        const token0 = Token.getToken({
          chainId: wallet.currentChainId.toString(),
          address: pair.token0.id.toLowerCase(),
          name: pair.token0.name,
          symbol: pair.token0.symbol,
          decimals: pair.token0.decimals,
          isRouterToken: true,
        });
        const token1 = Token.getToken({
          chainId: wallet.currentChainId.toString(),
          address: pair.token1.id.toLowerCase(),
          name: pair.token1.name,
          symbol: pair.token1.symbol,
          decimals: pair.token1.decimals,
          isRouterToken: true,
        });

        token0.init();
        token1.init();

        const pairContract = new PairContract({
          token0,
          token1,
          address: pair.id,
        });

        pairContract.init();

        this.pairsByToken[`${token0.address}-${token1.address}`] = pairContract;
      });

    this.isInit = true;
  }

  async getPairByTokens(token0Address: string, token1Address: string) {
    try {
      const memoryPair = this.getMemoryPair(token0Address, token1Address);
      if (memoryPair) {
        memoryPair.init();
        return memoryPair;
      }

      let pair = await trpcClient.pair.getPairByTokens.query({
        chainId: wallet.currentChainId,
        token0Address,
        token1Address,
      });

      if (pair) {
        const pairContract = new PairContract({
          address: pair.address,
          token0: Token.getToken({
            ...pair.token0,
            chainId: wallet.currentChainId.toString(),
          }),
          token1: Token.getToken({
            ...pair.token1,
            chainId: wallet.currentChainId.toString(),
          }),
        });

        pairContract.init();

        this.pairsByToken[`${token0Address}-${token1Address}`] = pairContract;
        return pairContract;
      } else {
        const pairAdd = await this.factoryContract.contract.read.getPair([
          token0Address as Address,
          token1Address as Address,
        ]);

        console.log('pairAdd', pairAdd);

        if (pairAdd && pairAdd !== zeroAddress) {
          const pairContract = new PairContract({
            address: pairAdd,
            token0: Token.getToken({ chainId: wallet.currentChainId.toString(), address: token0Address }),
            token1: Token.getToken({ chainId: wallet.currentChainId.toString(), address: token1Address }),
          });

          pairContract.init();

          this.pairsByToken[`${token0Address}-${token1Address}`] = pairContract;
          return pairContract;
        }
      }
    } catch (e) {
      console.log(e);
      return undefined;
    }
  }

  isFtoRaiseToken(tokenAddress: string): boolean {
    return bgtRegistry.ftoTokens.some(
      (ftoToken) =>
        ftoToken.address?.toLowerCase() === tokenAddress.toLowerCase()
    );
  }

  isRouterToken(tokenAddress: string): boolean {
    return (
      wallet.currentChain.validatedTokensInfo[tokenAddress.toLowerCase()]
        ?.isRouterToken ?? false
    );
  }

  isValidatedToken(tokenAddress: string): boolean {
    return (
      wallet.currentChain.validatedTokensInfo[tokenAddress.toLowerCase()] !==
      undefined
    );
  }

  getTokenToValidatedTokenPairs(tokenAddress: string): string[] {
    const pairTokens: string[] = [];

    Object.keys(wallet.currentChain.validatedTokensInfo).forEach(
      (token, idx) => {
        const memoryPair = this.getMemoryPair(
          tokenAddress.toLowerCase(),
          token.toLowerCase()
        );

        if (memoryPair) {
          pairTokens.push(token);
        }
      }
    );

    return pairTokens;
  }

  getTokenToRaisedTokenPairs(tokenAddress: string): string[] {
    const pairTokens: string[] = [];

    bgtRegistry.ftoTokens.forEach((ftoToken) => {
      const memoryPair = this.getMemoryPair(
        tokenAddress.toLowerCase(),
        ftoToken.address?.toLowerCase() ?? ''
      );

      if (memoryPair) {
        pairTokens.push(ftoToken.address!);
      }
    });

    return pairTokens;
  }

  getMemoryPair(token0: string, token1: string) {
    return (
      this.pairsByToken[`${token0}-${token1}`] ||
      this.pairsByToken[`${token1}-${token0}`]
    );
  }

  setIsExactIn(isExactIn: boolean) {
    this.balanced = isExactIn;
  }
}

export const liquidity = new Liquidity();
