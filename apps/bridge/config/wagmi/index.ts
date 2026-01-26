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
import { cookieStorage, createStorage, http, fallback, type Config } from 'wagmi';
import {
  mainnet,
  base,
  arbitrum,
  optimism,
  polygon,
  bsc,
  avalanche,
} from 'wagmi/chains';
import { WALLETCONNECT_PROJECT_ID } from '@/config/constants';

/**
 * Fallback RPC URLs for chains that have rate limiting issues.
 * Using CORS-enabled public RPCs. Order matters - first URL is tried first.
 * Consider moving to environment variables for production deployments.
 */
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

/**
 * Creates the wagmi config for the bridge app.
 * Returns a mock config on server-side to prevent hydration mismatches.
 *
 * Note: The SSR mock config is typed as Config for simplicity, though it's
 * a minimal placeholder that won't be used for actual wallet operations.
 * The real config is created client-side after mount.
 */
export const createWagmiConfig = (): Config => {
  // Return a mock config for server-side rendering
  // This is never actually used - the app waits for client-side mount
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
    } as unknown as Config;
  }

  return getDefaultConfig({
    appName: 'honeypot-bridge',
    projectId: WALLETCONNECT_PROJECT_ID,
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
