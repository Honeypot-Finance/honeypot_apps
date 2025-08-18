import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Button } from '@/components/algebra/ui/button';
import { wallet } from '@honeypot/shared/lib/wallet';
import { Settings, Wallet2 } from 'lucide-react';
import Image from 'next/image';
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
    const [showDetail, setShowDetail] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [slippage, setSlippage] = useState('1.0');
    const [isLoadingQuote, setIsLoadingQuote] = useState(false);
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
                  if (res.status === 'success' && res.data && res.data.price) {
                    const price =
                      typeof res.data.price === 'string'
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
                    console.log(
                      `  Response data:`,
                      res.status === 'success' ? res.data : 'No data'
                    );
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
                  if (res.status === 'success' && res.data && res.data.price) {
                    const price =
                      typeof res.data.price === 'string'
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
                    console.log(
                      `  Response data:`,
                      res.status === 'success' ? res.data : 'No data'
                    );
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

    const handleSimulateSwap = async () => {
      if (!wallet.account) {
        WrappedToastify.error({
          title: 'Wallet not connected',
          message: 'Please connect your wallet to simulate',
        });
        return;
      }

      if (!fromAmount || parseFloat(fromAmount) === 0) {
        WrappedToastify.error({
          title: 'Invalid amount',
          message: 'Please enter a valid amount to simulate',
        });
        return;
      }

      const loadingToast = toast.loading('Simulating swap...');

      try {
        // Debug current state
        crossChainSwapService.debugState();

        // Run simulation
        const simulation = await crossChainSwapService.simulateSwap(fromAmount);

        toast.dismiss(loadingToast);

        if (simulation.success) {
          WrappedToastify.success({
            title: 'Simulation Successful',
            message: (
              <div>
                <p>✅ Swap can proceed</p>
                {simulation.estimatedFees && (
                  <p>Estimated fees: ${simulation.estimatedFees}</p>
                )}
                {simulation.warnings.length > 0 && (
                  <div className="mt-2">
                    <p className="font-semibold">Warnings:</p>
                    {simulation.warnings.map((w, i) => (
                      <p key={i} className="text-sm">
                        ⚠️ {w}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ),
            options: { autoClose: 8000 },
          });
        } else {
          WrappedToastify.error({
            title: 'Simulation Failed',
            message: (
              <div>
                {simulation.errors.map((e, i) => (
                  <p key={i}>❌ {e}</p>
                ))}
              </div>
            ),
            options: { autoClose: 10000 },
          });
        }

        console.log('Simulation details:', simulation.details);
      } catch (error) {
        toast.dismiss(loadingToast);
        WrappedToastify.error({
          title: 'Simulation Error',
          message:
            error instanceof Error ? error.message : 'Failed to simulate swap',
        });
      }
    };

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

      // Add enhanced logging
      console.log('\n🚀 STARTING CROSS-CHAIN SWAP');
      console.log('=====================================');
      crossChainSwapService.debugState();
      console.log('Swap parameters:', {
        fromAmount,
        toAmount,
        fromToken: fromToken.symbol,
        toToken: toToken.symbol,
        fromChain: fromChain?.chainId,
        toChain: toChain?.chainId,
      });
      console.log('=====================================\n');

      // Check if Universal Account is properly initialized
      if (!wallet.universalAccount.universalAccount) {
        WrappedToastify.error({
          title: 'Universal Account Not Ready',
          message:
            'Please wait for the Universal Account to initialize and try again.',
        });

        // Try to initialize it
        try {
          await wallet.universalAccount.loadUniversalAccountInfo();
        } catch (error) {
          console.error('Failed to initialize Universal Account:', error);
        }
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
        const messageToSign = transaction.id || 'cross-chain-swap';

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
          result.transactionHash || (result as any).depositTxHash || '0x...';

        // Dismiss the loading toast only after the transaction completes
        if (pendingToastId) {
          toast.dismiss(pendingToastId);
        }

        // Update transaction status based on result
        if (result.status === 'completed') {
          // Use withdrawalTxId if available, otherwise use transferTxId
          const finalTxId =
            (result as { withdrawalTxId?: string; transferTxId?: string })
              .withdrawalTxId ||
            (result as { withdrawalTxId?: string; transferTxId?: string })
              .transferTxId;

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
        } else if (result.status === 'refunded') {
          // Handle refund case
          crossChainTransactionService.updateTransactionStatus(
            transactionId,
            'failed',
            txHash,
            `Refunded due to ${
              (result as any).originalError || 'high gas fees'
            }`
          );

          WrappedToastify.info({
            title: 'Swap Cancelled - Funds Refunded',
            message: (
              <div>
                <p>{result.message}</p>
                <p className="text-sm mt-2 text-gray-400">
                  Reason: {(result as any).originalError || 'High gas fees'}
                </p>
                <p className="text-sm mt-1 text-gray-400">
                  Try again with a smaller amount or when gas fees are lower.
                </p>
              </div>
            ),
            options: {
              autoClose: 10000, // Keep visible longer
            },
          });

          // Reset form after refund
          setFromAmount('');
          setToAmount('');

          // Reload balances to reflect refund
          await crossChainSwapService.reloadTokenBalances();
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

          const pendingMessage = (
            <div>
              <p>{result.message}</p>
              {(result as { universalTxUrl?: string }).universalTxUrl && (
                <a
                  href={(result as { universalTxUrl?: string }).universalTxUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline mt-2 inline-block"
                >
                  Check status on Universal Account
                </a>
              )}
              <p className="text-sm mt-2 text-gray-400">
                💡 Tip: The conversion usually takes 1-3 minutes. You can
                withdraw manually from the Universal Account once complete.
              </p>
            </div>
          );

          WrappedToastify.info({
            title: '⏳ Conversion in Progress',
            message: pendingMessage,
            options: {
              autoClose: 15000, // Keep visible longer for important info
            },
          });
        } else {
          // For any other status, still update transaction and show generic success
          // This shouldn't happen with current logic but acts as a fallback
          const universalTxId =
            (result as { tx?: { id?: string }; transactionId?: string })?.tx
              ?.id ||
            (result as { tx?: { id?: string }; transactionId?: string })
              ?.transactionId;
          crossChainTransactionService.updateTransactionStatus(
            transactionId,
            'completed',
            txHash,
            undefined,
            universalTxId
          );

          WrappedToastify.success({
            title: 'Swap Completed!',
            message: `Successfully swapped ${fromAmount} ${
              fromToken.symbol || 'Unknown'
            } to ${toToken.symbol || 'Unknown'}`,
          });
        }

        // Common cleanup for all successful cases (including refunds and pending)
        if (
          result.status === 'completed' ||
          result.status === 'refunded' ||
          result.status === 'pending_withdrawal'
        ) {
          // Reset form for all cases
          setFromAmount('');
          setToAmount('');

          // Call success callback for completed cases
          if (result.status === 'completed') {
            onSwapSuccess?.();
          }

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
        }
      } catch (error) {
        // Dismiss the loading toast if it exists
        if (pendingToastId) {
          toast.dismiss(pendingToastId);
        }

        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to execute cross-chain swap';

        // Check if it's a refund scenario (funds were returned)
        const isRefunded =
          errorMessage.includes('has been refunded') ||
          errorMessage.includes('✅');
        const isHighGasError =
          errorMessage.toLowerCase().includes('high gas fee') ||
          errorMessage.toLowerCase().includes('gas prices');

        // Update transaction status based on error type
        if (isRefunded) {
          crossChainTransactionService.updateTransactionStatus(
            transactionId,
            'failed',
            undefined,
            'Refunded due to high gas fees'
          );

          // Show info notification for refund
          WrappedToastify.info({
            title: 'Swap Cancelled - Funds Refunded',
            message: errorMessage,
            options: {
              autoClose: 10000, // Keep visible longer for important info
            },
          });
        } else if (isHighGasError) {
          crossChainTransactionService.updateTransactionStatus(
            transactionId,
            'failed',
            undefined,
            'High gas fees - funds in Universal Account'
          );

          // Show warning notification for funds in Universal Account
          WrappedToastify.warn({
            title: 'Swap Failed - Manual Recovery Needed',
            message: errorMessage,
            options: {
              autoClose: 15000, // Keep visible even longer
            },
          });
        } else {
          // Regular error
          crossChainTransactionService.updateTransactionStatus(
            transactionId,
            'failed',
            undefined,
            errorMessage
          );

          WrappedToastify.error({
            title: 'Swap Failed',
            message: errorMessage,
            options: {
              autoClose: 8000,
            },
          });
        }

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

    // Create a reactive chain ID variable that triggers effects
    const currentChainId = wallet.currentChainId;

    // Load balances when tokens change or wallet/chain changes
    useEffect(() => {
      if (!fromToken || !wallet.account) {
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
    }, [fromToken?.address, fromToken?.chainId, fromChain?.chainId]); // Re-fetch when token address, chainId or chain changes

    useEffect(() => {
      if (!toToken || !wallet.account) {
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
    }, [toToken?.address, toToken?.chainId, toChain?.chainId]); // Re-fetch when token address, chainId or chain changes

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
            <button
              className="rounded-[1rem] bg-[#2A1F14] hover:bg-[#3A2F24] transition-colors p-2"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-5 h-5 text-gray-400" />
            </button>
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
                    value={toAmount}
                    readOnly
                    placeholder="0.00"
                    className="w-full text-xl sm:text-2xl font-medium bg-transparent outline-none text-white placeholder-gray-600"
                  />
                  <div className="text-xs text-[#998877] mt-1">
                    {isPriceLoading ? (
                      <span className="text-[#665544]">Loading...</span>
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
                <div className="flex items-center justify-end">
                  <div className="flex items-center text-xs text-[#E7CDB1]">
                    <Wallet2 className="w-3 h-3 mr-1" />
                    {toTokenBalance} {toToken?.symbol || 'USDT'}
                  </div>
                </div>
              </div>
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

            {/* Detail Section */}
            <div className="mt-3">
              <button
                className="w-full text-sm text-gray-500 hover:text-gray-400 flex items-center justify-between px-1"
                onClick={() => setShowDetail(!showDetail)}
              >
                <span>Detail</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    showDetail ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showDetail && toAmount && (
                <div className="mt-2 bg-[#1F1409]/50 rounded-xl p-3 border border-[#2a2318]/50 space-y-2">
                  <div className="text-sm font-medium text-[#E7CDB1] mb-2">
                    Recommended
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-[#998877]">Fee:</span>
                    <span className="text-[#E7CDB1]">1.00%</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-[#998877]">LP Fee:</span>
                    <span className="text-[#E7CDB1]">
                      {(parseFloat(fromAmount || '0') * 0.0039).toFixed(4)}{' '}
                      {fromToken?.symbol}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-[#998877]">Minimum Received:</span>
                    <span className="text-[#E7CDB1]">
                      {(parseFloat(toAmount) * 0.99).toFixed(4)}{' '}
                      {toToken?.symbol}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-[#998877]">Slippage Tolerance:</span>
                    <span className="text-[#E7CDB1]">1.00%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-4">
              {/* Swap Button */}
              <Button
                className="w-full bg-[#FFA931] hover:bg-[#E89821] text-black font-bold py-6 rounded-2xl"
                disabled={isSwapDisabled || isProcessingSwap}
                onClick={isWrongChain ? handleSwitchChain : handleSwap}
              >
                {isProcessingSwap
                  ? 'Processing...'
                  : isLoadingQuote
                  ? 'Getting Quote...'
                  : isWrongChain
                  ? `Switch to ${fromChain?.displayName || 'Chain'}`
                  : 'Swap'}
              </Button>
            </div>
          </div>
        </div>

        {/* Universal Account Link */}
        <div className="mt-4 text-center">
          <a
            href="https://universalx.app/overview"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#F59E0B] transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            <span>View Universal Account Dashboard</span>
          </a>
          <p className="text-xs text-gray-500 mt-1">
            Manage your cross-chain assets and transactions
          </p>
        </div>
      </div>
    );
  }
);

export default CrossChainSwapCard;
