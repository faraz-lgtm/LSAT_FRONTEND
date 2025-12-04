import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Mail, Phone, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/dashboard/ui/avatar'
import { ScrollArea } from '@/components/dashboard/ui/scroll-area'
import { useGetUsersQuery } from '@/redux/apiSlices/User/userSlice'
import { useGetCallsByConversationIdQuery } from '@/redux/apiSlices/Voice/voiceSlice'
import type { RootState } from '@/redux/store'
import type { ParticipantOutputDto } from '@/types/api/data-contracts'
import { type ContactDetail } from '../data/chat-types'
import { CallLogsSection } from './call-logs-section'

type ContactDetailsSidebarProps = {
  fullName: string
  profile?: string
  contactDetails: ContactDetail
  participants?: ParticipantOutputDto[]
  conversationId?: number
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function ContactDetailsSidebar({
  fullName,
  profile,
  contactDetails,
  participants,
  conversationId,
}: ContactDetailsSidebarProps) {
  const currentUser = useSelector((state: RootState) => state.auth.user)
  const { data: usersData } = useGetUsersQuery({})
  
  // Fetch call logs if conversationId is available
  const {
    data: callsData,
    isLoading: isLoadingCalls,
    error: callsError,
  } = useGetCallsByConversationIdQuery(conversationId!, {
    skip: !conversationId,
  })

  // Debug logging
  console.log('ContactDetailsSidebar Debug:', {
    participants,
    participantsCount: participants?.length,
    usersData: usersData?.data?.length,
    currentUser: currentUser?.id,
    contactDetails,
  })

  // Find the user from participants who is not the current user
  const contactUser = useMemo(() => {
    if (!participants || participants.length === 0) {
      console.log('No participants available')
      return null
    }
    
    if (!usersData?.data) {
      console.log('Users data not loaded yet')
      return null
    }
    
    if (!currentUser) {
      console.log('Current user not available')
      return null
    }

    console.log('Looking for contact user in participants:', participants)

    // Parse participant identities to find userId
    // Participant identity might be the userId, or it might be in attributes
    for (const participant of participants) {
      try {
        console.log('Processing participant:', {
          identity: participant.identity,
          attributes: participant.attributes,
        })
        
        // Try to parse participant identity as userId
        const participantUserId = participant.identity
        
        // Try parsing attributes for userId
        let userIdFromAttributes: string | undefined
        if (participant.attributes) {
          try {
            const attrs = JSON.parse(participant.attributes)
            userIdFromAttributes = attrs.userId || attrs.user_id
            console.log('Parsed attributes:', attrs)
          } catch (e) {
            console.log('Could not parse attributes:', e)
          }
        }

        // Use attributes userId if available, otherwise use identity
        const userId = userIdFromAttributes || participantUserId
        console.log('Trying userId:', userId, 'currentUser.id:', currentUser.id)

        // Skip if this is the current user
        if (userId && String(currentUser.id) === String(userId)) {
          console.log('Skipping current user')
          continue
        }

        // Find user in users list
        const user = usersData.data.find((u) => String(u.id) === String(userId))
        if (user) {
          console.log('Found contact user:', user)
          return user
        } else {
          console.log('User not found for userId:', userId)
        }
      } catch (error) {
        console.error('Error parsing participant:', error)
      }
    }

    // Fallback: Try to find user by matching friendlyName with user name
    if (fullName && usersData.data) {
      console.log('Trying fallback: matching by name:', fullName)
      const userByName = usersData.data.find((u) => 
        u.name.toLowerCase() === fullName.toLowerCase()
      )
      if (userByName) {
        console.log('Found user by name:', userByName)
        return userByName
      }
    }

    return null
  }, [participants, usersData, currentUser, fullName])

  // Use contactDetails from props, or fallback to user data
  const email = contactDetails?.email || contactUser?.email || ''
  const phone = contactDetails?.phone || contactUser?.phone || ''
  
  console.log('Final contact info:', { 
    email, 
    phone, 
    hasEmail: !!email,
    hasPhone: !!phone,
    contactUser: contactUser ? { email: contactUser.email, phone: contactUser.phone } : null,
    contactDetails: { email: contactDetails?.email, phone: contactDetails?.phone }
  })

  return (
    <div className='flex h-full w-full flex-col border-l bg-background'>
      <ScrollArea className='flex-1 px-4 py-6'>
        <div className='flex flex-col min-h-0'>
          {/* Customer Information */}
          <div className='flex flex-col items-center gap-4 shrink-0'>
            <Avatar className='h-20 w-20'>
              <AvatarImage src={profile} alt={fullName} />
              <AvatarFallback className='text-lg'>
                {getInitials(fullName)}
              </AvatarFallback>
            </Avatar>
            
            <div className='text-center w-full'>
              <h3 className='text-lg font-semibold'>{fullName}</h3>
            </div>
          </div>

          {/* Contact Information */}
          <div className='mt-6 space-y-3 shrink-0'>
            {email && email.trim() ? (
              <div className='flex items-start gap-3 rounded-md px-3 py-3 bg-muted/50'>
                <Mail className='h-5 w-5 text-muted-foreground shrink-0 mt-0.5' />
                <div className='flex-1 min-w-0'>
                  <p className='text-xs text-muted-foreground mb-1'>Email</p>
                  <p className='text-sm break-words'>{email}</p>
                </div>
              </div>
            ) : null}

            {phone && phone.trim() ? (
              <div className='flex items-start gap-3 rounded-md px-3 py-3 bg-muted/50'>
                <Phone className='h-5 w-5 text-muted-foreground shrink-0 mt-0.5' />
                <div className='flex-1 min-w-0'>
                  <p className='text-xs text-muted-foreground mb-1'>Phone Number</p>
                  <p className='text-sm break-words font-medium'>{phone}</p>
                </div>
              </div>
            ) : null}

            {!email && !phone && (
              <div className='text-center py-8 text-sm text-muted-foreground'>
                <User className='h-12 w-12 mx-auto mb-3 opacity-50' />
                <p>No contact information available</p>
              </div>
            )}
          </div>

          {/* Call Logs Section */}
          {conversationId && (
            <CallLogsSection
              calls={callsData?.calls || []}
              isLoading={isLoadingCalls}
              error={callsError}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
