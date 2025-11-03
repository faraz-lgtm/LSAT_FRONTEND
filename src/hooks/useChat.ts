import { useEffect, useState, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { chatSocketService } from '@/services/chat/chat-socket.service'
import {
  useListConversationsQuery,
  useGetConversationQuery,
  useGetConversationHistoryQuery,
  useCreateConversationMutation,
  useSendMessageMutation,
  useSendEmailMutation,
} from '@/redux/apiSlices/Chat/chatSlice'
import type {
  ConversationOutputDto,
  MessageOutputDto,
  CreateConversationDto,
} from '@/types/api/data-contracts'
import {
  convertConversationsToChatUsers,
  convertMessagesToConvos,
  convertMessageToConvo,
} from '@/services/chat/chat-adapters'
import type { ChatUser, Convo } from '@/features/dashboardRelated/chats/data/chat-types'
import type { RootState } from '@/redux/store'
import { toBackendChannel, toFrontendChannel, type BackendChannel } from '@/utils/chat-channel'

interface UseChatReturn {
  conversations: ChatUser[]
  currentConversation: ChatUser | null
  messages: Convo[]
  isLoading: boolean
  error: string | null
  loadConversations: () => Promise<void>
  loadConversation: (sid: string) => Promise<void>
  loadMessages: (sid: string, limit?: number, channel?: BackendChannel) => Promise<void>
  sendMessage: (body: string, channel?: BackendChannel) => Promise<void>
  createConversation: (data: CreateConversationDto) => Promise<ChatUser>
  selectConversation: (sid: string) => void
  isTyping: boolean
  setIsTyping: (typing: boolean) => void
  currentBackendConversation: ConversationOutputDto | null
  activeChannel: BackendChannel
  setActiveChannel: (channel: BackendChannel) => void
  clearSelection: () => void
}

export function useChat(): UseChatReturn {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken)
  const currentUser = useSelector((state: RootState) => state.auth.user)
  const [selectedConversationSid, setSelectedConversationSid] = useState<string | null>(null)
  const [activeChannelState, setActiveChannelState] = useState<BackendChannel>('SMS')
  
  // Wrap setActiveChannel to also refetch messages when channel changes
  const setActiveChannel = useCallback((channel: BackendChannel) => {
    setActiveChannelState(channel)
    // RTK Query will automatically refetch when query arguments change,
    // but we ensure it happens by changing the state which triggers the query update
  }, [])
  const [conversations, setConversations] = useState<ChatUser[]>([])
  const [currentBackendConversation, setCurrentBackendConversation] =
    useState<ConversationOutputDto | null>(null)
  const [currentConversation, setCurrentConversation] =
    useState<ChatUser | null>(null)
  const [messages, setMessages] = useState<Convo[]>([])
  const [isTyping, setIsTyping] = useState(false)

  // RTK Query hooks
  const {
    data: conversationsData,
    isLoading: isLoadingConversations,
    error: conversationsError,
    refetch: refetchConversations,
  } = useListConversationsQuery(undefined, { skip: !accessToken })

  const {
    data: conversationData,
    isLoading: isLoadingConversation,
    error: conversationError,
  } = useGetConversationQuery(selectedConversationSid!, {
    skip: !selectedConversationSid || !accessToken,
  })

  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    error: messagesError,
    refetch: refetchMessages,
  } = useGetConversationHistoryQuery(
    { sid: selectedConversationSid!, limit: 50, order: 'desc', channel: activeChannelState },
    { skip: !selectedConversationSid || !accessToken }
  )

  const [createConversationMutation, { isLoading: isCreatingConversation }] =
    useCreateConversationMutation()
  const [sendMessageMutation, { isLoading: isSendingMessage }] = useSendMessageMutation()
  const [sendEmailMutation, { isLoading: isSendingEmail }] = useSendEmailMutation()

  const isLoading = isLoadingConversations || isLoadingConversation || isLoadingMessages || isCreatingConversation || isSendingMessage || isSendingEmail
  const error = conversationsError || conversationError || messagesError
    ? (conversationsError || conversationError || messagesError)?.toString() || 'An error occurred'
    : null

  // Initialize WebSocket connection
  useEffect(() => {
    if (!accessToken) {
      return
    }

    const socket = chatSocketService.connect(accessToken)

    // Listen for new messages
    const handleMessageReceived = ({ conversationSid, message }: { conversationSid: string; message: MessageOutputDto }) => {
      const currentUserId = currentUser ? String(currentUser.id) : undefined
      // Channel will be extracted from message attributes in convertMessageToConvo
      const displayChannel = toFrontendChannel(activeChannelState)
      const newMessage = convertMessageToConvo(message, displayChannel, currentUserId)
      // Only add message if it matches the current active channel or if no channel filter is active
      const messageAttributes = message.attributes ? JSON.parse(message.attributes) : {}
      const messageChannel = messageAttributes.channel
      if (currentConversation?.id === conversationSid && (!messageChannel || messageChannel === activeChannelState)) {
        setMessages((prev) => [newMessage, ...prev])
      }
      // Update conversation list to show latest message
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === conversationSid) {
            return {
              ...conv,
              messages: [newMessage, ...(conv.messages || [])],
              lastMessageTimestamp: new Date(message.dateCreated).toISOString(),
            }
          }
          return conv
        }),
      )
    }

    // Listen for sent message confirmation
    const handleMessageSent = ({ conversationSid, message }: { conversationSid: string; message: MessageOutputDto }) => {
      const currentUserId = currentUser ? String(currentUser.id) : undefined
      // Channel will be extracted from message attributes
      const displayChannel = toFrontendChannel(activeChannelState)
      const conv = convertMessageToConvo(message, displayChannel, currentUserId)
      // Only add if it matches current active channel
      const messageAttributes = message.attributes ? JSON.parse(message.attributes) : {}
      const messageChannel = messageAttributes.channel
      if (currentConversation?.id === conversationSid && (!messageChannel || messageChannel === activeChannelState)) {
        setMessages((prev) => [conv, ...prev])
      }
    }

    // Listen for conversation updates
    const handleConversationUpdated = ({ conversationSid, conversation }: { conversationSid: string; conversation: ConversationOutputDto }) => {
      const chatUser = convertConversationsToChatUsers([conversation])[0]
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationSid ? chatUser : conv,
        ),
      )
      if (currentConversation?.id === conversationSid) {
        setCurrentConversation(chatUser)
        setCurrentBackendConversation(conversation)
      }
    }

    // Listen for delivery receipts
    const handleDeliveryReceipt = ({ conversationSid, receipt }: { conversationSid: string; receipt: any }) => {
      console.log('Delivery receipt:', receipt)
      // Update message status if needed
    }

    // Listen for typing indicators
    const handleTypingStart = ({ conversationSid, userId }: { conversationSid: string; userId: string }) => {
      if (currentConversation?.id === conversationSid) {
        // Only show typing indicator if it's NOT the current user typing
        // userId from socket is a string, currentUser.id is a number
        const isCurrentUserTyping = currentUser && String(currentUser.id) === String(userId)
        if (!isCurrentUserTyping) {
          setIsTyping(true)
        }
      }
    }

    const handleTypingStop = ({ conversationSid, userId }: { conversationSid: string; userId: string }) => {
      if (currentConversation?.id === conversationSid) {
        // Only hide typing indicator if it's NOT the current user
        const isCurrentUserTyping = currentUser && String(currentUser.id) === String(userId)
        if (!isCurrentUserTyping) {
          setIsTyping(false)
        }
      }
    }

    socket.on('message:received', handleMessageReceived)
    socket.on('message:sent', handleMessageSent)
    socket.on('conversation:updated', handleConversationUpdated)
    socket.on('delivery:receipt', handleDeliveryReceipt)
    socket.on('typing:start', handleTypingStart)
    socket.on('typing:stop', handleTypingStop)

    return () => {
      socket.off('message:received', handleMessageReceived)
      socket.off('message:sent', handleMessageSent)
      socket.off('conversation:updated', handleConversationUpdated)
      socket.off('delivery:receipt', handleDeliveryReceipt)
      socket.off('typing:start', handleTypingStart)
      socket.off('typing:stop', handleTypingStop)
    }
  }, [accessToken, currentConversation?.id, currentUser, activeChannelState])

  // Update conversations when data changes
  useEffect(() => {
    if (conversationsData) {
      // The transformResponse should have already normalized this to an array
      const conversationsArray = Array.isArray(conversationsData)
        ? conversationsData
        : []
      
      const chatUsers = convertConversationsToChatUsers(conversationsArray)
      setConversations(chatUsers)
      
      // Debug log to see what we're getting
      console.log('Conversations loaded:', {
        raw: conversationsArray.length,
        converted: chatUsers.length,
        data: conversationsArray,
        convertedUsers: chatUsers
      })
    } else {
      // If no data, clear conversations
      setConversations([])
    }
  }, [conversationsData])

  // Update current conversation when data changes
  useEffect(() => {
    if (conversationData) {
      // transformResponse should have normalized this to a Conversation object
      if (conversationData && typeof conversationData === 'object' && 'sid' in conversationData) {
        const chatUser = convertConversationsToChatUsers([conversationData])[0]
        setCurrentBackendConversation(conversationData)
        setCurrentConversation(chatUser)
      }
    }
  }, [conversationData])

  // Update messages when data changes - messages are already filtered by channel from API
  useEffect(() => {
    // Clear messages immediately when channel changes to show loading state
    if (isLoadingMessages) {
      setMessages([])
      return
    }

    if (messagesData) {
      // transformResponse should have normalized this to an array
      const messagesArray = Array.isArray(messagesData) ? messagesData : []
      
      // Messages from API are already filtered by channel
      // Convert backend channel to frontend MessageChannel for display
      const displayChannel = toFrontendChannel(activeChannelState)
      const currentUserId = currentUser ? String(currentUser.id) : undefined
      const convos = convertMessagesToConvos(messagesArray, displayChannel, currentUserId)
      
      console.log('Messages updated:', {
        messagesDataLength: Array.isArray(messagesData) ? messagesData.length : 0,
        messagesArrayLength: messagesArray.length,
        convosLength: convos.length,
        channel: activeChannelState,
        currentUserId,
        selectedConversationSid,
      })
      
      // Messages come from API with order: 'desc' (newest first)
      // Reverse to get oldest first, then sort to ensure proper chronological order
      const sortedConvos = convos.reverse().sort((a, b) => {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      })
      setMessages(sortedConvos)
    } else if (!messagesData && !isLoadingMessages) {
      // Only clear messages if we're not loading and have no data
      console.log('Clearing messages - no data and not loading')
      setMessages([])
    }
  }, [messagesData, activeChannelState, currentUser, isLoadingMessages, selectedConversationSid])

  // Load conversations
  const loadConversations = useCallback(async () => {
    await refetchConversations()
  }, [refetchConversations])

  // Load single conversation
  const loadConversation = useCallback(async (sid: string) => {
    setSelectedConversationSid(sid)
    
    // Subscribe to WebSocket updates
    const socket = chatSocketService.getSocket()
    if (socket) {
      socket.emit('subscribe:conversation', { conversationSid: sid })
    }
  }, [])

  // Load messages for conversation - refetch with current channel
  const loadMessages = useCallback(async (sid: string, limit = 50, channel?: BackendChannel) => {
    if (sid === selectedConversationSid) {
      // If channel is provided and different from active, update it first
      if (channel && channel !== activeChannelState) {
        setActiveChannel(channel)
      }
      // RTK Query will automatically refetch when activeChannelState changes
      await refetchMessages()
    }
  }, [selectedConversationSid, activeChannelState, refetchMessages, setActiveChannel])

  // Send message
  const sendMessage = useCallback(
    async (body: string, channel?: BackendChannel) => {
      if (!currentBackendConversation) {
        throw new Error('No conversation selected')
      }

      if (!currentUser) {
        throw new Error('User not authenticated')
      }

      // Use provided channel or fallback to activeChannelState
      const messageChannel = channel || activeChannelState

      try {
        await sendMessageMutation({
          conversationSid: currentBackendConversation.sid,
          data: { 
            body,
            author: String(currentUser.id), // Set current user as the author
            attributes: {
              channel: messageChannel, // Store channel in message attributes
            },
          },
        }).unwrap()
        // Message will be added via WebSocket event
      } catch (err: any) {
        throw err
      }
    },
    [currentBackendConversation, sendMessageMutation, currentUser, activeChannelState],
  )

  // Create conversation
  const createConversation = useCallback(
    async (data: CreateConversationDto): Promise<ChatUser> => {
      try {
        const result = await createConversationMutation(data).unwrap()
        // Handle both direct object or wrapped in BaseApiResponse
        const conversation = (result as any).data || result
        const chatUser = convertConversationsToChatUsers([conversation])[0]
        return chatUser
      } catch (err: any) {
        throw err
      }
    },
    [createConversationMutation],
  )

  // Select conversation
  const selectConversation = useCallback(
    (sid: string) => {
      loadConversation(sid)
      loadMessages(sid)
    },
    [loadConversation, loadMessages],
  )

  // Clear selection
  const clearSelection = useCallback(() => {
    const sidToUnsubscribe = selectedConversationSid
    setSelectedConversationSid(null)
    setCurrentBackendConversation(null)
    setCurrentConversation(null)
    setMessages([])
    setIsTyping(false)
    
    // Unsubscribe from WebSocket updates
    if (sidToUnsubscribe) {
      const socket = chatSocketService.getSocket()
      if (socket) {
        socket.emit('unsubscribe:conversation', { conversationSid: sidToUnsubscribe })
      }
    }
  }, [selectedConversationSid])

  return {
    conversations,
    currentConversation,
    messages,
    isLoading,
    error,
    loadConversations,
    loadConversation,
    loadMessages,
    sendMessage,
    createConversation,
    selectConversation,
    isTyping,
    setIsTyping,
    currentBackendConversation,
    activeChannel: activeChannelState,
    setActiveChannel,
    clearSelection,
  }
}

