import { useState, useEffect } from 'react';
import { VscCopy } from 'react-icons/vsc';
import { ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { wallet } from '@honeypot/shared/lib/wallet';
import { useSwapTransactions } from '@/lib/algebra/graphql/clients/swapTransactions';
import { observer } from 'mobx-react-lite';
import { SwapField } from '@/types/algebra/types/swap-field';
import { useDerivedSwapInfo } from '@/lib/algebra/state/swapStore';
import { zeroAddress } from 'viem';
import BigNumber from 'bignumber.js';

const SwapTransactionHistory = observer(() => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const pageSize = 10;

  const { currencies } = useDerivedSwapInfo();
  const { fetchTransactions } = useSwapTransactions();

  const baseCurrency = currencies[SwapField.INPUT];
  const quoteCurrency = currencies[SwapField.OUTPUT];

  useEffect(() => {
    const loadTransactions = async (currentPage: number) => {
      setLoading(true);
      try {
        // Log the request details for debugging
        console.log('[SwapTransactionHistory] Loading transactions:', {
          chainId: wallet.currentChainId,
          page: currentPage,
          baseCurrency: baseCurrency?.wrapped.address ?? zeroAddress,
          quoteCurrency: quoteCurrency?.wrapped.address ?? zeroAddress,
        });
        
        const response = await fetchTransactions(
          currentPage,
          pageSize,
          baseCurrency?.wrapped.address ?? zeroAddress,
          quoteCurrency?.wrapped.address ?? zeroAddress
        );
        
        console.log('[SwapTransactionHistory] Response:', response);
        
        setTransactions(response.data);
        setHasNextPage(response.pageInfo.hasNextPage);
      } catch (error) {
        console.error('[SwapTransactionHistory] Error loading transactions:', error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions(page);
  }, [baseCurrency, page, pageSize, quoteCurrency, fetchTransactions]);

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
    // Get explorer URL based on current chain
    let explorerUrl = 'https://etherscan.io';
    
    if (wallet.currentChainId === 56) {
      explorerUrl = 'https://bscscan.com';
    } else if (wallet.currentChainId === 137) {
      explorerUrl = 'https://polygonscan.com';
    } else if (wallet.currentChainId === 42161) {
      explorerUrl = 'https://arbiscan.io';
    } else if (wallet.currentChainId === 10) {
      explorerUrl = 'https://optimistic.etherscan.io';
    } else if (wallet.currentChainId === 8453) {
      explorerUrl = 'https://basescan.org';
    } else if (wallet.currentChainId === 80084) {
      explorerUrl = 'https://bartio.beratrail.io';
    }
    
    window.open(`${explorerUrl}/tx/${txHash}`, '_blank');
  };

  const formatAmount = (amount: string) => {
    return new BigNumber(amount).toFixed(6);
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
              <th className="text-left text-sm text-gray-500 font-normal pb-4">
                {transactions[0]?.token0?.symbol || 'Token In'}
              </th>
              <th className="text-left text-sm text-gray-500 font-normal pb-4">
                {transactions[0]?.token1?.symbol || 'Token Out'}
              </th>
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
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  <div className="flex flex-col gap-2">
                    <span>No transactions found for this token pair</span>
                    <span className="text-xs text-gray-600">
                      Chain: {wallet.currentChain?.displayName || wallet.currentChain?.chain?.name || 'Unknown'} (ID: {wallet.currentChainId})
                    </span>
                    {baseCurrency && quoteCurrency && (
                      <span className="text-xs text-gray-600">
                        {baseCurrency.symbol} ↔ {quoteCurrency.symbol}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              transactions.map((tx, index) => (
                <tr 
                  key={tx.id} 
                  className={`border-b border-[#2a2318] transition-colors ${
                    index % 2 === 0 
                      ? 'bg-transparent hover:bg-[#0A0704]' // Even rows - darker
                      : 'bg-[#1F1409] hover:bg-[#241809]'   // Odd rows - lighter background
                  }`}
                >
                  <td className="py-4 text-sm text-white pl-2">{formatTimeAgo(tx.timestamp)}</td>
                  <td className="py-4 text-sm text-white font-medium">
                    ${new BigNumber(tx.amountUSD || 0).toFixed(2)}
                  </td>
                  <td className="py-4 text-sm">
                    <span className={`${parseFloat(tx.amount0) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {parseFloat(tx.amount0) > 0 ? 'Buy ' : 'Sell '}
                      {formatAmount(Math.abs(parseFloat(tx.amount0)).toString())}
                    </span>
                  </td>
                  <td className="py-4 text-sm">
                    <span className={`${parseFloat(tx.amount1) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {parseFloat(tx.amount1) > 0 ? 'Buy ' : 'Sell '}
                      {formatAmount(Math.abs(parseFloat(tx.amount1)).toString())}
                    </span>
                  </td>
                  <td className="py-4">
                    <button
                      onClick={() => copyToClipboard(tx.origin || tx.sender || '')}
                      className="text-sm text-[#FFA931] hover:text-[#FFB951] flex items-center gap-1 transition-colors"
                    >
                      {(tx.origin || tx.sender || '').slice(0, 6)}...{(tx.origin || tx.sender || '').slice(-4)}
                      <VscCopy className="w-3 h-3" />
                    </button>
                  </td>
                  <td className="py-4">
                    <button
                      onClick={() => openInExplorer(tx.transaction?.id || '')}
                      className="text-sm text-white hover:text-gray-300 flex items-center gap-1 transition-colors"
                    >
                      {(tx.transaction?.id || '').slice(0, 6)}...{(tx.transaction?.id || '').slice(-4)}
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
      <div className="flex items-center justify-center gap-2 mt-6">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || loading}
          className="w-8 h-8 rounded text-gray-500 hover:text-gray-300 hover:bg-[#2a2318]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <span className="text-gray-400 px-4">
          Page {page}
        </span>
        
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!hasNextPage || loading}
          className="w-8 h-8 rounded text-gray-500 hover:text-gray-300 hover:bg-[#2a2318]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});

export default SwapTransactionHistory;