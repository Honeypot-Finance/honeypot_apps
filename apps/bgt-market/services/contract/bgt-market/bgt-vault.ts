import { BaseContract } from './..';
import { wallet } from '@honeypot/shared/lib/wallet';
import { makeAutoObservable, runInAction } from 'mobx';
import { Address, getContract, zeroAddress } from 'viem';
import { ICHIVaultFactoryABI } from '@/lib/abis/aquabera/ICHIVaultFactory';
import { ContractWrite } from '@honeypot/shared';
import { RewardVaultABI } from '@/lib/abis/bgt-market/RewardVaultABI';
import { chain } from '@/services/chain';
import { bgtRegistry } from '@/services/contract/bgt-registry';

export class BGTVault implements BaseContract {
  static bgtVaultMap: Record<string, BGTVault> = {};
  static getBgtVault({
    address,
    force,
    ...args
  }: {
    address: Address;
    force?: boolean;
  } & Partial<BGTVault>) {
    const lowerAddress = address.toLowerCase() as Address;
    const key = lowerAddress;
    const vault = BGTVault.bgtVaultMap[key];

    if (!vault) {
      BGTVault.bgtVaultMap[key] = new BGTVault({
        address: lowerAddress,
        ...args,
      });
    } else {
      vault.setData(args);
    }

    return BGTVault.bgtVaultMap[key];
  }
  address: Address = zeroAddress;
  name: string = 'BGTVault';
  abi = RewardVaultABI;
  userBgtInVault = '0';
  bgtVaultApproved = false;
  logoURI: string = '';

  constructor(args: Partial<BGTVault>) {
    Object.assign(this, args);
    makeAutoObservable(this);
  }

  setData({ ...args }: Partial<BGTVault>) {
    runInAction(() => {
      Object.assign(this, args);
    });
  }

  get contract() {
    return getContract({
      address: this.address as `0x${string}`,
      abi: this.abi,
      client: { public: wallet.publicClient, wallet: wallet.walletClient },
    });
  }

  async setOperatorIfNot(clientAddress: Address, OperatorAddress: Address) {
    const vaultOperator = await this.readOperator(
      clientAddress.toLowerCase() as Address
    );

    if (vaultOperator.toLowerCase() != OperatorAddress.toLowerCase()) {
      await this.setOperator(OperatorAddress.toLowerCase() as Address);
    }
  }

  readOperator(account: Address) {
    return this.contract.read.operator([account]);
  }

  async updateCurrentUserBgtInVault() {
    if (!wallet.account || this.address === zeroAddress) return '0';

    const userBgt = await this.contract.read.earned([
      wallet.account as Address,
    ]);

    runInAction(() => {
      this.userBgtInVault = userBgt.toString();
    });
    return userBgt;
  }

  async updateCurrentUserBgtVaultAppoveState() {
    if (!wallet.account || this.address === zeroAddress) return false;

    const operator = await this.readOperator(wallet.account as Address);

    const isBgtMarketContractApproved =
      operator === bgtRegistry.addresses.bgtMarket;

    if (isBgtMarketContractApproved) {
      runInAction(() => {
        this.bgtVaultApproved = true;
      });
    } else {
      runInAction(() => {
        this.bgtVaultApproved = false;
      });
    }

    return isBgtMarketContractApproved;
  }

  async readAddressBgtInVault(account: Address) {
    const userBgt = await this.contract.read.earned([account]);
    return userBgt;
  }

  setOperator(account: Address) {
    return new ContractWrite(this.contract.write.setOperator, {
      action: 'Setting Vault Operator',
    }).call([account]);
  }
}
