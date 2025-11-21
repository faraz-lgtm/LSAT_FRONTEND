import type {
  ConversationOutputDto,
  MessageOutputDto,
  ThreadConversationOutputDto,
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
 * Convert ThreadConversationOutputDto to ChatUser
 * The new thread-based structure has channels array with conversation SIDs
 */
export function convertThreadToChatUser(
  thread: ThreadConversationOutputDto,
  currentUserId?: number | string,
): ChatUser {
  // Find the counterpart participant (the other user in the conversation)
  const counterpart = thread.participants.find(
    (p) => p.userId !== thread.initiatorUserId && 
           (!currentUserId || p.userId !== Number(currentUserId))
  ) || thread.participants.find((p) => p.userId === thread.counterpartUserId)
  
  // Get the first available channel (prefer SMS, then EMAIL)
  const smsChannel = thread.channels.find((c) => c.channel === 'SMS')
  const emailChannel = thread.channels.find((c) => c.channel === 'EMAIL')
  const primaryChannel = smsChannel || emailChannel || thread.channels[0]
  
  // Build contact details from participant info
  const contactDetails: ContactDetail = {
    email: counterpart?.email,
    phone: counterpart?.phone,
    owner: counterpart ? {
      id: String(counterpart.userId),
      name: counterpart.fullName || 'Unknown',
    } : undefined,
  }

  return {
    id: primaryChannel?.conversationSid || thread.threadId, // Use SMS conversation SID as primary ID
    fullName: thread.friendlyName,
    username: '', // Threads don't have unique names
    profile: undefined,
    title: counterpart?.fullName,
    messages: [], // Messages are loaded separately
    unreadCount: 0,
    isStarred: false,
    channel: primaryChannel ? toFrontendChannel(primaryChannel.channel) : 'SMS',
    contactDetails,
    lastMessageTimestamp: undefined,
    // Store thread metadata for channel switching
    threadId: thread.threadId,
    channels: thread.channels.map((c) => ({
      channel: toFrontendChannel(c.channel),
      conversationSid: c.conversationSid,
    })),
  }
}

/**
 * Convert array of backend Conversations to frontend ChatUsers
 * Supports both old ConversationOutputDto[] and new ThreadConversationOutputDto[]
 */
export function convertConversationsToChatUsers(
  conversations: ConversationOutputDto[] | ThreadConversationOutputDto[],
  currentUserId?: number | string,
): ChatUser[] {
  // Check if it's the new thread-based format
  if (conversations.length > 0 && conversations[0] && 'threadId' in conversations[0]) {
    return (conversations as ThreadConversationOutputDto[]).map((thread) =>
      convertThreadToChatUser(thread, currentUserId)
    )
  }
  // Fallback to old format
  return (conversations as ConversationOutputDto[]).map(convertConversationToChatUser)
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

