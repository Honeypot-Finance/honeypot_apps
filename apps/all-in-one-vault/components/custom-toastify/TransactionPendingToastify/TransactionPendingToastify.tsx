import Link from 'next/link';
import { wallet } from '@honeypot/shared/lib/wallet';
import { ViewSvg } from '@/components/svg/View';

// FIXME: update toastify style

export default function TransactionPendingToastify({
  hash,
  action,
}: {
  hash: string;
  action?: string;
}) {
  return (
    <div>
      <div>{action || 'Transaction'} Pending</div>
      <div className="m-2 text-right">
        <Link
          className="flex justify-end text-right items-center gap-2 text-white"
          href={
            wallet?.currentChain?.chain?.blockExplorers?.default.url +
            'tx/' +
            hash
          }
          target="_blank"
        >
          View Txn
          <ViewSvg />
        </Link>
      </div>
    </div>
  );
}

export function TransactionSuccessToastify({
  hash,
  action,
}: {
  hash: string;
  action?: string;
}) {
  return (
    <div>
      <div>{action || 'Transaction'} Success!</div>
      <div className="m-2 text-right">
        <Link
          className="flex justify-end text-right items-center gap-2 text-white"
          href={
            wallet?.currentChain?.chain?.blockExplorers?.default.url +
            'tx/' +
            hash
          }
          target="_blank"
        >
          View Txn
          <ViewSvg />
        </Link>
      </div>
    </div>
  );
}
