import { FormattedPosition } from '@/types/algebra/types/formatted-position';
import { DynamicFormatAmount } from '@honeypot/shared';
import { ChevronRight } from 'lucide-react';

interface MyPositionsCardProps {
  positions: FormattedPosition[];
  selectedPosition: number | null;
  onSelectPosition: (positionId: number) => void;
}

const MyPositionsCard = ({
  positions,
  selectedPosition,
  onSelectPosition,
}: MyPositionsCardProps) => {
  if (positions.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">No positions found</div>
    );
  }

  return (
    <div className="divide-y divide-gray-100 bg-[#271A0C]">
      {positions.map((position) => (
        <div
          key={position.id}
          className={`p-4 cursor-pointer transition-colors ${
            Number(selectedPosition) === Number(position.id)
              ? 'bg-[#271A0C]'
              : 'bg-[#271A0C]'
          }`}
          onClick={() => onSelectPosition(Number(position.id))}
        >
          {/* Header with ID */}
          <div className="flex justify-between items-center mb-3">
            <div className="font-medium text-gray-900 text-base">
              Position #{String(position.id)}
            </div>
            <div>
              {position.outOfRange ? (
                <span className="px-2 py-1 rounded-md bg-yellow-50 text-yellow-600 text-xs font-medium whitespace-nowrap">
                  Out of range
                </span>
              ) : (
                <span className="px-2 py-1 rounded-md bg-green-50 text-green-500 text-xs font-medium  whitespace-nowrap">
                  In range
                </span>
              )}
            </div>
          </div>

          {/* Main content */}
          <div className="grid grid-cols-2 gap-y-2 mb-3">
            <div className="text-gray-500 text-sm">Liquidity:</div>
            <div className="text-right font-medium">
              $
              {DynamicFormatAmount({
                amount: position.liquidityUSD?.toString() || '0',
                decimals: 2,
                endWith: '',
              })}
            </div>

            <div className="text-gray-500 text-sm">Fees:</div>
            <div className="text-right font-medium">
              $
              {DynamicFormatAmount({
                amount: position.feesUSD?.toString() || '0',
                decimals: 6,
                endWith: '',
              })}
            </div>

            <div className="text-gray-500 text-sm">APR:</div>
            <div className="text-right font-medium text-[#F7931A]">
              {position.apr
                ? `${parseFloat(position.apr.toString()).toFixed(2)}%`
                : '0.00%'}
            </div>
          </div>

          {/* Range info */}
          <div className="bg-gray-50 rounded-md p-2 text-xs font-mono text-gray-700 mb-2">
            {position.range || 'Range not available'}
          </div>

          {/* View details link */}
          <div className="flex justify-end items-center text-sm text-blue-500">
            <span>View details</span>
            <ChevronRight size={16} className="ml-1" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyPositionsCard;
