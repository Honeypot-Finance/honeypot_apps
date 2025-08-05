import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Tooltip } from '@nextui-org/react';
import { wallet } from '@honeypot/shared/lib/wallet';
import { DynamicFormatAmount, Token, networks } from '@honeypot/shared';
import {
  ArrowDown,
  Settings,
  RefreshCw,
  Info,
  ExternalLink,
} from 'lucide-react';
import ChainSelector from './ChainSelector';
import TokenSelector from './TokenSelector';
import { crossChainSwapService } from '@/services/crossChainSwap';
import { crossChainTransactionService } from '@/services/crossChainTransactionService';
import RoutePreview from './RoutePreview';
import Image from 'next/image';
import { particleIcon } from '@honeypot/shared/assets/images/partners';
import { toast } from 'react-toastify';
import { WrappedToastify } from '@honeypot/shared';

interface CrossChainSwapCardProps {
  onSwapSuccess?: () => void;
}

const CrossChainSwapCard: React.FC<CrossChainSwapCardProps> = observer(
  ({ onSwapSuccess }) => {
    const [fromAmount, setFromAmount] = useState('');
    const [toAmount, setToAmount] = useState('');
    const [isLoadingQuote, setIsLoadingQuote] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
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
      swapChains,
      universalAccountBalance,
    } = crossChainSwapService;

    // Load universal account info when wallet connects
    useEffect(() => {
      if (wallet.universalAccount && wallet.isInit) {
        wallet.universalAccount.loadUniversalAccountInfo();
      }
      // Also ensure chains are initialized
      crossChainSwapService.initializeChains();
    }, [wallet.universalAccount, wallet.isInit]);

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
          feeInUSD: quote.feeInUSD
        });
        
        // If we have USD value, try to get more accurate fee preview
        if (quote.toAmount && wallet.universalAccount) {
          const fromTokenPrice = 1; // This should come from price feed
          const usdValue = (parseFloat(fromAmount) * fromTokenPrice).toFixed(2);
          
          const preview = await crossChainSwapService.getTransactionPreview(usdValue);
          if (preview && preview.feeInUSD) {
            setQuoteData(prev => ({
              ...prev!,
              feeInUSD: preview.feeInUSD
            }));
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
      } catch (error: any) {
        console.error('Failed to switch chain:', error);
        WrappedToastify.error({
          title: 'Failed to switch chain',
          message: error.message || 'Please switch chain manually in your wallet',
        });
      }
    };

    const handleSwap = async () => {
      if (!wallet.universalAccount || !fromToken || !toToken || !fromAmount) {
        return;
      }
      
      // Double check we're on the right chain
      if (isWrongChain) {
        await handleSwitchChain();
        return;
      }

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

      try {
        const pendingToastId = WrappedToastify.pending({
          title: 'Processing Cross-Chain Swap...',
          message: `Swapping ${fromAmount} ${
            fromToken.symbol || 'Unknown'
          } to ${toToken.symbol || 'Unknown'}`,
        });

        // Step 1: Create the universal transaction
        const swapResult = await crossChainSwapService.executeSwap(fromAmount, toAmount);
        const { transaction } = swapResult;

        // Step 2: Sign the transaction with the wallet
        if (!wallet.walletClient) {
          throw new Error('Wallet not connected');
        }

        // Get the root hash that needs to be signed
        const rootHash = transaction.rootHash;
        
        // Sign the root hash
        const signature = await wallet.walletClient.signMessage({
          account: wallet.account as `0x${string}`,
          message: rootHash,
        });

        // Step 3: Send the signed transaction
        const result = await crossChainSwapService.sendSwapTransaction(
          transaction,
          signature
        );

        // Get transaction hash from result
        const txHash = result.transactionHash || result.hash || '0x...';

        // Update transaction status to completed
        crossChainTransactionService.updateTransactionStatus(
          transactionId, 
          'completed', 
          txHash
        );

        WrappedToastify.success({
          title: 'Cross-Chain Swap Successful!',
          message: `Swapped ${fromAmount} ${fromToken.symbol} to ${toAmount} ${toToken.symbol}`,
        });

        toast.dismiss(pendingToastId);

        // Reset form
        setFromAmount('');
        setToAmount('');
        onSwapSuccess?.();

        // Reload account info
        if (wallet.universalAccount.loadUniversalAccountInfo) {
          wallet.universalAccount.loadUniversalAccountInfo();
        }
      } catch (error: any) {
        // Update transaction status to failed
        crossChainTransactionService.updateTransactionStatus(
          transactionId, 
          'failed',
          undefined,
          error.message || 'Failed to execute cross-chain swap'
        );
        
        WrappedToastify.error({
          title: 'Swap Failed',
          message: error.message || 'Failed to execute cross-chain swap',
        });
      }
    };

    const isWrongChain = useMemo(() => {
      return fromToken && wallet.currentChainId.toString() !== fromToken.chainId;
    }, [fromToken]);

    const isSwapDisabled = useMemo(() => {
      return (
        !fromAmount ||
        !toAmount ||
        parseFloat(fromAmount) === 0 ||
        !fromToken ||
        !toToken ||
        !wallet.universalAccount ||
        isLoadingQuote ||
        isWrongChain
      );
    }, [fromAmount, toAmount, fromToken, toToken, isLoadingQuote, isWrongChain]);

    const [fromTokenBalance, setFromTokenBalance] = useState('0');
    const [toTokenBalance, setToTokenBalance] = useState('0');

    // Load balances when tokens change or wallet changes
    useEffect(() => {
      if (!fromToken) {
        setFromTokenBalance('0');
        return;
      }
      
      console.log(`Loading balance for from token ${fromToken.symbol} on chain ${fromToken.chainId}`);
      
      crossChainSwapService.getCrossChainTokenBalance(fromToken)
        .then(balance => {
          console.log(`Got from token balance: ${balance}`);
          setFromTokenBalance(balance);
        })
        .catch(err => {
          console.warn('Failed to load from token balance:', err);
          setFromTokenBalance('0');
        });
    }, [fromToken]); // Re-render when fromToken changes, wallet changes handled by MobX

    useEffect(() => {
      if (!toToken) {
        setToTokenBalance('0');
        return;
      }
      
      console.log(`Loading balance for to token ${toToken.symbol} on chain ${toToken.chainId}`);
      
      crossChainSwapService.getCrossChainTokenBalance(toToken)
        .then(balance => {
          console.log(`Got to token balance: ${balance}`);
          setToTokenBalance(balance);
        })
        .catch(err => {
          console.warn('Failed to load to token balance:', err);
          setToTokenBalance('0');
        });
    }, [toToken]); // Re-render when toToken changes, wallet changes handled by MobX

    // Ensure we have chains before rendering
    if (!fromChain || !toChain) {
      return (
        <div className="w-full max-w-[480px] mx-auto">
          <div className="bg-[#1a1a1a] rounded-3xl border border-[#2a2a2a] shadow-2xl p-6">
            <div className="text-center text-gray-400">Loading chains...</div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full max-w-[480px] mx-auto">
        {/* Main Card */}
        <div className="bg-[#1a1a1a] rounded-3xl border border-[#2a2a2a] shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-0">
            <h2 className="text-xl font-semibold text-white">
              Cross-Chain Swap
            </h2>
            <div className="flex items-center gap-2">
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                className="bg-[#2a2a2a] text-gray-400 hover:text-white"
                onPress={() => handleQuoteUpdate()}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                className="bg-[#2a2a2a] text-gray-400 hover:text-white"
                onPress={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="p-6 space-y-3">
            {/* From Section */}
            <div className="bg-[#141414] rounded-2xl p-4 border border-[#2a2a2a]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">From</span>
                <span className="text-xs text-gray-500">
                  Balance: {fromTokenBalance}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    value={fromAmount}
                    onChange={(e) => handleFromAmountChange(e.target.value)}
                    placeholder="0.0"
                    className="w-full text-3xl font-medium bg-transparent outline-none text-white placeholder-gray-600"
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    ≈ $
                    {fromAmount
                      ? (parseFloat(fromAmount) * 1).toFixed(2)
                      : '0.00'}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <ChainSelector
                    value={fromChain}
                    onChange={setFromChain}
                    variant="dark"
                  />
                  <div className="flex items-center gap-1">
                    <TokenSelector
                      chainId={fromChain?.chainId || 0}
                      value={fromToken || undefined}
                      onChange={setFromToken}
                      variant="dark"
                    />
                    {fromToken && (
                      <Tooltip content="View on Explorer" placement="top">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="flat"
                          className="bg-[#2a2a2a] text-gray-400 hover:text-white min-w-unit-8 w-8 h-8"
                          onPress={() => {
                            const network = networks.find(
                              (n) => n.chainId === fromChain.chainId
                            );
                            if (network) {
                              const url =
                                network.getTokenExplorerUrl(fromToken);
                              if (url !== '#') {
                                window.open(url, '_blank');
                              }
                            }
                          }}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Swap Direction Button */}
            <div className="flex justify-center -my-2 relative z-10">
              <Button
                isIconOnly
                size="sm"
                className="bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white border border-[#3a3a3a]"
                onPress={handleSwapChains}
              >
                <ArrowDown className="w-4 h-4" />
              </Button>
            </div>

            {/* To Section */}
            <div className="bg-[#141414] rounded-2xl p-4 border border-[#2a2a2a]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">To (Estimated)</span>
                <span className="text-xs text-gray-500">
                  Balance: {toTokenBalance}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    value={toAmount}
                    readOnly
                    placeholder="0.0"
                    className="w-full text-3xl font-medium bg-transparent outline-none text-white placeholder-gray-600"
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    ≈ $
                    {toAmount ? (parseFloat(toAmount) * 1).toFixed(2) : '0.00'}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <ChainSelector
                    value={toChain}
                    onChange={setToChain}
                    variant="dark"
                  />
                  <div className="flex items-center gap-1">
                    <TokenSelector
                      chainId={toChain?.chainId || 0}
                      value={toToken || undefined}
                      onChange={setToToken}
                      variant="dark"
                    />
                    {toToken && (
                      <Tooltip content="View on Explorer" placement="top">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="flat"
                          className="bg-[#2a2a2a] text-gray-400 hover:text-white min-w-unit-8 w-8 h-8"
                          onPress={() => {
                            const network = networks.find(
                              (n) => n.chainId === toChain.chainId
                            );
                            if (network) {
                              const url = network.getTokenExplorerUrl(toToken);
                              if (url !== '#') {
                                window.open(url, '_blank');
                              }
                            }
                          }}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <div className="bg-[#141414] rounded-2xl p-4 border border-[#2a2a2a] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    Slippage Tolerance
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={slippage === '0.5' ? 'flat' : 'light'}
                      className={
                        slippage === '0.5'
                          ? 'bg-[#2a2a2a] text-white'
                          : 'text-gray-400'
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
                          ? 'bg-[#2a2a2a] text-white'
                          : 'text-gray-400'
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
                          ? 'bg-[#2a2a2a] text-white'
                          : 'text-gray-400'
                      }
                      onPress={() => setSlippage('3.0')}
                    >
                      3.0%
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Route Preview */}
            {fromToken && toToken && fromAmount && toAmount && fromChain && toChain && (
              <RoutePreview
                fromToken={fromToken}
                toToken={toToken}
                fromAmount={fromAmount}
                toAmount={toAmount}
                fromChain={fromChain}
                toChain={toChain}
                variant="dark"
                priceImpact={quoteData?.priceImpact}
                estimatedTime={quoteData?.estimatedTime}
                feeInUSD={quoteData?.feeInUSD}
              />
            )}

            {/* Swap Button */}
            <Button
              className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-lg"
              isDisabled={isSwapDisabled && !isWrongChain}
              onPress={isWrongChain ? handleSwitchChain : handleSwap}
            >
              {isLoadingQuote ? 'Getting Quote...' : 
               isWrongChain ? `Switch to ${fromChain?.displayName || fromChain?.chain.name}` : 
               'Swap'}
            </Button>

            {/* Universal Account Info */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Info className="w-4 h-4" />
                <span>Universal Account Balance</span>
              </div>
              <span className="text-white font-medium">
                $
                {DynamicFormatAmount({
                  amount: universalAccountBalance,
                  decimals: 2,
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default CrossChainSwapCard;
