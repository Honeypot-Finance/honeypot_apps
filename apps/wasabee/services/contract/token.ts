import BigNumber from 'bignumber.js';
import { BaseContract } from '.';
import { wallet } from '../wallet';
import { get, makeAutoObservable, reaction } from 'mobx';
import { Address, getContract, zeroAddress } from 'viem';
import { ContractWrite } from '../utils';
import { amountFormatted } from '@/lib/format';
import { ERC20ABI } from '@/lib/abis/erc20';
import { faucetABI } from '@/lib/abis/faucet';
import { watchAsset } from 'viem/actions';
import { networksMap } from '../chain';
import { WrappedToastify } from '@/lib/wrappedToastify';
import { trpcClient } from '@/lib/trpc';
import NetworkManager from '../network';
import { getSingleTokenData } from '@/lib/algebra/graphql/clients/token';
import { when } from 'mobx';
import { Token as IndexerToken } from '@/lib/algebra/graphql/generated/graphql';
export class Token implements BaseContract {
  static tokensMap: Record<string, Token> = {};
  static getToken({
    address,
    chainId,
    force,
    ...args
  }: {
    address: string;
    force?: boolean;
    chainId: string;
  } & Partial<Token>) {
    const lowerAddress = address.toLowerCase();
    const key = `${lowerAddress}--${chainId}--${
      args.isNative ? 'native' : 'erc20'
    }`;
    const token = Token.tokensMap[key];

    if (!token) {
      Token.tokensMap[key] = new Token({
        address: lowerAddress,
        chainId,
        ...args,
      });
    } else {
      Token.tokensMap[key].setData(args);
    }

    if (force) {
      Token.tokensMap[key].init(force);
    }
    return Token.tokensMap[key];
  }
  chainId: string = '';
  address: string = '';
  name: string = '';
  balanceWithoutDecimals = new BigNumber(0);
  totalSupplyWithoutDecimals = new BigNumber(0);
  symbol: string = '';
  decimals: number = 18;
  abi = ERC20ABI;
  faucetLoading = false;
  claimed = false;
  isInit = false;
  isNative = false;
  logoURI = '';
  isRouterToken = false;
  supportingFeeOnTransferTokens = false;
  isPopular = false;
  derivedETH = '';
  derivedUSD = '';
  holderCount = '';
  swapCount = '';
  indexerDataLoaded = false;
  volumeUSD = '';
  initialUSD = '';
  totalValueLockedUSD = '';
  poolCount = 0;
  priceChange = '';
  priceChange24hPercentage = '';
  pot2pumpAddress: Address | undefined | null = undefined;
  isStableCoin = false;
  isBitgetCampaignToken = false;

  // determines the order of the token in the list
  get priority() {
    let score = 0;

    if (this.isNative) {
      score += 1;
    }

    if (this.isRouterToken) {
      score += 1;
    }

    if (this.balance.toNumber() > 0) {
      score += 1;
    }

    return score;
  }

  get displayName() {
    return this.symbol || this.name;
  }

  get marketCap() {
    return (
      Number(this.derivedUSD) *
      this.totalSupplyWithoutDecimals.div(10 ** this.decimals).toNumber()
    );
  }

  get faucetContract() {
    return getContract({
      address: this.address as `0x${string}`,
      abi: faucetABI,
      client: { public: wallet.publicClient, wallet: wallet.walletClient },
    });
  }

  get contract() {
    return getContract({
      address: this.address as `0x${string}`,
      abi: this.abi,
      client: { public: wallet.publicClient, wallet: wallet.walletClient },
    });
  }

  constructor(args: Partial<Token>) {
    this.setData(args);
    makeAutoObservable(this);
    this.getIsRouterToken();
  }

  get faucet() {
    return new ContractWrite(this.faucetContract.write?.faucet, {
      action: 'Get Faucet',
    });
  }

  get approve() {
    return new ContractWrite(this.contract.write?.approve, {
      action: 'Approve',
    });
  }

  get deposit() {
    return new ContractWrite(this.contract.write?.deposit, {
      action: 'Swap BERA to WBERA',
    });
  }

