import { Token } from '../../lib/contract/token/token';
import { Chain } from 'viem/chains';
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
  sepoliaTestnet,
  bscMainnet,
  optimismMainnet,
  polygonMainnet,
  avalancheMainnet,
  lineaMainnet,
  blastMainnet,
  mantaMainnet,
  modeMainnet,
  sonicMainnet,
  confluxESpaceMainnet,
  merlinMainnet,
} from './chainBaseConfig';
import { ICHIVaultContract } from '../../lib/contract/aquabera/ICHIVault-contract';
import { getMultipleTokensData } from '../../lib/graphql/clients/token';
import { Token as IndexerToken } from '../../lib/graphql/generated/graphql';
import { zeroAddress } from 'viem';
import { contractAddresses, ContractAddresses } from '../contractAddresses';
import { subgraphAddresses, SubgraphAddresses } from '../subgraphEndPoint';

export class Network {
  supportDEX = false;
  supportVault = false;
  supportBridge = false;
  supportLBP = false;
  supportPot2Pump = false;
  supportUniversalAccount = false;
  isActive = true;
  iconUrl = '';
  displayName?: string;
  get chainId() {
    return this.chain.id;
  }
  platformTokenAddress!: {
    HPOT: string;
  };
  contracts!: ContractAddresses;
  subgraphAddresses!: SubgraphAddresses;
  nativeToken!: Token;
  wrappedNativeToken?: Partial<Token>;
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
  }

  init() {
    this.nativeToken = Token.getToken({
      ...this.nativeToken,
      isNative: true,
      chainId: this.chainId.toString(),
    });

    this.validatedTokens = [];
    this.validatedTokens.push(this.nativeToken);

    Object.entries(this.validatedTokensInfo).forEach(([address, t]) => {
      const token = Token.getToken({
        ...t,
        address,
        chainId: this.chainId.toString(),
      });
      this.validatedTokensInfo[address] = token;
      this.validatedTokens.push(token);
    });

    if (this.supportDEX) {
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

      this.nativeToken.init(false, {
        loadBalance: true,
        loadIndexerTokenData: true,
      });
    }

    this.validatedVault.forEach((vault) => {
      const vaultContract = ICHIVaultContract.getVault(vault);
    });
  }

  getTokenExplorerUrl(token: Token): string {
    const explorer = this.chain.blockExplorers?.default;
    if (!explorer) {
      return '#';
    }

    // For native tokens, show the wrapped token if available
    if (token.isNative || token.address === zeroAddress) {
      if (this.wrappedNativeToken && this.wrappedNativeToken.address) {
        // Use the wrapped token address for native tokens
        const wrappedAddress = this.wrappedNativeToken.address;
        // Don't show zero address in explorer
        if (wrappedAddress && wrappedAddress !== zeroAddress) {
          return `${explorer.url}/token/${wrappedAddress}`;
        }
      }
      // Fallback to general explorer URL
      return explorer.url;
    }

    return `${explorer.url}/token/${token.address}`;
  }
}

export const bscMainnetNetwork = new Network({
  supportDEX: true,
  supportPot2Pump: true,
  supportUniversalAccount: true,
  supportVault: true,
  displayName: 'BNB Chain',
  iconUrl: 'https://bscscan.com/token/images/bnbchain2_32.png',
  chain: bscMainnet,
  nativeToken: {
    address: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
    isNative: true,
    logoURI:
      'https://assets.coingecko.com/coins/images/825/standard/bnb-icon2_2x.png',
    chainId: '56',
  },
  wrappedNativeToken: {
    address: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
    name: 'Wrapped BNB',
    symbol: 'WBNB',
    decimals: 18,
    chainId: '56',
  },
  raisedTokenData: [
    {
      symbol: 'WBNB',
      address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'.toLowerCase(),
      amount: BigInt('100000000000000'),
    },
  ],
  faucetTokens: [],
  contracts: contractAddresses['56'],
  subgraphAddresses: subgraphAddresses['56'],
  validatedTokensInfo: {
    //when adding a new token, make sure to add the address as lowercase
    '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c': {
      name: 'Wrapped BNB',
      symbol: 'WBNB',
      decimals: 18,
      logoURI: 'https://bscscan.com/token/images/bnbchain2_32.png',
      isRouterToken: true,
      isPopular: true,
    },
    '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d': {
      name: 'Binance-Peg USD Coin',
      symbol: 'USDC',
      decimals: 18,
      logoURI: 'https://bscscan.com/token/images/centre-usdc_28.png',
      isRouterToken: true,
    },
  },
});

