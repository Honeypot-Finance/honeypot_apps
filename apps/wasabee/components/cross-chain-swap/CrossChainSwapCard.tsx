import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Button } from '@nextui-org/react';
import { wallet } from '@honeypot/shared/lib/wallet';
import { ArrowDown, Settings } from 'lucide-react';
import ChainSelector from './ChainSelector';
import TokenSelector from './TokenSelector';
import { crossChainSwapService } from '@/services/crossChainSwap';
import { crossChainTransactionService } from '@/services/crossChainTransactionService';
import { WrappedToastify } from '@honeypot/shared';
import { trpcClient } from '@honeypot/shared/lib/trpc/trpc';
import { toast } from 'react-toastify';

interface CrossChainSwapCardProps {
  onSwapSuccess?: () => void;
}

const CrossChainSwapCard: React.FC<CrossChainSwapCardProps> = observer(
  ({ onSwapSuccess }) => {
    const [fromAmount, setFromAmount] = useState('');
    const [toAmount, setToAmount] = useState('');
    const [isLoadingQuote, setIsLoadingQuote] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showRecommended, setShowRecommended] = useState(false);
    const [slippage, setSlippage] = useState('1.0');
    const [quoteData, setQuoteData] = useState<{
      priceImpact: number;
      estimatedTime: number;
      route: string[];
      feeInUSD?: string;
    } | null>(null);

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
      if (wallet.universalAccount && wallet.isInit) {
        wallet.universalAccount.loadUniversalAccountInfo();
      }
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
      setFromAmount('');
      setToAmount('');
    }, []);

    const handleQuoteUpdate = useCallback(async () => {
      if (
        !fromAmount ||
        !fromToken ||
        !toToken ||
        parseFloat(fromAmount) === 0
      ) {
        setToAmount('');
        return;
      }

      setIsLoadingQuote(true);
      try {
        // Get real quote from cross-chain swap service
        const quote = await crossChainSwapService.getQuote(fromAmount);
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
          const fromTokenPrice = 1; // This should come from price feed
          const usdValue = (parseFloat(fromAmount) * fromTokenPrice).toFixed(2);

          const preview = await crossChainSwapService.getTransactionPreview(
            usdValue
          );
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
        console.error('Failed to get quote:', error);
        setToAmount('');
        setQuoteData(null);
      } finally {
        setIsLoadingQuote(false);
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

    const [isProcessingSwap, setIsProcessingSwap] = useState(false);
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
            !fromToken.address ||
            fromToken.address === '0x0000000000000000000000000000000000000000'
          ) {
            // Map native tokens to their wrapped versions for price lookup
            const wrappedAddresses: Record<string, Record<string, string>> = {
              '1': { ETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' }, // WETH on Ethereum
              '56': { BNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c' }, // WBNB on BSC
              '137': { MATIC: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270' }, // WMATIC on Polygon
              '8453': { ETH: '0x4200000000000000000000000000000000000006' }, // WETH on Base
              '42161': { ETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1' }, // WETH on Arbitrum
              '10': { ETH: '0x4200000000000000000000000000000000000006' }, // WETH on Optimism
              '43114': { AVAX: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7' }, // WAVAX on Avalanche
            };

            const chainWrapped = wrappedAddresses[fromToken.chainId];
            if (chainWrapped && chainWrapped[fromToken.symbol.toUpperCase()]) {
              priceAddress = chainWrapped[fromToken.symbol.toUpperCase()];
              console.log(
                `Using wrapped address for ${fromToken.symbol} price lookup: ${priceAddress}`
              );
            }
          }

          // Always try API first for all tokens
          if (
            priceAddress &&
            priceAddress !== '0x0000000000000000000000000000000000000000'
          ) {
            // Log the API request details
            const apiUrl = `${window.location.origin}/api/trpc/priceFeed.getSingleTokenPrice`;
            console.log(`\n📡 API Request for ${fromToken.symbol}:`);
            console.log(`  URL: ${apiUrl}`);
            console.log(`  Parameters:`, {
              chainId: fromToken.chainId,
              tokenAddress: priceAddress,
            });

            promises.push(
              trpcClient.priceFeed.getSingleTokenPrice
                .query({
                  chainId: fromToken.chainId,
                  tokenAddress: priceAddress,
                })
                .then((res) => {
                  console.log(`\n✅ API Response for ${fromToken.symbol}:`);
                  console.log(`  Full response:`, JSON.stringify(res, null, 2));

                  // Check for both 'price' and 'priceUSD' fields for compatibility
                  if (
                    res.status === 'success' &&
                    res.data &&
                    res.data.price
                  ) {
                    const price = typeof res.data.price === 'string' 
                      ? parseFloat(res.data.price) 
                      : res.data.price;
                    setFromTokenPrice(price);
                    console.log(
                      `  ✅ ${fromToken.symbol} price from API: $${price}`
                    );
                  } else {
                    console.log(
                      `  ⚠️ No valid price data in response for ${fromToken.symbol}`
                    );
                    console.log(`  Response status: ${res.status}`);
                    console.log(`  Response data:`, res.status === 'success' ? res.data : 'No data');
                    // Only use fallback for stablecoins
                    const stablecoins = ['USDT', 'USDC', 'DAI', 'BUSD'];
                    const fallbackPrice = stablecoins.includes(
                      fromToken.symbol.toUpperCase()
                    )
                      ? 1
                      : 0;
                    setFromTokenPrice(fallbackPrice);
                    console.log(
                      `  Using fallback price for ${fromToken.symbol}: $${fallbackPrice}`
                    );
                  }
                })
                .catch((err) => {
                  console.error(`\n❌ API Error for ${fromToken.symbol}:`);
                  console.error(`  Error details:`, err);
                  console.error(`  Error message:`, err.message);
                  console.error(`  Error stack:`, err.stack);
                  // Only use fallback for stablecoins on error
                  const stablecoins = ['USDT', 'USDC', 'DAI', 'BUSD'];
                  const fallbackPrice = stablecoins.includes(
                    fromToken.symbol.toUpperCase()
                  )
                    ? 1
                    : 0;
                  setFromTokenPrice(fallbackPrice);
                  console.log(
                    `  Using fallback price for ${fromToken.symbol} after error: $${fallbackPrice}`
                  );
                })
            );
          } else {
            // No valid address to query
            console.log(
              `No valid address for ${fromToken.symbol}, setting price to 0`
            );
            setFromTokenPrice(0);
          }
        }

        // Fetch to token price
        if (toToken) {
          // For native tokens, we need to get the wrapped token address for price lookup
          let priceAddress = toToken.address;

          if (
            toToken.isNative ||
            !toToken.address ||
            toToken.address === '0x0000000000000000000000000000000000000000'
          ) {
            // Map native tokens to their wrapped versions for price lookup
            const wrappedAddresses: Record<string, Record<string, string>> = {
              '1': { ETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' }, // WETH on Ethereum
              '56': { BNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c' }, // WBNB on BSC
              '137': { MATIC: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270' }, // WMATIC on Polygon
              '8453': { ETH: '0x4200000000000000000000000000000000000006' }, // WETH on Base
              '42161': { ETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1' }, // WETH on Arbitrum
              '10': { ETH: '0x4200000000000000000000000000000000000006' }, // WETH on Optimism
              '43114': { AVAX: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7' }, // WAVAX on Avalanche
            };

            const chainWrapped = wrappedAddresses[toToken.chainId];
            if (chainWrapped && chainWrapped[toToken.symbol.toUpperCase()]) {
              priceAddress = chainWrapped[toToken.symbol.toUpperCase()];
              console.log(
                `Using wrapped address for ${toToken.symbol} price lookup: ${priceAddress}`
              );
            }
          }

          // Always try API first for all tokens
          if (
            priceAddress &&
            priceAddress !== '0x0000000000000000000000000000000000000000'
          ) {
            // Log the API request details
            const apiUrl = `${window.location.origin}/api/trpc/priceFeed.getSingleTokenPrice`;
            console.log(`\n📡 API Request for ${toToken.symbol}:`);
            console.log(`  URL: ${apiUrl}`);
            console.log(`  Parameters:`, {
              chainId: toToken.chainId,
              tokenAddress: priceAddress,
            });

            promises.push(
              trpcClient.priceFeed.getSingleTokenPrice
                .query({
                  chainId: toToken.chainId,
                  tokenAddress: priceAddress,
                })
                .then((res) => {
                  console.log(`\n✅ API Response for ${toToken.symbol}:`);
                  console.log(`  Full response:`, JSON.stringify(res, null, 2));

                  // Check for both 'price' and 'priceUSD' fields for compatibility
                  if (
                    res.status === 'success' &&
                    res.data &&
                    res.data.price
                  ) {
                    const price = typeof res.data.price === 'string' 
                      ? parseFloat(res.data.price) 
                      : res.data.price;
                    setToTokenPrice(price);
                    console.log(
                      `  ✅ ${toToken.symbol} price from API: $${price}`
                    );
                  } else {
                    console.log(
                      `  ⚠️ No valid price data in response for ${toToken.symbol}`
                    );
                    console.log(`  Response status: ${res.status}`);
                    console.log(`  Response data:`, res.status === 'success' ? res.data : 'No data');
                    // Only use fallback for stablecoins
                    const stablecoins = ['USDT', 'USDC', 'DAI', 'BUSD'];
                    const fallbackPrice = stablecoins.includes(
                      toToken.symbol.toUpperCase()
                    )
                      ? 1
                      : 0;
                    setToTokenPrice(fallbackPrice);
                    console.log(
                      `  Using fallback price for ${toToken.symbol}: $${fallbackPrice}`
                    );
                  }
                })
                .catch((err) => {
                  console.error(`\n❌ API Error for ${toToken.symbol}:`);
                  console.error(`  Error details:`, err);
                  console.error(`  Error message:`, err.message);
                  console.error(`  Error stack:`, err.stack);
                  // Only use fallback for stablecoins on error
                  const stablecoins = ['USDT', 'USDC', 'DAI', 'BUSD'];
                  const fallbackPrice = stablecoins.includes(
                    toToken.symbol.toUpperCase()
                  )
                    ? 1
                    : 0;
                  setToTokenPrice(fallbackPrice);
                  console.log(
                    `  Using fallback price for ${toToken.symbol} after error: $${fallbackPrice}`
                  );
                })
            );
          } else {
            // No valid address to query
            console.log(
              `No valid address for ${toToken.symbol}, setting price to 0`
            );
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
      if (
        !wallet.universalAccount ||
        !fromToken ||
        !toToken ||
        !fromAmount ||
        !fromChain ||
        !toChain
      ) {
        return;
      }

      // Double check we're on the right chain
      if (isWrongChain) {
        await handleSwitchChain();
        return;
      }

      // Set processing state
      setIsProcessingSwap(true);

      // Add transaction to history
      const transactionId = crossChainTransactionService.addTransaction({
        fromToken,
        toToken,
        fromChain,
        toChain,
        fromAmount,
        toAmount,
        userAddress: wallet.account as string,
      });

      let pendingToastId: string | number | undefined;

      try {
        pendingToastId = WrappedToastify.pending({
          title: 'Processing Cross-Chain Swap...',
          message: `Swapping ${fromAmount} ${
            fromToken.symbol || 'Unknown'
          } to ${toToken.symbol || 'Unknown'}`,
          options: {
            autoClose: false, // Keep the toast visible until manually dismissed
          },
        });

        // Step 1: Create the universal transaction
        const swapResult = await crossChainSwapService.executeSwap(
          fromAmount,
          toAmount
        );
        const { transaction } = swapResult;

        // Step 2: Sign the transaction with the wallet
        if (!wallet.walletClient) {
          throw new Error('Wallet not connected');
        }

        // For cross-chain swaps, we sign the transaction ID
        const messageToSign =
          transaction.id || 'cross-chain-swap';

        // Sign the message
        const signature = await wallet.walletClient.signMessage({
          account: wallet.account as `0x${string}`,
          message: messageToSign,
        });

        // Step 3: Send the signed transaction (this includes deposit and withdrawal)
        const result = await crossChainSwapService.sendSwapTransaction(
          transaction,
          signature
        );

        // Get transaction hash from result
        const txHash =
          result.transactionHash || result.depositTxHash || '0x...';

        // Dismiss the loading toast only after the transaction completes
        if (pendingToastId) {
          toast.dismiss(pendingToastId);
        }

        // Update transaction status based on result
        if (result.status === 'completed') {
          // Use withdrawalTxId if available, otherwise use transferTxId
          const finalTxId =
            (result as { withdrawalTxId?: string; transferTxId?: string }).withdrawalTxId || 
            (result as { withdrawalTxId?: string; transferTxId?: string }).transferTxId;

          crossChainTransactionService.updateTransactionStatus(
            transactionId,
            'completed',
            txHash,
            undefined,
            finalTxId // Pass the final Universal transaction ID
          );

          // Wait a bit more for the transaction to be confirmed on chain
          await new Promise((resolve) => setTimeout(resolve, 5000));

          const successMessage = (
            <div>
              <p>
                Successfully swapped {fromAmount} {fromToken.symbol} to{' '}
                {toAmount} {toToken.symbol}
              </p>
              {(result as { universalTxUrl?: string }).universalTxUrl && (
                <a
                  href={(result as { universalTxUrl?: string }).universalTxUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline"
                >
                  View on Universal Account Explorer
                </a>
              )}
            </div>
          );

          WrappedToastify.success({
            title: 'Cross-Chain Swap Completed!',
            message: successMessage,
          });
        } else if (result.status === 'deposit_complete') {
          crossChainTransactionService.updateTransactionStatus(
            transactionId,
            'pending',
            txHash
          );

          WrappedToastify.info({
            title: 'Deposit Successful',
            message:
              result.message ||
              'Tokens deposited to Universal Account. Transfer may need to be completed manually.',
          });
        } else if (result.status === 'pending_withdrawal') {
          crossChainTransactionService.updateTransactionStatus(
            transactionId,
            'pending',
            txHash
          );

          WrappedToastify.info({
            title: 'Processing Cross-Chain Transfer',
            message:
              result.message ||
              'Please wait while the cross-chain transfer is processed',
          });
        }

        // Dismiss the pending toast
        if (pendingToastId) {
          toast.dismiss(pendingToastId);
        }

        // Update transaction status to completed with Universal transaction ID
        const universalTxId =
          (result as { tx?: { id?: string }; transactionId?: string })?.tx?.id || 
          (result as { tx?: { id?: string }; transactionId?: string })?.transactionId;
        crossChainTransactionService.updateTransactionStatus(
          transactionId,
          'completed',
          txHash,
          undefined,
          universalTxId
        );

        // Show success notification
        WrappedToastify.success({
          title: 'Swap Completed!',
          message: `Successfully swapped ${fromAmount} ${
            fromToken.symbol || 'Unknown'
          } to ${toToken.symbol || 'Unknown'}`,
        });

        // Reset form
        setFromAmount('');
        setToAmount('');
        onSwapSuccess?.();

        // Force clear cache and reload all token balances
        crossChainSwapService.clearBalanceCache();
        await crossChainSwapService.reloadTokenBalances();

        // Wait a bit for blockchain state to update
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Update the UI with fresh balances for both tokens
        const [newFromBalance, newToBalance] = await Promise.all([
          fromToken
            ? crossChainSwapService.getCrossChainTokenBalance(fromToken)
            : Promise.resolve('0'),
          toToken
            ? crossChainSwapService.getCrossChainTokenBalance(toToken)
            : Promise.resolve('0'),
        ]);

        setFromTokenBalance(newFromBalance);
        setToTokenBalance(newToBalance);
      } catch (error) {
        // Dismiss the loading toast if it exists
        if (pendingToastId) {
          toast.dismiss(pendingToastId);
        }

        // Update transaction status to failed
        crossChainTransactionService.updateTransactionStatus(
          transactionId,
          'failed',
          undefined,
          error instanceof Error
            ? error.message
            : 'Failed to execute cross-chain swap'
        );

        WrappedToastify.error({
          title: 'Swap Failed',
          message:
            error instanceof Error
              ? error.message
              : 'Failed to execute cross-chain swap',
        });

        // Still reload balances in case of partial completion
        try {
          crossChainSwapService.clearBalanceCache();
          await crossChainSwapService.reloadTokenBalances();

          // Wait a bit for any partial updates
          await new Promise((resolve) => setTimeout(resolve, 2000));

          // Update the UI with fresh balances
          const [newFromBalance, newToBalance] = await Promise.all([
            fromToken
              ? crossChainSwapService.getCrossChainTokenBalance(fromToken)
              : Promise.resolve('0'),
            toToken
              ? crossChainSwapService.getCrossChainTokenBalance(toToken)
              : Promise.resolve('0'),
          ]);

          setFromTokenBalance(newFromBalance);
          setToTokenBalance(newToBalance);
        } catch (balanceError) {
          console.error('Failed to reload balances after error:', balanceError);
        }
      } finally {
        // Always reset processing state
        setIsProcessingSwap(false);
      }
    };

    const isWrongChain = useMemo(() => {
      return (
        fromToken && wallet.currentChainId.toString() !== fromToken.chainId
      );
    }, [fromToken]);

    const isSwapDisabled = useMemo(() => {
      if (isWrongChain) return false; // Allow button to be clicked to switch chain
      return (
        !fromAmount ||
        !toAmount ||
        parseFloat(fromAmount) === 0 ||
        !fromToken ||
        !toToken ||
        !wallet.universalAccount ||
        isLoadingQuote
      );
    }, [
      fromAmount,
      toAmount,
      fromToken,
      toToken,
      isLoadingQuote,
      isWrongChain,
    ]);

    const [fromTokenBalance, setFromTokenBalance] = useState('0');
    const [toTokenBalance, setToTokenBalance] = useState('0');

    // Load balances when tokens change or wallet changes
    useEffect(() => {
      if (!fromToken || !wallet.account) {
        setFromTokenBalance('0');
        return;
      }

      console.log(
        `Loading balance for from token ${fromToken.symbol} on chain ${fromToken.chainId}, current wallet chain: ${wallet.currentChainId}`
      );

      // Always use getCrossChainTokenBalance for cross-chain swaps
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
    }, [fromToken]); // MobX handles wallet reactivity

    useEffect(() => {
      if (!toToken || !wallet.account) {
        setToTokenBalance('0');
        return;
      }

      console.log(
        `Loading balance for to token ${toToken.symbol} on chain ${toToken.chainId}, current wallet chain: ${wallet.currentChainId}`
      );

      // Always use getCrossChainTokenBalance for cross-chain swaps
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
    }, [toToken]); // MobX handles wallet reactivity

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
      <div className="w-full max-w-[400px] lg:w-[400px]">
        {/* Main Card */}
        <div className="bg-[#140D06] rounded-2xl border border-[#333333] shadow-xl h-fit">
          {/* Header */}
          <div className="flex items-center justify-between p-4 pb-3">
            <h2 className="text-lg font-medium text-white">Cross-Chain Swap</h2>
            <Button
              isIconOnly
              size="sm"
              variant="flat"
              className="bg-transparent text-gray-400 hover:text-white"
              onPress={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>

          <div className="px-4 pb-4 space-y-2">
            {/* From Section */}
            <div className="bg-[#271A0C] rounded-xl p-3 border border-[#333333]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">From</span>
                <div className="flex items-center gap-2">
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
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    value={fromAmount}
                    onChange={(e) => handleFromAmountChange(e.target.value)}
                    placeholder="0.00"
                    className="w-full text-2xl font-medium bg-transparent outline-none text-white placeholder-gray-600"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {isPriceLoading ? (
                      <span className="text-gray-600">Loading...</span>
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
                <div className="text-right">
                  <div className="text-xs text-gray-500">
                    <span className="text-gray-600">⚡</span>{' '}
                    {fromTokenBalance && fromTokenBalance !== '0'
                      ? parseFloat(fromTokenBalance).toFixed(6)
                      : '0.000000'}{' '}
                    {fromToken?.symbol || 'ETH'}
                  </div>
                  <button
                    className="text-xs text-[#F59E0B] cursor-pointer mt-1 hover:text-[#DC8A09] transition-colors"
                    onClick={() => {
                      console.log(
                        'Max button clicked, balance:',
                        fromTokenBalance
                      );
                      if (fromTokenBalance && fromTokenBalance !== '0') {
                        // Remove any trailing zeros and format properly
                        const cleanBalance =
                          parseFloat(fromTokenBalance).toString();
                        setFromAmount(cleanBalance);
                      }
                    }}
                  >
                    Max
                  </button>
                </div>
              </div>
            </div>

            {/* Swap Direction Button */}
            <div className="flex justify-center -my-1 relative z-10">
              <Button
                isIconOnly
                size="sm"
                className="bg-[#F59E0B] hover:bg-[#DC8A09] text-black rounded-full w-10 h-10"
                onPress={handleSwapChains}
              >
                <ArrowDown className="w-5 h-5" />
              </Button>
            </div>

            {/* To Section */}
            <div className="bg-[#271A0C] rounded-xl p-3 border border-[#333333]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">To</span>
                <div className="flex items-center gap-2">
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
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    value={toAmount}
                    readOnly
                    placeholder="0.00"
                    className="w-full text-2xl font-medium bg-transparent outline-none text-white placeholder-gray-600"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {isPriceLoading ? (
                      <span className="text-gray-600">Loading...</span>
                    ) : (
                      <>
                        $
                        {toAmount && toToken && toTokenPrice > 0
                          ? (parseFloat(toAmount) * toTokenPrice).toFixed(2)
                          : '0.00'}
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">
                    <span className="text-gray-600">⚡</span>{' '}
                    {toTokenBalance && toTokenBalance !== '0'
                      ? parseFloat(toTokenBalance).toFixed(6)
                      : '0.000000'}{' '}
                    {toToken?.symbol || 'USDT'}
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Dropdown */}
            <div className="mt-3">
              <button
                onClick={() => setShowRecommended(!showRecommended)}
                className="w-full flex items-center justify-between text-sm text-gray-400 hover:text-white transition-colors p-2"
              >
                <span>Detail</span>
                <ArrowDown
                  className={`w-4 h-4 transition-transform ${
                    showRecommended ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {showRecommended && (
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-gray-500">Route:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#F59E0B]">Universal Account</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-2">
                    <span className="text-gray-500">Fee:</span>
                    <span className="text-white">
                      {quoteData?.priceImpact?.toFixed(2) || '1.00'}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-2">
                    <span className="text-gray-500">Minimum Received:</span>
                    <span className="text-white">
                      {toAmount && parseFloat(toAmount) > 0
                        ? (parseFloat(toAmount) * 0.99).toFixed(2)
                        : '1,238'}{' '}
                      {toToken?.symbol || 'HONEY'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-2">
                    <span className="text-gray-500">Slippage Tolerance:</span>
                    <span className="text-white">{slippage}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Settings Panel - Hidden for now */}
            {showSettings && (
              <div className="bg-[#271A0C] rounded-xl p-3 border border-[#333333] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Slippage Tolerance
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant={slippage === '0.5' ? 'flat' : 'light'}
                      className={
                        slippage === '0.5'
                          ? 'bg-[#F59E0B] text-black text-xs h-6'
                          : 'text-gray-400 text-xs h-6'
                      }
                      onPress={() => setSlippage('0.5')}
                    >
                      0.5%
                    </Button>
                    <Button
                      size="sm"
                      variant={slippage === '1.0' ? 'flat' : 'light'}
                      className={
                        slippage === '1.0'
                          ? 'bg-[#F59E0B] text-black text-xs h-6'
                          : 'text-gray-400 text-xs h-6'
                      }
                      onPress={() => setSlippage('1.0')}
                    >
                      1.0%
                    </Button>
                    <Button
                      size="sm"
                      variant={slippage === '3.0' ? 'flat' : 'light'}
                      className={
                        slippage === '3.0'
                          ? 'bg-[#F59E0B] text-black text-xs h-6'
                          : 'text-gray-400 text-xs h-6'
                      }
                      onPress={() => setSlippage('3.0')}
                    >
                      3.0%
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Swap Button */}
            <Button
              className="w-full h-12 bg-[#F59E0B] hover:bg-[#DC8A09] text-black font-semibold text-base rounded-xl mt-3"
              isDisabled={isSwapDisabled || isProcessingSwap}
              onPress={isWrongChain ? handleSwitchChain : handleSwap}
              isLoading={isProcessingSwap}
            >
              {isProcessingSwap
                ? 'Processing Swap...'
                : isLoadingQuote
                ? 'Getting Quote...'
                : isWrongChain
                ? `Switch to ${fromChain?.displayName || fromChain?.chain.name}`
                : 'Swap'}
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

export default CrossChainSwapCard;
