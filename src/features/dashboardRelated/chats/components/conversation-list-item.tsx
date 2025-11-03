
import { cn } from '@/lib/dashboardRelated/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/dashboard/ui/avatar'
import { type ChatUser } from '../data/chat-types'

type ConversationListItemProps = {
  conversation: ChatUser
  isSelected: boolean
  onClick: () => void
}

export function ConversationListItem({
  conversation,
  isSelected,
  
  onClick,
}: ConversationListItemProps) {
  const { fullName, profile, username, title } = conversation

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'group relative flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-start transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        isSelected && 'bg-muted'
      )}
    >
      <Avatar className='h-10 w-10 shrink-0'>
        <AvatarImage src={profile} alt={username} />
        <AvatarFallback className='text-xs'>{getInitials(fullName)}</AvatarFallback>
      </Avatar>
      <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
        <div className='flex items-center justify-between gap-2'>
          <span className='truncate font-medium text-sm'>{fullName}</span>
        </div>
        {title && (
          <span className='truncate text-xs text-muted-foreground'>{title}</span>
        )}
      </div>
    </button>
  )
}

