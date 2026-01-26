import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  rainbowWallet,
  bitgetWallet,
  okxWallet,
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
  avalanche,
  linea,
  sei,
  worldchain,
  ink,
  sonic,
  xdc,
} from 'wagmi/chains';
// Custom chains from bridge widget (not yet in viem/chains)
import {
  unichain,
  hyperEvm,
  plume,
  codex,
} from '@hongming-wang/usdc-bridge-widget';
import { WALLETCONNECT_PROJECT_ID } from '@/config/constants';

/**
 * Fallback RPC URLs for chains that have rate limiting issues.
 * Using CORS-enabled public RPCs. Order matters - first URL is tried first.
 */
const RPC_FALLBACKS: Record<number, string[]> = {
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
  [base.id]: [
    'https://base.drpc.org',
    'https://base-rpc.publicnode.com',
    'https://mainnet.base.org',
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
  [avalanche.id]: [
    'https://api.avax.network/ext/bc/C/rpc',
    'https://avalanche-c-chain-rpc.publicnode.com',
    'https://avax.meowrpc.com',
  ],
  [linea.id]: [
    'https://linea.drpc.org',
    'https://rpc.linea.build',
    'https://linea-rpc.publicnode.com',
  ],
  [sonic.id]: [
    'https://rpc.soniclabs.com',
    'https://sonic.drpc.org',
  ],
  [worldchain.id]: [
    'https://worldchain-mainnet.g.alchemy.com/public',
    'https://worldchain.drpc.org',
  ],
  [sei.id]: [
    'https://evm-rpc.sei-apis.com',
    'https://sei-evm.drpc.org',
  ],
  [xdc.id]: [
    'https://erpc.xinfin.network',
    'https://rpc.xdcrpc.com',
  ],
  [ink.id]: [
    'https://rpc-gel.inkonchain.com',
    'https://rpc-qn.inkonchain.com',
  ],
};

/**
 * All CCTP-supported chains for the bridge.
 * Includes chains from viem/chains and custom chains from the widget.
 */
const SUPPORTED_CHAINS = [
  mainnet,
  arbitrum,
  base,
  optimism,
  polygon,
  avalanche,
  linea,
  sonic,
  worldchain,
  sei,
  xdc,
  ink,
  unichain,
  hyperEvm,
  plume,
  codex,
] as const;

// Note: WalletConnect is available through other wallets (Rainbow, Trust, etc.)
// Removing standalone walletConnectWallet to prevent auto-modal popup issues
const customWallets = [
  metaMaskWallet,
  rainbowWallet,
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
