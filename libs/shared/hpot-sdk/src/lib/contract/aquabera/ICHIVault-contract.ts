import { BaseContract } from './../baseContract';
import { wallet } from '../../wallet/wallet';
import { makeAutoObservable } from 'mobx';
import { Address, getContract, GetContractReturnType, zeroAddress } from 'viem';
import { ICHIVaultABI } from '../../abis/aquabera/ICHIVault';
import { ContractWrite } from '../../utils/utils';
import BigNumber from 'bignumber.js';
import { Token } from '../token/token';
import { VaultDeposit } from '../../graphql/generated/graphql';
import { VaultWithdraw } from '../../graphql/generated/graphql';
import { VaultCollectFee } from '../../graphql/generated/graphql';
import { ReactNode } from 'react';
import { PairContract } from '../dex/liquidity/pair-contract';
import { BGTVaultFactory } from '../rewardVault/bgt-vault-factory';

type VaultTag = {
  tag: string;
  bgColor: string;
  textColor: string;
  tooltip?: string;
};

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
    } else {
      vault.setData(args);
    }
    return vault;
  }

  static setVault(address: `0x${string}`, vault: ICHIVaultContract) {
    this.vaultsMap.set(address.toLowerCase(), vault);
  }

  address: Address = zeroAddress;
  name: string = 'ICHIVault';
  abi = ICHIVaultABI;
  fee = 0;
  totalAmountsWithoutDecimal: {
    total0: bigint | undefined;
    total1: bigint | undefined;
  } = {
    total0: undefined,
    total1: undefined,
  };
  token0: Token | undefined = undefined;
  token1: Token | undefined = undefined;
  allowToken0: boolean = false;
  allowToken1: boolean = false;
  totalsupplyShares: bigint | undefined = undefined;
  userShares: bigint | undefined = undefined;
  holderCount: bigint | undefined = undefined;
  isInitialized: boolean = false;
  transactionPending: boolean = false;
  approvedToken0: BigInt = BigInt(0);
  approvedToken1: BigInt = BigInt(0);
  pool: PairContract | undefined = undefined;
  apr: number = 0;
  detailedApr: {
    feeApr_1d: number;
    feeApr_3d: number;
    feeApr_7d: number;
    feeApr_30d: number;
  } = {
    feeApr_1d: 0,
    feeApr_3d: 0,
    feeApr_7d: 0,
    feeApr_30d: 0,
  };
  vaultTag: VaultTag | undefined = undefined;
  vaultDescription: string | ReactNode | undefined = undefined;
  bgtVaultAddress: Address | undefined = undefined;
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
      this.totalAmountsWithoutDecimal.total0 === undefined ||
      this.totalAmountsWithoutDecimal.total1 === undefined
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
    if (this.token0 === undefined || this.token1 === undefined)
      return { total0: 0, total1: 0 };
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

  get contract(): GetContractReturnType<
    typeof ICHIVaultABI,
    typeof wallet.walletClient
  > {
    return getContract({
      address: this.address as `0x${string}`,
      abi: this.abi,
      client: { public: wallet.publicClient, wallet: wallet.walletClient },
    });
  }

  async getTotalAmounts() {
    if (
      this.totalAmountsWithoutDecimal.total0 !== undefined &&
      this.totalAmountsWithoutDecimal.total1 !== undefined
    ) {
      return this.totalAmountsWithoutDecimal;
    }

    // Check if contract is available before calling
    if (!this.contract || !wallet.publicClient) {
      throw new Error(`Contract not available for vault ${this.address}. Wallet may not be properly initialized.`);
    }

    const totalAmounts = await this.contract.read.getTotalAmounts();
    this.totalAmountsWithoutDecimal = {
      total0: BigInt(totalAmounts[0]),
      total1: BigInt(totalAmounts[1]),
    };
    return totalAmounts;
  }

  async getToken0() {
    if (this.token0 !== undefined) return this.token0;
    if (!this.contract || !wallet.publicClient) {
      throw new Error(`Contract not available for vault ${this.address}. Wallet may not be properly initialized.`);
    }
    const token0 = await this.contract.read.token0();
    this.token0 = Token.getToken({
      address: token0,
      chainId: wallet.currentChainId.toString(),
    });
    return this.token0;
  }

  async getToken1() {
    if (this.token1 !== undefined) return this.token1;
    if (!this.contract || !wallet.publicClient) {
      throw new Error(`Contract not available for vault ${this.address}. Wallet may not be properly initialized.`);
    }
    const token1 = await this.contract.read.token1();
    this.token1 = Token.getToken({
      address: token1,
      chainId: wallet.currentChainId.toString(),
    });
    return this.token1;
  }

  async getTotalSupply() {
    if (this.totalsupplyShares !== undefined) return this.totalsupplyShares;
    if (!this.contract || !wallet.publicClient) {
      throw new Error(`Contract not available for vault ${this.address}. Wallet may not be properly initialized.`);
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
      action: 'deposit',
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
      action: 'withdraw',
    })
      .call([shares, to as `0x${string}`])
      .finally(() => {
        this.transactionPending = false;
      });
  }

  setData(args: Partial<ICHIVaultContract>) {
    Object.assign(this, args);
  }

  async getBgtVaultAddress() {
    if (!wallet.contracts.rewardVaultFactory || !this.address) {
      return;
    }

    if (this.bgtVaultAddress !== undefined) return this.bgtVaultAddress;

    const bgtVaultAddress =
      await wallet.contracts.rewardVaultFactory.loadBgtVaultAddressByStakingToken(
        this.address
      );

    this.bgtVaultAddress = bgtVaultAddress;
    return bgtVaultAddress;
  }
}
