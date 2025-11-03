import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/dashboard/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/dashboard/ui/dropdown-menu'

type OrdersPrimaryButtonsProps = {
  onCreateOrder: () => void
}

export function OrdersPrimaryButtons({ onCreateOrder }: OrdersPrimaryButtonsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className='space-x-1'>
          <span>Create</span> <PlusIcon size={18} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onCreateOrder}>Create Order</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

