import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2, CircleArrowUp, ArrowUpDown, Download, Circle, CheckCircle, Timer, CircleOff, ArrowDown, ArrowRight, ArrowUp, CalendarClock, Pencil, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { sleep } from '@/lib/dashboardRelated/utils'
import { Button } from '@/components/dashboard/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/dashboard/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/dashboard/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/dashboard/data-table'
import { TasksMultiDeleteDialog } from './tasks-multi-delete-dialog'
import type { TaskOutputDto } from '@/types/api/data-contracts'
import { useGenerateRescheduleLinkMutation } from '@/redux/apiSlices/Order/orderSlice'

// Define the filter options directly here since we removed the data folder
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

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
  onEdit?: (row: TaskOutputDto) => void
  onDelete?: (row: TaskOutputDto) => void
  onView?: (row: TaskOutputDto) => void
}

export function DataTableBulkActions<TData>({
  table,
  onEdit,
  onDelete,
  onView,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const [generateLink] = useGenerateRescheduleLinkMutation()
  
  const isSingleSelection = selectedRows.length === 1
  const selectedTask = isSingleSelection ? (selectedRows[0].original as TaskOutputDto) : null

  const handleReschedule = async () => {
    if (!selectedTask) return
    
    const anyTask = selectedTask as unknown as { rescheduleToken?: string; appointmentId?: number; }
    const token = anyTask.rescheduleToken || selectedTask.googleCalendarEventId
    
    // Prefer generating a fresh reschedule link when appointmentId is available
    if (anyTask.appointmentId) {
      try {
        const resp = await generateLink({ appointmentId: anyTask.appointmentId }).unwrap()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const url = (resp as any)?.data?.url ?? (resp as any)?.url
        if (url) {
          window.open(url, '_blank', 'noopener')
          table.resetRowSelection()
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
      table.resetRowSelection()
      return
    }
    
    window.alert('Reschedule not available for this task')
  }

  const handleBulkStatusChange = (status: string) => {
    const selectedTasks = selectedRows.map((row) => row.original as TaskOutputDto)
    toast.promise(sleep(2000), {
      loading: 'Updating status...',
      success: () => {
        table.resetRowSelection()
        return `Status updated to "${status}" for ${selectedTasks.length} task${selectedTasks.length > 1 ? 's' : ''}.`
      },
      error: 'Error',
    })
    table.resetRowSelection()
  }

  const handleBulkPriorityChange = (priority: string) => {
    const selectedTasks = selectedRows.map((row) => row.original as TaskOutputDto)
    toast.promise(sleep(2000), {
      loading: 'Updating priority...',
      success: () => {
        table.resetRowSelection()
        return `Priority updated to "${priority}" for ${selectedTasks.length} task${selectedTasks.length > 1 ? 's' : ''}.`
      },
      error: 'Error',
    })
    table.resetRowSelection()
  }

  const handleBulkExport = () => {
    const selectedTasks = selectedRows.map((row) => row.original as TaskOutputDto)
    toast.promise(sleep(2000), {
      loading: 'Exporting tasks...',
      success: () => {
        table.resetRowSelection()
        return `Exported ${selectedTasks.length} task${selectedTasks.length > 1 ? 's' : ''} to CSV.`
      },
      error: 'Error',
    })
    table.resetRowSelection()
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='task'>
        {isSingleSelection ? (
          // Single selection: Show View, Edit, Reschedule (if meeting), and Delete
          <>
            {onView && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='outline'
                    size='icon'
                    onClick={() => {
                      if (selectedTask && onView) {
                        onView(selectedTask)
                        table.resetRowSelection()
                      }
                    }}
                    className='size-8'
                    aria-label='View'
                    title='View'
                  >
                    <Eye className='h-4 w-4' />
                    <span className='sr-only'>View</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View Details</p>
                </TooltipContent>
              </Tooltip>
            )}

            {selectedTask?.label === 'meeting' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='outline'
                    size='icon'
                    onClick={handleReschedule}
                    className='size-8'
                    aria-label='Reschedule'
                    title='Reschedule'
                  >
                    <CalendarClock className='h-4 w-4' />
                    <span className='sr-only'>Reschedule</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reschedule</p>
                </TooltipContent>
              </Tooltip>
            )}
            
            {onEdit && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='outline'
                    size='icon'
                    onClick={() => {
                      if (selectedTask && onEdit) {
                        onEdit(selectedTask)
                        table.resetRowSelection()
                      }
                    }}
                    className='size-8'
                    aria-label='Edit'
                    title='Edit'
                  >
                    <Pencil className='h-4 w-4' />
                    <span className='sr-only'>Edit</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit</p>
                </TooltipContent>
              </Tooltip>
            )}

            {onDelete && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='destructive'
                    size='icon'
                    onClick={() => {
                      if (selectedTask && onDelete) {
                        onDelete(selectedTask)
                        table.resetRowSelection()
                      }
                    }}
                    className='size-8'
                    aria-label='Delete'
                    title='Delete'
                  >
                    <Trash2 className='h-4 w-4' />
                    <span className='sr-only'>Delete</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete</p>
                </TooltipContent>
              </Tooltip>
            )}
          </>
        ) : (
          // Multiple selection: Show only delete button
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='destructive'
                size='icon'
                onClick={() => setShowDeleteConfirm(true)}
                className='size-8'
                aria-label='Delete selected tasks'
                title='Delete selected tasks'
              >
                <Trash2 />
                <span className='sr-only'>Delete selected tasks</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete selected tasks</p>
            </TooltipContent>
          </Tooltip>
        )}
      </BulkActionsToolbar>

      <TasksMultiDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        table={table}
      />
    </>
  )
}
