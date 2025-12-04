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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/dashboard/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/dashboard/ui/select'
import { useUpdateAutomationMutation } from '@/redux/apiSlices/Automation/automationSlice'
import type { AutomationConfigOutputDto, UpdateAutomationDto } from '@/types/api/data-contracts'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const automationSchema = z.object({
  automationKey: z.string().optional(),
  name: z.string().optional(),
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
  ]).optional(),
  toolType: z.enum(['email', 'sms', 'slack']).optional(),
  schedulingType: z.enum(['fixed-delay', 'session-based']).optional(),
  isEnabled: z.boolean().optional(),
  parameters: z.record(z.string(), z.unknown()).optional(),
})

type AutomationForm = z.infer<typeof automationSchema>

// Options for dropdowns
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
]

type AutomationsEditDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: AutomationConfigOutputDto | null
}

// Variable mapping for preview
const variableMapping: Record<string, string> = {
  '{{orderId}}': '12345',
  '{{customerName}}': 'John Doe',
  '{{customerEmail}}': 'john.doe@example.com',
  '{{total}}': '125.00',
  '{{currency}}': 'CAD',
  '{{itemCount}}': '3',
  '{{meetingLink}}': 'https://meet.google.com/abc-defg-hij',
  '{{googleMeetLink}}': 'https://meet.google.com/abc-defg-hij',
  '{{appointmentTime}}': '2:00 PM',
}

// Function to replace placeholders with example values
function replaceVariables(text: string): string {
  let result = text
  Object.keys(variableMapping).forEach(variable => {
    const mappingValue = variableMapping[variable]
    if (mappingValue) {
      const regex = new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g')
      result = result.replace(regex, mappingValue)
    }
  })
  return result
}

// Function to convert HTML to plain text
function htmlToPlainText(html: string): string {
  // Create a temporary DOM element to parse HTML
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  
  // Replace block-level elements with newlines before getting text
  const blockElements = tempDiv.querySelectorAll('p, div, br, li, h1, h2, h3, h4, h5, h6')
  blockElements.forEach((el) => {
    if (el.tagName === 'BR') {
      el.replaceWith(document.createTextNode('\n'))
    } else {
      el.insertAdjacentText('beforebegin', '\n')
    }
  })
  
  // Get text content (strips all HTML tags)
  let text = tempDiv.textContent || tempDiv.innerText || ''
  
  // Clean up multiple spaces but preserve line breaks
  text = text.replace(/[ \t]+/g, ' ') // Replace multiple spaces/tabs with single space
  text = text.replace(/\n\s*\n\s*/g, '\n\n') // Replace multiple newlines with double newline
  text = text.trim()
  
  return text
}

