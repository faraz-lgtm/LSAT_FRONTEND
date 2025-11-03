import { useState, useMemo, useEffect } from 'react'
import { Fragment } from 'react/jsx-runtime'
import { format } from 'date-fns'
import {
  Edit,
  Search as SearchIcon,
  Send,
  Filter,
} from 'lucide-react'
import { cn } from '@/lib/dashboardRelated/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/dashboard/ui/avatar'
import { Button } from '@/components/dashboard/ui/button'
import { Input } from '@/components/dashboard/ui/input'
import { ScrollArea } from '@/components/dashboard/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/dashboard/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/dashboard/ui/select'
import { ConfigDrawer } from '@/components/dashboard/config-drawer'
import { Header } from '@/components/dashboard/layout/header'
import { Main } from '@/components/dashboard/layout/main'
import { ConfirmDialog } from '@/components/dashboard/confirm-dialog'
import { ProfileDropdown } from '@/components/dashboard/profile-dropdown'
import { Search } from '@/components/dashboard/search'
import { ThemeSwitch } from '@/components/dashboard/theme-switch'
import { NewChat } from './components/new-chat'
import { ConversationTabs } from './components/conversation-tabs'
import { ConversationListItem } from './components/conversation-list-item'
import { MessageThreadHeader } from './components/message-thread-header'
import { ContactDetailsSidebar } from './components/contact-details-sidebar'
import { ChannelTabs } from './components/channel-tabs'
import { EmailComposer } from './components/email-composer'
import {
  type ChatUser,
  type Convo,
} from './data/chat-types'
import { useChat } from '@/hooks/useChat'
import { chatSocketService } from '@/services/chat/chat-socket.service'
import { useSendEmailMutation, useDeleteConversationMutation } from '@/redux/apiSlices/Chat/chatSlice'

type FilterType = 'unread' | 'recents' | 'starred' | 'all'
type MainTabType = 'conversations' | 'manual-actions'

