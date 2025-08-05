import React from 'react';
import { Button, Popover, PopoverTrigger, PopoverContent } from '@nextui-org/react';
import { ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { observer } from 'mobx-react-lite';
import { Network } from '@honeypot/shared';
import { crossChainSwapService } from '@/services/crossChainSwap';

interface ChainSelectorProps {
  value: Network | null;
  onChange: (chain: Network) => void;
  label?: string;
  variant?: 'light' | 'dark';
}

const ChainSelector: React.FC<ChainSelectorProps> = observer(({ value, onChange, label, variant = 'light' }) => {
  // Get chains that support Universal Account from the service
  const supportedChains = crossChainSwapService.availableChains;

  const isDark = variant === 'dark';

  if (!value) {
    return (
      <Button
        variant="flat"
        size="sm"
        className={`min-w-[140px] justify-between ${
          isDark 
            ? 'bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white border-[#3a3a3a]' 
            : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
        }`}
        disabled
      >
        <span className="text-sm">Loading...</span>
      </Button>
    );
  }

  return (
    <Popover placement="bottom">
      <PopoverTrigger>
        <Button
          variant="flat"
          size="sm"
          className={`min-w-[140px] justify-between ${
            isDark 
              ? 'bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white border-[#3a3a3a]' 
              : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
          }`}
          endContent={<ChevronDown className="w-3 h-3" />}
        >
          <div className="flex items-center gap-2">
            <Image
              src={value.iconUrl}
              alt={value.chain.name}
              width={20}
              height={20}
              className="rounded-full"
            />
            <span className="text-sm font-medium">{value.displayName || value.chain.name}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className={`w-[200px] p-2 ${isDark ? 'bg-[#1a1a1a] border-[#2a2a2a]' : ''}`}>
        <div className="space-y-1">
          {label && (
            <div className={`px-2 py-1 text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {label}
            </div>
          )}
          {supportedChains.map((chain: Network) => (
            <Button
              key={chain.chainId}
              variant={chain.chainId === value.chainId ? "flat" : "light"}
              size="sm"
              className={`w-full justify-start ${
                chain.chainId === value.chainId 
                  ? isDark ? 'bg-[#2a2a2a] text-white' : 'bg-[#FFCD4D]'
                  : isDark ? 'hover:bg-[#2a2a2a] text-gray-300' : ''
              }`}
              onPress={() => onChange(chain)}
            >
              <div className="flex items-center gap-2">
                <Image
                  src={chain.iconUrl}
                  alt={chain.chain.name}
                  width={16}
                  height={16}
                  className="rounded-full"
                />
                <span className="text-xs">{chain.displayName || chain.chain.name}</span>
              </div>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
});

export default ChainSelector;