import { observer } from 'mobx-react-lite';
import { wallet } from '@honeypot/shared/lib/wallet';
import { useEffect, useState, useMemo } from 'react';
import {
  Link,
  Skeleton,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@nextui-org/react';
import { portfolio } from '@/services/portfolio';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { TokenBalanceCard } from '@/components/TokenBalanceCard/TokenBalanceCard';
import { Button } from '@/components/button/button-next';
import Image from 'next/image';
import rhinoLogo from '@/public/images/partners/rhino-finance-logo.svg';
import { ChevronDown } from 'lucide-react';
import { TokenLogo } from '@honeypot/shared';
import { profileDataCache } from '@/services/cache/profileDataCache';

type SortField = 'name' | 'price' | 'balance' | 'value';
type SortDirection = 'asc' | 'desc';

export const PortfolioTab = observer(() => {
  const [sortField, setSortField] = useState<SortField>('value');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showCacheIndicator, setShowCacheIndicator] = useState(false);

  const sortOptions = [
    { key: 'name', label: 'Name' },
    { key: 'price', label: 'Price' },
    { key: 'balance', label: 'Balance' },
    { key: 'value', label: 'Value' },
  ];

  useEffect(() => {
    if (wallet.isInit && wallet.account) {
      // Check if we're using cached data
      const cacheKey = profileDataCache.getPortfolioCacheKey(
        wallet.account,
        wallet.currentChainId.toString()
      );
      const cached = profileDataCache.get(cacheKey);

      if (cached && cached.isStale) {
        setShowCacheIndicator(true);
      } else {
        setShowCacheIndicator(false);
      }

      portfolio.initPortfolio();
    }
  }, [wallet.isInit, wallet.account]);

  const handleForceRefresh = async () => {
    setShowCacheIndicator(false);
    await portfolio.forceRefresh();
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortedTokens = useMemo(() => {
    return [...portfolio.tokens].sort((a, b) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1;

      switch (sortField) {
        case 'name':
          return multiplier * a.displayName.localeCompare(b.displayName);
        case 'price':
          return (
            multiplier * (Number(a.derivedUSD || 0) - Number(b.derivedUSD || 0))
          );
        case 'balance':
          return multiplier * (a.balance.toNumber() - b.balance.toNumber());
        case 'value': {
          const aValue = Number(a.derivedUSD || 0) * a.balance.toNumber();
          const bValue = Number(b.derivedUSD || 0) * b.balance.toNumber();
          return multiplier * (aValue - bValue);
        }
        default:
          return 0;
      }
    });
  }, [portfolio.tokens, sortField, sortDirection]);

  const SortHeader = ({
    field,
    label,
  }: {
    field: SortField;
    label: string;
  }) => (
    <th
      className="py-4 px-6 cursor-pointer transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2 justify-end">
        <span>{label}</span>
        <div className="flex flex-col">
          <ChevronUpIcon
            className={`h-3 w-3 ${
              sortField === field && sortDirection === 'asc'
                ? 'text-black'
                : 'text-[#4D4D4D]'
            }`}
          />
          <ChevronDownIcon
            className={`h-3 w-3 ${
              sortField === field && sortDirection === 'desc'
                ? 'text-black'
                : 'text-[#4D4D4D]'
            }`}
          />
        </div>
      </div>
    </th>
  );

  return (
    <div className="custom-dashed-3xl w-full p-2 sm:p-6 bg-white">
      <div className="flex justify-between items-center mb-4">
        <Link
          href="https://app.rhino.fi/bridge/?refId=DeFi_HPOT&token=USDC&chainOut=BERACHAIN&chainIn=ETHEREUM"
          target="_blank"
          className="md:mb-4 md:w-full md:justify-end"
        >
          <Button className="bg-white text-xs md:text-base px-2 md:px-4">
            <div className="flex items-center gap-2">
              <Image
                src={rhinoLogo}
                alt="rhino"
                width={20}
                height={20}
                className="md:w-6 md:h-6"
              />
              <span className="hidden sm:inline">
                Bridge your assets with Rhino finance
              </span>
              <span className="sm:hidden">Bridge assets</span>
            </div>
          </Button>
        </Link>

        <div className="md:hidden">
          <Dropdown>
            <DropdownTrigger>
              <Button
                className="bg-white border border-[#2D2D2D] rounded-xl shadow-[2px_2px_0px_0px_#000] px-3 py-1.5 text-xs text-black"
                endContent={<ChevronDown className="h-4 w-4 text-black" />}
              >
                Sort by:{' '}
                {sortOptions.find((option) => option.key === sortField)?.label}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Sort options"
              className="bg-white border border-[#2D2D2D] rounded-xl shadow-[2px_2px_0px_0px_#000] p-1"
              onAction={(key) => {
                setSortField(key.toString() as SortField);
                setSortDirection('desc');
              }}
            >
              {sortOptions.map((option) => (
                <DropdownItem
                  key={option.key}
                  className={`text-black text-sm p-2 ${
                    sortField === option.key ? 'bg-[#FFCD4D]' : ''
                  }`}
                >
                  {option.label}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      {/* 移动端卡片视图 */}
      <div className="md:hidden">
        {portfolio.isLoading
          ? Array(3)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="mb-4 p-4 bg-white rounded-lg shadow border border-[#4D4D4D]/20"
                >
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              ))
          : getSortedTokens.map((token, index) => (
              <div key={index} className="mb-4 p-4 bg-white custom-dashed-3xl">
                <div className="flex justify-between items-center mb-3">
                  <div className="font-medium">Asset</div>
                  <div className="flex items-center gap-2">
                    <TokenLogo token={token} size={24} />
                    <span className="font-bold">{token.displayName}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-3">
                  <div className="font-medium">Price</div>
                  <div>
                    $
                    {Number(token.derivedUSD || 0).toLocaleString('en-US', {
                      maximumFractionDigits: 6,
                    })}
                  </div>
                </div>

                <div className="flex justify-between items-center mb-3">
                  <div className="font-medium">Balance</div>
                  <div>
                    {token.balance
                      .toNumber()
                      .toLocaleString('en-US', { maximumFractionDigits: 6 })}
                  </div>
                </div>

                <div className="flex justify-between items-center mb-3">
                  <div className="font-medium">Value</div>
                  <div className="font-bold">
                    $
                    {(
                      Number(token.derivedUSD || 0) * token.balance.toNumber()
                    ).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="mt-4 flex justify-center">
                  <Button
                    className="w-full border border-[#2D2D2D] bg-[#FFCD4D] hover:bg-[#FFD56A] text-black rounded-2xl shadow-[2px_2px_0px_0px_#000] px-4 py-2"
                    onClick={() => {
                      window.location.href = `/swap?inputCurrency=${token.address}`;
                    }}
                  >
                    Swap
                  </Button>
                </div>
              </div>
            ))}
      </div>

      {/* 桌面端表格视图 */}
      <div className="overflow-x-auto hidden md:block">
        <table className="w-full">
          <thead className="text-[#4D4D4D]">
            <tr>
              <th
                className="py-4 px-6 text-left cursor-pointer transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-2">
                  <span>Asset</span>
                  <div className="flex flex-col">
                    <ChevronUpIcon
                      className={`h-3 w-3 ${
                        sortField === 'name' && sortDirection === 'asc'
                          ? 'text-black'
                          : 'text-[#4D4D4D]'
                      }`}
                    />
                    <ChevronDownIcon
                      className={`h-3 w-3 ${
                        sortField === 'name' && sortDirection === 'desc'
                          ? 'text-black'
                          : 'text-[#4D4D4D]'
                      }`}
                    />
                  </div>
                </div>
              </th>
              <SortHeader field="price" label="Price" />
              <SortHeader field="balance" label="Balance" />
              <SortHeader field="value" label="Value" />
              <th className="py-4 px-6 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#4D4D4D]">
            {portfolio.isLoading
              ? Array(3)
                  .fill(0)
                  .map((_, index) => (
                    <tr key={index}>
                      <td className="py-4 px-6">
                        <Skeleton className="h-12 w-32 rounded-lg" />
                      </td>
                      <td className="py-4 px-6">
                        <Skeleton className="h-12 w-24 rounded-lg ml-auto" />
                      </td>
                      <td className="py-4 px-6">
                        <Skeleton className="h-12 w-24 rounded-lg ml-auto" />
                      </td>
                      <td className="py-4 px-6">
                        <Skeleton className="h-12 w-24 rounded-lg ml-auto" />
                      </td>
                      <td className="py-4 px-6">
                        <Skeleton className="h-12 w-24 rounded-lg mx-auto" />
                      </td>
                    </tr>
                  ))
              : getSortedTokens.map((token, index) => (
                  <TokenBalanceCard key={index} token={token} />
                ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-[#2D2D2D] mt-4">
        <div className="flex justify-between items-center">
          <span className="text-black">Total Portfolio Value:</span>
          {portfolio.isLoading ? (
            <Skeleton className="h-8 w-32 rounded-lg" />
          ) : (
            <span className="text-black font-bold">
              ${portfolio.totalBalanceFormatted}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

export default PortfolioTab;
