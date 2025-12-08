import * as React from 'react'
import { DateTimePicker } from '@/components/ui/dateTimerPicker'
import { 
  useGetPublicOrderRescheduleInfoQuery,
  useConfirmPublicOrderRescheduleMutation 
} from '@/redux/apiSlices/Order/orderSlice'
import { ArrowLeft, Check, AlertCircle, Terminal } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

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

interface AppointmentSlot {
  id: number
  slotDateTime: string
  originalDateTime: string // Keep track of original time
  packageName: string
  duration: number
  assignedEmployeeName?: string
  newDateTime?: string
  hasChanged?: boolean // Track if user changed the time
  isRescheduled?: boolean
  isConfirming?: boolean
}

export function OrderReschedulePage() {
  const [state, setState] = React.useState<'loading' | 'ready' | 'confirming' | 'success' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = React.useState<string>('')
  const [appointments, setAppointments] = React.useState<AppointmentSlot[]>([])
  const [slotsRefreshed, setSlotsRefreshed] = React.useState(false)
  
  const token = React.useMemo(() => new URLSearchParams(window.location.search).get('token') || '', [])
  const tz = useTimezoneLabel()
  
  const [confirmReschedule, { isLoading: isConfirming }] = useConfirmPublicOrderRescheduleMutation()
  
  // Fetch order info with appointments
  const { data: orderInfo, isLoading: isLoadingInfo, error: infoError } = useGetPublicOrderRescheduleInfoQuery(
    { token },
    { skip: !token }
  )

  // Initialize appointments from API response
  React.useEffect(() => {
    if (!token) {
      setErrorMsg('Link expired or invalid. Request a new link.')
      setState('error')
      return
    }

    if (infoError) {
      setErrorMsg('Failed to load order information. The link may have expired.')
      setState('error')
      return
    }

    if (orderInfo?.data?.appointments) {
      const appts = orderInfo.data.appointments.map(apt => ({
        ...apt,
        originalDateTime: apt.slotDateTime, // Keep original for comparison
        newDateTime: apt.slotDateTime,
        hasChanged: false,
      }))
      setAppointments(appts)
      setState('ready')
    }
  }, [token, orderInfo, infoError])

  // Handle date/time change for an appointment
  const handleDateTimeChange = (appointmentId: number, newDate: Date) => {
    console.log('Date changed for appointment:', appointmentId, 'to:', newDate.toISOString())
    setAppointments(prev => prev.map(apt => 
      apt.id === appointmentId 
        ? { ...apt, newDateTime: newDate.toISOString(), hasChanged: true } 
        : apt
    ))
  }

  // Handle confirm single appointment reschedule
  const handleConfirmSingle = async (appointmentId: number) => {
    const apt = appointments.find(a => a.id === appointmentId)
    if (!apt || !apt.newDateTime || !apt.hasChanged) {
      console.log('Skip confirm single - no changes for:', appointmentId)
      return
    }
    console.log('Confirming single appointment:', appointmentId, 'new time:', apt.newDateTime)

    // Update state to show confirming for this appointment
    setAppointments(prev => prev.map(a => 
      a.id === appointmentId ? { ...a, isConfirming: true } : a
    ))

    try {
      await confirmReschedule({ 
        token, 
        appointmentId: apt.id, 
        newDateTimeISO: apt.newDateTime 
      }).unwrap()

      // Mark as rescheduled and update the original slotDateTime
      setAppointments(prev => prev.map(a => 
        a.id === appointmentId 
          ? { ...a, isRescheduled: true, slotDateTime: apt.newDateTime!, isConfirming: false } 
          : a
      ))
      
      setSlotsRefreshed(true)
      setTimeout(() => setSlotsRefreshed(false), 3000)
    } catch {
      setAppointments(prev => prev.map(a => 
        a.id === appointmentId ? { ...a, isConfirming: false } : a
      ))
      setErrorMsg('Could not reschedule this appointment. Please try again.')
      setTimeout(() => setErrorMsg(''), 5000)
    }
  }

  // Handle confirm all reschedules - parallel execution
  const handleConfirmAll = async () => {
    setState('confirming')
    
    // Get all appointments that need rescheduling
    const toReschedule = appointments.filter(
      apt => apt.newDateTime && apt.hasChanged && !apt.isRescheduled
    )
    console.log('Appointments to reschedule:', toReschedule)
    
    if (toReschedule.length === 0) {
      setState('ready')
      return
    }

    // Mark all as confirming
    setAppointments(prev => prev.map(a => 
      toReschedule.find(r => r.id === a.id) ? { ...a, isConfirming: true } : a
    ))
    
    try {
      // Execute all reschedules in parallel
      const results = await Promise.allSettled(
        toReschedule.map(apt => 
          confirmReschedule({ 
            token, 
            appointmentId: apt.id, 
            newDateTimeISO: apt.newDateTime! 
          }).unwrap()
        )
      )
      
      // Process results
      const successIds: number[] = []
      const failedIds: number[] = []
      
      results.forEach((result, index) => {
        const apt = toReschedule[index]
        if (!apt) return
        if (result.status === 'fulfilled') {
          successIds.push(apt.id)
        } else {
          failedIds.push(apt.id)
        }
      })
      
      // Update state for all appointments
      setAppointments(prev => prev.map(a => {
        if (successIds.includes(a.id)) {
          const apt = toReschedule.find(r => r.id === a.id)
          return { ...a, isRescheduled: true, slotDateTime: apt?.newDateTime || a.slotDateTime, isConfirming: false }
        }
        if (failedIds.includes(a.id)) {
          return { ...a, isConfirming: false }
        }
        return a
      }))
      
      if (failedIds.length > 0) {
        setErrorMsg(`${failedIds.length} appointment(s) could not be rescheduled. Please try again.`)
        setState('ready')
        setTimeout(() => setErrorMsg(''), 5000)
      } else {
        setState('success')
        setSlotsRefreshed(true)
      }
    } catch {
      setAppointments(prev => prev.map(a => ({ ...a, isConfirming: false })))
      setErrorMsg('Failed to reschedule appointments. Please try again.')
      setState('ready')
      setTimeout(() => setErrorMsg(''), 5000)
    }
  }

  // Handle cancel - go back
  const handleCancel = () => {
    window.history.back()
  }

  // Calculate total appointments
  const totalAppointments = appointments.length
  const pendingReschedules = appointments.filter(a => !a.isRescheduled && a.hasChanged).length
  const completedReschedules = appointments.filter(a => a.isRescheduled).length
  
  console.log('Appointments state:', appointments.map(a => ({ 
    id: a.id, 
    hasChanged: a.hasChanged, 
    isRescheduled: a.isRescheduled,
    newDateTime: a.newDateTime 
  })))
  console.log('Pending:', pendingReschedules, 'Completed:', completedReschedules)

  if (state === 'loading' || isLoadingInfo) {
    return (
      <div className="min-h-screen customer-page-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="min-h-screen customer-page-bg flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h1 className="text-xl font-semibold">Unable to Load</h1>
          <p className="text-sm text-red-600">{errorMsg || 'Something went wrong.'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (state === 'success') {
    return (
      <div className="min-h-screen customer-page-bg flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-xl font-semibold">You're all set!</h1>
          <p className="text-sm text-gray-600">
            Your appointments have been rescheduled successfully. Add them to your calendar to avoid missing them.
          </p>
          <button 
            onClick={() => window.close()}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen customer-page-bg relative flex flex-col">
      <div className="relative z-10 py-4 sm:py-6 pb-32 sm:pb-6 lg:pb-6">
        <div className="customer-container customer-content w-full">
          {/* Top Section */}
          <div className="flex-shrink-0 space-y-2 mb-4">
            {/* Back Button */}
            <div>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md text-xs"
              >
                <ArrowLeft size={16} />
                <span className="font-medium">Back</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 w-full">
            <div className="flex flex-col">
              {/* Error Alert */}
              {errorMsg && (
                <div className="fixed top-16 right-4 z-50 w-80 animate-in slide-in-from-top-5">
                  <Alert variant="destructive" className="mb-4">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{errorMsg}</AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Slots Updated Alert */}
              {slotsRefreshed && (
                <div className="fixed top-16 right-4 z-50 w-80 animate-in slide-in-from-top-5">
                  <Alert className="mb-4 bg-green-50 border-green-200">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Slots Updated!</AlertTitle>
                    <AlertDescription className="text-green-700">
                      Your appointments have been successfully rescheduled.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Schedule Your Sessions Panel */}
              <div className="w-full">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                  {/* Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-baseline justify-between">
                      <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Reschedule Your Sessions</h1>
                      <span className="text-xs text-gray-500">Timezone: {tz}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-4">
                    {/* Prep Session Details Banner */}
                    <div 
                      className="p-4 sm:p-5 rounded-xl border-2 shadow-lg" 
                      style={{ 
                        background: 'var(--customer-primary-gradient, linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%))', 
                        borderColor: 'var(--customer-primary, #3b82f6)' 
                      }}
                    >
                      <h3 className="font-bold text-white mb-2.5 text-base sm:text-lg">
                        Prep Session Details
                      </h3>
                      <p className="font-semibold mb-2 text-sm sm:text-base text-white">
                        You have{" "}
                        <span className="text-yellow-300 font-extrabold text-base sm:text-lg">
                          {totalAppointments}
                        </span>{" "}
                        appointment{totalAppointments !== 1 ? "s" : ""} to schedule
                      </p>
                      <p className="text-xs sm:text-sm leading-relaxed text-white/90">
                        We've pre-selected the best available times for you. 
                        Tap any slot to adjust or reschedule
                      </p>
                    </div>

                    {/* Appointments List */}
                    {appointments.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-2xl">📅</span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">
                          No appointments available
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {appointments.map((appointment, packageIndex) => (
                          <div
                            key={appointment.id}
                            className={`bg-white dark:bg-gray-800 p-3 rounded-lg border shadow-sm transition-all ${
                              appointment.isRescheduled 
                                ? 'border-green-300 bg-green-50/30' 
                                : 'border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <div className="p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                              <div className="flex items-center justify-between mb-2">
                                <h6 className="font-medium text-gray-800 dark:text-gray-200 flex items-center text-[10px] sm:text-xs">
                                  <span 
                                    className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-white text-[9px] sm:text-[10px] font-bold mr-1.5" 
                                    style={{ backgroundColor: appointment.isRescheduled ? '#22c55e' : 'var(--customer-primary, #3b82f6)' }}
                                  >
                                    {appointment.isRescheduled ? <Check size={10} /> : packageIndex + 1}
                                  </span>
                                  {appointment.packageName} ({appointment.duration} min)
                                </h6>
                                {appointment.isRescheduled && (
                                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] sm:text-xs rounded-full font-medium">
                                    Rescheduled
                                  </span>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-1 gap-2">
                                <div className="flex flex-row items-center gap-2">
                                  <span 
                                    className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full text-[9px] sm:text-[10px] font-medium flex-shrink-0" 
                                    style={{ 
                                      backgroundColor: appointment.isRescheduled 
                                        ? 'rgba(34, 197, 94, 0.1)' 
                                        : 'var(--customer-primary-rgba-10, rgba(59, 130, 246, 0.1))', 
                                      color: appointment.isRescheduled 
                                        ? '#22c55e' 
                                        : 'var(--customer-primary, #3b82f6)' 
                                    }}
                                  >
                                    1
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <DateTimePicker
                                      token={token}
                                      appointmentId={appointment.id}
                                      value={appointment.newDateTime ? new Date(appointment.newDateTime) : new Date(appointment.slotDateTime)}
                                      onChange={(date) => handleDateTimeChange(appointment.id, date)}
                                    />
                                  </div>
                                  {/* Individual Confirm Button */}
                                  {!appointment.isRescheduled && appointment.hasChanged && (
                                    <button
                                      onClick={() => handleConfirmSingle(appointment.id)}
                                      disabled={appointment.isConfirming}
                                      className="px-2 py-1 text-[10px] sm:text-xs font-medium text-white rounded-md transition-colors disabled:opacity-50"
                                      style={{ backgroundColor: 'var(--customer-button-orange, #f97316)' }}
                                    >
                                      {appointment.isConfirming ? '...' : 'Confirm'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Status Summary */}
                    {completedReschedules > 0 && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-700">
                          {completedReschedules} of {totalAppointments} appointment{completedReschedules !== 1 ? 's' : ''} rescheduled
                        </span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={handleCancel}
                        disabled={isConfirming}
                        className="px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg font-semibold transition-all duration-300 text-xs sm:text-sm bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      {pendingReschedules > 0 ? (
                        <button
                          onClick={handleConfirmAll}
                          disabled={isConfirming}
                          className="px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg text-xs sm:text-sm text-white disabled:bg-gray-400"
                          style={{ backgroundColor: isConfirming ? undefined : 'var(--customer-button-orange, #f97316)' }}
                        >
                          {isConfirming ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 border-b-2 border-white mr-1.5 sm:mr-2"></div>
                              <span className="text-[10px] sm:text-xs">Rescheduling...</span>
                            </div>
                          ) : (
                            `Confirm All (${pendingReschedules})`
                          )}
                        </button>
                      ) : completedReschedules === totalAppointments ? (
                        <button
                          onClick={() => window.close()}
                          className="px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg text-xs sm:text-sm text-white bg-green-600 hover:bg-green-700"
                        >
                          <div className="flex items-center gap-2">
                            <Check size={14} />
                            Done
                          </div>
                        </button>
                      ) : (
                        <button
                          disabled
                          className="px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm bg-gray-300 text-gray-500 cursor-not-allowed"
                        >
                          Select new time to reschedule
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderReschedulePage

