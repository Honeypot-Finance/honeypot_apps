import { Token } from './contract/token';

import { Chain, sepolia } from 'viem/chains';
import {
  berachainMainnet,
  berachainBartioTestnet,
  movementTestnet,
  polygonMumbaiChain,
  sprotoTestnet,
  arbitrumMainnet,
  baseMainnet,
  ethMainnet,
  berachainBepoliaTestnet,
  arbitrumSepoliaTestnet,
  //sepolia,
} from '@/lib/chain';
import { ICHIVaultContract } from './contract/aquabera/ICHIVault-contract';
import { getMultipleTokensData } from '@/lib/algebra/graphql/clients/token';
import { Token as IndexerToken } from '@/lib/algebra/graphql/generated/graphql';

import { Address, zeroAddress } from 'viem';
import {
  contractAddresses,
  ContractAddresses,
} from '@/config/contractAddresses';
import {
  subgraphAddresses,
  SubgraphAddresses,
} from '@/config/subgraphEndPoint';

export class Network {
  supportDEX: boolean = false;
  supportVault: boolean = false;
  supportBridge: boolean = false;
  isActive: boolean = true;
  get chainId() {
    return this.chain.id;
  }
  platformTokenAddress!: {
    HPOT: string;
  };
  contracts!: ContractAddresses;
  subgraphAddresses!: SubgraphAddresses;
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
  validatedVault: ({ address: `0x${string}` } & Partial<ICHIVaultContract>)[] =
    [];
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
    this.nativeToken.init(true, { loadIndexerTokenData: true }).then(() => {
      console.log('this.nativeToken', this.nativeToken);
    });

    this.validatedTokens = [];

    Object.entries(this.validatedTokensInfo).forEach(([address, t]) => {
      const token = Token.getToken({
        ...t,
        address,
      });
      this.validatedTokensInfo[address] = token;
      this.validatedTokens.push(token);
    });

    getMultipleTokensData(
      this.validatedTokens.map((t) => t.address.toLowerCase()),
      this.chainId.toString()
    ).then((tokenData) => {
      tokenData.forEach((t) => {
        const token = Token.getToken({
          address: t.id,
          chainId: this.chainId.toString(),
        });
        token.assignIndexerTokenData(t as IndexerToken);
      });
    });

    this.validatedVault.forEach((vault) => {
      const vaultContract = ICHIVaultContract.getVault(vault);
    });
  }
}

export const berachainBepoliaNetwork = new Network({
  supportDEX: true,
  supportVault: true,
  supportBridge: true,

  chain: berachainBepoliaTestnet,
  nativeToken: {
    address: '0x6969696969696969696969696969696969696969',
    name: 'Bera',
    symbol: 'BERA',
    decimals: 18,
    isNative: true,
    logoURI: '/images/icons/tokens/wbera-token-icon.png',
  },
  raisedTokenData: [],
  platformTokenAddress: {
    HPOT: zeroAddress.toLowerCase(),
  },
  faucetTokens: [],
  contracts: contractAddresses['80069'],
  subgraphAddresses: subgraphAddresses['80069'],
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
      isStableCoin: true,
    },
  },
});

