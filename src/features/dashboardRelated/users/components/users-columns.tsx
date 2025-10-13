import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/dashboardRelated/utils'
import { Badge } from '@/components/dashboard/ui/badge'
import { Checkbox } from '@/components/dashboard/ui/checkbox'
import { DataTableColumnHeader } from '@/components/dashboard/data-table'
import { LongText } from '@/components/dashboard/long-text'
import { roles } from '../data/data'
import { type IUser } from '@/redux/apiSlices/User/userSlice'
import { DataTableRowActions } from './data-table-row-actions'

export const usersColumns: ColumnDef<IUser>[] = [
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
      <DataTableColumnHeader column={column} title='Username' />
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
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36'>{row.getValue('name')}</LongText>
    ),
    meta: { className: 'w-36' },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => (
      <div className='w-fit text-nowrap'>{row.getValue('email')}</div>
    ),
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Phone Number' />
    ),
    cell: ({ row }) => <div>{row.getValue('phone')}</div>,
    enableSorting: false,
  },
  {
    accessorKey: 'isAccountDisabled',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const isDisabled = row.getValue('isAccountDisabled') as boolean
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
      <DataTableColumnHeader column={column} title='Roles' />
    ),
    cell: ({ row }) => {
      const userRoles = row.getValue('roles') as string[]
      
      if (!userRoles || userRoles.length === 0) {
        return <span className='text-sm text-muted-foreground'>No roles</span>
      }

      return (
        <div className='flex flex-wrap gap-1'>
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
    id: 'actions',
    cell: DataTableRowActions,
  },
]
