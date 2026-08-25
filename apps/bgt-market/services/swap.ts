import { Token } from '@honeypot/shared';
import { PairContract } from '@/services/contract/dex/liquidity/pair-contract';
import BigNumber from 'bignumber.js';
import { wallet } from '@honeypot/shared/lib/wallet';
import { liquidity } from '@/services/liquidity';

import { autorun, makeAutoObservable, reaction, when } from 'mobx';
import { AsyncState } from '@honeypot/shared';
import { debounce } from 'lodash';
import dayjs from 'dayjs';
import { chart } from './chart';
import { zeroAddress } from 'viem';
import { bgtRegistry } from '@/services/contract/bgt-registry';

class Swap {
  fromToken: Token | undefined = undefined;
  toToken: Token | undefined = undefined;
  fromAmount: string = '';
  toAmount: string = '';
  slippage: number = 1;
  deadline: number = 20;
  price: BigNumber | null = null;
  needApprove: boolean = false;

  routerToken: Token[] | undefined = undefined;

  getRouterToken = async () => {
    this.setRouterToken(undefined);
    if (!this.fromToken || !this.toToken) {
      return undefined;
    }

    const routerPossiblePaths = this.getRouterPathsByValidatedToken();

    const bestPath = await this.calculateBestPathFromRouterPaths(
      routerPossiblePaths
    );

    this.setRouterToken(bestPath.map((t) => Token.getToken({ chainId: wallet.currentChainId.toString(), address: t })));
  };

  currentPair = new AsyncState(async () => {
    if (this.fromToken && this.toToken) {
      if (this.isWrapOrUnwrap) {
        return new PairContract({
          address: zeroAddress,
          token0: this.fromToken,
          token1: this.toToken,
        });
      } else if (
        liquidity.getMemoryPair(
          this.fromToken.address.toLowerCase(),
          this.toToken.address.toLowerCase()
        )
      ) {
        const res = await liquidity.getPairByTokens(
          this.fromToken.address,
          this.toToken.address
        );
        await res?.init();

        if (
          res?.reserves?.reserve0.isZero() ||
          res?.reserves?.reserve1.isZero()
        ) {
          return;
        } else {
          return res;
        }
      } else {
        const pairContract = await liquidity.getPairByTokens(
          this.fromToken.address,
          this.toToken.address
        );
        if (pairContract) {
          if (!liquidity.tokensMap[this.fromToken.address]) {
            liquidity.tokensMap[this.fromToken.address] = this.fromToken;

            this.fromToken.init();
          }
          if (!liquidity.tokensMap[this.toToken.address]) {
            liquidity.tokensMap[this.toToken.address] = this.toToken;

            this.toToken.init();
          }
          liquidity.pairsByToken[
            `${this.fromToken.address}-${this.toToken.address}`
          ] = pairContract!;

          pairContract!.init();

          return pairContract;
        } else {
          await this.getRouterToken();
        }
      }
    }
  });

  get isUnwrap() {
    return (
      this.fromToken?.address === this.toToken?.address &&
      this.toToken?.isNative &&
      !this.fromToken?.isNative
    );
  }
  get isWrap() {
    return (
      this.fromToken?.address === this.toToken?.address &&
      this.fromToken?.isNative &&
      !this.toToken?.isNative
    );
  }

  get isWrapOrUnwrap() {
    return (
      this.fromToken?.address === this.toToken?.address &&
      this.fromToken?.isNative !== this.toToken?.isNative
    );
  }

  //whether the sort of from and to token is consistent with the current pair's token0 and token1
  get isTokenPairSortMatch() {
    return (
      this.fromToken?.address === this.currentPair.value?.token0.address &&
      this.toToken?.address === this.currentPair.value?.token1.address
    );
  }

  get isDisabled() {
    return (
      !this.fromToken ||
      !this.toToken ||
      !this.fromAmount ||
      !this.toAmount ||
      (!this.currentPair.value &&
        (!this.routerToken || this.routerToken?.length === 0)) ||
      this.fromToken.balance.toNumber() < Number(this.fromAmount)
    );
  }

