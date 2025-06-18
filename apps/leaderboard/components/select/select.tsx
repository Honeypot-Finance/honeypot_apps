import { Input } from '../input';
import { WarppedNextSelect } from '../wrappedNextUI/Select/Select';
import { SelectItem } from '@nextui-org/react';
import { useState, useEffect } from 'react';
import {
  useQuery as useApolloQuery,
  ApolloClient,
} from '@apollo/client';
import { TOKEN_SUPPORT_QUERY } from '@/lib/algebra/graphql/queries/token-support';
import useGetSupportTokenInfo from '@/hooks/useGetSupportTokenInfo';
import { calculateSummaryData } from '@/pages/all-in-one-vault/helper-function';

interface InputSectionProps {
  onTokenChange?: (value: string) => void;
  onAmountChange?: (value: string) => void;
  setDecimals?: (decimals: number) => void;
  selectedToken?: string;
  setSummaryData?: (data: any) => void;
  setWeightPerCurrentToken?: (weight: string) => void;
  setInsufficientBalance?: (insufficient: boolean) => void;
  setTokenName?: (name: string) => void;
  amount?: string;
  className?: string;
  tokenSupportClient?: ApolloClient<any>;
  totalWeight?: bigint | null;
  tokenBalance?: bigint | null;
  userAddress?: string;
}

