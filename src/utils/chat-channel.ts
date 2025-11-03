import type { MessageChannel } from '@/features/dashboardRelated/chats/data/chat-types'

/**
 * Backend channel types
 * Note: CHAT is not used in ParticipantDto/CreateConversationDto
 * For internal chats, use SMS/EMAIL with userId
 */
export type BackendChannel = 'SMS' | 'EMAIL'

/**
 * Convert frontend MessageChannel to backend channel format
 */
export function toBackendChannel(channel: MessageChannel): BackendChannel {
  const mapping: Record<MessageChannel, BackendChannel> = {
    SMS: 'SMS',
    Email: 'EMAIL',
  }
  return mapping[channel]
}

/**
 * Convert backend channel to frontend MessageChannel
 */
export function toFrontendChannel(channel: BackendChannel | string): MessageChannel {
  const mapping: Record<string, MessageChannel> = {
    SMS: 'SMS',
    EMAIL: 'Email',
    // CHAT is not a valid channel in ParticipantDto, but may appear in message attributes
    CHAT: 'SMS', // CHAT maps to SMS for display purposes (if it appears in old data)
    // WHATSAPP is deprecated, map to SMS if it appears in old data
    WHATSAPP: 'SMS',
  }
  return mapping[channel] || 'SMS'
}

