import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@nextui-org/react';
import { observer } from 'mobx-react-lite';
import CrossChainTransactionHistory from './CrossChainTransactionHistory';
import { X } from 'lucide-react';

interface TransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = observer(({ isOpen, onClose }) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="4xl"
      scrollBehavior="inside"
      backdrop="blur"
      classNames={{
        base: "bg-[#1a1a1a] text-white",
        header: "border-b border-[#2a2a2a]",
        body: "bg-[#1a1a1a] p-0",
        footer: "border-t border-[#2a2a2a]",
        closeButton: "text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center justify-between">
          <span className="text-xl font-semibold">Transaction History</span>
        </ModalHeader>
        <ModalBody>
          <div className="p-6">
            <CrossChainTransactionHistory inModal={true} />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button 
            variant="flat" 
            onPress={onClose}
            className="bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white"
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
});

export default TransactionHistoryModal;