  get buttonContent() {
    if (!this.fromToken || !this.toToken) {
      return 'Select Tokens';
    }

    if (this.currentPair.loading) {
      return 'Loading Pair';
    }

    if (
      !this.currentPair.value &&
      (!this.routerToken || this.routerToken?.length === 0)
    ) {
      return 'Insufficient Liquidity';
    }

    if (!this.fromAmount || !this.toAmount) {
      return 'Enter Amount';
    }

    if (this.fromToken.balance.toNumber() < Number(this.fromAmount)) {
      return 'Insufficient Balance';
    }

    if (this.needApprove) {
      return 'Approve';
    }

    return 'Swap';
  }

  get factoryContract() {
    return bgtRegistry.factory;
  }

  get routerV2Contract() {
    return bgtRegistry.routerV2;
  }

  get minToAmount() {
    if (this.isWrapOrUnwrap) {
      return new BigNumber(this.toAmount || 0);
    }

    return new BigNumber(this.toAmount || 0).minus(
      new BigNumber(this.toAmount || 0).multipliedBy(this.slippage).div(100)
    );
  }

  constructor() {
    makeAutoObservable(this);
    reaction(
      () => this.fromToken?.address,
      async () => {
        this.getNeedApprove();
        this.fromToken && this.loadTokenRouterPairs(this.fromToken!);
        this.setRouterToken(undefined);
        this.currentPair.setValue(undefined);
        await this.toToken?.init();
        if (this.fromToken && this.toToken) {
          await this.currentPair.call();
        }
        //this.updateChartData();
      }
    );
    reaction(
      () => this.toToken?.address,
      async () => {
        this.toToken && this.loadTokenRouterPairs(this.toToken!);
        this.setRouterToken(undefined);
        this.currentPair.setValue(undefined);
        await this.toToken?.init();
        if (this.fromToken && this.toToken) {
          await this.currentPair.call();
          if (this.fromAmount.length > 0) {
            // if the fromAmount is not empty, recalculate the toAmount
            this.fromAmount = this.fromAmount + ' ';
          }
        }
        // this.updateChartData();
      }
    );
    reaction(
      () => this.fromAmount,
      () => {
        this.onFromAmountChange();
      }
    );
  }

  onFromAmountChange = debounce(async () => {
    this.getNeedApprove();
    if (!this.currentPair.value && !this.routerToken) {
      return;
    }
    this.fromAmount = this.fromAmount.trim();

    if (
      new BigNumber(this.fromAmount || 0).isGreaterThan(0) &&
      this.fromToken &&
      this.toToken
    ) {
      if (this.currentPair.value) {
        const [toAmount] = await this.currentPair.value!.getAmountOut.call(
          this.fromAmount,
          this.fromToken as Token
        );

        this.toAmount = toAmount?.toFixed();
        this.price = new BigNumber(this.toAmount).div(this.fromAmount);
      } else if (this.routerToken && this.routerToken.length > 0) {
        const finalAmountOut = await this.getFinalAmountOut(
          this.routerToken.map((t) => t.address.toLowerCase())
        );

        this.toAmount = finalAmountOut.toFixed();
        this.price = new BigNumber(this.toAmount).div(this.fromAmount);
      } else {
        this.price = new BigNumber(0);
      }
    } else {
      this.toAmount = '';
      this.price = null;
    }
  }, 300);

  setDeadline(deadline: number) {
    this.deadline = deadline;
  }

  setSlippage(slippage: number) {
    this.slippage = slippage;
  }

  switchTokens() {
    const fromToken = this.fromToken;
    const fromAmount = this.fromAmount;
    this.fromToken = this.toToken;
    this.toToken = fromToken;
    this.fromAmount = this.toAmount;
    this.toAmount = fromAmount;
  }

