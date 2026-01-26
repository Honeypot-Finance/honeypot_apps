import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ButtonHTMLAttributes } from 'react';
import Image from 'next/image';
import { BiWallet } from 'react-icons/bi';
import { cn } from '@/lib/tailwindcss';
import { THEME_COLORS } from '@/config/constants';

interface ConnectButtonCustomProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  chainIcon?: string;
  chainName?: string;
}

const ConnectButtonCustom = ({
  chainIcon,
  chainName,
  children,
  className,
  ...buttonProps
}: ConnectButtonCustomProps) => {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-9 px-4 justify-center items-center gap-2 rounded-xl text-black font-semibold text-sm transition-all whitespace-nowrap shadow-sm',
        className
      )}
      style={{
        backgroundColor: THEME_COLORS.primary,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = THEME_COLORS.primaryEmphasis;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = THEME_COLORS.primary;
      }}
      {...buttonProps}
    >
      {children}
      {chainIcon && chainName && (
        <>
          <Image
            src={chainIcon}
            alt={`${chainName} network icon`}
            width={18}
            height={18}
            className="rounded-full"
          />
          <span>{chainName}</span>
        </>
      )}
    </button>
  );
};

export const WalletConnect = () => {
  return (
    <div className="flex items-center gap-2">
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          const ready = mounted && authenticationStatus !== 'loading';
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus || authenticationStatus === 'authenticated');

          return (
            <div
              {...(!ready && {
                'aria-hidden': true,
                style: {
                  opacity: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                },
              })}
            >
              <div className="flex items-center gap-2">
                {(() => {
                  if (!connected) {
                    return (
                      <ConnectButtonCustom onClick={openConnectModal}>
                        <BiWallet size={16} className="shrink-0" />
                        <span>Connect</span>
                      </ConnectButtonCustom>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <button
                        onClick={openChainModal}
                        type="button"
                        className="h-9 px-4 rounded-xl font-medium text-sm transition-all"
                        style={{
                          backgroundColor: `${THEME_COLORS.error}33`, // 20% opacity
                          color: THEME_COLORS.error,
                        }}
                      >
                        Wrong network
                      </button>
                    );
                  }

                  return (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={openChainModal}
                        type="button"
                        className="flex h-9 cursor-pointer text-white px-3 rounded-xl gap-2 items-center text-sm font-medium transition-all"
                        style={{
                          backgroundColor: THEME_COLORS.hover,
                          borderWidth: 1,
                          borderColor: THEME_COLORS.hoverLight,
                        }}
                      >
                        {chain.hasIcon && chain.iconUrl && (
                          <Image
                            src={chain.iconUrl}
                            alt={`${chain.name} network icon`}
                            width={18}
                            height={18}
                            className="rounded-full"
                          />
                        )}
                        <span className="hidden sm:inline">{chain.name}</span>
                      </button>
                      <button
                        onClick={openAccountModal}
                        type="button"
                        className="flex h-9 cursor-pointer text-black px-3 rounded-xl gap-2 items-center text-sm font-semibold transition-all"
                        style={{ backgroundColor: THEME_COLORS.primary }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = THEME_COLORS.primaryEmphasis;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = THEME_COLORS.primary;
                        }}
                      >
                        <BiWallet size={16} />
                        <span>{account.displayName}</span>
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
};
