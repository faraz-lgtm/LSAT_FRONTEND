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
} from '@/components/dashboard/ui/form'
import { Input } from '@/components/dashboard/ui/input'
import { Textarea } from '@/components/dashboard/ui/textarea'
import { Switch } from '@/components/dashboard/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/dashboard/ui/card'
import { useUpdateAutomationMutation } from '@/redux/apiSlices/Automation/automationSlice'
import type { AutomationConfigOutputDto } from '@/types/api/data-contracts'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const automationSchema = z.object({
  isEnabled: z.boolean(),
  parameters: z.record(z.string(), z.unknown()).optional(),
})

type AutomationForm = z.infer<typeof automationSchema>

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
      result = result.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), mappingValue)
    }
  })
  return result
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
      isEnabled: false,
      parameters: undefined,
    },
  })

  useEffect(() => {
    if (open && currentRow) {
      form.reset({
        isEnabled: currentRow.isEnabled,
      })
      
      // Initialize dynamic fields from parameters
      const params = (currentRow.parameters as Record<string, any>) || {}
      const fields: Record<string, string> = {}
      
      Object.keys(params).forEach(key => {
        const value = params[key]
        if (value !== null && value !== undefined) {
          fields[key] = String(value)
        }
      })
      
      setDynamicFields(fields)
    }
  }, [open, currentRow, form])

  const updateDynamicField = (key: string, value: string) => {
    setDynamicFields(prev => ({ ...prev, [key]: value }))
  }

  const onSubmit = async (data: AutomationForm) => {
    console.log('onSubmit called', { data, dynamicFields, currentRow })
    if (!currentRow) return

    try {
      const parameters: Record<string, any> = {}
      
      // Build parameters object from dynamic fields
      Object.keys(dynamicFields).forEach(key => {
        const value = dynamicFields[key]
        if (value !== undefined && value !== '') {
          // Try to parse as number if possible
          if (!isNaN(Number(value)) && value !== '') {
            parameters[key] = Number(value)
          } else {
            parameters[key] = value
          }
        }
      })

      console.log('Updating automation with:', {
        key: currentRow.key,
        isEnabled: data.isEnabled,
        parameters,
      })

      await updateAutomation({
        key: currentRow.key,
        data: {
          isEnabled: data.isEnabled,
          parameters,
        },
      }).unwrap()

      console.log('Automation updated successfully')
      toast.success('Automation updated successfully')
      onOpenChange(false)
    } catch (error: any) {
      console.error('Failed to update automation:', error)
      toast.error(error?.data?.message || 'Failed to update automation')
    }
  }

  if (!currentRow) return null

  const toolType = currentRow.toolType.toLowerCase()
  const isSlack = toolType === 'slack'
  const isEmail = toolType === 'email'
  const isSms = toolType === 'sms' || toolType === 'whatsapp'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Automation</DialogTitle>
          <DialogDescription>
            Configure the {currentRow.name} automation settings
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

            {/* Slack-specific fields */}
            {isSlack && (
              <>
                <FormField
                  control={form.control}
                  name="parameters"
                  render={() => (
                    <FormItem>
                      <FormLabel>Slack Channel</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="#general"
                          value={dynamicFields.channel || ''}
                          onChange={(e) => updateDynamicField('channel', e.target.value)}
                        />
                      </FormControl>
                      <FormDescription>
                        The Slack channel to send notifications to
                      </FormDescription>
                    </FormItem>
                  )}
                />

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
                      </FormDescription>
                      {dynamicFields.customMessage && (
                        <Card className="mt-2">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-xs">Preview with Example Values</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-xs bg-muted p-2 rounded overflow-auto max-h-32 whitespace-pre-wrap">
                              {replaceVariables(dynamicFields.customMessage)}
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
                      {dynamicFields.customBlockMessage && (
                        <Card className="mt-2">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-xs">Preview with Example Values</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-xs bg-muted p-2 rounded overflow-auto max-h-24 whitespace-pre-wrap">
                              {replaceVariables(dynamicFields.customBlockMessage)}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </FormItem>
                  )}
                />
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
                        Email body content. Use variables like &#123;&#123;orderNumber&#125;&#125;, &#123;&#123;total&#125;&#125;, etc.
                      </FormDescription>
                      {dynamicFields.message && (
                        <Card className="mt-2">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-xs">Preview with Example Values</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-xs bg-muted p-2 rounded overflow-auto max-h-32 whitespace-pre-wrap">
                              {replaceVariables(dynamicFields.message)}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* SMS/WhatsApp-specific fields */}
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
                        SMS/WhatsApp message text. Use variables like &#123;&#123;customerName&#125;&#125;, &#123;&#123;meetingLink&#125;&#125; (or &#123;&#123;googleMeetLink&#125;&#125;). Do NOT include dateTime. 
                        <strong className="text-orange-600 dark:text-orange-400">Note: Backend must populate meetingLink from order.googleMeetLink or appointment.meetingLink</strong>
                      </FormDescription>
                      {dynamicFields.message && (
                        <Card className="mt-2">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-xs">Preview with Example Values</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-xs bg-muted p-2 rounded overflow-auto max-h-32 whitespace-pre-wrap">
                              {replaceVariables(dynamicFields.message)}
                            </div>
                          </CardContent>
                        </Card>
                      )}
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

