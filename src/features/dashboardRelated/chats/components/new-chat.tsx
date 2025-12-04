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
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
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
      channel: 'SMS' as const, // Default channel for display
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
    // Toggle selection: if same user is clicked, deselect; otherwise select the new user
    if (selectedUser?.id === user.id) {
      setSelectedUser(null)
    } else {
      setSelectedUser(user)
    }
  }

  const handleRemoveUser = () => {
    setSelectedUser(null)
  }

  const handleCreateChat = async () => {
    if (!selectedUser) return

    try {
      // Prepare participants for internal user-to-user chats
      // Backend now handles channels automatically - only userId is required
      const participants: ParticipantDto[] = [{
        userId: selectedUser.id,
      }]

      // Use the person's name for the chat
      const friendlyName = selectedUser.fullName

      await onCreateConversation(participants, friendlyName)
      
      // Reset state
      setSelectedUser(null)
      setSearchQuery('')
      
      // Dialog will be closed by parent component after successful creation
    } catch (error) {
      console.error('Failed to create conversation:', error)
      // Don't close dialog on error - let user retry
    }
  }

  useEffect(() => {
    if (!open) {
      setSelectedUser(null)
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
            {selectedUser && (
              <Badge key={selectedUser.id} variant='default'>
                {selectedUser.fullName}
                <button
                  className='ring-offset-background focus:ring-ring ms-1 rounded-full outline-hidden focus:ring-2 focus:ring-offset-2'
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleRemoveUser()
                    }
                  }}
                  onClick={() => handleRemoveUser()}
                >
                  <X className='text-muted-foreground hover:text-foreground h-3 w-3' />
                </button>
              </Badge>
            )}
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

                        {selectedUser?.id === user.id && (
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
            disabled={!selectedUser}
          >
            Chat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
