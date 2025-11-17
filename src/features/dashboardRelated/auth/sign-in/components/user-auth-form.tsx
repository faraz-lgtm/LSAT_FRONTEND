import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { IconFacebook, IconGithub } from '@/assets/brand-icons'
import { useDispatch } from 'react-redux'
import { setUser, setTokens, setOrganization } from '@/redux/authSlice'
import { getOrganizationSlugFromSubdomain } from '@/utils/organization'
import { cn } from '@/lib/dashboardRelated/utils'
import { useLoginMutation } from '@/redux/apiSlices/Auth/authSlice'
import { ROLE } from '@/constants/roles'
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
import { PasswordInput } from '@/components/dashboard/password-input'



const formSchema = z.object({
  email: z.email({
    error: (iss) => (iss.input === '' ? 'Please enter your email' : undefined),
  }),
  password: z
    .string()
    .min(1, 'Please enter your password')
    .min(7, 'Password must be at least 7 characters long'),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [login, { isLoading }] = useLoginMutation()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      console.log("Submitting data", data)
      
      const result = await login({
        email: data.email,
        password: data.password,
      }).unwrap()

      console.log("Result", result)

      // Decode JWT token to extract organizationId
      const decodeJWT = (token: string): any => {
        try {
          const base64Url = token.split('.')[1]
          if (!base64Url) return null
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          )
          return JSON.parse(jsonPayload)
        } catch (error) {
          console.error('Failed to decode JWT:', error)
          return null
        }
      }

      const accessToken = result.data.auth.accessToken
      const decodedToken = decodeJWT(accessToken)
      
      // Extract organizationId from token if present
      let organizationId: number | null = null
      if (decodedToken?.organizationId) {
        organizationId = Number(decodedToken.organizationId)
      }
      
      // Fallback to API response if token doesn't have it
      if (!organizationId && result.data.user.organizationId) {
        organizationId = Number(result.data.user.organizationId)
      }

      // Get organization slug from subdomain (for UI purposes only, not for headers)
      const organizationSlug = getOrganizationSlugFromSubdomain()

      // Set user and tokens from API response
      // Filter roles to only include those in ROLE enum (exclude COMPANY_ADMIN)
      const validRoles = (result.data.user.roles || []).filter((role): role is ROLE => 
        role === 'USER' || role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'CUST'
      )
      dispatch(setUser({
        id: result.data.user.id,
        username: result.data.user.username,
        roles: validRoles
      }))
      dispatch(setTokens({
        accessToken: result.data.auth.accessToken,
        refreshToken: result.data.auth.refreshToken
      }))

      // Store organizationId in Redux (for reference, not for headers)
      // Note: Backend extracts organizationId from JWT token automatically
      if (organizationId !== null) {
        dispatch(setOrganization({
          organizationId,
          organizationSlug, // Optional: for UI purposes only
        }))
      }

      // Show success message
      toast.success(`Welcome back, ${data.email}!`)

      // Redirect to the stored location or default to dashboard
      const targetPath = redirectTo || '/'
      navigate({ to: targetPath, replace: true })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Login error:', error)
      
      // Handle different types of errors
      if (error?.data?.message) {
        toast.error(error.data.message)
      } else if (error?.status === 401) {
        toast.error('Invalid email or password')
      } else if (error?.status === 403) {
        toast.error('Account is disabled or locked')
      } else if (error?.status >= 500) {
        toast.error('Server error. Please try again later.')
      } else {
        toast.error('Login failed. Please try again.')
      }
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='name@example.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to='/forgot-password'
                className='text-muted-foreground absolute end-0 -top-0.5 text-sm font-medium hover:opacity-75'
              >
                Forgot password?
              </Link>
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
          Sign in
        </Button>

        <div className='relative my-2'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background text-muted-foreground px-2'>
              Or continue with
            </span>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-2'>
          <Button variant='outline' type='button' disabled={isLoading}>
            <IconGithub className='h-4 w-4' /> GitHub
          </Button>
          <Button variant='outline' type='button' disabled={isLoading}>
            <IconFacebook className='h-4 w-4' /> Facebook
          </Button>
        </div>
      </form>
    </Form>
  )
}
