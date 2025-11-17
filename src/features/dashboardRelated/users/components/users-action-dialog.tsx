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
import { useUpdateUserMutation } from '@/redux/apiSlices/User/userSlice'
import { type UserOutput, type UpdateUserInput, type RegisterInput } from '@/types/api/data-contracts'
import { WorkHoursSelector } from '@/components/dashboard/work-hours-selector'
import { useEffect, useState } from 'react'
import { useGetProductsQuery } from '@/redux/apiSlices/Product/productSlice'
import type { ProductOutput } from '@/types/api/data-contracts'



const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  phone: z.string().min(1, 'Phone number is required.'),
  email: z.email({
    error: (iss) => (iss.input === '' ? 'Email is required.' : undefined),
  }),
  password: z.string().optional(),
  roles: z.array(z.enum([ROLE.USER, ROLE.ADMIN, ROLE.CUSTOMER, ROLE.SUPER_ADMIN]))
    .min(1, 'At least one role is required.'),
  workHours: z.record(z.string(), z.array(z.string())).optional(),
  serviceIds: z.array(z.number()).optional(),
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
  const { setOpen, pageType } = useUsers()
  const [registerUser, { isLoading }] = useRegisterUserMutation()
  const [updateUser,{isLoading:updateLoading}]=useUpdateUserMutation()
  // Get current user and organizationId from auth state
  const { organizationId } = useSelector((state: RootState) => state.auth)
  const currentUser = useSelector((state: RootState) => state.auth.user)
  
  // Convert AuthUser to UserOutput format for RBAC functions
  const currentUserForRBAC = convertAuthUserToIUser(currentUser)
  
  // Get available roles based on current user's permissions
  const availableRoles = getAvailableRolesForNewUser(currentUserForRBAC)
  
  // Filter roles based on page type
  const filteredAvailableRoles = pageType === 'employees' 
    ? availableRoles.filter(role => role === ROLE.USER || role === ROLE.ADMIN)
    : availableRoles
  
  // Check if editing a customer (customer-only user)
  const isEditingCustomer = isEdit && currentRow && currentRow.roles.length === 1 && currentRow.roles.includes(ROLE.CUSTOMER)
  
  // Check if adding a customer (on customers page and not editing)
  const isAddingCustomer = !isEdit && pageType === 'customers'
  
  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      roles: [],
      workHours: {},
      serviceIds: [],
      isEdit: false,
    },
  })

  // Fetch products/packages for serviceIds selection
  const { data: productsData } = useGetProductsQuery()
  const packages = productsData?.data || []

  // Reset form when dialog opens/closes or currentRow changes
  useEffect(() => {
    if (open) {
      if (isEdit && currentRow) {
        console.log('🔄 Resetting form with currentRow:', currentRow)
        console.log('📞 Phone from currentRow:', currentRow.phone)
        const phoneValue = currentRow.phone || ''
        const phoneWithoutPlus = phoneValue ? phoneValue.replace(/^\+/, '') : ''
        
        // Filter out COMPANY_ADMIN role as it's not in the User schema
        const validRoles = currentRow.roles.filter(role => 
          role === 'USER' || role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'CUST'
        ) as ('USER' | 'ADMIN' | 'SUPER_ADMIN' | 'CUST')[]
        
        const formValues = {
          name: currentRow.name,
          phone: phoneValue,
          email: currentRow.email,
          password: '', // Don't pre-fill password for edit
          roles: validRoles,
          workHours: currentRow.workHours || {},
          serviceIds: currentRow.serviceIds || [],
          isEdit: true,
        }
        console.log('📝 Form values being set:', formValues)
        form.reset(formValues)
        
        // Also set the phone input state directly
        setPhoneInputValue(phoneWithoutPlus)
        console.log('📱 Setting phoneInputValue to:', phoneWithoutPlus)
      } else {
        // Auto-set role to CUST when adding customer
        const initialRoles = isAddingCustomer ? [ROLE.CUSTOMER] : []
        form.reset({
          name: '',
          email: '',
          phone: '',
          password: '',
          roles: initialRoles,
          workHours: {},
          serviceIds: [],
          isEdit: false,
        })
        setPhoneInputValue('')
      }
    }
  }, [open, isEdit, currentRow, form])

  // Watch roles to determine if user is customer-only
  const watchedRoles = form.watch('roles')
  const isCustomerOnly = (watchedRoles.length === 1 && watchedRoles.includes(ROLE.CUSTOMER)) || isAddingCustomer
  
  // Use separate state for phone input (similar to Appointment page pattern)
  const [phoneInputValue, setPhoneInputValue] = useState('')
  
  // Sync phoneInputValue with form value when form resets or phone changes
  useEffect(() => {
    const phoneValue = form.getValues('phone') || ''
    const phoneWithoutPlus = phoneValue ? phoneValue.replace(/^\+/, '') : ''
    if (phoneWithoutPlus !== phoneInputValue) {
      setPhoneInputValue(phoneWithoutPlus)
    }
  }, [form, phoneInputValue, open, currentRow])

  const onSubmit = async (values: UserForm) => {
    console.log("🚀 onSubmit called with values:", values);
    try {
      if (!isEdit) {
        // Create new user
        const isCustomerOnly = isAddingCustomer || (values.roles.length === 1 && values.roles.includes(ROLE.CUSTOMER));
        
        if (!isCustomerOnly && !values.password) {
          toast.error("Password is required for non-customer users.")
          return
        }
        
        // Auto-generate username from email (use part before @)
        const emailPart = values.email ? values.email.split('@')[0] : ''
        const autoUsername = emailPart ? emailPart.toLowerCase().replace(/[^a-z0-9_]/g, '_') : 'user'
        
        // Auto-set role to CUST when adding from customers page
        const finalRoles = isAddingCustomer ? [ROLE.CUSTOMER] : values.roles
        
        if (!organizationId) {
          toast.error("Organization ID is required. Please ensure you're in an organization context.")
          return
        }

        const userData: RegisterInput = {
          name: values.name,
          email: values.email,
          phone: values.phone,
          username: autoUsername,
          password: values.password,
          roles: finalRoles,
          organizationId: organizationId,
          workHours: (isCustomerOnly || isAddingCustomer) ? undefined : values.workHours,
          serviceIds: (isCustomerOnly || isAddingCustomer) ? undefined : (values.serviceIds || []),
        }
        
        await registerUser(userData).unwrap()
        
        toast.success("User created successfully!")
      } else {
        console.log("📝 Edit user - values:", values);
        console.log("📝 Edit user - currentRow:", currentRow);
        const isCustomerOnly = isEditingCustomer || (values.roles.length === 1 && values.roles.includes(ROLE.CUSTOMER));
        
        const userData: UpdateUserInput & { serviceIds?: number[] } = {
          name: values.name,
          email: values.email,
          phone: values.phone,
          username: currentRow.username || '', // Use existing username when editing
          roles: !isEditingCustomer && values.roles ? values.roles : currentRow.roles || [],
        }
        if (!isCustomerOnly && values.workHours) {
          userData.workHours = values.workHours
        }
        // Add serviceIds for employees (non-customers)
        if (!isCustomerOnly && values.serviceIds && values.serviceIds.length > 0) {
          userData.serviceIds = values.serviceIds
        } else if (!isCustomerOnly && (!values.serviceIds || values.serviceIds.length === 0)) {
          userData.serviceIds = []
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
          <DialogTitle>
            {isEdit 
              ? 'Edit User' 
              : (pageType === 'customers' ? 'Add New Customer' : 'Add New User')
            }
          </DialogTitle>
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
                          key={`phone-${currentRow?.id || 'new'}-${open}`}
                          country={"pk"} // default to Pakistan
                          value={phoneInputValue}
                          onChange={(val) => {
                            setPhoneInputValue(val)
                            field.onChange("+" + val)
                          }}
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
              {!isEditingCustomer && !isAddingCustomer && (
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
                            .filter(role => filteredAvailableRoles.includes(role.value.toUpperCase() as ROLE))
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
              )}
              {!isCustomerOnly && (
                <>
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
                  <FormField
                    control={form.control}
                    name='serviceIds'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-2 text-end'>Service Packages</FormLabel>
                        <FormControl>
                          <MultiSelectDropdown
                            value={field.value?.map(id => id.toString()) || []}
                            onValueChange={(values) => {
                              field.onChange(values.map(v => parseInt(v, 10)).filter(id => !isNaN(id)))
                            }}
                            placeholder='Select packages'
                            className='col-span-4'
                            items={packages.map((pkg: ProductOutput) => ({
                              label: pkg.name,
                              value: pkg.id.toString(),
                            }))}
                          />
                        </FormControl>
                        <FormMessage className='col-span-4 col-start-3' />
                      </FormItem>
                    )}
                  />
                </>
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