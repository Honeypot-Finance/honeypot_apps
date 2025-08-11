import { connectorsForWallets, getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  rainbowWallet,
  bitgetWallet,
  okxWallet,
  walletConnectWallet,
  metaMaskWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { injected, safe } from 'wagmi/connectors';
import { cookieStorage, createStorage, Config, http } from 'wagmi';
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
  // Set  wallet states to disconnected when creating new config
  shouldSetAllWalletsDisconnectedInStorage();

  return getDefaultConfig({
    connectors: connectors(),
    appName: 'honeypot-finance',
    projectId: pId,
    transports: {
      ...Object.fromEntries(
        networks
          .filter((network) => network.chain?.rpcUrls?.default?.http?.[0])
          .map((network) => [
            network.chainId,
            http(network.chain.rpcUrls.default.http[0]),
          ])
      ),
      [berachainMainnet.id]: http(
        'https://api.henlo-winnie.dev/v1/mainnet/08c3ed43-6326-4be6-9dc2-78a5f77b7382'
      ),
    },
    // @ts-ignore
    chains: networks
      .filter((network) => network.chain)
      .map((network) => network.chain),
    ssr: false,
    storage: createStorage({
      storage: createCustomStorage(),
    }),
    ...overrideConfig,
  });
};
