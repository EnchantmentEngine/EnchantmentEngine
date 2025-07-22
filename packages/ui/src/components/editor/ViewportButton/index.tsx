import React from 'react'
import { twMerge } from 'tailwind-merge'

export interface ViewportButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: (({ className }: { className?: string }) => JSX.Element) | React.ElementType
  selected?: boolean
  lean?: boolean
}

function ViewportButton(
  { selected, className, icon: Icon, lean, ...props }: ViewportButtonProps,
  ref: React.ForwardedRef<HTMLButtonElement>
) {
  return (
    <button
      ref={ref}
      className={twMerge(
        'flex items-center justify-center',
        'text-text-secondary',
        !selected && 'hover:text-text-primary',
        selected ? 'text-ui-primary' : '',
        lean ? '-m-2 p-2' : 'h-8 w-8',
        className
      )}
      {...props}
    >
      <Icon className="h-5 w-5" />
    </button>
  )
}

export default React.forwardRef(ViewportButton)
