import {
  Mail,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/dashboard/ui/button'
import { type ChatUser } from '../data/chat-types'
import { CallButton } from './call-button'

type MessageThreadHeaderProps = {
  conversation: ChatUser
  contactPhone?: string
  agentIdentity?: string
  onEmail?: () => void
  onDelete?: () => void
}

export function MessageThreadHeader({
  conversation,
  contactPhone,
  agentIdentity,
  onEmail,
  onDelete,
}: MessageThreadHeaderProps) {
  return (
    <div className='flex items-center justify-between border-b bg-background px-4 py-3'>
      <div className='flex items-center gap-3'>
        <h2 className='text-base font-medium'>{conversation.fullName}</h2>
        <div className='flex items-center gap-1'>
          <Button
            size='icon'
            variant='ghost'
            className='h-8 w-8 rounded-full'
            onClick={onEmail}
            title='Email'
          >
            <Mail className='h-4 w-4 text-muted-foreground' />
          </Button>
          <Button
            size='icon'
            variant='ghost'
            className='h-8 w-8 rounded-full'
            onClick={onDelete}
            title='Delete'
          >
            <Trash2 className='h-4 w-4 text-muted-foreground' />
          </Button>
        </div>
      </div>
      <div className='flex items-center gap-2'>
        <CallButton defaultNumber={contactPhone} agentIdentity={agentIdentity} conversationSid={conversation.databaseId?.toString() || ''} />
      </div>
    </div>
  )
}

