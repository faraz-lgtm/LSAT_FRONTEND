import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/dashboard/ui/dialog'
import { Badge } from '@/components/dashboard/ui/badge'
import { format } from 'date-fns'
import type { TaskOutputDto, UserOutput } from '@/types/api/data-contracts'
import { Calendar, Clock, User, Mail, Video, FileText, CheckCircle } from 'lucide-react'

type AppointmentsDialogsProps = {
  open: 'view' | null
  setOpen: (open: 'view' | null) => void
  currentRow?: TaskOutputDto
  setCurrentRow: (row: TaskOutputDto | null) => void
  userIdToUser: Record<number, UserOutput>
  emailToUser: Record<string, UserOutput>
}

const attendanceColors: Record<string, string> = {
  UNKNOWN: 'bg-gray-100 text-gray-800',
  SHOWED: 'bg-green-100 text-green-800',
  NO_SHOW: 'bg-red-100 text-red-800',
}

export function AppointmentsDialogs({
  open,
  setOpen,
  currentRow,
  userIdToUser,
  emailToUser,
}: AppointmentsDialogsProps) {
  if (!currentRow) return null

  const tutorName = currentRow.tutorId && userIdToUser[currentRow.tutorId]
    ? userIdToUser[currentRow.tutorId].name
    : 'Not assigned'

  const customerInvitee = currentRow.invitees?.find((i) => i.name === 'Customer')
  const customerEmail = customerInvitee?.email
  const customer = customerEmail && emailToUser[customerEmail.toLowerCase()]
  const customerName = customer?.name || customerInvitee?.name || customerEmail || 'Unknown'

  return (
    <Dialog open={open === 'view'} onOpenChange={(isOpen) => setOpen(isOpen ? 'view' : null)}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Calendar className='size-5' />
            Appointment Details
          </DialogTitle>
          <DialogDescription>
            View appointment information
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Title & Status */}
          <div className='flex items-start justify-between'>
            <div>
              <h3 className='font-semibold text-lg'>{currentRow.title || 'Appointment'}</h3>
              {currentRow.orderId && (
                <p className='text-sm text-muted-foreground'>Order #{currentRow.orderId}</p>
              )}
            </div>
            <div className='flex gap-2'>
              <Badge variant='outline' className='capitalize'>
                {currentRow.status}
              </Badge>
              {currentRow.attendanceStatus && (
                <Badge className={attendanceColors[currentRow.attendanceStatus] || ''}>
                  {currentRow.attendanceStatus === 'NO_SHOW' ? 'No Show' : currentRow.attendanceStatus}
                </Badge>
              )}
            </div>
          </div>

          {/* Date & Time */}
          <div className='flex items-center gap-3 text-sm'>
            <Clock className='size-4 text-muted-foreground' />
            <div>
              <p className='font-medium'>
                {format(new Date(currentRow.startDateTime), 'EEEE, MMMM d, yyyy')}
              </p>
              <p className='text-muted-foreground'>
                {format(new Date(currentRow.startDateTime), 'h:mm a')}
                {currentRow.endDateTime && (
                  <> - {format(new Date(currentRow.endDateTime), 'h:mm a')}</>
                )}
              </p>
            </div>
          </div>

          {/* Assigned Employee */}
          <div className='flex items-center gap-3 text-sm'>
            <User className='size-4 text-muted-foreground' />
            <div>
              <p className='text-muted-foreground'>Assigned to</p>
              <p className='font-medium'>{tutorName}</p>
            </div>
          </div>

          {/* Customer */}
          <div className='flex items-center gap-3 text-sm'>
            <Mail className='size-4 text-muted-foreground' />
            <div>
              <p className='text-muted-foreground'>Customer</p>
              <p className='font-medium'>{customerName}</p>
              {customerEmail && <p className='text-xs text-muted-foreground'>{customerEmail}</p>}
            </div>
          </div>

          {/* Meeting Link */}
          {currentRow.meetingLink && (
            <div className='flex items-center gap-3 text-sm'>
              <Video className='size-4 text-muted-foreground' />
              <div>
                <p className='text-muted-foreground'>Meeting Link</p>
                <a
                  href={currentRow.meetingLink}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-600 hover:text-blue-800 hover:underline'
                >
                  Join Meeting
                </a>
              </div>
            </div>
          )}

          {/* Description */}
          {currentRow.description && (
            <div className='flex items-start gap-3 text-sm'>
              <FileText className='size-4 text-muted-foreground mt-0.5' />
              <div>
                <p className='text-muted-foreground'>Description</p>
                <p>{currentRow.description}</p>
              </div>
            </div>
          )}

          {/* Notes */}
          {currentRow.notes && (
            <div className='flex items-start gap-3 text-sm'>
              <FileText className='size-4 text-muted-foreground mt-0.5' />
              <div>
                <p className='text-muted-foreground'>Notes</p>
                <p>{currentRow.notes}</p>
              </div>
            </div>
          )}

          {/* Attendance Marked Info */}
          {currentRow.attendanceMarkedAt && (
            <div className='flex items-center gap-3 text-sm border-t pt-4'>
              <CheckCircle className='size-4 text-muted-foreground' />
              <div>
                <p className='text-muted-foreground'>Attendance marked</p>
                <p className='text-xs'>
                  {format(new Date(currentRow.attendanceMarkedAt), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

