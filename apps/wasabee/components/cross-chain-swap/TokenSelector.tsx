import React, { useMemo, useState } from 'react';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, Input } from '@nextui-org/react';
import { ChevronDown, Search } from 'lucide-react';
import Image from 'next/image';
import { observer } from 'mobx-react-lite';
import { Token, DynamicFormatAmount } from '@honeypot/shared';
import { UniversalTokenLogo } from './UniversalTokenLogo';
import { crossChainSwapService } from '@/services/crossChainSwap';
import { getUniversalTokenMetadata } from '../../config/universalTokenMetadata';

interface TokenSelectorProps {
  chainId: number;
  value?: Token;
  onChange: (token: Token) => void;
  variant?: 'light' | 'dark';
}

const TokenSelector: React.FC<TokenSelectorProps> = observer(({ chainId, value, onChange, variant = 'light' }) => {
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
        className={`min-w-[120px] justify-between ${
          isDark 
            ? 'bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white border-[#3a3a3a]' 
            : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
        }`}
        endContent={<ChevronDown className="w-3 h-3" />}
        onPress={() => setIsOpen(true)}
      >
        {value ? (
          <div className="flex items-center gap-2">
            <UniversalTokenLogo 
              token={value}
              size={20}
            />
            <span className="text-sm font-medium">{value.symbol}</span>
          </div>
        ) : (
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Select Token</span>
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
                          {getUniversalTokenMetadata(chainId, token.address)?.symbol || token.symbol || 'Unknown'}
                        </div>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {getUniversalTokenMetadata(chainId, token.address)?.name || token.name || 
                           (token.address.slice(0, 6) + '...' + token.address.slice(-4))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {/* Don't show balance for Universal Account tokens */}
                        -
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