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
          sender: String(conversation.latestMessage.author || 'System'),
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
 * Parse message attributes to extract channel and HTML flag
 */
function parseMessageAttributes(attributes: string): { channel?: string; hasHtml?: boolean } {
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
    : String(author)
  
  // Use emailBody if available for EMAIL channel, otherwise use body
  const messageBody = 
    (messageChannel === 'Email' && message.emailBody) 
      ? message.emailBody 
      : message.body
  
  // Extract hasHtml from attributes
  const hasHtml = attributes.hasHtml === true
  
  return {
    sender,
    message: messageBody,
    timestamp: dateCreated,
    channel: messageChannel,
    hasHtml,
    // Pass through email threading fields if present (only for EMAIL channel messages)
    ...(messageChannel === 'Email' && {
      emailMessageId: message.emailMessageId,
      emailInReplyTo: message.emailInReplyTo,
      emailReferences: message.emailReferences,
    }),
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
  console.log('[chat-adapters] convertThreadToChatUser called:', {
    threadId: thread.threadId,
    friendlyName: thread.friendlyName,
    channelsCount: thread.channels.length,
    channels: thread.channels.map(c => ({
      channel: c.channel,
      conversationSid: c.conversationSid,
    })),
    currentUserId,
  });
  
  // Find the counterpart participant (the other user in the conversation)
  const counterpart = thread.participants.find(
    (p) => p.userId !== thread.initiatorUserId && 
           (!currentUserId || p.userId !== Number(currentUserId))
  ) || thread.participants.find((p) => p.userId === thread.counterpartUserId)
  
  // Get the first available channel (prefer SMS, then EMAIL)
  const smsChannel = thread.channels.find((c) => c.channel === 'SMS')
  const emailChannel = thread.channels.find((c) => c.channel === 'EMAIL')
  const primaryChannel = smsChannel || emailChannel || thread.channels[0]
  
  console.log('[chat-adapters] Channel selection:', {
    smsChannel: smsChannel ? { channel: smsChannel.channel, sid: smsChannel.conversationSid } : null,
    emailChannel: emailChannel ? { channel: emailChannel.channel, sid: emailChannel.conversationSid } : null,
    primaryChannel: primaryChannel ? { channel: primaryChannel.channel, sid: primaryChannel.conversationSid } : null,
  });
  
  // Build contact details from participant info
  const contactDetails: ContactDetail = {
    email: counterpart?.email,
    phone: counterpart?.phone,
    owner: counterpart ? {
      id: String(counterpart.userId),
      name: counterpart.fullName || 'Unknown',
    } : undefined,
  }

  const convertedChannels = thread.channels.map((c) => ({
    channel: toFrontendChannel(c.channel),
    conversationSid: c.conversationSid,
  }));
  
  console.log('[chat-adapters] Converted channels:', convertedChannels);

  const result = {
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
    channels: convertedChannels,
    // Pass through original email subject if present (for EMAIL conversations)
    originalSubject: thread.originalSubject,
  };
  
  console.log('[chat-adapters] Converted ChatUser result:', {
    id: result.id,
    threadId: result.threadId,
    channel: result.channel,
    channels: result.channels,
  });
  
  return result;
}

/**
 * Convert array of backend Conversations to frontend ChatUsers
 * Supports both old ConversationOutputDto[] and new ThreadConversationOutputDto[]
 */
export function convertConversationsToChatUsers(
  conversations: ConversationOutputDto[] | ThreadConversationOutputDto[],
  currentUserId?: number | string,
): ChatUser[] {
  console.log('[chat-adapters] convertConversationsToChatUsers called:', {
    count: conversations.length,
    isThreadFormat: conversations.length > 0 && conversations[0] && 'threadId' in conversations[0],
    currentUserId,
  });
  
  // Check if it's the new thread-based format
  if (conversations.length > 0 && conversations[0] && 'threadId' in conversations[0]) {
    console.log('[chat-adapters] Using thread-based format');
    const result = (conversations as ThreadConversationOutputDto[]).map((thread) =>
      convertThreadToChatUser(thread, currentUserId)
    );
    console.log('[chat-adapters] Converted threads to ChatUsers:', result.map(c => ({
      id: c.id,
      threadId: c.threadId,
      channels: c.channels,
    })));
    return result;
  }
  // Fallback to old format
  console.log('[chat-adapters] Using old conversation format');
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

