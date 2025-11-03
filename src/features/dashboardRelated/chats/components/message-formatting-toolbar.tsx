import {
  Bold,
  Italic,
  Underline,
  Link as LinkIcon,
  Image as ImageIcon,
  Paperclip,
  Smile,
  DollarSign,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/dashboard/ui/button'

type MessageFormattingToolbarProps = {
  onFormat: (format: string) => void
}

export function MessageFormattingToolbar({
  onFormat,
}: MessageFormattingToolbarProps) {
  return (
    <div className='flex items-center gap-1 border-t px-2 py-1'>
      <Button
        size='icon'
        variant='ghost'
        className='h-7 w-7'
        onClick={() => onFormat('bold')}
        title='Bold'
      >
        <Bold className='h-4 w-4' />
      </Button>
      <Button
        size='icon'
        variant='ghost'
        className='h-7 w-7'
        onClick={() => onFormat('italic')}
        title='Italic'
      >
        <Italic className='h-4 w-4' />
      </Button>
      <Button
        size='icon'
        variant='ghost'
        className='h-7 w-7'
        onClick={() => onFormat('underline')}
        title='Underline'
      >
        <Underline className='h-4 w-4' />
      </Button>
      <Button
        size='icon'
        variant='ghost'
        className='h-7 w-7'
        onClick={() => onFormat('link')}
        title='Insert Link'
      >
        <LinkIcon className='h-4 w-4' />
      </Button>
      <Button
        size='icon'
        variant='ghost'
        className='h-7 w-7'
        onClick={() => onFormat('image')}
        title='Insert Image'
      >
        <ImageIcon className='h-4 w-4' />
      </Button>
      <Button
        size='icon'
        variant='ghost'
        className='h-7 w-7'
        onClick={() => onFormat('attachment')}
        title='Attach File'
      >
        <Paperclip className='h-4 w-4' />
      </Button>
      <Button
        size='icon'
        variant='ghost'
        className='h-7 w-7'
        onClick={() => onFormat('emoji')}
        title='Insert Emoji'
      >
        <Smile className='h-4 w-4' />
      </Button>
      <Button
        size='icon'
        variant='ghost'
        className='h-7 w-7'
        onClick={() => onFormat('dollar')}
        title='Insert Dollar'
      >
        <DollarSign className='h-4 w-4' />
      </Button>
      <Button
        size='icon'
        variant='ghost'
        className='h-7 w-7'
        onClick={() => onFormat('plus')}
        title='More Options'
      >
        <Plus className='h-4 w-4' />
      </Button>
    </div>
  )
}

