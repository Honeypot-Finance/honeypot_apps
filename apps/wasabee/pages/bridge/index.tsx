import { cn } from '@/lib/utils';

import { Tabs } from '@nextui-org/react';
import rhinoLogo from '@/public/images/partners/rhino-finance-logo.svg';
import { Tab } from '@nextui-org/react';
import Image from 'next/image';
import OrbiterBridge from './OrbiterBridge';
import StargateBridge from './StargateBridge';
import SwapWidget from '@ensofinance/shortcuts-widget';

export default function Bridge() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 xl:px-0 font-gliker w-full">
      {/* TODO: Add pool bg img */}
      <Tabs
        classNames={{
          tab: 'h-12',
          base: 'relative w-full',
          cursor: 'bg-[#202020] !text-white/80 px-2 py-3',
          tabList:
            'flex rounded-[16px] border border-[#333333] bg-[#271A0C] shadow-[4px_4px_0px_0px_#202020,-4px_4px_0px_0px_#202020] p-3 absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10',
          // TODO: Update top border img
          panel: cn(
            'flex flex-col h-full w-full gap-y-4 items-center bg-[#140D06] rounded-2xl text-white',
            'px-8 pt-[70px] pb-[70px]',
            'border-2 border-[#3B2712]',
            // "bg-[url('/images/card-container/honey/honey-border.png'),url('/images/card-container/dark/bottom-border.svg')]",
            'bg-[position:-65px_top,_-85px_bottom]',
            'bg-[size:auto_65px,_auto_65px]',
            'bg-repeat-x',
            '!mt-0',
            'h-auto'
          ),
          tabContent: 'text-[#202020]',
        }}
      >
        {/* <Tab key="orbiter" title="Orbiter" className=" ">
          <OrbiterBridge />
        </Tab> */}

        <Tab key="enso" title="Enso" className="">
          <SwapWidget
            apiKey="2fdbd4dc-68e6-440a-a51a-b486e8270930"
            enableShare={true}
            adaptive={true}
            themeConfig={{
              theme: {
                semanticTokens: {
                  colors: {
                    // Background colors - matching cross-chain swap dark theme
                    bg: { value: '#140D06' }, // Very dark background
                    'bg.subtle': { value: '#271A0C' }, // Card background
                    'bg.emphasized': { value: '#2a2a2a' }, // Elevated elements
                    'bg.muted': { value: '#141414' }, // Slightly lighter than base

                    // Foreground colors
                    fg: { value: '#ffffff' }, // White text
                    'fg.muted': { value: '#9ca3af' }, // Gray text
                    'fg.subtle': { value: '#6b7280' }, // Darker gray

                    // Border colors
                    border: { value: '#2a2a2a' }, // Matching border color
                    'border.emphasized': { value: '#333333' }, // Stronger border
                    'border.subtle': { value: '#1a1a1a' }, // Subtle border

                    // Primary accent colors (orange/amber)
                    primary: { value: '#F59E0B' }, // Primary orange
                    'primary.emphasis': { value: '#D97706' }, // Darker orange
                    'primary.muted': { value: '#FCD34D' }, // Lighter orange

                    // Status colors
                    success: { value: '#10b981' }, // Green
                    warning: { value: '#f59e0b' }, // Amber
                    error: { value: '#ef4444' }, // Red
                    info: { value: '#3b82f6' }, // Blue
                  },
                },
              },
            }}
          />
        </Tab>
        {/* <Tab key="stargate" title="Stargate">
          <StargateBridge />
        </Tab> */}
        {/* <Tab
          key="rhino"
          href="https://app.rhino.fi/bridge/?refId=DeFi_HPOT&token=USDC&chainOut=BERACHAIN&chainIn=ETHEREUM"
          target="_blank"
          title={
            <div className="flex items-center gap-2">
              <Image src={rhinoLogo} alt="Rhino" width={100} height={100} />
              <span>Rhino</span>
            </div>
          }
        ></Tab> */}
      </Tabs>
    </div>
  );
}
