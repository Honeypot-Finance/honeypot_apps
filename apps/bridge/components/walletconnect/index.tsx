import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ButtonHTMLAttributes } from 'react';
import Image from 'next/image';
import { BiWallet } from 'react-icons/bi';
import { cn } from '@/lib/tailwindcss';

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
        'inline-flex h-9 px-4 justify-center items-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] rounded-xl text-black font-semibold text-sm transition-all whitespace-nowrap shadow-sm',
        className
      )}
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
                        className="h-9 px-4 bg-red-500/20 text-red-400 rounded-xl font-medium text-sm hover:bg-red-500/30 transition-all"
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
                        className="flex h-9 cursor-pointer bg-white/5 hover:bg-white/10 text-white px-3 rounded-xl gap-2 items-center text-sm font-medium transition-all border border-white/10"
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
                        className="flex h-9 cursor-pointer bg-[#F59E0B] hover:bg-[#D97706] text-black px-3 rounded-xl gap-2 items-center text-sm font-semibold transition-all"
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
