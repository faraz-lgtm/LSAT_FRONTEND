import { useSelector } from 'react-redux'
import useDialogState from '@/hooks/dashboardRelated/use-dialog-state'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/dashboard/ui/avatar'
import { Button } from '@/components/dashboard/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/dashboard/ui/dropdown-menu'
import { SignOutDialog } from '@/components/dashboard/sign-out-dialog'
import type { RootState } from '@/redux/store'

export function ProfileDropdown() {
  const [open, setOpen] = useDialogState()
  const { user } = useSelector((state: RootState) => state.auth)

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
            <Avatar className='h-8 w-8'>
              <AvatarImage src='/avatars/01.png' alt={user?.username || 'User'} />
              <AvatarFallback>
                {user?.username ? user.username.substring(0, 2).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56' align='end' forceMount>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col gap-1.5'>
              <p className='text-sm leading-none font-medium'>
                {user?.username || 'User'}
              </p>
              <p className='text-muted-foreground text-xs leading-none'>
                {user?.roles?.join(', ') || 'No roles'}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpen(true)}>
            Sign out
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  )
}
