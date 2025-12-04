import type { BaseApiResponse } from '@/shared/BaseApiResponse'
import { api } from '../../api'
import type {
  ConversationOutputDto,
  CreateConversationDto,
  SendMessageDto,
  MessageOutputDto,
  ParticipantOutputDto,
  AddParticipantDto,
  SendEmailDto as BackendSendEmailDto,
  ThreadConversationOutputDto,
} from '@/types/api/data-contracts'

// Re-export types from data-contracts for convenience and backward compatibility
export type Conversation = ConversationOutputDto
export type ThreadConversation = ThreadConversationOutputDto
export type Message = MessageOutputDto
export type Participant = ParticipantOutputDto

// Use SendEmailDto from data-contracts
export type SendEmailDto = BackendSendEmailDto

// Chat API slice using RTK Query
export const chatApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // List all conversations
    // Note: Backend now returns ThreadConversationOutputDto[] (thread-based structure)
    listConversations: builder.query<ThreadConversation[], { limit?: number } | void>({
      query: (params) => ({
        url: 'chat/conversations',
        params: params ? { limit: params.limit || 50 } : { limit: 50 },
      }),
      providesTags: ['Chat'],
      // Transform response - backend returns ThreadConversationOutputDto[] directly, but handle BaseApiResponse too
      transformResponse: (response: any): ThreadConversation[] => {
        // If response is already an array, return it directly
        if (Array.isArray(response)) {
          return response
        }
        // If response is wrapped in BaseApiResponse, extract the data
        if (response && typeof response === 'object' && 'data' in response) {
          const data = (response as BaseApiResponse<ThreadConversation[]>).data
          return Array.isArray(data) ? data : []
        }
        // Fallback: return empty array if we can't parse
        console.warn('Unexpected conversation response format:', response)
        return []
      },
    }),

    // Get conversation details
    // Note: Backend may return Conversation directly
    getConversation: builder.query<Conversation, string>({
      query: (sid) => ({
        url: `chat/conversations/${sid}`,
      }),
      providesTags: (_result, _error, sid) => [{ type: 'Chat', id: sid }],
      // Transform response to handle both formats
      transformResponse: (response: any): Conversation => {
        // If response is already a conversation object (has sid), return it
        if (response && typeof response === 'object' && 'sid' in response) {
          return response as Conversation
        }
        // If wrapped in BaseApiResponse, extract data
        if (response && typeof response === 'object' && 'data' in response) {
          return (response as BaseApiResponse<Conversation>).data
        }
        throw new Error('Invalid conversation response format')
      },
    }),

    // Get conversation message history
    // Note: Backend may return Message[] directly
    getConversationHistory: builder.query<
      Message[],
      { sid: string; limit?: number; order?: 'asc' | 'desc'; channel?: string }
    >({
      query: ({ sid, limit = 50, order = 'desc', channel }) => {
        const params: Record<string, string | number> = { limit, order }
        if (channel) {
          params.channel = channel
        }
        return {
          url: `chat/conversations/${sid}/messages`,
          params,
        }
      },
      providesTags: (_result, _error, { sid }) => [{ type: 'Chat', id: sid }],
      // Transform response to handle both formats
      transformResponse: (response: any): Message[] => {
        if (Array.isArray(response)) {
          return response
        }
        if (response && typeof response === 'object' && 'data' in response) {
          const data = (response as BaseApiResponse<Message[]>).data
          return Array.isArray(data) ? data : []
        }
        return []
      },
    }),

    // Create new conversation
    // Note: Backend now returns ThreadConversationOutputDto (thread-based structure)
    createConversation: builder.mutation<BaseApiResponse<ThreadConversation>, CreateConversationDto>({
      query: (data) => ({
        url: 'chat/conversations',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Chat'],
      // Refetch conversations list after creating
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled
          // Invalidate and refetch conversations list
          dispatch(
            chatApi.util.invalidateTags(['Chat'])
          )
        } catch {}
      },
    }),

    // Send a message
    sendMessage: builder.mutation<
      BaseApiResponse<Message>,
      { conversationSid: string; data: SendMessageDto }
    >({
      query: ({ conversationSid, data }) => ({
        url: `chat/conversations/${conversationSid}/messages`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { conversationSid }) => [
        { type: 'Chat', id: conversationSid },
        'Chat',
      ],
      // Refetch conversation list after sending message
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled
          // Invalidate and refetch conversations list
          dispatch(
            chatApi.util.invalidateTags(['Chat'])
          )
        } catch {}
      },
    }),

    // Add participant to conversation
    addParticipant: builder.mutation<
      BaseApiResponse<Participant>,
      { conversationSid: string; data: AddParticipantDto }
    >({
      query: ({ conversationSid, data }) => ({
        url: `chat/conversations/${conversationSid}/participants`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { conversationSid }) => [
        { type: 'Chat', id: conversationSid },
        'Chat',
      ],
    }),

    // Remove participant from conversation
    removeParticipant: builder.mutation<
      BaseApiResponse<void>,
      { conversationSid: string; participantSid: string }
    >({
      query: ({ conversationSid, participantSid }) => ({
        url: `chat/conversations/${conversationSid}/participants/${participantSid}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { conversationSid }) => [
        { type: 'Chat', id: conversationSid },
        'Chat',
      ],
    }),

    // Send email in conversation context
    sendEmail: builder.mutation<
      BaseApiResponse<void>,
      { conversationSid: string; data: SendEmailDto }
    >({
      query: ({ conversationSid, data }) => ({
        url: `chat/conversations/${conversationSid}/emails`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { conversationSid }) => [
        { type: 'Chat', id: conversationSid },
        'Chat',
      ],
      // Refetch messages after sending email to show the new email message
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled
          // Invalidate messages cache so they refetch with current channel filter
          dispatch(
            chatApi.util.invalidateTags([{ type: 'Chat', id: _arg.conversationSid }])
          )
        } catch {}
      },
    }),

    // Delete conversation
    deleteConversation: builder.mutation<
      BaseApiResponse<void>,
      string
    >({
      query: (sid) => ({
        url: `chat/conversations/${sid}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, sid) => [
        { type: 'Chat', id: sid },
        'Chat',
      ],
    }),
  }),
})

// Export hooks for use in components
export const {
  useListConversationsQuery,
  useGetConversationQuery,
  useGetConversationHistoryQuery,
  useCreateConversationMutation,
  useSendMessageMutation,
  useAddParticipantMutation,
  useRemoveParticipantMutation,
  useSendEmailMutation,
  useDeleteConversationMutation,
} = chatApi

// Types are already exported above as aliases

// Re-export DTOs from data-contracts (preferred - use these directly)
export type {
  ConversationOutputDto,
  ThreadConversationOutputDto,
  MessageOutputDto,
  ParticipantOutputDto,
  CreateConversationDto,
  SendMessageDto,
  AddParticipantDto,
  ParticipantDto,
} from '@/types/api/data-contracts'

