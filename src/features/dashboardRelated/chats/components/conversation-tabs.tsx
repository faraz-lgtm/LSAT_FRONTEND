import { Tabs, TabsList, TabsTrigger } from '@/components/dashboard/ui/tabs'

type ConversationTabsProps = {
  activeFilter: 'unread' | 'recents' | 'starred' | 'all'
  onFilterChange: (filter: 'unread' | 'recents' | 'starred' | 'all') => void
}

export function ConversationTabs({
  activeFilter,
  onFilterChange,
}: ConversationTabsProps) {
  return (
    <Tabs value={activeFilter} onValueChange={(value) => onFilterChange(value as 'unread' | 'recents' | 'starred' | 'all')}>
      <TabsList className='h-auto p-1'>
        <TabsTrigger value='unread'>Unread</TabsTrigger>
        <TabsTrigger value='recents'>Recents</TabsTrigger>
        <TabsTrigger value='starred'>Starred</TabsTrigger>
        <TabsTrigger value='all'>All</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

