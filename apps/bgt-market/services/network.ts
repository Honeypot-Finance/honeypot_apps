import { Token } from '@honeypot/shared';
import { Chain } from 'viem/chains';
import { berachain } from '@/lib/chain';
import { ALGEBRA_POSITION_MANAGER } from '@/config/algebra/addresses';
import { wallet } from '@honeypot/shared/lib/wallet';

export class Network {
  isActive: boolean = true;
  get chainId() {
    return this.chain.id;
  }
  platformTokenAddress!: {
    HPOT: string;
  };
  contracts!: {
    routerV3: string;
    routerV2: string;
    factory: string;
    ftoFactory: string;
    ftoFacade: string;
    memeFactory: string;
    memeFacade: string;
    vaultFactory: string;
    bgtMarket: string;
    heyBgt: string;
    ftoTokens: Partial<Token>[];
  };
  nativeToken!: Token;
  raisedTokenData!: {
    symbol: string;
    address: string;
    amount: bigint;
  }[];
  faucetTokens: Token[] = [];
  nativeFaucet?: {
    address: string;
    name: string;
    requirements: string;
  };
  chain!: Chain;
  officialFaucets?: {
    url: string;
    name: string;
    logoURI?: string;
  }[];
  blacklist?: {
    poolBlacklist?: string[];
    memeBlacklist?: string[];
  };
  validatedTokens: Token[] = [];
  validatedTokensInfo: Record<string, Token> = {};
  validatedFtoAddresses: string[] = [];
  validatedMemeAddresses: string[] = [];
  constructor(
    args: Omit<
      Partial<Network>,
      'faucetTokens' | 'nativeToken' | 'validatedTokensInfo'
    > & {
      faucetTokens: Partial<Token>[];
      nativeToken: Partial<Token>;
      validatedTokensInfo: Record<string, Partial<Token>>;
    }
  ) {
    Object.assign(this, args);
    if (args) {
    }
  }
  init() {
    this.nativeToken = Token.getToken(this.nativeToken);
    this.nativeToken.init().then(() => {
      console.log('this.nativeToken', this.nativeToken.name);
    });
    this.faucetTokens = this.faucetTokens.map((t) => {
      const token = Token.getToken(t);
      token.init();
      return token;
    });
    Object.entries(this.validatedTokensInfo).forEach(([address, t]) => {
      const token = Token.getToken({
        ...t,
        address,
        chainId: wallet.currentChainId.toString(),
      });
      token.init();
      this.validatedTokensInfo[address] = token;
      this.validatedTokens.push(token);
    });
  }
}

