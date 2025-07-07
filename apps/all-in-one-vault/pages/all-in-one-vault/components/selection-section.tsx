import React, { useState, useMemo, useEffect } from 'react';
import InputSection from '@/components/select/select';
import SummaryCard from '@/components/summary/summary';
import { ApproveAndBurnButton } from '@/components/button/button-approve-and-burn';
import {
  ALL_IN_ONE_VAULT,
  ALL_IN_ONE_VAULT_PROXY,
} from '@/config/algebra/addresses';
import {
  useQuery as useApolloQuery,
  ApolloClient,
  InMemoryCache,
} from '@apollo/client';
import {
  useAccount,
  useReadContract,
  useSimulateContract,
  useWriteContract,
} from 'wagmi';
import Insufficient from '@/components/insufficient/insufficient';
import { Address, erc20Abi, parseUnits } from 'viem';
import { MaxUint256 } from 'ethers';
import { AllInOneVaultABI } from '@/lib/abis';

interface SelectionSectionProps {
  onRefetchReceipts?: () => void;
}

export default function SelectionSection({ onRefetchReceipts }: SelectionSectionProps) {
  const { address } = useAccount();
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [tokenName, setTokenName] = useState<string>('');
  const [decimals, setDecimals] = useState<number>(18);
  const [weightPerCurrentToken, setWeightPerCurrentToken] =
    useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [insufficientBalance, setInsufficientBalance] =
    useState<boolean>(false);
  const [summaryData, setSummaryData] = useState({
    weightPerToken: '-',
    balance: '-',
    receiptWeight: '0',
    estimatedRewards: '-',
  });
  const { writeContractAsync: executeGetReceipt } = useWriteContract();

  const tokenSupportClient = useMemo(
    () =>
      new ApolloClient({
        uri: 'https://api.ghostlogs.xyz/gg/pub/96ff5ab9-9c87-47cb-ab46-73a276d93c8b',
        cache: new InMemoryCache(),
        defaultOptions: {
          query: {
            errorPolicy: 'all',
          },
        },
      }),
    []
  );

  const { data: tokenBalance, refetch: refetchBalance } = useReadContract({
    address: selectedToken as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!selectedToken && !!address,
    },
  });

  const onTokenChange = (token: string) => {
    setSelectedToken(token);
    setInsufficientBalance(false);
  };

  const onAmountChange = (newAmount: string) => {
    setAmount(newAmount);
    setInsufficientBalance(false);
  };
  
  // Update summary data when token balance changes (e.g., after burn)
  useEffect(() => {
    if (selectedToken && weightPerCurrentToken && tokenBalance) {
      const weightValue = parseFloat(weightPerCurrentToken);
      if (!isNaN(weightValue)) {
        const balance = Number(tokenBalance) / 1e18;
        setSummaryData(prev => ({
          ...prev,
          balance: balance.toString(),
        }));
      }
    }
  }, [tokenBalance, selectedToken, weightPerCurrentToken]);
  
  const parseAmount = parseUnits(amount || '0', decimals || 18).toString();

  const handleBurnSuccess = () => {
    console.log('🔥 Burn successful!');
    // Refetch receipts if the function is available
    if (onRefetchReceipts) {
      try {
        console.log('🔄 Calling refetch receipts...');
        onRefetchReceipts();
      } catch (error) {
        console.error('❌ Error calling refetch receipts:', error);
      }
    } else {
      console.warn('⚠️ onRefetchReceipts function not available');
    }
    // Refetch the token balance to update the summary card
    if (refetchBalance) {
      console.log('💰 Refetching token balance...');
      refetchBalance();
    }
  };

  return (
    <>
      <InputSection
        selectedToken={selectedToken}
        setSummaryData={setSummaryData}
        setDecimals={setDecimals}
        setWeightPerCurrentToken={setWeightPerCurrentToken}
        setInsufficientBalance={setInsufficientBalance}
        setTokenName={setTokenName}
        amount={amount}
        onTokenChange={onTokenChange}
        onAmountChange={onAmountChange}
        tokenSupportClient={tokenSupportClient}
        tokenBalance={tokenBalance}
        userAddress={address}
        className="w-full"
      />

      {insufficientBalance && (
        <Insufficient
          balance={summaryData.balance}
          selectedToken={selectedToken}
          tokenName={tokenName}
        />
      )}

      <SummaryCard
        className="w-full mb-6"
        data={summaryData}
        currentToken={selectedToken}
        weightPerCurrentToken={weightPerCurrentToken}
      />

      <ApproveAndBurnButton
        tokenAddress={selectedToken as `0x${string}`}
        tokenDecimals={18}
        tokenSymbol={tokenName}
        userAmount={BigInt(parseAmount)}
        onSuccess={handleBurnSuccess}
        onError={(error) => console.error(error)}
      />
    </>
  );
}
