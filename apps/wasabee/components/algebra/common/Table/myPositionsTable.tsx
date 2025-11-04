import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/algebra/ui/table';

import { cn } from '@nextui-org/theme';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronDown } from 'lucide-react';
import { useCallback, useState } from 'react';
import { LoadingState } from './loadingState';
import { usePositionFilterStore } from '@/lib/algebra/state/positionFilterStore';
import { PositionsStatus } from '@/types/algebra/types/position-filter-status';

interface MyPositionsTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  selectedRow?: number;
  action?: (args?: any) => void;
  defaultSortingID?: string;
  link?: string;
  showPagination?: boolean;
  searchID?: string;
  loading?: boolean;
}

const MyPositionsTable = <TData, TValue>({
  columns,
  data,
  selectedRow,
  action,
  link,
  defaultSortingID,
  loading,
}: MyPositionsTableProps<TData, TValue>) => {
  const [sorting, setSorting] = useState<SortingState>(
    defaultSortingID ? [{ id: defaultSortingID, desc: true }] : []
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [expandActive, setExpandActive] = useState(true);
  const [expandOnFarming, setExpandOnFarming] = useState(true);
  const [expandClosed, setExpandClosed] = useState(true);

  const { filterStatus } = usePositionFilterStore();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  const activePositions = data.filter(
    (pos: any) => !pos.inFarming && !pos.isClosed
  );

  const farmingPositions = data.filter(
    (pos: any) => pos.inFarming && !pos.isClosed
  );

  const closedPositions = data.filter((pos: any) => pos.isClosed);

  const noActivePositions = filterStatus.Open && activePositions.length === 0;
  const noFarmingPositions =
    filterStatus.OnFarming && farmingPositions.length === 0;
  const noClosedPositions = filterStatus.Closed && closedPositions.length === 0;

  const renderPositions = useCallback(
    (positionStatus: PositionsStatus) => {
      const isStatusActive = positionStatus === PositionsStatus.OPEN;
      const isStatusOnFarming = positionStatus === PositionsStatus.ON_FARMING;
      const isStatusClosed = positionStatus === PositionsStatus.CLOSED;

      return table.getRowModel().rows.map((row: any) => {
        const isSelected = Number(selectedRow) === Number(row.original.id);
        if (
          (isStatusActive &&
            !row.original.inFarming &&
            !row.original.isClosed) ||
          (isStatusOnFarming &&
            row.original.inFarming &&
            !row.original.isClosed) ||
          (isStatusClosed && row.original.isClosed)
        ) {
          return (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && 'selected'}
              className={`border-b border-[#3B2712] bg-transparent text-white ${
                isSelected ? 'bg-[#271A0C]' : ''
              } ${(action || link) && 'cursor-pointer'} ${
                action || link
                  ? isSelected
                    ? 'hover:bg-[#2D2115]'
                    : 'hover:bg-[#1C1208]'
                  : ''
              } ${
                isStatusActive && !expandActive && 'collapse border-0 opacity-0'
              } ${
                isStatusOnFarming &&
                !expandOnFarming &&
                'collapse border-0 opacity-0'
              }
                            ${
                              isStatusClosed &&
                              !expandClosed &&
                              'collapse border-0 opacity-0'
                            }`}
              onClick={() => {
                if (action) {
                  action(row.original.id);
                } else if (link) {
                  window.location.href = `/${link}/${row.original.id}`;
                }
              }}
            >
              {row.getVisibleCells().map((cell: any) => (
                <TableCell key={cell.id} className="px-6 py-5 text-left text-white">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          );
        } else return null;
      });
    },
    [
      action,
      link,
      expandActive,
      expandOnFarming,
      expandClosed,
      selectedRow,
      table,
    ]
  );

  if (loading) return <LoadingState />;

  return (
    <Table>
      <TableHeader className="[&_tr]:border-b-0">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow
            key={headerGroup.id}
            className="hover:bg-transparent border-0"
          >
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                className="px-6 py-4 text-xs text-gray-400 font-medium uppercase [&_svg]:mt-auto"
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody className="text-sm transition-all">
        {table.getRowModel().rows?.length === 0 ||
        (!filterStatus.Open &&
          !filterStatus.Closed &&
          !filterStatus.OnFarming) ||
        (noActivePositions && noFarmingPositions && !filterStatus.Closed) ||
        (noActivePositions && noClosedPositions && !filterStatus.OnFarming) ||
        (noActivePositions &&
          !filterStatus.Closed &&
          !filterStatus.OnFarming) ||
        (noFarmingPositions && noClosedPositions && !filterStatus.Open) ||
        (noFarmingPositions && !filterStatus.Open && !filterStatus.Closed) ||
        (noClosedPositions && !filterStatus.Open && !filterStatus.OnFarming) ? (
          <TableRow className="hover:bg-transparent h-full border-0">
            <TableCell
              colSpan={columns.length}
              className="h-24 text-center text-gray-400"
            >
              No results.
            </TableCell>
          </TableRow>
        ) : (
          <>
            {activePositions.length > 0 && filterStatus.Open && (
              <>{renderPositions(PositionsStatus.OPEN)}</>
            )}

            {farmingPositions.length > 0 && filterStatus.OnFarming && (
              <>{renderPositions(PositionsStatus.ON_FARMING)}</>
            )}
            {closedPositions.length > 0 && filterStatus.Closed && (
              <>{renderPositions(PositionsStatus.CLOSED)}</>
            )}
          </>
        )}
      </TableBody>
    </Table>
  );
};

export default MyPositionsTable;
