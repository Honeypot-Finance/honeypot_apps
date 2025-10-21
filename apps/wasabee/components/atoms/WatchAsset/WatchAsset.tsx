import { WalletSvg } from '@/components/svg/wallet';

import { Token } from '@honeypot/shared/lib/contract/token/token';
import { Tooltip } from '@nextui-org/react';
import clsx from 'clsx';
import React from 'react';
import { useState } from 'react';

interface WatchAssetProps extends React.SVGProps<SVGSVGElement> {
  token: Token;
  className?: string;
}

export function WatchAsset(props: WatchAssetProps) {
  const [state, setState] = useState({
    isTooltipOpen: false,
  });

  return (
    <Tooltip
      color="primary"
      content="import token to wallet"
      isOpen={state.isTooltipOpen}
    >
      <span
        onMouseEnter={() => {
          setState({ isTooltipOpen: true });
        }}
        onMouseLeave={() => {
          setState({ isTooltipOpen: false });
        }}
        className={clsx(
          ' inline-block cursor-pointer hover:text-primary hover:stroke-primary hover:fill-primary ',
          props.className
        )}
        onClick={() => {
          props.token.watch();
        }}
      >
        <WalletSvg></WalletSvg>
      </span>
    </Tooltip>
  );
}
