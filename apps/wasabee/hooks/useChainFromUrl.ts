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
  const hasAttemptedSwitchRef = useRef(false);
  const [targetChainId, setTargetChainId] = useState<number | null>(null);

  // First: Read the chain ID from URL and set it on the wallet immediately
  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const { chainid } = router.query;

    if (chainid && typeof chainid === 'string') {
      const parsedChainId = parseInt(chainid, 10);

      if (!isNaN(parsedChainId) && parsedChainId > 0) {
        console.log(`[useChainFromUrl] Setting target chain from URL: ${parsedChainId}`);
        setTargetChainId(parsedChainId);

        // Set it on the wallet object immediately so initWallet uses it
        wallet.currentChainId = parsedChainId;
      } else {
        console.warn(`[useChainFromUrl] Invalid chainid parameter: ${chainid}`);
      }
    }
  }, [router.isReady, router.query]);

  // Second: After wallet is connected, try to switch the chain if needed
  useEffect(() => {
    if (!targetChainId || hasAttemptedSwitchRef.current) {
      return;
    }

    // Wait for connection and wallet initialization
    if (!isConnected || !wallet.isInit) {
      return;
    }

    // If already on the target chain, we're done
    if (chain?.id === targetChainId) {
      console.log(`[useChainFromUrl] Already on target chain ${targetChainId}`);
      hasAttemptedSwitchRef.current = true;
      return;
    }

    // Try to switch the chain
    if (switchChain) {
      console.log(`[useChainFromUrl] Attempting to switch to chain ${targetChainId}`);
      try {
        switchChain({ chainId: targetChainId });
        hasAttemptedSwitchRef.current = true;
      } catch (error) {
        console.error(`[useChainFromUrl] Error switching chain:`, error);
        hasAttemptedSwitchRef.current = true;
      }
    }
  }, [targetChainId, isConnected, wallet.isInit, chain?.id, switchChain]);

  return targetChainId;
}
