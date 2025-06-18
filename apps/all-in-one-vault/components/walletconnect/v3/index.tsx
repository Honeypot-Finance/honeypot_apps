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
      className="inline-flex h-10 px-4 justify-center items-center gap-2 bg-white rounded-[100px] text-black font-medium shadow-sm hover:opacity-90 transition-opacity whitespace-nowrap"
      {...props}
    ></button>
  );
};

export const WalletConnect = () => {
  const { connect } = useConnect();
  const currentChain = useObserver(() => wallet.currentChain);

  return (
    <div className="flex flex-col items-center">
      <Image
        src="/images/header/hanging-rope.svg"
        alt="hanging rope"
        width={139}
        height={66}
        className="mb-[-20px]"
      />
      <div className="bg-[#FFCD4D] w-full rounded-xl pb-8 bg-[url('/images/card-container/dark/bottom-border.svg')] bg-left-bottom bg-repeat-x pt-2 lg:pt-4 px-2 lg:px-4">
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
              (!authenticationStatus ||
                authenticationStatus === 'authenticated');
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
                <div className="flex w-full items-center gap-x-2 lg:gap-x-3 justify-between">
                  <Link
                    href="/profile"
                    className="flex items-center justify-center bg-white rounded-full p-1.5 lg:p-2 shrink-0"
                  >
                    <BsPerson
                      size={24}
                      className="size-4 lg:size-6"
                      color="#202020"
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
                            className="text-xs sm:text-sm lg:text-base inline-flex items-center gap-x-1 sm:gap-x-2 bg-[#202020] px-3 lg:px-4 py-1.5 lg:py-2 rounded-full"
                          >
                            <BiWallet
                              size={18}
                              className="lg:size-5 shrink-0"
                            />
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
                          className="flex cursor-pointer bg-[#202020] text-white px-3 lg:px-4 py-1.5 lg:py-2 rounded-2xl gap-1.5 lg:gap-2 items-center shrink-0 text-xs sm:text-sm lg:text-base"
                        >
                          <Image
                            src={currentChain.iconUrl}
                            alt="icon"
                            width={18}
                            height={18}
                            className="lg:w-5 lg:h-5 rounded-full"
                          />
                          <div className="text-nowrap text-white">
                            {account.balanceFormatted ? (
                              <span>{`${formatNumberWithUnit(
                                Number(account.balanceFormatted),
                                3
                              )} ${account.balanceSymbol}`}</span>
                            ) : (
                              <div className="h-3 lg:h-4 w-16 lg:w-20 bg-gray-700 animate-pulse rounded"></div>
                            )}
                          </div>
                        </button>
                        <button
                          onClick={openAccountModal}
                          type="button"
                          className="flex cursor-pointer bg-[#202020] text-white px-3 lg:px-4 py-1.5 lg:py-2 rounded-2xl gap-1.5 lg:gap-2 items-center shrink-0 text-xs sm:text-sm lg:text-base"
                        >
                          <BiWallet size={18} className="lg:w-5 lg:h-5" />
                          <span className="whitespace-nowrap">
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
    </div>
  );
};
