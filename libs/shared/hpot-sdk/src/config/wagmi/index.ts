import { connectorsForWallets, getDefaultConfig } from '@rainbow-me/rainbowkit';
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
import { injected, safe } from 'wagmi/connectors';
import { cookieStorage, createStorage, Config, http, fallback } from 'wagmi';
import { berachainMainnet, networks } from '../chains';

const pId = '23b1ff4e22147bdf7cab13c0ee4bed90';

// Check if wallet needs to be disconnected
const setAllWalletsDisconnectedInStorage = () => {
  if (typeof window === 'undefined') return false;

  const wagmiStore = localStorage.getItem('wagmi.store');
  const recentConnectorId = localStorage.getItem('wagmi.recentConnectorId');

  // If no store or recent connector,  set disconnected state
  if (!wagmiStore || !recentConnectorId) return true;

  try {
    const store = JSON.parse(wagmiStore);
    // Check if there are any active connections
    if (store?.state?.connections?.value?.length > 0 || store?.state?.current) {
      return false;
    }
  } catch (e) {
    console.error('Error parsing wagmi.store:', e);
  }

  return false;
};

// Set all wallet states to disconnected
const shouldSetAllWalletsDisconnectedInStorage = () => {
  if (typeof window === 'undefined') return;

  // Only set disconnected states if needed
  if (!setAllWalletsDisconnectedInStorage()) return;

  // Set wagmi states
  localStorage.setItem('wagmi.connected', 'false');
  localStorage.setItem('wagmi.injected.shimDisconnect', 'true');

  // Set specific wallet states to disconnected
  localStorage.setItem('wagmi.okx.disconnected', 'true');
  localStorage.setItem('wagmi.metaMask.disconnected', 'true');
  localStorage.setItem('wagmi.rainbow.disconnected', 'true');
  localStorage.setItem('wagmi.walletConnect.disconnected', 'true');
  localStorage.setItem('wagmi.bitget.disconnected', 'true');
  localStorage.setItem('wagmi.com.okex.wallet.disconnected', 'true');
  localStorage.setItem('wagmi.app.phantom.disconnected', 'true');
  localStorage.setItem('wagmi.io.metamask.disconnected', 'true');
};

const customWallets = () => {
  return [
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
    // holdstationWallet,
    // berasigWallet,
  ];
};

// if(!window.bitkeep){
//   customWallets.unshift(bitgetWallet);
// }

// Create Capsule wallet connector

const connectors = () => [
  safe(),
  injected(),
  ...connectorsForWallets(
    [
      {
        groupName: 'Recommended',
        wallets: customWallets(),
      },
    ],
    {
      appName: 'honeypot-finance',
      projectId: pId,
    }
  ),
];

// if (process.env.NODE_ENV === "development") {
//   connectors.push(
//     mock({
//       accounts: ["0xb67daf60d82de28e54d479509b49b82d7157af6b"],
//     })
//   );
// }

//  persistent storage
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

export const createWagmiConfig = (overrideConfig?: Partial<Config>) => {
  // Return a mock config for server-side rendering that mimics the shape
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
    } as any;
  }

  // Set  wallet states to disconnected when creating new config
  shouldSetAllWalletsDisconnectedInStorage();

  // Safe access to networks - ensure it's an array even if undefined
  const safeNetworks = Array.isArray(networks) ? networks : [];

  return getDefaultConfig({
    connectors: connectors(),
    appName: 'honeypot-finance',
    projectId: pId,
    transports: {
      ...Object.fromEntries(
        safeNetworks
          .filter((network) => {
            try {
              return network?.chain?.rpcUrls?.default?.http?.[0];
            } catch (e) {
              console.warn(
                `Network ${network?.chainId} has invalid chain config:`,
                e
              );
              return false;
            }
          })
          .map((network) => [
            network.chainId,
            http(network.chain.rpcUrls.default.http[0]),
          ])
      ),
      ...(berachainMainnet
        ? {
            [berachainMainnet.id]: fallback([
              http(
                'https://api.henlo-winnie.dev/v1/mainnet/08c3ed43-6326-4be6-9dc2-78a5f77b7382'
              ),
              http('https://rpc.berachain.com'),
            ]),
          }
        : {}),
    },
    // @ts-expect-error - chains type mismatch with RainbowKit
    chains: safeNetworks
      .filter((network) => {
        try {
          return network?.chain;
        } catch (e) {
          console.warn(`Network ${network?.chainId} has no chain config:`, e);
          return false;
        }
      })
      .map((network) => network.chain),
    ssr: false,
    storage: createStorage({
      storage: createCustomStorage(),
    }),
    ...overrideConfig,
  });
};
