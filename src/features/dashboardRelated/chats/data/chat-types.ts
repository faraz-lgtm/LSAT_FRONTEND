export type MessageChannel = 'SMS' | 'Email'

export type ContactDetail = {
  email?: string
  phone?: string
  owner?: {
    id: string
    name: string
    avatar?: string
  }
  followers?: Array<{
    id: string
    name: string
    avatar?: string
  }>
  tags?: string[]
  automations?: Array<{
    id: string
    name: string
  }>
  dnd?: boolean
  dndAll?: boolean
}

export type ChatUser = {
  id: string
  databaseId?: number // Database ID from the API (thread.id)
  profile?: string
  username: string
  fullName: string
  title?: string
  messages: Convo[]
  unreadCount?: number
  isStarred?: boolean
  channel?: MessageChannel
  contactDetails?: ContactDetail
  lastMessageTimestamp?: string
  // Thread-based conversation metadata (new structure)
  threadId?: string
  channels?: Array<{ channel: MessageChannel; conversationSid: string }>
  // Original email subject (for EMAIL conversations, used for threading)
  originalSubject?: string
}

export type EmailAttachment = {
  filename: string
  content: string
  type: string
  size?: number
  contentId?: string
}

export type Convo = {
  sender: string
  message: string
  timestamp: string
  channel?: MessageChannel
  hasHtml?: boolean
  emailHtml?: string
  // Email threading fields (optional, only present for EMAIL channel messages)
  emailMessageId?: string
  emailInReplyTo?: string
  emailReferences?: string
  attachments?: EmailAttachment[]
}
