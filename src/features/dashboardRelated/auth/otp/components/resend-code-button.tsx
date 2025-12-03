import { useState, useEffect } from 'react'
import { useSearch } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useForgotPasswordMutation } from '@/redux/apiSlices/Auth/authSlice'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/dashboard/ui/button'

const RESEND_COOLDOWN_SECONDS = 60 // 1 minute cooldown

export function ResendCodeButton() {
  const search = useSearch({ from: '/(auth)/otp' }) as { identifier?: string }
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()
  const [cooldown, setCooldown] = useState(0)
  const [identifier, setIdentifier] = useState<string>('')

  // Get identifier from search params or localStorage
  useEffect(() => {
    const id = search?.identifier || localStorage.getItem('passwordResetIdentifier') || ''
    setIdentifier(id)
  }, [search])

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => {
        setCooldown(cooldown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [cooldown])

  const handleResend = async () => {
    if (!identifier) {
      toast.error('Identifier missing. Please start the password reset process again.')
      return
    }

    if (cooldown > 0) {
      toast.error(`Please wait ${cooldown} seconds before requesting a new code.`)
      return
    }

    try {
      const result = await forgotPassword({ identifier }).unwrap()
      
      // Set cooldown timer
      setCooldown(RESEND_COOLDOWN_SECONDS)
      
      toast.success(result.data.message || 'A new authentication code has been sent to your email and phone number.')
    } catch (error: any) {
      console.error('Resend OTP error:', error)
      
      // Handle rate limit separately (set cooldown)
      if (error?.status === 429) {
        // Set a longer cooldown for rate limit errors
        setCooldown(RESEND_COOLDOWN_SECONDS * 2)
      } else {
        // Set normal cooldown for other errors
        setCooldown(RESEND_COOLDOWN_SECONDS)
      }
      // Error toast is handled centrally in api.ts
    }
  }

  return (
    <div className='flex flex-col items-center gap-2 w-full'>
      <p className='text-muted-foreground text-sm text-center'>
        Haven't received it?
      </p>
      <Button
        variant='link'
        onClick={handleResend}
        disabled={isLoading || cooldown > 0 || !identifier}
        className='h-auto p-0 text-sm'
      >
        {isLoading ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Sending...
          </>
        ) : cooldown > 0 ? (
          `Resend code in ${cooldown}s`
        ) : (
          'Resend a new code'
        )}
      </Button>
    </div>
  )
}

