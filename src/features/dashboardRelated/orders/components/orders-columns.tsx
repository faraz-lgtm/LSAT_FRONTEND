import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/dashboardRelated/utils'
import { Badge } from '@/components/dashboard/ui/badge'
import { Checkbox } from '@/components/dashboard/ui/checkbox'
import { DataTableColumnHeader } from '@/components/dashboard/data-table'
import { LongText } from '@/components/dashboard/long-text'
import { type OrderOutput } from '@/redux/apiSlices/Order/orderSlice'
import { DataTableRowActions } from './data-table-row-actions'

export const ordersColumns: ColumnDef<OrderOutput>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    meta: {
      className: cn('sticky md:table-cell start-0 z-10 rounded-tl-[inherit]'),
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Order ID' />
    ),
    cell: ({ row }) => (
      <div className='font-medium'>#{row.getValue('id')}</div>
    ),
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        'sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none'
      ),
    },
    enableHiding: false,
  },
  {
    id: 'customer',
    accessorKey: 'customer',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Customer' />
    ),
    cell: ({ row }) => {
      const customer = row.original.customer
      return (
        <div className='flex flex-col'>
          <LongText className='max-w-36 font-medium'>{customer.name}</LongText>
          <span className='text-xs text-muted-foreground'>{customer.email}</span>
        </div>
      )
    },
    meta: { className: 'w-40' },
  },
  {
    id: 'phone',
    accessorKey: 'customer',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Phone' />
    ),
    cell: ({ row }) => <div>{row.original.customer.phone}</div>,
    enableSorting: false,
  },
  {
    id: 'items',
    accessorKey: 'items',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Items' />
    ),
    cell: ({ row }) => {
      const items = row.getValue('items') as OrderOutput['items']
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const totalItems = items.reduce((sum:number, item:any) => sum + item.quantity, 0)
      
      return (
        <div className='flex flex-col'>
          <div className='font-medium'>{totalItems} item{totalItems !== 1 ? 's' : ''}</div>
          <div className='text-xs text-muted-foreground'>
            {items.length} service{items.length !== 1 ? 's' : ''}
          </div>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    id: 'totalAmount',
    accessorKey: 'items',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Total Amount' />
    ),
    cell: ({ row }) => {
      const items = row.getValue('items') as OrderOutput['items']
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const totalAmount = items.reduce((sum:number, item:any) => sum + (item.price * item.quantity), 0)
      
      return (
        <div className='font-medium text-green-600 dark:text-green-400'>
          ${totalAmount.toFixed(2)}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    id: 'customerStatus',
    accessorKey: 'customer',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Customer Status' />
    ),
    cell: ({ row }) => {
      const isDisabled = row.original.customer.isAccountDisabled
      const status = isDisabled ? 'disabled' : 'active'
      const badgeColor = isDisabled 
        ? 'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10'
        : 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'
      
      return (
        <div className='flex space-x-2'>
          <Badge variant='outline' className={cn('capitalize', badgeColor)}>
            {status}
          </Badge>
        </div>
      )
    },
    filterFn: (row, _id, value) => {
      const isDisabled = row.original.customer.isAccountDisabled
      const status = isDisabled ? 'disabled' : 'active'
      return value.includes(status)
    },
    enableHiding: false,
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
