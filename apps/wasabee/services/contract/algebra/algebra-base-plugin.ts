import { BaseContract } from './..';
import { wallet } from '@honeypot/shared/lib/wallet';
import { Signer, ethers } from 'ethers';
import { Contract } from 'ethcall';
import BigNumber from 'bignumber.js';
import { makeAutoObservable } from 'mobx';
import { get } from 'http';
import { getContract } from 'viem';
import { algebraBasePluginAbi } from '@honeypot/shared/wagmi-generated';
import { ContractWrite } from '@honeypot/shared';
import { usePublicClient } from 'wagmi';

export class AlgebraBasePluginContract implements BaseContract {
  address = '';
  name: string = '';
  abi = algebraBasePluginAbi;

  constructor(args: Partial<AlgebraBasePluginContract>) {
    Object.assign(this, args);
    makeAutoObservable(this);
  }

  get contract() {
    return getContract({
      address: this.address as `0x${string}`,
      abi: this.abi,
      client: { public: wallet.publicClient, wallet: wallet.walletClient },
    });
  }
}
