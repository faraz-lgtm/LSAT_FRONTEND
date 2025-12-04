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
  FormDescription,
} from '@/components/dashboard/ui/form'
import { Input } from '@/components/dashboard/ui/input'
import { Switch } from '@/components/dashboard/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/dashboard/ui/tabs'
import { useOrganizations } from './organizations-provider'
import { toast } from 'sonner'
import { useCreateOrganizationMutation, useUpdateOrganizationMutation } from '@/redux/apiSlices/Organization/organizationSlice'
import { type OrganizationOutput } from '@/redux/apiSlices/Organization/organizationSlice'
import { useEffect, useState } from 'react'

// Settings schema for integrations
const settingsSchema = z.object({
  integrations: z.object({
    stripe: z.object({
      secretKey: z.string().optional(),
      webhookSecret: z.string().optional(),
      publishableKey: z.string().optional(),
      taxEnabled: z.boolean().optional(),
    }).optional(),
    googleCalendar: z.object({
      clientId: z.string().optional(),
      clientSecret: z.string().optional(),
      redirectUri: z.string().optional(),
      accessToken: z.string().optional(),
      refreshToken: z.string().optional(),
      calendarId: z.string().optional(),
      businessOwnerEmail: z.string().email().optional().or(z.literal('')),
      defaultTimezone: z.string().optional(),
    }).optional(),
    twilio: z.object({
      accountSid: z.string().optional(),
      authToken: z.string().optional(),
      phoneNumber: z.string().optional(),
      conversationsServiceSid: z.string().optional(),
      sendgridApiKey: z.string().optional(),
      webhookUrl: z.string().url().optional().or(z.literal('')),
      emailHostName: z.string().optional().or(z.literal('')),
    }).optional(),
    email: z.object({
      smtpHost: z.string().optional(),
      smtpPort: z.string().optional(),
      smtpUser: z.string().optional(),
      smtpPass: z.string().optional(),
      smtpFromEmail: z.string().email().optional().or(z.literal('')),
      smtpFromName: z.string().optional(),
      sendgridFromEmail: z.string().email().optional().or(z.literal('')),
      sendgridFromName: z.string().optional(),
    }).optional(),
  }).optional(),
}).optional()

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  slug: z.string().min(1, 'Slug is required.').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens.'),
  domain: z.string().optional(),
  domains: z.array(z.string()).optional(),
  settings: settingsSchema,
})

type OrganizationForm = z.infer<typeof formSchema>

