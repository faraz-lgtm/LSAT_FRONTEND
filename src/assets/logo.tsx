import { type ImgHTMLAttributes } from 'react'
import { cn } from '@/lib/dashboardRelated/utils'
import Frame68Logo from './Frame-68.png'

export function Logo({ className, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src={Frame68Logo}
      alt="Better LSAT MCAT"
      className={cn('h-8 w-auto', className)}
      {...props}
    />
  )
}
