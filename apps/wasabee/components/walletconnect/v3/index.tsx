import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ButtonHTMLAttributes } from 'react';
import Image from 'next/image';
import { useConnect, useConnectors } from 'wagmi';
import { BiWallet } from 'react-icons/bi';
import { BsPerson } from 'react-icons/bs';
import Link from 'next/link';
import { formatNumberWithUnit } from '@/lib/utils';
import { mock } from 'wagmi/connectors';
import { useObserver } from 'mobx-react-lite';
import { wallet } from '@honeypot/shared/lib/wallet';

const ConnectButtonCustom = (props: ButtonHTMLAttributes<any>) => {
  return (
    <button
      type="button"
      className="inline-flex h-10 px-4 justify-center items-center gap-2 bg-[#271A0C] rounded-[100px] text-white font-medium shadow-sm hover:bg-[#1a1410] transition-all whitespace-nowrap border border-[#333333]"
      {...props}
    ></button>
  );
};

export const WalletConnect = () => {
  const { connect } = useConnect();
  const currentChain = useObserver(() => wallet.currentChain);

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
              <div className="flex items-center gap-x-2 lg:gap-x-3">
                <Link
                  href="/profile"
                  className="flex items-center justify-center bg-[#271A0C] rounded-full p-1.5 lg:p-2 shrink-0 border border-[#333333] hover:bg-[#1a1410] transition-all"
                >
                  <BsPerson
                    size={24}
                    className="size-4 lg:size-6 text-[#F59E0B]"
                  />
                </Link>
                {(() => {
                  if (!connected) {
                    return (
                      <div className="flex items-center">
                        <ConnectButtonCustom
                          onClick={() => {
                            if (window.localStorage.getItem('mockAccount')) {
                              connect({
                                connector: mock({
                                  accounts: [
                                    window.localStorage.getItem(
                                      'mockAccount'
                                    ) as `0x${string}`,
                                  ],
                                }),
                              });
                            } else {
                              openConnectModal();
                            }
                          }}
                          className="text-xs sm:text-sm lg:text-base inline-flex items-center gap-x-1 sm:gap-x-2 bg-[#271A0C] text-white px-3 lg:px-4 py-1.5 lg:py-2 rounded-full border border-[#333333] hover:bg-[#1a1410] transition-all"
                        >
                          <BiWallet size={18} className="lg:size-5 shrink-0" />
                          <span className="whitespace-nowrap">
                            Connect Wallet
                          </span>
                        </ConnectButtonCustom>
                      </div>
                    );
                  }
                  if (chain.unsupported) {
                    return (
                      <ConnectButtonCustom
                        onClick={openChainModal}
                        className="text-xs sm:text-sm lg:text-base"
                      >
                        Wrong network
                      </ConnectButtonCustom>
                    );
                  }
                  return (
                    <div className="flex items-center gap-1.5 lg:gap-3">
                      <button
                        onClick={openChainModal}
                        type="button"
                        className="flex cursor-pointer bg-[#271A0C] text-white px-3 lg:px-4 py-1.5 lg:py-2 rounded-2xl gap-1.5 lg:gap-2 items-center shrink-0 text-xs sm:text-sm lg:text-base border border-[#333333] hover:bg-[#1a1410] transition-all"
                      >
                        <Image
                          src={currentChain?.iconUrl}
                          alt="icon"
                          width={18}
                          height={18}
                          className="lg:w-5 lg:h-5 rounded-full"
                        />
                        <div className="text-nowrap text-white">
                          {currentChain?.displayName}
                        </div>
                      </button>
                      <button
                        onClick={openAccountModal}
                        type="button"
                        className="flex cursor-pointer bg-[#FB9A1B] text-black px-3 lg:px-4 py-1.5 lg:py-2 rounded-2xl gap-1.5 lg:gap-2 items-center shrink-0 text-xs sm:text-sm lg:text-base border border-[#C87304] hover:bg-[#1a1410] transition-all"
                      >
                        <BiWallet size={18} className="lg:w-5 lg:h-5" />
                        <span className="whitespace-nowrap text-black">
                          {account.displayName}
                        </span>
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
