import { cn } from '@/lib/tailwindcss';
import { ButtonProps, Button as NextButton } from '@nextui-org/react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount, useConnect, useConnectors } from 'wagmi';

export const Button = ({
  children,
  className,
  isLoading,
  styleMode,
  ...props
}: {
  children: React.ReactNode;
  styleMode?: 'plain' | 'primary';
} & ButtonProps) => {
  const { openConnectModal, connectModalOpen } = useConnectModal();
  const { isConnected } = useAccount();
  const { connect } = useConnect();
  const connectors = useConnectors();
  const mockConnector = connectors.find((connector) => connector.id === 'mock');
  styleMode = styleMode || 'primary';
  // FIXME: hover bg color
  const baseClassNames = cn(
    'flex h-[45px] font-bold text-white justify-center items-center gap-2.5 self-stretch bg-[#F59E0B] px-6 py-3 rounded-2xl hover:bg-[#DC8A09] active:opacity-80 transition-colors border border-[#F59E0B]',
    styleMode === 'plain'
      ? 'bg-transparent border-[#333333] hover:bg-[#333333] text-gray-300'
      : '',
    className
  );
  return isConnected ? (
    <NextButton isLoading={isLoading} className={baseClassNames} {...props}>
      {children}
    </NextButton>
  ) : (
    <NextButton
      className={baseClassNames}
      isLoading={!!connectModalOpen}
      {...props}
      onClick={() => {
        if (process.env.NEXT_PUBLIC_MOCK === 'true') {
          return connect({
            connector: mockConnector!,
          });
        } else {
          openConnectModal?.();
        }
      }}
    >
      Connect Wallet
    </NextButton>
  );
};
