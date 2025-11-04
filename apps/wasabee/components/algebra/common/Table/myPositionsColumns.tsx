import { ColumnDef } from '@tanstack/react-table';
import { HeaderItem } from './common';
import { DynamicFormatAmount } from '@/lib/algebra/utils/common/formatAmount';
import { Pool } from '@cryptoalgebra/sdk';
import { Position as PositionEntity } from '@cryptoalgebra/sdk';

interface MyPosition {
  id: number;
  outOfRange: boolean;
  range: string;
  liquidityUSD: number;
  feesUSD: number;
  apr: number;
  position?: PositionEntity;
  poolEntity?: Pool;
}

export const myPositionsColumns: ColumnDef<MyPosition>[] = [
  {
    accessorKey: 'id',
    header: () => <HeaderItem>OWNER</HeaderItem>,
    cell: ({ getValue }) => (
      <span className="text-white font-normal text-sm">{`0xf...${String(getValue()).slice(-4)}`}</span>
    ),
  },
  {
    accessorKey: 'range',
    header: () => <HeaderItem>RANGE</HeaderItem>,
    cell: ({ row }) => {
      const position = row.original.position;
      const poolEntity = row.original.poolEntity;
      const isInRange = !row.original.outOfRange;

      // Default values
      let rangeStart = 35;
      let rangeEnd = 65;
      const currentPricePosition = 50; // Current tick is always at center

      // If we have position and pool entity data, calculate dynamic positions
      if (position && poolEntity) {
        const currentPrice = poolEntity?.token0Price?.toSignificant(6);
        const lowerPrice = position?.token0PriceLower.toSignificant(6);
        const upperPrice = position?.token0PriceUpper.toSignificant(6);

        if (currentPrice && lowerPrice && upperPrice) {
          const current = parseFloat(currentPrice);
          const lower = parseFloat(lowerPrice);
          const upper = parseFloat(upperPrice);

          // Current price is always at the center (50%)
          // Calculate the visual range based on the position range
          const range = upper - lower;
          const visualRange = range * 3; // Show 3x the range width for context

          // Calculate where the position boundaries fall relative to current price
          const lowerOffset = ((lower - current) / visualRange) * 100;
          const upperOffset = ((upper - current) / visualRange) * 100;

          // Position relative to middle (50%)
          rangeStart = 50 + lowerOffset;
          rangeEnd = 50 + upperOffset;

          // Clamp values to 0-100
          rangeStart = Math.max(0, Math.min(100, rangeStart));
          rangeEnd = Math.max(0, Math.min(100, rangeEnd));
        }
      }

      return (
        <div className="flex items-center gap-2 group relative">
          <div className="h-1.5 w-32 bg-[#E8DEF880] rounded-full overflow-visible relative">
            {/* Range section - blue when in range, red when out of range */}
            <div
              className={`absolute h-full rounded-full ${isInRange ? 'bg-[#4A80F9]' : 'bg-red-500'}`}
              style={{
                left: `${rangeStart}%`,
                width: `${rangeEnd - rangeStart}%`
              }}
            ></div>
            {/* Left boundary line */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 w-0.5 h-3.5 ${isInRange ? 'bg-[#4A80F9]' : 'bg-red-500'}`}
              style={{ left: `${rangeStart}%` }}
            ></div>
            {/* Right boundary line */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 w-0.5 h-3.5 ${isInRange ? 'bg-[#4A80F9]' : 'bg-red-500'}`}
              style={{ left: `${rangeEnd}%` }}
            ></div>
            {/* Current price indicator line - only show when in range */}
            {isInRange && (
              <div
                className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3.5 bg-white z-10"
                style={{ left: `${currentPricePosition}%` }}
              ></div>
            )}
          </div>
          {/* Tooltip */}
          <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-[#1A1A1A] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10 shadow-lg">
            <div className="font-medium mb-1">{row.original.range}</div>
            <div className={`${isInRange ? 'text-green-400' : 'text-red-400'}`}>
              {isInRange ? 'In Range' : 'Out of Range'}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    id: 'pool',
    header: () => <HeaderItem>POOL</HeaderItem>,
    cell: () => (
      <span className="text-white font-normal text-sm">WETH/WBERA</span>
    ),
  },
  {
    accessorKey: 'liquidityUSD',
    header: () => <HeaderItem>LIQUIDITY</HeaderItem>,
    cell: ({ getValue }) => (
      <span className="text-white font-normal text-sm">
        {DynamicFormatAmount({
          amount: (getValue() as number) ?? 0,
          decimals: 2,
          endWith: 'K',
        })}
      </span>
    ),
  },
  {
    accessorKey: 'apr',
    header: () => <HeaderItem>APR</HeaderItem>,
    cell: ({ getValue }) => (
      <span className="text-white font-normal text-sm">
        {(getValue() as number)?.toFixed(2)}%
      </span>
    ),
  },
];
