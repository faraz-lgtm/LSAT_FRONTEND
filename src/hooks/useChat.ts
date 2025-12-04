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
  ThreadConversationOutputDto,
} from '@/types/api/data-contracts'
import {
  convertConversationsToChatUsers,
  convertMessagesToConvos,
  convertMessageToConvo,
} from '@/services/chat/chat-adapters'
import type { ChatUser, Convo } from '@/features/dashboardRelated/chats/data/chat-types'
import type { RootState } from '@/redux/store'
import { toFrontendChannel, type BackendChannel } from '@/utils/chat-channel'

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
  const [conversations, setConversations] = useState<ChatUser[]>([])
  const [currentBackendConversation, setCurrentBackendConversation] =
    useState<ConversationOutputDto | null>(null)
  const [currentConversation, setCurrentConversation] =
    useState<ChatUser | null>(null)
  const [messages, setMessages] = useState<Convo[]>([])
  const [isTyping, setIsTyping] = useState(false)
  
  // Wrap setActiveChannel to also refetch messages when channel changes
  // When switching channels, we need to use the conversation SID for that channel from the thread
  const setActiveChannel = useCallback((channel: BackendChannel) => {
    console.log('[useChat] setActiveChannel called:', {
      channel,
      currentActiveChannel: activeChannelState,
      currentSelectedSid: selectedConversationSid,
    });
    
    setActiveChannelState(channel)
    
    // If we have a thread-based conversation, switch to the conversation SID for the new channel
    if (currentConversation?.channels && currentConversation.channels.length > 0) {
      // Convert backend channel to frontend format for comparison
      const frontendChannel = toFrontendChannel(channel)
      const channelInfo = currentConversation.channels.find(
        (c) => c.channel === frontendChannel
      )
      
      if (channelInfo && channelInfo.conversationSid !== selectedConversationSid) {
        const oldSid = selectedConversationSid
        const newSid = channelInfo.conversationSid
        
        console.log('[useChat] Switching conversation SID:', {
          from: oldSid,
          to: newSid,
          channel: frontendChannel,
        });
        
        // Update to use the conversation SID for this channel
        setSelectedConversationSid(newSid)
        
        // Subscribe to the new conversation SID
        const socket = chatSocketService.getSocket()
        if (socket) {
          console.log('[useChat] Subscribing to new conversation:', newSid);
          socket.emit('subscribe:conversation', { conversationSid: newSid })
          
          // Unsubscribe from old SID to avoid duplicate messages
          if (oldSid && oldSid !== newSid) {
            console.log('[useChat] Unsubscribing from old conversation:', oldSid);
            socket.emit('unsubscribe:conversation', { conversationSid: oldSid })
          }
        } else {
          console.warn('[useChat] Socket not available for subscription');
        }
        
        // Messages will refetch automatically via RTK Query when selectedConversationSid changes
      } else if (!channelInfo) {
        console.warn('[useChat] Channel info not found for channel:', frontendChannel);
      } else {
        console.log('[useChat] No SID change needed - already using correct SID');
      }
    } else {
      console.warn('[useChat] No channels array found in currentConversation');
    }
    
    console.log('[useChat] setActiveChannel complete:', {
      newChannel: channel,
      selectedSid: selectedConversationSid, // Note: This will show old value due to async state
    });
    // RTK Query will automatically refetch when query arguments change,
    // but we ensure it happens by changing the state which triggers the query update
  }, [currentConversation, selectedConversationSid, activeChannelState])

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
    // Skip if we already have a thread-based conversation with this SID
    skip: !selectedConversationSid || !accessToken || 
      conversations.some(conv => 
        conv.channels && conv.channels.some(c => c.conversationSid === selectedConversationSid)
      )
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
  const [, { isLoading: isSendingEmail }] = useSendEmailMutation()

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
      console.log('[WebSocket] message:received event:', {
        conversationSid,
        messageSid: message.sid,
        author: message.author,
        body: message.body,
        attributes: message.attributes,
        dateCreated: message.dateCreated,
      });
      
      const currentUserId = currentUser ? String(currentUser.id) : undefined
      
      // Parse message attributes to get channel
      const messageAttributes = message.attributes ? JSON.parse(message.attributes) : {}
      const messageChannel = messageAttributes.channel
      
      // Check if this message belongs to the current conversation
      // For thread-based conversations, check if conversationSid matches any channel's conversationSid
      const conversationMatches = currentConversation?.id === conversationSid || 
        (currentConversation?.channels && 
         currentConversation.channels.some(c => c.conversationSid === conversationSid))
      
      console.log('[WebSocket] Message details:', {
        currentUserId,
        messageChannel,
        activeChannelState,
        currentConversationId: currentConversation?.id,
        currentConversationThreadId: currentConversation?.threadId,
        conversationSid,
        conversationMatches,
        channelMatches: !messageChannel || messageChannel === activeChannelState,
      });
      
      // Channel will be extracted from message attributes in convertMessageToConvo
      const displayChannel = toFrontendChannel(activeChannelState)
      const newMessage = convertMessageToConvo(message, displayChannel, currentUserId)
      
      console.log('[WebSocket] Converted message:', {
        sender: newMessage.sender,
        message: newMessage.message,
        timestamp: newMessage.timestamp,
        channel: newMessage.channel,
      });
      
      // Only add message if it matches the current conversation and active channel
      const shouldAddToMessages = conversationMatches && (!messageChannel || messageChannel === activeChannelState)
      
      console.log('[WebSocket] Message handling decision:', {
        shouldAddToMessages,
        reason: !shouldAddToMessages 
          ? (!conversationMatches
              ? 'Conversation SID mismatch' 
              : 'Channel mismatch')
          : 'Message will be added',
      });
      
      if (shouldAddToMessages) {
        console.log('[WebSocket] Adding message to messages state');
        setMessages((prev) => [newMessage, ...prev])
      } else {
        console.log('[WebSocket] Message not added - does not match current conversation/channel');
      }
      
      // Update conversation list to show latest message
      // For thread-based conversations, check if conversationSid matches any channel's conversationSid
      setConversations((prev) => {
        const conversationFound = prev.some(conv => 
          conv.id === conversationSid || 
          (conv.channels && conv.channels.some(c => c.conversationSid === conversationSid))
        )
        console.log('[WebSocket] Updating conversation list:', {
          conversationFound,
          conversationSid,
        });
        
        return prev.map((conv) => {
          // Check if this conversation matches (by ID or by any channel's conversationSid)
          const matches = conv.id === conversationSid || 
            (conv.channels && conv.channels.some(c => c.conversationSid === conversationSid))
          
          if (matches) {
            console.log('[WebSocket] Updating conversation in list:', {
              conversationId: conv.id,
              threadId: conv.threadId,
              newLastMessage: newMessage.message,
              newTimestamp: new Date(message.dateCreated).toISOString(),
            });
            return {
              ...conv,
              messages: [newMessage, ...(conv.messages || [])],
              lastMessageTimestamp: new Date(message.dateCreated).toISOString(),
            }
          }
          return conv
        })
      })
    }

    // Listen for sent message confirmation
    const handleMessageSent = ({ conversationSid, message }: { conversationSid: string; message: MessageOutputDto }) => {
      console.log('[WebSocket] message:sent event:', {
        conversationSid,
        messageSid: message.sid,
        author: message.author,
        body: message.body,
        attributes: message.attributes,
        dateCreated: message.dateCreated,
      });
      
      const currentUserId = currentUser ? String(currentUser.id) : undefined
      
      // Parse message attributes to get channel
      const messageAttributes = message.attributes ? JSON.parse(message.attributes) : {}
      const messageChannel = messageAttributes.channel
      
      // Check if this message belongs to the current conversation
      // For thread-based conversations, check if conversationSid matches any channel's conversationSid
      const conversationMatches = currentConversation?.id === conversationSid || 
        (currentConversation?.channels && 
         currentConversation.channels.some(c => c.conversationSid === conversationSid))
      
      console.log('[WebSocket] Sent message details:', {
        currentUserId,
        messageChannel,
        activeChannelState,
        currentConversationId: currentConversation?.id,
        conversationSid,
        conversationMatches,
        channelMatches: !messageChannel || messageChannel === activeChannelState,
      });
      
      // Channel will be extracted from message attributes
      const displayChannel = toFrontendChannel(activeChannelState)
      const conv = convertMessageToConvo(message, displayChannel, currentUserId)
      
      console.log('[WebSocket] Converted sent message:', {
        sender: conv.sender,
        message: conv.message,
        timestamp: conv.timestamp,
        channel: conv.channel,
      });
      
      // Only add if it matches current conversation and active channel
      const shouldAddToMessages = conversationMatches && (!messageChannel || messageChannel === activeChannelState)
      
      console.log('[WebSocket] Sent message handling decision:', {
        shouldAddToMessages,
        reason: !shouldAddToMessages 
          ? (!conversationMatches
              ? 'Conversation SID mismatch' 
              : 'Channel mismatch')
          : 'Message will be added',
      });
      
      if (shouldAddToMessages) {
        console.log('[WebSocket] Adding sent message to messages state');
        setMessages((prev) => [conv, ...prev])
      } else {
        console.log('[WebSocket] Sent message not added - does not match current conversation/channel');
      }
    }

    // Listen for conversation updates
    const handleConversationUpdated = ({ conversationSid, conversation }: { conversationSid: string; conversation: ConversationOutputDto | ThreadConversationOutputDto }) => {
      console.log('[WebSocket] conversation:updated event:', {
        conversationSid,
        isThreadFormat: 'threadId' in conversation,
        threadId: 'threadId' in conversation ? (conversation as ThreadConversationOutputDto).threadId : undefined,
        friendlyName: 'friendlyName' in conversation ? conversation.friendlyName : (conversation as ConversationOutputDto).friendlyName,
      });
      
      const currentUserIdForAdapter = currentUser?.id
      // Type guard: check if it's a thread conversation
      const chatUsers = 'threadId' in conversation
        ? convertConversationsToChatUsers([conversation as ThreadConversationOutputDto], currentUserIdForAdapter)
        : convertConversationsToChatUsers([conversation as ConversationOutputDto], currentUserIdForAdapter)
      const chatUser = chatUsers[0]
      
      console.log('[WebSocket] Converted conversation update:', {
        chatUserId: chatUser?.id,
        threadId: chatUser?.threadId,
        channels: chatUser?.channels,
      });
      
      if (chatUser) {
        // Update by conversation SID or thread ID
        setConversations((prev) => {
          const conversationMatched = prev.some(conv => 
            conv.id === conversationSid || conv.threadId === (conversation as ThreadConversationOutputDto).threadId
          )
          
          console.log('[WebSocket] Updating conversation in list:', {
            conversationMatched,
            conversationSid,
            threadId: (conversation as ThreadConversationOutputDto).threadId,
          });
          
          return prev.map((conv) =>
            (conv.id === conversationSid || conv.threadId === (conversation as ThreadConversationOutputDto).threadId) 
              ? chatUser 
              : conv,
          )
        })
        
        const currentConversationMatches = currentConversation?.id === conversationSid || currentConversation?.threadId === (conversation as ThreadConversationOutputDto).threadId
        
        console.log('[WebSocket] Updating current conversation:', {
          currentConversationMatches,
          currentConversationId: currentConversation?.id,
          currentConversationThreadId: currentConversation?.threadId,
        });
        
        if (currentConversationMatches) {
          console.log('[WebSocket] Setting current conversation to updated conversation');
          setCurrentConversation(chatUser)
          setCurrentBackendConversation(conversation as ConversationOutputDto)
        }
      } else {
        console.warn('[WebSocket] No chatUser found after conversion');
      }
    }

    // Listen for delivery receipts
    const handleDeliveryReceipt = ({ receipt }: { receipt: any }) => {
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
    socket.on('delivery:receipt', ({ receipt }: { receipt: any }) => handleDeliveryReceipt({ receipt }))
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
  }, [accessToken, currentConversation, currentUser, activeChannelState])

  // Update conversations when data changes
  useEffect(() => {
    if (conversationsData) {
      // The transformResponse should have already normalized this to an array
      const conversationsArray = Array.isArray(conversationsData)
        ? conversationsData
        : []
      
      // Pass currentUserId to help identify counterpart in thread structure
      const currentUserIdForAdapter = currentUser?.id
      const chatUsers = convertConversationsToChatUsers(conversationsArray, currentUserIdForAdapter)
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
  }, [conversationsData, currentUser])

  // Update current conversation when data changes
  useEffect(() => {
    if (conversationData) {
      // transformResponse should have normalized this to a Conversation object
      if (conversationData && typeof conversationData === 'object' && 'sid' in conversationData) {
        const currentUserIdForAdapter = currentUser?.id
        const chatUsers = convertConversationsToChatUsers([conversationData], currentUserIdForAdapter)
        const chatUser = chatUsers[0]
        setCurrentBackendConversation(conversationData)
        setCurrentConversation(chatUser ?? null)
      }
    } else if (selectedConversationSid) {
      // If we don't have conversationData but have selectedConversationSid,
      // try to find it in our conversations list (for thread-based conversations)
      const foundConversation = conversations.find(
        (conv) => conv.id === selectedConversationSid || 
        (conv.channels && conv.channels.some(c => c.conversationSid === selectedConversationSid))
      )
      
      if (foundConversation && foundConversation.channels && foundConversation.channels.length > 0) {
        console.log('[useChat] Using conversation from list (thread-based):', foundConversation);
        setCurrentConversation(foundConversation)
        // Don't need to set currentBackendConversation for thread-based conversations
      }
    }
  }, [conversationData, currentUser, conversations, selectedConversationSid])

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
    console.log('[useChat] loadConversation called:', {
      sid,
      previousSid: selectedConversationSid,
      activeChannel: activeChannelState,
    });
    
    setSelectedConversationSid(sid)
    
    // Subscribe to WebSocket updates
    const socket = chatSocketService.getSocket()
    if (socket) {
      console.log('[useChat] Subscribing to WebSocket for conversation:', sid);
      socket.emit('subscribe:conversation', { conversationSid: sid })
    } else {
      console.warn('[useChat] Socket not available for subscription');
    }
  }, [selectedConversationSid, activeChannelState])

  // Load messages for conversation - refetch with current channel
  const loadMessages = useCallback(async (sid: string, _limit = 50, channel?: BackendChannel) => {
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
      if (!selectedConversationSid) {
        throw new Error('No conversation selected')
      }

      if (!currentUser) {
        throw new Error('User not authenticated')
      }

      // Use provided channel or fallback to activeChannelState
      const messageChannel = channel || activeChannelState
      
      // For thread-based conversations, get the conversation SID for the active channel
      let conversationSid = selectedConversationSid
      if (currentConversation?.channels && currentConversation.channels.length > 0) {
        const frontendChannel = toFrontendChannel(messageChannel)
        const channelInfo = currentConversation.channels.find(
          (c) => c.channel === frontendChannel
        )
        if (channelInfo) {
          conversationSid = channelInfo.conversationSid
        }
      }

      try {
        await sendMessageMutation({
          conversationSid,
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
    [selectedConversationSid, currentConversation, sendMessageMutation, currentUser, activeChannelState],
  )

  // Create conversation
  const createConversation = useCallback(
    async (data: CreateConversationDto): Promise<ChatUser> => {
      try {
        const result = await createConversationMutation(data).unwrap()
        // Handle both direct object or wrapped in BaseApiResponse
        // Backend now returns ThreadConversationOutputDto
        const thread = (result as any).data || result
        const currentUserIdForAdapter = currentUser?.id
        const chatUsers = convertConversationsToChatUsers([thread], currentUserIdForAdapter)
        const chatUser = chatUsers[0]
        if (!chatUser) {
          throw new Error('Failed to convert thread to chat user')
        }
        return chatUser
      } catch (err: any) {
        throw err
      }
    },
    [createConversationMutation, currentUser],
  )

  // Select conversation
  // sid can be either a conversation SID or a thread ID
  // If it's a thread ID, we need to find the conversation SID for the active channel
  const selectConversation = useCallback(
    (sid: string) => {
      // Check if this is a thread-based conversation (has channels array)
      const conversation = conversations.find((conv) => conv.id === sid || conv.threadId === sid)
      
      if (conversation?.channels && conversation.channels.length > 0) {
        // Find the conversation SID for the active channel
        const channelInfo = conversation.channels.find(
          (c) => c.channel === activeChannelState
        ) || conversation.channels[0] // Fallback to first channel
        
        if (channelInfo) {
          loadConversation(channelInfo.conversationSid)
          loadMessages(channelInfo.conversationSid)
        } else {
          // Fallback to using sid directly
          loadConversation(sid)
          loadMessages(sid)
        }
      } else {
        // Old format or direct conversation SID
        loadConversation(sid)
        loadMessages(sid)
      }
    },
    [conversations, activeChannelState, loadConversation, loadMessages],
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

