import { useState } from 'react'
import { Button } from '@/components/dashboard/ui/button'
import { Label } from '@/components/dashboard/ui/label'
import { Textarea } from '@/components/dashboard/ui/textarea'
import { Clock } from 'lucide-react'
import { type ContactDetail } from '../data/chat-types'

type EmailComposerProps = {
  contactDetails: ContactDetail
  isLoading?: boolean
  onSend: (email: {
    fromName: string
    fromEmail: string
    to: string
    cc?: string
    bcc?: string
    subject: string
    body: string
  }) => void
}

export function EmailComposer({ contactDetails, isLoading = false, onSend }: EmailComposerProps) {
  // Backend will determine recipient email from conversation participants
  // We can use contactDetails.email if available, but backend should handle it if not
  const [body, setBody] = useState('')

  const handleSend = () => {
    if (!body.trim()) {
      console.error('Body is required')
      return
    }

    // Backend will determine 'to' from conversation participants based on EMAIL channel
    // Pass contactDetails.email if available, but backend should handle it even if empty
    onSend({
      fromName: '', // Backend will use logged-in user's name
      fromEmail: '', // Backend will use logged-in user's email automatically
      to: contactDetails.email || '', // Backend will determine from conversation if empty
      subject: '', // No subject field in UI
      body: body.trim(),
    })
    // Reset form
    setBody('')
  }

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='body' className='text-xs text-muted-foreground'>
          Type a message
        </Label>
        <Textarea
          id='body'
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder='Type your message here...'
          className='min-h-32'
        />
      </div>
      <div className='flex items-center justify-end'>
        <Button
          className='h-8 gap-2 bg-blue-600 hover:bg-blue-700'
          onClick={handleSend}
          disabled={isLoading || !body.trim()}
        >
          <Clock className='h-4 w-4' />
          Send
        </Button>
      </div>
    </div>
  )
}

