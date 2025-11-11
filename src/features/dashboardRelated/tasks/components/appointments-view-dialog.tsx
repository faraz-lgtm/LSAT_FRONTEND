'use client'

import { Button } from '@/components/dashboard/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/dashboard/ui/dialog'
import { Textarea } from '@/components/dashboard/ui/textarea'
import { Badge } from '@/components/dashboard/ui/badge'
import type { TaskOutputDto, UserOutput } from '@/types/api/data-contracts'
import { format } from 'date-fns'
import { ExternalLink, CalendarClock, Clipboard, Check } from 'lucide-react'
import { 
  useGenerateRescheduleLinkMutation, 
  useUpdateAppointmentNotesMutation,
  useMarkAppointmentAttendanceMutation 
} from '@/redux/apiSlices/Order/orderSlice'
import { taskApi } from '@/redux/apiSlices/Task/taskSlice'
import { useState, useEffect } from 'react'
import { isOrderAppointment } from '@/utils/task-helpers'
import { toast } from 'sonner'
import { useDispatch } from 'react-redux'

type AppointmentsViewDialogProps = {
  currentRow: TaskOutputDto
  open: boolean
  onOpenChange: (open: boolean) => void
  userIdToUser?: Record<number, UserOutput>
  emailToUser?: Record<string, UserOutput>
}