  setFromToken(token: Token) {
    console.log('From Token', this.fromToken);
    console.log('Token', token);
    if (
      this.fromToken?.address !== token?.address ||
      this.fromToken.isNative !== token.isNative
    ) {
      // indicate this is a wrap to native or native to swap
      if (
        this.toToken?.address === token?.address &&
        this.toToken?.isNative === token?.isNative
      ) {
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
      this.toToken?.address !== token?.address ||
      token.isNative !== this.toToken.isNative
    ) {
      // indicate this is a wrap to native or native to swap
      if (
        this.fromToken?.address === token?.address &&
        this.fromToken?.isNative === token?.isNative
      ) {
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

  swapExactTokensForTokens = new AsyncState(async () => {
    if (
      !this.fromToken ||
      !this.toToken ||
      !this.fromAmount ||
      !this.toAmount ||
      (!this.currentPair.value && !this.routerToken)
    ) {
      return;
    }

    const fromAmountDecimals = new BigNumber(this.fromAmount)
      .multipliedBy(new BigNumber(10).pow(this.fromToken.decimals))
      .toFixed(0);

    const deadline = dayjs().unix() + 60 * (this.deadline || 20);

    await Promise.all([
      this.fromToken
        .approveIfNoAllowance({
          amount: fromAmountDecimals,
          spender: this.routerV2Contract.address,
        })
        .then(() => {
          this.getNeedApprove();
        }),
    ]);

    if (this.isWrapOrUnwrap) {
      console.log('wrap or unwrap');
      if (this.isWrap) {
        // @ts-ignore
        await this.toToken.deposit.callV2({
          value: BigInt(fromAmountDecimals),
        });
      } else if (this.isUnwrap) {
        // @ts-ignore
        await this.toToken.withdraw.callV2([BigInt(fromAmountDecimals)]);
      }
    } else {
      console.log('swapExactTokensForTokens');
      await Promise.all([
        this.fromToken.approveIfNoAllowance({
          amount: fromAmountDecimals,
          spender: this.routerV2Contract.address,
        }),
      ]);
      const path = this.routerToken
        ? (this.routerToken.map((t) => t.address) as `0x${string}`[])
        : ([this.fromToken.address, this.toToken.address] as `0x${string}`[]);

      const finalAmountOut = this.routerToken
        ? await this.getFinalAmountOut(path.map((p) => p.toLowerCase()))
        : this.toAmount;

      const minAmountOutDecimals = new BigNumber(finalAmountOut)
        .multipliedBy(1 - this.slippage / 100)
        .multipliedBy(new BigNumber(10).pow(this.toToken.decimals))
        .toFixed(0);

      if (this.fromToken.isNative) {
        await this.routerV2Contract.swapExactETHForTokens.call(
          [
            BigInt(minAmountOutDecimals),
            path,
            wallet.account as `0x${string}`,
            BigInt(deadline),
          ],
          {
            value: BigInt(fromAmountDecimals),
          }
        );
      } else if (this.toToken.isNative) {
        await this.routerV2Contract.swapExactTokensForETH.call([
          BigInt(fromAmountDecimals),
          BigInt(minAmountOutDecimals),
          path,
          wallet.account as `0x${string}`,
          BigInt(deadline),
        ]);
      } else if (
        this.toToken.supportingFeeOnTransferTokens ||
        this.fromToken.supportingFeeOnTransferTokens
      ) {
        console.log('supporting fee on transfer tokens');
        console.log([
          BigInt(fromAmountDecimals),
          BigInt(minAmountOutDecimals),
          path,
          wallet.account as `0x${string}`,
          BigInt(deadline),
        ]);
        await this.routerV2Contract.swapExactTokensForTokensSupportingFeeOnTransferTokens.call(
          [
            BigInt(fromAmountDecimals),
            BigInt(minAmountOutDecimals),
            path,
            wallet.account as `0x${string}`,
            BigInt(deadline),
          ]
        );
      } else {
        await this.routerV2Contract.swapExactTokensForTokens.call([
          BigInt(fromAmountDecimals),
          BigInt(minAmountOutDecimals),
          path,
          wallet.account as `0x${string}`,
          BigInt(deadline),
        ]);
      }
    }

    this.fromAmount = '';

    Promise.all([
      this.currentPair.value?.init(true),
      this.fromToken.getBalance(),
      this.toToken.getBalance(),
    ]);
  });

  setRouterToken(value: Token[] | undefined) {
    this.routerToken = value;
  }

  getSwapPath = (routerTokenAddress: string[]): readonly `0x${string}`[] => {
    if (routerTokenAddress.length > 0) {
      if (routerTokenAddress.length === 1) {
        return [
          this.fromToken!.address,
          routerTokenAddress[0],
          this.toToken!.address,
        ] as readonly `0x${string}`[];
      } else if (routerTokenAddress.length === 2) {
        return [
          this.fromToken!.address,
          routerTokenAddress[0],
          routerTokenAddress[1],
          this.toToken!.address,
        ] as readonly `0x${string}`[];
      }
    }

    return [
      this.fromToken!.address,
      this.toToken!.address,
    ] as readonly `0x${string}`[];
  };

  getFinalAmountOut = async (
    pathAddress: string[],
    startingAmount: BigNumber = new BigNumber(this.fromAmount)
  ): Promise<BigNumber> => {
    if (!this.currentPair && pathAddress.length === 0) {
      return new BigNumber(0);
    }

    let finalAmountOut =
      await bgtRegistry.routerV2.contract.read.getAmountsOut([
        BigInt(
          new BigNumber(startingAmount)
            .multipliedBy(new BigNumber(10).pow(this.fromToken!.decimals))
            .toFixed(0)
        ),
        pathAddress as `0x${string}`[],
      ]);

    return new BigNumber(
      finalAmountOut[finalAmountOut.length - 1].toString()
    ).div(new BigNumber(10).pow(this.toToken!.decimals));
  };

  getRouterPathsByValidatedToken = (): string[][] | undefined => {
    if (!this.fromToken || !this.toToken) {
      return undefined;
    }
    const paths: Token[][] = [];

    //if from or to token is validated token, route them by from -> router token -> to
    if (
      liquidity.isRouterToken(this.fromToken.address.toLowerCase()) ||
      liquidity.isRouterToken(this.toToken.address.toLowerCase())
    ) {
      if (liquidity.isRouterToken(this.fromToken.address.toLowerCase())) {
        const toTokenRouterTokens = liquidity.getTokenToValidatedTokenPairs(
          this.toToken.address.toLowerCase()
        );

        if (toTokenRouterTokens.length === 0) {
          return undefined;
        }

        for (let i = 0; i < toTokenRouterTokens.length; i++) {
          const RT = Token.getToken({
            chainId: wallet.currentChainId.toString(),
            address: toTokenRouterTokens[i].toLowerCase(),
          });
          if (
            liquidity.getMemoryPair(
              this.fromToken.address.toLowerCase(),
              RT.address.toLowerCase()
            )
          ) {
            RT.init();
            paths.push([RT]);
          }
        }
      } else {
        const fromTokenRouterTokens = liquidity.getTokenToValidatedTokenPairs(
          this.fromToken.address.toLowerCase()
        );

        if (fromTokenRouterTokens.length === 0) {
          return undefined;
        }

        for (let i = 0; i < fromTokenRouterTokens.length; i++) {
          const RT = Token.getToken({
            chainId: wallet.currentChainId.toString(),
            address: fromTokenRouterTokens[i].toLowerCase(),
          });
          if (
            liquidity.getMemoryPair(
              RT.address.toLowerCase(),
              this.toToken.address.toLowerCase()
            )
          ) {
            RT.init();
            paths.push([RT]);
          }
        }
      }
    }

    //try to get 1 token in fto tokens for both from and to
    //route them by from -> router token -> to
    const fromTokenRouterTokens = liquidity.getTokenToValidatedTokenPairs(
      this.fromToken.address.toLowerCase()
    );

    if (fromTokenRouterTokens.length === 0) {
      return undefined;
    }

    fromTokenRouterTokens.forEach((rtoken) => {
      if (
        liquidity.getMemoryPair(
          this.toToken!.address.toLowerCase(),
          rtoken.toLowerCase()
        )
      ) {
        const RT = Token.getToken({ chainId: wallet.currentChainId.toString(), address: rtoken.toLowerCase() });
        RT.init();
        paths.push([RT]);
      }
    });

    // if there is not one token for both,
    // get fto tokens for from and to separately
    // and route them by from -> router token 1 -> router token 2 -> to
    const toTokenRouterTokens = liquidity.getTokenToValidatedTokenPairs(
      this.toToken.address.toLowerCase()
    );

    if (toTokenRouterTokens.length === 0) {
      return undefined;
    }

    for (let i = 0; i < fromTokenRouterTokens.length; i++) {
      for (let j = 0; j < toTokenRouterTokens.length; j++) {
        if (
          liquidity.getMemoryPair(
            fromTokenRouterTokens[i].toLowerCase(),
            toTokenRouterTokens[j].toLowerCase()
          )
        ) {
          const RT1 = Token.getToken({
            chainId: wallet.currentChainId.toString(),
            address: fromTokenRouterTokens[i].toLowerCase(),
          });
          RT1.init();
          const RT2 = Token.getToken({
            chainId: wallet.currentChainId.toString(),
            address: toTokenRouterTokens[j].toLowerCase(),
          });
          RT2.init();
          paths.push([RT1, RT2]);
        }
      }
    }

    return paths.length > 0
      ? (paths.map((path) => {
          return this.getSwapPath(path.map((t) => t.address.toLowerCase()));
        }) as string[][])
      : undefined;
  };

  calculateBestPathFromRouterPaths = async (path: string[][] | undefined) => {
    if (!path) {
      return [];
    }

    const promises = path.map(async (p) => {
      const finalAmountOut = await this.getFinalAmountOut(
        p,
        new BigNumber(this.fromAmount.length > 0 ? this.fromAmount : 1)
      );
      return finalAmountOut.div(
        new BigNumber(this.fromAmount.length > 0 ? this.fromAmount : 1)
      );
    });

    const prices = await Promise.all(promises);

    const bestPrice = Math.max(...prices.map((p) => p.toNumber()));

    return path[prices.findIndex((p) => p.toNumber() === bestPrice)];
  };

  loadTokenRouterPairs = async (token: Token) => {
    const routerTokens = Object.entries(wallet.currentChain.validatedTokensInfo)
      .filter(([address, token]) => {
        return token.isRouterToken;
      })
      .map(([address, token]) => {
        return Token.getToken({ chainId: wallet.currentChainId.toString(), address });
      });

    routerTokens.forEach(async (routerToken) => {
      if (
        !liquidity.getMemoryPair(
          token?.address.toLowerCase(),
          routerToken.address.toLowerCase()
        )
      ) {
        try {
          await liquidity.getPairByTokens(token.address, routerToken.address);
        } catch (e) {
          //console.log(e)
        }
      }
    });
  };

  updateChartData = async () => {
    let label = '';
    chart.setChartTarget(undefined);

    if (this.fromToken && this.toToken) {
      // Local PairContract vs the shared one the chart store is typed against;
      // same runtime object, differing only in two unread display fields.
      chart.setChartTarget(this.currentPair.value as any);
    } else if (this.fromToken) {
      chart.setChartTarget(this.fromToken as Token);
    }

    if (!chart.chartTarget) {
      label = 'No chart available';
    } else {
      label = `${this.fromToken?.symbol}${
        this.toToken ? '/' + this.toToken.symbol : '/USD'
      }`;
    }

    chart.chartData.call();

    chart.setChartLabel(label);
  };

  getNeedApprove = async () => {
    if (!this.fromToken || !this.fromAmount) {
      return;
    }
    if (this.isWrapOrUnwrap) {
      return false;
    }

    const fromAmountDecimals = new BigNumber(this.fromAmount)
      .multipliedBy(new BigNumber(10).pow(this.fromToken.decimals))
      .toFixed(0);

    const allowance = await this.fromToken.contract.read.allowance([
      wallet.account,
      this.routerV2Contract.address,
    ] as [`0x${string}`, `0x${string}`]);

    this.needApprove = new BigNumber(allowance.toString()).isLessThan(
      fromAmountDecimals
    );
  };
}

export const swap = new Swap();