  get withdraw() {
    return new ContractWrite(this.contract.write?.withdraw, {
      action: 'Swap WBERA to BERA',
    });
  }

  async loadLogoURI(force?: boolean) {
    // console.log("this.logoURI", this.logoURI);
    if (!!this.logoURI || !wallet.isInit) {
      return;
    }

    if (!force) {
      //cache the logoURI
      const cachedLocalLogoURI = localStorage.getItem(
        `token-logo-uri-${wallet.currentChainId}-${this.address.toLowerCase()}`
      );

      if (
        !!cachedLocalLogoURI &&
        cachedLocalLogoURI !== 'null' &&
        cachedLocalLogoURI !== 'undefined'
      ) {
        this.setLogoURI(cachedLocalLogoURI);
        return this.logoURI;
      }
    }

    if (
      wallet.currentChain.validatedTokensInfo[this.address.toLowerCase()]
        ?.logoURI
    ) {
      this.setLogoURI(
        wallet.currentChain.validatedTokensInfo[this.address.toLowerCase()]
          ?.logoURI
      );
      return;
    }

    await this.getPot2PumpAddress();

    if (!this.pot2pumpAddress) {
      return;
    }

    console.log('this. wallet.currentChainId,', wallet.currentChainId);
    console.log('this. pot2pumpAddress', this.pot2pumpAddress);
    const launch = await trpcClient.projects.getProjectInfo.query({
      chain_id: wallet.currentChainId,
      pair: this.pot2pumpAddress.toLowerCase(),
    });

    console.log('launch', launch);

    launch?.logo_url && this.setLogoURI(launch.logo_url);

    console.log('this.logoURI', this.logoURI);

    return this.logoURI;
  }

  setLogoURI(logoURI: string) {
    localStorage.setItem(
      `token-logo-uri-${wallet.currentChainId}-${this.address.toLowerCase()}`,
      logoURI
    );

    this.logoURI = logoURI;
  }

  setData({ balance, ...args }: Partial<Token>) {
    Object.assign(this, args);
    if (balance) {
      this.balanceWithoutDecimals = new BigNumber(balance);
    }
  }

  async init(
    force?: boolean,
    options?: {
      loadName?: boolean;
      loadSymbol?: boolean;
      loadDecimals?: boolean;
      loadBalance?: boolean;
      loadTotalSupply?: boolean;
      loadClaimed?: boolean;
      loadLogoURI?: boolean;
      loadIndexerTokenData?: boolean;
    }
  ) {
    if (this.isInit && !force) {
      return;
    }
    const loadName = options?.loadName ?? true;
    const loadSymbol = options?.loadSymbol ?? true;
    const loadDecimals = options?.loadDecimals ?? true;
    const loadBalance = options?.loadBalance ?? true;
    const loadTotalSupply = options?.loadTotalSupply ?? false;
    const loadClaimed = options?.loadClaimed ?? false;
    const loadLogoURI = options?.loadLogoURI ?? true;
    const loadIndexerTokenData = options?.loadIndexerTokenData ?? false;
    await when(() => wallet.isInit);

    await Promise.all([
      loadName && !this.name ? this.loadName(force) : Promise.resolve(),
      loadSymbol && !this.symbol ? this.loadSymbol(force) : Promise.resolve(),
      loadDecimals && !this.decimals
        ? this.loadDecimals(force)
        : Promise.resolve(),
      loadBalance ? this.getBalance() : Promise.resolve(),
      loadTotalSupply ? this.getTotalSupply(force) : Promise.resolve(),
      loadClaimed
        ? this.getClaimed().then((claimed) => {
            this.claimed = claimed;
          })
        : Promise.resolve(),
      loadIndexerTokenData
        ? this.getIndexerTokenData({ force })
        : Promise.resolve(),
      loadLogoURI ? this.loadLogoURI(force) : Promise.resolve(),
    ]).catch((e) => {
      console.log(e);
      return;
    });

    this.isInit = true;

    return this;
  }

