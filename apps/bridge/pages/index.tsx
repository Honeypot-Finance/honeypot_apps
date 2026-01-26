import { BridgeWidget, DEFAULT_CHAIN_CONFIGS } from '@hongming-wang/usdc-bridge-widget';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { CHAIN_IDS, BRIDGE_WIDGET_THEME, THEME_COLORS } from '@/config/constants';

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
        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: THEME_COLORS.text }}
        >
          USDC Bridge
        </h1>
        <p className="text-sm" style={{ color: THEME_COLORS.textMuted }}>
          <span style={{ color: THEME_COLORS.success }}>0% bridge fees</span> — only pay gas
        </p>
      </div>

      <div
        className="rounded-2xl border p-6"
        style={{
          backgroundColor: THEME_COLORS.backgroundCard,
          borderColor: THEME_COLORS.borderCard,
        }}
      >
        <div className="flex justify-center">
          <BridgeWidget
            chains={DEFAULT_CHAIN_CONFIGS}
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
