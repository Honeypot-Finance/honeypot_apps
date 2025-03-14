import { BaseContract } from "./..";
import { wallet } from "@/services/wallet";
import { makeAutoObservable } from "mobx";
import { Address, getContract, zeroAddress } from "viem";
import { ICHIVaultABI } from "@/lib/abis/aquabera/ICHIVault";
import { writeContract } from "viem/actions";
import { ContractWrite } from "@/services/utils";
import BigNumber from "bignumber.js";
import { Token } from "../token";
import { PairContract } from "../dex/liquidity/pair-contract";
import { VaultDeposit } from "@/lib/algebra/graphql/generated/graphql";
import { VaultWithdraw } from "@/lib/algebra/graphql/generated/graphql";
import { VaultCollectFee } from "@/lib/algebra/graphql/generated/graphql";

export class ICHIVaultContract implements BaseContract {
  static vaultsMap: Map<string, ICHIVaultContract> = new Map();
  static getVault({
    address,
    ...args
  }: { address: `0x${string}` } & Partial<ICHIVaultContract>) {
    if (!address) {
      return;
    }
    const vault = this.vaultsMap.get(address.toLowerCase());
    if (!vault) {
      const vault = new ICHIVaultContract({
        address: address as `0x${string}`,
        ...args,
      });
      this.vaultsMap.set(address.toLowerCase(), vault);
      return vault;
    }
    return vault;
  }
  static setVault(address: `0x${string}`, vault: ICHIVaultContract) {
    this.vaultsMap.set(address.toLowerCase(), vault);
  }

  address: Address = zeroAddress;
  name: string = "ICHIVault";
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

  get tvlUSD() {
    return (
      Number(this.totalSupply.total0) * Number(this.token0?.derivedUSD ?? 0) +
      Number(this.totalSupply.total1) * Number(this.token1?.derivedUSD ?? 0)
    );
  }

  get totalSupply() {
    if (!this.totalAmountsWithoutDecimal) return { total0: 0, total1: 0 };
    return {
      total0: (
        Number(this.totalAmountsWithoutDecimal.total0) /
        10 ** (this.token0?.decimals ?? 18)
      ).toString(),
      total1: (
        Number(this.totalAmountsWithoutDecimal.total1) /
        10 ** (this.token1?.decimals ?? 18)
      ).toString(),
    };
  }

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
  get userTVLUSD() {
    return (
      Number(this.userTokenAmounts.total0) *
        Number(this.token0?.derivedUSD ?? 0) +
      Number(this.userTokenAmounts.total1) *
        Number(this.token1?.derivedUSD ?? 0)
    );
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
    if (!this.contract) {
      return;
    }
    const token0 = await this.contract.read.token0();
    this.token0 = Token.getToken({ address: token0 });
    return this.token0;
  }

  async getToken1() {
    if (!this.contract) {
      return;
    }
    const token1 = await this.contract.read.token1();
    this.token1 = Token.getToken({ address: token1 });
    return this.token1;
  }

  async getTotalSupply() {
    if (!this.contract) {
      return;
    }
    const totalSupply = await this.contract.read.totalSupply();
    this.totalsupplyShares = BigInt(totalSupply);
    return totalSupply;
  }

  // Example function using ABI
  async getBalanceOf(account: string) {
    if (!this.contract) {
      return;
    }
    const balance = await this.contract.read.balanceOf([
      account as `0x${string}`,
    ]);
    this.userShares = BigInt(balance);
    return balance;
  }

  async deposit(deposit0: bigint, deposit1: bigint, to: string) {
    if (!this.contract) {
      return;
    }
    this.transactionPending = true;
    if (!wallet.walletClient?.account) {
      return;
    }
    return await new ContractWrite(this.contract.write.deposit, {
      action: "deposit",
    })
      .call([deposit0, deposit1, to as `0x${string}`])
      .finally(() => {
        this.transactionPending = false;
      });
  }

  async withdraw(shares: bigint, to: string) {
    if (!this.contract) {
      return;
    }
    this.transactionPending = true;
    if (!wallet.walletClient?.account) {
      return;
    }
    return await new ContractWrite(this.contract.write.withdraw, {
      action: "withdraw",
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
