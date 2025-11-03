import { Tabs, TabsList, TabsTrigger } from '@/components/dashboard/ui/tabs'
import type { BackendChannel } from '@/utils/chat-channel'
import { toFrontendChannel } from '@/utils/chat-channel'

type ChannelTabsProps = {
  activeChannel: BackendChannel
  onChannelChange: (channel: BackendChannel) => void
}

export function ChannelTabs({ activeChannel, onChannelChange }: ChannelTabsProps) {
  // Convert backend channel to frontend display format
  const displayChannel = toFrontendChannel(activeChannel)
  
  const handleChange = (value: string) => {
    // Map frontend values to backend channels
    const channelMap: Record<string, BackendChannel> = {
      SMS: 'SMS',
      Email: 'EMAIL',
    }
    if (channelMap[value]) {
      onChannelChange(channelMap[value])
    }
  }

  return (
    <Tabs value={displayChannel} onValueChange={handleChange}>
      <TabsList className='h-auto p-1'>
        <TabsTrigger value='SMS'>SMS</TabsTrigger>
        <TabsTrigger value='Email'>Email</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

