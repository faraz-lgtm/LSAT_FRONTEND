import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/dashboard/ui/button'

type AutomationsPrimaryButtonsProps = {
  onCreateAutomation: () => void
}

export function AutomationsPrimaryButtons({ onCreateAutomation }: AutomationsPrimaryButtonsProps) {
  return (
    <div className='flex gap-2'>
      <Button
        className='space-x-1'
        onClick={onCreateAutomation}
      >
        <span>Create Automation</span> <PlusIcon size={18} />
      </Button>
    </div>
  )
}