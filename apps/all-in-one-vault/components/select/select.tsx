import { Input } from '../input';
import { WarppedNextSelect } from '../wrappedNextUI/Select/Select';
import { SelectItem, Slider, Button } from '@nextui-org/react';
import React, { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { useQuery as useApolloQuery, ApolloClient } from '@apollo/client';
import { TOKEN_SUPPORT_QUERY } from '@/lib/algebra/graphql/queries/token-support';
import useGetSupportTokenInfo from '@/hooks/useGetSupportTokenInfo';
import { calculateSummaryData } from '../../utils/helper-function';
import { useAccount, useReadContract } from 'wagmi';
import { erc20Abi } from 'viem';
import { Token, TokenLogo } from '@honeypot/shared';
import { wallet } from '@honeypot/shared/lib/wallet';
import { observer } from 'mobx-react-lite';
import { cn } from '@nextui-org/react';
import Image from 'next/image';

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

export function InputSectionComponent({
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
  const [sliderValue, setSliderValue] = useState<number>(0);

  // Helper function to get Token instance from address
  const getTokenInstance = (address: string) => {
    if (!address) return null;
    return Token.getToken({
      address,
      chainId: wallet.currentChainId.toString(),
    });
  };

  // Custom TokenIcon component without Link behavior
  const TokenIcon = ({ token, size = 24 }: { token: Token; size?: number }) => {
    useEffect(() => {
      token.init(true, {
        loadLogoURI: true,
        loadName: true,
        loadSymbol: true,
      });
    }, [token]);

    return (
      <Image
        className={cn(
          'border border-[color:var(--card-stroke,#F7931A)] rounded-[50%] aspect-square bg-white'
        )}
        src={
          !!token.logoURI
            ? token.logoURI
            : '/images/icons/tokens/unknown-token-icon.png'
        }
        alt={`${token.symbol} token`}
        width={size}
        height={size}
      />
    );
  };

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

  // Initialize token logos
  useEffect(() => {
    if (tokenSupportList.length > 0) {
      tokenSupportList.forEach((token: { id: string; weight: string }) => {
        const tokenInstance = getTokenInstance(token.id);
        if (tokenInstance) {
          tokenInstance.init(false, {
            loadLogoURI: true,
            loadSymbol: true,
            loadName: true,
            loadBalance: false,
            loadDecimals: false,
          });
        }
      });
    }
  }, [tokenSupportList]);

  const tokenAddresses = tokenSupportList.map(
    (token: { id: string }) => token.id
  );
  const {
    data: tokenInfoData,
    isLoading: tokenInfoLoading,
    error: tokenInfoError,
  } = useGetSupportTokenInfo({ tokens: isDisabled ? [] : tokenAddresses });
  const { address } = useAccount();

  const { data: newTokenBalance } = useReadContract({
    address: selectedToken as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!selectedToken && !!address,
    },
  });

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

    if (!selectedToken) {
      setSummaryData({
        weightPerToken: '-',
        balance: '-',
        receiptWeight: '0',
      });
      return;
    }

    // Find the selected token data
    const selectedTokenData = tokenSupportList.find(
      (token: { id: string; weight: string }) => token.id === selectedToken
    );

    if (selectedTokenData) {
      const weightValue = parseFloat(selectedTokenData.weight) / 1e4;
      const newSummaryData = calculateSummaryData(
        selectedToken,
        amount || '',
        weightValue,
        totalWeight,
        newTokenBalance || tokenBalance
      );
      if (newSummaryData) {
        setSummaryData(newSummaryData);

        if (setInsufficientBalance && amount && amount.trim() !== '') {
          const amountValue = parseFloat(amount);
          const balanceValue = parseFloat(newSummaryData.balance);
          setInsufficientBalance(
            !isNaN(amountValue) && amountValue > 0 && amountValue > balanceValue
          );
        }
      }
    }
  }, [
    amount,
    selectedToken,
    tokenSupportList,
    totalWeight,
    newTokenBalance,
    tokenBalance,
    isDisabled,
    setSummaryData,
    setInsufficientBalance,
  ]);

  // Calculate percentage when amount changes
  useEffect(() => {
    if (selectedToken && newTokenBalance && amount) {
      const amountNum = parseFloat(amount);
      const balanceNum = Number(newTokenBalance) / 1e18;
      if (balanceNum > 0) {
        const percentage = (amountNum / balanceNum) * 100;
        setSliderValue(Math.min(100, Math.max(0, percentage)));
      }
    } else {
      setSliderValue(0);
    }
  }, [amount, selectedToken, newTokenBalance]);

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
      const weightValue = parseFloat(selectedTokenData.weight) / 1e4;
      console.log(weightValue, 'weightValue');
      if (setWeightPerCurrentToken) {
        setWeightPerCurrentToken(weightValue.toString());
      }

      // Always calculate summary data when token changes
      if (setSummaryData) {
        const newSummaryData = calculateSummaryData(
          selectedKey,
          amount || '',
          weightValue,
          totalWeight,
          newTokenBalance || tokenBalance
        );
        if (newSummaryData) {
          setSummaryData(newSummaryData);
        }
      }
    }
  };

  const handleAmountChange = (value: string) => {
    if (isDisabled) return;
    onAmountChange?.(value);
  };

  const handleSliderChange = (value: number | number[]) => {
    if (isDisabled || !selectedToken || !newTokenBalance) return;

    const sliderVal = Array.isArray(value) ? value[0] : value;
    const balanceNum = Number(newTokenBalance) / 1e18;
    const newAmount = (balanceNum * sliderVal) / 100;

    setSliderValue(sliderVal);
    onAmountChange?.(newAmount.toString());
  };

  const handlePercentageButtonClick = (percentage: number) => {
    if (isDisabled || !selectedToken || !newTokenBalance) return;

    const balanceNum = Number(newTokenBalance) / 1e18;
    const newAmount = (balanceNum * percentage) / 100;

    setSliderValue(percentage);
    onAmountChange?.(newAmount.toString());
  };

  return (
    <div
      className={`mb-6 ${className} ${
        isDisabled ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      {/* Grid container with defined rows */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 grid-rows-[auto_auto_auto]">
        {/* Row 1: Labels and Info */}
        <div className="flex items-center justify-start">
          <label className="block text-sm font-medium text-gray-800">
            Choose a token
          </label>
        </div>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-800">
            Enter amount
          </label>
          {/* Percentage and balance display */}
          {selectedToken && newTokenBalance && (
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-500">
                Balance: {(Number(newTokenBalance) / 1e18).toFixed(4)}
              </span>
            </div>
          )}
        </div>
        {/* Row 2: Input Fields - This row ensures perfect alignment */}
        <div className="w-full relative">
          <WarppedNextSelect
            placeholder={
              isDisabled ? 'Connect wallet to select token' : 'Select a token'
            }
            selectedKeys={
              internalSelectedToken && !isDisabled
                ? [internalSelectedToken]
                : []
            }
            onSelectionChange={handleTokenChange}
            isDisabled={isDisabled}
            className="w-full border-1 rounded-[12px] solid border-black"
            renderValue={(items) => {
              if (items.length === 0 || isDisabled) {
                return <span className="text-gray-500">Select a token</span>;
              }
              const selectedTokenAddress = items[0]?.key;
              const tokenInstance = getTokenInstance(
                selectedTokenAddress as string
              );
              const tokenInfo = tokenInfoData?.[selectedTokenAddress as string];

              return (
                <div className="flex items-center gap-2">
                  {tokenInstance && (
                    <TokenIcon token={tokenInstance} size={24} />
                  )}
                  <span>
                    {tokenInfo
                      ? `${tokenInfo.symbol} (${tokenInfo.name})`
                      : selectedTokenAddress}
                  </span>
                </div>
              );
            }}
            classNames={{
              trigger: `w-full h-[48px] bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 ${
                isDisabled
                  ? 'cursor-not-allowed bg-gray-100'
                  : 'hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
              } ${selectedToken && !isDisabled ? 'pr-12' : ''}`,
              popoverContent: 'bg-white border border-gray-300 shadow-lg',
              listboxWrapper: 'p-0',
              listbox: 'p-0',
            }}
          >
            {!isDisabled &&
              tokenSupportList.map((token: { id: string; weight: string }) => {
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
                    <div className="flex items-center gap-2">
                      <TokenIcon
                        token={getTokenInstance(token.id)!}
                        size={24}
                      />
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

          {/* Berascan link button - positioned absolutely inside dropdown */}
          {selectedToken && !isDisabled && (
            <Button
              isIconOnly
              variant="light"
              className="absolute right-8 top-1/2 transform -translate-y-1/2 h-8 w-8 min-w-8 bg-transparent hover:bg-gray-100 rounded-md z-10"
              onPress={() =>
                window.open(
                  `https://berascan.com/address/${selectedToken}`,
                  '_blank'
                )
              }
              title="View on Berascan"
            >
              <ExternalLink
                size={16}
                className="text-gray-600 hover:text-gray-800"
              />
            </Button>
          )}
        </div>
        <div className="w-full">
          <Input
            placeholder={
              isDisabled ? 'Connect wallet to enter amount' : 'Enter amount'
            }
            value={isDisabled ? '' : amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            isDisabled={isDisabled}
            className={`w-full h-[48px] bg-white border-1 rounded-[12px] solid border-black transition-shadow text-gray-900 font-medium ${
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
        {/* Row 3: Slider section - Only appears in the right column */}
        <div></div> {/* Empty cell for left column */}
        <div className="mt-2">
          {/* Slider section */}
          {selectedToken && newTokenBalance && (
            <div className="relative">
              {/* Slider */}
              <Slider
                className="w-full"
                size="sm"
                value={sliderValue}
                onChange={handleSliderChange}
                minValue={0}
                maxValue={100}
                step={0.1}
                isDisabled={isDisabled}
                classNames={{
                  track: 'border-s-gray-300',
                  filler: 'bg-black',
                  thumb:
                    'w-4 h-4 bg-black border-2 border-white shadow-[0_0_0_2px_rgba(0,0,0,0.3)]',
                }}
                aria-label="Balance percentage"
              />

              {/* Percentage labels on slider */}
              <div className="absolute top-6 left-0 right-0 flex justify-between px-1">
                {[25, 50, 75, 100].map((percentage) => (
                  <button
                    key={percentage}
                    onClick={() => handlePercentageButtonClick(percentage)}
                    disabled={isDisabled}
                    className={`text-xs font-medium transition-colors duration-200 hover:text-black cursor-pointer ${
                      Math.abs(sliderValue - percentage) < 0.1
                        ? 'text-black font-semibold'
                        : 'text-gray-500'
                    } ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    {percentage}%
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const InputSection = React.memo(observer(InputSectionComponent));

export default InputSection;
