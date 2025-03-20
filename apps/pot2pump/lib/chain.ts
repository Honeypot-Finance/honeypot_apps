import { parseGwei } from 'viem';
import {
  berachainBepolia,
  Chain,
  polygonMumbai,
  sepolia as viewSepolia,
} from 'viem/chains';
export const polygonMumbaiChain: Chain = {
  ...polygonMumbai,
  rpcUrls: {
    default: {
      http: ['https://polygon-mumbai-pokt.nodies.app'],
    },
  },
};

export const berachainTestnet: Chain = {
  ...berachainBepolia,
};

export const chains = [
  //sepolia,
  berachainTestnet,
  polygonMumbaiChain,
];

export const chainsMap = chains.reduce((acc, chain) => {
  acc[chain.id] = chain;
  return acc;
}, {} as Record<number | string, Chain>);
