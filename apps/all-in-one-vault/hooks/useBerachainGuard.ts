import { useEffect, useState } from 'react';
import { useChainId } from 'wagmi';
import { berachain } from 'viem/chains';

export function useBerachainGuard() {
  const chainId = useChainId();
  const [showDialog, setShowDialog] = useState(false);
  const [previousChainId, setPreviousChainId] = useState<number | null>(null);

  useEffect(() => {
    // Initialize previous chain ID on first load
    if (previousChainId === null) {
      setPreviousChainId(chainId);
      return;
    }

    // Check if user is switching away from Berachain
    if (previousChainId === berachain.id && chainId !== berachain.id) {
      setShowDialog(true);
    }

    setPreviousChainId(chainId);
  }, [chainId, previousChainId]);

  const handleDialogClose = () => {
    setShowDialog(false);
  };

  const handleConfirm = () => {
    setShowDialog(false);
    // Allow the chain change to proceed
  };

  return {
    isOnBerachain: chainId === berachain.id,
    showNetworkChangeDialog: showDialog,
    onDialogClose: handleDialogClose,
    onConfirmNetworkChange: handleConfirm,
  };
}
