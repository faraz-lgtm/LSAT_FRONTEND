import { Button } from '@/components/dashboard/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/dashboard/ui/dropdown-menu'
import type { TaskOutputDto } from '@/types/api/data-contracts'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { CalendarClock, Trash2, Eye } from 'lucide-react'
import { useGenerateRescheduleLinkMutation } from '@/redux/apiSlices/Order/orderSlice'
import { isTask, isOrderAppointment } from '@/utils/task-helpers'

// Filter options for the row actions


type DataTableRowActionsProps = {
  row: Row<TaskOutputDto>
  onEdit: (row: TaskOutputDto) => void
  onDelete: (row: TaskOutputDto) => void
  onView?: (row: TaskOutputDto) => void
}

export function DataTableRowActions({ row, onEdit, onDelete, onView }: DataTableRowActionsProps) {
  const task = row.original
  const [generateLink] = useGenerateRescheduleLinkMutation()

  const isTaskItem = isTask(task)
  const isAppointment = isOrderAppointment(task)

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        {onView && (
          <DropdownMenuItem
            onClick={() => onView(task)}
          >
            <Eye className='mr-2 h-4 w-4' />
            View Details
          </DropdownMenuItem>
        )}
        
        {/* Reschedule: Only show for order appointments */}
        {isAppointment && (
          <DropdownMenuItem
            onClick={async () => {
              // For order appointments, use itemId to find the appointment
              if (task.itemId) {
                // We need to get the appointmentId from the order
                // For now, use a workaround - the backend should provide appointmentId
                const anyTask = task as unknown as { rescheduleToken?: string; appointmentId?: number; }
                const appointmentId = anyTask.appointmentId
                
                if (appointmentId) {
                  try {
                    const resp = await generateLink({ appointmentId }).unwrap()
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const url = (resp as any)?.data?.url ?? (resp as any)?.url
                    if (url) {
                      window.open(url, '_blank', 'noopener')
                    } else {
                      window.alert('Could not generate reschedule link')
                    }
                  } catch {
                    window.alert('Failed to generate reschedule link')
                  }
                  return
                }
              }
              
              // Fallback to token-based link
              const anyTask = task as unknown as { rescheduleToken?: string; appointmentId?: number; }
              const token = anyTask.rescheduleToken || task.googleCalendarEventId
              
              if (token) {
                window.open(`/reschedule?token=${encodeURIComponent(String(token))}`, '_blank', 'noopener')
                return
              }
              
              window.alert('Reschedule not available for this appointment')
            }}
          >
            <CalendarClock className='mr-2 h-4 w-4' />
            Reschedule
          </DropdownMenuItem>
        )}
        
        {/* Edit: Only show for tasks */}
        {isTaskItem && (
          <>
            <DropdownMenuItem onClick={() => onEdit(task)}>
              Edit Task
            </DropdownMenuItem>
            {(onView || isAppointment) && <DropdownMenuSeparator />}
          </>
        )}
        
        {/* Delete: Only show for tasks */}
        {isTaskItem && (
          <DropdownMenuItem
            onClick={() => onDelete(task)}
          >
            <Trash2 className='mr-2 h-4 w-4' />
            Delete
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}