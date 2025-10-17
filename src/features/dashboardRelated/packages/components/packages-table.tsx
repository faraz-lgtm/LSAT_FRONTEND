import { useEffect, useState } from 'react'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/lib/dashboardRelated/utils'
import { type NavigateFn, useTableUrlState } from '@/hooks/dashboardRelated/use-table-url-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/dashboard/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/dashboard/data-table'
import { DataTableBulkActions } from './data-table-bulk-actions.tsx'
import { packagesColumns as columns } from './packages-columns.tsx'
import type { ProductOutput } from '@/types/api/data-contracts'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    className: string
  }
}

type DataTableProps = {
  data: ProductOutput[]
  search: Record<string, unknown>
  navigate: NavigateFn
} 

export function PackagesTable({ data, search, navigate }: DataTableProps) {
  console.log("PackagesTable received data:", data);
  console.log("PackagesTable data length:", data?.length);
  
  // Validate data structure
  const isValidData = Array.isArray(data) && data.every(item => 
    item && 
    typeof item.id === 'number' && 
    typeof item.name === 'string' && 
    typeof item.price === 'number'
  );
  
  console.log("Data validation result:", isValidData);
  
  // Use validated data or empty array
  const tableData = isValidData ? data : [];
  
  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])

  // Synced with URL states (keys/defaults mirror packages route search schema)
  const {
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: false },
    columnFilters: [
      { columnId: 'name', searchKey: 'name', type: 'string' },
      { columnId: 'price', searchKey: 'price', type: 'string' },
    ],
  })

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
    enableRowSelection: true,
    onPaginationChange,
    onColumnFiltersChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  useEffect(() => {
    ensurePageInRange(table.getPageCount())
  }, [table, ensurePageInRange])

  // Debug table state
  console.log("Table rows:", table.getRowModel().rows);
  console.log("Table rows length:", table.getRowModel().rows?.length);
  console.log("Table column filters:", columnFilters);
  console.log("Table pagination:", pagination);
  console.log("Table data validation:", { isValidData, originalDataLength: data?.length, tableDataLength: tableData.length });

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        searchKey="name"
        searchPlaceholder="Filter packages..."
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(header.column.columnDef.meta?.className)}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(cell.column.columnDef.meta?.className)}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {!isValidData ? (
                    <div className="text-red-500">
                      Invalid data format. Please check the API response.
                    </div>
                  ) : (
                    "No packages found."
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <DataTableBulkActions table={table} />
        <DataTablePagination table={table} />
      </div>
    </div>
  )
}
