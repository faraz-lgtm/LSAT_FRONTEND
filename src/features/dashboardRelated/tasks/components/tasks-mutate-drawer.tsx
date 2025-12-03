import { SelectDropdown } from '@/components/dashboard/select-dropdown'
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
import { RadioGroup, RadioGroupItem } from '@/components/dashboard/ui/radio-group'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/dashboard/ui/sheet'
import { Textarea } from '@/components/dashboard/ui/textarea'
import { toast } from 'sonner'
import {
  useCreateTaskMutation,
  useUpdateTaskMutation
} from '@/redux/apiSlices/Task/taskSlice'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Resolver } from 'react-hook-form'
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import { z } from 'zod'
import { type TaskOutputDto } from '@/types/api/data-contracts'
import type { RootState } from '@/redux/rootReducer'
import { useSelector } from 'react-redux'

type TaskMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: TaskOutputDto
}

export type TaskForm = {
  title: string
  description?: string
  startDateTime: string
  endDateTime: string
  tutorId: number
  label: 'meeting' | 'personal' | 'preparation' | 'grading'
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
}
const formSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().optional(),
  startDateTime: z.string().min(1, 'Start date is required.'),
  endDateTime: z.string().min(1, 'End date is required.'),
  tutorId: z.coerce.number().min(1, 'Tutor ID is required.'),
  label: z.enum(['meeting', 'personal', 'preparation', 'grading']),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
}) satisfies z.ZodType<TaskForm>

export function TasksMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: TaskMutateDrawerProps) {
  const isUpdate = !!currentRow
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation()
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation()
  const { user } = useSelector((state: RootState) => state.auth)

  // Ensure tutorId is always a number (user.id comes as string from JWT)
  const currentUserId = user?.id ? Number(user.id) : 0

  const form = useForm<TaskForm>({
    resolver: zodResolver(formSchema) as unknown as Resolver<TaskForm>,
    defaultValues: currentRow ? {
      title: currentRow.title,
      description: currentRow.description || '',
      startDateTime: currentRow.startDateTime ? format(new Date(currentRow.startDateTime), "yyyy-MM-dd'T'HH:mm") : '',
      endDateTime: currentRow.endDateTime ? format(new Date(currentRow.endDateTime), "yyyy-MM-dd'T'HH:mm") : '',
      tutorId: currentRow.tutorId,
      label: currentRow.label,
      priority: currentRow.priority,
      status: currentRow.status,
    } : {
      title: '',
      description: '',
      startDateTime: '',
      endDateTime: '',
      tutorId: currentUserId,
      label: 'meeting',
      priority: 'medium',
      status: 'pending',
    },
  })

  // Update tutorId when drawer opens and it's not an update
  useEffect(() => {
    if (open && !isUpdate && currentUserId > 0) {
      form.setValue('tutorId', currentUserId)
    }
  }, [open, isUpdate, currentUserId, form])

  const onSubmit = async (data: TaskForm) => {
    try {
      const taskData = {
        ...data,
        tutorId: Number(data.tutorId), // Ensure tutorId is a number
        startDateTime: new Date(data.startDateTime).toISOString(),
        endDateTime: new Date(data.endDateTime).toISOString(),
      }

      console.log('Submitting task data:', taskData) // Debug log

      if (isUpdate && currentRow) {
        await updateTask({ id: currentRow.id, data: taskData }).unwrap()
        toast.success("Task updated successfully")
      } else {
        await createTask(taskData).unwrap()
        toast.success("Task created successfully")
      }
      
      onOpenChange(false)
      form.reset()
    } catch (error: unknown) {
      console.error('Task creation error:', error);
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || "Failed to save task"
      toast.error(errorMessage)
    }
  }

  // Check if required fields are filled
  const isFormValid = form.formState.isValid && 
    form.getValues('title')?.trim() !== '' &&
    form.getValues('startDateTime')?.trim() !== '' &&
    form.getValues('endDateTime')?.trim() !== '' &&
    form.getValues('tutorId') > 0;

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        form.reset()
      }}
    >
      <SheetContent className='flex flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>{isUpdate ? 'Update' : 'Create'} Task</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Update the task by providing necessary info.'
              : 'Add a new task by providing necessary info.'}
            Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='tasks-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Enter a title' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder='Enter a description' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='startDateTime'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date & Time</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="datetime-local"
                      placeholder='Select start date and time' 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='endDateTime'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date & Time</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="datetime-local"
                      placeholder='Select end date and time' 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='Select dropdown'
                    items={[
                      { label: 'Pending', value: 'pending' },
                      { label: 'In Progress', value: 'in_progress' },
                      { label: 'Completed', value: 'completed' },
                      { label: 'Cancelled', value: 'cancelled' },
                    ]}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='label'
              render={({ field }) => (
                <FormItem className='relative'>
                  <FormLabel>Label</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className='flex flex-col space-y-1'
                    >
                      <FormItem className='flex items-center space-x-2 space-y-0'>
                        <FormControl>
                          <RadioGroupItem value='meeting' id='label-meeting' />
                        </FormControl>
                        <FormLabel htmlFor='label-meeting' className='font-normal'>Meeting</FormLabel>
                      </FormItem>
                      <FormItem className='flex items-center space-x-2 space-y-0'>
                        <FormControl>
                          <RadioGroupItem value='personal' id='label-personal' />
                        </FormControl>
                        <FormLabel htmlFor='label-personal' className='font-normal'>Personal</FormLabel>
                      </FormItem>
                      <FormItem className='flex items-center space-x-2 space-y-0'>
                        <FormControl>
                          <RadioGroupItem value='preparation' id='label-preparation' />
                        </FormControl>
                        <FormLabel htmlFor='label-preparation' className='font-normal'>Preparation</FormLabel>
                      </FormItem>
                      <FormItem className='flex items-center space-x-2 space-y-0'>
                        <FormControl>
                          <RadioGroupItem value='grading' id='label-grading' />
                        </FormControl>
                        <FormLabel htmlFor='label-grading' className='font-normal'>Grading</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='priority'
              render={({ field }) => (
                <FormItem className='relative'>
                  <FormLabel>Priority</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className='flex flex-col space-y-1'
                    >
                      <FormItem className='flex items-center space-x-2 space-y-0'>
                        <FormControl>
                          <RadioGroupItem value='high' id='priority-high' />
                        </FormControl>
                        <FormLabel htmlFor='priority-high' className='font-normal'>High</FormLabel>
                      </FormItem>
                      <FormItem className='flex items-center space-x-2 space-y-0'>
                        <FormControl>
                          <RadioGroupItem value='medium' id='priority-medium' />
                        </FormControl>
                        <FormLabel htmlFor='priority-medium' className='font-normal'>Medium</FormLabel>
                      </FormItem>
                      <FormItem className='flex items-center space-x-2 space-y-0'>
                        <FormControl>
                          <RadioGroupItem value='low' id='priority-low' />
                        </FormControl>
                        <FormLabel htmlFor='priority-low' className='font-normal'>Low</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>Close</Button>
          </SheetClose>
          <Button 
            type="button"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isCreating || isUpdating || !isFormValid}
          >
            {isCreating || isUpdating ? 'Saving...' : 'Save changes'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
