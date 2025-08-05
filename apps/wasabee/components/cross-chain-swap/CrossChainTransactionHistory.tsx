import React, { useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { Tab, Tabs } from '@nextui-org/react';
import { Clock, CheckCircle, XCircle, ExternalLink, ArrowRight } from 'lucide-react';
import { wallet } from '@honeypot/shared/lib/wallet';
import { DynamicFormatAmount } from '@honeypot/shared';
import { TokenLogo } from '@/components/TokenLogo/TokenLogo';
import Image from 'next/image';
import { crossChainTransactionService, CrossChainTransaction } from '@/services/crossChainTransactionService';

interface CrossChainTransactionHistoryProps {
  inModal?: boolean;
}

const CrossChainTransactionHistory: React.FC<CrossChainTransactionHistoryProps> = observer(({ inModal = false }) => {
  const [selectedTab, setSelectedTab] = useState('all');

  // Get real transactions from the service
  const userTransactions = useMemo(() => {
    if (!wallet.account) return [];
    return crossChainTransactionService.getTransactionsByUser(wallet.account);
  }, [wallet.account, crossChainTransactionService.transactions]);

  const filteredTransactions = userTransactions.filter(tx => {
    if (selectedTab === 'all') return true;
    return tx.status === selectedTab;
  });

  const getStatusIcon = (status: CrossChainTransaction['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusText = (status: CrossChainTransaction['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const content = (
    <>
      {!inModal && <h3 className="text-xl font-semibold mb-4 text-white">Transaction History</h3>}
        
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(key as string)}
          classNames={{
            tabList: "bg-[#141414] rounded-lg p-1",
            cursor: "bg-[#2a2a2a]",
            tab: "text-sm text-gray-400 data-[selected=true]:text-white",
            tabContent: "group-data-[selected=true]:text-white"
          }}
        >
          <Tab key="all" title="All" />
          <Tab key="pending" title="Pending" />
          <Tab key="completed" title="Completed" />
          <Tab key="failed" title="Failed" />
        </Tabs>

        <div className="mt-6 space-y-4">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-4 space-y-3"
              >
                {/* Status and Time */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(tx.status)}
                    <span className="text-sm font-medium text-white">
                      {getStatusText(tx.status)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatTime(tx.timestamp)}
                  </span>
                </div>

                {/* Error Message for Failed Transactions */}
                {tx.status === 'failed' && tx.errorMessage && (
                  <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-2 mb-3">
                    <p className="text-xs text-red-400">{tx.errorMessage}</p>
                  </div>
                )}

                {/* Swap Details */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* From */}
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Image
                          src={tx.fromToken.logoURI || '/images/icons/tokens/unknown.png'}
                          alt={tx.fromToken.symbol}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                        <Image
                          src={tx.fromChain.iconUrl}
                          alt={tx.fromChain.name}
                          width={14}
                          height={14}
                          className="absolute -bottom-1 -right-1 rounded-full border-2 border-[#141414]"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">
                          {tx.fromToken.amount} {tx.fromToken.symbol}
                        </div>
                        <div className="text-xs text-gray-500">
                          {tx.fromChain.name}
                        </div>
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-gray-600" />

                    {/* To */}
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Image
                          src={tx.toToken.logoURI || '/images/icons/tokens/unknown.png'}
                          alt={tx.toToken.symbol}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                        <Image
                          src={tx.toChain.iconUrl}
                          alt={tx.toChain.name}
                          width={14}
                          height={14}
                          className="absolute -bottom-1 -right-1 rounded-full border-2 border-[#141414]"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">
                          {tx.toToken.amount} {tx.toToken.symbol}
                        </div>
                        <div className="text-xs text-gray-500">
                          {tx.toChain.name}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* View Transaction */}
                  {tx.txHash && (
                    <a
                      href={`https://universalx.app/activity/details?id=${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-lg font-medium mb-2 text-gray-300">No transactions yet</p>
              <p className="text-sm text-gray-500">Your cross-chain swaps will appear here</p>
            </div>
          )}
        </div>
    </>
  );

  if (inModal) {
    return content;
  }

  return (
    <div className="w-full">
      <div className="bg-[#1a1a1a] rounded-3xl border border-[#2a2a2a] shadow-2xl p-6">
        {content}
      </div>
    </div>
  );
});

export default CrossChainTransactionHistory;