import { api } from '../../api'
import type { CallsByConversationResponseDto } from '@/types/api/data-contracts'

type VoiceTokenResponse = {
  token: string
}

type VoiceTokenRequest = {
  userName: string
  tokenEndpoint?: string
}

const normalizeEndpoint = (endpoint?: string) => {
  if (!endpoint) {
    return 'voice/token'
  }

  if (endpoint.startsWith('http')) {
    return endpoint
  }

  const trimmed = endpoint.replace(/^\/+/, '')
  if (trimmed.startsWith('api/v1/')) {
    return trimmed.replace(/^api\/v1\//, '')
  }

  return trimmed
}

export const voiceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getVoiceToken: builder.mutation<VoiceTokenResponse, VoiceTokenRequest>({
      query: ({ userName, tokenEndpoint }) => ({
        url: normalizeEndpoint(tokenEndpoint),
        method: 'POST',
        body: { userName },
      }),
    }),
    getCallsByConversationId: builder.query<CallsByConversationResponseDto, number>({
      query: (conversationId) => ({
        url: `voice/conversations/${conversationId}/calls`,
      }),
      providesTags: (_result, _error, conversationId) => [
        { type: 'Voice', id: `calls-${conversationId}` },
      ],
    }),
  }),
})

export const { useGetVoiceTokenMutation, useGetCallsByConversationIdQuery } = voiceApi

