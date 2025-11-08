import { ConfirmDialog } from '@/components/dashboard/confirm-dialog'
import { TasksMutateDrawer } from './tasks-mutate-drawer'
import { AppointmentsViewDialog } from './appointments-view-dialog'
import { useDeleteTaskMutation } from '@/redux/apiSlices/Task/taskSlice'
import { toast } from 'sonner'
import type { TaskOutputDto, UserOutput } from '@/types/api/data-contracts'
import type { Dispatch, SetStateAction } from 'react'

type TasksDialogsProps = {
  open: 'create' | 'update' | 'delete' | 'view' | null
  setOpen: (open: 'create' | 'update' | 'delete' | 'view' | null) => void
  currentRow?: TaskOutputDto
  setCurrentRow: Dispatch<SetStateAction<TaskOutputDto | undefined>>
  userIdToUser?: Record<number, UserOutput>
  emailToUser?: Record<string, UserOutput>
}

export function TasksDialogs({ open, setOpen, currentRow, setCurrentRow, userIdToUser, emailToUser }: TasksDialogsProps) {
  const [deleteTask] = useDeleteTaskMutation()

  const handleDelete = async () => {
    if (!currentRow) return
    
    // Check if task ID is 0 and show warning
    if (currentRow.id === 0) {
      toast.warning("Cannot delete orders!")
      setOpen(null)
      setTimeout(() => {
        setCurrentRow(undefined)
      }, 500)
      return
    }
    
    try {
      await deleteTask(currentRow.id).unwrap()
      toast.success("Task deleted successfully")
      setOpen(null)
      setTimeout(() => {
        setCurrentRow(undefined)
      }, 500)
    } catch (error) {
      console.error("❌ Delete task error:", error)
      toast.error("Failed to delete task")
    }
  }
  return (
    <>
      <TasksMutateDrawer
        key='task-create'
        open={open === 'create'}
        onOpenChange={(v) => setOpen(v ? 'create' : null)}
      />

      {currentRow && (
        <>
          <AppointmentsViewDialog
            key={`appointment-view-${currentRow.id}`}
            open={open === 'view'}
            onOpenChange={(v) => {
              if (!v) {
                setOpen(null)
                setTimeout(() => {
                  setCurrentRow(undefined)
                }, 500)
              } else {
                setOpen('view')
              }
            }}
            currentRow={currentRow}
            userIdToUser={userIdToUser}
            emailToUser={emailToUser}
          />

          <TasksMutateDrawer
            key={`task-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={(v) => {
              if (!v) {
                setOpen(null)
                setTimeout(() => {
                  setCurrentRow(undefined)
                }, 500)
              } else {
                setOpen('update')
              }
            }}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key='task-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={(v) => {
              if (!v) {
                setOpen(null)
                setTimeout(() => {
                  setCurrentRow(undefined)
                }, 500)
              } else {
                setOpen('delete')
              }
            }}
            handleConfirm={handleDelete}
            className='max-w-md'
            title={`Delete this task: ${currentRow.id} ?`}
            desc={
              <>
                You are about to delete a task with the ID{' '}
                <strong>{currentRow.id}</strong>. <br />
                This action cannot be undone.
              </>
            }
            confirmText='Delete'
          />
        </>
      )}
    </>
  )
}
