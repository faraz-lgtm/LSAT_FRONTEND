import type {
  ConversationOutputDto,
  MessageOutputDto,
} from '@/types/api/data-contracts'
import type { ChatUser, Convo, MessageChannel, ContactDetail } from '@/features/dashboardRelated/chats/data/chat-types'
import { toFrontendChannel } from '@/utils/chat-channel'

interface ConversationAttributes {
  channel?: MessageChannel
  unreadCount?: number
  isStarred?: boolean
  contactDetails?: ContactDetail
}

/**
 * Parse conversation attributes from JSON string
 */
function parseAttributes(attributes: string): ConversationAttributes {
  try {
    return attributes ? JSON.parse(attributes) : {}
  } catch {
    return {}
  }
}

/**
 * Convert backend Conversation to frontend ChatUser
 */
export function convertConversationToChatUser(
  conversation: ConversationOutputDto,
): ChatUser {
  const attributes = parseAttributes(conversation.attributes)
  
  // Convert backend messages to frontend Convo format
  const messages: Convo[] = conversation.latestMessage
    ? [
        {
          sender: conversation.latestMessage.author || 'System',
          message: conversation.latestMessage.body,
          timestamp: new Date(conversation.latestMessage.dateCreated).toISOString(),
          channel: attributes.channel,
        },
      ]
    : []

  // Handle both Date objects and ISO string dates
  const latestMessageDate = conversation.latestMessage?.dateCreated
    ? (typeof conversation.latestMessage.dateCreated === 'string'
        ? conversation.latestMessage.dateCreated
        : new Date(conversation.latestMessage.dateCreated).toISOString())
    : undefined

  return {
    id: conversation.sid,
    fullName: conversation.friendlyName || 'Unknown',
    username: conversation.uniqueName || '',
    profile: attributes.contactDetails?.owner?.avatar,
    title: attributes.contactDetails?.owner?.name,
    messages,
    unreadCount: attributes.unreadCount || 0,
    isStarred: attributes.isStarred || false,
    channel: attributes.channel || 'SMS',
    contactDetails: attributes.contactDetails || {},
    lastMessageTimestamp: latestMessageDate,
  }
}

/**
 * Parse message attributes to extract channel
 */
function parseMessageAttributes(attributes: string): { channel?: string } {
  try {
    return attributes ? JSON.parse(attributes) : {}
  } catch {
    return {}
  }
}

/**
 * Convert backend Message to frontend Convo
 * @param message - Backend message
 * @param channel - Fallback message channel (if not in attributes)
 * @param currentUserId - Optional current user ID to determine if sender is "You"
 */
export function convertMessageToConvo(
  message: MessageOutputDto,
  channel?: MessageChannel,
  currentUserId?: string | number,
): Convo {
  // Handle both Date objects and ISO string dates
  const dateCreated = typeof message.dateCreated === 'string' 
    ? message.dateCreated 
    : new Date(message.dateCreated).toISOString()
  
  // Extract channel from message attributes (backend stores it there)
  const attributes = parseMessageAttributes(message.attributes || '{}')
  const messageChannel = attributes.channel 
    ? toFrontendChannel(attributes.channel)
    : channel || 'SMS'
  
  // Determine sender: if author matches current user, show "You", otherwise show author
  const author = message.author || 'System'
  const sender = currentUserId && String(author) === String(currentUserId) 
    ? 'You' 
    : author
  
  return {
    sender,
    message: message.body,
    timestamp: dateCreated,
    channel: messageChannel,
  }
}

/**
 * Convert array of backend Conversations to frontend ChatUsers
 */
export function convertConversationsToChatUsers(
  conversations: ConversationOutputDto[],
): ChatUser[] {
  return conversations.map(convertConversationToChatUser)
}

/**
 * Convert array of backend Messages to frontend Convos
 */
export function convertMessagesToConvos(
  messages: MessageOutputDto[],
  channel?: MessageChannel,
  currentUserId?: string | number,
): Convo[] {
  return messages.map((msg) => convertMessageToConvo(msg, channel, currentUserId))
}

