import { useState, useMemo, useEffect } from 'react';
import { Address } from 'viem';
import {
  useAccount,
  useWriteContract,
  useSimulateContract,
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

// Helper function to parse contract errors
function parseContractError(error: any): string {
  // Check for common error patterns
  if (error?.message) {
    const message = error.message.toLowerCase();

    // SafeERC20 errors
    if (message.includes('safeerc20failedoperation')) {
      return 'Token transfer failed. This usually means insufficient balance or approval.';
    }

    // ERC20 errors
    if (message.includes('erc20: transfer amount exceeds balance')) {
      return 'Transfer amount exceeds your token balance.';
    }
    if (message.includes('erc20: transfer amount exceeds allowance') || message.includes('insufficient allowance')) {
      return 'Insufficient token approval. Please approve again.';
    }

    // Token not supported
    if (message.includes('token not supported') || message.includes('unsupported token')) {
      return 'This token is not supported by the vault.';
    }

    // Minimum amount
    if (message.includes('minimum') || message.includes('too small')) {
      return `Minimum deposit is ${MINIMUM_DEPOSIT_AMOUNT.toLocaleString()} tokens.`;
    }

    // Revert reasons
    const revertMatch = message.match(/reverted with reason string ['"](.+)['"]/);
    if (revertMatch) {
      return `Contract error: ${revertMatch[1]}`;
    }

    // Contract call reverted
    if (message.includes('execution reverted')) {
      return 'Transaction will fail. Please check your balance and approval.';
    }

    return error.message;
  }

  return 'Unknown error. Transaction may fail.';
}

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
  const [simulationError, setSimulationError] = useState<string | null>(null);

  const currencyAmount = useMemo(() => {
    if (!userAmount || !tokenAddress) return undefined;
    const token = new Token(80094, tokenAddress, tokenDecimals, tokenSymbol);
    return CurrencyAmount.fromRawAmount(token, userAmount.toString());
  }, [userAmount, tokenAddress, tokenDecimals, tokenSymbol]);

  const { approvalState, approvalCallback } = useApprove(
    currencyAmount,
    BURN_TO_VAULT as Address,
  );

  // Simulate the contract call to catch errors before transaction
  const {
    data: simulateData,
    error: simulateError,
    isError: isSimulateError,
  } = useSimulateContract({
    address: BURN_TO_VAULT as Address,
    abi: AllInOneVaultABI,
    functionName: 'getReceipt',
    args: userAmount && tokenAddress ? [tokenAddress, userAmount] : undefined,
    query: {
      enabled:
        !!userAddress &&
        !!userAmount &&
        !!tokenAddress &&
        approvalState === ApprovalState.APPROVED &&
        !insufficientBalance &&
        !belowMinimum,
    },
  });

  const { writeContractAsync: executeGetReceipt } = useWriteContract();

  // Update simulation error state
  useEffect(() => {
    if (isSimulateError && simulateError) {
      const errorMessage = parseContractError(simulateError);
      setSimulationError(errorMessage);
      console.error('Contract simulation failed:', errorMessage);
      console.error('Full error:', simulateError);
    } else {
      setSimulationError(null);
    }
  }, [isSimulateError, simulateError]);
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
      // If simulation shows an error, disable the button
      if (simulationError) {
        return {
          text: 'Transaction Will Fail',
          disabled: true,
          onClick: () => {},
        };
      }

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
    <div className="w-full">
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

      {/* Display simulation error if present */}
      {simulationError && approvalState === ApprovalState.APPROVED && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-red-600 font-bold text-lg">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800 mb-1">
                Transaction Will Fail
              </p>
              <p className="text-xs text-red-700">{simulationError}</p>
              <details className="mt-2">
                <summary className="text-xs text-red-600 cursor-pointer hover:text-red-800">
                  Show technical details
                </summary>
                <pre className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded overflow-x-auto">
                  {JSON.stringify(simulateError, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
