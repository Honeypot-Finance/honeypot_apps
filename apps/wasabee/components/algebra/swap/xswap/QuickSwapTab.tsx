import { DynamicFormatAmount } from '@honeypot/shared';
import { Token } from '@honeypot/shared';
import { wallet } from '@honeypot/shared/lib/wallet';
import { xSwap, XChildSwap } from '@/services/xswap';
import { Button, Select, SelectItem, Checkbox } from '@nextui-org/react';
import { cn } from '@/lib/utils';
import BigNumber from 'bignumber.js';
import { observer } from 'mobx-react-lite';
import { useState, useEffect, useMemo } from 'react';
import { TokenLogo } from '@honeypot/shared';
import { useDerivedSwapInfoWithoutSwapState } from '@/lib/algebra/state/swapStore';
import { useApproveCallbackFromTrade } from '@/lib/algebra/hooks/common/useApprove';
import { useSwapCallback } from '@/lib/algebra/hooks/swap/useSwapCallback';
import { SwapField, SwapFieldType } from '@/types/algebra/types/swap-field';
import { zeroAddress } from 'viem';
import { Address } from 'viem';
import { ApprovalState } from '@/types/algebra/types/approve-state';

// Hidden swap component to calculate trade for a token
const QuickModeSwapCalculator = observer(({ 
  fromToken, 
  toToken, 
  isSelected 
}: { 
  fromToken: Token; 
  toToken: Token; 
  isSelected: boolean;
}) => {
  // In Quick mode use full balance 
  const typedValue = fromToken.balance.toString();

  const {
    toggledTrade: trade,
    allowedSlippage,
  } = useDerivedSwapInfoWithoutSwapState({
    inputCurrencyId: fromToken.isNative
      ? zeroAddress
      : (fromToken.address as Address),
    outputCurrencyId: toToken.isNative
      ? zeroAddress
      : (toToken.address as Address),
    independentField: SwapField.INPUT,
    typedValue: typedValue,
  });

  const { approvalState } = useApproveCallbackFromTrade(
    trade,
    allowedSlippage
  );

  const { bestCall } = useSwapCallback(trade, allowedSlippage, approvalState);

  // Register this swap with xSwap service
  useEffect(() => {
    if (!isSelected) return;

    const swap: XChildSwap = {
      fromToken,
      toToken,
      typedValue,
      setTypedValue: () => {}, // Not used in Quick mode
      onUserInput: () => {}, // Not used in Quick mode
      isSelected,
      setIsSelected: () => {},
      trade,
      bestCall,
      approvalState,
    };

    // Remove old swap for this token if exists and add new one
    // Create new array reference for reactivity
    xSwap.swaps = [
      ...xSwap.swaps.filter((s) => s.fromToken.address !== fromToken.address),
      swap
    ];

    return () => {
      // Cleanup on unmount
      xSwap.swaps = xSwap.swaps.filter(
        (s) => s.fromToken.address !== fromToken.address
      );
    };
  }, [fromToken, toToken,  trade, bestCall, approvalState, isSelected]);

  return null; // This component doesn't render anything
});