export const berachainNetwork = new Network({
  chain: berachain,
  officialFaucets: [
    {
      url: 'https://bartio.faucet.berachain.com',
      name: 'Official Faucet',
      logoURI:
        'https://res.cloudinary.com/duv0g402y/raw/upload/src/assets/bera.png',
    },
  ],
  nativeToken: {
    address: '0x6969696969696969696969696969696969696969',
    name: 'Bera',
    symbol: 'BERA',
    decimals: 18,
    isNative: true,
    logoURI: '/images/icons/tokens/wbera-token-icon.png',
  },
  raisedTokenData: [
    // {
    //   symbol: "HPOT",
    //   address: "0x9b37d542114070518a44e200fdcd8e4be737297f".toLowerCase(),
    //   amount: BigInt("1500000000000000000000000"),
    // },
    {
      symbol: 'WBERA',
      address: '0x6969696969696969696969696969696969696969'.toLowerCase(),
      amount: BigInt('2000000000000000000000'),
    },
    {
      symbol: 'Honey',
      address: '0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce'.toLowerCase(),
      amount: BigInt('20000000000000000000000'),
    },
    {
      symbol: 'NECT',
      address: '0x1cE0a25D13CE4d52071aE7e02Cf1F6606F4C79d3'.toLowerCase(),
      amount: BigInt('20000000000000000000000'),
    },
    {
      symbol: 'WGBERA',
      address: '0xd77552d3849ab4d8c3b189a9582d0ba4c1f4f912'.toLowerCase(),
      amount: BigInt('2000000000000000000000'),
    },
  ],
  nativeFaucet: {
    address: '0x1bd43f7f55b700236c92256a0fd90266363119f7',
    name: 'Daily Faucet',
    requirements: 'You can claim 100 BERA tokens every 24 hours.',
  },
  platformTokenAddress: {
    HPOT: '0x9b37d542114070518a44e200fdcd8e4be737297f'.toLowerCase(),
  },
  contracts: {
    routerV3: ALGEBRA_POSITION_MANAGER,
    routerV2: '0x8aBc3a7bAC442Ae449B07fd0C2152364C230DA9A',
    factory: '0x7d53327D78EFD0b463bd8d7dc938C52402323b95',
    ftoFactory: '0x7E0CCe2C9Ff537f8301dd40c652A03479B18dAef',
    ftoFacade: '0x0264D933F13eE993270591668CfF87b8D35Dd3b4',
    memeFactory: '0xC38eF79A6cA9b3EfBe20F3dD3b99B3e25d09F52B',
    memeFacade: '0xAAD87033d81bB4c6a3A08aD77323530FF9dB8f5C',
    vaultFactory: '0x1bf5e51eCacdfEA65ae9276fd228bB8719ffcA7E',
    bgtMarket: '0x35249377829876127A8C33C303cC6712b002e3Fc',
    heyBgt: '0x5f8a463334E29635Bdaca9c01B76313395462430',
    ftoTokens: [
      {
        address: '0xfc5e3743E9FAC8BB60408797607352E24Db7d65E'.toLowerCase(),
        name: 'T-HPOT',
        symbol: 'T-HPOT',
        decimals: 18,
      },
      {
        address: '0x05D0dD5135E3eF3aDE32a9eF9Cb06e8D37A6795D'.toLowerCase(),
        name: 'USDT',
        symbol: 'USDT',
        decimals: 18,
      },
      {
        address: '0x6969696969696969696969696969696969696969'.toLowerCase(),
        name: 'Wrapped Bera',
        symbol: 'WBERA',
        decimals: 18,
        logoURI: '/images/icons/wbera-token-icon.png',
      },
      {
        address: '0x0E4aaF1351de4c0264C5c7056Ef3777b41BD8e03'.toLowerCase(),
        name: 'Honey',
        symbol: 'HONEY',
        decimals: 18,
      },
      {
        address: '0x2C2fc71339aCdD913734a4CAe9dD95D9d2b1438d'.toLowerCase(),
        name: 'Bera the Pooh',
        symbol: 'BERA THE POOH',
        decimals: 18,
      },
    ],
  },
  faucetTokens: [
    {
      address: '0xfc5e3743E9FAC8BB60408797607352E24Db7d65E'.toLowerCase(),
      name: 'T-HPOT',
      symbol: 'tHPOT',
      decimals: 18,
    },
    {
      address: '0x2C2fc71339aCdD913734a4CAe9dD95D9d2b1438d'.toLowerCase(),
      name: 'Bera the Pooh',
      symbol: 'BTP',
      decimals: 18,
    },
  ],
  blacklist: {
    poolBlacklist: [],
    memeBlacklist: [],
  },
  validatedTokensInfo: {
    //when adding a new token, make sure to add the address as lowercase

    '0x6969696969696969696969696969696969696969': {
      name: 'Wrapped Bera',
      symbol: 'WBERA',
      decimals: 18,
      logoURI: '/images/icons/tokens/wbera-token-icon.png',
      isRouterToken: true,
      isPopular: true,
    },
    '0xfcbd14dc51f0a4d49d5e53c2e0950e0bc26d0dce': {
      name: 'Honey',
      symbol: 'HONEY',
      decimals: 18,
      logoURI: '/images/icons/tokens/honey-token-icon.png',
      isRouterToken: true,
      isPopular: true,
    },
    '0x9b37d542114070518a44e200fdcd8e4be737297f': {
      name: 'HPOT',
      symbol: 'HPOT',
      decimals: 18,
      logoURI: '/images/icons/tokens/thpot-token-icon.jpg',
      isRouterToken: true,
      isPopular: true,
    },
    '0x549943e04f40284185054145c6e4e9568c1d3241': {
      name: 'USDC',
      symbol: 'USDC',
      decimals: 6,
      logoURI: '/images/icons/tokens/usdc-token-icon.png',
      isRouterToken: true,
    },
    '0x0555e30da8f98308edb960aa94c0db47230d2b9c': {
      name: 'WBTC',
      symbol: 'WBTC',
      decimals: 18,
      logoURI: '/images/icons/tokens/wbtc-token-icon.png',
      isRouterToken: true,
    },
    '0x2f6f07cdcf3588944bf4c42ac74ff24bf56e7590': {
      name: 'WETH',
      symbol: 'WETH',
      decimals: 18,
      logoURI: '/images/icons/tokens/weth-token-icon.png',
      isRouterToken: true,
    },
    '0x1cE0a25D13CE4d52071aE7e02Cf1F6606F4C79d3': {
      name: 'NECT',
      symbol: 'NECT',
      decimals: 18,
      logoURI: '/images/icons/tokens/nect-token-icon.png',
    },
    '0xd77552d3849ab4d8c3b189a9582d0ba4c1f4f912': {
      name: 'WGBERA',
      symbol: 'WGBERA',
      decimals: 18,
      logoURI: '/images/icons/tokens/wgbera-token-icon.png',
    },
  },
  validatedFtoAddresses: [],
  validatedMemeAddresses: [],
});

export const networks = [berachainNetwork];
export const networksMap = networks.reduce((acc, network) => {
  acc[network.chainId] = network;
  return acc;
}, {} as Record<number | string, Network>);

export const LiquidityBootstrapPoolFactoryAddress =
  '0xe2957CeAe8d267C493ad41e5CF7BBc274B969711';

class NetworkManager {
  private static instance: NetworkManager;
  private selectedNetwork: Network | null = null;

  private constructor() {}

  public static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  public getSelectedNetwork(): Network | null {
    return this.selectedNetwork;
  }

  public setSelectedNetwork(network: Network): void {
    this.selectedNetwork = network;
  }
}

export default NetworkManager;
