import React from 'react';
import { observer } from 'mobx-react-lite';
import { Token } from '@honeypot/shared/lib/contract/token/token';
import Image from 'next/image';
import { Tooltip } from '@nextui-org/react';

interface UniversalTokenLogoProps {
  token: Token;
  size?: number;
}

// Helper to validate if logoURI is a valid URL
const isValidImageUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  // Must start with http://, https://, or / (absolute path)
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/');
};

// A simpler token logo component that doesn't initialize the token
// Used for Universal Account tokens to avoid contract calls
export const UniversalTokenLogo = observer(({ token, size = 24 }: UniversalTokenLogoProps) => {
  // Use token properties directly
  const logoURI = token.logoURI;
  const symbol = token.symbol || 'Unknown';
  const name = token.name || 'Unknown Token';

  // Validate logoURI - must be absolute URL or path
  const validLogoURI = isValidImageUrl(logoURI) ? logoURI : undefined;

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
        {validLogoURI ? (
          <Image
            src={validLogoURI}
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