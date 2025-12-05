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

const attendanceColors: Record<string, string> = {
  UNKNOWN: 'bg-gray-100 text-gray-800',
  SHOWED: 'bg-green-100 text-green-800',
  NO_SHOW: 'bg-red-100 text-red-800',
  RESCHEDULED: 'bg-blue-100 text-blue-800',
}

const attendanceLabels: Record<string, string> = {
  UNKNOWN: 'Pending',
  SHOWED: 'Completed',
  NO_SHOW: 'No Show',
  RESCHEDULED: 'Rescheduled',
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

