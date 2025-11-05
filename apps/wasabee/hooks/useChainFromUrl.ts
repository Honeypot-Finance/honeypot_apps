import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { useSwitchChain, useAccount } from 'wagmi';
import { wallet } from '@honeypot/shared/lib/wallet';

/**
 * Hook that automatically switches the wallet chain based on the 'chainid' URL parameter
 * Usage: Add ?chainid=34 to the URL to switch to chain 34
 *
 * This hook returns the target chain ID from the URL so it can be used during initialization
 */
export function useChainFromUrl() {
  const router = useRouter();
  const { switchChain } = useSwitchChain();
  const { chain, isConnected } = useAccount();
  const [targetChainId, setTargetChainId] = useState<number | null>(null);
  const lastProcessedChainRef = useRef<number | null>(null);

  // First: Read the chain ID from URL and set it on the wallet immediately
  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const { chainid } = router.query;

    if (chainid && typeof chainid === 'string') {
      const parsedChainId = parseInt(chainid, 10);

      if (!isNaN(parsedChainId) && parsedChainId > 0) {
        // Only update if it's different from what we last processed
        if (parsedChainId !== lastProcessedChainRef.current) {
          console.log(`[useChainFromUrl] Setting target chain from URL: ${parsedChainId}`);
          setTargetChainId(parsedChainId);

          // Set it on the wallet object immediately
          wallet.currentChainId = parsedChainId;
          wallet.chainIdSetFromUrl = true;

          // Trigger wallet reinitialization with the new chain
          wallet.initWallet(wallet.walletClient);

          // Reset the last processed chain so we can switch again
          lastProcessedChainRef.current = null;
        }
      } else {
        console.warn(`[useChainFromUrl] Invalid chainid parameter: ${chainid}`);
      }
    } else {
      // No chainid in URL, reset target and clear the flag
      setTargetChainId(null);
      lastProcessedChainRef.current = null;
      wallet.chainIdSetFromUrl = false;
    }
  }, [router.isReady, router.query.chainid]);

  // Second: After wallet is connected, try to switch the chain if needed
  useEffect(() => {
    if (!targetChainId) {
      return;
    }

    // Don't process the same chain twice
    if (lastProcessedChainRef.current === targetChainId) {
      return;
    }

    // Wait for connection and wallet initialization
    if (!isConnected || !wallet.isInit) {
      return;
    }

    // If already on the target chain, we're done
    if (chain?.id === targetChainId) {
      console.log(`[useChainFromUrl] Already on target chain ${targetChainId}`);
      lastProcessedChainRef.current = targetChainId;
      return;
    }

    // Try to switch the chain
    if (switchChain) {
      console.log(`[useChainFromUrl] Attempting to switch to chain ${targetChainId}`);
      try {
        switchChain({ chainId: targetChainId });
        lastProcessedChainRef.current = targetChainId;
      } catch (error) {
        console.error(`[useChainFromUrl] Error switching chain:`, error);
        lastProcessedChainRef.current = targetChainId;
      }
    }
  }, [targetChainId, isConnected, wallet.isInit, chain?.id, switchChain]);

  return targetChainId;
}
