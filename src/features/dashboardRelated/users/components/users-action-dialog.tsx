'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/dashboard/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/dashboard/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/dashboard/ui/form'
import { Input } from '@/components/dashboard/ui/input'
import {  useRegisterUserMutation } from '@/redux/apiSlices/Auth/authSlice'
import { ROLE } from '@/constants/roles'
import { roles } from '../data/data'
import { MultiSelectDropdown } from '@/components/dashboard/multi-select-dropdown'
import { useUsers } from './users-provider'
import { useSelector } from 'react-redux'
import type { RootState } from '@/redux/store'
import { getAvailableRolesForNewUser } from '@/utils/rbac'
import { convertAuthUserToIUser } from '@/utils/authUserConverter'
import { toast } from 'sonner';
import PhoneInput from "react-phone-input-2";
import { useUpdateUserMutation, type UserOutput } from '@/redux/apiSlices/User/userSlice'
import { WorkHoursSelector } from '@/components/dashboard/work-hours-selector'



const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  username: z.string().min(1, 'Username is required.'),
  phone: z.string().min(1, 'Phone number is required.'),
  email: z.email({
    error: (iss) => (iss.input === '' ? 'Email is required.' : undefined),
  }),
  password: z.string().optional(),
  roles: z.array(z.enum([ROLE.USER, ROLE.ADMIN, ROLE.CUSTOMER]))
    .min(1, 'At least one role is required.'),
  workHours: z.record(z.string(), z.array(z.string())).optional(),
  isEdit: z.boolean(),
}).refine((data) => {
  // Password is required only for new users (not edit mode) and not for CUSTOMER role
  const isCustomerOnly = data.roles.length === 1 && data.roles.includes(ROLE.CUSTOMER);
  if (!data.isEdit && !isCustomerOnly && (!data.password || data.password.length < 6)) {
    return false;
  }
  return true;
}, {
  message: "Password must be at least 6 characters.",
  path: ["password"],
})

type UserForm = z.infer<typeof formSchema>

type UserActionDialogProps = {
  currentRow?: UserOutput
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersActionDialog({
  currentRow,
  open,
  onOpenChange,
}: UserActionDialogProps) {
  const isEdit = !!currentRow
  const { setOpen } = useUsers()
  const [registerUser, { isLoading }] = useRegisterUserMutation()
  const [updateUser,{isLoading:updateLoading}]=useUpdateUserMutation()
  // Get current user from auth state
  const currentUser = useSelector((state: RootState) => state.auth.user)
  
  // Convert AuthUser to UserOutput format for RBAC functions
  const currentUserForRBAC = convertAuthUserToIUser(currentUser)
  
  // Get available roles based on current user's permissions
  const availableRoles = getAvailableRolesForNewUser(currentUserForRBAC)
  
  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          name: currentRow.name,
          username: currentRow.username,
          phone: currentRow.phone,
          email: currentRow.email,
          password: '', // Don't pre-fill password for edit
          roles: currentRow.roles,
          workHours: currentRow.workHours || {},
          isEdit,
        }
      : {
          name: '',
          username: '',
          email: '',
          phone: '',
          password: '',
          roles: [],
          workHours: {},
          isEdit,
        },
  })

  // Watch roles to determine if user is customer-only
  const watchedRoles = form.watch('roles')
  const isCustomerOnly = watchedRoles.length === 1 && watchedRoles.includes(ROLE.CUSTOMER)

  const onSubmit = async (values: UserForm) => {
    console.log("🚀 onSubmit called with values:", values);
    try {
      if (!isEdit) {
        // Create new user
        const isCustomerOnly = values.roles.length === 1 && values.roles.includes(ROLE.CUSTOMER);
        
        if (!isCustomerOnly && !values.password) {
          toast.error("Password is required for non-customer users.")
          return
        }
        
        const userData = {
          name: values.name,
          username: values.username,
          email: values.email,
          phone: values.phone,
          password: values.password,
          roles: values.roles,
          workHours: isCustomerOnly ? undefined : values.workHours,
        }
        
        await registerUser(userData).unwrap()
        
        toast.success("User created successfully!")
      } else {
        console.log("📝 Edit user - values:", values);
        console.log("📝 Edit user - currentRow:", currentRow);
        const isCustomerOnly = values.roles.length === 1 && values.roles.includes(ROLE.CUSTOMER);
        const userData = {
          name: values.name,
          username: values.username,
          email: values.email,
          phone: values.phone,
          roles: values.roles,
          workHours: isCustomerOnly ? undefined : values.workHours,
        }
        console.log("🔄 Calling updateUser with:", {id: currentRow.id, userData});
        const result = await updateUser({id: currentRow.id, userData}).unwrap()
        console.log("✅ updateUser success:", result.data);
        
        toast.success("User updated successfully!")
      }
      
      form.reset()
      setOpen(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log("❌ Error:", error);
      toast.error(error?.data?.error.message || `Failed to ${isEdit ? 'update' : 'create'} user`)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-2xl max-h-[80vh]'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the user here. ' : 'Create new user here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='h-[60vh] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='user-form'
              onSubmit={form.handleSubmit(onSubmit, (errors) => {
                console.log("❌ Form validation errors:", errors);
              })}
              className='space-y-4 px-0.5'
            >
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='John doe'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='username'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Username
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='john_doe'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='john.doe@gmail.com'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='phone'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <div className='col-span-4'>
                        <PhoneInput
                          country={"pk"} // default to Pakistan
                          value={field.value || ''}
                          onChange={(val) => field.onChange("+" + val)}
                          inputProps={{
                            id: "phone",
                            name: "phone",
                            required: true,
                            placeholder: "Enter phone number"
                          }}
                          inputClass="w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                          containerClass="w-full"
                          buttonClass="rounded-l-md border border-input border-r-0"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              {!isEdit && !isCustomerOnly && (
                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 text-end'>
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type='password'
                          placeholder='Enter password'
                          className='col-span-4'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name='roles'
                render={({ field }) => {
                  return (
                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 text-end'>Roles</FormLabel>
                      <MultiSelectDropdown
                        value={field.value?.map(role => {
                          // Convert uppercase role constant to lowercase for display
                          console.log("role", role);
                          const roleMap: Record<string, string> = {
                            [ROLE.ADMIN]: 'admin',
                            [ROLE.USER]: 'user',
                            [ROLE.CUSTOMER]: 'cust'
                          }
                          return roleMap[role] || role.toLowerCase()
                        }) || []}
                        onValueChange={(values) => {
                          // Convert lowercase values back to uppercase role constants
                          const roleMap: Record<string, string> = {
                            'admin': ROLE.ADMIN,
                            'user': ROLE.USER,
                            'cust': ROLE.CUSTOMER
                          }
                          field.onChange(values.map(value => roleMap[value] || value.toUpperCase()))
                        }}
                        placeholder='Select roles'
                        className='col-span-4'
                        items={roles
                          .filter(role => availableRoles.includes(role.value.toUpperCase() as ROLE))
                          .map(({ label, value, icon }) => ({
                            label,
                            value,
                            icon,
                          }))}
                      />
                      <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                  )
                }}
              />
              {!isCustomerOnly && (
                <FormField
                  control={form.control}
                  name='workHours'
                  render={({ field }) => (
                    <FormItem className='space-y-2'>
                      <FormLabel className='text-sm font-medium'>Work Hours</FormLabel>
                      <FormControl>
                        <WorkHoursSelector
                          value={field.value || {}}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button 
            type='submit' 
            form='user-form' 
            disabled={isLoading}
            onClick={() => console.log("🔘 Save button clicked")}
          >
            {isLoading || updateLoading ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}