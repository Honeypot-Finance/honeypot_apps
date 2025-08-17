import { useEffect, useState } from 'react';
import { VscCopy } from 'react-icons/vsc';
import { ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { wallet } from '@honeypot/shared/lib/wallet';

const SwapTransactionHistory = () => {
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10; // 10 items per page as requested
  const totalItems = 100; // 100 total items

  // Generate all 100 transactions once on mount
  useEffect(() => {
    const generateTransactions = () => {
      const transactions = Array.from({ length: totalItems }, (_, i) => {
        // Generate varied but realistic looking data
        const baseAmount = 0.345 + (Math.random() * 0.5 - 0.25);
        const sellAmount = 0.09043 + (Math.random() * 0.02 - 0.01);
        const value = 50.393 + (Math.random() * 100 - 50);
        
        return {
          id: `tx-${i}`,
          timestamp: Math.floor(Date.now() / 1000 - i * 60).toString(), // 1 minute apart
          transaction: {
            id: `0x4e3${i.toString(16).padStart(3, '0')}...5f0a`,
            from: `0x4e3${i.toString(16).padStart(3, '0')}...5f0a`
          },
          token0: { symbol: 'WBERA' },
          token1: { symbol: 'HONEY' },
          amount0: baseAmount.toFixed(3),
          amount1: sellAmount.toFixed(5),
          value: value.toFixed(3)
        };
      });
      
      setAllTransactions(transactions);
      setLoading(false);
    };

    generateTransactions();
  }, []); // Only run once on mount

  const formatTimeAgo = (timestamp: string) => {
    const now = Math.floor(Date.now() / 1000);
    const txTime = parseInt(timestamp);
    const diffInSeconds = now - txTime;
    
    if (diffInSeconds < 60) return `${diffInSeconds} secs ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const openInExplorer = (txHash: string) => {
    // For now, use a default explorer URL
    const explorerUrl = 'https://etherscan.io';
    window.open(`${explorerUrl}/tx/${txHash}`, '_blank');
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = allTransactions.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);
    
    // Always show page 1
    if (start > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => goToPage(1)}
          className="w-8 h-8 rounded text-gray-500 hover:text-gray-300 hover:bg-[#2a2318]/50 transition-colors"
        >
          1
        </button>
      );
      
      if (start > 2) {
        pages.push(
          <span key="dots-start" className="text-gray-600 px-2">
            ...
          </span>
        );
      }
    }

    // Show current range
    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`w-8 h-8 rounded ${
            currentPage === i
              ? 'bg-[#D4A574] text-black font-semibold' // Golden/orange for active
              : 'text-gray-500 hover:text-gray-300 hover:bg-[#2a2318]/50'
          } transition-colors`}
        >
          {i}
        </button>
      );
    }

    // Always show last page
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push(
          <span key="dots-end" className="text-gray-600 px-2">
            ...
          </span>
        );
      }
      
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

  return (
    <div className="w-full bg-[#140D06] rounded-2xl border border-[#2a2318] p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Latest Transactions</h2>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2a2318]">
              <th className="text-left text-sm text-gray-500 font-normal pb-4 pl-2">Time</th>
              <th className="text-left text-sm text-gray-500 font-normal pb-4">
                <div className="flex items-center gap-1">
                  Value
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </th>
              <th className="text-left text-sm text-gray-500 font-normal pb-4">Buy WBERA</th>
              <th className="text-left text-sm text-gray-500 font-normal pb-4">Sell HONEY</th>
              <th className="text-left text-sm text-gray-500 font-normal pb-4">User</th>
              <th className="text-left text-sm text-gray-500 font-normal pb-4">TX Hash</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : currentTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  No transactions found
                </td>
              </tr>
            ) : (
              currentTransactions.map((tx, index) => (
                <tr 
                  key={tx.id} 
                  className={`border-b border-[#2a2318] transition-colors ${
                    index % 2 === 0 
                      ? 'bg-transparent hover:bg-[#0A0704]' // Even rows - darker (transparent shows #140D06 bg)
                      : 'bg-[#1F1409] hover:bg-[#241809]'   // Odd rows - lighter background
                  }`}
                >
                  <td className="py-4 text-sm text-white pl-2">{formatTimeAgo(tx.timestamp)}</td>
                  <td className="py-4 text-sm text-white font-medium">${tx.value}</td>
                  <td className="py-4 text-sm text-green-500">{tx.amount0}</td>
                  <td className="py-4 text-sm text-red-500">{tx.amount1}</td>
                  <td className="py-4">
                    <button
                      onClick={() => copyToClipboard(tx.transaction.from)}
                      className="text-sm text-[#FFA931] hover:text-[#FFB951] flex items-center gap-1 transition-colors"
                    >
                      {tx.transaction.from}
                      <VscCopy className="w-3 h-3" />
                    </button>
                  </td>
                  <td className="py-4">
                    <button
                      onClick={() => openInExplorer(tx.transaction.id)}
                      className="text-sm text-white hover:text-gray-300 flex items-center gap-1 transition-colors"
                    >
                      {tx.transaction.id}
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {allTransactions.length > 0 && (
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
};

export default SwapTransactionHistory;