export function AppointmentsViewDialog({
  currentRow,
  open,
  onOpenChange,
  userIdToUser,
  emailToUser,
}: AppointmentsViewDialogProps) {
  const dispatch = useDispatch()
  const [generateLink, { isLoading: isGenerating }] = useGenerateRescheduleLinkMutation()
  const [isRescheduling, setIsRescheduling] = useState(false)
  const [updateAppointmentNotes, { isLoading: isSavingNotes }] = useUpdateAppointmentNotesMutation()
  
  // Attendance mutation - only for order appointments
  const [markAttendance, { isLoading: isMarking }] = useMarkAppointmentAttendanceMutation()
  
  // State for copy reschedule link
  const [copyingApptId, setCopyingApptId] = useState<number | null>(null)
  const [copiedApptId, setCopiedApptId] = useState<number | null>(null)
  const [copyErrorApptId, setCopyErrorApptId] = useState<number | null>(null)
  
  // Notes state - only for order appointments
  // Check both type field and presence of orderId as fallback
  const isAppointment = isOrderAppointment(currentRow) || (currentRow.type === undefined && currentRow.orderId !== undefined)
  
  // Get appointmentId - for order appointments, the id field is the appointment ID
  const getAppointmentId = (): number | undefined => {
    if (!isAppointment) return undefined
    // First check if appointmentId is explicitly available in the task object
    const anyTask = currentRow as unknown as { appointmentId?: number }
    if (anyTask.appointmentId) {
      return anyTask.appointmentId
    }
    // For order appointments, the id field should be the appointment ID
    // This is the ID shown in the dialog as "Appointment ID"
    return currentRow.id
  }
  
  const appointmentId = getAppointmentId()
  
  // Handle notes - it's typed as object but should be string
  const getNotesString = (notes: unknown): string => {
    if (typeof notes === 'string') return notes
    if (notes === null || notes === undefined) return ''
    return String(notes)
  }
  
  const [notes, setNotes] = useState<string>(() => getNotesString(currentRow.notes))
  
  useEffect(() => {
    if (open) {
      setNotes(getNotesString(currentRow.notes))
    }
  }, [open, currentRow.notes])

  const tutor = currentRow.tutorId && userIdToUser ? userIdToUser[currentRow.tutorId] : undefined
  const customerInvitee = currentRow.invitees?.find((i) => i.name === 'Customer')
  const customerEmail = customerInvitee?.email
  const customer = customerEmail && emailToUser ? emailToUser[customerEmail.toLowerCase()] : undefined
  
  // Handler for marking attendance - only for order appointments
  const handleMarkAttendance = async (status: 'SHOWED' | 'NO_SHOW' | 'UNKNOWN') => {
    if (!appointmentId) {
      toast.error('Appointment ID not found')
      return
    }
    
    try {
      await markAttendance({ 
        appointmentId, 
        body: { status } 
      }).unwrap()
      // Invalidate Tasks cache so the updated attendance shows in the table
      dispatch(taskApi.util.invalidateTags(['Tasks']))
      toast.success(`Attendance marked as ${status}`)
    } catch (error) {
      console.error('Error marking attendance:', error)
      toast.error('Failed to mark attendance')
    }
  }

  // Handler for copy reschedule link
  const handleCopyRescheduleLink = async () => {
    if (!appointmentId) {
      toast.error('Appointment ID not found')
      return
    }
    
    setCopyErrorApptId(null)
    setCopiedApptId(null)
    setCopyingApptId(appointmentId)
    
    try {
      const resp = await generateLink({ appointmentId }).unwrap()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const url = (resp as any)?.data?.url ?? (resp as any)?.url
      if (url) {
        await navigator.clipboard.writeText(url)
        setCopiedApptId(appointmentId)
        setTimeout(() => setCopiedApptId(null), 1500)
        toast.success('Reschedule link copied to clipboard')
      } else {
        setCopyErrorApptId(appointmentId)
        toast.error('Could not generate reschedule link')
      }
    } catch (error) {
      console.error('Error generating reschedule link:', error)
      setCopyErrorApptId(appointmentId)
      toast.error('Failed to generate reschedule link')
    } finally {
      setCopyingApptId(null)
    }
  }
  
  const handleSaveNotes = async () => {
    if (!appointmentId) {
      toast.error('Appointment ID not found')
      return
    }
    
    try {
      // UpdateAppointmentNotesDto type says object, but API expects string
      // Type assertion needed due to type mismatch in generated types
      await updateAppointmentNotes({ 
        appointmentId, 
        body: { notes: notes as unknown as object } 
      }).unwrap()
      // Invalidate Tasks cache so the updated notes show in the table
      dispatch(taskApi.util.invalidateTags(['Tasks']))
      toast.success('Appointment notes saved successfully')
    } catch (error) {
      console.error('Error saving appointment notes:', error)
      toast.error('Failed to save appointment notes')
    }
  }

  const handleReschedule = async () => {
    setIsRescheduling(true)
    try {
      const anyTask = currentRow as unknown as { rescheduleToken?: string; appointmentId?: number; }
      const token = anyTask.rescheduleToken || currentRow.googleCalendarEventId
      
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
        setIsRescheduling(false)
        return
      }
      
      // Fallback to token-based link if no appointmentId is present
      if (token) {
        window.open(`/reschedule?token=${encodeURIComponent(String(token))}`, '_blank', 'noopener')
        setIsRescheduling(false)
        return
      }
      
      window.alert('Reschedule not available for this appointment')
      setIsRescheduling(false)
    } catch (error) {
      console.error('Error rescheduling:', error)
      setIsRescheduling(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl max-h-[90vh] flex flex-col'>
        <DialogHeader className='text-start flex-shrink-0'>
          <DialogTitle>Appointment Details</DialogTitle>
          <DialogDescription>
            View appointment information and details.
          </DialogDescription>
        </DialogHeader>
        
        <div className='space-y-6 overflow-y-auto flex-1 min-h-0 pr-2'>
          {/* Appointment ID */}
          <div className='space-y-3'>
            <h3 className='text-lg font-semibold'>Appointment Information</h3>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Appointment ID</label>
                <p className='text-sm font-medium'>#{currentRow.id}</p>
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Title</label>
                <p className='text-sm'>{currentRow.title}</p>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className='space-y-3'>
            <h3 className='text-lg font-semibold'>Schedule</h3>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Start Date & Time</label>
                <p className='text-sm'>{format(new Date(currentRow.startDateTime), 'PPpp')}</p>
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>End Date & Time</label>
                <p className='text-sm'>{format(new Date(currentRow.endDateTime), 'PPpp')}</p>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className='space-y-3'>
            <h3 className='text-lg font-semibold'>Participants</h3>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Tutor/Employee</label>
                <p className='text-sm'>{tutor?.name || `ID: ${currentRow.tutorId}`}</p>
                {tutor?.email && (
                  <p className='text-xs text-muted-foreground'>{tutor.email}</p>
                )}
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Customer</label>
                <p className='text-sm'>{customer?.name || customerInvitee?.name || customerEmail || '—'}</p>
                {customerEmail && (
                  <p className='text-xs text-muted-foreground'>{customerEmail}</p>
                )}
              </div>
            </div>
          </div>

          {/* Invitees */}
          {currentRow.invitees && currentRow.invitees.length > 0 && (
            <div className='space-y-3'>
              <h3 className='text-lg font-semibold'>All Invitees</h3>
              <div className='space-y-2'>
                {currentRow.invitees.map((invitee, index) => (
                  <div key={index} className='p-2 border rounded-lg'>
                    <div>
                      <p className='text-sm font-medium'>{invitee.name || '—'}</p>
                      {invitee.email && (
                        <p className='text-xs text-muted-foreground'>{invitee.email}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {currentRow.description && (
            <div className='space-y-3'>
              <h3 className='text-lg font-semibold'>Description</h3>
              <p className='text-sm text-muted-foreground'>{currentRow.description}</p>
            </div>
          )}

          {/* Meeting Link */}
          {currentRow.meetingLink && (
            <div className='space-y-3'>
              <h3 className='text-lg font-semibold'>Meeting Link</h3>
              <div className='flex items-center gap-2'>
                <a
                  href={currentRow.meetingLink}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-sm text-blue-600 hover:text-blue-800 underline flex items-center gap-1'
                >
                  {currentRow.meetingLink}
                  <ExternalLink className='h-3 w-3' />
                </a>
              </div>
            </div>
          )}

          {/* Attendance Section - Only for order appointments */}
          {isAppointment && (
            <div className='space-y-3'>
              <h3 className='text-lg font-semibold'>Attendance</h3>
              <div className='border rounded-lg p-4 bg-muted/30'>
                <div className='flex items-center justify-between mb-3'>
                  <div>
                    <label className='text-sm font-medium text-muted-foreground'>Status</label>
                    <div className='mt-1'>
                      <Badge variant='outline' className='uppercase'>
                        {currentRow.attendanceStatus || 'UNKNOWN'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className='flex flex-wrap items-center gap-2'>
                  <Button 
                    size='sm' 
                    variant='secondary' 
                    disabled={isMarking || !appointmentId} 
                    onClick={() => handleMarkAttendance('SHOWED')}
                  >
                    Showed
                  </Button>
                  <Button 
                    size='sm' 
                    variant='secondary' 
                    disabled={isMarking || !appointmentId} 
                    onClick={() => handleMarkAttendance('NO_SHOW')}
                  >
                    No Show
                  </Button>
                  <Button 
                    size='sm' 
                    variant='outline' 
                    disabled={isMarking || !appointmentId} 
                    onClick={() => handleMarkAttendance('UNKNOWN')}
                  >
                    Reset
                  </Button>
                  <Button
                    size='sm'
                    variant='ghost'
                    disabled={isGenerating || copyingApptId === appointmentId || !appointmentId}
                    onClick={handleCopyRescheduleLink}
                  >
                    {copiedApptId === appointmentId ? (
                      <span className='inline-flex items-center gap-1'>
                        <Check className='h-4 w-4 text-green-600' /> Copied
                      </span>
                    ) : copyingApptId === appointmentId ? (
                      <span className='inline-flex items-center gap-1'>Generating…</span>
                    ) : (
                      <span className='inline-flex items-center gap-1'>
                        <Clipboard className='h-4 w-4' /> Copy reschedule link
                      </span>
                    )}
                  </Button>
                  {copyErrorApptId === appointmentId && (
                    <span className='text-xs text-destructive'>Failed to copy. Try again.</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notes - Only for order appointments */}
          {isAppointment && (
            <div className='space-y-3'>
              <h3 className='text-lg font-semibold'>Appointment Notes</h3>
              <div className='space-y-2'>
                <Textarea
                  placeholder='Add appointment notes...'
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
                <div className='flex justify-end'>
                  <Button
                    size='sm'
                    disabled={isSavingNotes || !appointmentId}
                    onClick={handleSaveNotes}
                    title={!appointmentId ? 'Appointment ID not available' : ''}
                  >
                    {isSavingNotes ? 'Saving...' : 'Save Notes'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className='space-y-3'>
            <h3 className='text-lg font-semibold'>Timestamps</h3>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Created At</label>
                <p className='text-sm'>{format(new Date(currentRow.createdAt), 'PPpp')}</p>
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Last Updated</label>
                <p className='text-sm'>{format(new Date(currentRow.updatedAt), 'PPpp')}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className='flex-shrink-0'>
          {currentRow.label === 'meeting' && (
            <Button
              variant='outline'
              onClick={handleReschedule}
              disabled={isGenerating || isRescheduling}
            >
              <CalendarClock className='mr-2 h-4 w-4' />
              {isGenerating || isRescheduling ? 'Generating...' : 'Reschedule'}
            </Button>
          )}
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

