'use client';

import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type FilterFn,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';
import { Input } from '../input';
import { Button } from '../button';

const globalFilterFn: FilterFn<any> = (row, columnId, value, addMeta) => {
  const safeValue = (() => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (value == null) return '';
    return String(value);
  })();

  if (safeValue === '') return true;

  const searchableValues: string[] = [];

  row.getAllCells().forEach((cell) => {
    const columnDef = cell.column.columnDef;

    // @ts-ignore
    if (columnDef.accessorKey === 'id') {
      const cellValue = cell.getValue();
      if (cellValue != null) {
        if (typeof cellValue === 'string' || typeof cellValue === 'number') {
          searchableValues.push(String(cellValue));
        } else if (typeof cellValue === 'object' && 'label' in cellValue) {
          searchableValues.push(String((cellValue as any).label));
        } else {
          searchableValues.push(String(cellValue));
        }
      }
    }
  });

  // Check if any value contains the search term (case insensitive)
  const searchTerm = safeValue.toLowerCase();
  return searchableValues.some((val) => val.toLowerCase().includes(searchTerm));
};

export interface TableAction {
  label: string;
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  className?: string;
  isDisabled?: boolean;
  onClick?: () => void;
}

interface GenericTanstackTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  className?: string;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  searchPlaceholder?: string;
  emptyMessage?: string;
}

export default function GenericTanstackTable<T>({
  data,
  columns,
  className = '',
  enableSorting = true,
  enableFiltering = true,
  enablePagination = true,
  pageSize = 10,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No data available',
}: GenericTanstackTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = React.useState('');

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    getPaginationRowModel: enablePagination
      ? getPaginationRowModel()
      : undefined,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: globalFilterFn,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  return (
    <div
      className={`border-2 border-dashed border-black bg-white/90 rounded-lg shadow-[0px_0px_4px_4px_rgba(255, 255, 255, 1)] ${className}`}
    >
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="font-theader text-sm leading-[150%] tracking-0 text-center text-gray-500">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-gray-200">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-center text-sm  text-gray-500 bg-gray-50/50"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={`flex items-center justify-center gap-2 font-medium ${
                          header.column.getCanSort()
                            ? 'cursor-pointer select-none hover:text-gray-900'
                            : ''
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/50">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 text-center text-sm text-gray-900"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {enablePagination && table.getPageCount() > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </span>
            <span className="text-sm text-gray-500">
              ({table.getFilteredRowModel().rows.length} total rows)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              //   variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              //   variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to create action cell
export const createActionCell = (action: TableAction) => {
  return (
    <div className="flex justify-center items-center w-full">
      <button
        className={action.className || ''}
        disabled={action.isDisabled}
        onClick={action.onClick}
      >
        {action.label}
      </button>
    </div>
  );
};
