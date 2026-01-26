import { BridgeWidget, createChainConfig, mainnet, base, arbitrum, optimism, polygon, avalanche } from '@hongming-wang/usdc-bridge-widget';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { CHAIN_IDS, BRIDGE_WIDGET_THEME } from '@/config/constants';

// Define chains that match your wagmi config
// This ensures balance queries work correctly
const BRIDGE_CHAINS = [
  createChainConfig(mainnet),
  createChainConfig(base),
  createChainConfig(arbitrum),
  createChainConfig(optimism),
  createChainConfig(polygon),
  createChainConfig(avalanche),
  // BSC doesn't have CCTP support, so we exclude it from bridge
];

export default function BridgePage() {
  const { openConnectModal } = useConnectModal();
  const { isConnected, status } = useAccount();

  // Don't allow connect modal while wagmi is reconnecting
  const isReconnecting = status === 'reconnecting' || status === 'connecting';

  const handleBridgeSuccess = ({
    txHash,
    amount,
  }: {
    txHash: string;
    amount: string;
  }) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Bridged ${amount} USDC: ${txHash}`);
    }
  };

  const handleConnectWallet = () => {
    // Don't open modal if already connected or reconnecting
    if (isConnected || isReconnecting) {
      return;
    }
    if (openConnectModal) {
      openConnectModal();
    }
  };

  return (
    <div className="max-w-[500px] mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">USDC Bridge</h1>
        <p className="text-gray-400 text-sm">
          <span className="text-[#22c55e]">0% bridge fees</span> — only pay gas
        </p>
      </div>

      <div className="bg-[#1A0F06] rounded-2xl border border-[#2a2318] p-6">
        <div className="flex justify-center">
          <BridgeWidget
            chains={BRIDGE_CHAINS}
            defaultSourceChainId={CHAIN_IDS.ETHEREUM}
            defaultDestinationChainId={CHAIN_IDS.BASE}
            onBridgeSuccess={handleBridgeSuccess}
            onConnectWallet={handleConnectWallet}
            theme={BRIDGE_WIDGET_THEME}
          />
        </div>
      </div>
    </div>
  );
}