export default function InputSection({
  onTokenChange,
  onAmountChange,
  selectedToken,
  setDecimals,
  setSummaryData,
  setWeightPerCurrentToken,
  setInsufficientBalance,
  setTokenName,
  amount,
  className = '',
  tokenSupportClient,
  totalWeight,
  tokenBalance,
  userAddress,
}: InputSectionProps) {
  const [internalSelectedToken, setInternalSelectedToken] = useState<string>(
    selectedToken || ''
  );

  const isDisabled = !userAddress;

  const {
    data: tokenSupportData,
    loading: tokenSupportLoading,
    error: tokenSupportError,
  } = useApolloQuery(TOKEN_SUPPORT_QUERY, {
    client: tokenSupportClient,
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
    skip: isDisabled,
  });
  const tokenSupportList = tokenSupportData?.supportReceipts?.items || [];

  const tokenAddresses = tokenSupportList.map(
    (token: { id: string }) => token.id
  );
  const {
    data: tokenInfoData,
    isLoading: tokenInfoLoading,
    error: tokenInfoError,
  } = useGetSupportTokenInfo({ tokens: isDisabled ? [] : tokenAddresses });

  useEffect(() => {
    if (!isDisabled) {
      setInternalSelectedToken(selectedToken || '');
    }
  }, [selectedToken, isDisabled]);

  useEffect(() => {
    if (isDisabled) return;
    setDecimals?.(tokenInfoData?.[internalSelectedToken]?.decimals || 18);
  }, [tokenInfoData, internalSelectedToken, setDecimals, isDisabled]);

  useEffect(() => {
    if (!setSummaryData || isDisabled) return;
    if (!amount || amount.trim() === '') {
      setSummaryData({
        weightPerToken:
          selectedToken && tokenSupportList.length > 0
            ? tokenSupportList.find(
                (token: { id: string; weight: string }) =>
                  token.id === selectedToken
              )?.weight || '-'
            : '-',
        balance: '-',
        receiptWeight: '-',
      });
      if (setInsufficientBalance) {
        setInsufficientBalance(false);
      }
      return;
    }

    if (amount && selectedToken) {
      const selectedTokenData = tokenSupportList.find(
        (token: { id: string; weight: string }) => token.id === selectedToken
      );
      if (selectedTokenData) {
        const weightValue = parseFloat(selectedTokenData.weight);
        const newSummaryData = calculateSummaryData(
          selectedToken,
          amount,
          weightValue,
          totalWeight,
          tokenBalance
        );
        if (newSummaryData) {
          setSummaryData(newSummaryData);

          if (setInsufficientBalance) {
            const amountValue = parseFloat(amount);
            const balanceValue = parseFloat(newSummaryData.balance);
            setInsufficientBalance(amountValue > balanceValue);
          }
        }
      }
    }
  }, [
    amount,
    selectedToken,
    tokenSupportList,
    totalWeight,
    tokenBalance,
    isDisabled,
  ]);

  const handleTokenChange = (keys: any) => {
    if (isDisabled) return;
    
    const selectedKey = Array.from(keys)[0] as string;
    setInternalSelectedToken(selectedKey);
    onTokenChange?.(selectedKey);

    const selectedTokenData = tokenSupportList.find(
      (token: { id: string; weight: string }) => token.id === selectedKey
    );

    const tokenInfo = tokenInfoData?.[selectedKey];
    if (setTokenName && tokenInfo) {
      setTokenName(tokenInfo.symbol);
    }

    if (selectedTokenData) {
      const weightValue = parseFloat(selectedTokenData.weight);
      if (setWeightPerCurrentToken) {
        setWeightPerCurrentToken(selectedTokenData.weight);
      }
      if (setSummaryData && amount && amount.trim() !== '') {
        const newSummaryData = calculateSummaryData(
          selectedKey,
          amount,
          weightValue,
          totalWeight,
          tokenBalance
        );
        if (newSummaryData) {
          setSummaryData(newSummaryData);
        }
      } else if (setSummaryData) {
        setSummaryData({
          weightPerToken: selectedTokenData.weight,
          balance: '-',
          receiptWeight: '-',
        });
      }
    }
  };

  const handleAmountChange = (value: string) => {
    if (isDisabled) return;
    onAmountChange?.(value);
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 ${className} ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-2">
          Choose a token
        </label>
        <WarppedNextSelect
          placeholder={isDisabled ? "Connect wallet to select token" : "Select a token"}
          selectedKeys={internalSelectedToken && !isDisabled ? [internalSelectedToken] : []}
          onSelectionChange={handleTokenChange}
          isDisabled={isDisabled}
          className="w-full border-1 rounded-[12px] solid border-black"
          classNames={{
            trigger: `h-[48px] bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 ${
              isDisabled 
                ? 'cursor-not-allowed bg-gray-100' 
                : 'hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
            }`,
            popoverContent: 'bg-white border border-gray-300 shadow-lg',
            listboxWrapper: 'p-0',
            listbox: 'p-0',
          }}
        >
          {!isDisabled && tokenSupportList.map((token: { id: string; weight: string }) => {
            const tokenInfo = tokenInfoData?.[token.id];
            return (
              <SelectItem
                key={token.id}
                value={token.id}
                className="hover:bg-black focus:bg-black data-[hover=true]:bg-black data-[focus=true]:bg-black group/item transition-colors duration-150"
                classNames={{
                  base: 'hover:bg-black focus:bg-black data-[hover=true]:bg-black data-[focus=true]:bg-black',
                  wrapper:
                    'group-hover/item:text-white group-focus/item:text-white',
                }}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900 group-hover/item:text-white group-focus/item:text-white transition-colors duration-150">
                    {tokenInfo
                      ? `${tokenInfo.symbol} (${tokenInfo.name})`
                      : token.id}
                  </span>
                </div>
              </SelectItem>
            );
          })}
        </WarppedNextSelect>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-2">
          Enter amount
        </label>
        <Input
          placeholder={isDisabled ? "Connect wallet to enter amount" : "Enter amount"}
          value={isDisabled ? '' : amount}
          onChange={(e) => handleAmountChange(e.target.value)}
          isDisabled={isDisabled}
          className={`h-[48px] bg-white border-1 rounded-[12px] solid border-black transition-shadow text-gray-900 font-medium ${
            isDisabled 
              ? 'cursor-not-allowed bg-gray-100 shadow-none' 
              : 'shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
          }`}
          type="number"
          min="0"
          step="0.001"
          isClearable={!isDisabled}
          onClear={() => !isDisabled && onAmountChange?.('')}
        />
      </div>
    </div>
  );
}