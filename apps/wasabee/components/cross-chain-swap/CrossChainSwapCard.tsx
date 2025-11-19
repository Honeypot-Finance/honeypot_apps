import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Button } from '@/components/algebra/ui/button';
import { wallet } from '@honeypot/shared/lib/wallet';
import { Wallet2 } from 'lucide-react';
import Image from 'next/image';
import ChainSelector from './ChainSelector';
import TokenSelector from './TokenSelector';
// Use RocketX service instead of Particle Network
import { rocketxSwapService as crossChainSwapService } from '@/services/rocketxSwapService';
import { crossChainTransactionService } from '@/services/crossChainTransactionService';
import { WrappedToastify } from '@honeypot/shared/lib/utils/wrappedToastify';
import { trpcClient } from '@honeypot/shared/lib/trpc/trpc';
import { toast } from 'react-toastify';
import {
  Network,
  getWrappedNativeTokenAddressByChainId,
} from '@honeypot/shared/config/chains';

interface CrossChainSwapCardProps {
  onSwapSuccess?: () => void;
}

const CrossChainSwapCard: React.FC<CrossChainSwapCardProps> = observer(
  ({ onSwapSuccess }) => {
    const [fromAmount, setFromAmount] = useState('');
    const [toAmount, setToAmount] = useState('');
    const [slippage, setSlippage] = useState('1.0');
    const [isLoadingQuote, setIsLoadingQuote] = useState(false);
    const [isProcessingSwap, setIsProcessingSwap] = useState(false);
    const [swapStatus, setSwapStatus] = useState<string>('');
    const [quoteError, setQuoteError] = useState<string | null>(null);
    const [quoteData, setQuoteData] = useState<{
      priceImpact: number;
      estimatedTime: number;
      route: string[];
      feeInUSD?: string;
    } | null>(null);

    // Request ID to track and cancel old requests
    const quoteRequestIdRef = React.useRef(0);

    const {
      fromChain,
      toChain,
      fromToken,
      toToken,
      setFromChain,
      setToChain,
      setFromToken,
      setToToken,
    } = crossChainSwapService;

    // Load universal account info when wallet connects
    useEffect(() => {
      const initializeUniversalAccount = async () => {
        if (wallet.universalAccount && wallet.isInit) {
          try {
            await wallet.universalAccount.loadUniversalAccountInfo();
          } catch (error) {
            console.warn(
              'Failed to load Universal Account info on mount:',
              error
            );
            // Try again after a short delay
            setTimeout(async () => {
              try {
                if (wallet.universalAccount) {
                  await wallet.universalAccount.loadUniversalAccountInfo();
                }
              } catch (retryError) {
                console.error(
                  'Failed to load Universal Account info after retry:',
                  retryError
                );
              }
            }, 2000);
          }
        }
      };

      initializeUniversalAccount();
      // Also ensure chains are initialized
      crossChainSwapService.initializeChains();
      // Clear balance cache when account changes
      crossChainSwapService.clearBalanceCache();
    }, []); // Remove wallet.account dependency - MobX handles reactivity

    // Manual refresh function removed - not used

    const handleFromAmountChange = useCallback((value: string) => {
      setFromAmount(value);
      // Reset to amount when from amount changes
      setToAmount('');
    }, []);

    const handleSwapChains = useCallback(() => {
      crossChainSwapService.swapChains();
      // Don't clear amounts - just the calculated quote
      setToAmount('');
      // The balance useEffects will automatically trigger due to chain/token changes
    }, []);

    const handleQuoteUpdate = useCallback(async () => {
      if (
        !fromAmount ||
        !fromToken ||
        !toToken ||
        parseFloat(fromAmount) === 0
      ) {
        setToAmount('');
        setQuoteError(null);
        return;
      }

      // Increment request ID for new request
      quoteRequestIdRef.current += 1;
      const currentRequestId = quoteRequestIdRef.current;

      setIsLoadingQuote(true);
      setQuoteError(null);

      try {
        // Get real quote from cross-chain swap service
        const quote = await crossChainSwapService.getQuote(fromAmount);

        // Check if this request has been superseded by a newer one
        if (currentRequestId !== quoteRequestIdRef.current) {
          return;
        }

        // Check if quote has error (like "Pair is inactive" or "Min. Amount: 0.03 BNB")
        if (
          !quote.toAmount ||
          quote.toAmount === '' ||
          quote.toAmount === '0'
        ) {
          // Check if route contains error message
          // RocketX returns errors in route array when quote fails
          const errorMessage = quote.route?.find(
            (r) =>
              r.includes('inactive') ||
              r.includes('Error') ||
              r.includes('not found') ||
              r.includes('unavailable') ||
              r.includes('Min. Amount') ||
              r.includes('Amount:') ||
              r.includes('Invalid') ||
              r.includes('failed')
          );

          if (errorMessage) {
            setQuoteError(errorMessage);
            setToAmount('');
            setQuoteData(null);
            return;
          }
        }

        // Clear any previous errors if we got here
        setQuoteError(null);

        setToAmount(quote.toAmount);

        // Store quote data for display
        setQuoteData({
          priceImpact: quote.priceImpact,
          estimatedTime: quote.estimatedTime,
          route: quote.route,
          feeInUSD: quote.feeInUSD,
        });

        // If we have USD value, try to get more accurate fee preview
        if (quote.toAmount && wallet.universalAccount) {
          const preview = await crossChainSwapService.getTransactionPreview();

          // Check again if this request is still current
          if (currentRequestId !== quoteRequestIdRef.current) {
            return;
          }

          if (preview && preview.feeInUSD) {
            setQuoteData((prev) =>
              prev
                ? {
                    ...prev,
                    feeInUSD: preview.feeInUSD,
                  }
                : null
            );
          }
        }
      } catch (error) {
        // Check if this request is still current before updating error state
        if (currentRequestId !== quoteRequestIdRef.current) {
          return;
        }
        const errorMessage = error instanceof Error
          ? error.message
          : 'Failed to get quote. Please try again.';
        console.error('🚨 SETTING ERROR MESSAGE FOR USER:', errorMessage);
        setToAmount('');
        setQuoteData(null);
        setQuoteError(errorMessage);
      } finally {
        // Only update loading state if this is still the current request
        if (currentRequestId === quoteRequestIdRef.current) {
          setIsLoadingQuote(false);
        }
      }
    }, [fromAmount, fromToken, toToken]);

    // Update quote when inputs change
    useEffect(() => {
      const timer = setTimeout(() => {
        handleQuoteUpdate();
      }, 500); // Debounce

      return () => clearTimeout(timer);
    }, [fromAmount, fromToken, toToken, handleQuoteUpdate]);

    const handleSwitchChain = async () => {
      if (!fromChain || !wallet.walletClient) return;

      try {
        await wallet.walletClient.switchChain({ id: fromChain.chainId });
      } catch (error) {
        console.error('Failed to switch chain:', error);
        WrappedToastify.error({
          title: 'Failed to switch chain',
          message:
            error instanceof Error
              ? error.message
              : 'Please switch chain manually in your wallet',
        });
      }
    };

    const [fromTokenPrice, setFromTokenPrice] = useState<number>(0);
    const [toTokenPrice, setToTokenPrice] = useState<number>(0);
    const [isPriceLoading, setIsPriceLoading] = useState(false);

    // Fetch token prices from the API
    const fetchTokenPrices = useCallback(async () => {
      if (!fromToken && !toToken) return;

      setIsPriceLoading(true);
      try {
        const promises = [];

        // Fetch from token price
        if (fromToken) {
          // For native tokens, we need to get the wrapped token address for price lookup
          let priceAddress = fromToken.address;

          if (
            fromToken.isNative ||
            Network.isNativeTokenAddress(fromToken.address)
          ) {
            // Get wrapped token address from chain configuration
            const wrappedAddress = getWrappedNativeTokenAddressByChainId(
              fromToken.chainId
            );
            if (wrappedAddress) {
              priceAddress = wrappedAddress;
              console.log(
                `Using wrapped address for ${fromToken.symbol} price lookup: ${priceAddress}`
              );
            }
          }

          // Always try API first for all tokens
          if (priceAddress && !Network.isNativeTokenAddress(priceAddress)) {
            promises.push(
              trpcClient.priceFeed.getSingleTokenPrice
                .query({
                  chainId: fromToken.chainId,
                  tokenAddress: priceAddress,
                })
                .then((res) => {
                  // Check for both 'price' and 'priceUSD' fields for compatibility
                  // Also check if price is not null (API returns null for unsupported tokens)
                  if (
                    res.status === 'success' &&
                    res.data &&
                    res.data.price !== null &&
                    res.data.price !== undefined
                  ) {
                    const price =
                      typeof res.data.price === 'string'
                        ? parseFloat(res.data.price)
                        : res.data.price;

                    setFromTokenPrice(price);
                  } else {
                    console.error(
                      `⚠️ FROM token ${fromToken.symbol} price API failed or returned null`
                    );
                    // Only use fallback for stablecoins
                    const stablecoins = ['USDT', 'USDC', 'DAI', 'BUSD'];
                    const fallbackPrice = stablecoins.includes(
                      fromToken.symbol.toUpperCase()
                    )
                      ? 1
                      : 0;
                    console.error(
                      `Using fallback price for ${fromToken.symbol}: $${fallbackPrice}`
                    );
                    setFromTokenPrice(fallbackPrice);
                  }
                })
                .catch((err) => {
                  console.error(
                    `❌ FROM token ${fromToken.symbol} API error:`,
                    err
                  );
                  // Silent fail - only use fallback for stablecoins on error
                  const stablecoins = ['USDT', 'USDC', 'DAI', 'BUSD'];
                  const fallbackPrice = stablecoins.includes(
                    fromToken.symbol.toUpperCase()
                  )
                    ? 1
                    : 0;
                  console.error(
                    `Using fallback price for ${fromToken.symbol} after error: $${fallbackPrice}`
                  );
                  setFromTokenPrice(fallbackPrice);
                })
            );
          } else {
            // No valid address to query
            setFromTokenPrice(0);
          }
        }

        // Fetch to token price
        if (toToken) {
          // For native tokens, we need to get the wrapped token address for price lookup
          let priceAddress = toToken.address;

          if (
            toToken.isNative ||
            Network.isNativeTokenAddress(toToken.address)
          ) {
            // Get wrapped token address from chain configuration
            const wrappedAddress = getWrappedNativeTokenAddressByChainId(
              toToken.chainId
            );
            if (wrappedAddress) {
              priceAddress = wrappedAddress;
              console.log(
                `Using wrapped address for ${toToken.symbol} price lookup: ${priceAddress}`
              );
            }
          }

          // Always try API first for all tokens
          if (priceAddress && !Network.isNativeTokenAddress(priceAddress)) {
            promises.push(
              trpcClient.priceFeed.getSingleTokenPrice
                .query({
                  chainId: toToken.chainId,
                  tokenAddress: priceAddress,
                })
                .then((res) => {
                  // Check for both 'price' and 'priceUSD' fields for compatibility
                  // Also check if price is not null (API returns null for unsupported tokens)
                  if (
                    res.status === 'success' &&
                    res.data &&
                    res.data.price !== null &&
                    res.data.price !== undefined
                  ) {
                    const price =
                      typeof res.data.price === 'string'
                        ? parseFloat(res.data.price)
                        : res.data.price;
                    setToTokenPrice(price);
                  } else {
                    // Only use fallback for stablecoins
                    const stablecoins = ['USDT', 'USDC', 'DAI', 'BUSD'];
                    const fallbackPrice = stablecoins.includes(
                      toToken.symbol.toUpperCase()
                    )
                      ? 1
                      : 0;
                    setToTokenPrice(fallbackPrice);
                  }
                })
                .catch((err) => {
                  // Silent fail - only use fallback for stablecoins on error
                  const stablecoins = ['USDT', 'USDC', 'DAI', 'BUSD'];
                  const fallbackPrice = stablecoins.includes(
                    toToken.symbol.toUpperCase()
                  )
                    ? 1
                    : 0;
                  setToTokenPrice(fallbackPrice);
                })
            );
          } else {
            // No valid address to query
            setToTokenPrice(0);
          }
        }

        if (promises.length > 0) {
          await Promise.all(promises);
        }
      } catch (error) {
        console.error('Failed to fetch token prices:', error);
      } finally {
        setIsPriceLoading(false);
      }
    }, [fromToken, toToken]);

    // Fetch prices when tokens change
    useEffect(() => {
      fetchTokenPrices();
    }, [fetchTokenPrices]);

    const handleSwap = async () => {
      if (!fromToken || !toToken || !fromAmount || !fromChain || !toChain) {
        return;
      }

      // Add enhanced logging
      console.log('\n🚀 STARTING ROCKETX CROSS-CHAIN SWAP');
      console.log('=====================================');
      console.log('Swap parameters:', {
        fromAmount,
        toAmount,
        fromToken: fromToken.symbol,
        toToken: toToken.symbol,
        fromChain: fromChain?.chainId,
        toChain: toChain?.chainId,
        slippage: parseFloat(slippage),
      });
      console.log('=====================================\n');

      // Double check we're on the right chain
      if (isWrongChain) {
        await handleSwitchChain();
        return;
      }

      // Set processing state
      setIsProcessingSwap(true);
      setSwapStatus('Getting quote...');

      let pendingToastId: string | number | undefined;
      let transactionId: string | undefined;

      try {
        // Show pending notification
        pendingToastId = WrappedToastify.pending({
          title: 'Processing Cross-Chain Swap...',
          message: `Swapping ${fromAmount} ${fromToken.symbol} to ${toToken.symbol}`,
          options: {
            autoClose: false,
          },
        });

        // Step 1: Get swap transaction data from RocketX
        console.log('📡 Calling RocketX /swap API...');
        setSwapStatus('Preparing swap...');
        const swapData = await crossChainSwapService.executeSwap(
          fromAmount,
          toAmount
        );

        const { transaction, swapId, depositAddress } = swapData as any;

        // Add transaction to history with requestId
        transactionId = crossChainTransactionService.addTransaction({
          fromToken,
          toToken,
          fromChain,
          toChain,
          fromAmount,
          toAmount,
          userAddress: wallet.account as string,
          requestId: swapId, // Store the requestId for status tracking
        });
        console.log('✅ Swap transaction data received:', {
          swapId,
          transaction,
          depositAddress,
        });
        console.log(
          '🔍 Raw transaction from RocketX:',
          JSON.stringify(transaction, null, 2)
        );

        // Step 2: Execute the transaction with user's wallet
        if (!wallet.walletClient) {
          throw new Error('Wallet not connected');
        }

        if (!transaction) {
          throw new Error('No transaction data received');
        }

        console.log('📝 Sending transaction to wallet for signing...');
        console.log('📊 Transaction details from RocketX:', {
          to: transaction.to,
          value: transaction.value,
          valueInBNB: transaction.value
            ? (BigInt(transaction.value) / BigInt(1e18)).toString()
            : '0',
          gas: transaction.gas,
          gasPrice: transaction.gasPrice,
          gasPriceInGwei: transaction.gasPrice
            ? (BigInt(transaction.gasPrice) / BigInt(1e9)).toString()
            : '0',
        });

        // Validate transaction has required fields
        if (!transaction.to) {
          throw new Error('Transaction missing "to" address. Cannot proceed.');
        }

        // Check for suspiciously high gas price (> 100 Gwei)
        if (transaction.gasPrice) {
          const gasPriceGwei = BigInt(transaction.gasPrice) / BigInt(1e9);
          if (gasPriceGwei > BigInt(100)) {
            console.warn(
              '⚠️ Unusually high gas price:',
              gasPriceGwei.toString(),
              'Gwei'
            );
            console.warn(
              '⚠️ This may be incorrect. Removing gasPrice and letting wallet estimate.'
            );
            delete (transaction as any).gasPrice;
          }
        }

        setSwapStatus('Confirm in wallet...');

        // Send the transaction using wagmi
        // Note: We don't specify chain - wallet should already be on the correct fromChain
        // Use EIP-1559 if available, otherwise fall back to legacy gasPrice
        const txParams: any = {
          to: transaction.to as `0x${string}`,
          data: transaction.data as `0x${string}` | undefined,
          value: BigInt(transaction.value || '0'),
          gas: transaction.gas ? BigInt(transaction.gas) : undefined,
        };

        // Use EIP-1559 params if available, otherwise use legacy gasPrice
        if (transaction.maxFeePerGas || transaction.maxPriorityFeePerGas) {
          if (transaction.maxFeePerGas) {
            txParams.maxFeePerGas = BigInt(transaction.maxFeePerGas);
          }
          if (transaction.maxPriorityFeePerGas) {
            txParams.maxPriorityFeePerGas = BigInt(
              transaction.maxPriorityFeePerGas
            );
          }
        } else if (transaction.gasPrice) {
          txParams.gasPrice = BigInt(transaction.gasPrice);
        }

        const txHash = await wallet.walletClient.sendTransaction(txParams);

        console.log('✅ Transaction sent! Hash:', txHash);
        setSwapStatus('Processing transaction...');

        // Dismiss pending toast
        if (pendingToastId) {
          toast.dismiss(pendingToastId);
        }

        // Update transaction with hash and pending status
        crossChainTransactionService.updateTransactionStatus(
          transactionId,
          'pending',
          txHash,
          undefined,
          swapId
        );

        // Show success message
        WrappedToastify.success({
          title: 'Transaction Submitted!',
          message: (
            <div>
              <p>Your swap transaction has been submitted to the blockchain.</p>
              <p className="text-sm mt-2 text-gray-400">Swap ID: {swapId}</p>
              <p className="text-sm text-gray-400">
                The swap will be processed by RocketX. This may take a few
                minutes.
              </p>
            </div>
          ),
        });

        // Reset form
        setFromAmount('');
        setToAmount('');
        setQuoteData(null);

        // Call success callback
        onSwapSuccess?.();

        // Note: Status polling is now handled automatically by crossChainTransactionService
        // It checks all pending transactions every minute
      } catch (error) {
        // Dismiss pending toast if it exists
        if (pendingToastId) {
          toast.dismiss(pendingToastId);
        }

        const errorMessage =
          error instanceof Error ? error.message : 'Failed to execute swap';

        console.error('❌ Swap error:', errorMessage, error);

        // Update transaction as failed (only if transaction was created)
        if (transactionId) {
          crossChainTransactionService.updateTransactionStatus(
            transactionId,
            'failed',
            undefined,
            errorMessage
          );
        }

        // Check if user rejected the transaction
        const isUserRejection =
          errorMessage.toLowerCase().includes('user rejected') ||
          errorMessage.toLowerCase().includes('user denied') ||
          errorMessage.toLowerCase().includes('user cancelled');

        // Check if it's a bad request from RocketX
        const isBadRequest = errorMessage.includes('Bad Request');

        WrappedToastify.error({
          title: isUserRejection ? 'Transaction Cancelled' : 'Swap Failed',
          message: isBadRequest ? (
            <div>
              <p>RocketX API returned "Bad Request".</p>
              <p className="text-sm mt-2 text-gray-400">
                The /swap endpoint might require additional parameters or a
                different request format.
              </p>
              <p className="text-sm mt-1 text-gray-400">
                Please check the RocketX API documentation for the correct /swap
                endpoint format.
              </p>
            </div>
          ) : isUserRejection ? (
            'You cancelled the transaction.'
          ) : (
            errorMessage
          ),
          options: {
            autoClose: isUserRejection ? 5000 : 10000,
          },
        });
      } finally {
        setIsProcessingSwap(false);
        setSwapStatus('');
      }
    };

    // Compute directly without useMemo - MobX will handle reactivity
    const isWrongChain =
      fromToken && wallet.currentChainId.toString() !== fromToken.chainId;

    // Debug logging to track chain changes
    useEffect(() => {
      console.log('Chain state updated:', {
        currentChainId: wallet.currentChainId?.toString(),
        fromTokenChainId: fromToken?.chainId,
        isWrongChain:
          fromToken && wallet.currentChainId.toString() !== fromToken.chainId,
      });
    }, [fromToken]); // Only depend on fromToken changes

    const isSwapDisabled = useMemo(() => {
      // If wallet is not connected, allow button to be clickable
      if (!wallet.isUserConnected) return false;
      if (isWrongChain) return false; // Allow button to be clicked to switch chain
      return (
        !fromAmount ||
        !toAmount ||
        parseFloat(fromAmount) === 0 ||
        !fromToken ||
        !toToken ||
        isLoadingQuote ||
        !!quoteError // Disable if there's an error (like minimum amount)
      );
    }, [
      fromAmount,
      toAmount,
      fromToken,
      toToken,
      isLoadingQuote,
      quoteError,
      isWrongChain,
    ]);

    const [fromTokenBalance, setFromTokenBalance] = useState('0');
    const [toTokenBalance, setToTokenBalance] = useState('0');

    // Create a reactive chain ID variable that triggers effects
    const currentChainId = wallet.currentChainId;

    // Load balances when tokens change or wallet/chain changes
    useEffect(() => {
      // Check if wallet is actually connected (not zero address)
      if (!fromToken || !wallet.isUserConnected) {
        setFromTokenBalance('0');
        return;
      }

      console.log(
        `Loading balance for from token ${fromToken.symbol} on chain ${fromToken.chainId}, current wallet chain: ${currentChainId}`
      );

      // Add loading state
      setFromTokenBalance('Loading...');

      // Clear any existing cache to force fresh fetch
      crossChainSwapService.clearBalanceCache();

      // Always use getCrossChainTokenBalance for cross-chain swaps
      // This fetches balance from the token's chain, not current wallet chain
      crossChainSwapService
        .getCrossChainTokenBalance(fromToken)
        .then((balance) => {
          console.log(`Got from token balance: ${balance}`);
          setFromTokenBalance(balance);
        })
        .catch((err) => {
          console.error('Failed to load from token balance:', err);
          setFromTokenBalance('0');
        });
    }, [fromToken?.address, fromToken?.chainId, fromChain?.chainId, wallet.isUserConnected]); // Re-fetch when token address, chainId or chain changes

    useEffect(() => {
      // Check if wallet is actually connected (not zero address)
      if (!toToken || !wallet.isUserConnected) {
        setToTokenBalance('0');
        return;
      }

      console.log(
        `Loading balance for to token ${toToken.symbol} on chain ${toToken.chainId}, current wallet chain: ${currentChainId}`
      );

      // Add loading state
      setToTokenBalance('Loading...');

      // Clear any existing cache to force fresh fetch
      crossChainSwapService.clearBalanceCache();

      // Always use getCrossChainTokenBalance for cross-chain swaps
      // This fetches balance from the token's chain, not current wallet chain
      crossChainSwapService
        .getCrossChainTokenBalance(toToken)
        .then((balance) => {
          console.log(`Got to token balance: ${balance}`);
          setToTokenBalance(balance);
        })
        .catch((err) => {
          console.error('Failed to load to token balance:', err);
          setToTokenBalance('0');
        });
    }, [toToken?.address, toToken?.chainId, toChain?.chainId, wallet.isUserConnected]); // Re-fetch when token address, chainId or chain changes

    // Ensure we have chains before rendering
    if (!fromChain || !toChain) {
      return (
        <div className="w-full max-w-[480px] mx-auto">
          <div className="bg-[#140D06] rounded-3xl border border-[#2a2a2a] shadow-2xl p-6">
            <div className="text-center text-gray-400">Loading chains...</div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full max-w-full sm:max-w-[480px] lg:w-[480px] px-2 sm:px-0">
        {/* Main Card */}
        <div className="bg-[#140D06] rounded-[25px] border border-[rgba(255,255,255,0.2)] shadow-xl h-fit p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-2xl font-medium">Swap</h2>
          </div>

          <div className="">
            {/* From Section */}
            <div className="bg-[#1F1409] rounded-xl p-5 border border-[#2a2318]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <span className="text-xs text-[#998877]">From</span>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
                  <TokenSelector
                    chainId={fromChain?.chainId || 0}
                    value={fromToken || undefined}
                    onChange={setFromToken}
                    variant="dark"
                  />
                  <ChainSelector
                    value={fromChain}
                    onChange={setFromChain}
                    variant="dark"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    value={fromAmount}
                    onChange={(e) => handleFromAmountChange(e.target.value)}
                    placeholder="0.00"
                    className="w-full text-xl sm:text-2xl font-medium bg-transparent outline-none text-white placeholder-gray-600"
                  />
                  <div className="text-xs text-[#998877] mt-1">
                    {isPriceLoading ? (
                      <span className="text-[#665544]">Loading...</span>
                    ) : (
                      <>
                        $
                        {fromAmount && fromToken && fromTokenPrice > 0
                          ? (parseFloat(fromAmount) * fromTokenPrice).toFixed(2)
                          : '0.00'}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  {wallet.isUserConnected ? (
                    <>
                      <div className="flex items-center text-xs text-[#E7CDB1]">
                        <Wallet2 className="w-3 h-3 mr-1" />
                        {fromTokenBalance} {fromToken?.symbol || 'ETH'}
                      </div>
                      <button
                        className="text-xs bg-[#FFFFFF1A]/10 rounded-full border border-[#86715B] px-2 py-0.5 hover:bg-[#FFFFFF1A]/20 transition-colors"
                        onClick={() => {
                          console.log(
                            'Max button clicked, balance:',
                            fromTokenBalance
                          );
                          if (
                            fromTokenBalance &&
                            fromTokenBalance !== '0' &&
                            fromTokenBalance !== 'Loading...'
                          ) {
                            try {
                              // Parse the balance and handle it properly
                              const balance = parseFloat(fromTokenBalance);
                              if (!isNaN(balance) && balance > 0) {
                                // Format to avoid scientific notation and trailing zeros
                                const cleanBalance = balance
                                  .toFixed(10)
                                  .replace(/\.?0+$/, '');
                                setFromAmount(cleanBalance);
                              }
                            } catch (err) {
                              console.error('Error parsing balance:', err);
                            }
                          }
                        }}
                      >
                        Max
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center text-xs text-[#665544]">
                      <Wallet2 className="w-3 h-3 mr-1" />
                      Connect wallet
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Swap Direction Button */}
            <div className="flex w-full items-center justify-center z-10 h-3">
              <div className="cursor-pointer" onClick={handleSwapChains}>
                <Image
                  src="/images/icons/swap_arrow.png"
                  alt="switch tokens"
                  width={50}
                  height={50}
                />
              </div>
            </div>

            {/* To Section */}
            <div className="bg-[#1F1409] rounded-xl p-5 border border-[#2a2318]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <span className="text-xs text-[#998877]">To</span>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
                  <TokenSelector
                    chainId={toChain?.chainId || 0}
                    value={toToken || undefined}
                    onChange={setToToken}
                    variant="dark"
                  />
                  <ChainSelector
                    value={toChain}
                    onChange={setToChain}
                    variant="dark"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    value={isLoadingQuote ? '' : toAmount}
                    readOnly
                    placeholder={isLoadingQuote ? 'Fetching quote...' : '0.00'}
                    className="w-full text-xl sm:text-2xl font-medium bg-transparent outline-none text-white placeholder-gray-600"
                  />
                  <div className="text-xs mt-1 min-h-[20px]">
                    {isLoadingQuote ? (
                      <span className="text-[#FFCD4D] animate-pulse font-semibold">
                        Loading quote...
                      </span>
                    ) : quoteError ? (
                      <div className="flex flex-col gap-1">
                        <span className="text-red-500 font-semibold text-sm">
                          ⚠️ {quoteError}
                        </span>
                      </div>
                    ) : isPriceLoading ? (
                      <span className="text-[#665544]">Loading price...</span>
                    ) : (
                      <span className="text-[#998877]">
                        $
                        {toAmount && toToken && toTokenPrice > 0
                          ? (parseFloat(toAmount) * toTokenPrice).toFixed(2)
                          : '0.00'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  {wallet.isUserConnected ? (
                    <div className="flex items-center text-xs text-[#E7CDB1]">
                      <Wallet2 className="w-3 h-3 mr-1" />
                      {toTokenBalance} {toToken?.symbol || 'USDT'}
                    </div>
                  ) : (
                    <div className="flex items-center text-xs text-[#665544]">
                      <Wallet2 className="w-3 h-3 mr-1" />
                      Connect wallet
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4">
              {/* Swap Button */}
              <Button
                className="w-full bg-[#FFA931] hover:bg-[#E89821] text-black font-bold py-4 rounded-2xl border-[3px] border-[#C87304]"
                disabled={isSwapDisabled || isProcessingSwap}
                onClick={isWrongChain ? handleSwitchChain : handleSwap}
              >
                {!wallet.isUserConnected
                  ? 'Connect Wallet'
                  : isProcessingSwap
                  ? swapStatus || 'Processing...'
                  : isLoadingQuote
                  ? 'Getting Quote...'
                  : isWrongChain
                  ? `Switch to ${fromChain?.displayName || 'Chain'}`
                  : 'Swap'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default CrossChainSwapCard;
