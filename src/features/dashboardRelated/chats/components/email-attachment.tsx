import { useState } from 'react'
import { X, File, Download } from 'lucide-react'
import { Button } from '@/components/dashboard/ui/button'
import { cn } from '@/lib/dashboardRelated/utils'
import type { EmailAttachment } from '../data/chat-types'

interface EmailAttachmentProps {
  attachment: EmailAttachment
  className?: string
}

export function EmailAttachment({ attachment, className }: EmailAttachmentProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const isImage = attachment.type.startsWith('image/')
  const dataUrl = `data:${attachment.type};base64,${attachment.content}`

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = attachment.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleImageClick = () => {
    if (isImage) {
      setIsExpanded(true)
    }
  }

  return (
    <>
      <div className={cn('email-attachment-item', className)}>
        {isImage ? (
          <img
            src={dataUrl}
            alt={attachment.filename}
            className='email-attachment-thumbnail'
            onClick={handleImageClick}
          />
        ) : (
          <div className='email-attachment-icon'>
            <File className='h-6 w-6' />
          </div>
        )}
        <div className='email-attachment-info'>
          <div className='email-attachment-filename'>{attachment.filename}</div>
          <div className='email-attachment-meta'>
            {formatFileSize(attachment.size)}
            {attachment.size && attachment.type && ' • '}
            {attachment.type}
          </div>
        </div>
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8 shrink-0'
          onClick={handleDownload}
          title='Download attachment'
        >
          <Download className='h-4 w-4' />
        </Button>
      </div>

      {/* Expanded image modal */}
      {isExpanded && isImage && (
        <div
          className='email-attachment-modal'
          onClick={() => setIsExpanded(false)}
        >
          <div
            className='email-attachment-modal-content'
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={dataUrl}
              alt={attachment.filename}
              className='email-attachment-expanded-image'
            />
            <button
              className='email-attachment-modal-close'
              onClick={() => setIsExpanded(false)}
              aria-label='Close image'
            >
              <X className='h-5 w-5' />
            </button>
          </div>
        </div>
      )}
    </>
  )
}


