import { parseGwei } from 'viem';
import {
  Chain,
  berachainTestnet as viemBerachainTestnet,
  polygonMumbai,
  sepolia,
  arbitrum,
  base,
  mainnet,
  berachain,
  berachainBepolia,
  arbitrumSepolia,
  bsc,
} from 'viem/chains';

export const bscMainnet: Chain = {
  ...bsc,
  rpcUrls: {
    default: {
      http: [
        'https://bsc-dataseed1.binance.org',
        'https://bsc-dataseed2.binance.org',
        'https://bsc-dataseed3.binance.org',
        'https://bsc-dataseed4.binance.org',
        'https://bsc-dataseed1.defibit.io',
        'https://bsc-dataseed2.defibit.io',
      ],
    },
    public: {
      http: [
        'https://bsc-dataseed1.binance.org',
        'https://bsc-dataseed2.binance.org',
        'https://bsc-dataseed3.binance.org',
        'https://bsc-dataseed4.binance.org',
      ],
    },
  },
  contracts: {
    ...bsc.contracts,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    },
  },
};

export const arbitrumSepoliaTestnet: Chain = {
  ...arbitrumSepolia,
  testnet: true,
};

export const arbitrumMainnet: Chain = {
  ...arbitrum,
};

export const baseMainnet: Chain = {
  ...base,
};

export const ethMainnet: Chain = {
  ...mainnet,
};

export const polygonMumbaiChain: Chain = {
  ...polygonMumbai,
};

export const berachainBepoliaTestnet: Chain = {
  ...berachainBepolia,
  testnet: true,
};

export const berachainTestnet: Chain = {
  ...viemBerachainTestnet,
  contracts: {
    ...viemBerachainTestnet.contracts,
    multicall3: {
      address: '0x360B0e3F6b3A1359Db0d680cDc119E695c1637B4',
      blockCreated: 1938031,
    },
  },
};

export const movementTestnet: Chain = {
  id: 177,
  name: 'Movement Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MOVE',
    symbol: 'MOVE',
  },
  rpcUrls: {
    default: {
      http: ['https://aptos.testnet.porto.movementlabs.xyz/v1'],
    },
  },
  testnet: true,
};

export const sprotoTestnet: Chain = {
  id: 6231991,
  name: 'Sproto Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://block-chain.alt.technology/'],
    },
  },
  testnet: true,
};

export const berachainBartioTestnet: Chain = {
  id: 80084,
  name: 'Berachain Bartio',
  nativeCurrency: {
    decimals: 18,
    name: 'BERA Token',
    symbol: 'BERA',
  },
  rpcUrls: {
    default: { http: ['https://bartio.rpc.berachain.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Berachain',
      url: 'https://berascan.com/',
    },
  },
  testnet: true,
  contracts: {
    multicall3: {
      address: '0x2f5e86C01B1Ab053747fbdb55FfECa65B07D0E53',
      blockCreated: 258000,
    },
  },
  fees: {
    defaultPriorityFee: parseGwei('50'),
  },
};

export const berachainMainnet: Chain = {
  ...berachain,
  id: 80094,
  name: 'Berachain',
  nativeCurrency: {
    decimals: 18,
    name: 'BERA Token',
    symbol: 'BERA',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.berachain.com/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Berachain',
      url: 'https://berascan.com/',
    },
  },
  testnet: true,
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0,
    },
  },
  fees: {
    defaultPriorityFee: parseGwei('50'),
  },
};

export const sepoliaTestnet: Chain = {
  ...sepolia,
  testnet: true,
};

export const chains = [
  sepoliaTestnet,
  berachainMainnet,
  berachainTestnet,
  berachainBartioTestnet,
  berachainBepoliaTestnet,
  polygonMumbaiChain,
  arbitrumSepoliaTestnet,
  arbitrumMainnet,
  baseMainnet,
  ethMainnet,
];

export const chainsMap = chains.reduce((acc, chain) => {
  acc[chain.id] = chain;
  return acc;
}, {} as Record<number | string, Chain>);
