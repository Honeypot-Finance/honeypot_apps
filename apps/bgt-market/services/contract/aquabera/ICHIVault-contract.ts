import { BaseContract } from './..';
import { wallet } from '@honeypot/shared/lib/wallet';
import { makeAutoObservable } from 'mobx';
import { Address, getContract, zeroAddress } from 'viem';
import { ICHIVaultABI } from '@/lib/abis/aquabera/ICHIVault';
import { writeContract } from 'viem/actions';
import { ContractWrite } from '@honeypot/shared';
import BigNumber from 'bignumber.js';

import { Token } from '@honeypot/shared';
import { PairContract } from '@honeypot/shared';
import { VaultDeposit } from '@/lib/algebra/graphql/generated/graphql';
import { VaultWithdraw } from '@/lib/algebra/graphql/generated/graphql';
import { VaultCollectFee } from '@/lib/algebra/graphql/generated/graphql';

export class ICHIVaultContract implements BaseContract {
  address: Address = zeroAddress;
  name: string = 'ICHIVault';
  abi = ICHIVaultABI;
  fee = 0;
  totalAmountsWithoutDecimal: { total0: bigint; total1: bigint } = {
    total0: BigInt(0),
    total1: BigInt(0),
  };
  token0: Token | undefined = undefined;
  token1: Token | undefined = undefined;
  allowToken0: boolean = false;
  allowToken1: boolean = false;
  totalsupplyShares: bigint = BigInt(0);
  userShares: bigint = BigInt(0);
  holderCount: bigint = BigInt(0);
  isInitialized: boolean = false;
  transactionPending: boolean = false;
  approvedToken0: BigInt = BigInt(0);
  approvedToken1: BigInt = BigInt(0);
  pool: PairContract | undefined = undefined;

  recentTransactions: (VaultDeposit | VaultWithdraw | VaultCollectFee)[] = [];

  get userTokenAmountsWithoutDecimal() {
    if (
      !this.totalsupplyShares ||
      !this.userShares ||
      !this.totalAmountsWithoutDecimal.total0 ||
      !this.totalAmountsWithoutDecimal.total1
    )
      return { total0: 0, total1: 0 };
    return {
      total0:
        (this.totalAmountsWithoutDecimal.total0 * this.userShares) /
        this.totalsupplyShares,
      total1:
        (this.totalAmountsWithoutDecimal.total1 * this.userShares) /
        this.totalsupplyShares,
    };
  }

  get userTokenAmounts() {
    if (!this.token0 || !this.token1) return { total0: 0, total1: 0 };
    return {
      total0: new BigNumber(
        this.userTokenAmountsWithoutDecimal.total0.toString()
      )
        .dividedBy(10 ** Number(this.token0.decimals))
        .toString(),
      total1: new BigNumber(
        this.userTokenAmountsWithoutDecimal.total1.toString()
      )
        .dividedBy(10 ** Number(this.token1.decimals))
        .toString(),
    };
  }

  constructor(args: Partial<ICHIVaultContract>) {
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

  async getTotalAmounts() {
    const totalAmounts = await this.contract.read.getTotalAmounts();
    this.totalAmountsWithoutDecimal = {
      total0: BigInt(totalAmounts[0]),
      total1: BigInt(totalAmounts[1]),
    };
    return totalAmounts;
  }

  async getToken0() {
    const token0 = await this.contract.read.token0();
    this.token0 = Token.getToken({ chainId: wallet.currentChainId.toString(), address: token0 });
    return this.token0;
  }

  async getToken1() {
    const token1 = await this.contract.read.token1();
    this.token1 = Token.getToken({ chainId: wallet.currentChainId.toString(), address: token1 });
    return this.token1;
  }

  async getTotalSupply() {
    const totalSupply = await this.contract.read.totalSupply();
    this.totalsupplyShares = BigInt(totalSupply);
    return totalSupply;
  }

  // Example function using ABI
  async getBalanceOf(account: string) {
    const balance = await this.contract.read.balanceOf([
      account as `0x${string}`,
    ]);
    this.userShares = BigInt(balance);
    return balance;
  }

  async deposit(deposit0: bigint, deposit1: bigint, to: string) {
    this.transactionPending = true;
    if (!wallet.walletClient?.account) {
      return;
    }
    return await new ContractWrite(this.contract.write.deposit, {
      action: 'deposit',
    })
      .call([deposit0, deposit1, to as `0x${string}`])
      .finally(() => {
        this.transactionPending = false;
      });
  }

  async withdraw(shares: bigint, to: string) {
    this.transactionPending = true;
    if (!wallet.walletClient?.account) {
      return;
    }
    return await new ContractWrite(this.contract.write.withdraw, {
      action: 'withdraw',
    })
      .call([shares, to as `0x${string}`])
      .finally(() => {
        this.transactionPending = false;
      });
  }

  // async getFee() {
  //   const fee = await this.contract.read.fee();
  //   this.fee = fee;
  //   return fee;
  // }

  // async collectFees() {
  //   return await new ContractWrite(this.contract.write.collectFees, {
  //     action: "Collect Fees",
  //   }).call();
  // }
}
