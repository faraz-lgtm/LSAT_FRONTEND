import { useEffect, useState, useMemo } from 'react'
import { Check, X } from 'lucide-react'
import { Badge } from '@/components/dashboard/ui/badge'
import { Button } from '@/components/dashboard/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/dashboard/ui/command'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/dashboard/ui/dialog'
import { useGetUsersQuery } from '@/redux/apiSlices/User/userSlice'
import type { UserOutput, ParticipantDto } from '@/types/api/data-contracts'
import type { ChatUser } from '../data/chat-types'

type User = Omit<ChatUser, 'messages'>

type NewChatProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateConversation: (participants: ParticipantDto[], friendlyName: string) => Promise<void>
}
export function NewChat({ onOpenChange, open, onCreateConversation }: NewChatProps) {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch all users from the backend
  const { data: usersData, isLoading: isLoadingUsers } = useGetUsersQuery({})

  // Convert UserOutput to ChatUser format for display
  const users: User[] = useMemo(() => {
    if (!usersData?.data) return []
    
    return usersData.data.map((user: UserOutput) => ({
      id: user.id.toString(),
      fullName: user.name,
      username: user.username || '',
      profile: undefined, // UserOutput doesn't have profile field
      title: undefined,
      unreadCount: 0,
      isStarred: false,
      channel: 'SMS' as const,
      contactDetails: {
        email: user.email,
        phone: user.phone,
      },
    }))
  }, [usersData])

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users
    
    const query = searchQuery.toLowerCase().trim()
    return users.filter(
      (user) =>
        user.fullName.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query) ||
        user.contactDetails?.email?.toLowerCase().includes(query) ||
        user.contactDetails?.phone?.toLowerCase().includes(query)
    )
  }, [users, searchQuery])

  const handleSelectUser = (user: User) => {
    if (!selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user])
    } else {
      handleRemoveUser(user.id)
    }
  }

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((user) => user.id !== userId))
  }

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) return

    try {
      // Prepare participants for internal user-to-user chats
      // Use SMS channel with userId - backend will use user's registered phone/email
      const participants: ParticipantDto[] = selectedUsers.map((user) => ({
        channel: 'SMS' as const,
        userId: user.id,
      }))

      // For 1-on-1 chats, use the person's name. For group chats, use "Chat with X people"
      const friendlyName = selectedUsers.length === 1 
        ? selectedUsers[0].fullName 
        : `Chat with ${selectedUsers.length} people`

      await onCreateConversation(participants, friendlyName)
      
      // Reset state
      setSelectedUsers([])
      setSearchQuery('')
      
      // Dialog will be closed by parent component after successful creation
    } catch (error) {
      console.error('Failed to create conversation:', error)
      // Don't close dialog on error - let user retry
    }
  }

  useEffect(() => {
    if (!open) {
      setSelectedUsers([])
      setSearchQuery('')
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>New message</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col gap-4'>
          <div className='flex flex-wrap items-baseline-last gap-2'>
            <span className='text-muted-foreground min-h-6 text-sm'>To:</span>
            {selectedUsers.map((user) => (
              <Badge key={user.id} variant='default'>
                {user.fullName}
                <button
                  className='ring-offset-background focus:ring-ring ms-1 rounded-full outline-hidden focus:ring-2 focus:ring-offset-2'
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleRemoveUser(user.id)
                    }
                  }}
                  onClick={() => handleRemoveUser(user.id)}
                >
                  <X className='text-muted-foreground hover:text-foreground h-3 w-3' />
                </button>
              </Badge>
            ))}
          </div>
          <Command className='rounded-lg border'>
            <CommandInput
              placeholder='Search people by name, username, email, or phone...'
              className='text-foreground'
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {isLoadingUsers ? (
                <div className='py-6 text-center text-sm text-muted-foreground'>
                  Loading users...
                </div>
              ) : (
                <>
                  <CommandEmpty>No people found.</CommandEmpty>
                  <CommandGroup>
                    {filteredUsers.map((user) => (
                      <CommandItem
                        key={user.id}
                        onSelect={() => handleSelectUser(user)}
                        className='hover:bg-accent hover:text-accent-foreground flex items-center justify-between gap-2'
                      >
                        <div className='flex items-center gap-2'>
                          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-muted'>
                            <span className='text-xs font-medium'>
                              {user.fullName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2)}
                            </span>
                          </div>
                          <div className='flex flex-col'>
                            <span className='text-sm font-medium'>
                              {user.fullName}
                            </span>
                            <div className='flex items-center gap-2'>
                              {user.username && (
                                <span className='text-accent-foreground/70 text-xs'>
                                  @{user.username}
                                </span>
                              )}
                              {user.contactDetails?.email && (
                                <span className='text-accent-foreground/50 text-xs'>
                                  • {user.contactDetails.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {selectedUsers.find((u) => u.id === user.id) && (
                          <Check className='h-4 w-4' />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
          <Button
            variant={'default'}
            onClick={handleCreateChat}
            disabled={selectedUsers.length === 0}
          >
            Chat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
