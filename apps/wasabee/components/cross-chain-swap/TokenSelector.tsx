import React, { useMemo, useState, useEffect } from 'react';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, Input } from '@nextui-org/react';
import { ChevronDown, Search } from 'lucide-react';
import Image from 'next/image';
import { observer } from 'mobx-react-lite';
// Avoid static imports from lazy-loaded library
// Import the actual Token type dynamically
type Token = any; // Use any to avoid type issues with lazy-loaded library
import { UniversalTokenLogo } from './UniversalTokenLogo';
import { crossChainSwapService } from '@/services/crossChainSwap';

interface TokenSelectorProps {
  chainId: number;
  value?: Token;
  onChange: (token: Token) => void;
  variant?: 'light' | 'dark';
  compact?: boolean;
}

// Component to display token balance
const TokenBalance: React.FC<{ token: Token }> = observer(({ token }) => {
  const [balance, setBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    let mounted = true;
    
    const loadBalance = async () => {
      // Check if wallet is connected through the service
      const isConnected = crossChainSwapService.isWalletConnected();
      if (!token || !isConnected) {
        if (mounted) {
          setBalance('0');
          setIsLoading(false);
        }
        return;
      }
      
      console.log(`Loading balance for token ${token.symbol} (${token.address}) on chain ${token.chainId}`);
      setIsLoading(true);
      
      try {
        const bal = await crossChainSwapService.getCrossChainTokenBalance(token);
        console.log(`Got balance for ${token.symbol}: ${bal}`);
        if (mounted) {
          setBalance(bal || '0');
        }
      } catch (err) {
        console.warn('Failed to load balance:', err);
        if (mounted) {
          setBalance('0');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadBalance();
    
    // Also reload on a timer to catch updates
    const interval = setInterval(loadBalance, 10000); // Refresh every 10 seconds
    
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [token?.address, token?.chainId]); // Re-load when token changes
  
  // Format the balance for display
  const formatBalance = (bal: string) => {
    const numBal = parseFloat(bal);
    if (isNaN(numBal) || numBal === 0) return '0';
    
    // Format based on size
    if (numBal >= 1000000) {
      return `${(numBal / 1000000).toFixed(2)}M`;
    } else if (numBal >= 1000) {
      return `${(numBal / 1000).toFixed(2)}K`;
    } else if (numBal >= 1) {
      return numBal.toFixed(2);
    } else if (numBal >= 0.0001) {
      return numBal.toFixed(4);
    } else if (numBal > 0) {
      return '<0.0001';
    }
    return '0';
  };
  
  return <span>{isLoading ? '...' : formatBalance(balance)}</span>;
});

const TokenSelector: React.FC<TokenSelectorProps> = observer(({ chainId, value, onChange, variant = 'light', compact = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isDark = variant === 'dark';

  // Get tokens for the selected chain from Universal Account
  const availableTokens = useMemo(() => {
    // Get tokens from Universal Account service
    const tokens = crossChainSwapService.getAvailableTokensForChain(chainId);

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return tokens.filter(token => 
        token.symbol.toLowerCase().includes(query) ||
        token.name.toLowerCase().includes(query) ||
        token.address.toLowerCase().includes(query)
      );
    }

    return tokens;
  }, [chainId, searchQuery]);

  const handleSelectToken = (token: Token) => {
    onChange(token);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      <Button
        variant="flat"
        size="sm"
        className={`${compact ? 'min-w-[80px] px-2' : 'w-full sm:w-auto sm:min-w-[120px]'} justify-between ${
          isDark 
            ? 'bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white border-[#3a3a3a]' 
            : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
        }`}
        endContent={<ChevronDown className="w-3 h-3" />}
        onPress={() => setIsOpen(true)}
      >
        {value ? (
          <div className="flex items-center gap-1 sm:gap-2">
            <UniversalTokenLogo 
              token={value}
              size={20}
            />
            <span className="text-xs sm:text-sm font-medium">{value.symbol}</span>
          </div>
        ) : (
          <span className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{compact ? 'Token' : 'Select Token'}</span>
        )}
      </Button>

      <Modal 
        isOpen={isOpen} 
        onClose={() => {
          setIsOpen(false);
          setSearchQuery('');
        }}
        size="md"
        scrollBehavior="inside"
        classNames={{
          base: isDark ? "bg-[#1a1a1a] text-white" : "",
          header: isDark ? "border-b border-[#2a2a2a]" : "",
          body: isDark ? "bg-[#1a1a1a]" : "",
          closeButton: isDark ? "text-gray-400 hover:text-white" : ""
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Select a Token
          </ModalHeader>
          <ModalBody className="px-4 pb-4">
            {/* Search Input */}
            <Input
              placeholder="Search by name, symbol or address"
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<Search className="w-4 h-4 text-gray-400" />}
              classNames={{
                input: `text-sm ${isDark ? "text-white" : ""}`,
                inputWrapper: isDark 
                  ? "bg-[#2a2a2a] border-[#3a3a3a] hover:border-[#4a4a4a]" 
                  : "bg-gray-50 border border-gray-200"
              }}
            />

            {/* Token List */}
            <div className="mt-4 space-y-1 max-h-[400px] overflow-y-auto">
              {availableTokens.length > 0 ? (
                availableTokens.map((token) => (
                  <Button
                    key={token.address}
                    variant={value?.address === token.address ? "flat" : "light"}
                    className={`w-full justify-between h-auto py-3 px-3 ${
                      value?.address === token.address 
                        ? isDark ? 'bg-[#2a2a2a]' : 'bg-[#FFCD4D]'
                        : isDark ? 'hover:bg-[#2a2a2a]' : 'hover:bg-gray-50'
                    }`}
                    onPress={() => handleSelectToken(token)}
                  >
                    <div className="flex items-center gap-3">
                      <UniversalTokenLogo 
                        token={token}
                        size={32}
                      />
                      <div className="text-left">
                        <div className="font-medium text-sm">
                          {token.symbol || 'Unknown'}
                        </div>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {token.name || (token.address.slice(0, 6) + '...' + token.address.slice(-4))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        <TokenBalance token={token} />
                      </div>
                      {/* Price display placeholder */}
                    </div>
                  </Button>
                ))
              ) : (
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No tokens found
                </div>
              )}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
});

export default TokenSelector;