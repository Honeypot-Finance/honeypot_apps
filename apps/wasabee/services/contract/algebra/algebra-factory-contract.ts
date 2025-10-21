import { BaseContract } from './..';
import { wallet } from '@honeypot/shared/lib/wallet';
import { Signer, ethers } from 'ethers';
import { Contract } from 'ethcall';
import BigNumber from 'bignumber.js';
import { makeAutoObservable } from 'mobx';
import { get } from 'http';
import { getContract } from 'viem';
import { algebraFactoryABI } from '@/lib/abis/algebra-contracts/ABIs';
import { ContractWrite } from '@honeypot/shared/lib/utils/utils';
import { usePublicClient } from 'wagmi';

export class AlgebraFactoryContract implements BaseContract {
  address = '';
  name: string = '';
  abi = algebraFactoryABI;

  constructor(args: Partial<AlgebraFactoryContract>) {
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

  get createPool() {
    return new ContractWrite(this.contract.write?.createPool, {
      action: 'Create Pool',
      isSuccessEffect: true,
    });
  }
}
