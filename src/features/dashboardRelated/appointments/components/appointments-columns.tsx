import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/dashboard/ui/badge'
import { Checkbox } from '@/components/dashboard/ui/checkbox'
import { DataTableColumnHeader } from '@/components/dashboard/data-table'
import { format } from 'date-fns'
import type { TaskOutputDto } from '@/types/api/data-contracts'
import type { UserOutput } from '@/types/api/data-contracts'
import { Circle, CheckCircle, Timer, CircleOff, Eye, ExternalLink } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/dashboard/ui/button'

const statuses = [
  { label: 'Pending', value: 'pending' as const, icon: Circle },
  { label: 'In Progress', value: 'in_progress' as const, icon: Timer },
  { label: 'Completed', value: 'completed' as const, icon: CheckCircle },
  { label: 'Cancelled', value: 'cancelled' as const, icon: CircleOff },
]

const attendanceStatuses = [
  { label: 'Pending', value: 'UNKNOWN' as const, color: 'bg-gray-100 text-gray-800' },
  { label: 'Completed', value: 'SHOWED' as const, color: 'bg-green-100 text-green-800' },
  { label: 'No Show', value: 'NO_SHOW' as const, color: 'bg-red-100 text-red-800' },
  { label: 'Rescheduled', value: 'RESCHEDULED' as const, color: 'bg-blue-100 text-blue-800' },
]

export const createAppointmentsColumns = (
  onView?: (row: TaskOutputDto) => void,
  userIdToUser?: Record<number, UserOutput>,
  emailToUser?: Record<string, UserOutput>
): ColumnDef<TaskOutputDto>[] => [
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
    cell: ({ row }) => <div className='w-[80px] font-medium'>#{row.getValue('id')}</div>,
    enableHiding: false,
  },
  {
    id: 'orderId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Order' />
    ),
    cell: ({ row }) => {
      const task = row.original as TaskOutputDto
      if (!task.orderId) {
        return <div className='w-[100px]'>—</div>
      }
      return <OrderIdCell orderId={task.orderId} />
    },
    accessorFn: (row) => row.orderId || -1,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Title' />
    ),
    cell: ({ row }) => (
      <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
        {row.getValue('title')}
      </span>
    ),
  },
  {
    id: 'tutor',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Assigned To' />
    ),
    cell: ({ row }) => {
      const task = row.original as TaskOutputDto
      const tutorId = task.tutorId
      const user = tutorId && userIdToUser ? userIdToUser[tutorId] : undefined
      return (
        <div className='w-[150px] truncate'>
          {user?.name || '—'}
        </div>
      )
    },
    accessorFn: (row) => {
      const tutorId = row.tutorId
      const user = tutorId && userIdToUser ? userIdToUser[tutorId] : undefined
      return user?.name || ''
    },
  },
  {
    id: 'customer',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Customer' />
    ),
    cell: ({ row }) => {
      const task = row.original as TaskOutputDto
      const customerInvitee = task.invitees?.find((i) => i.name === 'Customer')
      
      if (!customerInvitee) {
        return <div className='w-[150px] truncate'>—</div>
      }
      
      const customerEmail = customerInvitee.email
      const customer = customerEmail && emailToUser ? emailToUser[customerEmail.toLowerCase()] : undefined
      const displayValue = customer?.name || customerInvitee.name || customerEmail || '—'
      
      return (
        <div className='w-[150px] truncate' title={customerEmail}>
          {displayValue}
        </div>
      )
    },
  },
  {
    accessorKey: 'startDateTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Date & Time' />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('startDateTime'))
      return (
        <div className='text-sm'>
          {format(date, 'MMM dd, yyyy')}
          <div className='text-xs text-muted-foreground'>
            {format(date, 'HH:mm')}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue('status')
      )

      if (!status) {
        return null
      }

      return (
        <div className='flex w-[100px] items-center gap-2'>
          {status.icon && (
            <status.icon className='text-muted-foreground size-4' />
          )}
          <span>{status.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'attendanceStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Attendance' />
    ),
    cell: ({ row }) => {
      const task = row.original as TaskOutputDto
      const attendanceStatus = attendanceStatuses.find(
        (s) => s.value === task.attendanceStatus
      )

      if (!attendanceStatus) {
        return <Badge variant='outline'>Pending</Badge>
      }

      return (
        <Badge className={attendanceStatus.color}>
          {attendanceStatus.label}
        </Badge>
      )
    },
    filterFn: (row, _id, value) => {
      const task = row.original as TaskOutputDto
      return value.includes(task.attendanceStatus)
    },
  },
  {
    id: 'meetingLink',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Meeting Link' />
    ),
    cell: ({ row }) => {
      const task = row.original as TaskOutputDto
      const meetingLink = task.meetingLink
      
      if (!meetingLink) {
        return <div className='w-[100px]'>—</div>
      }
      
      return (
        <a
          href={meetingLink}
          target='_blank'
          rel='noopener noreferrer'
          className='flex items-center gap-1 text-blue-600 hover:text-blue-800'
        >
          <ExternalLink className='size-4' />
          <span className='text-sm'>Join</span>
        </a>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <Button
        variant='ghost'
        size='sm'
        onClick={() => onView?.(row.original)}
      >
        <Eye className='size-4' />
      </Button>
    ),
  },
]

// Component for clickable Order ID cell
function OrderIdCell({ orderId }: { orderId: number }) {
  const navigate = useNavigate()
  
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        navigate({
          to: '/orders',
          search: {
            orderId: orderId,
          },
        })
      }}
      className='w-[100px] font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left'
    >
      #{orderId}
    </button>
  )
}

