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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/dashboard/ui/form'
import { Input } from '@/components/dashboard/ui/input'
import { Textarea } from '@/components/dashboard/ui/textarea'
import { Switch } from '@/components/dashboard/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/dashboard/ui/select'
import { useCreateAutomationMutation } from '@/redux/apiSlices/Automation/automationSlice'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Resolver } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import type { CreateAutomationDto } from '@/types/api/data-contracts'

const createAutomationSchema = z.object({
  automationKey: z.string()
    .min(1, 'Automation key is required')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens allowed')
    .max(100, 'Automation key must be 100 characters or less'),
  name: z.string()
    .min(1, 'Name is required')
    .max(200, 'Name must be 200 characters or less'),
  description: z.string().optional(),
  triggerEvent: z.enum([
    'order.created',
    'order.paid',
    'order.canceled',
    'order.modified',
    'order.completed',
    'user.registered',
    'payment.refunded',
    'task.created',
    'task.completed',
    'order.appointment.no_show',
    'order.appointment.showed'
  ]),
  toolType: z.enum(['email', 'sms', 'slack', 'whatsapp']),
  defaultParameters: z.string().optional(), // JSON string that we'll parse
  archived: z.boolean().default(false),
})

type CreateAutomationForm = z.infer<typeof createAutomationSchema>

type AutomationsCreateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const triggerEventOptions = [
  { value: 'order.created', label: 'Order Created' },
  { value: 'order.paid', label: 'Order Paid' },
  { value: 'order.canceled', label: 'Order Canceled' },
  { value: 'order.modified', label: 'Order Modified' },
  { value: 'order.completed', label: 'Order Completed' },
  { value: 'user.registered', label: 'User Registered' },
  { value: 'payment.refunded', label: 'Payment Refunded' },
  { value: 'task.created', label: 'Task Created' },
  { value: 'task.completed', label: 'Task Completed' },
  { value: 'order.appointment.no_show', label: 'Appointment No Show' },
  { value: 'order.appointment.showed', label: 'Appointment Showed' },
]

const toolTypeOptions = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'slack', label: 'Slack' },
  { value: 'whatsapp', label: 'WhatsApp' },
]

export function AutomationsCreateDialog({
  open,
  onOpenChange,
}: AutomationsCreateDialogProps) {
  const [createAutomation, { isLoading }] = useCreateAutomationMutation()

  const form = useForm({
    resolver: zodResolver(createAutomationSchema) as any,
    defaultValues: {
      automationKey: '',
      name: '',
      description: '',
      triggerEvent: 'order.created',
      toolType: 'email',
      defaultParameters: '',
      archived: false,
    },
  })

  const onSubmit = async (data: CreateAutomationForm) => {
    try {
      let parsedDefaultParameters: object | undefined = undefined
      
      // Parse defaultParameters JSON if provided
      if (data.defaultParameters && data.defaultParameters.trim()) {
        try {
          parsedDefaultParameters = JSON.parse(data.defaultParameters)
        } catch (error) {
          toast.error('Invalid JSON format in default parameters')
          return
        }
      }

      const createData: CreateAutomationDto = {
        automationKey: data.automationKey,
        name: data.name,
        description: data.description || undefined,
        triggerEvent: data.triggerEvent,
        toolType: data.toolType,
        defaultParameters: parsedDefaultParameters,
        archived: data.archived,
      }

      await createAutomation(createData).unwrap()
      toast.success('Automation created successfully')
      onOpenChange(false)
      form.reset()
    } catch (error: any) {
      console.error('Failed to create automation:', error)
      toast.error(error?.data?.message || 'Failed to create automation')
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Automation</DialogTitle>
          <DialogDescription>
            Create a new global automation that organizations can enable and configure.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="automationKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Automation Key *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. custom-order-email"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Unique identifier (lowercase, numbers, hyphens only)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Custom Order Confirmation Email"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Human-readable name for the automation
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what this automation does..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional detailed description of the automation's purpose
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="triggerEvent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trigger Event *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an event" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {triggerEventOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Event that will trigger this automation
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="toolType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Communication Tool *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a tool" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {toolTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Communication method for this automation
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="defaultParameters"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Parameters (JSON)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='{"delayMinutes": 0, "template": "order-confirmation"}'
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional JSON object with default configuration parameters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="archived"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Archived</FormLabel>
                    <FormDescription>
                      Whether this automation is archived (hidden from organizations)
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Automation'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}