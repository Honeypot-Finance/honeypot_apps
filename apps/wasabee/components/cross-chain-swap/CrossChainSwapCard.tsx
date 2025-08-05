import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Button } from '@nextui-org/react';
import { wallet } from '@honeypot/shared/lib/wallet';
import { DynamicFormatAmount, Token } from '@honeypot/shared';
import { ArrowDown, Settings, RefreshCw, Info } from 'lucide-react';
import ChainSelector from './ChainSelector';
import TokenSelector from './TokenSelector';
import { crossChainSwapService } from '@/services/crossChainSwap';
import RoutePreview from './RoutePreview';
import { zeroAddress } from 'viem';
import Image from 'next/image';
import { particleIcon } from '@honeypot/shared/assets/images/partners';
import { BigNumber } from 'bignumber.js';
import { toast } from 'react-toastify';
import { WrappedToastify } from '@honeypot/shared';
import { getUniversalTokenMetadata } from '../../config/universalTokenMetadata';

interface CrossChainSwapCardProps {
  onSwapSuccess?: () => void;
}

const CrossChainSwapCard: React.FC<CrossChainSwapCardProps> = observer(({ onSwapSuccess }) => {
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [slippage, setSlippage] = useState('1.0');

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
    universalAccountBalance
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
    if (!fromAmount || !fromToken || !toToken || parseFloat(fromAmount) === 0) {
      setToAmount('');
      return;
    }

    setIsLoadingQuote(true);
    try {
      // Simulate quote calculation - in real implementation, this would call the Universal Account API
      const quote = await crossChainSwapService.getQuote(fromAmount);
      setToAmount(quote.toAmount);
    } catch (error) {
      console.error('Failed to get quote:', error);
      setToAmount('');
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

  const handleSwap = async () => {
    if (!wallet.universalAccount || !fromToken || !toToken || !fromAmount) {
      return;
    }

    try {
      const fromSymbol = getUniversalTokenMetadata(parseInt(fromToken.chainId), fromToken.address)?.symbol || fromToken.symbol || 'Unknown';
      const toSymbol = getUniversalTokenMetadata(parseInt(toToken.chainId), toToken.address)?.symbol || toToken.symbol || 'Unknown';
      
      const pendingToastId = WrappedToastify.pending({
        title: 'Processing Cross-Chain Swap...',
        message: `Swapping ${fromAmount} ${fromSymbol} to ${toSymbol}`,
      });

      // Step 1: Deposit tokens to Universal Account if needed
      if (fromToken.address !== zeroAddress) {
        await wallet.universalAccount.deposit(fromToken, fromAmount);
      }

      // Step 2: Execute the swap through Universal Account
      // For now, use a placeholder USD value
      // In real implementation, this would fetch actual token prices
      const amountInUSD = new BigNumber(fromAmount)
        .multipliedBy(1) // Placeholder: 1 USD per token
        .toFixed(2);

      await wallet.universalAccount.buyToken(toToken, amountInUSD);

      // Step 3: Withdraw tokens from Universal Account
      if (toAmount && parseFloat(toAmount) > 0) {
        await wallet.universalAccount.withdraw(toToken, toAmount);
      }

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
      wallet.universalAccount.loadUniversalAccountInfo();
    } catch (error: any) {
      WrappedToastify.error({
        title: 'Swap Failed',
        message: error.message || 'Failed to execute cross-chain swap',
      });
    }
  };

  const isSwapDisabled = useMemo(() => {
    return !fromAmount || 
           !toAmount || 
           parseFloat(fromAmount) === 0 || 
           !fromToken || 
           !toToken ||
           !wallet.universalAccount ||
           isLoadingQuote;
  }, [fromAmount, toAmount, fromToken, toToken, isLoadingQuote]);

  const fromTokenBalance = useMemo(() => {
    if (!fromToken) return '0';
    return fromToken.balanceFormatted || '0';
  }, [fromToken]);

  const toTokenBalance = useMemo(() => {
    if (!toToken) return '0';
    return toToken.balanceFormatted || '0';
  }, [toToken]);

  // Ensure we have chains before rendering
  if (!fromChain || !toChain) {
    return (
      <div className="w-full max-w-[480px] mx-auto">
        <div className="bg-[#1a1a1a] rounded-3xl border border-[#2a2a2a] shadow-2xl p-6">
          <div className="text-center text-gray-400">
            Loading chains...
          </div>
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
          <h2 className="text-xl font-semibold text-white">Cross-Chain Swap</h2>
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
                  ≈ ${fromAmount ? (parseFloat(fromAmount) * 1).toFixed(2) : '0.00'}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <ChainSelector
                  value={fromChain}
                  onChange={setFromChain}
                  variant="dark"
                />
                <TokenSelector
                  chainId={fromChain?.chainId || 0}
                  value={fromToken || undefined}
                  onChange={setFromToken}
                  variant="dark"
                />
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
                  ≈ ${toAmount ? (parseFloat(toAmount) * 1).toFixed(2) : '0.00'}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <ChainSelector
                  value={toChain}
                  onChange={setToChain}
                  variant="dark"
                />
                <TokenSelector
                  chainId={toChain?.chainId || 0}
                  value={toToken || undefined}
                  onChange={setToToken}
                  variant="dark"
                />
              </div>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="bg-[#141414] rounded-2xl p-4 border border-[#2a2a2a] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Slippage Tolerance</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={slippage === '0.5' ? 'flat' : 'light'}
                    className={slippage === '0.5' ? 'bg-[#2a2a2a] text-white' : 'text-gray-400'}
                    onPress={() => setSlippage('0.5')}
                  >
                    0.5%
                  </Button>
                  <Button
                    size="sm"
                    variant={slippage === '1.0' ? 'flat' : 'light'}
                    className={slippage === '1.0' ? 'bg-[#2a2a2a] text-white' : 'text-gray-400'}
                    onPress={() => setSlippage('1.0')}
                  >
                    1.0%
                  </Button>
                  <Button
                    size="sm"
                    variant={slippage === '3.0' ? 'flat' : 'light'}
                    className={slippage === '3.0' ? 'bg-[#2a2a2a] text-white' : 'text-gray-400'}
                    onPress={() => setSlippage('3.0')}
                  >
                    3.0%
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Route Preview */}
          {fromToken && toToken && fromAmount && toAmount && (
            <RoutePreview
              fromToken={fromToken}
              toToken={toToken}
              fromAmount={fromAmount}
              toAmount={toAmount}
              fromChain={fromChain}
              toChain={toChain}
              variant="dark"
            />
          )}

          {/* Swap Button */}
          <Button
            className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-lg"
            isDisabled={isSwapDisabled}
            onPress={handleSwap}
          >
            {isLoadingQuote ? 'Getting Quote...' : 'Swap'}
          </Button>

          {/* Universal Account Info */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Info className="w-4 h-4" />
              <span>Universal Account Balance</span>
            </div>
            <span className="text-white font-medium">
              ${DynamicFormatAmount({
                amount: universalAccountBalance,
                decimals: 2
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Powered By */}
      <div className="flex items-center justify-center gap-2 mt-4 opacity-60">
        <Image
          src={particleIcon.default}
          alt="particle"
          width={20}
          height={20}
          className="opacity-70"
        />
        <span className="text-xs text-gray-500">Powered by Particle Network</span>
      </div>
    </div>
  );
});

export default CrossChainSwapCard;