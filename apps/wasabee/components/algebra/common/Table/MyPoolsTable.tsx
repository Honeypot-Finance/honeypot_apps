import { Button } from '@/components/algebra/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/algebra/ui/table';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { LoadingState } from './loadingState';
import { Input } from '@/components/algebra/ui/input';
import { Search, Plus, LayoutGrid } from 'lucide-react';
import { Switch } from '@/components/algebra/ui/switch';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@nextui-org/react';
import CreatePoolForm from '../../create-pool/CreatePoolForm';

import { cn } from '@nextui-org/theme';
import { HoneyContainer } from '@/components/CardContianer';

interface PoolsTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  action?: (args?: any) => void;
  defaultSortingID?: string;
  link?: string;
  showPagination?: boolean;
  searchID?: string;
  loading?: boolean;
}

const MyPoolsTable = <TData, TValue>({
  columns,
  data,
  action,
  link,
  defaultSortingID,
  showPagination = true,
  loading,
}: PoolsTableProps<TData, TValue>) => {
  const [sorting, setSorting] = useState<SortingState>(
    defaultSortingID ? [{ id: defaultSortingID, desc: true }] : []
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: showPagination ? getPaginationRowModel() : undefined,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    globalFilterFn: (row: any, _, value: boolean | undefined) =>
      row.original.isMyPool === value,
  });

  const searchID = 'pair';

  const totalRows = table.getFilteredRowModel().rows.length;
  const startsFromRow =
    table.getState().pagination.pageIndex *
      table.getState().pagination.pageSize +
    1;
  const endsAtRow = Math.min(
    startsFromRow + table.getState().pagination.pageSize - 1,
    totalRows
  );
  useEffect(() => {
    table.setGlobalFilter(true);
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div>
      {searchID && (
        <div className="flex flex-col xl:flex-row gap-4 w-full xl:justify-between xl:items-center py-4">
          <div className="flex items-center xl:gap-x-6 w-full xl:w-fit justify-between">
            {/* <div className="flex items-center">
              {filters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => {
                    if (filter.key === "myPools") {
                      table.setGlobalFilter(true);
                    } else {
                      table.setGlobalFilter(undefined);
                    }
                    setSelectedFilter(filter.key);
                  }}
                  className={`p-2.5 cursor-pointer ${
                    selectedFilter === filter.key
                      ? "border border-[#E18A20]/40 bg-[#E18A20]/40 rounded-[10px]"
                      : ""
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div> */}
            {/* TODO：placeholder text vertical-align: middle */}
            {/* <div className="relative">
              <Input
                placeholder="Search pool"
                value={
                  (table.getColumn(searchID)?.getFilterValue() as string) ?? ""
                }
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  table.getColumn(searchID)?.setFilterValue(event.target.value)
                }
                className="border border-[#E18A20]/10 bg-[#271A0C] pl-12 pr-4 h-12 w-[353px] focus:border-opacity-100 rounded-2xl placeholder:align-middle"
              />
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-border"
                size={20}
              />
            </div> */}
          </div>
        </div>
      )}
      {/* FIXME: border radius display */}
      <HoneyContainer>
        <Table className="rounded-[30px]">
          <TableHeader className="[&_tr]:border-b border-black [&_tr]:border-opacity-30  border-opacity-60  border-y-3">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent border-black"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="rounded-xl text-white font-semibold [&_svg]:mt-auto"
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
          <TableBody className="hover:bg-transparent text-[16px]">
            {!table.getRowModel().rows.length ? (
              <TableRow className="hover:bg-card border-white h-full">
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row: any) => {
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className="border-card-border/40 bg-card-dark hover:bg-card-hover cursor-pointer border-black hover:bg-black"
                    onClick={() => {
                      if (action) {
                        action(row.original.id);
                      } else if (link) {
                        window.location.href = `/${link}/${row.original.id}`;
                      }
                    }}
                  >
                    {row.getVisibleCells().map((cell: any) => (
                      <TableCell
                        key={cell.id}
                        className="text-left min-w-[120px] first:min-w-[320px]"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        {showPagination && (
          <div className="flex items-center justify-end space-x-2 px-4 mt-2 text-white">
            {totalRows > 0 && (
              <p className="mr-2">
                {startsFromRow === totalRows
                  ? `${startsFromRow} of ${totalRows}`
                  : `${startsFromRow} - ${endsAtRow} of ${totalRows}`}
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        )}
      </HoneyContainer>
    </div>
  );
};
export default MyPoolsTable;
