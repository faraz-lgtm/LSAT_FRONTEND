import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, Loader2 } from 'lucide-react'
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
import { Input } from '@/components/dashboard/ui/input'
import { useForgotPasswordMutation } from '@/redux/apiSlices/Auth/authSlice'

const formSchema = z.object({
  identifier: z.string().min(1, 'Please enter your email or phone number'),
})

export function ForgotPasswordForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const navigate = useNavigate()
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { identifier: '' },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      const result = await forgotPassword({ identifier: data.identifier }).unwrap()
      
      // Store identifier for next step
      localStorage.setItem('passwordResetIdentifier', data.identifier)
      
      toast.success(result.data.message || 'If the provided email or phone number exists, an OTP code has been sent.')
      form.reset()
      navigate({ 
        to: '/otp',
        search: { identifier: data.identifier }
      })
    } catch (error: any) {
      console.error('Forgot password error:', error)
      
      // Always show success message to prevent user enumeration (even on error)
      // This prevents attackers from determining if an email/phone exists
      localStorage.setItem('passwordResetIdentifier', data.identifier)
      toast.success('If the provided email or phone number exists, an OTP code has been sent.')
      navigate({ 
        to: '/otp',
        search: { identifier: data.identifier }
      })
      // Error toast is handled centrally in api.ts (but we show success to prevent enumeration)
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
          name='identifier'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email or Phone Number</FormLabel>
              <FormControl>
                <Input placeholder='name@example.com or +1234567890' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          Continue
          {isLoading ? <Loader2 className='animate-spin' /> : <ArrowRight />}
        </Button>
      </form>
    </Form>
  )
}