export const berachainNetwork = new Network({
  supportDEX: true,
  supportVault: true,
  supportBridge: true,

  chain: berachainMainnet,
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
      symbol: 'HPOT',
      address: '0x9b37d542114070518a44e200fdcd8e4be737297f'.toLowerCase(),
      amount: BigInt('2000000000000000000000000'),
    },
    {
      symbol: 'WBERA',
      address: '0x6969696969696969696969696969696969696969'.toLowerCase(),
      amount: BigInt('4000000000000000000'),
    },
    {
      symbol: 'HONEY',
      address: '0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce'.toLowerCase(),
      amount: BigInt('30000000000000000000'),
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
  contracts: contractAddresses['80094'],
  subgraphAddresses: subgraphAddresses['80094'],
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
    // "0x0000000000000000000000000000000000000000": {
    //   name: "Bera",
    //   symbol: "BERA",
    //   decimals: 18,
    //   logoURI: "/images/icons/tokens/wbera-token-icon.png",
    //   isRouterToken: true,
    //   isPopular: true,
    // },
    '0x6969696969696969696969696969696969696969': {
      name: 'Wrapped Bera',
      symbol: 'WBERA',
      decimals: 18,
      logoURI: '/images/icons/tokens/wbera-token-icon.png',
      isRouterToken: true,
    },
    '0xfcbd14dc51f0a4d49d5e53c2e0950e0bc26d0dce': {
      name: 'Honey',
      symbol: 'HONEY',
      decimals: 18,
      logoURI: '/images/icons/tokens/honey-token-icon.png',
      isRouterToken: true,
      isPopular: true,
      isStableCoin: true,
    },
    '0x9b37d542114070518a44e200fdcd8e4be737297f': {
      name: 'Honeypot Finance',
      symbol: 'HPOT',
      decimals: 18,
      logoURI: '/images/icons/tokens/thpot-token-icon.jpg',
      isRouterToken: true,
    },
    '0x549943e04f40284185054145c6e4e9568c1d3241': {
      name: 'USDC',
      symbol: 'USDC',
      decimals: 6,
      logoURI: '/images/icons/tokens/usdc-token-icon.png',
      isRouterToken: true,
      isStableCoin: true,
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
    '0x1ce0a25d13ce4d52071ae7e02cf1f6606f4c79d3': {
      name: 'NECT',
      symbol: 'NECT',
      decimals: 18,
      logoURI: '/images/icons/tokens/nect-token.jpg',
      isPopular: true,
      isStableCoin: true,
    },
    '0x467aa1bfa3dcc714f7c16b3d779200431f6a833b': {
      name: '3BC',
      symbol: '3BC',
      decimals: 18,
      logoURI: '/images/icons/tokens/3bc.png',
    },
    '0xd77552d3849ab4d8c3b189a9582d0ba4c1f4f912': {
      name: 'wgBERA',
      symbol: 'wgBERA',
      decimals: 18,
      logoURI: '/images/icons/tokens/wgbera.png',
      isPopular: true,
    },
    '0x779ded0c9e1022225f8e0630b35a9b54be713736': {
      name: 'USD₮0',
      symbol: 'USD₮0',
      decimals: 6,
      logoURI: '/images/icons/tokens/usdt-token-icon.png',
      isStableCoin: true,
    },
    '0xbc665a196220043b738de189aef05250e2acc700': {
      name: 'Boyz',
      symbol: 'Boyz',
      decimals: 18,
      logoURI: '/images/icons/tokens/boyz-token-icon.png',
    },
    '0x9b6761bf2397bb5a6624a856cc84a3a14dcd3fe5': {
      name: 'iBERA',
      symbol: 'iBERA',
      decimals: 18,
      logoURI: 'https://infrared.finance/_next/static/media/ibera.a6d10126.svg',
    },
    '0x08a38caa631de329ff2dad1656ce789f31af3142': {
      name: 'YEET',
      symbol: 'YEET',
      decimals: 18,
      logoURI: '/images/icons/tokens/yeet-token-icon.jpg',
    },
    '0x1f7210257fa157227d09449229a9266b0d581337': {
      name: 'Beramonium Coin',
      symbol: 'BERAMO',
      decimals: 18,
      logoURI: '/images/icons/tokens/beramonium.png',
    },
    '0x331865bf2ea19e94bbf438cf4ee590cb6392e5a9': {
      name: 'Moola',
      symbol: 'MOOLA',
      decimals: 18,
      logoURI: '/images/icons/tokens/moola.jpeg',
    },
    '0xa452810a4215fccc834ed241e6667f519b9856ec': {
      name: 'Berabot',
      symbol: 'BBOT',
      decimals: 18,
      logoURI: '/images/icons/tokens/berabot.png',
    },
    '0xac03caba51e17c86c921e1f6cbfbdc91f8bb2e6b': {
      name: 'Infrared BGT',
      symbol: 'iBGT',
      decimals: 18,
      logoURI: '/images/icons/tokens/ibgt-token-icon.png',
    },
    '0xb2f776e9c1c926c4b2e54182fac058da9af0b6a5': {
      name: 'henlo',
      symbol: 'HENLO',
      decimals: 18,
      logoURI: '/images/icons/tokens/henlo.png',
      isPopular: true,
    },
    '0xbaadcc2962417c01af99fb2b7c75706b9bd6babe': {
      name: 'Liquid BGT',
      symbol: 'LBGT',
      decimals: 18,
      logoURI: 'https://www.berapaw.com/static/images/tokens/lbgt.svg',
    },
    //bitget campaign
    '0xa40e6433782ffb18c8eeb16d201e331e37abfb74': {
      name: 'Xi BERA',
      symbol: 'XI',
      decimals: 18,
      logoURI: '/images/icons/tokens/xi.webp',
      isPopular: true,
    },
    '0x10acd894a40d8584ad74628812525ef291e16c47': {
      name: 'Q5',
      symbol: 'Q5',
      decimals: 18,
      logoURI: '/images/icons/tokens/q5.webp',
      isPopular: true,
    },
    '0x539aced84ebb5cbd609cfaf4047fb78b29553da9': {
      name: 'the chain has a bear on it',
      symbol: 'BERACHAIN',
      decimals: 18,
      logoURI: '/images/icons/tokens/berachain.webp',
      isPopular: true,
    },
    '0xab7e0f3d69de8061aa46d7c9964dbc11878468eb': {
      name: 'Berally Token',
      symbol: 'BRLY',
      decimals: 18,
      logoURI: '/images/icons/tokens/berally.png',
    },
    '0x18878df23e2a36f81e820e4b47b4a40576d3159c': {
      name: 'Olympus',
      symbol: 'OHM',
      decimals: 18,
      logoURI: 'https://berascan.com/token/images/olympusdao2_32.png',
    },
    '0x6536cead649249cae42fc9bfb1f999429b3ec755': {
      name: 'NavFinance',
      symbol: 'NAV',
      decimals: 18,
      logoURI: 'https://images.oogabooga.io/nav.png',
    },
    '0x28e0e3b9817012b356119df9e217c25932d609c2': {
      name: 'Burr Governance Token',
      symbol: 'BURR',
      decimals: 18,
      logoURI: '/images/icons/tokens/burr_bear_logo.webp',
    },
  },
  validatedFtoAddresses: [],
  validatedMemeAddresses: [],
  validatedVault: [
    {
      //WBERA/HONEY
      address: '0xb00ae8a7be63036dbcd143a842bfc14708c440bb',
      vaultTag: {
        tag: 'HOT 🔥',
        bgColor: '#FFCD4D',
        textColor: 'black',
        tooltip: 'High APR, High Volume, High Liquidity',
      },
    },
    {
      //WETH/WBERA
      address: '0xec06041013b3a97c58b9ab61eae9079bc594eda3',
      vaultTag: {
        tag: 'ETH Jeets',
        bgColor: '#FFCD4D',
        textColor: 'black',
        tooltip: 'An ETH single-side deposit vault, actively paired with BERA.',
      },
      vaultDescription: (
        <>
          An ETH single-side deposit vault paired with BERA, actively farming
          the WETH-BERA pair on Wasabee DEX for a solid high APY. It runs a
          slick strategy that stacks more BERA over time. benchmarked against
          just holding ETH Position.
          <br />
          <br />
          This strategy is implemented based on{' '}
          <a
            href="https://docs.ichi.org/home/yieldiq-strategy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500"
          >
            YieldIQ
          </a>
          , with the ETH inventory ratio being reduced as the running time
          increases. HPOT&Aquabera will review the strategy parameters
          regularly.
        </>
      ),
    },
    {
      //WBERA/HONEY
      address: '0xba29bbb78825a72c5dcc3d217ca2011bd95b97c7',
      vaultTag: {
        tag: 'LONG $BERA',
        bgColor: '#FFCD4D',
        textColor: 'black',
      },
    },
    {
      //WBERA/wgBERA
      address: '0xac04b1abadf214b57f7ade1dd905ab7acac23a6b',
      vaultTag: {
        tag: '$wgBERA Hodl',
        bgColor: '#FFCD4D',
        textColor: 'black',
        tooltip:
          'A wgBERA single-side deposit vault, actively paired with BERA.',
      },
      vaultDescription: (
        <>
          A single-sided BERA deposits vault to accumulate wgBERA at the dip,
          while actively providing liquidity and farming on the wgBERA-BERA
          token pair through Wasabee DEX. Which helps restore and maintain the
          wgBERA peg as well.
          <br />
          The strategy is implemented based on the{' '}
          <a
            href="https://docs.ichi.org/home/ascend-strategy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500"
          >
            Ascend-Strategy
          </a>
          , with a dynamic peg adjustment mechanism that progressively elevates
          the peg target as wgBERA appreciates in value.
          <br />
          The strategy undergoes periodic review and optimization by HPOT and
          Aquabera to ensure optimal performance.
        </>
      ),
    },
    {
      //WBERA/iBERA
      address: '0xe57d868d244d2cf2e9679eaba2a3048e58674565',
      vaultTag: {
        tag: '$iBERA Hodl',
        bgColor: '#FFCD4D',
        textColor: 'black',
        tooltip:
          'An iBERA single-side deposit vault, actively paired with BERA.',
      },
      vaultDescription: (
        <>
          iBERA/BERA - BERA deposit: A single-sided BERA deposits vault to
          accumulate iBERA at the dip, while actively providing liquidity and
          farming on the iBERA token pair through Wasabee DEX. Which helps
          restore and maintain the iBERA peg as well.
          <br />
          The strategy is implemented based on the{' '}
          <a
            href="https://docs.ichi.org/home/ascend-strategy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500"
          >
            Ascend-Strategy
          </a>
          , with a dynamic peg adjustment mechanism that progressively elevates
          the peg target as iBERA appreciates in value.
          <br />
          The strategy undergoes periodic review and optimization by HPOT and
          Aquabera to ensure optimal performance.
        </>
      ),
    },
  ],
});