export function Chats() {
  const {
    conversations,
    currentConversation,
    messages,
    isLoading,
    error,
    loadConversations,
    selectConversation,
    sendMessage,
    createConversation,
    isTyping,
    currentBackendConversation,
    activeChannel,
    setActiveChannel,
    clearSelection,
  } = useChat()

  const [sendEmailMutation] = useSendEmailMutation()
  const [deleteConversationMutation] = useDeleteConversationMutation()


  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null)
  const [createConversationDialogOpened, setCreateConversationDialog] =
    useState(false)
  const [deleteConversationDialogOpened, setDeleteConversationDialog] =
    useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [mainTab, setMainTab] = useState<MainTabType>('conversations')
  const [messageText, setMessageText] = useState('')

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  // Sync selectedUser with currentConversation from hook
  useEffect(() => {
    if (currentConversation) {
      setSelectedUser(currentConversation)
      // Don't override activeChannel from hook - let user switch channels freely
      // Channel tabs will control the activeChannel state
    }
  }, [currentConversation])

  // Filter conversations based on active filter
  const filteredConversations = useMemo(() => {
    let filtered = conversations

    // Apply main tab filter
    if (mainTab === 'manual-actions') {
      // For now, return empty for manual actions
      filtered = []
    }

    // Apply filter type
    if (activeFilter === 'unread') {
      filtered = filtered.filter((conv) => (conv.unreadCount || 0) > 0)
    } else if (activeFilter === 'starred') {
      filtered = filtered.filter((conv) => conv.isStarred)
    } else if (activeFilter === 'recents') {
      // Sort by last message timestamp
      filtered = [...filtered].sort((a, b) => {
        const aTime = a.lastMessageTimestamp
          ? new Date(a.lastMessageTimestamp).getTime()
          : 0
        const bTime = b.lastMessageTimestamp
          ? new Date(b.lastMessageTimestamp).getTime()
          : 0
        return bTime - aTime
      })
    }

    // Apply search filter
    if (search.trim()) {
      filtered = filtered.filter(({ fullName }) =>
        fullName.toLowerCase().includes(search.trim().toLowerCase())
      )
    }

    return filtered
  }, [conversations, search, activeFilter, mainTab])

  // Group messages by date and sort within each group
  const currentMessage = useMemo(() => {
    const grouped = messages.reduce(
      (acc: Record<string, Convo[]>, obj) => {
        const date = new Date(obj.timestamp)
        // Group by date only (without time)
        const key = format(date, 'MMM d, yyyy')

        if (!acc[key]) {
          acc[key] = []
        }

        acc[key]?.push(obj)

        return acc
      },
      {}
    )
    
    // Sort messages within each date group by timestamp (oldest first)
    Object.keys(grouped).forEach((key) => {
      const group = grouped[key]
      if (group) {
        group.sort((a, b) => {
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        })
      }
    })
    
    return grouped
  }, [messages])


  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter((word) => word.length > 0).length
  }

  const handleSendEmail = async (email: {
    fromName: string
    fromEmail: string
    to: string
    cc?: string
    bcc?: string
    subject: string
    body: string
  }) => {
    if (!currentBackendConversation) {
      console.error('No conversation selected')
      return
    }

    try {
      await sendEmailMutation({
        conversationSid: currentBackendConversation.sid,
        data: {
          to: email.to,
          subject: email.subject,
          html: email.body,
          from: email.fromEmail,
          cc: email.cc ? [email.cc] : undefined,
          bcc: email.bcc ? [email.bcc] : undefined,
        },
      }).unwrap()
    } catch (err) {
      console.error('Failed to send email:', err)
    }
  }

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }
    
    if (!messageText.trim() || !currentBackendConversation) {
      return
    }

    try {
      await sendMessage(messageText, activeChannel)
      setMessageText('')
      
      // Stop typing indicator
      const socket = chatSocketService.getSocket()
      if (socket && currentBackendConversation) {
        socket.emit('typing:stop', {
          conversationSid: currentBackendConversation.sid,
        })
      }
    } catch (err) {
      console.error('Failed to send message:', err)
    }
  }

  const handleTypingStart = () => {
    const socket = chatSocketService.getSocket()
    if (socket && currentBackendConversation) {
      socket.emit('typing:start', {
        conversationSid: currentBackendConversation.sid,
      })
      // Don't set isTyping(true) here - the typing indicator should only show when the OTHER person is typing
      // The socket event will be received by other participants, and we'll receive their typing events
    }
  }

  const handleTypingStop = () => {
    const socket = chatSocketService.getSocket()
    if (socket && currentBackendConversation) {
      socket.emit('typing:stop', {
        conversationSid: currentBackendConversation.sid,
      })
      // Don't set isTyping(false) here - typing indicator should only reflect when the OTHER person stops typing
      // The socket event will be received by other participants
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      <Header>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fixed>
        <div className='flex h-full'>
          {/* Left Pane: Conversation List */}
          <div className='flex w-full flex-col border-r bg-background sm:w-64 lg:w-80'>
            {/* Header */}
            <div className='border-b bg-background p-4'>
              <div className='mb-4 flex items-center justify-between'>
                <h1 className='text-xl font-semibold'>Conversations</h1>
                <Button
                  size='icon'
                  variant='ghost'
                  onClick={() => setCreateConversationDialog(true)}
                  className='h-8 w-8'
                >
                  <Edit className='h-4 w-4' />
                </Button>
              </div>

              {/* Main Tabs */}
              <Tabs
                value={mainTab}
                onValueChange={(value) => setMainTab(value as MainTabType)}
              >
                <TabsList className='mb-3 w-full'>
                  <TabsTrigger value='conversations' className='flex-1'>
                    Conversations
                  </TabsTrigger>
                  <TabsTrigger value='manual-actions' className='flex-1'>
                    Manual Actions
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Filter Tabs */}
              {mainTab === 'conversations' && (
                <ConversationTabs
                  activeFilter={activeFilter}
                  onFilterChange={setActiveFilter}
                />
              )}

              {/* Search and Filters */}
              <div className='mt-3 space-y-2'>
                <div className='relative'>
                  <SearchIcon className='absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    type='text'
                    placeholder='Search conversations...'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className='h-9 pl-8 pr-8'
                  />
                  <div className='absolute right-2 top-1/2 flex -translate-y-1/2 gap-1'>
                    <Button
                      size='icon'
                      variant='ghost'
                      className='h-6 w-6'
                      onClick={() => {
                        // Handle filter
                      }}
                    >
                      <Filter className='h-3 w-3' />
                    </Button>
                    <Button
                      size='icon'
                      variant='ghost'
                      className='h-6 w-6'
                      onClick={() => {
                        // Handle edit
                      }}
                    >
                      <Edit className='h-3 w-3' />
                    </Button>
                  </div>
                </div>
                <div className='flex items-center justify-between text-xs text-muted-foreground'>
                  <span>{filteredConversations.length} RESULTS</span>
                  <Select defaultValue='latest'>
                    <SelectTrigger className='h-7 text-xs'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='latest'>Latest-All</SelectItem>
                      <SelectItem value='oldest'>Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Conversation List */}
            <ScrollArea className='flex-1'>
              <div className='space-y-1 p-2'>
                  {filteredConversations.map((conversation) => (
                  <ConversationListItem
                    key={conversation.id}
                    conversation={conversation}
                    isSelected={selectedUser?.id === conversation.id}
                    onClick={() => {
                      selectConversation(conversation.id)
                      // Channel tabs will manage activeChannel - start with SMS by default
                      // User can switch between channels using tabs
                    }}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Middle Pane: Message Thread */}
          {selectedUser ? (
            <div className='flex flex-1 flex-col overflow-hidden bg-background'>
              {/* Message Thread Header */}
              <MessageThreadHeader
                conversation={selectedUser}
                onStar={() => {
                  // Handle star
                }}
                onEmail={() => {
                  setActiveChannel('EMAIL')
                }}
                onDelete={() => {
                  setDeleteConversationDialog(true)
                }}
                onFilter={() => {
                  // Handle filter
                }}
                onExpand={() => {
                  // Handle expand
                }}
              />

              {/* Messages Area - Scrollable */}
              <ScrollArea className='flex-1 min-h-0'>
                <div className='px-4 py-4'>
                  {isLoading && messages.length === 0 ? (
                    <div className='flex items-center justify-center py-8 text-sm text-muted-foreground'>
                      Loading messages...
                    </div>
                  ) : Object.keys(currentMessage).length === 0 ? (
                    <div className='flex items-center justify-center py-8 text-sm text-muted-foreground no-underline'>
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                  <div className='flex flex-col gap-6'>
                  {Object.keys(currentMessage)
                      .sort((a, b) => {
                        // Sort dates chronologically (oldest first)
                        // Use the first message timestamp in each group to determine order
                        const firstMsgA = currentMessage[a]?.[0]?.timestamp
                        const firstMsgB = currentMessage[b]?.[0]?.timestamp
                        if (firstMsgA && firstMsgB) {
                          return new Date(firstMsgA).getTime() - new Date(firstMsgB).getTime()
                        }
                        return 0
                      })
                      .map((key) => (
                        <Fragment key={key}>
                          <div className='my-4 text-center text-sm font-medium text-muted-foreground'>
                            {key}
                          </div>
                          <div className='space-y-4'>
                            {currentMessage[key]?.map((msg, index) => (
                              <div
                                key={`${msg.sender}-${msg.timestamp}-${index}`}
                                className={cn(
                                  'flex gap-3',
                                  msg.sender === 'You' ? 'flex-row-reverse' : 'flex-row'
                                )}
                              >
                                <Avatar className='h-8 w-8 shrink-0'>
                                  {msg.sender === 'You' ? (
                                    <AvatarFallback className='bg-green-600 text-xs text-white'>
                                      {getInitials('You')}
                                    </AvatarFallback>
                                  ) : (
                                    <>
                                      <AvatarImage src={selectedUser.profile} />
                                      <AvatarFallback className='text-xs'>
                                        {getInitials(selectedUser.fullName)}
                                      </AvatarFallback>
                                    </>
                                  )}
                                </Avatar>
                                <div
                                  className={cn(
                                    'flex flex-col gap-1',
                                    msg.sender === 'You' ? 'items-end' : 'items-start'
                                  )}
                                >
                                  <div className='flex items-center gap-2'>
                                    <span className='text-sm font-medium'>
                                      {msg.sender === 'You'
                                        ? 'You'
                                        : selectedUser.fullName}
                                    </span>
                                    <span className='text-xs text-muted-foreground'>
                                      {format(new Date(msg.timestamp), 'MMM d, yyyy, h:mm a')}
                                    </span>
                                  </div>
                                  <div
                                    className={cn(
                                      'max-w-md rounded-lg px-3 py-2 text-sm',
                                      msg.sender === 'You'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-muted'
                                    )}
                                  >
                                    {msg.message}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </Fragment>
                      ))}
                  </div>
                  )}
                </div>
              </ScrollArea>

              {isTyping && (
                <div className='px-4 py-2 text-sm text-muted-foreground'>
                  {selectedUser?.fullName || 'Someone'} is typing...
                </div>
              )}

              {/* Message Input Area - Sticky at bottom */}
              <div className='sticky bottom-0 z-10 border-t bg-background p-4 shadow-lg'>
                {/* Channel Tabs - Always visible */}
                <div className='mb-3'>
                  <ChannelTabs
                    activeChannel={activeChannel}
                    onChannelChange={(channel) => {
                      // When channel changes, messages will automatically refetch via useChat hook
                      // The hook's getConversationHistory query includes channel param, so RTK Query
                      // will automatically refetch when activeChannel changes
                      setActiveChannel(channel)
                    }}
                  />
                </div>

                {/* Email Composer (if Email channel) */}
                {activeChannel === 'EMAIL' ? (
                    <EmailComposer
                      contactDetails={selectedUser.contactDetails || {}}
                      isLoading={isLoading}
                      onSend={handleSendEmail}
                    />
                ) : (
                  <>
                    {/* Regular Message Input */}
                    <div className='space-y-2'>
                      <div className='flex items-end gap-2 rounded-lg border bg-card p-2'>
                        <Input
                          type='text'
                          placeholder='Type a message'
                          value={messageText}
                          onChange={(e) => {
                            setMessageText(e.target.value)
                            handleTypingStart()
                          }}
                          onBlur={handleTypingStop}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleSendMessage()
                            }
                          }}
                          className='border-0 bg-transparent focus-visible:ring-0'
                        />
                      </div>
                      <div className='flex items-center justify-end'>
                        <div className='flex items-center gap-2'>
                          <span className='text-xs text-muted-foreground'>
                            {getWordCount(messageText)} word
                          </span>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-7 text-xs'
                            onClick={() => setMessageText('')}
                          >
                            Clear
                          </Button>
                          <Button
                            size='sm'
                            className='gap-2 bg-blue-600 hover:bg-blue-700'
                            onClick={handleSendMessage}
                            disabled={!messageText.trim() || isLoading}
                          >
                            <Send className='h-4 w-4' />
                            Send
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className='flex flex-1 items-center justify-center bg-background'>
              <div className='flex flex-col items-center space-y-4 text-center'>
                <div className='flex h-16 w-16 items-center justify-center rounded-full border-2'>
                  <span className='text-2xl'>💬</span>
                </div>
                <div>
                  <h2 className='text-lg font-semibold'>Your messages</h2>
                  <p className='text-sm text-muted-foreground'>
                    {isLoading ? 'Loading conversations...' : 'Send a message to start a chat.'}
                  </p>
                </div>
                <Button onClick={() => setCreateConversationDialog(true)}>
                  Send message
                </Button>
                {error && (
                  <div className='mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive'>
                    {error}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Right Pane: Contact Details Sidebar */}
          {selectedUser && (
            <div className='hidden w-64 border-l bg-background lg:block'>
              <ContactDetailsSidebar
                fullName={selectedUser.fullName}
                profile={selectedUser.profile}
                contactDetails={selectedUser.contactDetails || {}}
                participants={currentBackendConversation?.participants}
              />
            </div>
          )}
        </div>

        <NewChat
          onOpenChange={setCreateConversationDialog}
          open={createConversationDialogOpened}
          onCreateConversation={async (participants, friendlyName) => {
            try {
              // Filter out any invalid entries - userId is required for all channels
              // Backend will use the user's registered phone/email based on the channel
              const validParticipants = participants.filter(p => {
                // All channels require userId (backend uses user's registered contact info)
                return !!p.userId
              })
              
              const chatUser = await createConversation({
                friendlyName,
                participants: validParticipants,
              })
              
              // Close dialog on success
              setCreateConversationDialog(false)
              
              // Select the newly created conversation
              if (chatUser) {
                // Use the SID (id) from the created conversation
                selectConversation(chatUser.id)
              }
              
              // Reload conversations list - RTK Query should handle this automatically
              // but we'll trigger a refetch to be sure
              await loadConversations()
            } catch (error) {
              console.error('Failed to create conversation:', error)
              throw error
            }
          }}
        />

        {/* Delete Conversation Confirmation Dialog */}
        <ConfirmDialog
          open={deleteConversationDialogOpened}
          onOpenChange={setDeleteConversationDialog}
          title="Delete Conversation"
          desc={`Are you sure you want to delete the conversation with ${selectedUser?.fullName || 'this contact'}? This action cannot be undone.`}
          confirmText="Delete"
          handleConfirm={async () => {
            if (!currentBackendConversation?.sid) return
            
            try {
              await deleteConversationMutation(currentBackendConversation.sid).unwrap()
              setDeleteConversationDialog(false)
              // Clear selection in hook (this will also clear currentConversation, messages, etc.)
              clearSelection()
              // Clear local selected user state
              setSelectedUser(null)
              // Reload conversations list
              await loadConversations()
            } catch (error) {
              console.error('Failed to delete conversation:', error)
            }
          }}
          destructive
        />
      </Main>
    </>
  )
}
