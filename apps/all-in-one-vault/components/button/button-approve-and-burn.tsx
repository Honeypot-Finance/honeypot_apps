import { useState, useMemo } from 'react';
import { Address } from 'viem';
import {
  useAccount,
  useWriteContract,
} from 'wagmi';
import { useApprove } from '@/lib/algebra/hooks/common/useApprove';
import {
  BURN_TO_VAULT,
} from '@/config/algebra/addresses';
import { CurrencyAmount, Token } from '@cryptoalgebra/sdk';
import { ApprovalState } from '@/types/algebra/types/approve-state';
import { AllInOneVaultABI } from '@/lib/abis';
import { waitForTransactionReceipt } from '@wagmi/core';
import { config } from '@/config/wagmi';
import { MINIMUM_DEPOSIT_AMOUNT } from '../../utils/helper-function';

interface ApproveAndBurnButtonProps {
  tokenAddress: Address;
  tokenDecimals: number;
  tokenSymbol: string;
  userAmount: bigint | undefined;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  insufficientBalance?: boolean;
  belowMinimum?: boolean;
}

export function ApproveAndBurnButton({
  tokenAddress,
  tokenDecimals,
  tokenSymbol,
  userAmount,
  onSuccess,
  onError,
  insufficientBalance = false,
  belowMinimum = false,
}: ApproveAndBurnButtonProps) {
  const { address: userAddress } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);
  const currencyAmount = useMemo(() => {
    if (!userAmount || !tokenAddress) return undefined;
    const token = new Token(80094, tokenAddress, tokenDecimals, tokenSymbol);
    return CurrencyAmount.fromRawAmount(token, userAmount.toString());
  }, [userAmount, tokenAddress, tokenDecimals, tokenSymbol]);
  const { approvalState, approvalCallback } = useApprove(
    currencyAmount,
    BURN_TO_VAULT as Address,
  );
  const { writeContractAsync: executeGetReceipt } = useWriteContract();
  const handleApprove = async () => {
    try {
      setIsProcessing(true);
      await approvalCallback?.();
    } catch (error) {
      console.error('Approval failed:', error);
      onError?.('Approval failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBurnToVault = async () => {
    if (!userAmount) {
      onError?.('Invalid amount');
      return;
    }

    try {
      setIsProcessing(true);
      const hash = await executeGetReceipt({
        address: `0x9c52cD80455a9ee50610aC90e846e46E04014f6d`,
        abi: AllInOneVaultABI,
        functionName: 'getReceipt',
        args: [tokenAddress, userAmount],
      });
      const receipt = await waitForTransactionReceipt(config, { hash });
      console.log(receipt);
      onSuccess?.();
    } catch (error) {
      console.error('Burn to vault failed:', error);
      onError?.('Burn to vault failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const getButtonConfig = () => {
    if (!userAddress) {
      return { text: 'Connect Wallet', disabled: true, onClick: () => {} };
    }

    if (!userAmount || userAmount === BigInt(0)) {
      return { text: 'Enter Amount', disabled: true, onClick: () => {} };
    }

    if (belowMinimum) {
      return {
        text: `Min. ${MINIMUM_DEPOSIT_AMOUNT.toLocaleString()} Tokens`,
        disabled: true,
        onClick: () => {},
      };
    }

    if (insufficientBalance) {
      return {
        text: 'Insufficient Balance',
        disabled: true,
        onClick: () => {},
      };
    }

    // if (!hasSufficientBalance) {
    //   return {
    //     text: `Insufficient ${tokenSymbol}`,
    //     disabled: true,
    //     onClick: () => {},
    //   };
    // }

    if (approvalState === ApprovalState.NOT_APPROVED) {
      return {
        text: isProcessing ? 'Approving...' : 'Approve',
        disabled: isProcessing,
        onClick: handleApprove,
      };
    }

    if (approvalState === ApprovalState.PENDING) {
      return {
        text: 'Approval Pending...',
        disabled: true,
        onClick: () => {},
      };
    }

    if (approvalState === ApprovalState.APPROVED) {
      return {
        text: isProcessing ? 'Processing...' : 'Burn2Vault',
        disabled: isProcessing,
        onClick: handleBurnToVault,
      };
    }

    return { text: 'Unknown', disabled: true, onClick: () => {} };
  };

  const buttonConfig = getButtonConfig();

  return (
    <button
      onClick={buttonConfig.onClick}
      disabled={buttonConfig.disabled}
      className={`
      px-6 py-3 rounded-lg font-medium transition-all w-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] duration-300
      ${
        buttonConfig.disabled
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-600'
      }
      `}
    >
      {buttonConfig.text}
    </button>
  );
}
