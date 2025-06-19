import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Balance } from '../balance';
import { BalanceSvg } from '../svg/balance';
import { ButtonHTMLAttributes } from 'react';
import { WalletSvg } from '../svg/wallet';
import Image from 'next/image';
import { useConnect, useConnectors } from 'wagmi';
import NetworkSelect from './NetworkSelect';

const ConnectButtonCustom = (props: ButtonHTMLAttributes<any>) => {
  return (
    <button
      type="button"
      className="flex py-2 sm:h-[42px] px-3 justify-center items-center gap-[4.411px] shrink-0 [background:rgba(247,147,26,0.10)] backdrop-blur-[10px] rounded-[100px] border-[1.654px] border-solid border-[rgba(247,147,26,0.20)]"
      {...props}
    ></button>
  );
};
export const WalletConnect = () => {
  const { connect } = useConnect();
  const connectors = useConnectors();

  const mockConnector = connectors.find((connector) => connector.id === 'mock');
  return (
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
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
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
            {(() => {
              if (!connected) {
                return (
                  <div className="flex items-center gap-x-2">
                    {/* <NetworkSelect /> */}
                    <ConnectButtonCustom
                      onClick={() => {
                        if (process.env.NEXT_PUBLIC_MOCK === 'true') {
                          connect({ connector: mockConnector! });
                        } else {
                          openConnectModal();
                        }
                      }}
                    >
                      <span className="flex w-[1rem] h-[1rem]">
                        <WalletSvg></WalletSvg>
                      </span>
                      Connect Wallet
                    </ConnectButtonCustom>
                  </div>
                );
              }
              if (chain.unsupported) {
                return (
                  <ConnectButtonCustom onClick={openChainModal}>
                    Wrong network
                  </ConnectButtonCustom>
                );
              }
              return (
                <div className="flex gap-[12px] items-center relative">
                  <Balance className="hidden md:flex min-w-[126px]">
                    <BalanceSvg />
                    <div className=" text-nowrap">
                      {account.displayBalance
                        ? `${account.displayBalance}`
                        : '-'}
                    </div>
                  </Balance>
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="text-black text-nowrap hidden md:flex h-[43px] justify-center items-center gap-[5.748px] [background:#FFCD4D] shadow-[-0.359px_-1.796px_0px_0px_#946D3F_inset] px-[14.369px] py-[7.184px] rounded-[21.553px] border-[0.718px] border-solid border-[rgba(148,109,63,0.37)]"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 12,
                          height: 12,
                          borderRadius: 999,
                          overflow: 'hidden',
                          marginRight: 4,
                        }}
                      >
                        {chain.iconUrl && (
                          <Image
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 12, height: 12 }}
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </button>
                  <ConnectButtonCustom onClick={openAccountModal} type="button">
                    {account.displayName}
                  </ConnectButtonCustom>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export const WalletConnectMobile = () => {
  const { connect } = useConnect();
  const connectors = useConnectors();
  const mockConnector = connectors.find((connector) => connector.id === 'mock');
  return (
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
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
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
            {(() => {
              if (!connected) {
                return (
                  <ConnectButtonCustom
                    onClick={() => {
                      if (process.env.NEXT_PUBLIC_MOCK === 'true') {
                        connect({ connector: mockConnector! });
                      } else {
                        openConnectModal();
                      }
                    }}
                  >
                    <span className="flex w-[1rem] h-[1rem]">
                      <WalletSvg></WalletSvg>
                    </span>
                    Connect Wallet
                  </ConnectButtonCustom>
                );
              }
              if (chain.unsupported) {
                return (
                  <ConnectButtonCustom onClick={openChainModal}>
                    Wrong network
                  </ConnectButtonCustom>
                );
              }
              return (
                <div className="flex gap-[12px] flex-col">
                  <Balance className="flex">
                    <>
                      <BalanceSvg></BalanceSvg>{' '}
                      <div className=" text-nowrap">
                        {' '}
                        {account.displayBalance
                          ? `${account.displayBalance}`
                          : '-'}
                      </div>
                    </>
                  </Balance>
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="text-black text-nowrap flex h-[43px] justify-center items-center gap-[5.748px] [background:#FFCD4D] shadow-[-0.359px_-1.796px_0px_0px_#946D3F_inset] px-[14.369px] py-[7.184px] rounded-[21.553px] border-[0.718px] border-solid border-[rgba(148,109,63,0.37)]"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 12,
                          height: 12,
                          borderRadius: 999,
                          overflow: 'hidden',
                          marginRight: 4,
                        }}
                      >
                        {chain.iconUrl && (
                          <Image
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 12, height: 12 }}
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
