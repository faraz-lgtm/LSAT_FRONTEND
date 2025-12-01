import DOMPurify from 'dompurify'
import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/dashboard/ui/button'
import { cn } from '@/lib/dashboardRelated/utils'
import type { EmailAttachment } from '../data/chat-types'
import { EmailAttachment as EmailAttachmentComponent } from './email-attachment'

interface EmailMessageRendererProps {
  body: string
  hasHtml?: boolean
  className?: string
  attachments?: EmailAttachment[]
  emailHtml?: string
}

interface ParsedEmail {
  currentMessage: string
  quotedThread: string
  hasQuotedContent: boolean
}

function decodeQuotedPrintable(input: string): string {
  if (!input) return ''
  
  // Remove soft line breaks
  const decoded = input.replace(/=\r?\n/g, '')
  
  // Replace all =XX sequences with their byte values
  // Then use TextDecoder to properly decode UTF-8 sequences
  const bytes: number[] = []
  const encoder = new TextEncoder()
  
  for (let i = 0; i < decoded.length; i++) {
    if (decoded[i] === '=' && i + 2 < decoded.length) {
      const hex = decoded.substring(i + 1, i + 3)
      if (/^[A-Fa-f0-9]{2}$/.test(hex)) {
        // Quoted-printable sequence - add as raw byte
        bytes.push(parseInt(hex, 16))
        i += 2 // Skip the = and two hex digits (for loop will increment i++)
        continue
      }
    }
    
    // For regular characters, use TextEncoder to get UTF-8 bytes
    const char = decoded[i]
    const charBytes = encoder.encode(char)
    bytes.push(...charBytes)
  }
  
  // Decode all bytes as UTF-8
  const decoder = new TextDecoder('utf-8', { fatal: false })
  return decoder.decode(new Uint8Array(bytes))
}

function stripQuotedHtml(html: string): string {
  if (!html) return ''
  const quotePatterns = [
    /<div[^>]*class=["'][^"']*gmail_quote[^"']*["'][^>]*>/i,
    /<blockquote[^>]*class=["'][^"']*gmail_quote[^"']*["'][^>]*>/i,
  ]

  for (const pattern of quotePatterns) {
    const match = html.match(pattern)
    if (match?.index !== undefined) {
      return html.slice(0, match.index)
    }
  }

  return html
}

function resolveCidImages(html: string, attachments: EmailAttachment[]): string {
  if (!html || attachments.length === 0) return html

  // More flexible CID matching - handle various formats including whitespace
  // Match: src="cid:..." or src='cid:...' or src = "cid:..." etc.
  return html.replace(/src\s*=\s*["']cid:([^"']+)["']/gi, (_match, rawCid) => {
    // Normalize the CID: remove angle brackets, trim whitespace, lowercase
    const normalizedCid = rawCid.replace(/[<>]/g, '').trim().toLowerCase()
    
    // Find matching attachment
    const attachment = attachments.find((item) => {
      if (!item.contentId) return false
      
      // Normalize attachment CID the same way
      const attachmentCid = item.contentId.replace(/[<>]/g, '').trim().toLowerCase()
      
      // Try exact match first
      if (attachmentCid === normalizedCid) {
        return true
      }
      
      // Try partial match (in case one has angle brackets and other doesn't)
      if (attachmentCid.includes(normalizedCid) || normalizedCid.includes(attachmentCid)) {
        return true
      }
      
      return false
    })

    if (!attachment || !attachment.content) {
      console.warn('CID image not found:', normalizedCid, 'Available CIDs:', attachments.map(a => a?.contentId || 'none'))
      // Return a broken image placeholder instead of leaving the CID reference
      return `src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='148'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle'%3EImage not found%3C/text%3E%3C/svg%3E"`
    }

    const dataUrl = `data:${attachment.type || 'image/png'};base64,${attachment.content}`
    return `src="${dataUrl}"`
  })
}

/**
 * Parse email body to separate current message from quoted thread
 */
function parseEmailThread(body: string): ParsedEmail {
  if (!body) {
    return { currentMessage: '', quotedThread: '', hasQuotedContent: false }
  }

  // Common patterns that indicate the start of quoted content
  const quotedStartPatterns = [
    /^On\s+.+\s+wrote:?\s*$/im, // "On [date] [person] wrote:"
    /^From:\s+.+$/im, // "From: [email]"
    /^Sent:\s+.+$/im, // "Sent: [date]"
    /^-----Original Message-----/im,
    /^________________________________/im,
    /^_{10,}/im, // Multiple underscores
    /^={10,}/im, // Multiple equals signs
  ]

  const lines = body.split(/\r?\n/)
  let quotedStartIndex = -1

  // Find where quoted content starts
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]?.trim() ?? ''
    
    // Check for quoted start patterns
    if (quotedStartPatterns.some(pattern => pattern.test(line))) {
      quotedStartIndex = i
      break
    }
    
    // Check for lines starting with ">" (quoted content)
    // But only if we haven't found a pattern yet and there are multiple ">" lines
    if (line.startsWith('>') && quotedStartIndex === -1) {
      // Look ahead to see if this is the start of a quoted block
      let quotedLineCount = 0
      for (let j = i; j < Math.min(i + 5, lines.length); j++) {
        const lookaheadLine = lines[j]?.trim() ?? ''
        if (lookaheadLine.startsWith('>')) {
          quotedLineCount++
        }
      }
      // If we have multiple consecutive ">" lines, this is likely quoted content
      if (quotedLineCount >= 3) {
        // Look backwards for a header line (like "On ... wrote:")
        for (let k = Math.max(0, i - 3); k < i; k++) {
          const priorLine = lines[k] ?? ''
          if (quotedStartPatterns.some(pattern => pattern.test(priorLine))) {
            quotedStartIndex = k
            break
          }
        }
        if (quotedStartIndex === -1) {
          quotedStartIndex = i
        }
        break
      }
    }
  }

  if (quotedStartIndex === -1) {
    // No quoted content found
    return {
      currentMessage: body,
      quotedThread: '',
      hasQuotedContent: false,
    }
  }

  // Split the message
  const currentMessage = lines.slice(0, quotedStartIndex).join('\n').trim()
  const quotedThread = lines.slice(quotedStartIndex).join('\n')

  return {
    currentMessage,
    quotedThread,
    hasQuotedContent: true,
  }
}

