import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Balance } from '../balance';
import { BalanceSvg } from '../svg/balance';
import { ButtonHTMLAttributes, useState, useEffect } from 'react';
import { WalletSvg } from '../svg/wallet';
import Image from 'next/image';
import { useConnect, useConnectors } from 'wagmi';
import NetworkSelect from './NetworkSelect';
import { UniversalAccountToggle, UniversalAccountDetailsModal } from '@honeypot/shared';
import { observer } from 'mobx-react-lite';
import { wallet } from '@honeypot/shared/lib/wallet';
import { useDisclosure } from '@nextui-org/react';

const ConnectButtonCustom = (props: ButtonHTMLAttributes<any>) => {
  return (
    <button
      type="button"
      className="flex py-2 sm:h-[42px] px-3 justify-center items-center gap-[4.411px] shrink-0 [background:rgba(247,147,26,0.10)] backdrop-blur-[10px] rounded-[100px] border-[1.654px] border-solid border-[rgba(247,147,26,0.20)]"
      {...props}
    ></button>
  );
};
export const WalletConnect = observer(() => {
  const { connect } = useConnect();
  const connectors = useConnectors();
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  let chainModalRef: (() => void) | null = null;

  // Use React state instead of relying on MobX observation
  const [isUniversalAccountActive, setIsUniversalAccountActive] = useState(wallet.useUniversalAccount);
  
  // Listen for changes and update React state manually
  useEffect(() => {
    const updateState = () => {
      console.log('🔄 Manual state update - wallet.useUniversalAccount:', wallet.useUniversalAccount);
      setIsUniversalAccountActive(wallet.useUniversalAccount);
    };
    
    // Check every 100ms for changes (temporary workaround)
    const interval = setInterval(() => {
      if (wallet.useUniversalAccount !== isUniversalAccountActive) {
        updateState();
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [isUniversalAccountActive]);
  
  console.log('🔍 DESKTOP WalletConnect render - isUniversalAccountActive:', isUniversalAccountActive, 'wallet.useUniversalAccount:', wallet.useUniversalAccount);

  const mockConnector = connectors.find((connector) => connector.id === 'mock');
  return (
    <>
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
        // Store the openChainModal function for use in the details modal
        chainModalRef = openChainModal;
        
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
                  {/* TESTING: Add obvious visual indicator */}
                  <div style={{backgroundColor: 'red', color: 'white', padding: '5px', fontSize: '12px'}}>
                    TEST MODE - UA: {isUniversalAccountActive ? 'ON' : 'OFF'}
                  </div>
                  {isUniversalAccountActive ? (
                    // Universal Account Mode - Show only one button
                    <ConnectButtonCustom onClick={onDetailsOpen} type="button">
                      🔥 UNIVERSAL ACCOUNT 🔥
                    </ConnectButtonCustom>
                  ) : (
                    // Normal Mode - Show all components
                    <>
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
                      <UniversalAccountToggle />
                      <ConnectButtonCustom onClick={openAccountModal} type="button">
                        👤 {account.displayName}
                      </ConnectButtonCustom>
                    </>
                  )}
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
    
    {/* Universal Account Details Modal */}
    <UniversalAccountDetailsModal
      isOpen={isDetailsOpen}
      onClose={onDetailsClose}
      onOpenChainModal={chainModalRef || undefined}
    />
    </>
  );
});

export const WalletConnectMobile = observer(() => {
  const { connect } = useConnect();
  const connectors = useConnectors();
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  // Move this outside the ConnectButton.Custom so MobX can track it
  const isUniversalAccountActive = wallet.useUniversalAccount;
  const mockConnector = connectors.find((connector) => connector.id === 'mock');
  let chainModalRef: (() => void) | null = null;

  return (
    <>
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
        // Store the openChainModal function for use in the details modal
        chainModalRef = openChainModal;
        
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
                  {isUniversalAccountActive ? (
                    // Universal Account Mode - Show only one button
                    <ConnectButtonCustom onClick={onDetailsOpen} type="button">
                      Universal Account
                    </ConnectButtonCustom>
                  ) : (
                    // Normal Mode - Show all components
                    <>
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
                    </>
                  )}
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
    
    {/* Universal Account Details Modal for Mobile */}
    <UniversalAccountDetailsModal
      isOpen={isDetailsOpen}
      onClose={onDetailsClose}
      onOpenChainModal={chainModalRef || undefined}
    />
    </>
  );
});
