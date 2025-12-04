import { useState } from 'react'
import {
  type ColumnDef,
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
import { MoreHorizontal, Eye, FileX } from 'lucide-react'
import { Button } from '@/components/dashboard/ui/button'
import { DataTableToolbar, DataTablePagination } from '@/components/dashboard/data-table'
import { DataTableBulkActions } from '@/components/dashboard/data-table/bulk-actions'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/dashboard/ui/table'
import { type NavigateFn, useTableUrlState } from '@/hooks/dashboardRelated/use-table-url-state'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/dashboard/ui/dropdown-menu'
import { InvoiceStatusBadge } from '@/components/dashboard/ui/invoice-status-badge'
import { formatDollarsToCurrency } from '@/utils/currency'
import { useInvoices } from './invoices-provider'
import type { InvoiceOutput } from '@/redux/apiSlices/Invoicing/invoicingSlice'
import type { UserOutput } from '@/types/api/data-contracts'

type DataTableProps = {
  data: InvoiceOutput[]
  users: UserOutput[]
  search: Record<string, unknown>
  navigate: NavigateFn
}

// Component to display invoice amount (always in original currency, no conversion for dashboard)
function InvoiceAmountCell({ amount, currency }: { 
  amount: string, 
  currency: string 
}) {
  // Amounts in invoice are stored as strings in dollars (e.g., "12500.00")
  return <div className="font-medium">{formatDollarsToCurrency(amount, currency)}</div>
}

export function InvoicesTable({ data, users, search, navigate }: DataTableProps) {
  const { setOpen, setCurrentRow } = useInvoices()
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  // Create a map of userId -> userName for quick lookup
  const userMap = new Map(users.map(user => [user.id, user.name]))

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
      { columnId: 'customerName', searchKey: 'filter', type: 'string' },
      { columnId: 'status', searchKey: 'status', type: 'array' },
    ],
  })

  const columns: ColumnDef<InvoiceOutput>[] = [
    {
      accessorKey: 'invoiceNumber',
      header: 'Invoice #',
      cell: ({ row }) => {
        return <div className="font-medium">{row.getValue('invoiceNumber')}</div>
      },
    },
    {
      accessorKey: 'orderId',
      header: 'Order ID',
      cell: ({ row }) => {
        const orderId = row.getValue('orderId') as number
        return (
          <button
            onClick={() => {
              window.location.href = `/dashboard/orders/?orderId=${orderId}`
            }}
            className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
          >
            #{orderId}
          </button>
        )
      },
    },
    {
      accessorKey: 'customerId',
      header: 'Customer',
      cell: ({ row }) => {
        const customerId = row.getValue('customerId') as number
        const customerName = userMap.get(customerId) || `Unknown (${customerId})`
        return <div>{customerName}</div>
      },
    },
    {
      accessorKey: 'total',
      header: 'Amount',
      cell: ({ row }) => {
        const invoice = row.original
        const amount = row.getValue('total') as string
        return <InvoiceAmountCell 
          amount={amount} 
          currency={invoice.currency}
        />
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as InvoiceOutput['status']
        return <InvoiceStatusBadge status={status} />
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => {
        const dueDate = row.getValue('dueDate') as string
        return <div>{new Date(dueDate).toLocaleDateString()}</div>
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => {
        const createdAt = row.getValue('createdAt') as string
        return <div>{new Date(createdAt).toLocaleDateString()}</div>
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const invoice = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(invoice.invoiceNumber)}
              >
                Copy invoice number
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setCurrentRow(invoice)
                  setOpen('view')
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                View details
              </DropdownMenuItem>
              {invoice.status === 'draft' && (
                <DropdownMenuItem
                  onClick={() => {
                    setCurrentRow(invoice)
                    setOpen('void')
                  }}
                >
                  <FileX className="mr-2 h-4 w-4" />
                  Void invoice
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange,
    onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  ensurePageInRange(table.getPageCount())

  const statusOptions = [
    { label: 'Draft', value: 'draft' },
    { label: 'Sent', value: 'sent' },
    { label: 'Paid', value: 'paid' },
    { label: 'Overdue', value: 'overdue' },
    { label: 'Void', value: 'void' },
  ]

  const filters = [
    {
      columnId: 'status',
      title: 'Status',
      options: statusOptions,
    },
  ]

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table as any}
        searchKey="customerName"
        searchPlaceholder="Filter by customer..."
        filters={filters}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow 
                  key={row.id} 
                  data-state={row.getIsSelected() && 'selected'}
                  className='cursor-pointer'
                  onDoubleClick={() => {
                    setCurrentRow(row.original)
                    setOpen('view')
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No invoices found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table as any} />
      <DataTableBulkActions
        table={table as any}
        entityName="invoice"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const selectedRows = table.getFilteredSelectedRowModel().rows
            console.log('Exporting:', selectedRows.map(row => row.original))
          }}
        >
          Export selected
        </Button>
      </DataTableBulkActions>
    </div>
  )
}