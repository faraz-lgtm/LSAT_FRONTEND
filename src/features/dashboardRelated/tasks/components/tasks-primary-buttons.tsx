import { Download, PlusIcon } from 'lucide-react'
import { Button } from '@/components/dashboard/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/dashboard/ui/dropdown-menu'

type TasksPrimaryButtonsProps = {
  onCreateTask: () => void
  onCreateOrder: () => void
  onImport: () => void
}

export function TasksPrimaryButtons({ onCreateTask, onCreateOrder, onImport }: TasksPrimaryButtonsProps) {
  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={onImport}
      >
        <span>Import</span> <Download size={18} />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className='space-x-1'>
            <span>Create</span> <PlusIcon size={18} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onCreateTask}>Create Task</DropdownMenuItem>
          <DropdownMenuItem onClick={onCreateOrder}>Create Order</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
