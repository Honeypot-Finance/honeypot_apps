import { StaticImageData } from 'next/image';
import bearCage from './launchedProjectsAsset/bearcage.webp';
import overlay from './launchedProjectsAsset/overlay.webp';
import burrBear from './launchedProjectsAsset/burrbear.webp';
import berally from './launchedProjectsAsset/berally.webp';
import bee from './launchedProjectsAsset/bee-token-icon.jpg';
import { networks, Network } from '@honeypot/shared';
import { Address } from 'viem';

export type LaunchedProject = {
  name: string;
  symbol: string;
  image: StaticImageData;
  chain: Network | undefined;
  raisedFund: number;
  participants: number;
  tokenAddress: Address;
};

export const launchedProjects: LaunchedProject[] = [
  {
    name: 'BearCage',
    symbol: 'xBEAR',
    image: bearCage,
    raisedFund: 234800,
    participants: 319,
    chain: networks.find((network) => {
      return network.chainId == 42161;
    }),
    tokenAddress: '0xEFAa58CDe7E0CE003fDD3F521f552dffC0bA9721',
  },
  {
    name: 'Overlay',
    symbol: 'OVL',
    image: overlay,
    raisedFund: 704200,
    participants: 268,
    chain: networks.find((network) => {
      return network.chainId == 42161;
    }),
    tokenAddress: '0x35a249b2D55Ad501eF936A70A0D8c72ed1EC28Ed',
  },
  {
    name: 'Burr Pre Sale Token',
    symbol: 'BURR',
    image: burrBear,
    raisedFund: 425800,
    participants: 456,
    chain: networks.find((network) => {
      return network.chainId == 80094;
    }),
    tokenAddress: '0x63461C4dF7BA73986f290b6BfA45a63E059A1627',
  },
  {
    name: 'Burr Governance Token',
    symbol: 'BURR',
    image: burrBear,
    raisedFund: 148100,
    participants: 270,
    chain: networks.find((network) => {
      return network.chainId == 80094;
    }),
    tokenAddress: '0x28e0e3B9817012b356119dF9e217c25932D609c2',
  },
  {
    name: 'Berally',
    symbol: 'xBRLY',
    image: berally,
    raisedFund: 1393000,
    participants: 635,
    chain: networks.find((network) => {
      return network.chainId == 42161;
    }),
    tokenAddress: '0xA540d5A66AB17FDE5655CBD13C0a8f851e5E7882',
  },
  // {
  //   name: 'BeraTrax',
  //   symbol: 'BTX',
  //   image: berally,
  //   raisedFund: 203000,
  //   participants: 635,
  //   chain: networks.find((network) => {
  //     return network.chainId == 80094;
  //   }),
  //   tokenAddress: "0x0"
  // },
  {
    name: 'Bee Token',
    symbol: 'BEE',
    image: bee,
    raisedFund: 58250,
    participants: 135,
    chain: networks.find((network) => {
      return network.chainId == 80094;
    }),
    tokenAddress: '0x93a0cb3ee34aa983db262f904021911ecd199228',
  },
];
