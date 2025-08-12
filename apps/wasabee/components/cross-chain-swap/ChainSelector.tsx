import React, { useState } from 'react';
import {
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@nextui-org/react';
import { ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { observer } from 'mobx-react-lite';
import { crossChainSwapService } from '@/services/crossChainSwap';

// Define a minimal interface for what we need from Network
// to avoid importing from the lazy-loaded library
interface ChainInfo {
  chainId: number;
  chain: {
    name: string;
  };
  iconUrl: string;
  displayName?: string;
}

// Use generics to accept any chain type that extends our minimal interface
interface ChainSelectorProps<T extends ChainInfo = ChainInfo> {
  value: T | null;
  onChange: (chain: T) => void;
  label?: string;
  variant?: 'light' | 'dark';
  compact?: boolean;
}

function ChainSelector<T extends ChainInfo = ChainInfo>({
  value,
  onChange,
  label,
  variant = 'light',
  compact = false,
}: ChainSelectorProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  // Get chains that support Universal Account from the service
  const supportedChains = crossChainSwapService.availableChains as unknown as T[];

  const isDark = variant === 'dark';

  if (!value) {
      return (
        <Button
          variant="flat"
          size="sm"
          className={`${
            compact ? 'min-w-[80px]' : 'min-w-[140px]'
          } justify-between ${
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

  const handleChainSelect = (chain: T) => {
    onChange(chain);
    setIsOpen(false); // Close the dropdown after selection
  };

    return (
      <Popover placement="bottom" isOpen={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger>
          <Button
            variant="flat"
            size="sm"
            className={`${
              compact ? 'min-w-[80px] px-2' : 'min-w-[140px]'
            } justify-between ${
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
              {!compact && (
                <span className="text-sm font-medium">
                  {value.displayName || value.chain.name}
                </span>
              )}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={`w-[200px] p-2 ${
            isDark ? 'bg-[#140D06] border-[#2a2a2a]' : ''
          }`}
        >
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {label && (
              <div
                className={`px-2 py-1 text-xs font-medium sticky top-0 ${
                  isDark
                    ? 'text-gray-400 bg-[#140D06]'
                    : 'text-gray-500 bg-white'
                }`}
              >
                {label}
              </div>
            )}
            {supportedChains.map((chain) => (
              <Button
                key={chain.chainId}
                variant={chain.chainId === value.chainId ? 'flat' : 'light'}
                size="sm"
                className={`w-full justify-start ${
                  chain.chainId === value.chainId
                    ? isDark
                      ? 'bg-[#2a2a2a] text-white'
                      : 'bg-[#FFCD4D]'
                    : isDark
                    ? 'hover:bg-[#2a2a2a] text-gray-300'
                    : ''
                }`}
                onPress={() => handleChainSelect(chain)}
              >
                <div className="flex items-center gap-2">
                  <Image
                    src={chain.iconUrl}
                    alt={chain.chain.name}
                    width={16}
                    height={16}
                    className="rounded-full"
                  />
                  <span className="text-xs">
                    {chain.displayName || chain.chain.name}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
}

// Wrap with observer and export
export default observer(ChainSelector) as typeof ChainSelector;
