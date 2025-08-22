import { ColumnDef } from '@tanstack/react-table';
import { HeaderItem } from './common';
import { formatUSD } from '@/lib/algebra/utils/common/formatUSD';
import { DynamicFormatAmount } from '@/lib/algebra/utils/common/formatAmount';

interface MyPosition {
  id: number;
  outOfRange: boolean;
  range: string;
  liquidityUSD: number;
  feesUSD: number;
  apr: number;
}

export const myPositionsColumns: ColumnDef<MyPosition>[] = [
  {
    accessorKey: 'id',
    header: () => <HeaderItem className="ml-2">ID</HeaderItem>,
    cell: ({ getValue }) => (
      <span className="font-medium">{`#${getValue()}`}</span>
    ),
  },
  {
    accessorKey: 'liquidityUSD',
    header: ({ column }) => (
      <HeaderItem
        sort={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        isAsc={column.getIsSorted() === 'asc'}
      >
        Liquidity
      </HeaderItem>
    ),
    cell: ({ getValue }) => (
      <span className="font-medium">
        $
        {DynamicFormatAmount({
          amount: (getValue() as number) ?? 0,
          decimals: 2,
          endWith: '',
        })}
      </span>
    ),
  },
  {
    accessorKey: 'feesUSD',
    header: ({ column }) => (
      <HeaderItem
        sort={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        isAsc={column.getIsSorted() === 'asc'}
      >
        Fees
      </HeaderItem>
    ),
    cell: ({ getValue }) => (
      <span className="font-medium">
        $
        {DynamicFormatAmount({
          amount: (getValue() as number).toString(),
          decimals: 10,
          endWith: '',
        })}
      </span>
    ),
  },
  {
    accessorKey: 'outOfRange',
    header: ({ column }) => (
      <HeaderItem
        className="min-w-[100px]"
        sort={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        isAsc={column.getIsSorted() === 'asc'}
      >
        Status
      </HeaderItem>
    ),
    cell: ({ getValue }) =>
      getValue() ? (
        <span className="px-3 py-1 rounded-md bg-yellow-50 text-yellow-600 text-sm font-medium  whitespace-nowrap">
          Out of range
        </span>
      ) : (
        <span className="px-3 py-1 rounded-md bg-green-50 text-green-500 text-sm font-medium  whitespace-nowrap">
          In range
        </span>
      ),
  },
  {
    accessorKey: 'range',
    header: () => <HeaderItem className="min-w-[250px]">Range</HeaderItem>,
    cell: ({ getValue }) => (
      <span className="font-mono text-sm ">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: 'apr',
    header: ({ column }) => (
      <HeaderItem
        sort={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        isAsc={column.getIsSorted() === 'asc'}
      >
        APR
      </HeaderItem>
    ),
    cell: ({ getValue }) => (
      <span className="font-medium text-[#F7931A]">
        {(getValue() as number)?.toFixed(2)}%
      </span>
    ),
  },
];
