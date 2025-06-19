import { networks } from '@honeypot/shared';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  rainbowWallet,
  bitgetWallet,
  okxWallet,
  walletConnectWallet,
  metaMaskWallet,
  safeWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { injected, safe } from 'wagmi/connectors';
// import { holdstationWallet } from "./holdstationWallet";
// import { capsuleWallet } from "./capsualWallet";
// import { berasigWallet } from "./berasigWallet";
import { createConfig, http, cookieStorage, createStorage } from 'wagmi';

const pId = '1d1c8b5204bfbd57502685fc0934a57d';
const CAPSULE_API_KEY = process.env.NEXT_PUBLIC_CAPSULE_API_KEY!;
const DAPP_URL =
  process.env.NEXT_PUBLIC_DAPP_URL ||
  (typeof window !== 'undefined' ? window.location.origin : '');

let customWallets = [
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
  bitgetWallet,
  okxWallet,
  safeWallet,
  // holdstationWallet,
  // berasigWallet,
];

// if(!window.bitkeep){
//   customWallets.unshift(bitgetWallet);
// }

// Create Capsule wallet connector

const connectors = [
  safe({
    allowedDomains: [/app.safe.global$/],
    debug: true,
  }),
  injected(),
  ...connectorsForWallets(
    [
      {
        groupName: 'Recommended',
        wallets: customWallets,
      },
    ],
    {
      appName: 'Honypot Finance',
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

export const config = getDefaultConfig({
  connectors,
  appName: 'Honypot Finance',
  projectId: '1d1c8b5204bfbd57502685fc0934a57d',
  // @ts-ignore
  chains: networks.map((network) => network.chain),
  ssr: true, // If your dApp uses server side rendering (SSR)
  storage: createStorage({
    storage: cookieStorage,
  }),
});
