import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/dashboard/ui/badge'
import { Checkbox } from '@/components/dashboard/ui/checkbox'
import { DataTableColumnHeader } from '@/components/dashboard/data-table'
import { DataTableRowActions } from './data-table-row-actions'
import { format } from 'date-fns'
import type { TaskOutputDto } from '@/types/api/data-contracts'
import type { UserOutput } from '@/types/api/data-contracts'
import { ArrowDown, ArrowRight, ArrowUp, Circle, CheckCircle, Timer, CircleOff } from 'lucide-react'
import { ClickableTutorCell } from './clickable-tutor-cell'
import { ClickableCustomerCell } from './clickable-customer-cell'
import { isOrderAppointment } from '@/utils/task-helpers'

// Filter options for the columns
const labels = [
  { value: 'meeting', label: 'Meeting' },
  { value: 'personal', label: 'Personal' },
  { value: 'preparation', label: 'Preparation' },
  { value: 'grading', label: 'Grading' },
]

const statuses = [
  { label: 'Pending', value: 'pending' as const, icon: Circle },
  { label: 'In Progress', value: 'in_progress' as const, icon: Timer },
  { label: 'Completed', value: 'completed' as const, icon: CheckCircle },
  { label: 'Cancelled', value: 'cancelled' as const, icon: CircleOff },
]

const priorities = [
  { label: 'Low', value: 'low' as const, icon: ArrowDown },
  { label: 'Medium', value: 'medium' as const, icon: ArrowRight },
  { label: 'High', value: 'high' as const, icon: ArrowUp },
]