  async loadName(force?: boolean) {
    if (this.address === zeroAddress || this.isNative) {
      this.name = wallet.currentChain.nativeToken.name;
      return;
    }

    if (!force) {
      const cachedName = localStorage.getItem(
        `token-name-${this.address.toLowerCase()}`
      );
      if (!!cachedName && cachedName !== 'null' && cachedName !== 'undefined') {
        this.name = cachedName;
        return;
      }
    }

    const name = await this.contract.read.name();

    this.name = name;

    localStorage.setItem(
      `token-name-${wallet.currentChainId}-${this.address.toLowerCase()}`,
      name
    );

    return name;
  }

  async loadSymbol(force?: boolean) {
    if (this.isNative || this.address === zeroAddress) {
      this.symbol = wallet.currentChain.nativeToken.symbol;
      return;
    }

    if (!force) {
      const cachedSymbol = localStorage.getItem(
        `token-symbol-${wallet.currentChainId}-${this.address.toLowerCase()}`
      );
      if (
        !!cachedSymbol &&
        cachedSymbol !== 'null' &&
        cachedSymbol !== 'undefined'
      ) {
        this.symbol = cachedSymbol;
        return;
      }
    }

    const symbol = await this.contract.read.symbol();
    this.symbol = symbol;

    localStorage.setItem(
      `token-symbol-${wallet.currentChainId}-${this.address.toLowerCase()}`,
      symbol
    );

    return symbol;
  }

  async loadDecimals(force?: boolean) {
    if (!force) {
      const cachedDecimals = localStorage.getItem(
        `token-decimals-${wallet.currentChainId}-${this.address.toLowerCase()}`
      );
      if (
        !!cachedDecimals &&
        cachedDecimals !== 'null' &&
        cachedDecimals !== 'undefined'
      ) {
        this.decimals = parseInt(cachedDecimals);
        return;
      }
    }

    const decimals = await this.contract.read.decimals();
    this.decimals = decimals;

    localStorage.setItem(
      `token-decimals-${wallet.currentChainId}-${this.address.toLowerCase()}`,
      decimals.toString()
    );

    return decimals;
  }

  async approveIfNoAllowance({
    amount,
    spender,
  }: {
    amount: string;
    spender: string;
  }) {
    const allowance = await this.contract.read.allowance([
      wallet.account as `0x${string}`,
      spender as `0x${string}`,
    ]);
    if (
      new BigNumber(allowance.toString()).isGreaterThanOrEqualTo(
        new BigNumber(amount)
      )
    ) {
      return;
    }
    await this.approve.call([spender as `0x${string}`, BigInt(amount)]);
  }

  async getPot2PumpAddress() {
    if (this.pot2pumpAddress !== undefined) {
      return this.pot2pumpAddress;
    }

    const cachedPot2PumpAddress = localStorage.getItem(
      `token-pot2pump-${wallet.currentChainId}-${this.address.toLowerCase()}`
    );

    if (cachedPot2PumpAddress) {
      this.pot2pumpAddress = cachedPot2PumpAddress as Address;
      return cachedPot2PumpAddress;
    }

    const pot2pumpAddress = await wallet.contracts.memeFactory.contract.read
      .getPair([this.address as Address])
      .catch((e: any) => {
        console.error(e);
        return zeroAddress;
      });

    if (pot2pumpAddress === zeroAddress) {
      this.pot2pumpAddress = null;
      return null;
    }
    this.pot2pumpAddress = pot2pumpAddress;
    localStorage.setItem(
      `token-pot2pump-${wallet.currentChainId}-${this.address.toLowerCase()}`,
      pot2pumpAddress as `0x${string}`
    );
    return pot2pumpAddress;
  }

  async getClaimed(): Promise<boolean> {
    console.log('getClaimed');
    const claimed = await this.faucetContract.read.faucetClaimer([
      wallet.account as `0x${string}`,
    ]);

    return claimed;
  }

