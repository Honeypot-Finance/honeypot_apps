import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  RefreshCcw,
} from 'lucide-react';
import { wallet } from '@honeypot/shared/lib/wallet';
import {
  crossChainTransactionService,
  CrossChainTransaction,
} from '@/services/crossChainTransactionService';
import { DynamicFormatAmount } from '@/lib/algebra/utils/common/formatAmount';

interface CrossChainTransactionHistoryProps {
  inModal?: boolean;
}

const CrossChainTransactionHistory: React.FC<CrossChainTransactionHistoryProps> =
  observer(({ inModal = false }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const itemsPerPage = 8;

    // Get real transactions from the service
    const allTransactions = crossChainTransactionService.getAllTransactions();

    // Sort by timestamp (most recent first) - use slice() to avoid mutating observable array
    const sortedTransactions = allTransactions
      .slice()
      .sort((a, b) => b.timestamp - a.timestamp);

    const formatTimeAgo = (timestamp: number): string => {
      const now = Date.now();
      const diff = now - timestamp;

      if (diff < 60000) return `${Math.floor(diff / 1000)} secs ago`;
      if (diff < 3600000) return `${Math.floor(diff / 60000)} mins ago`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
      return `${Math.floor(diff / 86400000)} days ago`;
    };

    const formatAddress = (address: string): string => {
      if (!address) return '0x...';
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      // Could add a toast notification here
    };

    const handleRefresh = async () => {
      setIsRefreshing(true);
      try {
        await crossChainTransactionService.refreshPendingTransactions();
      } catch (error) {
        // Silent fail - errors are handled in the service
      } finally {
        setIsRefreshing(false);
      }
    };

    const openInExplorer = (txHash: string, chainId?: number) => {
      if (!txHash || txHash === '0x...') return;

      // Map chain IDs to explorer URLs
      const explorers: Record<number, string> = {
        1: 'https://etherscan.io',
        56: 'https://bscscan.com',
        137: 'https://polygonscan.com',
        42161: 'https://arbiscan.io',
        10: 'https://optimistic.etherscan.io',
        8453: 'https://basescan.org',
      };

      const explorerUrl = explorers[chainId || 1] || 'https://etherscan.io';
      window.open(`${explorerUrl}/tx/${txHash}`, '_blank');
    };

    // Calculate value (approximate USD value)
    const calculateValue = (tx: CrossChainTransaction): number => {
      // This is a simplified calculation - in production you'd use real price data
      const amount = parseFloat(tx.fromToken?.amount || '0');
      const tokenPrices: Record<string, number> = {
        ETH: 3000,
        WETH: 3000,
        BNB: 600,
        USDT: 1,
        USDC: 1,
        MATIC: 0.8,
      };
      const price =
        tokenPrices[tx.fromToken?.symbol?.toUpperCase() || ''] || 100;
      return amount * price;
    };

    // Pagination
    const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentTransactions = sortedTransactions.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    };

    const renderPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(totalPages, start + maxVisible - 1);

      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => goToPage(i)}
            className={`w-8 h-8 rounded ${
              currentPage === i
                ? 'bg-[#D4A574] text-black font-semibold'
                : 'text-gray-500 hover:text-gray-300 hover:bg-[#2a2318]/50'
            } transition-colors`}
          >
            {i}
          </button>
        );
      }

      if (start > 1) {
        pages.unshift(
          <span key="dots-start" className="text-gray-600 px-2">
            ...
          </span>
        );
      }

      if (end < totalPages) {
        pages.push(
          <span key="dots-end" className="text-gray-600 px-2">
            ...
          </span>
        );
        pages.push(
          <button
            key={totalPages}
            onClick={() => goToPage(totalPages)}
            className="w-8 h-8 rounded text-gray-500 hover:text-gray-300 hover:bg-[#2a2318]/50 transition-colors"
          >
            {totalPages}
          </button>
        );
      }

      return pages;
    };

    const containerClass = inModal
      ? 'w-full bg-transparent'
      : 'w-full h-full bg-[#140D06] rounded-2xl border border-[#2a2318] p-6 flex flex-col overflow-hidden';

    return (
      <div className={containerClass}>
        {!inModal && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Transactions</h2>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                isRefreshing
                  ? 'bg-[#2a2318]/50 text-gray-500 cursor-not-allowed'
                  : 'bg-[#2a2318] text-gray-400 hover:text-white hover:bg-[#3a2818]'
              }`}
              title="Refresh pending transactions"
            >
              <RefreshCcw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              Refresh
            </button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2318]">
                <th className="text-left text-sm text-gray-500 font-normal pb-4 px-3">
                  Time
                </th>
                <th className="text-left text-sm text-gray-500 font-normal pb-4 px-3">
                  Value
                </th>
                <th className="text-left text-sm text-gray-500 font-normal pb-4 px-3">
                  From
                </th>
                <th className="text-left text-sm text-gray-500 font-normal pb-4 px-3">
                  To
                </th>
                <th className="text-left text-sm text-gray-500 font-normal pb-4 px-3">
                  Status
                </th>
                <th className="text-left text-sm text-gray-500 font-normal pb-4 px-3">
                  User
                </th>
                <th className="text-left text-sm text-gray-500 font-normal pb-4 px-3">
                  Request ID
                </th>
                <th className="text-left text-sm text-gray-500 font-normal pb-4 px-3">
                  Origin TX
                </th>
                <th className="text-left text-sm text-gray-500 font-normal pb-4 px-3">
                  Dest TX
                </th>
              </tr>
            </thead>
            <tbody>
              {currentTransactions.length > 0 ? (
                currentTransactions.map((tx, index) => (
                  <tr
                    key={tx.id}
                    className={`border-b border-[#2a2318] transition-colors ${
                      index % 2 === 0
                        ? 'bg-transparent hover:bg-[#0A0704]'
                        : 'bg-[#1F1409] hover:bg-[#241809]'
                    }`}
                  >
                    <td className="py-4 px-3 text-sm text-white whitespace-nowrap">
                      {formatTimeAgo(tx.timestamp)}
                    </td>
                    <td className="py-4 px-3 text-sm text-white font-medium whitespace-nowrap">
                      ${calculateValue(tx).toFixed(2)}
                    </td>
                    <td className="py-4 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-green-500">
                          <DynamicFormatAmount
                            amount={tx.fromToken?.amount || '0'}
                            decimals={3}
                          />{' '}
                          {tx.fromToken?.symbol || 'Unknown'}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({tx.fromChain?.name || 'Chain'})
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-red-500">
                          <DynamicFormatAmount
                            amount={tx.toToken?.amount || '0'}
                            decimals={3}
                          />{' '}
                          {tx.toToken?.symbol || 'Unknown'}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({tx.toChain?.name || 'Chain'})
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-3 whitespace-nowrap">
                      <span
                        className={`text-sm px-2 py-1 rounded-full ${
                          tx.status === 'completed'
                            ? 'bg-green-500/20 text-green-500'
                            : tx.status === 'failed'
                            ? 'bg-red-500/20 text-red-500'
                            : 'bg-yellow-500/20 text-yellow-500'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-4 px-3 whitespace-nowrap">
                      <button
                        onClick={() => copyToClipboard(tx.userAddress)}
                        className="text-sm text-[#FFA931] hover:text-[#FFB951] flex items-center gap-1 transition-colors"
                      >
                        {formatAddress(tx.userAddress)}
                        <Copy className="w-3 h-3" />
                      </button>
                    </td>
                    <td className="py-4 px-3 whitespace-nowrap">
                      {tx.requestId ? (
                        <button
                          onClick={() => copyToClipboard(tx.requestId!)}
                          className="text-sm text-white hover:text-gray-300 flex items-center gap-1 transition-colors"
                        >
                          {formatAddress(tx.requestId)}
                          <Copy className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="py-4 px-3 whitespace-nowrap">
                      {tx.originTransactionHash || tx.txHash ? (
                        <a
                          href={
                            tx.originTransactionUrl ||
                            `https://etherscan.io/tx/${
                              tx.originTransactionHash || tx.txHash
                            }`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-white hover:text-gray-300 flex items-center gap-1 transition-colors"
                        >
                          {formatAddress(
                            tx.originTransactionHash || tx.txHash!
                          )}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-sm text-gray-500">
                          {tx.status === 'failed' ? '-' : 'Pending...'}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-3 whitespace-nowrap">
                      {tx.destinationTransactionHash ? (
                        <a
                          href={
                            tx.destinationTransactionUrl ||
                            `https://etherscan.io/tx/${tx.destinationTransactionHash}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-green-400 hover:text-green-300 flex items-center gap-1 transition-colors"
                        >
                          {formatAddress(tx.destinationTransactionHash)}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-500">
                    No transactions yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination - only show if there are transactions */}
        {sortedTransactions.length > itemsPerPage && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded text-gray-500 hover:text-gray-300 hover:bg-[#2a2318]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {renderPageNumbers()}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded text-gray-500 hover:text-gray-300 hover:bg-[#2a2318]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  });

export default CrossChainTransactionHistory;