export const createTasksColumns = (
  onEdit: (row: TaskOutputDto) => void,
  onDelete: (row: TaskOutputDto) => void,
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
    id: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Type' />
    ),
    cell: ({ row }) => {
      const task = row.original as TaskOutputDto
      const isAppointment = isOrderAppointment(task)
      
      return (
        <div className='flex w-[140px] items-center'>
          <Badge variant={isAppointment ? 'secondary' : 'outline'}>
            {isAppointment ? 'Order Appointment' : 'Personal Task'}
          </Badge>
        </div>
      )
    },
    accessorFn: (row) => isOrderAppointment(row) ? 'Order Appointment' : 'Personal Task',
    sortingFn: (rowA, rowB) => {
      const typeA = isOrderAppointment(rowA.original) ? 'Order Appointment' : 'Personal Task'
      const typeB = isOrderAppointment(rowB.original) ? 'Order Appointment' : 'Personal Task'
      return typeA.localeCompare(typeB)
    },
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Title' />
    ),
    cell: ({ row }) => {
      return (
        <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
          {row.getValue('title')}
        </span>
      )
    },
  },
  {
    id: 'tutor',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tutor' />
    ),
    cell: ({ row }) => {
      const task = row.original as TaskOutputDto
      // Get tutor ID from task.tutorId
      const tutorId = task.tutorId
      const user = tutorId && userIdToUser ? userIdToUser[tutorId] : undefined
      const displayName = user?.name || '—'
      return (
        <ClickableTutorCell
          tutorId={tutorId}
          userIdToUser={userIdToUser}
          displayName={displayName}
        />
      )
    },
    accessorFn: (row) => {
      const task = row as TaskOutputDto
      const tutorId = task.tutorId
      const user = tutorId && userIdToUser ? userIdToUser[tutorId] : undefined
      return user?.name || ''
    },
    sortingFn: (rowA, rowB) => {
      const taskA = rowA.original as TaskOutputDto
      const taskB = rowB.original as TaskOutputDto
      const tutorIdA = taskA.tutorId
      const tutorIdB = taskB.tutorId
      const userA = tutorIdA && userIdToUser ? userIdToUser[tutorIdA] : undefined
      const userB = tutorIdB && userIdToUser ? userIdToUser[tutorIdB] : undefined
      const nameA = userA?.name || ''
      const nameB = userB?.name || ''
      return nameA.localeCompare(nameB)
    },
  },
  {
    id: 'customer',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Customer' />
    ),
    cell: ({ row }) => {
      const task = row.original as TaskOutputDto
      // Find invitee with name "Customer"
      const customerInvitee = task.invitees?.find((i) => i.name === 'Customer')
      
      if (!customerInvitee) {
        return <div className='w-[200px] truncate'>—</div>
      }
      
      // Get customer email from invitees
      const customerEmail = customerInvitee.email
      const customer = customerEmail && emailToUser ? emailToUser[customerEmail.toLowerCase()] : undefined
      
      // Display customer name from users API if found, otherwise fallback to invitee name or email
      const displayValue = customer?.name || customerInvitee.name || customerEmail || '—'
      return (
        <ClickableCustomerCell
          customerEmail={customerEmail}
          emailToUser={emailToUser}
          displayValue={displayValue}
        />
      )
    },
    accessorFn: (row) => {
      const task = row as TaskOutputDto
      const customerInvitee = task.invitees?.find((i) => i.name === 'Customer')
      if (!customerInvitee) {
        return ''
      }
      const customerEmail = customerInvitee.email
      const customer = customerEmail && emailToUser ? emailToUser[customerEmail.toLowerCase()] : undefined
      return customer?.name || customerInvitee.name || customerEmail || ''
    },
    sortingFn: (rowA, rowB) => {
      const taskA = rowA.original as TaskOutputDto
      const taskB = rowB.original as TaskOutputDto
      const customerInviteeA = taskA.invitees?.find((i) => i.name === 'Customer')
      const customerInviteeB = taskB.invitees?.find((i) => i.name === 'Customer')
      
      const customerEmailA = customerInviteeA?.email
      const customerEmailB = customerInviteeB?.email
      const customerA = customerEmailA && emailToUser ? emailToUser[customerEmailA.toLowerCase()] : undefined
      const customerB = customerEmailB && emailToUser ? emailToUser[customerEmailB.toLowerCase()] : undefined
      
      const nameA = customerA?.name || customerInviteeA?.name || customerEmailA || ''
      const nameB = customerB?.name || customerInviteeB?.name || customerEmailB || ''
      return nameA.localeCompare(nameB)
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
        return <div className='w-[200px] truncate'>—</div>
      }
      
      return (
        <div className='w-[200px] truncate'>
          <a
            href={meetingLink}
            target='_blank'
            rel='noopener noreferrer'
            className='text-blue-600 hover:text-blue-800 underline truncate block'
            title={meetingLink}
          >
            {meetingLink}
          </a>
        </div>
      )
    },
    accessorFn: (row) => {
      const task = row as TaskOutputDto
      return task.meetingLink || ''
    },
    sortingFn: (rowA, rowB) => {
      const meetingLinkA = rowA.original.meetingLink || ''
      const meetingLinkB = rowB.original.meetingLink || ''
      return meetingLinkA.localeCompare(meetingLinkB)
    },
  },
  {
    accessorKey: 'label',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Label' />
    ),
    cell: ({ row }) => {
      const task = row.original as TaskOutputDto
      const label = labels.find((label) => label.value === row.getValue('label'))
      
      // Show label for tasks, show "Appointment" badge for order appointments
      if (isOrderAppointment(task)) {
        return (
          <div className='flex w-[100px] items-center'>
            <Badge variant='secondary'>Appointment</Badge>
          </div>
        )
      }
      
      return (
        <div className='flex w-[100px] items-center'>
          {label && <Badge variant='outline'>{label.label}</Badge>}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Description' />
    ),
    cell: ({ row }) => {
      const description = row.getValue('description') as string
      return (
        <div className='max-w-48 truncate text-sm text-muted-foreground'>
          {description || 'No description'}
        </div>
      )
    },
  },
  {
    accessorKey: 'startDateTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Start Date' />
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
    accessorKey: 'endDateTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='End Date' />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('endDateTime'))
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
    accessorKey: 'priority',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Priority' />
    ),
    cell: ({ row }) => {
      const task = row.original as TaskOutputDto
      
      // Only show priority for tasks, not order appointments
      if (isOrderAppointment(task)) {
        return <div className='w-[100px]'>—</div>
      }
      
      const priority = priorities.find(
        (priority) => priority.value === row.getValue('priority')
      )

      if (!priority) {
        return null
      }

      return (
        <div className='flex items-center gap-2'>
          {priority.icon && (
            <priority.icon className='text-muted-foreground size-4' />
          )}
          <span>{priority.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const task = row.original as TaskOutputDto
      // Only filter tasks, not appointments
      if (isOrderAppointment(task)) {
        return false
      }
      return value.includes(row.getValue(id))
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} onEdit={onEdit} onDelete={onDelete} onView={onView} />,
  },
]

