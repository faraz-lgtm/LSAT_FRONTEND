import {
  Star,
  Mail,
  Trash2,
  Filter,
  Maximize2,
  Phone,
  ExternalLink,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/dashboard/ui/avatar'
import { Button } from '@/components/dashboard/ui/button'
import { type ChatUser } from '../data/chat-types'

type MessageThreadHeaderProps = {
  conversation: ChatUser
  onStar?: () => void
  onEmail?: () => void
  onDelete?: () => void
  onFilter?: () => void
  onExpand?: () => void
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function MessageThreadHeader({
  conversation,
  onStar,
  onEmail,
  onDelete,
  onFilter,
  onExpand,
}: MessageThreadHeaderProps) {
  return (
    <div className='flex items-center justify-between border-b bg-background px-4 py-3'>
      <div className='flex items-center gap-3'>
        <div className='flex items-center gap-2'>
          <h2 className='text-base font-medium'>{conversation.fullName}</h2>
          <Button
            size='icon'
            variant='ghost'
            className='h-5 w-5'
            onClick={() => {
              // Navigate to contact
            }}
          >
            <ExternalLink className='h-3 w-3' />
          </Button>
        </div>
        <div className='flex items-center gap-1'>
          <Button
            size='icon'
            variant='ghost'
            className='h-8 w-8 rounded-full'
            onClick={onStar}
            title={conversation.isStarred ? 'Unstar' : 'Star'}
          >
            <Star
              className={`h-4 w-4 ${
                conversation.isStarred
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground'
              }`}
            />
          </Button>
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
          <Button
            size='icon'
            variant='ghost'
            className='h-8 w-8 rounded-full'
            onClick={onFilter}
            title='Filter'
          >
            <Filter className='h-4 w-4 text-muted-foreground' />
          </Button>
          <Button
            size='icon'
            variant='ghost'
            className='h-8 w-8 rounded-full'
            onClick={onExpand}
            title='Expand'
          >
            <Maximize2 className='h-4 w-4 text-muted-foreground' />
          </Button>
        </div>
      </div>
      <div className='flex items-center gap-2'>
        <Button
          size='icon'
          variant='ghost'
          className='h-9 w-9 rounded-full'
          title='Call'
        >
          <Phone className='h-4 w-4 text-muted-foreground' />
        </Button>
        <Button
          size='icon'
          variant='ghost'
          className='h-9 w-9 rounded-full'
          title='Email'
        >
          <Mail className='h-4 w-4 text-muted-foreground' />
        </Button>
      </div>
    </div>
  )
}

