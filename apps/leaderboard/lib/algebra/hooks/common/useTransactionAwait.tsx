import { ExternalLinkIcon, Link } from 'lucide-react';
import { useEffect } from 'react';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';

import { Address } from 'viem';
import { TransactionInfo, usePendingTransactionsStore } from '../../state/pendingTransactionsStore';
import { ToastAction } from '@/components/algebra/toast';
import { useToast } from '@/components/algebra/use-toast';

export const ViewTxOnExplorer = ({ hash }: { hash: Address | undefined }) =>
  hash ? (
    <ToastAction altText="View on explorer" asChild>
      <Link
        to={`https://holesky.etherscan.io/tx/${hash}`}
        target={'_blank'}
        className="border-none gap-2 hover:bg-transparent hover:text-blue-400"
      >
        View on explorer
        <ExternalLinkIcon size={16} />
      </Link>
    </ToastAction>
  ) : (
    <></>
  );

export function useTransactionAwait(
  hash: Address | undefined,
  transactionInfo: TransactionInfo,
  redirectPath?: string
) {
  const { toast } = useToast();

  const { address: account } = useAccount();

  const {
    actions: { addPendingTransaction, updatePendingTransaction },
  } = usePendingTransactionsStore();

  const { data, isError, isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isLoading && hash && account) {
      toast({
        title: transactionInfo.title,
        description: transactionInfo.description || 'Transaction was sent',
        action: <ViewTxOnExplorer hash={hash} />,
      });
      addPendingTransaction(account, hash);
      updatePendingTransaction(account, hash, {
        data: transactionInfo,
        loading: true,
        success: null,
        error: null,
      });
    }
  }, [isLoading, hash, account]);

  useEffect(() => {
    if (isError && hash) {
      toast({
        title: transactionInfo.title,
        description: transactionInfo.description || 'Transaction failed',
        action: <ViewTxOnExplorer hash={hash} />,
      });
    }
  }, [isError]);

  useEffect(() => {
    if (isSuccess && hash) {
      toast({
        title: transactionInfo.title,
        description: transactionInfo.description || 'Transaction confirmed',
        action: <ViewTxOnExplorer hash={hash} />,
      });
      if (redirectPath) {
        window.location.href = redirectPath;
      }
    }
  }, [isSuccess]);

  return {
    data,
    isError,
    isLoading,
    isSuccess,
  };
}
