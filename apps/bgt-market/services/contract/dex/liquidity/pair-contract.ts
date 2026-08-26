import { Token } from '@honeypot/shared';
import BigNumber from 'bignumber.js';
import { BaseContract } from '@/services/contract';
import { wallet } from '@honeypot/shared/lib/wallet';
import IUniswapV2Pair from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import { makeAutoObservable } from 'mobx';
import { getContract, zeroAddress } from 'viem';
import { AsyncState } from '@honeypot/shared';
import { toCompactLocaleString } from '@/lib/utils';
import { amountFormatted, formatAmount } from '@/lib/format';
import dayjs from 'dayjs';
import { liquidity } from '@/services/liquidity';
import {
  Transaction,
  VaultCollectFee,
  VaultDeposit,
  VaultWithdraw,
} from '@/lib/algebra/graphql/generated/graphql';
import { bgtRegistry } from '@/services/contract/bgt-registry';

// const totalSupply = await pairContract.methods.totalSupply().call()
// const LPTokenBalance = await this.balanceOf(pairAddress)
// const LPtoken0Balance = reserve0 * LPTokenBalance / totalSupply
// const LPtoken1Balance = reserve1 * LPTokenBalance / totalSxupply

export class PairContract implements BaseContract {
  address: string = '';
  name: string = '';
  abi = IUniswapV2Pair.abi;
  token: Token = new Token({});
  deadline: number = 20;
  reserves: {
    reserve0: BigNumber;
    reserve1: BigNumber;
  } | null = null;
  trackedReserveETH: BigNumber = new BigNumber(0);
  tradingVolumeYesterday: string = '';
  token0: Token = new Token({}); // fixed
  token1: Token = new Token({}); // fixed
  isInit = false;
  isLoading = false;
  canClaimLP = false;

  //indexer data
  TVL_USD: number = 0;
  volume_24h_USD: number = 0;
  fees_24h_USD: number = 0;

  get trackedReserveUSD() {
    return this.trackedReserveETH.multipliedBy(liquidity.bundlePrice);
  }

  get userMarketValue() {
    if (!this.reserves?.reserve0 || !this.reserves?.reserve1) {
      return new BigNumber(0);
    }

    const token0Value = this.reserves.reserve0
      .multipliedBy(this.token0.derivedETH)
      .multipliedBy(liquidity.bundlePrice);
    const token1Value = this.reserves.reserve1
      .multipliedBy(this.token1.derivedETH)
      .multipliedBy(liquidity.bundlePrice);
    // console.log("reserve0", this.reserves.reserve0.toString());
    // console.log("derivedETH0", this.token0.derivedETH);
    // console.log("token0Value", token0Value.toString());
    // console.log("token0Value.plus(token1Value)", token0Value.plus(token1Value));

    return token1Value.plus(token0Value);
  }

  get isNativeWrapPair() {
    return this.address === zeroAddress;
  }

  get token0LpBalance() {
    return !new BigNumber(this.token.totalSupplyWithoutDecimals || 0).eq(0)
      ? new BigNumber(this.reserves?.reserve0 || 0)
          .multipliedBy(this.token.balanceWithoutDecimals || 0)
          .div(this.token.totalSupplyWithoutDecimals || 0)
      : new BigNumber(0);
  }

  get token1LpBalance() {
    return !new BigNumber(this.token.totalSupplyWithoutDecimals || 0).eq(0)
      ? new BigNumber(this.reserves?.reserve1 || 0)
          .multipliedBy(this.token.balanceWithoutDecimals || 0)
          .div(this.token.totalSupplyWithoutDecimals || 0)
      : new BigNumber(0);
  }
  get myLiquidityDisplay() {
    return this.token0LpBalance &&
      this.token0.displayName &&
      this.token1LpBalance &&
      this.token1.displayName
      ? {
          reserve0: `${toCompactLocaleString(this.token0LpBalance)} ${
            this.token0.displayName
          }`,
          reserve1: `${toCompactLocaleString(this.token1LpBalance)} ${
            this.token1.displayName
          }`,
        }
      : {
          reserve0: '-',
          reserve1: '-',
        };
  }

  get liquidityDisplay() {
    return this.reserves?.reserve0 &&
      this.token0.displayName &&
      this.reserves?.reserve1 &&
      this.token1.displayName
      ? // ? `${amountFormatted(this.reserves?.reserve0, {
        //     decimals: 0,
        //     fixed: 2,
        //   })} ${this.token0.displayName} - ${amountFormatted(
        //     this.reserves?.reserve1,
        //     {
        //       decimals: 0,
        //       fixed: 2,
        //     }
        //   )} ${this.token1.displayName}`
        // : "-";
        {
          reserve0: `${toCompactLocaleString(this.reserves?.reserve0)} ${
            this.token0.displayName
          }`,
          reserve1: `${toCompactLocaleString(this.reserves?.reserve1)} ${
            this.token1.displayName
          }`,
        }
      : {
          reserve0: '-',
          reserve1: '-',
        };
  }

  get poolName() {
    return this.token0.displayName + '-' + this.token1.displayName;
  }

  get contract() {
    return getContract({
      address: this.address as `0x${string}`,
      abi: this.abi,
      client: {
        public: wallet.publicClient,
        wallet: wallet.walletClient,
      },
    });
  }

