import { useEffect } from 'react'
import { Check, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/dashboardRelated/utils'
import { useTheme } from '@/context/theme-provider'
import { Button } from '@/components/dashboard/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/dashboard/ui/dropdown-menu'

export function ThemeSwitch({ style }: { style?: 'light' | 'dark'  }) {
  const { theme, setTheme } = useTheme()

  /* Update theme-color meta tag
   * when theme is updated */
  useEffect(() => {
    const themeColor = theme === 'dark' ? '#020817' : '#fff'
    const metaThemeColor = document.querySelector("meta[name='theme-color']")
    if (metaThemeColor) metaThemeColor.setAttribute('content', themeColor)
  }, [theme])

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button 
          style={{backgroundColor: style === 'dark' ? 'white' : undefined}} 
          variant='ghost' 
          size='icon' 
          className='scale-95 rounded-full relative hover:bg-gray-100 dark:hover:bg-gray-800'
        >
          <Sun className={`size-[1.2rem] transition-all text-gray-700 dark:text-gray-300 ${theme === 'dark' ? 'scale-0 rotate-90' : 'scale-100 rotate-0'}`} />
          <Moon className={`absolute size-[1.2rem] transition-all text-gray-700 dark:text-gray-300 ${theme === 'dark' ? 'scale-100 rotate-0' : 'scale-0 rotate-90'}`} />
          <span className='sr-only'>Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => setTheme('light')}>
          Light{' '}
          <Check
            size={14}
            className={cn('ms-auto', theme !== 'light' && 'hidden')}
          />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          Dark
          <Check
            size={14}
            className={cn('ms-auto', theme !== 'dark' && 'hidden')}
          />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          System
          <Check
            size={14}
            className={cn('ms-auto', theme !== 'system' && 'hidden')}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
