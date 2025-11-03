import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DateTimePicker } from '@/components/ui/dateTimerPicker'
import { useConfirmPublicRescheduleMutation } from '@/redux/apiSlices/Order/orderSlice'


//

function useTimezoneLabel() {
  const tz = React.useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone
    } catch {
      return 'Local time'
    }
  }, [])
  return tz
}

export function ReschedulePage() {
  const [state, setState] = React.useState<'loading' | 'ready' | 'confirming' | 'success' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = React.useState<string>('')
  const [selectedSlotISO, setSelectedSlotISO] = React.useState<string>('')
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const token = React.useMemo(() => new URLSearchParams(window.location.search).get('token') || '', [])
  const tz = useTimezoneLabel()
  const [confirmReschedule] = useConfirmPublicRescheduleMutation()

  React.useEffect(() => {
    if (!token) {
      setErrorMsg('Link expired or invalid. Request a new link.')
      setState('error')
      return
    }
    // DateTimePicker will drive fetching + selection; keep page as ready
    setState('ready')
  }, [token])

  const onConfirm = React.useCallback(async () => {
    if (!selectedSlotISO) return
    setState('confirming')
    try {
      await confirmReschedule({ token, newDateTimeISO: selectedSlotISO }).unwrap()
      setState('success')
    } catch {
      setErrorMsg('That time is no longer available. Please pick another.')
      try {
        // noop: DateTimePicker will refetch on date change
      } finally {
        setState('ready')
      }
    }
  }, [selectedSlotISO, token, confirmReschedule])

  // DateTimePicker returns a Date with exact time; update selectedSlotISO
  const handleDateTimeChange = (dt: Date) => {
    setDate(dt)
    setSelectedSlotISO(dt.toISOString())
  }

  if (state === 'loading') {
    return (
      <div className="mx-auto max-w-xl p-6">
        <Card className="p-6">
          <h1 className="text-xl font-semibold">Reschedule appointment</h1>
          <p className="mt-4 text-sm text-muted-foreground">Loading available times…</p>
        </Card>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="mx-auto max-w-xl p-6">
        <Card className="p-6 space-y-4">
          <h1 className="text-xl font-semibold">Reschedule appointment</h1>
          <p className="text-destructive text-sm">{errorMsg || 'Something went wrong.'}</p>
          <div>
            <Button onClick={() => window.location.reload()}>Try again</Button>
          </div>
        </Card>
      </div>
    )
  }

  if (state === 'success') {
    return (
      <div className="mx-auto max-w-xl p-6">
        <Card className="p-6 space-y-4">
          <h1 className="text-xl font-semibold">You’re all set</h1>
          <p className="text-sm text-muted-foreground">Your appointment has been rescheduled. Add it to your calendar to avoid missing it.</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.close()}>Close</Button>
          </div>
        </Card>
      </div>
    )
  }

  

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Card className="p-6 space-y-4">
        <div className="flex items-baseline justify-between">
          <h1 className="text-xl font-semibold">Reschedule appointment</h1>
          <span className="text-xs text-muted-foreground">Timezone: {tz}</span>
        </div>

        <div className="max-w-lg">
          <DateTimePicker
            token={token}
            value={date}
            onChange={handleDateTimeChange}
          />
        </div>

        {errorMsg && (
          <div className="text-xs text-destructive">{errorMsg}</div>
        )}

        <div className="flex gap-2 pt-2">
          <Button disabled={!selectedSlotISO || state === 'confirming'} onClick={onConfirm}>
            {state === 'confirming' ? 'Confirming…' : 'Confirm reschedule'}
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>Cancel</Button>
        </div>
      </Card>
    </div>
  )
}

export const Route = createFileRoute('/reschedule')({
  component: ReschedulePage,
})