/**
 * Renders email messages with proper HTML formatting and thread collapse/expand
 * Similar to how Gmail displays email content
 */
export function EmailMessageRenderer({
  body,
  hasHtml = false,
  className = '',
  attachments = [],
  emailHtml,
}: EmailMessageRendererProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showFullHtml, setShowFullHtml] = useState(false)

  // Parse the email to separate current message from quoted thread
  const parsed = useMemo(() => parseEmailThread(body), [body])
  const { trimmedHtml, fullHtml } = useMemo(() => {
    if (!emailHtml) {
      return { trimmedHtml: '', fullHtml: '' }
    }
    const decoded = decodeQuotedPrintable(emailHtml)
    const resolvedFull = resolveCidImages(decoded, attachments)
    const stripped = stripQuotedHtml(decoded)
    const resolvedTrimmed = resolveCidImages(stripped, attachments)
    return {
      trimmedHtml: resolvedTrimmed,
      fullHtml: resolvedFull,
    }
  }, [emailHtml, attachments])

  const hasHtmlContent = hasHtml || Boolean(trimmedHtml || fullHtml)

  // Sanitize HTML for current message
  const sanitizedCurrentHtml = useMemo(() => {
    const sourceHtml = showFullHtml
      ? fullHtml
      : trimmedHtml || (hasHtml ? parsed.currentMessage : '')
    if (!sourceHtml) return null

    const htmlTagRegex = /<[^>]+>/g
    const containsHtml = htmlTagRegex.test(sourceHtml)

    if (!containsHtml) return null

    return DOMPurify.sanitize(sourceHtml, {
      ALLOWED_TAGS: [
        'p', 'br', 'div', 'span', 'strong', 'b', 'em', 'i', 'u',
        'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'blockquote', 'pre', 'code', 'hr', 'img', 'table', 'thead',
        'tbody', 'tr', 'td', 'th',
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'style', 'class', 'width', 'height', 'border', 'target'],
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[-a-z+.]+(?:[^-a-z+.:]|$))/i,
    })
  }, [trimmedHtml, fullHtml, parsed.currentMessage, hasHtml, showFullHtml])

  // Sanitize HTML for quoted thread
  const sanitizedQuotedHtml = useMemo(() => {
    if (!hasHtmlContent || !parsed.quotedThread || !isExpanded) return null

    const htmlTagRegex = /<[^>]+>/g
    const containsHtml = htmlTagRegex.test(parsed.quotedThread)

    if (!containsHtml) return null

    return DOMPurify.sanitize(parsed.quotedThread, {
      ALLOWED_TAGS: [
        'p', 'br', 'div', 'span', 'strong', 'b', 'em', 'i', 'u',
        'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'blockquote', 'pre', 'code', 'hr',
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title'],
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[-a-z+.]+(?:[^-a-z+.:]|$))/i,
    })
  }, [parsed.quotedThread, hasHtmlContent, isExpanded])

  // Format plain text with proper line breaks
  const formatPlainText = (text: string, isQuoted = false) => {
    if (!text) return null

    return text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .split('\n')
      .map((line, index) => {
        const isQuotedLine = line.trim().startsWith('>')
        const isQuotedHeader = /^On .+ wrote:$/i.test(line.trim())
        
        if (isQuoted || isQuotedLine || isQuotedHeader) {
          return (
            <div
              key={index}
              className={cn(
                "border-l-4 pl-3 ml-2 my-1 text-sm",
                isQuoted 
                  ? "border-gray-400 text-gray-500" 
                  : "border-gray-300 text-gray-600"
              )}
            >
              {line.replace(/^>\s?/, '')}
            </div>
          )
        }
        
        return (
          <div key={index} className={line.trim() ? 'mb-1' : 'mb-2'}>
            {line || '\u00A0'}
          </div>
        )
      })
  }

  const currentMessageContent = sanitizedCurrentHtml ? (
    <div
      className="email-content"
      dangerouslySetInnerHTML={{ __html: sanitizedCurrentHtml }}
      style={{
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
      }}
    />
  ) : (
    <div className="whitespace-pre-wrap break-words">
      {formatPlainText(parsed.currentMessage)}
    </div>
  )

    const quotedThreadContent = !emailHtml && isExpanded && parsed.hasQuotedContent ? (
    <div className="mt-4 pt-4 border-t border-gray-300">
      <div className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
        Quoted Message
      </div>
      {sanitizedQuotedHtml ? (
        <div
          className="email-content email-quoted text-sm text-gray-600"
          dangerouslySetInnerHTML={{ __html: sanitizedQuotedHtml }}
          style={{
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
          }}
        />
      ) : (
        <div className="whitespace-pre-wrap break-words text-sm text-gray-600">
          {formatPlainText(parsed.quotedThread, true)}
        </div>
      )}
    </div>
  ) : null

  // Filter out inline attachments (those with contentId) as they're already embedded in HTML via CID
  const regularAttachments = attachments.filter((attachment) => !attachment.contentId)

  const renderAttachments = (items: EmailAttachment[], label?: string) =>
    items.length > 0 ? (
      <div className="email-attachment-list">
        {label && (
          <div className="text-sm font-semibold text-muted-foreground mb-2">{label}</div>
        )}
        <div className="space-y-2">
          {items.map((attachment, index) => (
            <EmailAttachmentComponent
              key={`${attachment.filename}-${index}`}
              attachment={attachment}
            />
          ))}
        </div>
      </div>
    ) : null

  return (
    <div className={cn('email-message-container', className)}>
      {currentMessageContent}
      {regularAttachments.length > 0 && renderAttachments(regularAttachments, 'Attachments')}

      {(fullHtml && fullHtml !== trimmedHtml) ? (
        <div className="mt-2">
          {!showFullHtml ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullHtml(true)}
              className="h-7 text-xs text-gray-600 hover:text-gray-900"
            >
              <ChevronDown className="h-3 w-3 mr-1" />
              Show quoted text
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullHtml(false)}
              className="h-7 text-xs text-gray-600 hover:text-gray-900"
            >
              <ChevronUp className="h-3 w-3 mr-1" />
              Hide quoted text
            </Button>
          )}
        </div>
      ) : (
        !emailHtml &&
        parsed.hasQuotedContent && (
          <div className="mt-2">
            {!isExpanded ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className="h-7 text-xs text-gray-600 hover:text-gray-900"
              >
                <ChevronDown className="h-3 w-3 mr-1" />
                Show quoted text
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="h-7 text-xs text-gray-600 hover:text-gray-900"
              >
                <ChevronUp className="h-3 w-3 mr-1" />
                Hide quoted text
              </Button>
            )}
          </div>
        )
      )}

      {quotedThreadContent}
    </div>
  )
}

