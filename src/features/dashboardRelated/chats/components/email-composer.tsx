import { useState, useRef } from 'react'
import { Button } from '@/components/dashboard/ui/button'
import { Label } from '@/components/dashboard/ui/label'
import { Textarea } from '@/components/dashboard/ui/textarea'
import { Clock, Paperclip, X, File } from 'lucide-react'
import { type ContactDetail } from '../data/chat-types'

type Attachment = {
  filename: string
  content: string
  type: string
  size?: number
}

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
    attachments?: Attachment[]
  }) => void
}

export function EmailComposer({ contactDetails, isLoading = false, onSend }: EmailComposerProps) {
  // Backend will determine recipient email from conversation participants
  // We can use contactDetails.email if available, but backend should handle it if not
  const [body, setBody] = useState('')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Remove data URL prefix (e.g., "data:image/png;base64,")
        const base64 = result.split(',')[1] || result
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newAttachments: Attachment[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file) continue
      try {
        const base64Content = await convertFileToBase64(file)
        newAttachments.push({
          filename: file.name,
          content: base64Content,
          type: file.type || 'application/octet-stream',
          size: file.size,
        })
      } catch (error) {
        console.error(`Failed to process file ${file.name}:`, error)
      }
    }

    setAttachments((prev) => [...prev, ...newAttachments])
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const isImageFile = (type: string) => {
    return type.startsWith('image/')
  }

  const handleSend = () => {
    if (!body.trim() && attachments.length === 0) {
      console.error('Body or attachments are required')
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
      attachments: attachments.length > 0 ? attachments : undefined,
    })
    // Reset form
    setBody('')
    setAttachments([])
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

      {/* File Attachments */}
      {attachments.length > 0 && (
        <div className='space-y-2'>
          <Label className='text-xs text-muted-foreground'>Attachments</Label>
          <div className='flex flex-wrap gap-2'>
            {attachments.map((attachment, index) => (
              <div
                key={index}
                className='group relative flex items-center gap-2 rounded-lg border bg-muted/50 p-2 pr-8'
              >
                {isImageFile(attachment.type) ? (
                  <div className='relative h-12 w-12 shrink-0 overflow-hidden rounded border'>
                    <img
                      src={`data:${attachment.type};base64,${attachment.content}`}
                      alt={attachment.filename}
                      className='h-full w-full object-cover'
                    />
                  </div>
                ) : (
                  <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded border bg-background'>
                    <File className='h-6 w-6 text-muted-foreground' />
                  </div>
                )}
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-xs font-medium'>{attachment.filename}</p>
                  {attachment.size && (
                    <p className='text-xs text-muted-foreground'>
                      {(attachment.size / 1024).toFixed(1)} KB
                    </p>
                  )}
                </div>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='absolute right-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100'
                  onClick={() => handleRemoveAttachment(index)}
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className='flex items-center justify-between'>
        <div>
          <input
            ref={fileInputRef}
            type='file'
            multiple
            className='hidden'
            onChange={handleFileSelect}
            accept='*/*'
            id='file-attachment'
          />
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='h-8 gap-2'
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <Paperclip className='h-4 w-4' />
            Attach Files
          </Button>
        </div>
        <Button
          className='h-8 gap-2 bg-blue-600 hover:bg-blue-700'
          onClick={handleSend}
          disabled={isLoading || (!body.trim() && attachments.length === 0)}
        >
          <Clock className='h-4 w-4' />
          Send
        </Button>
      </div>
    </div>
  )
}

