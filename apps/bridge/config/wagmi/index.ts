import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  rainbowWallet,
  bitgetWallet,
  okxWallet,
  walletConnectWallet,
  metaMaskWallet,
  binanceWallet,
  safeWallet,
  bybitWallet,
  trustWallet,
  phantomWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { cookieStorage, createStorage, http, fallback } from 'wagmi';
import {
  mainnet,
  base,
  arbitrum,
  optimism,
  polygon,
  bsc,
  avalanche,
} from 'wagmi/chains';

// Fallback RPC URLs for chains that have rate limiting issues
// Using CORS-enabled public RPCs
const RPC_FALLBACKS: Record<number, string[]> = {
  [base.id]: [
    'https://base.drpc.org',
    'https://base-rpc.publicnode.com',
    'https://mainnet.base.org',
  ],
  [mainnet.id]: [
    'https://eth.drpc.org',
    'https://ethereum-rpc.publicnode.com',
    'https://cloudflare-eth.com',
  ],
  [arbitrum.id]: [
    'https://arbitrum.drpc.org',
    'https://arbitrum-one-rpc.publicnode.com',
    'https://arb1.arbitrum.io/rpc',
  ],
  [optimism.id]: [
    'https://optimism.drpc.org',
    'https://optimism-rpc.publicnode.com',
    'https://mainnet.optimism.io',
  ],
  [polygon.id]: [
    'https://polygon.drpc.org',
    'https://polygon-bor-rpc.publicnode.com',
    'https://polygon-rpc.com',
  ],
  [bsc.id]: [
    'https://bsc.drpc.org',
    'https://bsc-rpc.publicnode.com',
    'https://bsc-dataseed1.binance.org',
  ],
  [avalanche.id]: [
    'https://api.avax.network/ext/bc/C/rpc',
    'https://avalanche-c-chain-rpc.publicnode.com',
    'https://avax.meowrpc.com',
  ],
};

const PROJECT_ID = '23b1ff4e22147bdf7cab13c0ee4bed90';

// Supported chains for the bridge
const SUPPORTED_CHAINS = [
  mainnet,
  base,
  arbitrum,
  optimism,
  polygon,
  bsc,
  avalanche,
] as const;

const customWallets = [
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
  bitgetWallet,
  okxWallet,
  binanceWallet,
  bybitWallet,
  trustWallet,
  phantomWallet,
  safeWallet,
];

const createCustomStorage = () => {
  const storage =
    typeof window !== 'undefined' ? window.localStorage : cookieStorage;

  return {
    ...storage,
    setItem: (key: string, value: string) => {
      storage.setItem(key, value);
    },
    getItem: storage.getItem.bind(storage),
    removeItem: storage.removeItem.bind(storage),
  };
};

export const createWagmiConfig = () => {
  // Return a mock config for server-side rendering
  if (typeof window === 'undefined') {
    return {
      _internal: {
        chains: { setUp: false },
        connectors: { setUp: false, value: [] },
        transports: {},
        current: null,
        setup: false,
      },
      chains: [],
      connectors: [],
      state: {
        chainId: 1,
        connections: new Map(),
        current: null,
        status: 'disconnected',
      },
      storage: null,
      ssr: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  }

  return getDefaultConfig({
    appName: 'honeypot-bridge',
    projectId: PROJECT_ID,
    wallets: [
      {
        groupName: 'Recommended',
        wallets: customWallets,
      },
    ],
    transports: Object.fromEntries(
      SUPPORTED_CHAINS.map((chain) => [
        chain.id,
        RPC_FALLBACKS[chain.id]
          ? fallback(RPC_FALLBACKS[chain.id].map((url) => http(url)))
          : http(chain.rpcUrls.default.http[0]),
      ])
    ),
    chains: SUPPORTED_CHAINS,
    ssr: false,
    storage: createStorage({
      storage: createCustomStorage(),
    }),
  });
};