  async getBalance() {
    if (!wallet.isInit || !wallet.walletClient) {
      console.log('wallet not init');
      return new BigNumber(0);
    }
    try {
      const balance =
        this.isNative || this.address === zeroAddress
          ? await wallet.publicClient.getBalance({
              address: wallet.account as `0x${string}`,
            })
          : await this.contract.read.balanceOf([
              wallet.account as `0x${string}`,
            ]);
      this.balanceWithoutDecimals = new BigNumber(balance.toString());
      return this.balanceWithoutDecimals;
    } catch (e) {
      console.log(e);
      console.log('error loading balance', this.address);
      return new BigNumber(0);
    }
  }

  async getTotalSupply(force?: boolean) {
    if (!force) {
      const cachedTotalSupply = localStorage.getItem(
        `token-totalSupply-${
          wallet.currentChainId
        }-${this.address.toLowerCase()}`
      );
      if (cachedTotalSupply) {
        this.totalSupplyWithoutDecimals = new BigNumber(cachedTotalSupply);
        return this.totalSupplyWithoutDecimals;
      }
    }

    const totalSupply = await this.contract.read.totalSupply();

    this.totalSupplyWithoutDecimals = new BigNumber(totalSupply.toString());

    localStorage.setItem(
      `token-totalSupply-${
        wallet.currentChainId
      }-${this.address.toLowerCase()}`,
      totalSupply.toString()
    );

    return this.totalSupplyWithoutDecimals;
  }

  get balance() {
    // console.log('this.balanceWithoutDecimals', this.balanceWithoutDecimals)
    return this.balanceWithoutDecimals.div(
      new BigNumber(10).pow(this.decimals)
    );
  }

  get balanceFormatted() {
    return amountFormatted(this.balanceWithoutDecimals, {
      decimals: this.decimals,
      fixed: 3,
    });
  }

  getIsRouterToken() {
    const networkManager = NetworkManager.getInstance();

    const currentChainId = wallet.isInit
      ? wallet.currentChainId
      : networkManager.getSelectedNetwork()?.chainId;

    if (currentChainId) {
      this.isRouterToken =
        networksMap[currentChainId].validatedTokensInfo[
          this.address.toLowerCase()
        ]?.isRouterToken;
      return this.isRouterToken;
    }
    return false;
  }

  getSupportedFeeOnTransferTokens() {
    this.supportingFeeOnTransferTokens =
      networksMap[wallet.currentChainId].validatedTokensInfo[
        this.address.toLowerCase()
      ]?.supportingFeeOnTransferTokens;
    return this.supportingFeeOnTransferTokens;
  }

  async getIndexerTokenData(option?: { force?: boolean }) {
    if (this.indexerDataLoaded && !option?.force) {
      return;
    }
    // const indexerTokenData =
    //   await trpcClient.indexerFeedRouter.getPairTokenData.query({
    //     tokenAddress: this.address,
    //     chainId: wallet.currentChainId.toString(),
    //   });

    // //console.log("indexerTokenData", indexerTokenData);

    // if (indexerTokenData.status === "success") {
    //   Object.assign(this, indexerTokenData.data);
    // }

    const indexerTokenData = await getSingleTokenData(
      this.address.toLowerCase()
    );
    console.log('indexerTokenData', indexerTokenData);

    if (!indexerTokenData) {
      return;
    }

    if (indexerTokenData) {
      this.assignIndexerTokenData(indexerTokenData);
    }

    this.indexerDataLoaded = true;
  }

  assignIndexerTokenData(tokenData: IndexerToken) {
    //exclude marketCap, name, symbol,
    const { marketCap, name, symbol, ...rest } = tokenData;

    Object.assign(this, {
      ...rest,
      address: tokenData.id,
      decimals: Number(tokenData.decimals),
      derivedETH: tokenData.derivedMatic,
    });

    this.indexerDataLoaded = true;
  }

  async watch() {
    watchAsset(wallet.walletClient, {
      type: 'ERC20',
      options: {
        address: this.address,
        symbol: this.symbol,
        decimals: this.decimals,
        image: this.logoURI,
      },
    })
      .then(() => {
        WrappedToastify.success({
          title: this.symbol,
          message: 'Token added to wallet',
        });
      })
      .catch((e) => {
        WrappedToastify.error({
          title: this.symbol,
          message: 'Failed to add token to wallet',
        });
      });
  }
}