export const arbitrumSepoliaNetwork = new Network({
  supportDEX: false,
  supportVault: false,
  supportBridge: true,
  chain: arbitrumSepoliaTestnet,
  officialFaucets: [],
  nativeToken: {},
  contracts: contractAddresses['default'],
  subgraphAddresses: subgraphAddresses['default'],
  faucetTokens: [],
  blacklist: {},
  validatedTokensInfo: {},
  validatedFtoAddresses: [],
  validatedMemeAddresses: [],
});

export const sepoliaNetwork = new Network({
  supportDEX: false,
  supportVault: false,
  supportBridge: false,
  chain: sepolia,
  officialFaucets: [],
  nativeToken: {},
  contracts: contractAddresses['default'],
  subgraphAddresses: subgraphAddresses['default'],
  faucetTokens: [],
  blacklist: {},
  validatedTokensInfo: {},
  validatedFtoAddresses: [],
  validatedMemeAddresses: [],
});

export const movementNetWork = new Network({
  supportDEX: false,
  supportVault: false,
  supportBridge: false,
  chain: movementTestnet,
  officialFaucets: [],
  nativeToken: {},
  contracts: contractAddresses['default'],
  subgraphAddresses: subgraphAddresses['default'],
  faucetTokens: [],
  blacklist: {},
  validatedTokensInfo: {},
  validatedFtoAddresses: [],
  validatedMemeAddresses: [],
});

