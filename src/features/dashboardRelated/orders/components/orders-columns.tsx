import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/dashboardRelated/utils'
import { Badge } from '@/components/dashboard/ui/badge'
import { Checkbox } from '@/components/dashboard/ui/checkbox'
import { DataTableColumnHeader } from '@/components/dashboard/data-table'
import { Avatar, AvatarFallback } from '@/components/dashboard/ui/avatar'
import type { OrderOutput } from '@/types/api/data-contracts'
import { DataTableRowActions } from './data-table-row-actions'

// Helper to get initials from name
function getInitials(name: string): string {
  if (!name) return '?'
  const parts = name.trim().split(' ').filter(p => p.length > 0)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase()
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase()
}

export const createOrdersColumns = (formatCurrency: (cents: number) => string): ColumnDef<OrderOutput>[] => [
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
    filterFn: (row, _id, value) => {
      const orderId = row.getValue('id') as number
      const filterValue = typeof value === 'string' ? parseInt(value) : value
      return orderId === filterValue
    },
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
        <div className='flex items-center gap-2 w-[200px]'>
          <Avatar className='h-8 w-8 bg-blue-500 flex-shrink-0'>
            <AvatarFallback className='bg-blue-500 text-white text-xs font-medium'>
              {getInitials(customer.name)}
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-col min-w-0'>
            <span className='text-sm font-medium text-gray-900 truncate'>
              {customer.name}
            </span>
            <span className='text-xs text-gray-500 truncate'>
              {customer.email}
            </span>
          </div>
        </div>
      )
    },
    filterFn: (row, _id, value) => {
      const customer = row.original.customer
      const searchValue = value.toLowerCase()
      
      // Search in customer name, email, and phone
      return (
        customer.name.toLowerCase().includes(searchValue) ||
        customer.email.toLowerCase().includes(searchValue) ||
        customer.phone.toLowerCase().includes(searchValue) ||
        // Also search for partial matches in name and email combined
        `${customer.name} ${customer.email}`.toLowerCase().includes(searchValue)
      )
    },
    meta: { className: 'w-52' },
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
          {formatCurrency(totalAmount * 100)}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    id: 'orderStatus',
    accessorKey: 'slot_reservation_status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Reservation Status' />
    ),
    cell: ({ row }) => {
      const orderStatus = row.original.orderStatus as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | undefined
      const slotStatus = row.original.slot_reservation_status as 'RESERVED' | 'CONFIRMED' | 'EXPIRED' | 'CANCELED' | null
      
      // Show order status if available, otherwise show slot reservation status
      if (orderStatus === 'COMPLETED') {
        return (
          <div className='flex space-x-2 justify-start'>
            <Badge variant='outline' className='bg-purple-100/30 text-purple-900 dark:text-purple-200 border-purple-200'>
              Completed
            </Badge>
          </div>
        )
      }
      
      if (!slotStatus) {
        return (
          <div className='flex space-x-2 justify-start'>
            <Badge variant='outline' className='bg-gray-100/30 text-gray-900 dark:text-gray-200 border-gray-200'>
              No Status
            </Badge>
          </div>
        )
      }
      
      const statusColors = {
        RESERVED: 'bg-blue-100/30 text-blue-900 dark:text-blue-200 border-blue-200',
        CONFIRMED: 'bg-green-100/30 text-green-900 dark:text-green-200 border-green-200',
        EXPIRED: 'bg-red-100/30 text-red-900 dark:text-red-200 border-red-200',
        CANCELED: 'bg-white-100/30 text-red-900 dark:text-red-200 border-red-200',
      }
      
      return (
        <div className='flex space-x-2 justify-start'>
          <Badge variant='outline' className={cn('capitalize', statusColors[slotStatus])}>
            {slotStatus.toLowerCase()}
          </Badge>
        </div>
      )
    },
    filterFn: (row, _id, value) => {
      const orderStatus = row.original.orderStatus as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | undefined
      const slotStatus = row.original.slot_reservation_status as 'RESERVED' | 'CONFIRMED' | 'EXPIRED' | null
      
      // Check if completed filter is selected
      if (value.includes('completed') && orderStatus === 'COMPLETED') {
        return true
      }
      
      if (!slotStatus) {
        return value.includes('no-status')
      }
      return value.includes(slotStatus.toLowerCase())
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