export const berachainBepoliaNetwork = new Network({
  supportDEX: true,
  supportVault: true,
  supportBridge: true,
  supportPot2Pump: true,
  supportLBP: true,
  iconUrl:
    'https://cdn.prod.website-files.com/633c67ced5457aa4dec572be/67b845abe842d21521095c26_667ac3022260a22071b3cf37_u_b_f51944d0-b527-11ee-be26-a5e0a0cc15ce.png',
  chain: berachainBepoliaTestnet,
  nativeToken: {
    address: '0x0000000000000000000000000000000000000000',
    name: 'Bera',
    symbol: 'BERA',
    decimals: 18,
    isNative: true,
    logoURI: '/images/icons/tokens/wbera-token-icon.png',
    chainId: '80069',
  },
  wrappedNativeToken: {
    address: '0x6969696969696969696969696969696969696969',
    name: 'Wrapped BERA',
    symbol: 'WBERA',
    decimals: 18,
    chainId: '80069',
  },
  raisedTokenData: [
    {
      symbol: 'WBERA',
      address: '0x6969696969696969696969696969696969696969'.toLowerCase(),
      amount: BigInt('1000000000000000000'),
    },
  ],
  platformTokenAddress: {
    HPOT: '0x2160E65c07aAFD809f4f39a94513a21FbE20b615'.toLowerCase(),
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
    '0x2160e65c07aafd809f4f39a94513a21fbe20b615': {
      name: 'Honeypot Finance',
      symbol: 'HPOT',
      decimals: 18,
      logoURI: '/images/icons/tokens/thpot-token-icon.jpg',
      isRouterToken: true,
    },
  },
});

