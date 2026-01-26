import { StaticImageData } from 'next/image';
import { ReactNode } from 'react';

export const DOMAIN_MAP = {
  MAIN: 'https://honeypotfinance.xyz',
  POT2PUMP: 'https://pot2pump.honeypotfinance.xyz',
  DREAMPAD: 'https://dreampad.honeypotfinance.xyz',
  WASABEE: 'https://dex.honeypotfinance.xyz',
  BRIDGE: 'https://bridge.honeypotfinance.xyz',
} as const;

export type Menu = {
  path:
    | string
    | {
        path: string;
        title: string;
        routePath: string;
        icon?: StaticImageData;
        beforeContent?: ReactNode;
        afterContent?: ReactNode;
        textColor?: string;
      }[];
  title: string;
  routePath?: string;
  icon?: StaticImageData;
  beforeContent?: ReactNode;
  afterContent?: ReactNode;
  textColor?: string;
};

// Local fallback navigation for Bridge app
export const appPathsList: Menu[] = [
  {
    path: '/',
    title: 'Bridge',
    routePath: '/',
  },
];
