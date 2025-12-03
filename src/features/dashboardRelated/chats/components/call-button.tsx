import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Device, type Call } from '@twilio/voice-sdk'
import { Phone, PhoneOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/dashboard/ui/button'
import { Input } from '@/components/dashboard/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/dashboard/ui/popover'
import { useGetVoiceTokenMutation } from '@/redux/apiSlices/Voice/voiceSlice'
import { useSelector } from 'react-redux'
import type { RootState } from '@/redux/rootReducer'
import { useGetCallsByConversationIdQuery } from '@/redux/apiSlices/Voice/voiceSlice'

type CallButtonProps = {
  defaultNumber?: string
  agentIdentity?: string
  tokenEndpoint?: string
  conversationSid?: string
}

const DEFAULT_AGENT_IDENTITY = 'dashboard-agent'
const DEFAULT_TOKEN_ENDPOINT = '/api/v1/voice/token'
const DEFAULT_CONVERSATION_SID = 'default-conversation-sid'

export function CallButton({
  defaultNumber,
  agentIdentity = DEFAULT_AGENT_IDENTITY,
  tokenEndpoint = DEFAULT_TOKEN_ENDPOINT,
  conversationSid = DEFAULT_CONVERSATION_SID,
}: CallButtonProps) {

  console.log('conversationSid', conversationSid)
  const [phoneNumber, setPhoneNumber] = useState(defaultNumber ?? '')
  const [device, setDevice] = useState<Device | null>(null)
  const [currentCall, setCurrentCall] = useState<Call | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [isOnCall, setIsOnCall] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('Idle')
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [callStartTime, setCallStartTime] = useState<number | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const deviceRef = useRef<Device | null>(null)
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const callAcceptedRef = useRef<boolean>(false) // Track if call has been accepted
  const isBrowser = typeof window !== 'undefined'
  const [getVoiceToken, { isLoading: isRequestingToken }] = useGetVoiceTokenMutation()
  const authUser = useSelector((state: RootState) => state.auth.user)
  const organizationId = useSelector((state: RootState) => state.auth.organizationId)

  // Convert conversationSid to number for the query
  const conversationId = useMemo(() => {
    if (!conversationSid || conversationSid === DEFAULT_CONVERSATION_SID) {
      return null
    }
    const parsed = parseInt(conversationSid, 10)
    return isNaN(parsed) ? null : parsed
  }, [conversationSid])

  // Get refetch function for call logs
  const { refetch: refetchCallLogs } = useGetCallsByConversationIdQuery(conversationId!, {
    skip: !conversationId,
  })

  useEffect(() => {
    setPhoneNumber(defaultNumber ?? '')
  }, [defaultNumber])

  const identity = useMemo(() => {
    return (agentIdentity && agentIdentity.trim()) || DEFAULT_AGENT_IDENTITY
  }, [agentIdentity])

  const fetchToken = useCallback(async () => {
    setStatus('Requesting token...')
    const response = await getVoiceToken({
      userName: identity,
      tokenEndpoint,
    }).unwrap()
    if (!response?.token) {
      throw new Error('Twilio token missing in response')
    }
    return response.token
  }, [getVoiceToken, identity, tokenEndpoint])

  const initDevice = useCallback(async () => {
    if (!isBrowser) {
      return
    }

    setIsInitializing(true)
    try {
      const token = await fetchToken()
      const newDevice = new Device(token)

      // Clean up any prior device before replacing it
      deviceRef.current?.destroy()
      deviceRef.current = newDevice

      newDevice.on('tokenWillExpire', async () => {
        try {
          const refreshedToken = await fetchToken()
          await newDevice.updateToken(refreshedToken)
        } catch (err) {
          setError((err as Error).message || 'Failed to refresh token')
        }
      })

      newDevice.on('error', (deviceError) => {
        setError(deviceError.message)
        setStatus('Device error')
      })

      await newDevice.register()
      setDevice(newDevice)
      setError(null)
      setStatus('Device ready')
    } catch (err) {
      setError((err as Error).message || 'Failed to initialize Twilio device')
      setStatus('Device error')
    } finally {
      setIsInitializing(false)
    }
  }, [fetchToken, isBrowser])

  useEffect(() => {
    if (!isBrowser) {
      return
    }

    void initDevice()
    return () => {
      deviceRef.current?.destroy()
      deviceRef.current = null
    }
  }, [initDevice, isBrowser])

  const resetCallState = useCallback(() => {
    setIsOnCall(false)
    setCurrentCall(null)
    setStatus('Idle')
    setCallStartTime(null)
    setElapsedSeconds(0)
    callAcceptedRef.current = false // Reset acceptance flag
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
  }, [])

  const makeCall = useCallback(async () => {
    if (!deviceRef.current || !phoneNumber) {
      return
    }

    setError(null)
    setStatus('Dialing...')
    try {
      const call = await deviceRef.current.connect({
        params: {
          To: phoneNumber,
          userId: authUser?.id?.toString() || '',
          organizationId: organizationId?.toString() || '',
          conversationSid: conversationSid || '',
        },
      })

      setCurrentCall(call)
      callAcceptedRef.current = false
      setStatus('Ringing...')

      // Track call answer state
      let hasBeenAnswered = false
      let statusCheckInterval: ReturnType<typeof setInterval> | null = null

      // Helper to start the call timer
      const startCallTimer = () => {
        if (callAcceptedRef.current || hasBeenAnswered) {
          return // Already started
        }
        hasBeenAnswered = true
        callAcceptedRef.current = true
        setIsOnCall(true)
        setStatus('On call')
        setCallStartTime(Date.now())
        setElapsedSeconds(0)
        console.log('[CallButton] Call answered - timer started')
      }

      // Listen for the 'accept' event - this fires when the call is answered
      call.on('accept', () => {
        console.log('[CallButton] Accept event fired - call was answered')
        if (statusCheckInterval) {
          clearInterval(statusCheckInterval)
          statusCheckInterval = null
        }
        startCallTimer()
      })

      // Listen for disconnect event
      call.on('disconnect', () => {
        console.log('[CallButton] Disconnect event fired')
        if (statusCheckInterval) {
          clearInterval(statusCheckInterval)
          statusCheckInterval = null
        }

        const finalStatus = call.status()
        const finalStatusString = String(finalStatus)
        console.log('[CallButton] Final call status:', finalStatus)

        // Determine what happened based on whether call was answered
        if (!hasBeenAnswered) {
          // Call ended without being answered
          if (finalStatusString === 'busy' || finalStatusString.includes('busy')) {
            setStatus('Busy')
          } else if (finalStatusString === 'no-answer' || finalStatusString.includes('no-answer')) {
            setStatus('No answer')
          } else if (finalStatusString === 'canceled' || finalStatusString.includes('canceled')) {
            setStatus('Declined')
          } else if (finalStatusString === 'failed' || finalStatusString.includes('failed')) {
            setStatus('Failed')
          } else {
            setStatus('Not answered')
          }
        } else {
          // Call was answered and then ended
          setStatus('Call ended')
        }

        setTimeout(() => {
          resetCallState()
          if (conversationId) {
            refetchCallLogs()
          }
        }, 2000)
      })

      // Listen for error event
      call.on('error', (callError) => {
        console.log('[CallButton] Call error:', callError)
        if (statusCheckInterval) {
          clearInterval(statusCheckInterval)
          statusCheckInterval = null
        }
        setError(callError.message)
        setStatus('Error')
        setTimeout(() => {
          resetCallState()
          if (conversationId) {
            refetchCallLogs()
          }
        }, 2000)
      })

      // Fallback: Poll status to detect if accept event doesn't fire
      // This handles edge cases where the event might not fire reliably
      statusCheckInterval = setInterval(() => {
        const currentStatus = call.status()
        const currentStatusString = String(currentStatus)
        
        // If we detect 'open' or 'in-progress' without having received accept event
        if (!hasBeenAnswered && (currentStatusString === 'open' || currentStatusString === 'in-progress' || currentStatusString.includes('open') || currentStatusString.includes('in-progress'))) {
          // Double-check by looking at call duration
          // If duration > 0, call was definitely answered
          const callParams = (call as any).parameters
          if (callParams?.CallDuration && parseInt(callParams.CallDuration) > 0) {
            console.log('[CallButton] Fallback: Detected answered call via duration')
            if (statusCheckInterval) {
              clearInterval(statusCheckInterval)
              statusCheckInterval = null
            }
            startCallTimer()
          }
        }
        
        // Stop polling if call ended
        if (currentStatusString === 'closed' || currentStatusString === 'completed' || currentStatusString.includes('closed') || currentStatusString.includes('completed')) {
          if (statusCheckInterval) {
            clearInterval(statusCheckInterval)
            statusCheckInterval = null
          }
        }
      }, 1000)

    } catch (err) {
      setError((err as Error).message || 'Unable to start call')
      resetCallState()
    }
  }, [phoneNumber, resetCallState, conversationSid, authUser, organizationId, conversationId, refetchCallLogs])

  const hangUp = useCallback(() => {
    if (currentCall) {
      currentCall.disconnect()
    } else if (deviceRef.current) {
      deviceRef.current.disconnectAll()
    }
    resetCallState()
  }, [currentCall, resetCallState])

  // Timer effect - updates every second when on call
  useEffect(() => {
    if (isOnCall && callStartTime) {
      timerIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - callStartTime) / 1000)
        setElapsedSeconds(elapsed)
      }, 1000)

      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current)
          timerIntervalRef.current = null
        }
      }
    }
    return undefined
  }, [isOnCall, callStartTime])

  // Format timer as MM:SS
  const formatTimer = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  const isBusy = isInitializing || isRequestingToken
  const deviceReady = !!device && !isBusy
  const canCall = !!phoneNumber && !currentCall && deviceReady
  const canHangUp = !!currentCall // Allow hanging up even when ringing

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          size='icon'
          variant='ghost'
          className='h-9 w-9 rounded-full'
          title={isOnCall ? 'Hang up' : 'Call contact'}
          disabled={isBusy}
          onClick={() => {
            if (!device && !isBusy) {
              void initDevice()
            }
          }}
        >
          {isBusy ? (
            <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
          ) : isOnCall ? (
            <PhoneOff className='h-4 w-4 text-red-500' />
          ) : (
            <Phone className='h-4 w-4 text-muted-foreground' />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align='end' className='w-72 space-y-3'>
        {/* Call Timer - Prominently displayed when on call (only when actually connected) */}
        {isOnCall && callStartTime !== null && (
          <div className='flex items-center justify-center py-3 px-4 bg-muted/50 rounded-lg border'>
            <div className='text-center'>
              <p className='text-xs text-muted-foreground mb-1'>Call Duration</p>
              <p className='text-2xl font-mono font-semibold text-foreground'>
                {formatTimer(elapsedSeconds)}
              </p>
            </div>
          </div>
        )}
        
        {/* Show ringing status when call is initiated but not answered */}
        {currentCall && !isOnCall && status === 'Ringing...' && (
          <div className='flex items-center justify-center py-3 px-4 bg-muted/50 rounded-lg border'>
            <div className='text-center'>
              <p className='text-sm text-muted-foreground'>Ringing...</p>
            </div>
          </div>
        )}
        
        <div className='space-y-1'>
          <label className='text-sm font-medium text-foreground'>Phone number</label>
          <Input
            type='tel'
            placeholder='+1234567890'
            value={phoneNumber}
            disabled={isOnCall}
            onChange={(event) => setPhoneNumber(event.target.value)}
          />
        </div>
        <div className='flex items-center gap-2'>
          <Button
            className='flex-1'
            onClick={makeCall}
            disabled={!canCall}
          >
            📞 Call
          </Button>
          <Button
            className='flex-1'
            variant='destructive'
            onClick={hangUp}
            disabled={!canHangUp}
          >
            ❌ Hang Up
          </Button>
        </div>
        <div className='space-y-1 text-xs text-muted-foreground'>
          <p>{status}</p>
          {error && <p className='text-destructive'>{error}</p>}
        </div>
      </PopoverContent>
    </Popover>
  )
}