export const berachainNetwork = new Network({
  supportDEX: true,
  supportVault: true,
  supportBridge: true,
  supportLBP: true,
  supportPot2Pump: true,
  supportUniversalAccount: true,
  iconUrl:
    'https://cdn.prod.website-files.com/633c67ced5457aa4dec572be/67b845abe842d21521095c26_667ac3022260a22071b3cf37_u_b_f51944d0-b527-11ee-be26-a5e0a0cc15ce.png',
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
    address: '0x0000000000000000000000000000000000000000',
    name: 'Bera',
    symbol: 'BERA',
    decimals: 18,
    isNative: true,
    logoURI: '/images/icons/tokens/wbera-token-icon.png',
    isPopular: true,
    chainId: '80094',
  },
  wrappedNativeToken: {
    address: '0x6969696969696969696969696969696969696969',
    name: 'Wrapped BERA',
    symbol: 'WBERA',
    decimals: 18,
    chainId: '80094',
  },
  raisedTokenData: [
    // {
    //   symbol: "HPOT",
    //   address: "0x9b37d542114070518a44e200fdcd8e4be737297f".toLowerCase(),
    //   amount: BigInt("1500000000000000000000000"),
    // },
    {
      symbol: 'BERA',
      address: '0x6969696969696969696969696969696969696969'.toLowerCase(),
      amount: BigInt('2000000000000000000000'), // 2000 BERA
    },
    {
      symbol: 'WGBERA',
      address: '0xd77552d3849ab4d8c3b189a9582d0ba4c1f4f912'.toLowerCase(),
      amount: BigInt('2000000000000000000000'), // 2000 WGBERA
    },
    {
      symbol: 'Honey',
      address: '0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce'.toLowerCase(),
      amount: BigInt('5000000000000000000000'), // 5000 HONEY
    },
    {
      symbol: 'NECT',
      address: '0x1cE0a25D13CE4d52071aE7e02Cf1F6606F4C79d3'.toLowerCase(),
      amount: BigInt('5000000000000000000000'), // 5000 NECT
    },
    {
      symbol: 'HENLO',
      address: '0xb2F776e9c1C926C4b2e54182Fac058dA9Af0B6A5'.toLowerCase(),
      amount: BigInt('40000000000000000000000000'), // 40M HENLO
    },
    {
      symbol: 'LBGT',
      address: '0xa2b0519F1D7F61eaB95D486301ED924b58E97022'.toLowerCase(),
      amount: BigInt('2000000000000000000000'), // 2000 LBGT
    },
    {
      symbol: 'BEE',
      address: '0x93a0cb3ee34aa983db262f904021911ecd199228'.toLowerCase(),
      amount: BigInt('2000000000000000000000000'), // 2M BEE
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
    '0x773f8b20cc9bb82a67ad2c5d996bb3db79118ee1': {
      name: ':-):-):-)',
      symbol: ':-):-):-)',
      decimals: 18,
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
      logoURI: 'https://infrared.finance/assets/tokens/ibera.svg',
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
      logoURI: '/images/icons/tokens/lbgt-token-icon.svg',
    },
    //bitget campaign
    '0xa40e6433782ffb18c8eeb16d201e331e37abfb74': {
      name: 'Xi BERA',
      symbol: 'XI',
      decimals: 18,
      logoURI: '/images/icons/tokens/xi.webp',
    },
    '0x10acd894a40d8584ad74628812525ef291e16c47': {
      name: 'Q5',
      symbol: 'Q5',
      decimals: 18,
      logoURI: '/images/icons/tokens/q5.webp',
    },
    '0x539aced84ebb5cbd609cfaf4047fb78b29553da9': {
      name: 'the chain has a bear on it',
      symbol: 'BERACHAIN',
      decimals: 18,
      logoURI: '/images/icons/tokens/berachain.webp',
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
    '0x009af46df68db0e76bfe9ea35663f6ed17877956': {
      name: 'Ooga Token',
      symbol: 'OOGA',
      decimals: 18,
      logoURI:
        'https://app.oogabooga.io/_next/image?url=https%3A%2F%2Fimages.oogabooga.io%2Fooga.png&w=64&q=75',
    },
    '0x93a0cb3ee34aa983db262f904021911ecd199228': {
      name: 'Bee Token',
      symbol: 'BEE',
      decimals: 18,
      logoURI: '/images/icons/tokens/bee-token-icon.jpg',
      isPopular: true,
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
  iconUrl: '/images/icons/chains/arbitrum.png',
  nativeToken: {
    address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
    isNative: true,
    logoURI: '/images/icons/tokens/weth-token-icon.png',
    chainId: '421614',
  },
  contracts: contractAddresses['default'],
  subgraphAddresses: subgraphAddresses['default'],
  faucetTokens: [],
  blacklist: {},
  validatedTokensInfo: {
    '0x82af49447d8a07e3bd95bd0d56f35241523fbab1': {
      address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
      name: 'WETH',
      symbol: 'WETH',
      decimals: 18,
      logoURI: '/images/icons/tokens/weth-token-icon.png',
    },
  },
  validatedFtoAddresses: [],
  validatedMemeAddresses: [],
});

export const sepoliaNetwork = new Network({
  supportDEX: false,
  supportVault: false,
  supportBridge: false,
  supportLBP: true,
  chain: sepoliaTestnet,
  officialFaucets: [],
  iconUrl:
    'https://developers.moralis.com/wp-content/uploads/web3wiki/1147-sepolia/637aee14aa9d9f521437ec16_hYC2y965v3QD7fEoVvutzGbJzVGLSOk6RZPwEQWcA_E-300x300.jpeg  ',
  nativeToken: {
    address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
    isNative: true,
    logoURI: '/images/icons/tokens/weth-token-icon.png',
    chainId: '11155111',
  },
  contracts: contractAddresses['default'],
  subgraphAddresses: subgraphAddresses['11155111'],
  faucetTokens: [],
  blacklist: {},
  validatedTokensInfo: {
    '0xf531b8f309be94191af87605cfbf600d71c2cfe0': {
      address: '0xf531b8f309be94191af87605cfbf600d71c2cfe0',
      name: 'WETH',
      symbol: 'WETH',
      decimals: 18,
      logoURI: '/images/icons/tokens/weth-token-icon.png',
    },
    '0x1c7d4b196cb0c7b01d743fbc6116a902379c7238': {
      address: '0x1c7d4b196cb0c7b01d743fbc6116a902379c7238',
      name: 'USDC',
      symbol: 'USDC',
      decimals: 6,
      logoURI: '/images/icons/tokens/usdc-token-icon.png',
    },
  },
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
  iconUrl: '/images/icons/chains/ethereum.png',
  contracts: contractAddresses['default'],
  subgraphAddresses: subgraphAddresses['default'],
  faucetTokens: [],
  blacklist: {},
  validatedTokensInfo: {
    '0x82af49447d8a07e3bd95bd0d56f35241523fbab1': {
      address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
      name: 'WETH',
      symbol: 'WETH',
      decimals: 18,
      isNative: true,
      logoURI: '/images/icons/tokens/weth-token-icon.png',
      chainId: '3073',
    },
  },
  validatedFtoAddresses: [],
  validatedMemeAddresses: [],
});

export const arbitrumOneNetwork = new Network({
  supportDEX: false,
  supportVault: false,
  supportBridge: true,
  chain: arbitrumMainnet,
  iconUrl: '/images/icons/chains/arbitrum.png',
  officialFaucets: [],
  nativeToken: {
    address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
    isNative: true,
    logoURI: '/images/icons/tokens/weth-token-icon.png',
    chainId: '42161',
  },
  contracts: contractAddresses['default'],
  subgraphAddresses: subgraphAddresses['default'],
  faucetTokens: [],
  blacklist: {},
  validatedTokensInfo: {
    '0x82af49447d8a07e3bd95bd0d56f35241523fbab1': {
      address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
      name: 'WETH',
      symbol: 'WETH',
      decimals: 18,
      logoURI: '/images/icons/tokens/weth-token-icon.png',
    },
    '0xaf88d065e77c8cc2239327c5edb3a432268e5831': {
      address: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
      name: 'USDC',
      symbol: 'USDC',
      decimals: 18,
      logoURI: '/images/icons/tokens/usdc-token-icon.png',
    },
    '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9': {
      address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
      name: 'USDT',
      symbol: 'USDT',
      decimals: 18,
      logoURI: '/images/icons/tokens/usdt-token-icon.png',
    },
    '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f': {
      address: '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f',
      name: 'WBTC',
      symbol: 'WBTC',
      decimals: 18,
      logoURI: '/images/icons/tokens/wbtc-token-icon.png',
    },
  },
  validatedFtoAddresses: [],
  validatedMemeAddresses: [],
});

export const baseNetwork = new Network({
  supportDEX: false,
  supportVault: false,
  supportBridge: true,
  chain: baseMainnet,
  officialFaucets: [],
  iconUrl: '/images/icons/chains/base.png',
  nativeToken: {
    address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
    isNative: true,
    logoURI: '/images/icons/tokens/weth-token-icon.png',
    chainId: '8453',
  },

  contracts: contractAddresses['default'],
  subgraphAddresses: subgraphAddresses['default'],
  faucetTokens: [],
  blacklist: {},
  validatedTokensInfo: {
    '0x82af49447d8a07e3bd95bd0d56f35241523fbab1': {
      address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
      name: 'WETH',
      symbol: 'WETH',
      decimals: 18,
      logoURI: '/images/icons/tokens/weth-token-icon.png',
    },
    '0xfde4c96c8593536e31f229ea8f37b2ada2699bb2': {
      address: '0xfde4c96c8593536e31f229ea8f37b2ada2699bb2',
      name: 'Bridged USDT',
      symbol: 'Bridged USDT',
      decimals: 18,
      logoURI: '/images/icons/tokens/usdt-token-icon.png',
    },
    '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca': {
      address: '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca',
      name: 'Bridged USDC',
      symbol: 'Bridged USDC',
      decimals: 18,
      logoURI: '/images/icons/tokens/usdc-token-icon.png',
    },
  },
  validatedFtoAddresses: [],
  validatedMemeAddresses: [],
});
export const ethNetwork = new Network({
  supportDEX: false,
  supportVault: false,
  supportBridge: true,
  chain: ethMainnet,
  iconUrl: '/images/icons/chains/ethereum.png',
  officialFaucets: [],
  nativeToken: {
    address: '0x0000000000000000000000000000000000000000',
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
    isNative: true,
    logoURI: '/images/icons/tokens/weth-token-icon.png',
    chainId: '1',
  },
  wrappedNativeToken: {
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
    chainId: '1',
  },
  contracts: contractAddresses['default'],
  subgraphAddresses: subgraphAddresses['default'],
  faucetTokens: [],
  blacklist: {},
  validatedTokensInfo: {
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': {
      address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      name: 'WETH',
      symbol: 'WETH',
      decimals: 18,
      logoURI: '/images/icons/tokens/weth-token-icon.png',
    },
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 18,
      logoURI: '/images/icons/tokens/usdc-token-icon.png',
    },
    '0xdac17f958d2ee523a2206206994597c13d831ec7': {
      address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      name: 'Tether',
      symbol: 'USDT',
      decimals: 18,
      logoURI: '/images/icons/tokens/usdt-token-icon.png',
    },
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': {
      address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
      name: 'Wrapped Bitcoin',
      symbol: 'WBTC',
      decimals: 18,
      logoURI: '/images/icons/tokens/wbtc-token-icon.png',
    },
  },
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

// Optimism Network
export const optimismNetwork = new Network({
  supportDEX: true,
  supportUniversalAccount: true,
  chain: optimismMainnet,
  displayName: 'Optimism',
  iconUrl:
    'https://assets.coingecko.com/coins/images/25244/standard/Optimism.png',
  nativeToken: {
    address: '0x4200000000000000000000000000000000000006',
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    isNative: true,
    logoURI: 'https://optimistic.etherscan.io/token/images/weth_28.png',
    chainId: '10',
  },
  wrappedNativeToken: {
    address: '0x4200000000000000000000000000000000000006',
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
    chainId: '10',
  },
  contracts: contractAddresses['10'] || contractAddresses['default'],
  subgraphAddresses: subgraphAddresses['10'] || subgraphAddresses['default'],
  faucetTokens: [],
  raisedTokenData: [],
  validatedTokensInfo: {},
  validatedFtoAddresses: [],
  validatedMemeAddresses: [],
});

// Polygon Network
export const polygonNetwork = new Network({
  supportDEX: true,
  supportUniversalAccount: true,
  chain: polygonMainnet,
  iconUrl:
    'https://assets.coingecko.com/coins/images/4713/standard/polygon.png',
  nativeToken: {
    address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
    isNative: true,
    logoURI: 'https://polygonscan.com/token/images/polygon.png',
    chainId: '137',
  },
  wrappedNativeToken: {
    address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
    name: 'Wrapped Matic',
    symbol: 'WMATIC',
    decimals: 18,
    chainId: '137',
  },
  contracts: contractAddresses['137'] || contractAddresses['default'],
  subgraphAddresses: subgraphAddresses['137'] || subgraphAddresses['default'],
  faucetTokens: [],
  raisedTokenData: [],
  validatedTokensInfo: {},
  validatedFtoAddresses: [],
  validatedMemeAddresses: [],
});

// Avalanche Network
export const avalancheNetwork = new Network({
  supportDEX: true,
  supportUniversalAccount: true,
  chain: avalancheMainnet,
  iconUrl:
    'https://assets.coingecko.com/coins/images/12559/standard/Avalanche_Circle_RedWhite_Trans.png',
  nativeToken: {
    address: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
    name: 'AVAX',
    symbol: 'AVAX',
    decimals: 18,
    isNative: true,
    logoURI: 'https://snowtrace.io/token/images/avax_28.png',
    chainId: '43114',
  },
  wrappedNativeToken: {
    address: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
    name: 'Wrapped AVAX',
    symbol: 'WAVAX',
    decimals: 18,
    chainId: '43114',
  },
  contracts: contractAddresses['43114'] || contractAddresses['default'],
  subgraphAddresses: subgraphAddresses['43114'] || subgraphAddresses['default'],
  faucetTokens: [],
  raisedTokenData: [],
  validatedTokensInfo: {},
  validatedFtoAddresses: [],
  validatedMemeAddresses: [],
});

// Linea Network
export const lineaNetwork = new Network({
  supportDEX: true,
  supportUniversalAccount: true,
  chain: lineaMainnet,
  iconUrl: 'https://lineascan.build/images/svg/brands/main.svg',
  nativeToken: {
    address: '0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f',
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
    isNative: true,
    logoURI: 'https://lineascan.build/token/images/linea-ether_28.png',
    chainId: '59144',
  },
  wrappedNativeToken: {
    address: '0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f',
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
    chainId: '59144',
  },
  contracts: contractAddresses['59144'] || contractAddresses['default'],
  subgraphAddresses: subgraphAddresses['59144'] || subgraphAddresses['default'],
  faucetTokens: [],
  raisedTokenData: [],
  validatedTokensInfo: {},
  validatedFtoAddresses: [],
  validatedMemeAddresses: [],
});

// Blast Network
export const blastNetwork = new Network({
  supportDEX: true,
  supportUniversalAccount: true,
  chain: blastMainnet,
  iconUrl: 'https://blastscan.io/images/svg/brands/main.svg',
  nativeToken: {
    address: '0x4300000000000000000000000000000000000004',
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
    isNative: true,
    logoURI: 'https://blastscan.io/token/images/weth_28.png',
    chainId: '81457',
  },
  wrappedNativeToken: {
    address: '0x4300000000000000000000000000000000000004',
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
    chainId: '81457',
  },
  contracts: contractAddresses['81457'] || contractAddresses['default'],
  subgraphAddresses: subgraphAddresses['81457'] || subgraphAddresses['default'],
  faucetTokens: [],
  raisedTokenData: [],
  validatedTokensInfo: {},
  validatedFtoAddresses: [],
  validatedMemeAddresses: [],
});

// Manta Pacific Network
export const mantaNetwork = new Network({
  supportDEX: true,
  supportUniversalAccount: true,
  chain: mantaMainnet,
  iconUrl: 'https://icons.llamao.fi/icons/chains/rsz_manta.jpg',
  nativeToken: {
    address: '0x0dc808adce2099a9f62aa87d9670745aba741746',
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
    isNative: true,
    logoURI: 'https://pacific-explorer.manta.network/images/manta-pacific.svg',
    chainId: '169',
  },
  wrappedNativeToken: {
    address: '0x0dc808adce2099a9f62aa87d9670745aba741746',
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
    chainId: '169',
  },
  contracts: contractAddresses['169'] || contractAddresses['default'],
  subgraphAddresses: subgraphAddresses['169'] || subgraphAddresses['default'],
  faucetTokens: [],
  raisedTokenData: [],
  validatedTokensInfo: {},
  validatedFtoAddresses: [],
  validatedMemeAddresses: [],
});

// Mode Network
export const modeNetwork = new Network({
  supportDEX: true,
  supportUniversalAccount: true,
  chain: modeMainnet,
  iconUrl: 'https://avatars.githubusercontent.com/u/126394483',
  nativeToken: {
    address: '0x4200000000000000000000000000000000000006',
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
    isNative: true,
    logoURI: 'https://explorer.mode.network/token/images/ether_28.png',
    chainId: '34443',
  },
  wrappedNativeToken: {
    address: '0x4200000000000000000000000000000000000006',
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
    chainId: '34443',
  },
  contracts: contractAddresses['34443'] || contractAddresses['default'],
  subgraphAddresses: subgraphAddresses['34443'] || subgraphAddresses['default'],
  faucetTokens: [],
  raisedTokenData: [],
  validatedTokensInfo: {},
  validatedFtoAddresses: [],
  validatedMemeAddresses: [],
});

// Sonic Network
export const sonicNetwork = new Network({
  supportDEX: true,
  supportUniversalAccount: true,
  chain: sonicMainnet,
  iconUrl: 'https://explorer.soniclabs.com/favicon.ico',
  nativeToken: {
    address: '0x0000000000000000000000000000000000000000',
    name: 'S',
    symbol: 'S',
    decimals: 18,
    isNative: true,
    logoURI: 'https://sonicscan.io/images/svg/brands/main.svg',
    chainId: '146',
  },
  contracts: contractAddresses['146'] || contractAddresses['default'],
  subgraphAddresses: subgraphAddresses['146'] || subgraphAddresses['default'],
  faucetTokens: [],
  raisedTokenData: [],
  validatedTokensInfo: {},
  validatedFtoAddresses: [],
  validatedMemeAddresses: [],
});

// Conflux eSpace Network
export const confluxNetwork = new Network({
  supportDEX: true,
  supportUniversalAccount: true,
  chain: confluxESpaceMainnet,
  iconUrl:
    'https://s1.coincarp.com/logo/1/confluxtoken.png?style=200&v=1674808025',
  nativeToken: {
    address: '0x14b2d3bc65e74dae1030eafd8ac30c533c976a9b',
    name: 'CFX',
    symbol: 'CFX',
    decimals: 18,
    isNative: true,
    logoURI: 'https://evm.confluxscan.net/images/conflux.svg',
    chainId: '1030',
  },
  wrappedNativeToken: {
    address: '0x14b2d3bc65e74dae1030eafd8ac30c533c976a9b',
    name: 'Wrapped CFX',
    symbol: 'WCFX',
    decimals: 18,
    chainId: '1030',
  },
  contracts: contractAddresses['1030'] || contractAddresses['default'],
  subgraphAddresses: subgraphAddresses['1030'] || subgraphAddresses['default'],
  faucetTokens: [],
  raisedTokenData: [],
  validatedTokensInfo: {},
  validatedFtoAddresses: [],
  validatedMemeAddresses: [],
});

// Merlin Network
export const merlinNetwork = new Network({
  supportDEX: true,
  supportUniversalAccount: true,
  chain: merlinMainnet,
  iconUrl: 'https://icons.llamao.fi/icons/chains/rsz_merlin.jpg',
  nativeToken: {
    address: '0xf6d226f9dc15d9bb51182815b320d3fbe324e1ba',
    name: 'BTC',
    symbol: 'BTC',
    decimals: 18,
    isNative: true,
    logoURI: 'https://scan.merlinchain.io/images/bitcoin.png',
    chainId: '4200',
  },
  wrappedNativeToken: {
    address: '0xf6d226f9dc15d9bb51182815b320d3fbe324e1ba',
    name: 'Wrapped BTC',
    symbol: 'WBTC',
    decimals: 18,
    chainId: '4200',
  },
  contracts: contractAddresses['4200'] || contractAddresses['default'],
  subgraphAddresses: subgraphAddresses['4200'] || subgraphAddresses['default'],
  faucetTokens: [],
  raisedTokenData: [],
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
  bscMainnetNetwork,
  optimismNetwork,
  polygonNetwork,
  avalancheNetwork,
  lineaNetwork,
  blastNetwork,
  mantaNetwork,
  modeNetwork,
  sonicNetwork,
  confluxNetwork,
  merlinNetwork,
  // movementNetWork,
  // sprotoNetWork,
];

export const networksMap = networks.reduce((acc, network) => {
  acc[network.chainId] = network;
  return acc;
}, {} as Record<number | string, Network>);
