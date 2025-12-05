import type { TaskOutputDto, UserOutput } from '@/types/api/data-contracts'
import { AppointmentsViewDialog } from '@/features/dashboardRelated/tasks/components/appointments-view-dialog'
import type { Dispatch, SetStateAction } from 'react'

type AppointmentsDialogsProps = {
  open: 'view' | null
  setOpen: (open: 'view' | null) => void
  currentRow?: TaskOutputDto
  setCurrentRow: Dispatch<SetStateAction<TaskOutputDto | undefined>>
  userIdToUser: Record<number, UserOutput>
  emailToUser: Record<string, UserOutput>
}

export function AppointmentsDialogs({
  open,
  setOpen,
  currentRow,
  setCurrentRow,
  userIdToUser,
  emailToUser,
}: AppointmentsDialogsProps) {
  if (!currentRow) return null

  return (
    <AppointmentsViewDialog
      currentRow={currentRow}
      open={open === 'view'}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setOpen(null)
          setTimeout(() => {
            setCurrentRow(undefined)
          }, 500)
        } else {
          setOpen('view')
        }
      }}
      userIdToUser={userIdToUser}
      emailToUser={emailToUser}
    />
  )
}

