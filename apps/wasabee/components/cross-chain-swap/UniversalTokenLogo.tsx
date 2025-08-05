import React from 'react';
import { observer } from 'mobx-react-lite';
import { Token } from '@honeypot/shared';
import Image from 'next/image';
import { Tooltip } from '@nextui-org/react';
import { getUniversalTokenMetadata } from '../../config/universalTokenMetadata';

interface UniversalTokenLogoProps {
  token: Token;
  size?: number;
}

// A simpler token logo component that doesn't initialize the token
// Used for Universal Account tokens to avoid contract calls
export const UniversalTokenLogo = observer(({ token, size = 24 }: UniversalTokenLogoProps) => {
  // Try to get metadata first
  const metadata = getUniversalTokenMetadata(parseInt(token.chainId), token.address);
  
  // Use metadata if available, otherwise fall back to token properties
  const logoURI = metadata?.logoURI || token.logoURI;
  const symbol = metadata?.symbol || token.symbol || 'Unknown';
  const name = metadata?.name || token.name || 'Unknown Token';
  
  return (
    <Tooltip
      content={
        <div className="flex flex-col items-center gap-[8px]">
          {name} ({symbol})
        </div>
      }
      closeDelay={0}
    >
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        {logoURI ? (
          <Image
            src={logoURI}
            alt={symbol}
            width={size}
            height={size}
            className="rounded-full"
            onError={(e) => {
              // Hide image on error
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div 
            className="rounded-full bg-gray-700 flex items-center justify-center text-xs font-medium text-white"
            style={{ width: size, height: size }}
          >
            {symbol.slice(0, 3).toUpperCase()}
          </div>
        )}
      </div>
    </Tooltip>
  );
});