type OrganizationsEditDialogProps = {
  currentRow?: OrganizationOutput
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrganizationsEditDialog({
  currentRow,
  open,
  onOpenChange,
}: OrganizationsEditDialogProps) {
  const isEdit = !!currentRow
  const { setOpen } = useOrganizations()
  const [createOrganization, { isLoading: isCreating }] = useCreateOrganizationMutation()
  const [updateOrganization, { isLoading: isUpdating }] = useUpdateOrganizationMutation()
  const isLoading = isCreating || isUpdating
  const [domainInput, setDomainInput] = useState('')
  const [domainsList, setDomainsList] = useState<string[]>([])

  const form = useForm<OrganizationForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      slug: '',
      domain: '',
      domains: [],
      settings: {
        integrations: {
          stripe: {},
          googleCalendar: {},
          twilio: {},
          email: {},
        },
      },
    },
  })

  // Reset form when dialog opens/closes or currentRow changes
  useEffect(() => {
    if (open) {
      if (isEdit && currentRow) {
        const domains = currentRow.domains || (currentRow.domain ? [currentRow.domain] : [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const existingSettings = (currentRow.settings as any) || {}
        const formValues = {
          name: currentRow.name,
          slug: currentRow.slug,
          domain: currentRow.domain || '',
          domains: domains,
          settings: {
            integrations: {
              stripe: existingSettings.integrations?.stripe || {},
              googleCalendar: existingSettings.integrations?.googleCalendar || {},
              twilio: existingSettings.integrations?.twilio || {},
              email: existingSettings.integrations?.email || {},
            },
          },
        }
        form.reset(formValues)
        setDomainsList(domains)
        setDomainInput('')
      } else {
        form.reset({
          name: '',
          slug: '',
          domain: '',
          domains: [],
          settings: {
            integrations: {
              stripe: {},
              googleCalendar: {},
              twilio: {},
              email: {},
            },
          },
        })
        setDomainsList([])
        setDomainInput('')
      }
    }
  }, [open, isEdit, currentRow, form])

  const addDomain = () => {
    const trimmed = domainInput.trim()
    if (trimmed && !domainsList.includes(trimmed)) {
      const newDomains = [...domainsList, trimmed]
      setDomainsList(newDomains)
      form.setValue('domains', newDomains)
      if (!form.getValues('domain')) {
        form.setValue('domain', trimmed)
      }
      setDomainInput('')
    }
  }

  const removeDomain = (domainToRemove: string) => {
    const newDomains = domainsList.filter(d => d !== domainToRemove)
    setDomainsList(newDomains)
    form.setValue('domains', newDomains)
    if (form.getValues('domain') === domainToRemove) {
      form.setValue('domain', newDomains[0] || '')
    }
  }

  const onSubmit = async (values: OrganizationForm) => {
    try {
      // Clean up empty settings objects
      const settings = values.settings?.integrations ? {
        integrations: Object.fromEntries(
          Object.entries(values.settings.integrations)
            .map(([key, value]) => {
              if (!value || Object.keys(value).length === 0) {
                return [key, undefined] as const
              }
              // Remove empty strings and undefined values
              const cleaned = Object.fromEntries(
                Object.entries(value).filter(([, v]) => v !== '' && v !== undefined)
              )
              return [key, Object.keys(cleaned).length > 0 ? cleaned : undefined] as const
            })
            .filter(([, v]) => v !== undefined)
        )
      } : undefined

      const organizationData = {
        name: values.name,
        slug: values.slug,
        domain: values.domain || undefined,
        domains: domainsList.length > 0 ? domainsList : undefined,
        settings: Object.keys(settings?.integrations || {}).length > 0 ? settings : undefined,
      }

      if (isEdit && currentRow) {
        await updateOrganization({ id: currentRow.id, data: organizationData }).unwrap()
        toast.success("Organization updated successfully!")
      } else {
        await createOrganization(organizationData).unwrap()
        toast.success("Organization created successfully!")
      }
      
      form.reset()
      setDomainsList([])
      setDomainInput('')
      setOpen(null)
      onOpenChange(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("❌ Error:", error)
      // Error toast is handled centrally in api.ts
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
      <DialogContent className='sm:max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader className='text-start'>
          <DialogTitle>
            {isEdit ? 'Edit Organization' : 'Add Organization'}
          </DialogTitle>
          <DialogDescription>
            {isEdit 
              ? 'Update organization details and integration settings. Changes will be saved immediately.'
              : 'Create a new organization with the provided details and integration settings.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="stripe">Stripe</TabsTrigger>
                <TabsTrigger value="google">Google Calendar</TabsTrigger>
                <TabsTrigger value="twilio">Twilio</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name</FormLabel>
                      <FormControl>
                        <Input placeholder='BetterLSAT' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='slug'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder='betterlsat' {...field} />
                      </FormControl>
                      <FormMessage />
                      <p className='text-xs text-muted-foreground'>
                        Used in subdomain. Only lowercase letters, numbers, and hyphens.
                      </p>
                    </FormItem>
                  )}
                />

                <div className='space-y-2'>
                  <FormLabel>Domains</FormLabel>
                  <div className='flex gap-2'>
                    <Input
                      placeholder='betterlsat.com'
                      value={domainInput}
                      onChange={(e) => setDomainInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addDomain()
                        }
                      }}
                    />
                    <Button type='button' onClick={addDomain} variant='outline'>
                      Add
                    </Button>
                  </div>
                  {domainsList.length > 0 && (
                    <div className='flex flex-wrap gap-2 mt-2'>
                      {domainsList.map((domain, idx) => (
                        <div
                          key={idx}
                          className='flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-sm'
                        >
                          <span>{domain}</span>
                          <button
                            type='button'
                            onClick={() => removeDomain(domain)}
                            className='text-destructive hover:text-destructive/80'
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className='text-xs text-muted-foreground'>
                    Domains are used for domain-based organization detection. Add multiple domains if needed.
                  </p>
                </div>
              </TabsContent>

              {/* Stripe Integration Tab */}
              <TabsContent value="stripe" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name='settings.integrations.stripe.secretKey'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secret Key</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder='sk_test_...' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='settings.integrations.stripe.webhookSecret'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Webhook Secret</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder='whsec_...' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='settings.integrations.stripe.publishableKey'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Publishable Key</FormLabel>
                      <FormControl>
                        <Input placeholder='pk_test_...' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='settings.integrations.stripe.taxEnabled'
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Tax Enabled</FormLabel>
                        <FormDescription>
                          Enable tax calculation for Stripe payments
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Google Calendar Integration Tab */}
              <TabsContent value="google" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name='settings.integrations.googleCalendar.clientId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client ID</FormLabel>
                      <FormControl>
                        <Input placeholder='...' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='settings.integrations.googleCalendar.clientSecret'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Secret</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder='...' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='settings.integrations.googleCalendar.redirectUri'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Redirect URI</FormLabel>
                      <FormControl>
                        <Input placeholder='...' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='settings.integrations.googleCalendar.accessToken'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Access Token</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder='...' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='settings.integrations.googleCalendar.refreshToken'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Refresh Token</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder='...' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='settings.integrations.googleCalendar.calendarId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calendar ID</FormLabel>
                      <FormControl>
                        <Input placeholder='...' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='settings.integrations.googleCalendar.businessOwnerEmail'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Owner Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder='owner@example.com' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='settings.integrations.googleCalendar.defaultTimezone'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Timezone</FormLabel>
                      <FormControl>
                        <Input placeholder='America/New_York' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Twilio Integration Tab */}
              <TabsContent value="twilio" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name='settings.integrations.twilio.accountSid'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account SID</FormLabel>
                      <FormControl>
                        <Input placeholder='AC...' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='settings.integrations.twilio.authToken'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Auth Token</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder='...' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='settings.integrations.twilio.phoneNumber'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder='+1...' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='settings.integrations.twilio.conversationsServiceSid'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conversations Service SID</FormLabel>
                      <FormControl>
                        <Input placeholder='IS...' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='settings.integrations.twilio.sendgridApiKey'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SendGrid API Key</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder='SG...' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='settings.integrations.twilio.webhookUrl'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Webhook URL</FormLabel>
                      <FormControl>
                        <Input type="url" placeholder='https://...' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='settings.integrations.twilio.emailHostName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Host Name</FormLabel>
                      <FormControl>
                        <Input placeholder='mail.betterlsat.com' {...field} />
                      </FormControl>
                      <FormMessage />
                      <FormDescription>
                        Full email hostname for SendGrid inbound email routing (e.g., "mail.betterlsat.com", "chat.betterlsat.com")
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Email Integration Tab */}
              <TabsContent value="email" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name='settings.integrations.email.smtpHost'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Host</FormLabel>
                        <FormControl>
                          <Input placeholder='smtp.sendgrid.net' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='settings.integrations.email.smtpPort'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Port</FormLabel>
                        <FormControl>
                          <Input placeholder='587' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name='settings.integrations.email.smtpUser'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP User</FormLabel>
                        <FormControl>
                          <Input placeholder='apikey' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='settings.integrations.email.smtpPass'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder='SG...' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name='settings.integrations.email.smtpFromEmail'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP From Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder='support@betterlsat.com' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='settings.integrations.email.smtpFromName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP From Name</FormLabel>
                        <FormControl>
                          <Input placeholder='Better LSAT MCAT' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name='settings.integrations.email.sendgridFromEmail'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SendGrid From Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder='support@betterlsat.com' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='settings.integrations.email.sendgridFromName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SendGrid From Name</FormLabel>
                        <FormControl>
                          <Input placeholder='Better LSAT MCAT' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  form.reset()
                  onOpenChange(false)
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

