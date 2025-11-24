import DOMPurify from 'dompurify'
import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/dashboard/ui/button'
import { cn } from '@/lib/dashboardRelated/utils'

interface EmailMessageRendererProps {
  body: string
  hasHtml?: boolean
  className?: string
}

interface ParsedEmail {
  currentMessage: string
  quotedThread: string
  hasQuotedContent: boolean
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
    const line = lines[i].trim()
    
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
        if (lines[j].trim().startsWith('>')) {
          quotedLineCount++
        }
      }
      // If we have multiple consecutive ">" lines, this is likely quoted content
      if (quotedLineCount >= 3) {
        // Look backwards for a header line (like "On ... wrote:")
        for (let k = Math.max(0, i - 3); k < i; k++) {
          if (quotedStartPatterns.some(pattern => pattern.test(lines[k]))) {
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
}: EmailMessageRendererProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Parse the email to separate current message from quoted thread
  const parsed = useMemo(() => parseEmailThread(body), [body])

  // Sanitize HTML for current message
  const sanitizedCurrentHtml = useMemo(() => {
    if (!hasHtml || !parsed.currentMessage) return null
    
    const htmlTagRegex = /<[^>]+>/g
    const containsHtml = htmlTagRegex.test(parsed.currentMessage)
    
    if (!containsHtml) return null
    
    return DOMPurify.sanitize(parsed.currentMessage, {
      ALLOWED_TAGS: [
        'p', 'br', 'div', 'span', 'strong', 'b', 'em', 'i', 'u',
        'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'blockquote', 'pre', 'code', 'hr', 'img', 'table', 'thead',
        'tbody', 'tr', 'td', 'th',
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'style', 'class'],
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    })
  }, [parsed.currentMessage, hasHtml])

  // Sanitize HTML for quoted thread
  const sanitizedQuotedHtml = useMemo(() => {
    if (!hasHtml || !parsed.quotedThread || !isExpanded) return null
    
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
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    })
  }, [parsed.quotedThread, hasHtml, isExpanded])

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

  const quotedThreadContent = isExpanded && parsed.hasQuotedContent ? (
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

  return (
    <div className={cn('email-message-container', className)}>
      {currentMessageContent}
      
      {parsed.hasQuotedContent && (
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
      )}
      
      {quotedThreadContent}
    </div>
  )
}

