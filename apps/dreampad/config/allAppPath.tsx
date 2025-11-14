import { StaticImageData } from 'next/image';
import { ReactNode } from 'react';
import Image from 'next/image';

const DOMAIN_MAP = {
  MAIN: 'https://app.honeypotfinance.xyz',
  POT2PUMP: 'https://pot2pump.honeypotfinance.xyz',
  DREAMPAD: 'https://dreampad.honeypotfinance.xyz',
  WASABEE: 'https://dex.honeypotfinance.xyz',
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
      }[];
  title: string;
  routePath?: string;
  icon?: StaticImageData;
  chatConfig?: PathChatConfig;
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
  {
    path: '/launchpad-projects',
    title: 'Sales',
  },
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