export const arbitrumOneNetwork = new Network({
  supportDEX: false,
  supportVault: false,
  supportBridge: true,
  chain: arbitrumMainnet,
  officialFaucets: [],
  nativeToken: { address: zeroAddress },

  contracts: contractAddresses['default'],
  subgraphAddresses: subgraphAddresses['default'],
  faucetTokens: [],
  blacklist: {},
  validatedTokensInfo: {},
  validatedFtoAddresses: [],
  validatedMemeAddresses: [],
});

export const baseNetwork = new Network({
  supportDEX: false,
  supportVault: false,
  supportBridge: true,
  chain: baseMainnet,
  officialFaucets: [],
  nativeToken: { address: zeroAddress },

  contracts: contractAddresses['default'],
  subgraphAddresses: subgraphAddresses['default'],
  faucetTokens: [],
  blacklist: {},
  validatedTokensInfo: {},
  validatedFtoAddresses: [],
  validatedMemeAddresses: [],
});
export const ethNetwork = new Network({
  supportDEX: false,
  supportVault: false,
  supportBridge: true,
  chain: ethMainnet,
  officialFaucets: [],
  nativeToken: { address: zeroAddress },

  contracts: contractAddresses['default'],
  subgraphAddresses: subgraphAddresses['default'],
  faucetTokens: [],
  blacklist: {},
  validatedTokensInfo: {},
  validatedFtoAddresses: [],
  validatedMemeAddresses: [],
});

export const sprotoNetWork = new Network({
  supportDEX: false,
  supportVault: false,
  supportBridge: false,
  chain: sprotoTestnet,
  officialFaucets: [],
  nativeToken: {},

  contracts: contractAddresses['default'],
  subgraphAddresses: subgraphAddresses['default'],
  faucetTokens: [],
  blacklist: {},
  validatedTokensInfo: {},
  validatedFtoAddresses: [],
  validatedMemeAddresses: [],
});

export const networks = [
  berachainNetwork,
  arbitrumOneNetwork,
  baseNetwork,
  ethNetwork,
  berachainBepoliaNetwork,
  arbitrumSepoliaNetwork,
  sepoliaNetwork,
  // berachainBartioTestnetNetwork,
  // movementNetWork,
  // sprotoNetWork,
];

export const networksMap = networks.reduce((acc, network) => {
  acc[network.chainId] = network;
  return acc;
}, {} as Record<number | string, Network>);
