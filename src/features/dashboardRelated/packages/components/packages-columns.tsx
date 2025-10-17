import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/dashboardRelated/utils'
import { Badge } from '@/components/dashboard/ui/badge'
import { Checkbox } from '@/components/dashboard/ui/checkbox'
import { DataTableColumnHeader } from '@/components/dashboard/data-table'
import { LongText } from '@/components/dashboard/long-text'
import type { ProductOutput } from '@/types/api/data-contracts'
import { DataTableRowActions } from './data-table-row-actions'

export const packagesColumns: ColumnDef<ProductOutput>[] = [
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
      <DataTableColumnHeader column={column} title='ID' />
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
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Package Name' />
    ),
    cell: ({ row }) => (
      <div className='font-medium'>{row.getValue('name')}</div>
    ),
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        'sticky start-20 @4xl/content:table-cell @4xl/content:drop-shadow-none'
      ),
    },
    enableHiding: false,
  },
  {
    accessorKey: 'price',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Price' />
    ),
    cell: ({ row }) => {
      const price = row.getValue('price') as number
      return <div className='font-medium'>${price}</div>
    },
  },
  {
    accessorKey: 'save',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Save' />
    ),
    cell: ({ row }) => {
      const save = row.getValue('save') as number | undefined
      return save ? <div className='text-green-600 font-medium'>${save}</div> : <div className='text-muted-foreground'>-</div>
    },
  },
  {
    accessorKey: 'sessions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Sessions' />
    ),
    cell: ({ row }) => {
      const sessions = row.getValue('sessions') as number
      return <div className='font-medium'>{sessions}</div>
    },
  },
  {
    accessorKey: 'Duration',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Duration' />
    ),
    cell: ({ row }) => (
      <div>{row.getValue('Duration')}</div>
    ),
  },
  {
    accessorKey: 'Description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Description' />
    ),
    cell: ({ row }) => {
      const description = row.getValue('Description') as string
      return (
        <LongText className="max-w-48">
          {description || 'No description'}
        </LongText>
      )
    },
  },
  {
    accessorKey: 'badge',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Badge' />
    ),
    cell: ({ row }) => {
      const badge = row.getValue('badge') as ProductOutput['badge']
      return badge ? (
        <Badge 
          variant="secondary" 
          style={{ 
            backgroundColor: badge.color,
            color: '#ffffff',
            border: 'none'
          }}
          className="px-3 py-1 rounded-full text-sm font-medium"
        >
          {badge.text}
        </Badge>
      ) : (
        <div className='text-muted-foreground'>-</div>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string
      return <div>{new Date(date).toLocaleDateString()}</div>
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
    meta: {
      className: cn('sticky end-0 z-10 rounded-tr-[inherit]'),
    },
  },
]
