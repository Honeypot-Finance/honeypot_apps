import { Token } from '@honeypot/shared/lib/contract/token/token';
import BigNumber from 'bignumber.js';
import { BaseContract } from '@/services/contract';
import { wallet } from '@honeypot/shared/lib/wallet';
import IUniswapV2Pair from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import { makeAutoObservable } from 'mobx';
import { getContract, zeroAddress } from 'viem';
import { toCompactLocaleString } from '@/lib/utils';

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
  apr_24h: number = 0;
  volumeChange24h: number = 0;

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
              address: this.address,
              chainId: wallet.currentChainId.toString(),
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
}
