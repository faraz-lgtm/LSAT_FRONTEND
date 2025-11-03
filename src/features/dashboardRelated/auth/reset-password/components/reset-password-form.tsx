import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { CheckCircle, Loader2 } from 'lucide-react'
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
import { PasswordInput } from '@/components/dashboard/password-input'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/dashboard/ui/input-otp'
import { useResetPasswordMutation } from '@/redux/apiSlices/Auth/authSlice'

const formSchema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Please confirm your password'),
    otp: z.string().length(6, 'Please enter the 6-digit OTP code'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export function ResetPasswordForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const navigate = useNavigate()
  const search = useSearch({ from: '/(auth)/reset-password' }) as {
    identifier?: string
    otp?: string
  }
  const [resetPassword, { isLoading }] = useResetPasswordMutation()
  const [identifier, setIdentifier] = useState<string>('')
  const [prefilledOtp, setPrefilledOtp] = useState<string>('')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
      otp: '',
    },
  })

  // Get identifier and OTP from search params or localStorage
  useEffect(() => {
    const id =
      search?.identifier || localStorage.getItem('passwordResetIdentifier') || ''
    const otp = search?.otp || ''

    if (id) {
      setIdentifier(id)
      localStorage.setItem('passwordResetIdentifier', id)
    } else {
      toast.error('Please start the password reset process again.')
      navigate({ to: '/forgot-password' })
      return
    }

    if (otp) {
      setPrefilledOtp(otp)
      form.setValue('otp', otp)
    }
  }, [search, navigate, form])

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (!identifier) {
      toast.error('Identifier missing. Please start the password reset process again.')
      navigate({ to: '/forgot-password' })
      return
    }

    try {
      const result = await resetPassword({
        identifier,
        otp: data.otp,
        newPassword: data.newPassword,
      }).unwrap()

      toast.success(result.data.message || 'Password reset successfully')
      
      // Clear stored identifier
      localStorage.removeItem('passwordResetIdentifier')
      
      // Navigate to sign-in page
      setTimeout(() => {
        navigate({ to: '/sign-in' })
      }, 1500)
    } catch (error: any) {
      console.error('Reset password error:', error)

      if (error?.data?.message) {
        toast.error(error.data.message)
      } else if (error?.status === 400) {
        toast.error('Invalid OTP code or password requirements not met.')
      } else if (error?.status === 404) {
        toast.error('OTP expired or invalid. Please request a new one.')
      } else if (error?.status >= 500) {
        toast.error('Server error. Please try again later.')
      } else {
        toast.error('Failed to reset password. Please try again.')
      }
    }
  }

  const otp = form.watch('otp')

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-4', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='otp'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Verification Code</FormLabel>
              <FormControl>
                <InputOTP
                  maxLength={6}
                  {...field}
                  containerClassName='justify-between sm:[&>[data-slot="input-otp-group"]>div]:w-12'
                  disabled={!!prefilledOtp}
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
        <FormField
          control={form.control}
          name='newPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder='Enter new password (min 8 characters)'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='Confirm new password' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading || otp.length < 6}>
          {isLoading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Resetting...
            </>
          ) : (
            <>
              <CheckCircle className='mr-2 h-4 w-4' />
              Reset Password
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}

