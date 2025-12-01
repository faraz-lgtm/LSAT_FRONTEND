import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/dashboardRelated/utils'
import { Badge } from '@/components/dashboard/ui/badge'
import { Checkbox } from '@/components/dashboard/ui/checkbox'
import { DataTableColumnHeader } from '@/components/dashboard/data-table'
import { LongText } from '@/components/dashboard/long-text'
import { roles } from '../data/data'
import { type UserOutput } from '@/types/api/data-contracts'
import { DataTableRowActions } from './data-table-row-actions'
import { ClickableOrderBadge } from './clickable-order-badge'
import { CheckCircle, AlertTriangle } from 'lucide-react'

export const usersColumns: ColumnDef<UserOutput>[] = [
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
    accessorKey: 'username',
    header: ({ column }) => (
      <div className="flex items-center justify-start">
        <DataTableColumnHeader column={column} title='Username' />
      </div>
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36 ps-3'>{row.getValue('username')}</LongText>
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
    accessorKey: 'name',
    header: ({ column }) => (
      <div className="flex items-center justify-start">
        <DataTableColumnHeader column={column} title='Name' />
      </div>
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36'>{row.getValue('name')}</LongText>
    ),
    meta: { className: 'w-36' },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <div className="flex items-center justify-start">
        <DataTableColumnHeader column={column} title='Email' />
      </div>
    ),
    cell: ({ row }) => (
      <div className='w-fit text-nowrap text-left'>{row.getValue('email')}</div>
    ),
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => (
      <div className="flex items-center justify-start">
        <DataTableColumnHeader column={column} title='Phone Number' />
      </div>
    ),
    cell: ({ row }) => <div className='text-left'>{row.getValue('phone')}</div>,
    enableSorting: false,
  },
  {
    accessorKey: 'ordersCount',
    header: ({ column }) => (
      <div className="flex items-center justify-start">
        <DataTableColumnHeader column={column} title='Orders' />
      </div>
    ),
    cell: ({ row }) => {
      const ordersCount = row.getValue('ordersCount') as number
      const user = row.original
      
      return <ClickableOrderBadge user={user} ordersCount={ordersCount} />
    },
    filterFn: (row, id, value) => {
      const ordersCount = row.getValue(id) as number
      const userRoles = row.getValue('roles') as string[]
      const isLead = ordersCount === 0 && userRoles.includes('CUST')
      const isCustomer = ordersCount > 0 && userRoles.includes('CUST')
      
      if (value.includes('leads') && isLead) return true
      if (value.includes('customers') && isCustomer) return true
      return false
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'isAccountDisabled',
    header: ({ column }) => (
      <div className="flex items-center justify-start">
        <DataTableColumnHeader column={column} title='Status' />
      </div>
    ),
    cell: ({ row }) => {
      const isDisabled = row.getValue('isAccountDisabled') as boolean
      const status = isDisabled ? 'disabled' : 'active'
      const badgeColor = isDisabled 
        ? 'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10'
        : 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'
      
      return (
        <div className='flex space-x-2 justify-start'>
          <Badge variant='outline' className={cn('capitalize', badgeColor)}>
            {status}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const isDisabled = row.getValue(id) as boolean
      const status = isDisabled ? 'disabled' : 'active'
      return value.includes(status)
    },
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: 'roles',
    header: ({ column }) => (
      <div className="flex items-center justify-start">
        <DataTableColumnHeader column={column} title='Roles' />
      </div>
    ),
    cell: ({ row }) => {
      const userRoles = row.getValue('roles') as string[]
      
      if (!userRoles || userRoles.length === 0) {
        return <span className='text-sm text-muted-foreground text-left'>No roles</span>
      }

      return (
        <div className='flex flex-wrap gap-1 justify-start'>
          {userRoles.map((role, index) => {
            const userType = roles.find(({ value }) => value === role.toLowerCase())
            
            return (
              <div key={index} className='flex items-center gap-x-1'>
                {userType?.icon && (
                  <userType.icon size={12} className='text-muted-foreground' />
                )}
                <span className='text-xs capitalize'>{role}</span>
              </div>
            )
          })}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const userRoles = row.getValue(id) as string[]
      return userRoles.some(role => value.includes(role.toLowerCase()))
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'googleCalendarIntegration',
    header: ({ column }) => (
      <div className="flex items-center justify-start">
        <DataTableColumnHeader column={column} title='Calendar Integration' />
      </div>
    ),
    cell: ({ row }) => {
      const calendarIntegration = row.getValue('googleCalendarIntegration') as boolean
      console.log('calendarIntegration', calendarIntegration)
      console.log('row', row)
      
      return (
        <div className='flex items-center justify-center'>
          {calendarIntegration ? (
            <CheckCircle className='h-5 w-5 text-green-600 dark:text-green-500' />
          ) : (
            <AlertTriangle className='h-5 w-5 text-red-600 dark:text-red-500' />
          )}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
