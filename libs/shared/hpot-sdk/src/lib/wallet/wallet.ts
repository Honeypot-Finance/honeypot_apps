'use client';
import { Network, networks } from '../../config/chains/chain';
import BigNumber from 'bignumber.js';
import { Address, PublicClient, WalletClient, zeroAddress } from 'viem';
import { FtoFactoryContract } from '../contract/launches/fto/ftofactory-contract';
import { FtoFacadeContract } from '../contract/launches/fto/ftofacade-contract';
import { makeAutoObservable, reaction, runInAction } from 'mobx';
import { createPublicClientByChain } from './client';
import { StorageState } from '../utils/utils';
import { MemeFactoryContract } from '../contract/launches/pot2pump/memefactory-contract';
import { MEMEFacadeContract } from '../contract/launches/pot2pump/memefacade-contract';
import { ICHIVaultFactoryContract } from '../contract/aquabera/ICHIVaultFactory-contract';
import { DEFAULT_CHAIN_ID } from '../../config/algebra/default-chain-id';
import { ICHIVaultVolatilityCheckContract } from '../contract/aquabera/ICHIVaultVolatilityCheckContract';
import { AlgebraSwapRouterContract } from '../contract/algebra/algebra-swap-router';
import { UniversalAccount } from './universalAccount';
import { BGTVaultFactory } from '../contract/rewardVault/bgt-vault-factory';
import { VaultStakerFactory } from '../contract/aquabera/VaultStaker/VaultStakerFactory';

export class Wallet {
  account: string = '';
  accountShort = '';
  networks: Network[] = [];
  balance: BigNumber = new BigNumber(0);
  walletClient!: WalletClient;
  currentChainId: number = DEFAULT_CHAIN_ID;
  contracts: {
    ftofactory: FtoFactoryContract;
    ftofacade: FtoFacadeContract;
    memeFactory: MemeFactoryContract;
    memeFacade: MEMEFacadeContract;
    vaultFactory: ICHIVaultFactoryContract;
    vaultVolatilityCheck: ICHIVaultVolatilityCheckContract;
    algebraSwapRouter: AlgebraSwapRouterContract;
    rewardVaultFactory: BGTVaultFactory;
    vaultStakerFactory: VaultStakerFactory;
  } = {} as any;
  publicClient!: PublicClient;
  isInit = false;
  get networksMap() {
    return this.networks.reduce((acc, network) => {
      acc[network.chainId] = network;
      return acc;
    }, {} as Record<number, Network>);
  }
  universalAccount: UniversalAccount | undefined = undefined;

  get walletBalance() {
    if (this.account === zeroAddress) {
      return new BigNumber(0);
    }
    return this.balance.div(10 ** 18);
  }

  get currentChain() {
    return this.networksMap[this.currentChainId];
  }

  get isUserConnected() {
    return this.account && this.account !== zeroAddress;
  }

  constructor(args: Partial<Wallet>) {
    makeAutoObservable(this, {
      networksMap: false,
      currentChain: false,
    });
    reaction(
      () => this.walletClient?.account,
      () => {
        this.initWallet(this.walletClient);
      }
    );
    reaction(
      () => this.walletClient?.chain,
      () => {
        this.initWallet(this.walletClient);
      }
    );
  }

  changeChain(chainId: number) {
    this.currentChainId = chainId;
    this.walletClient.switchChain({
      id: chainId,
    });
    this.initWallet(this.walletClient);
  }

  async initWallet(walletClient?: WalletClient) {
    console.log('[Wallet.initWallet] Starting');
    console.log('[Wallet.initWallet] networks from import:', networks);
    console.log('[Wallet.initWallet] networks count:', networks?.length);
    this.networks = networks;
    this.currentChainId = walletClient?.chain?.id || DEFAULT_CHAIN_ID;
    console.log('[Wallet.initWallet] currentChainId:', this.currentChainId);
    const mockAccount = localStorage.getItem('mockAccount');
    this.account = mockAccount || walletClient?.account?.address || zeroAddress;
    this.contracts = {
      rewardVaultFactory: new BGTVaultFactory({
        address: this.currentChain.contracts.rewardVaultFactory as Address,
      }),
      algebraSwapRouter: new AlgebraSwapRouterContract({
        address: this.currentChain.contracts.algebraSwapRouter as `0x${string}`,
      }),
      ftofactory: new FtoFactoryContract({
        address: this.currentChain.contracts.ftoFactory,
      }),
      ftofacade: new FtoFacadeContract({
        address: this.currentChain.contracts.ftoFacade,
      }),
      memeFactory: new MemeFactoryContract({
        address: this.currentChain.contracts.memeFactory,
      }),
      memeFacade: new MEMEFacadeContract({
        address: this.currentChain.contracts.memeFacade,
      }),
      vaultFactory: new ICHIVaultFactoryContract({
        address: this.currentChain.contracts.vaultFactory as Address,
      }),
      vaultVolatilityCheck: new ICHIVaultVolatilityCheckContract({
        address: this.currentChain.contracts.vaultVolatilityCheck as Address,
      }),
      vaultStakerFactory: new VaultStakerFactory({
        address: this.currentChain.contracts.vaultStakerFactory as Address,
      }),
    };
    this.publicClient = createPublicClientByChain(
      this.currentChain.chain
    ) as any;
    if (walletClient) {
      this.walletClient = walletClient;
      walletClient.switchChain({
        id: this.currentChainId,
      });
    }
    console.log('[Wallet.initWallet] About to call currentChain.init()');
    console.log('[Wallet.initWallet] currentChain:', this.currentChain);
    console.log('[Wallet.initWallet] currentChain chainId:', this.currentChain?.chainId);
    this.currentChain.init();
    console.log('[Wallet.initWallet] After currentChain.init()');
    console.log('[Wallet.initWallet] currentChain.validatedTokens:', this.currentChain?.validatedTokens);
    await StorageState.sync();

    if (this.account && this.account !== zeroAddress) {
      runInAction(() => {
        this.universalAccount = new UniversalAccount(this.account);
      });
      await this.universalAccount?.loadUniversalAccountInfo();
    } else {
      runInAction(() => {
        this.universalAccount = undefined;
      });
    }

    runInAction(() => {
      this.isInit = true;
    });
  }
}

export const wallet = new Wallet({});
