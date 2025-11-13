import React, { useMemo, useState, useEffect } from 'react';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, Input } from '@nextui-org/react';
import { ChevronDown, Search } from 'lucide-react';
import Image from 'next/image';
import { observer } from 'mobx-react-lite';
// Avoid static imports from lazy-loaded library
// Import the actual Token type dynamically
type Token = any; // Use any to avoid type issues with lazy-loaded library
import { UniversalTokenLogo } from './UniversalTokenLogo';
// Use RocketX service instead of Particle Network
import { rocketxSwapService as crossChainSwapService } from '@/services/rocketxSwapService';
import { wallet } from '@honeypot/shared/lib/wallet';

interface TokenSelectorProps {
  chainId: number;
  value?: Token;
  onChange: (token: Token) => void;
  variant?: 'light' | 'dark';
  compact?: boolean;
}

// Helper to batch load balances with rate limiting
const useTokenBalances = (tokens: Token[], chainId: number, enabled: boolean) => {
  const [balances, setBalances] = useState<Record<string, string>>({});
  const loadingRef = React.useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled || !tokens.length || !wallet.isUserConnected) {
      // Clear balances when wallet is not connected
      setBalances({});
      return;
    }

    let cancelled = false;

    // Load balances in batches of 10 with delay between batches
    const loadBalancesInBatches = async () => {
      const BATCH_SIZE = 10;
      const BATCH_DELAY = 1000; // 1 second delay between batches

      for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
        if (cancelled) break;

        const batch = tokens.slice(i, i + BATCH_SIZE);

        // Load batch concurrently
        const batchPromises = batch.map(async (token) => {
          if (cancelled) return;

          const key = `${token.chainId}-${token.address}`;

          // Skip if already loading or loaded
          if (loadingRef.current.has(key)) {
            return;
          }

          loadingRef.current.add(key);

          try {
            const balance = await crossChainSwapService.getCrossChainTokenBalance(token);
            if (!cancelled) {
              setBalances(prev => ({ ...prev, [key]: balance }));
            }
          } catch (err) {
            // Silent fail
            if (!cancelled) {
              setBalances(prev => ({ ...prev, [key]: '0' }));
            }
          } finally {
            loadingRef.current.delete(key);
          }
        });

        await Promise.all(batchPromises);

        // Wait before next batch (except for last batch)
        if (i + BATCH_SIZE < tokens.length && !cancelled) {
          await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
        }
      }
    };

    loadBalancesInBatches();

    return () => {
      cancelled = true;
    };
  }, [tokens.length, chainId, enabled, wallet.isUserConnected]); // Only depend on length, not array reference

  return balances;
};

const TokenSelector: React.FC<TokenSelectorProps> = observer(({ chainId, value, onChange, variant = 'light', compact = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allTokens, setAllTokens] = useState<Token[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);

  const isDark = variant === 'dark';

  // Load tokens asynchronously when chainId changes
  useEffect(() => {
    let mounted = true;

    const loadTokens = async () => {
      console.log(`🔄 TokenSelector: Loading tokens for chain ${chainId}`);
      setIsLoadingTokens(true);

      try {
        const tokens = await crossChainSwapService.getAvailableTokensForChain(chainId);
        console.log(`✅ TokenSelector: Loaded ${tokens.length} tokens for chain ${chainId}`);

        if (mounted) {
          setAllTokens(tokens);
        }
      } catch (error) {
        console.error(`❌ TokenSelector: Failed to load tokens for chain ${chainId}:`, error);
        if (mounted) {
          setAllTokens([]);
        }
      } finally {
        if (mounted) {
          setIsLoadingTokens(false);
        }
      }
    };

    loadTokens();

    return () => {
      mounted = false;
    };
  }, [chainId]);

  // Filter tokens by search query
  const availableTokens = useMemo(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return allTokens.filter(token =>
        token.symbol.toLowerCase().includes(query) ||
        token.name.toLowerCase().includes(query) ||
        token.address.toLowerCase().includes(query)
      );
    }

    return allTokens;
  }, [allTokens, searchQuery]);

  // Load balances for tokens in batches when modal is open
  const tokenBalances = useTokenBalances(availableTokens, chainId, isOpen);

  const handleSelectToken = (token: Token) => {
    onChange(token);
    setIsOpen(false);
    setSearchQuery('');
  };

  // Format balance for display
  const formatBalance = (balance: string) => {
    const numBal = parseFloat(balance);
    if (isNaN(numBal) || numBal === 0) return '0';

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

  return (
    <>
      <button
        className={`flex items-center justify-between gap-2 px-3 py-2 rounded-full transition-colors ${
          compact ? 'min-w-[80px] px-2' : 'w-full sm:w-auto sm:min-w-[120px]'
        } ${
          isDark 
            ? 'bg-[#FFFFFF1A]/10 hover:bg-[#FFFFFF1A]/20 text-white border border-[#86715B]' 
            : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
        }`}
        onClick={() => setIsOpen(true)}
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
        <ChevronDown className="w-3 h-3" />
      </button>

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
                    {wallet.isUserConnected && (
                      <div className="text-right">
                        <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {tokenBalances[`${token.chainId}-${token.address}`]
                            ? formatBalance(tokenBalances[`${token.chainId}-${token.address}`])
                            : '...'}
                        </div>
                      </div>
                    )}
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