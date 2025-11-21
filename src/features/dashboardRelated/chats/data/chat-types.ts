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
}

export type Convo = {
  sender: string
  message: string
  timestamp: string
  channel?: MessageChannel
}
