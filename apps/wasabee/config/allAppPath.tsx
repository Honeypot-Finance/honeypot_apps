import { StaticImageData } from 'next/image';
import { ReactNode } from 'react';
import Image from 'next/image';

export const DOMAIN_MAP = {
  MAIN: 'https://honeypotfinance.xyz',
  POT2PUMP: 'https://pot2pump.honeypotfinance.xyz',
  DREAMPAD: 'https://dreampad.honeypotfinance.xyz',
  WASABEE: 'https://wasabee.honeypotfinance.xyz',
} as const;

export type PathChatConfig = {
  autoPopUpQuestion: ReactNode;
  pageTrendingQuestions: ReactNode[];
};

export type Menu = {
  path:
    | string
    | {
        path: string;
        title: string;
        routePath: string;
        icon?: StaticImageData;
        footer?: ReactNode;
        chatConfig?: PathChatConfig;
        beforeContent?: ReactNode;
        afterContent?: ReactNode;
        textColor?: string;
      }[];
  title: string;
  routePath?: string;
  icon?: StaticImageData;
  chatConfig?: PathChatConfig;
  beforeContent?: ReactNode;
  afterContent?: ReactNode;
  textColor?: string;
};

export type flatMenu = {
  path: string;
  title: string;
  icon?: StaticImageData;
  chatConfig?: PathChatConfig;
};

export const footerData: Record<string, ReactNode> = {
  pot2pump: (
    <div className="flex justify-center items-center">
      <Image
        src="/images/pumping/toast-bear.png"
        width={1000}
        height={0}
        alt="toast bear"
        className="w-full"
      />
    </div>
  ),
};

export const appPathsList: Menu[] = [
  // {
  //   path: "/navigation",
  //   title: "Navigation",
  // },
  {
    path: [
      {
        path: `/swap`,
        title: 'Swap',
        routePath: '/swap',
      },
      {
        path: `/xswap`,
        title: 'Multi-Token Swap',
        routePath: '/xswap',
      },
      {
        path: `/cross-chain-swap`,
        title: 'Cross-Chain Swap',
        routePath: '/cross-chain-swap',
      },
    ],
    title: 'Trade',
  },
  {
    path: `/pools`,
    title: 'Pools',
    routePath: '/pools',
  },
  {
    path: `/bridge`,
    title: 'Bridge',
    routePath: '/bridge',
  },
  {
    path: `/perp`,
    title: 'Perp',
    routePath: '/perp',
    afterContent: (
      <span
        className="ml-2 px-2 py-0.5 text-[10px] font-medium rounded-md whitespace-nowrap"
        style={{
          color: '#FF5C91',
          backgroundColor: '#FF5C9133',
        }}
      >
        Beta
      </span>
    ),
  },
  // {
  //   path: `https://pot2pump.honeypotfinance.xyz/`,
  //   title: "Pot2Pump",
  //   routePath: "https://pot2pump.honeypotfinance.xyz/",
  // },
];

const getFlatPaths = (paths: Menu[]): flatMenu[] => {
  let flatPaths: flatMenu[] = [];

  paths.forEach((path) => {
    if (typeof path.path === 'string') {
      flatPaths.push({
        path: path.path,
        title: path.title,
      });
    }
    if (Array.isArray(path.path)) {
      flatPaths = [...flatPaths, ...getFlatPaths(path.path)];
    }
  });

  return flatPaths;
};

export const flatAppPath = getFlatPaths(appPathsList);
