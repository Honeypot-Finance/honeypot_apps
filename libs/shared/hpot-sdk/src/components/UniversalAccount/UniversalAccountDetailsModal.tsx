'use client';
import { observer } from 'mobx-react-lite';
import { EvmAddressDisplay } from './AddressDisaplay/EvmAddressDisplay';
import { DynamicFormatAmount, wallet } from '@honeypot/shared';
import { NotConnected } from './AccountStatus/NotConnected';
import { zeroAddress } from 'viem';
import { useMemo, useState } from 'react';
import { SolAddressDisplay } from './AddressDisaplay/SolAddressDisplay';
import { OwnerAddressDisplay } from './AddressDisaplay/OwnerAddressDisplay';
import { Button as NextuiButton, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from '@nextui-org/react';
import Image from 'next/image';
import { particleIcon } from '../../assets/images/partners';
import { ChainNotSupport } from './AccountStatus/ChainNotSupport';
import { DepositModal } from './DepositModal/DepositModal';
import { WithdrawModal } from './WithdrawModal/WithdrawModal';

interface UniversalAccountDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChainModal?: () => void;
  onDisconnect?: () => void;
}

export const UniversalAccountDetailsModal = observer(({
  isOpen,
  onClose,
  onOpenChainModal,
  onDisconnect
}: UniversalAccountDetailsModalProps) => {
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  
  const notConnected = useMemo(() => {
    const isNotConnected =
      !wallet.isInit ||
      !wallet.account ||
      wallet.account === zeroAddress ||
      !wallet.universalAccount;

    return isNotConnected;
  }, [
    wallet.isInit,
    wallet.account,
    wallet.universalAccount,
    wallet.universalAccount?.accountUsdValue,
  ]);

  if (!wallet.currentChain?.supportUniversalAccount) {
    return (
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        size="md"
        classNames={{
          body: "py-6",
          backdrop: "bg-[#292f46]/50 backdrop-opacity-40",
          base: "border-[#292f46] bg-[#19172c] dark:bg-[#19172c] text-[#a8b0d3]",
          header: "border-b-[1px] border-[#292f46]",
          footer: "border-t-[1px] border-[#292f46]",
          closeButton: "hover:bg-white/5 active:bg-white/10",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Universal Account Details
          </ModalHeader>
          <ModalBody>
            <ChainNotSupport />
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  if (notConnected) {
    return (
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        size="md"
        classNames={{
          body: "py-6",
          backdrop: "bg-[#292f46]/50 backdrop-opacity-40",
          base: "border-[#292f46] bg-[#19172c] dark:bg-[#19172c] text-[#a8b0d3]",
          header: "border-b-[1px] border-[#292f46]",
          footer: "border-t-[1px] border-[#292f46]",
          closeButton: "hover:bg-white/5 active:bg-white/10",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Universal Account Details
          </ModalHeader>
          <ModalBody>
            <NotConnected />
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        size="md"
        classNames={{
          body: "py-6",
          backdrop: "bg-[#292f46]/50 backdrop-opacity-40",
          base: "border-[#292f46] bg-[#19172c] dark:bg-[#19172c] text-[#a8b0d3]",
          header: "border-b-[1px] border-[#292f46]",
          footer: "border-t-[1px] border-[#292f46]",
          closeButton: "hover:bg-white/5 active:bg-white/10",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Universal Account Details
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              {/* Chain Switcher Button */}
              {onOpenChainModal && (
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-semibold">Current Chain</span>
                  <NextuiButton
                    onClick={onOpenChainModal}
                    variant="bordered"
                    className="justify-start"
                    startContent={
                      wallet.currentChain?.iconUrl && (
                        <Image
                          alt={wallet.currentChain?.name ?? 'Chain icon'}
                          src={wallet.currentChain.iconUrl}
                          width={20}
                          height={20}
                          className="rounded-full"
                        />
                      )
                    }
                  >
                    {wallet.currentChain?.name || 'Unknown Chain'}
                  </NextuiButton>
                </div>
              )}

              {/* Account Addresses */}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold">Account Addresses</span>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Wallet:</span>
                    <OwnerAddressDisplay />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Universal (EVM):</span>
                    <EvmAddressDisplay />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Universal (SOL):</span>
                    <SolAddressDisplay />
                  </div>
                </div>
              </div>

              {/* Account Balance */}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold">Account Balance</span>
                <div className="text-lg font-bold text-green-400">
                  {DynamicFormatAmount({
                    amount: wallet.universalAccount?.accountUsdValue ?? 0,
                    decimals: 2,
                    endWith: ' USD',
                  })}
                </div>
              </div>

              {/* Deposit and Withdraw Buttons */}
              <div className="flex gap-3">
                <NextuiButton 
                  className="flex-1" 
                  color="primary"
                  onPress={() => setDepositOpen(true)}
                >
                  Deposit
                </NextuiButton>
                <NextuiButton
                  className="flex-1"
                  variant="bordered"
                  onPress={() => setWithdrawOpen(true)}
                >
                  Withdraw
                </NextuiButton>
              </div>

              {/* Logout Button */}
              <div className="pt-2 border-t border-gray-600">
                <NextuiButton
                  className="w-full"
                  color="danger"
                  variant="bordered"
                  onPress={() => {
                    onClose(); // Close the modal first
                    if (onDisconnect) {
                      onDisconnect(); // Use RainbowKit disconnect
                    } else {
                      // Fallback to page reload
                      if (typeof window !== 'undefined') {
                        window.location.reload();
                      }
                    }
                  }}
                >
                  Disconnect Wallet
                </NextuiButton>
              </div>

              {/* Powered by Particle */}
              <div className="flex items-center gap-2 justify-center pt-2 border-t border-gray-600">
                <Image
                  src={particleIcon.default}
                  alt="particle"
                  width={24}
                  height={24}
                />
                <div className="text-xs text-gray-400">
                  Powered by Particle
                </div>
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Deposit Modal */}
      <DepositModal
        isOpen={depositOpen}
        onClose={() => setDepositOpen(false)}
      />

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
      />
    </>
  );
});