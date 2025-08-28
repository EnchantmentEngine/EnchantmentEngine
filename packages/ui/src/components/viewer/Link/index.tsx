import React from 'react'
import { twMerge } from 'tailwind-merge'

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(({ children, className, ...props }, ref) => {
  return (
    <a ref={ref} className={twMerge(className, 'cursor-pointer text-blue-300 hover:underline')} {...props}>
      {children}
    </a>
  )
})

Link.displayName = 'Link'

export default Link
