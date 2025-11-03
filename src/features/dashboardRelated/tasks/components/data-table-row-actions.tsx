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
import { CalendarClock, Trash2 } from 'lucide-react'
import { useGenerateRescheduleLinkMutation } from '@/redux/apiSlices/Order/orderSlice'

// Filter options for the row actions


type DataTableRowActionsProps = {
  row: Row<TaskOutputDto>
  onEdit: (row: TaskOutputDto) => void
  onDelete: (row: TaskOutputDto) => void
}

export function DataTableRowActions({ row, onEdit, onDelete }: DataTableRowActionsProps) {
  const task = row.original
  const [generateLink] = useGenerateRescheduleLinkMutation()

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
        {(task.label === 'meeting') && (
          <DropdownMenuItem
            onClick={async () => {
              const anyTask = task as unknown as { rescheduleToken?: string; appointmentId?: number; }
              const token = anyTask.rescheduleToken || task.googleCalendarEventId
              // Prefer generating a fresh reschedule link when appointmentId is available
              if (anyTask.appointmentId) {
                try {
                  const resp = await generateLink({ appointmentId: anyTask.appointmentId }).unwrap()
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
              // Fallback to token-based link if no appointmentId is present
              if (token) {
                window.open(`/reschedule?token=${encodeURIComponent(String(token))}`, '_blank', 'noopener')
                return
              }
              window.alert('Reschedule not available for this task')
            }}
          >
            <CalendarClock className='mr-2 h-4 w-4' />
            Reschedule
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => onEdit(task)}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete(task)}
        >
          <Trash2 className='mr-2 h-4 w-4' />
          Delete
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}