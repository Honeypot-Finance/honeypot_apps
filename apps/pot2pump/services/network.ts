import { Token } from './contract/token';
import { Chain } from 'viem/chains';
import { berachainTestnet } from '@/lib/chain';
import { ALGEBRA_POSITION_MANAGER } from '@/config/algebra/addresses';

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
      });
      token.init();
      this.validatedTokensInfo[address] = token;
      this.validatedTokens.push(token);
    });
  }
}

export const berachainNetworkTestnet = new Network({
  chain: berachainTestnet,
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
    isPopular: true,
  },
  raisedTokenData: [
    {
      symbol: 'WBERA',
      address: '0x6969696969696969696969696969696969696969'.toLowerCase(),
      amount: BigInt('1000000000000000000'),
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
    memeFactory: '0x67457D3F5D9e9158Bde427021C33a6085F35B971',
    memeFacade: '0x215Ce3B0d34FeF10b2BF4564BAb7D6B6b58370Eb',
    vaultFactory: '0xBc4996968b09087Cb85BBDE6Bf58953ceb393Ec9',
    ftoTokens: [],
  },
  faucetTokens: [],

  validatedTokensInfo: {
    //when adding a new token, make sure to add the address as lowercase
    '0x6969696969696969696969696969696969696969': {
      name: 'Wrapped Bera',
      symbol: 'WBERA',
      decimals: 18,
      logoURI: '/images/icons/tokens/wbera-token-icon.png',
      isRouterToken: true,
    },
  },
});

export const networks = [berachainNetworkTestnet];
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
