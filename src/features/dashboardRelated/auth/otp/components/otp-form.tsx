import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { toast } from 'sonner'
import { cn } from '@/lib/dashboardRelated/utils'
import { Button } from '@/components/dashboard/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/dashboard/ui/form'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/dashboard/ui/input-otp'
import { useVerifyOtpMutation } from '@/redux/apiSlices/Auth/authSlice'

const formSchema = z.object({
  otp: z
    .string()
    .min(6, 'Please enter the 6-digit code.')
    .max(6, 'Please enter the 6-digit code.'),
})

type OtpFormProps = React.HTMLAttributes<HTMLFormElement>

export function OtpForm({ className, ...props }: OtpFormProps) {
  const navigate = useNavigate()
  const search = useSearch({ from: '/(auth)/otp' }) as { identifier?: string }
  const [verifyOtp, { isLoading }] = useVerifyOtpMutation()
  const [identifier, setIdentifier] = useState<string>('')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { otp: '' },
  })

  const otp = form.watch('otp')

  // Get identifier from search params or localStorage
  useEffect(() => {
    const id = search?.identifier || localStorage.getItem('passwordResetIdentifier') || ''
    if (id) {
      setIdentifier(id)
      // Store in localStorage as backup
      localStorage.setItem('passwordResetIdentifier', id)
    } else {
      // No identifier found, redirect back to forgot password
      toast.error('Please start the password reset process again.')
      navigate({ to: '/forgot-password' })
    }
  }, [search, navigate])

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (!identifier) {
      toast.error('Identifier missing. Please start the password reset process again.')
      navigate({ to: '/forgot-password' })
      return
    }

    try {
      // Verify OTP (non-destructive check)
      const result = await verifyOtp({
        identifier,
        otp: data.otp,
      }).unwrap()

      if (result.data.isValid) {
        // Navigate to reset password with identifier and OTP
        navigate({
          to: '/reset-password',
          search: { identifier, otp: data.otp },
        })
      } else {
        toast.error('Invalid OTP code. Please try again.')
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error)
      // Error toast is handled centrally in api.ts
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-2', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='otp'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='sr-only'>One-Time Password</FormLabel>
              <FormControl>
                <InputOTP
                  maxLength={6}
                  {...field}
                  containerClassName='justify-between sm:[&>[data-slot="input-otp-group"]>div]:w-12'
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={otp.length < 6 || isLoading}>
          Verify
        </Button>
      </form>
    </Form>
  )
}
