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
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import CreatePoolForm from '../../create-pool/CreatePoolForm';
import { cn } from '@/lib/tailwindcss';
import { HoneyContainer } from '@/components/CardContianer/HoneyContainer';
import { popmodal } from '@/services/popmodal';
import { Pool } from './poolsColumns';
import { FiPlusCircle } from 'react-icons/fi';
import { LoadingDisplay } from '@/components/LoadingDisplay/LoadingDisplay';
import { wallet } from '@honeypot/shared/lib/wallet';
import { useObserver } from 'mobx-react-lite';

interface PoolsTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  columnsMy: ColumnDef<TData, TValue>[];
  data: TData[];
  userPools: TData[];
  action?: (args?: any) => void;
  defaultSortingID?: string;
  link?: string;
  showPagination?: boolean;
  searchID?: string;
  loading?: boolean;
  sorting: any;
  setSorting: any;
  defaultFilter?: string;
  showOptions?: boolean;
}

const PoolsTable = <TData, TValue>({
  columns,
  columnsMy,
  data,
  userPools,
  action,
  link,
  showPagination = true,
  loading,
  sorting,
  setSorting,
  defaultFilter = 'trending',
  showOptions = true,
}: PoolsTableProps<TData, TValue>) => {
  const [selectedFilter, setSelectedFilter] = useState<string>(defaultFilter);
  const walletClient = useObserver(() => {
    return wallet.walletClient;
  });

  const filters = [
    { key: 'trending', label: 'All Pools' },
    // { key: "highApr", label: "High APR" },
    // { key: "stablecoin", label: "Stablecoin" },
    { key: 'myPools', label: 'My Pools' },
  ];

  const [tableData, setTableData] = useState<Pool[]>(data as Pool[]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [search, setSearch] = useState('');

  const table = useReactTable({
    data: tableData as TData[],
    columns: selectedFilter === 'myPools' ? columnsMy : columns,
    filterFns: {},
    state: {
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(), //client side filtering
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true,
    debugHeaders: true,
    debugColumns: false,
  });

  useEffect(() => {
    setSelectedFilter(defaultFilter);
  }, [defaultFilter]);

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
    const timerID = setTimeout(() => {
      if (search) {
        setTableData((prev) =>
          prev.filter((data) => {
            return (
              data?.id?.includes(search) ||
              data?.pair?.token0?.symbol?.toLowerCase()?.includes(search) ||
              data?.pair?.token1?.symbol?.toLowerCase()?.includes(search) ||
              data?.pair?.token1?.name?.toLowerCase()?.includes(search) ||
              data?.pair?.token1?.name?.toLowerCase()?.includes(search) ||
              data?.pair?.token0?.id?.toLowerCase()?.includes(search) ||
              data?.pair?.token1?.id?.toLowerCase()?.includes(search)
            );
          })
        );
      } else {
        if (selectedFilter === 'myPools') {
          setTableData(userPools as Pool[]);
        } else {
          setTableData(data as Pool[]);
        }
      }
    }, 500);

    if (timerID) {
      return () => clearTimeout(timerID);
    }
  }, [data, search, userPools, selectedFilter]);

  const handleChangePools = (filter: string) => {
    setTableData(data as Pool[]);
  };

  return (
    <div>
      {searchID && showOptions && (
        <div className="flex flex-col xl:flex-row gap-4 w-full xl:justify-between xl:items-center py-4">
          <div className="flex items-center xl:gap-x-6 w-full xl:w-fit justify-between">
            <div className="flex items-center">
              {filters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => {
                    handleChangePools(filter.key);
                    setSelectedFilter(filter.key);
                  }}
                  className={`p-2.5 cursor-pointer ${
                    selectedFilter === filter.key
                      ? 'border border-[#E18A20]/40 bg-[#E18A20]/40 rounded-[10px]'
                      : ''
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            {/* TODO：placeholder text vertical-align: middle */}
            <div className="relative">
              <input
                placeholder="Search pool"
                value={search}
                type="text"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setSearch(event.target.value);
                }}
                className="border border-[#E18A20]/10 bg-[#271A0C] pl-12 pr-4 h-12 w-[353px] focus:border-opacity-100 rounded-2xl placeholder:align-middle"
              />
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-border"
                size={20}
              />
            </div>
          </div>
          <div className="flex items-center gap-x-5">
            <Button
              className={cn(
                'flex items-center gap-x-1 p-2.5 cursor-pointer border border-[#E18A20]/40 bg-[#E18A20]/40 rounded-[10px]'
              )}
              onClick={() =>
                walletClient &&
                popmodal.openModal({
                  content: <CreatePoolForm />,
                  boarderLess: true,
                  shouldCloseOnInteractOutside: false,
                })
              }
              disabled={!walletClient}
            >
              <FiPlusCircle />
              <span>Create Pool</span>
            </Button>

            <div className="flex gap-2 max-md:gap-4 items-center w-fit ml-auto max-sm:hidden">
              {/* <label
                className="flex gap-2 items-center"
                htmlFor="farmingAvailable"
              >
                <span className="max-md:hidden">Farming Available</span>
              </label> */}
              {/* TODO: switch color */}
              {/* <Switch
                className="bg-[#865215]"
                id="farmingAvailable"
                checked={table.getColumn("plugins")?.getFilterValue() === true}
                onCheckedChange={() => {
                  const column = table.getColumn("plugins");
                  if (column?.getFilterValue() === undefined)
                    column?.setFilterValue(true);
                  else column?.setFilterValue(undefined);
                }}
              /> */}
              {/* <LayoutGrid className="text-[#F7941D80]/50 cursor-pointer text-xl" /> */}
            </div>
          </div>
        </div>
      )}
      <HoneyContainer>
        {!loading ? (
          <Table className="rounded-[30px]">
            <TableHeader className="[&_tr]:border-b border-black [&_tr]:border-opacity-30 border-opacity-60 border-y-3">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="hover:bg-transparent border-black"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      onClick={header.column.getToggleSortingHandler()}
                      key={header.id}
                      className={`rounded-xl text-white font-semibold [&_svg]:mt-auto ${
                        header.column.getCanSort()
                          ? 'cursor-pointer select-none'
                          : ''
                      }`}
                    >
                      <div className="flex items-center">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽',
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="hover:bg-transparent text-[16px]">
              {!table.getRowModel().rows.length ? (
                <TableRow className="hover:bg-white border-white h-full">
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row: any) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className="border-card-border/40 bg-card-dark hover:bg-white cursor-pointer border-black"
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
                ))
              )}
            </TableBody>
          </Table>
        ) : (
          <LoadingDisplay />
        )}
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
export default PoolsTable;