export function AutomationsEditDialog({
  open,
  onOpenChange,
  currentRow,
}: AutomationsEditDialogProps) {
  const [updateAutomation, { isLoading }] = useUpdateAutomationMutation()
  const [dynamicFields, setDynamicFields] = useState<Record<string, string>>({})

  const form = useForm({
    resolver: zodResolver(automationSchema),
    defaultValues: {
      automationKey: '',
      name: '',
      description: '',
      triggerEvent: undefined,
      toolType: undefined,
      schedulingType: 'fixed-delay',
      isEnabled: false,
      parameters: undefined,
    },
  })

  useEffect(() => {
    if (open && currentRow) {
      form.reset({
        automationKey: currentRow.key,
        name: currentRow.name,
        description: currentRow.description || '',
        triggerEvent: currentRow.triggerEvent,
        toolType: currentRow.toolType,
        schedulingType: (currentRow as any).schedulingType || 'fixed-delay',
        isEnabled: currentRow.isEnabled,
      })
      
      // Initialize dynamic fields from parameters
      const params = (currentRow.parameters as Record<string, any>) || {}
      const fields: Record<string, string> = {}
      const booleanFields = ['includeOrderDetails', 'includeAppointments', 'includeItems', 'includeCustomerInfo', 'includeMeetingLink', 'includeUtmParameters']
      
      Object.keys(params).forEach(key => {
        const value = params[key]
        if (value !== null && value !== undefined) {
          // Handle boolean fields - convert to string for UI state
          if (booleanFields.includes(key) && typeof value === 'boolean') {
            fields[key] = String(value)
          } else {
            fields[key] = String(value)
          }
        }
      })
      
      setDynamicFields(fields)
    }
  }, [open, currentRow, form])

  const updateDynamicField = (key: string, value: string) => {
    setDynamicFields(prev => ({ ...prev, [key]: value }))
  }

  const onSubmit = async (data: AutomationForm) => {
    if (!currentRow) return

    try {
      // Build unified update data with all fields
      const updateData: UpdateAutomationDto = {
        name: data.name,
        description: data.description,
        triggerEvent: data.triggerEvent,
        toolType: data.toolType,
        schedulingType: data.schedulingType,
        isEnabled: data.isEnabled,
      }

      // Build parameters object from dynamic fields
      const parameters: Record<string, any> = {}
      const booleanFields = ['includeOrderDetails', 'includeAppointments', 'includeItems', 'includeCustomerInfo', 'includeMeetingLink', 'includeUtmParameters']
      
      Object.keys(dynamicFields).forEach(key => {
        const value = dynamicFields[key]
        if (value !== undefined && value !== '') {
          // Handle boolean fields
          if (booleanFields.includes(key)) {
            parameters[key] = value === 'true'
          }
          // Try to parse as number if possible
          else if (!isNaN(Number(value)) && value !== '') {
            parameters[key] = Number(value)
          } else {
            parameters[key] = value
          }
        }
      })
      
      if (Object.keys(parameters).length > 0) {
        updateData.parameters = parameters
      }

      await updateAutomation({
        key: currentRow.key,
        data: updateData,
      }).unwrap()

      toast.success('Automation updated successfully')
      onOpenChange(false)
    } catch (error: any) {
      console.error('Failed to update automation:', error)
      // Error toast is handled centrally in api.ts
    }
  }

  if (!currentRow) return null

  const toolType = currentRow.toolType.toLowerCase()
  const isSlack = toolType === 'slack'
  const isEmail = toolType === 'email'
  const isSms = toolType === 'sms'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Automation</DialogTitle>
          <DialogDescription>
            Update automation configuration for your organization
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <FormField
                control={form.control}
                name="automationKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Automation Key</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                    <FormDescription>
                      Unique identifier (cannot be changed)
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormDescription>
                      Optional detailed description of the automation's purpose
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Configuration Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Configuration</h3>
              
              <FormField
                control={form.control}
                name="triggerEvent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trigger Event</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                    <FormLabel>Communication Tool</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                name="schedulingType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scheduling Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select scheduling type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="fixed-delay">Fixed Delay</SelectItem>
                        <SelectItem value="session-based">Session Based</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Fixed Delay: Execute X minutes after trigger. Session Based: Execute X minutes before each session.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Status</h3>
              
              <FormField
                control={form.control}
                name="isEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Automation</FormLabel>
                      <FormDescription>
                        Turn this automation on or off
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
            </div>

            {/* Parameters Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Configuration Parameters</h3>

              {/* Slack-specific fields */}
              {isSlack && (
              <>
                <FormField
                  control={form.control}
                  name="parameters"
                  render={() => (
                    <FormItem>
                      <FormLabel>Custom Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="🎉 New order #{{orderId}} from {{customerName}} - ${{total}}"
                          value={dynamicFields.customMessage || ''}
                          onChange={(e) => updateDynamicField('customMessage', e.target.value)}
                          rows={6}
                        />
                      </FormControl>
                      <FormDescription>
                        Message text with variables. Use &#123;&#123;orderId&#125;&#125;, &#123;&#123;customerName&#125;&#125;, etc.
                        <br />
                        <span className="text-muted-foreground text-xs">Note: Slack webhook is channel-specific - all messages post to the webhook's configured channel</span>
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parameters"
                  render={() => (
                    <FormItem>
                      <FormLabel>Custom Block Message</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="New Order #{{orderId}}"
                          value={dynamicFields.customBlockMessage || ''}
                          onChange={(e) => updateDynamicField('customBlockMessage', e.target.value)}
                        />
                      </FormControl>
                      <FormDescription>
                        Short message for Slack blocks. Use variables like &#123;&#123;orderId&#125;&#125;, &#123;&#123;customerName&#125;&#125;, etc.
                      </FormDescription>
                    </FormItem>
                  )}
                />

                {/* Include/Exclude Options */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-sm font-medium">Message Content Options</h4>
                  <p className="text-xs text-muted-foreground">
                    Control what additional information is included in the Slack message
                  </p>
                  
                  <FormField
                    control={form.control}
                    name="parameters"
                    render={() => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Include Order Details</FormLabel>
                          <FormDescription className="text-xs">
                            Include order summary, total, and status
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={dynamicFields.includeOrderDetails === undefined || dynamicFields.includeOrderDetails === 'true'}
                            onCheckedChange={(checked) => updateDynamicField('includeOrderDetails', String(checked))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="parameters"
                    render={() => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Include Appointments</FormLabel>
                          <FormDescription className="text-xs">
                            Include appointment dates and times
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={dynamicFields.includeAppointments === undefined || dynamicFields.includeAppointments === 'true'}
                            onCheckedChange={(checked) => updateDynamicField('includeAppointments', String(checked))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="parameters"
                    render={() => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Include Items</FormLabel>
                          <FormDescription className="text-xs">
                            Include order items and quantities
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={dynamicFields.includeItems === undefined || dynamicFields.includeItems === 'true'}
                            onCheckedChange={(checked) => updateDynamicField('includeItems', String(checked))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="parameters"
                    render={() => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Include Customer Info</FormLabel>
                          <FormDescription className="text-xs">
                            Include customer name, email, and contact details
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={dynamicFields.includeCustomerInfo === undefined || dynamicFields.includeCustomerInfo === 'true'}
                            onCheckedChange={(checked) => updateDynamicField('includeCustomerInfo', String(checked))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="parameters"
                    render={() => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Include Meeting Link</FormLabel>
                          <FormDescription className="text-xs">
                            Include Google Meet or other meeting links
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={dynamicFields.includeMeetingLink === undefined || dynamicFields.includeMeetingLink === 'true'}
                            onCheckedChange={(checked) => updateDynamicField('includeMeetingLink', String(checked))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

              {/* Email-specific fields */}
              {isEmail && (
              <>
                <FormField
                  control={form.control}
                  name="parameters"
                  render={() => (
                    <FormItem>
                      <FormLabel>Email Subject</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="New Order Notification"
                          value={dynamicFields.subject || ''}
                          onChange={(e) => updateDynamicField('subject', e.target.value)}
                        />
                      </FormControl>
                      <FormDescription>
                        Email subject with variables. Use &#123;&#123;orderNumber&#125;&#125;, &#123;&#123;total&#125;&#125;, etc.
                      </FormDescription>
                      {dynamicFields.subject && (
                        <Card className="mt-2">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-xs">Preview with Example Values</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-xs bg-muted p-2 rounded overflow-auto max-h-16 whitespace-pre-wrap">
                              {replaceVariables(dynamicFields.subject)}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parameters"
                  render={() => (
                    <FormItem>
                      <FormLabel>Email Body</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Your order #{{orderNumber}} has been confirmed. Total: ${{total}}"
                          value={dynamicFields.message || ''}
                          onChange={(e) => updateDynamicField('message', e.target.value)}
                          rows={6}
                        />
                      </FormControl>
                      <FormDescription>
                        Email body content (HTML). Use variables like &#123;&#123;orderNumber&#125;&#125;, &#123;&#123;total&#125;&#125;, etc.
                      </FormDescription>
                      {dynamicFields.message && (
                        <Card className="mt-2">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-xs">Preview with Example Values</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-xs bg-muted p-2 rounded overflow-auto max-h-32 whitespace-pre-wrap">
                              {htmlToPlainText(replaceVariables(dynamicFields.message))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </FormItem>
                  )}
                />
              </>
            )}

              {/* SMS-specific fields */}
              {isSms && (
              <>
                <FormField
                  control={form.control}
                  name="parameters"
                  render={() => (
                    <FormItem>
                      <FormLabel>Message Text</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Reminder: Your appointment is in 30 minutes. Join: {{meetingLink}}"
                          value={dynamicFields.message || ''}
                          onChange={(e) => updateDynamicField('message', e.target.value)}
                          rows={6}
                        />
                      </FormControl>
                      <FormDescription>
                        SMS message text. Use variables like &#123;&#123;customerName&#125;&#125;, &#123;&#123;meetingLink&#125;&#125; (or &#123;&#123;googleMeetLink&#125;&#125;). Do NOT include dateTime. 
                        <strong className="text-orange-600 dark:text-orange-400">Note: Backend must populate meetingLink from order.googleMeetLink or appointment.meetingLink</strong>
                      </FormDescription>
                    </FormItem>
                  )}
                />
                <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                  <CardContent className="pt-4 space-y-2">
                    <p className="text-xs text-orange-800 dark:text-orange-200">
                      <strong>Important Backend Requirements:</strong>
                    </p>
                    <ul className="text-xs text-orange-800 dark:text-orange-200 list-disc list-inside space-y-1 ml-2">
                      <li>Backend must populate &#123;&#123;meetingLink&#125;&#125; from <code className="bg-orange-100 dark:bg-orange-900 px-1 rounded">order.googleMeetLink</code> or <code className="bg-orange-100 dark:bg-orange-900 px-1 rounded">appointment.meetingLink</code></li>
                      <li>Backend must extract the meeting link when sending SMS reminders (30 min before appointment)</li>
                      <li>Do NOT include dateTime variables in the message template</li>
                      <li>If meeting link is not available, the variable will remain as text (not replaced)</li>
                    </ul>
                  </CardContent>
                </Card>
              </>
            )}

              {/* Generic fields for other tool types or additional parameters */}
              {!isSlack && !isEmail && !isSms && (
              <div className="space-y-4">
                {Object.keys(dynamicFields).map((key) => (
                  <FormField
                    key={key}
                    control={form.control}
                    name="parameters"
                    render={() => (
                      <FormItem>
                        <FormLabel className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</FormLabel>
                        <FormControl>
                          <Input
                            value={dynamicFields[key] || ''}
                            onChange={(e) => updateDynamicField(key, e.target.value)}
                            placeholder={`Enter ${key}`}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            )}

              {/* UTM Parameters - Only for Slack */}
              {isSlack && (
                <FormField
                  control={form.control}
                  name="parameters"
                  render={() => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm">Include UTM Parameters</FormLabel>
                        <FormDescription className="text-xs">
                          Include UTM tracking parameters (utm_source, utm_medium, utm_campaign, etc.) in automation links
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={dynamicFields.includeUtmParameters === 'true'}
                          onCheckedChange={(checked) => updateDynamicField('includeUtmParameters', String(checked))}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              {/* Additional delay parameter for all types */}
              <FormField
                control={form.control}
                name="parameters"
                render={() => (
                  <FormItem>
                    <FormLabel>Delay (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        value={dynamicFields.delayMinutes || '0'}
                        onChange={(e) => updateDynamicField('delayMinutes', e.target.value)}
                      />
                    </FormControl>
                    <FormDescription>
                      Delay execution by specified minutes (0 = immediate)
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

