import { useMemo } from 'react'
import { format, isToday, isYesterday } from 'date-fns'
import { ChevronDown, PhoneIncoming, PhoneOutgoing, Loader2 } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/dashboard/ui/collapsible'
import { Badge } from '@/components/dashboard/ui/badge'
import type { CallWithLogsDto } from '@/types/api/data-contracts'

type CallLogsSectionProps = {
  calls: CallWithLogsDto[]
  isLoading?: boolean
  error?: unknown
}

function formatDuration(seconds?: number): string {
  if (!seconds) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatCallDate(dateString: string): string {
  const date = new Date(dateString)
  if (isToday(date)) {
    return 'Today'
  }
  if (isYesterday(date)) {
    return 'Yesterday'
  }
  return format(date, 'MMM d, yyyy')
}

function getCallStatusVariant(status?: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'completed':
      return 'default'
    case 'failed':
    case 'busy':
    case 'no-answer':
    case 'canceled':
      return 'destructive'
    case 'in-progress':
    case 'ringing':
    case 'queued':
      return 'secondary'
    default:
      return 'outline'
  }
}

function getCallStatusLabel(status?: string): string {
  if (!status) return 'Unknown'
  switch (status) {
    case 'in-progress':
      return 'In Progress'
    case 'no-answer':
      return 'No Answer'
    default:
      return status.charAt(0).toUpperCase() + status.slice(1)
  }
}

export function CallLogsSection({ calls, isLoading, error }: CallLogsSectionProps) {
  // Group calls by date and sort by date (descending - recent first)
  const groupedCalls = useMemo(() => {
    if (!calls || calls.length === 0) return {}

    const grouped: Record<string, CallWithLogsDto[]> = {}

    // Sort calls by createdAt in descending order (recent first)
    const sortedCalls = [...calls].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return dateB - dateA
    })

    sortedCalls.forEach((call) => {
      const date = new Date(call.createdAt)
      const dateKey = format(date, 'yyyy-MM-dd') // Use ISO date for grouping
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(call)
    })

    // Sort date keys in descending order
    const sortedKeys = Object.keys(grouped).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime()
    })

    const result: Record<string, CallWithLogsDto[]> = {}
    sortedKeys.forEach((key) => {
      const calls = grouped[key]
      if (calls) {
        result[key] = calls
      }
    })

    return result
  }, [calls])

  if (isLoading) {
    return (
      <div className='mt-6'>
        <div className='flex items-center justify-center py-8'>
          <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='mt-6'>
        <div className='rounded-md px-3 py-3 bg-muted/50'>
          <p className='text-sm text-muted-foreground text-center'>
            Failed to load call logs
          </p>
        </div>
      </div>
    )
  }

  if (Object.keys(groupedCalls).length === 0) {
    return (
      <div className='mt-6'>
        <div className='rounded-md px-3 py-3 bg-muted/50'>
          <p className='text-sm text-muted-foreground text-center'>
            No call logs available
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='mt-4 flex flex-col'>
      <h4 className='text-xs font-semibold mb-2 px-1 shrink-0'>Call Logs</h4>
      <div className='relative overflow-y-scroll max-h-[300px]'>
        <div className='space-y-2 pr-3'>
          {Object.entries(groupedCalls).map(([dateKey, dateCalls]) => {
            const firstCall = dateCalls[0]
            if (!firstCall) return null
            const displayDate = formatCallDate(firstCall.createdAt)

            return (
              <div key={dateKey} className='space-y-1.5'>
                <div className='text-[10px] font-medium text-muted-foreground px-1 sticky top-0 bg-background py-0.5 z-10'>
                  {displayDate}
                </div>
                {dateCalls.map((call) => {
                  const hasRecording = call.callLogs && call.callLogs.length > 0
                  const firstRecording = hasRecording ? call.callLogs[0] : null

                  return (
                    <Collapsible key={call.id} className='border rounded-md group/collapsible'>
                      <CollapsibleTrigger className='w-full px-2 py-1.5 hover:bg-muted/50 transition-colors'>
                        <div className='flex items-center justify-between gap-1.5'>
                          <div className='flex items-center gap-1.5 flex-1 min-w-0'>
                            {call.direction === 'inbound' ? (
                              <PhoneIncoming className='h-3 w-3 text-muted-foreground shrink-0' />
                            ) : (
                              <PhoneOutgoing className='h-3 w-3 text-muted-foreground shrink-0' />
                            )}
                            <div className='flex items-center gap-1.5 flex-1 min-w-0 overflow-hidden'>
                              <Badge
                                variant={call.direction === 'inbound' ? 'secondary' : 'default'}
                                className='text-[10px] px-1.5 py-0 shrink-0 leading-tight'
                              >
                                {call.direction === 'inbound' ? 'Inbound' : 'Outbound'}
                              </Badge>
                              <span className='text-[10px] text-muted-foreground shrink-0'>
                                {formatDuration(call.duration)}
                              </span>
                              <Badge
                                variant={getCallStatusVariant(call.callStatus)}
                                className='text-[10px] px-1.5 py-0 shrink-0 leading-tight'
                              >
                                {getCallStatusLabel(call.callStatus)}
                              </Badge>
                            </div>
                          </div>
                          {hasRecording && (
                            <ChevronDown className='h-3 w-3 text-muted-foreground shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180' />
                          )}
                        </div>
                      </CollapsibleTrigger>
                      {hasRecording && firstRecording && (
                        <CollapsibleContent className='px-2 pb-2'>
                          <div className='pt-1.5 border-t space-y-1.5'>
                            <div className='text-[10px] text-muted-foreground'>
                              Recording
                            </div>
                            {firstRecording.recordingUrl ? (
                              <audio
                                controls
                                className='w-full h-7'
                                src={firstRecording.recordingUrl}
                              >
                                Your browser does not support the audio element.
                              </audio>
                            ) : (
                              <p className='text-[10px] text-muted-foreground'>
                                Recording URL not available
                              </p>
                            )}
                            {firstRecording.recordingDuration && (
                              <p className='text-[10px] text-muted-foreground'>
                                Duration: {formatDuration(firstRecording.recordingDuration)}
                              </p>
                            )}
                          </div>
                        </CollapsibleContent>
                      )}
                    </Collapsible>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