export const QuickSwapTab = observer(() => {
  const [quickModeSelectedTokens, setQuickModeSelectedTokens] = useState<Set<string>>(new Set());
  const [quickModeOutputToken, setQuickModeOutputToken] = useState<Token | null>(
    wallet.currentChain?.multiSwapTokens?.[0] || wallet.currentChain?.nativeToken || null
  );

  // Clean up swaps when output token changes
  useEffect(() => {
    // Clear all quick mode swaps when output token changes
    xSwap.swaps = xSwap.swaps.filter(swap => 
      !quickModeSelectedTokens.has(swap.fromToken.address)
    );
  }, [quickModeOutputToken?.address]);

  // Deselect any input token that matches the output token
  useEffect(() => {
    if (!quickModeOutputToken) return;
    
    const newSelected = new Set(quickModeSelectedTokens);
    if (newSelected.has(quickModeOutputToken.address)) {
      newSelected.delete(quickModeOutputToken.address);
      setQuickModeSelectedTokens(newSelected);
    }
  }, [quickModeOutputToken?.address]);

  // Get selected tokens array
  const selectedTokens = useMemo(() => {
    return xSwap.sortedTokens?.filter(token => 
      quickModeSelectedTokens.has(token.address)
    ) || [];
  }, [quickModeSelectedTokens]);

  // Calculate total input value
  const totalInputValue = useMemo(() => {
    return selectedTokens.reduce((acc, token) => {
      return acc.plus(
        new BigNumber(token.balance.toString())
          .times(token.derivedUSD.toString())
      );
    }, new BigNumber(0));
  }, [selectedTokens]);

  // Calculate total output value and amount from registered swaps
  const { totalOutputValue, totalOutputAmount } = useMemo(() => {
    const selectedSwaps = xSwap.swaps.filter(swap => 
      quickModeSelectedTokens.has(swap.fromToken.address)
    );

    const value = selectedSwaps.reduce((acc, swap) => {
      return acc.plus(
        new BigNumber(swap.trade?.outputAmount?.toFixed(18) ?? '0')
          .times(swap.toToken.derivedUSD.toString())
      );
    }, new BigNumber(0));

    const amount = selectedSwaps.reduce((acc, swap) => {
      return acc.plus(swap.trade?.outputAmount?.toFixed(18) ?? '0');
    }, new BigNumber(0));

    return { 
      totalOutputValue: value.toString(), 
      totalOutputAmount: amount.toString() 
    };
  }, [quickModeSelectedTokens, xSwap.swaps]);

  // Check if any swaps need approval
  const needsApproval = useMemo(() => {
    return xSwap.swaps
      .filter(swap => quickModeSelectedTokens.has(swap.fromToken.address))
      .some(swap => 
        swap.approvalState !== ApprovalState.APPROVED &&
        swap.approvalState !== ApprovalState.UNKNOWN
      );
  }, [quickModeSelectedTokens, xSwap.swaps]);

  const handleApproveAll = async () => {
    const selectedSwaps = xSwap.swaps.filter(swap => 
      quickModeSelectedTokens.has(swap.fromToken.address)
    );

    for (const swap of selectedSwaps) {
      await swap.fromToken.approveIfNoAllowance({
        amount: new BigNumber(swap.typedValue)
          .times(10 ** swap.fromToken.decimals)
          .toFixed(0),
        spender: wallet.currentChain.contracts.algebraSwapRouter,
      }).then(() => {
        swap.approvalState = ApprovalState.APPROVED;
      });
    }
  };

  const handleSwap = async () => {
    // Mark selected swaps as selected in xSwap service
    xSwap.swaps.forEach(swap => {
      if (quickModeSelectedTokens.has(swap.fromToken.address)) {
        swap.isSelected = true;
      } else {
        swap.isSelected = false;
      }
    });

    await xSwap.handleSwap();
    
    // Reset selection after swap
    setQuickModeSelectedTokens(new Set());
    xSwap.reset();
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Hidden swap calculators for selected tokens */}
      {selectedTokens.map(token => 
        quickModeOutputToken && (
          <QuickModeSwapCalculator
            key={token.address}
            fromToken={token}
            toToken={quickModeOutputToken}
            isSelected={true}
          />
        )
      )}

      {/* Header with filter and sort */}
      <div className="w-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="bordered"
            className="bg-transparent border-[#333333] text-white text-xs"
            onPress={() => {
              // Select all tokens
              const allAddresses = new Set(xSwap.sortedTokens?.map(t => t.address) || []);
              setQuickModeSelectedTokens(allAddresses);
            }}
          >
            Select All
          </Button>
          <Button
            size="sm"
            variant="bordered"
            className="bg-transparent border-[#333333] text-white text-xs"
            onPress={() => {
              // Clear selection
              setQuickModeSelectedTokens(new Set());
            }}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Main content area with grid and swap result */}
      <div className="w-full flex flex-col lg:flex-row items-center gap-6">
        {/* Left side - Token selection grid */}
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Select token to swap</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-2">
            {xSwap.sortedTokens?.map((token) => {
              const isSelected = quickModeSelectedTokens.has(token.address);
              const isSameAsOutput = quickModeOutputToken?.address === token.address;
              return (
                <div
                  key={token.address}
                  onClick={() => {
                    // Prevent selecting if it's the same as output token
                    if (isSameAsOutput) return;
                    
                    const newSelected = new Set(quickModeSelectedTokens);
                    if (isSelected) {
                      newSelected.delete(token.address);
                    } else {
                      newSelected.add(token.address);
                    }
                    setQuickModeSelectedTokens(newSelected);
                  }}
                  className={cn(
                    'p-4 rounded-2xl border-2 transition-all',
                    isSameAsOutput 
                      ? 'opacity-50 cursor-not-allowed bg-[#1A1A1A] border-[#333333]'
                      : 'cursor-pointer bg-[#1A1A1A] hover:bg-[#252525]',
                    isSelected && !isSameAsOutput
                      ? 'border-[#FFCD4D] shadow-[2px_2px_0px_0px_#FFCD4D]'
                      : 'border-[#333333]'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <TokenLogo token={token} size={40} />
                      <div>
                        <div className="text-white font-bold text-base">
                          {DynamicFormatAmount({
                            amount: token.balance.toString(),
                            decimals: 4,
                          })}{' '}
                          {token.symbol}
                        </div>
                        <div className="text-white/60 text-sm">
                          {DynamicFormatAmount({
                            amount: new BigNumber(token.balance.toString())
                              .times(token.derivedUSD.toString())
                              .toString(),
                            decimals: 2,
                            endWith: '$',
                          })}
                        </div>
                      </div>
                    </div>
                    <Checkbox
                      isSelected={isSelected}
                      className="pointer-events-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Arrow separator */}
        <div className="hidden lg:flex items-center justify-center">
          <svg 
            className="w-8 h-8 text-white/40" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13 5l7 7-7 7M5 5l7 7-7 7" 
            />
          </svg>
        </div>

        {/* Right side - Swap result */}
        <div className="w-full lg:w-[400px]">
          <div className="bg-[#1A1A1A] rounded-2xl border border-[#333333] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" />
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" />
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" />
                </svg>
                <span className="text-lg font-semibold">Swap result</span>
              </div>
            </div>

            {/* Swap to selector */}
            <div className="mb-6">
              <div className="text-sm text-white/80 mb-2">Swap to</div>
              <Select
                selectedKeys={quickModeOutputToken ? [quickModeOutputToken.address] : []}
                onChange={(e) => {
                  const selectedToken = wallet.currentChain.multiSwapTokens.find(
                    t => t.address === e.target.value
                  );
                  setQuickModeOutputToken(selectedToken || wallet.currentChain.nativeToken);
                }}
                placeholder="Select output token"
                classNames={{
                  trigger: 'bg-[#252525] border-[#333333] h-12',
                  value: 'text-white',
                  popoverContent: 'bg-[#1A1A1A] border-[#333333]',
                }}
                renderValue={(items) => {
                  const token = quickModeOutputToken || wallet.currentChain.nativeToken;
                  return (
                    <div className="flex items-center gap-2">
                      <TokenLogo token={token} size={24} />
                      <span>{token.symbol}</span>
                    </div>
                  );
                }}
              >
                {wallet.currentChain.multiSwapTokens.map((token) => (
                  <SelectItem
                    key={token.address}
                    value={token.address}
                    textValue={token.symbol}
                  >
                    <div className="flex items-center gap-2">
                      <TokenLogo token={token} size={20} />
                      <span>{token.symbol}</span>
                    </div>
                  </SelectItem>
                ))}
              </Select>
            </div>

            {/* Output amount display */}
            <div className="bg-[#252525] rounded-xl p-6 mb-4">
              <div className="text-center">
                <div className="text-5xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                  <span>
                    {DynamicFormatAmount({
                      amount: totalOutputAmount,
                      decimals: 4,
                    })}
                  </span>
                  {quickModeOutputToken && (
                    <span className="text-2xl text-white/60">
                      {quickModeOutputToken.symbol}
                    </span>
                  )}
                </div>
                <div className="text-white/60 text-sm">
                  {DynamicFormatAmount({
                    amount: totalInputValue.toString(),
                    decimals: 2,
                    endWith: '$',
                  })}
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-white/60">
                <span>Selected tokens:</span>
                <span className="text-white">{quickModeSelectedTokens.size}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Swap button */}
      <div className="w-full flex justify-center">
        {needsApproval ? (
          <Button
            size="lg"
            isDisabled={quickModeSelectedTokens.size === 0 || !quickModeOutputToken}
            onPress={handleApproveAll}
            className="min-w-[320px] h-14 bg-[#FFCD4D] border border-black shadow-[2px_2px_0px_0px_#000000] text-black text-lg font-semibold rounded-2xl hover:bg-[#fff6e0] hover:border-black hover:shadow-[2px_2px_0px_0px_#000000] transition-all duration-300"
          >
            Approve All
          </Button>
        ) : (
          <Button
            size="lg"
            isDisabled={
              quickModeSelectedTokens.size === 0 || 
              !quickModeOutputToken ||
              totalInputValue.eq(0)
            }
            onPress={handleSwap}
            className="min-w-[320px] h-14 bg-[#FFCD4D] border border-black shadow-[2px_2px_0px_0px_#000000] text-black text-lg font-semibold rounded-2xl hover:bg-[#fff6e0] hover:border-black hover:shadow-[2px_2px_0px_0px_#000000] transition-all duration-300"
          >
            SWAP
          </Button>
        )}
      </div>
    </div>
  );
});

