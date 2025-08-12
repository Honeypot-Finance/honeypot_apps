import { useCallback, useEffect, useState } from "react";
import { fetchPot2PumpTransactions } from "@/lib/algebra/graphql/clients/transactions";
import {
  Transaction,
  TransactionsQuery,
  TransactionsQueryResult,
  TransactionType,
} from "@/lib/algebra/graphql/generated/graphql";
import { truncate } from "@/lib/format";
import { Copy } from "@/components/Copy";
import { VscCopy } from "react-icons/vsc";
import { ExternalLink } from "lucide-react";
import dayjs from "dayjs";
import BigNumber from "bignumber.js";
import { MemePairContract } from "@/services/contract/launches/pot2pump/memepair-contract";
import { DedicatedPot2Pump } from "@/config/dedicatedPot2pump";
import { wallet } from '@honeypot/shared';
import { observer } from 'mobx-react-lite';

interface TransactionHistoryProps {
  pairAddress: string;
  pair: MemePairContract | null;
  refreshTrigger?: number;
}

interface DedicatedTransactionHistoryProps {
  token: DedicatedPot2Pump;
  refreshTrigger?: number;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = observer(({
  pairAddress,
  pair,
  refreshTrigger,
}) => {
  const [transactionsQuery, setTransactionsQuery] =
    useState<TransactionsQuery>();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const pageSize = 10;

  const loadTransactions = useCallback(
    async (currentPage: number, pageSize: number) => {
      if (!pair || !pair.launchedToken) return;
      setLoading(true);
      try {
        const response = await fetchPot2PumpTransactions(
          pairAddress,
          pair.launchedToken.address.toLowerCase(),
          currentPage,
          pageSize
        );
        console.log("response", response);
        setTransactionsQuery(response.data);
        setHasNextPage(response.pageInfo.hasNextPage);
      } finally {
        setLoading(false);
      }
    },
    [pairAddress, pair]
  );

  useEffect(() => {
    if (pair) {
      loadTransactions(page, pageSize);
    }
  }, [pair, page, loadTransactions]);

  useEffect(() => {
    if (pair) {
      loadTransactions(1, pageSize);
    }
  }, [refreshTrigger]);

  const getActionTypeDisplay = (type: TransactionType, amount: string) => {
    if (type === TransactionType.Swap) {
      const amountNum = new BigNumber(amount);
      return amountNum.isGreaterThanOrEqualTo(0) ? "Sell" : "Buy";
    }

    switch (type) {
      case TransactionType.Deposit:
        return "Deposit";
      case TransactionType.Refund:
        return "Refund";
      case TransactionType.ClaimLp:
        return "Claim LP";
      default:
        return type;
    }
  };

  const getAmountByType = (tx: Transaction) => {
    if (!pair?.raiseToken?.decimals) return "0";

    const decimals = pair.raiseToken.decimals;

    console.log("tx", tx);

    switch (tx.type) {
      case TransactionType.Swap:
        if (
          tx.swaps[0].token0.id.toLowerCase() ===
          pair.launchedToken?.address.toLowerCase()
        ) {
          return new BigNumber(tx.swaps[0].amount0).toFixed(3);
        } else {
          return new BigNumber(tx.swaps[0].amount1).toFixed(3);
        }
      case TransactionType.Deposit:
        return new BigNumber(tx.depositRaisedTokens[0].amount)
          .div(new BigNumber(10).pow(decimals))
          .toFixed(3);
      case TransactionType.Refund:
        return new BigNumber(tx.refunds[0].amount)
          .div(new BigNumber(10).pow(decimals))
          .toFixed(3);
      case TransactionType.ClaimLp:
        "-";
      default:
        return "0";
    }
  };

  return (
    <div className="bg-[#202020] rounded-2xl overflow-hidden w-full">
      <div className="p-3 sm:p-6">
        <div className="border border-[#5C5C5C] rounded-lg overflow-hidden overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-[#323232] [&::-webkit-scrollbar-thumb]:bg-[#5C5C5C] [&::-webkit-scrollbar-thumb]:rounded-full">
          <table className="w-full min-w-[800px]">
            <thead className="bg-[#323232] text-white">
              <tr>
                <th className="py-2 sm:py-4 px-3 sm:px-6 text-left text-xs sm:text-base font-medium">
                  Action
                </th>
                <th className="py-2 sm:py-4 px-3 sm:px-6 text-left text-xs sm:text-base font-medium">
                  Tx Hash
                </th>
                <th className="py-2 sm:py-4 px-3 sm:px-6 text-left text-xs sm:text-base font-medium">
                  Address
                </th>
                <th className="py-2 sm:py-4 px-3 sm:px-6 text-left text-xs sm:text-base font-medium">
                  Amount
                </th>
                <th className="py-2 sm:py-4 px-3 sm:px-6 text-right text-xs sm:text-base font-medium">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="text-white divide-y divide-[#5C5C5C]">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-2 sm:py-4 px-3 sm:px-6 text-center text-xs sm:text-base"
                  >
                    Loading...
                  </td>
                </tr>
              ) : transactionsQuery?.transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-2 sm:py-4 px-3 sm:px-6 text-center text-xs sm:text-base"
                  >
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactionsQuery?.transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-[#2a2a2a] transition-colors"
                  >
                    <td className="py-2 sm:py-4 px-3 sm:px-6 text-xs sm:text-base">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#FFCD4D] rounded"></div>
                        {getActionTypeDisplay(
                          tx.type,
                          getAmountByType(tx as Transaction)
                        )}
                      </div>
                    </td>
                    <td className="py-2 sm:py-4 px-3 sm:px-6 text-xs sm:text-base font-mono">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <a
                          href={wallet.currentChain?.getTransactionExplorerUrl(tx.id) || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#FFCD4D] flex items-center gap-1"
                        >
                          {truncate(tx.id, 8)}
                          <ExternalLink className="size-3 sm:size-4" />
                        </a>
                        <Copy
                          className="p-0.5 sm:p-1 hover:bg-[#3a3a3a] rounded"
                          value={tx.id}
                          content="Copy transaction hash"
                        >
                          <VscCopy className="size-4 sm:size-5" />
                        </Copy>
                      </div>
                    </td>
                    <td className="py-2 sm:py-4 px-3 sm:px-6 text-xs sm:text-base font-mono">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <a
                          href={wallet.currentChain?.getAddressExplorerUrl(tx.account.id) || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#FFCD4D] flex items-center gap-1"
                        >
                          {truncate(tx.account.id, 8)}
                          <ExternalLink className="size-3 sm:size-4" />
                        </a>
                        <Copy
                          className="p-0.5 sm:p-1 hover:bg-[#3a3a3a] rounded"
                          value={tx.account.id}
                          content="Copy address"
                        >
                          <VscCopy className="size-4 sm:size-5" />
                        </Copy>
                      </div>
                    </td>
                    <td
                      className={`py-2 sm:py-4 px-3 sm:px-6 text-xs sm:text-base ${
                        tx.type === TransactionType.Swap
                          ? new BigNumber(
                              getAmountByType(tx as Transaction)
                            ).isGreaterThanOrEqualTo(0)
                            ? "text-[#F23645]"
                            : "text-[#089981]"
                          : ""
                      }`}
                    >
                      {Math.abs(
                        parseFloat(getAmountByType(tx as Transaction))
                      ).toFixed(3)}{" "}
                      {tx.type === TransactionType.Swap &&
                        pair?.launchedToken?.symbol}
                      {(tx.type === TransactionType.Deposit ||
                        tx.type === TransactionType.Refund) &&
                        pair?.raiseToken?.symbol}
                    </td>
                    <td className="py-2 sm:py-4 px-3 sm:px-6 text-right text-xs sm:text-base">
                      {dayjs(parseInt(tx.timestamp) * 1000).format(
                        "YYYY-MM-DD HH:mm:ss"
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="px-3 sm:px-6 py-2 sm:py-4 flex justify-end border-t border-[#5C5C5C]">
        <div className="flex items-center gap-3 sm:gap-6 w-full sm:max-w-[400px] justify-between sm:justify-end">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-[#2a2a2a] rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3a3a3a] transition-colors text-xs sm:text-base"
            >
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Previous
            </button>

            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-base">
              <span className="text-gray-400">Page</span>
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-[#1a1a1a] rounded text-white min-w-[32px] sm:min-w-[40px] text-center">
                {page}
              </span>
            </div>

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNextPage || loading}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-[#2a2a2a] rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3a3a3a] transition-colors text-xs sm:text-base"
            >
              Next
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {loading && (
            <div className="flex items-center gap-1 sm:gap-2 text-gray-400 text-xs sm:text-base">
              <svg
                className="animate-spin h-3 w-3 sm:h-4 sm:w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Loading...
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export const DedicatedTransactionHistory: React.FC<
  DedicatedTransactionHistoryProps
> = ({ token, refreshTrigger }) => {
  const [transactionsQuery, setTransactionsQuery] =
    useState<TransactionsQuery>();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const pageSize = 10;

  const loadTransactions = useCallback(
    async (currentPage: number, pageSize: number) => {
      if (!token) return;
      setLoading(true);
      try {
        const response = await fetchPot2PumpTransactions(
          token.tokenAddress.toLowerCase(),
          token.tokenAddress.toLowerCase(),
          currentPage,
          pageSize
        );
        console.log("response", response);
        setTransactionsQuery(response.data);
        setHasNextPage(response.pageInfo.hasNextPage);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (token) {
      loadTransactions(page, pageSize);
    }
  }, [token, page, loadTransactions]);

  useEffect(() => {
    if (token) {
      loadTransactions(1, pageSize);
    }
  }, [refreshTrigger]);

  const getActionTypeDisplay = (type: TransactionType, amount: string) => {
    if (type === TransactionType.Swap) {
      const amountNum = new BigNumber(amount);
      return amountNum.isGreaterThanOrEqualTo(0) ? "Sell" : "Buy";
    }
  };

  const getAmountByType = (tx: Transaction) => {
    if (!token?.token) return "0";

    const decimals = token.token.decimals;

    console.log("tx", tx);

    if (
      tx.swaps[0].token0.id.toLowerCase() === token.tokenAddress.toLowerCase()
    ) {
      return new BigNumber(tx.swaps[0].amount0).toFixed(3);
    } else {
      return new BigNumber(tx.swaps[0].amount1).toFixed(3);
    }
  };

  return (
    <div className="bg-[#202020] rounded-2xl overflow-hidden w-full">
      <div className="p-3 sm:p-6">
        <div className="border border-[#5C5C5C] rounded-lg overflow-hidden overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-[#323232] [&::-webkit-scrollbar-thumb]:bg-[#5C5C5C] [&::-webkit-scrollbar-thumb]:rounded-full">
          <table className="w-full min-w-[800px]">
            <thead className="bg-[#323232] text-white">
              <tr>
                <th className="py-2 sm:py-4 px-3 sm:px-6 text-left text-xs sm:text-base font-medium">
                  Action
                </th>
                <th className="py-2 sm:py-4 px-3 sm:px-6 text-left text-xs sm:text-base font-medium">
                  Tx Hash
                </th>
                <th className="py-2 sm:py-4 px-3 sm:px-6 text-left text-xs sm:text-base font-medium">
                  Address
                </th>
                <th className="py-2 sm:py-4 px-3 sm:px-6 text-left text-xs sm:text-base font-medium">
                  Amount
                </th>
                <th className="py-2 sm:py-4 px-3 sm:px-6 text-right text-xs sm:text-base font-medium">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="text-white divide-y divide-[#5C5C5C]">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-2 sm:py-4 px-3 sm:px-6 text-center text-xs sm:text-base"
                  >
                    Loading...
                  </td>
                </tr>
              ) : transactionsQuery?.transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-2 sm:py-4 px-3 sm:px-6 text-center text-xs sm:text-base"
                  >
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactionsQuery?.transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-[#2a2a2a] transition-colors"
                  >
                    <td className="py-2 sm:py-4 px-3 sm:px-6 text-xs sm:text-base">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#FFCD4D] rounded"></div>
                        {getActionTypeDisplay(
                          tx.type,
                          getAmountByType(tx as Transaction)
                        )}
                      </div>
                    </td>
                    <td className="py-2 sm:py-4 px-3 sm:px-6 text-xs sm:text-base font-mono">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <a
                          href={wallet.currentChain?.getTransactionExplorerUrl(tx.id) || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#FFCD4D] flex items-center gap-1"
                        >
                          {truncate(tx.id, 8)}
                          <ExternalLink className="size-3 sm:size-4" />
                        </a>
                        <Copy
                          className="p-0.5 sm:p-1 hover:bg-[#3a3a3a] rounded"
                          value={tx.id}
                          content="Copy transaction hash"
                        >
                          <VscCopy className="size-4 sm:size-5" />
                        </Copy>
                      </div>
                    </td>
                    <td className="py-2 sm:py-4 px-3 sm:px-6 text-xs sm:text-base font-mono">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <a
                          href={wallet.currentChain?.getAddressExplorerUrl(tx.account.id) || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#FFCD4D] flex items-center gap-1"
                        >
                          {truncate(tx.account.id, 8)}
                          <ExternalLink className="size-3 sm:size-4" />
                        </a>
                        <Copy
                          className="p-0.5 sm:p-1 hover:bg-[#3a3a3a] rounded"
                          value={tx.account.id}
                          content="Copy address"
                        >
                          <VscCopy className="size-4 sm:size-5" />
                        </Copy>
                      </div>
                    </td>
                    <td
                      className={`py-2 sm:py-4 px-3 sm:px-6 text-xs sm:text-base ${
                        tx.type === TransactionType.Swap
                          ? new BigNumber(
                              getAmountByType(tx as Transaction)
                            ).isGreaterThanOrEqualTo(0)
                            ? "text-[#F23645]"
                            : "text-[#089981]"
                          : ""
                      }`}
                    >
                      {Math.abs(
                        parseFloat(getAmountByType(tx as Transaction))
                      ).toFixed(3)}{" "}
                      {tx.type === TransactionType.Swap && token.token?.symbol}
                    </td>
                    <td className="py-2 sm:py-4 px-3 sm:px-6 text-right text-xs sm:text-base">
                      {dayjs(parseInt(tx.timestamp) * 1000).format(
                        "YYYY-MM-DD HH:mm:ss"
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="px-3 sm:px-6 py-2 sm:py-4 flex justify-end border-t border-[#5C5C5C]">
        <div className="flex items-center gap-3 sm:gap-6 w-full sm:max-w-[400px] justify-between sm:justify-end">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-[#2a2a2a] rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3a3a3a] transition-colors text-xs sm:text-base"
            >
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Previous
            </button>

            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-base">
              <span className="text-gray-400">Page</span>
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-[#1a1a1a] rounded text-white min-w-[32px] sm:min-w-[40px] text-center">
                {page}
              </span>
            </div>

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNextPage || loading}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-[#2a2a2a] rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3a3a3a] transition-colors text-xs sm:text-base"
            >
              Next
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {loading && (
            <div className="flex items-center gap-1 sm:gap-2 text-gray-400 text-xs sm:text-base">
              <svg
                className="animate-spin h-3 w-3 sm:h-4 sm:w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Loading...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
