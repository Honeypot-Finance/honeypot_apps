import { BaseContract } from '..';
import { wallet } from '@honeypot/shared/lib/wallet';
import { Signer, ethers } from 'ethers';
import { Contract } from 'ethcall';
import BigNumber from 'bignumber.js';
import { makeAutoObservable } from 'mobx';
import { get } from 'http';
import { getContract } from 'viem';
import { algebraPoolABI } from '@/lib/abis/algebra-contracts/ABIs';
import { AsyncState, ContractWrite } from '@honeypot/shared/lib/utils/utils';

import { Token } from '@honeypot/shared/lib/contract/token/token';

export class AlgebraPoolContract implements BaseContract {
  static poolMap: Record<string, AlgebraPoolContract> = {};
  static getPool({
    address,
    force,
    ...args
  }: {
    address: string;
    force?: boolean;
  } & Partial<AlgebraPoolContract>) {
    if (!address) return;
    const lowerAddress = address.toLowerCase();
    const key = `${lowerAddress}`;
    const pool = AlgebraPoolContract.poolMap[key];
    if (!pool) {
      AlgebraPoolContract.poolMap[key] = new AlgebraPoolContract({
        address: lowerAddress,
        ...args,
      });
    } else {
      AlgebraPoolContract.poolMap[key].setData(args);
    }
    return AlgebraPoolContract.poolMap[key];
  }

  address = '';
  name: string = '';
  abi = algebraPoolABI;
  isInit = false;

  get contract() {
    return getContract({
      address: this.address as `0x${string}`,
      abi: this.abi,
      client: { public: wallet.publicClient, wallet: wallet.walletClient },
    });
  }

  token0 = new AsyncState<
    (options?: { force?: boolean }) => Promise<Token | undefined>
  >(async (options) => {
    if (this.token0.value && !options?.force) return;

    const token0Address = await this.contract.read.token0();
    const token = Token.getToken({
      address: token0Address,
      chainId: wallet.currentChainId.toString(),
    });
    await token.init();

    return token;
  });

  token1 = new AsyncState<
    (options?: { force?: boolean }) => Promise<Token | undefined>
  >(async (options) => {
    if (this.token1.value && !options?.force) return;

    const token1Address = await this.contract.read.token1();
    const token = Token.getToken({
      address: token1Address,
      chainId: wallet.currentChainId.toString(),
    });
    await token.init();

    return token;
  });

  ticks = async (skip: number) => {
    return await this.contract.read.ticks([skip]);
  };

  tickSpacing = new AsyncState(async () => {
    return await this.contract.read.tickSpacing();
  });

  globalState = new AsyncState(async () => {
    return await this.contract.read.globalState();
  });

  liquidity = new AsyncState(async () => {
    return await this.contract.read.liquidity();
  });

  constructor(args: Partial<AlgebraPoolContract>) {
    Object.assign(this, args);
    makeAutoObservable(this);
  }

  async init(options?: { force?: boolean }) {
    if (this.isInit && !options?.force) return;

    this.isInit = false;

    await Promise.all([
      await this.token0.call(),
      await this.token1.call(),
      await this.tickSpacing.call(),
      await this.globalState.call(),
      await this.liquidity.call(),
    ]);

    this.isInit = true;

    return this;
  }

  setData({ ...args }: Partial<AlgebraPoolContract>) {
    Object.assign(this, args);
  }
}