  get routerV2Contract() {
    return bgtRegistry.routerV2;
  }

  constructor(args: Partial<PairContract>) {
    Object.assign(this, args);
    makeAutoObservable(this);
  }

  async getReserves() {
    try {
      const reserves = await this.contract?.read.getReserves();

      const [reserve0, reserve1] = (reserves as any[]) || [];
      if (reserve0 && reserve1) {
        this.reserves = {
          reserve0: new BigNumber(reserve0.toString()).div(
            new BigNumber(10).pow(this.token0.decimals)
          ),
          reserve1: new BigNumber(reserve1.toString()).div(
            new BigNumber(10).pow(this.token1.decimals)
          ),
        };
      }
    } catch (e) {
      console.log('this', this);
      console.log('error', e);
    }
  }
  getAmountOut = new AsyncState(
    async (fromAmount: string, fromToken: Token) => {
      if (this.isNativeWrapPair) {
        return new BigNumber(1).multipliedBy(fromAmount);
      }
      await this.getReserves();
      if (!this.reserves) {
        return new BigNumber(0);
      }
      const reserve0 = BigInt(
        this.reserves.reserve0
          .multipliedBy(new BigNumber(10).pow(this.token0.decimals))
          .toFixed(0)
      );
      const reserve1 = BigInt(
        this.reserves.reserve1
          .multipliedBy(new BigNumber(10).pow(this.token1.decimals))
          .toFixed(0)
      );

      const reserveIn =
        fromToken.address.toLowerCase() === this.token0.address.toLowerCase()
          ? reserve0
          : reserve1;
      const reserveOut =
        fromToken.address.toLowerCase() === this.token0.address.toLowerCase()
          ? reserve1
          : reserve0;
      const toToken =
        fromToken.address.toLowerCase() === this.token0.address.toLowerCase()
          ? this.token1
          : this.token0;
      const amountOut = await this.routerV2Contract.contract.read.getAmountOut([
        BigInt(
          new BigNumber(fromAmount)
            .multipliedBy(new BigNumber(10).pow(fromToken.decimals))
            .toFixed(0)
        ),
        reserveIn,
        reserveOut,
      ]);

      return new BigNumber(amountOut.toString()).div(
        new BigNumber(10).pow(toToken.decimals)
      );
    }
  );

  getLiquidityAmountOut = new AsyncState(
    async (fromAmount: string, fromToken: Token) => {
      if (this.isNativeWrapPair) {
        return new BigNumber(1).multipliedBy(fromAmount);
      }
      await this.getReserves();
      if (!this.reserves) {
        return new BigNumber(0);
      }
      const reserve0 = this.reserves.reserve0;
      const reserve1 = this.reserves.reserve1;

      const reserveIn =
        fromToken.address.toLowerCase() === this.token0.address.toLowerCase()
          ? reserve0
          : reserve1;
      const reserveOut =
        fromToken.address.toLowerCase() === this.token0.address.toLowerCase()
          ? reserve1
          : reserve0;
      const toToken =
        fromToken.address.toLowerCase() === this.token0.address.toLowerCase()
          ? this.token1
          : this.token0;
      const amountOut = reserveOut.div(reserveIn).multipliedBy(fromAmount);
      return amountOut;
    }
  );

  async init(force = false) {
    if (this.isNativeWrapPair) {
      this.isInit = true;
      return;
    }
    if (this.isLoading) {
      return;
    }
    this.isLoading = true;
    if (force || !this.isInit) {
      try {
        await Promise.all([
          (async () => {
            this.token = Token.getToken({
              chainId: wallet.currentChainId.toString(),
              address: this.address,
            });

            await this.token.init(false, {
              loadName: false,
              loadSymbol: false,
              loadDecimals: false,
              loadTotalSupply: true,
            });
          })(),
          await this.getReserves(),
        ]);
      } catch (error) {
        throw error;
      } finally {
        this.isLoading = false;
      }
    }
    this.isInit = true;
    return this;
  }

  removeLiquidity = new AsyncState(async (percent: number) => {
    const liquidity = this.token.balanceWithoutDecimals.multipliedBy(percent);
    if (liquidity.gt(0)) {
      await this.token.approveIfNoAllowance({
        amount: liquidity.toFixed(0),
        spender: this.routerV2Contract.address,
      });
      const deadline = dayjs().unix() + 60 * (this.deadline || 20);
      if (this.token0.isNative) {
        await this.routerV2Contract.removeLiquidityETH.call([
          this.token1.address as `0x${string}`,
          BigInt(liquidity.toFixed(0)),
          BigInt(0),
          BigInt(0),
          wallet.account as `0x${string}`,
          BigInt(deadline),
        ]);
      } else if (this.token1.isNative) {
        await this.routerV2Contract.removeLiquidityETH.call([
          this.token0.address as `0x${string}`,
          BigInt(liquidity.toFixed(0)),
          BigInt(0),
          BigInt(0),
          wallet.account as `0x${string}`,
          BigInt(deadline),
        ]);
      } else {
        await this.routerV2Contract.removeLiquidity.call([
          this.token0.address as `0x${string}`,
          this.token1.address as `0x${string}`,
          BigInt(liquidity.toFixed(0)),
          BigInt(0),
          BigInt(0),
          wallet.account as `0x${string}`,
          BigInt(deadline),
        ]);
      }

      await this.init(true);
    }
  });
}
