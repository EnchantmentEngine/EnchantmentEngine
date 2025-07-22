
import React, { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

const sizes = {
  xs: 'h-6',
  sm: 'h-7',
  l: 'h-8',
  xl: 'h-10'
} as const

const variants = {
  primary: 'bg-[#375DAF] hover:bg-[#2C4A8C] focus:bg-[#375DAF] disabled:bg-[#5F7DBF] disabled:text-[#AFBEDF]',
  secondary: 'bg-[#162546] hover:bg-[#213869] focus:bg-[#213869] disabled: bg-[#375DAF] disabled:text-[#AFBEDF]',
  tertiary: 'bg-[#212226] hover:bg-[#2F3137] focus:bg-[#375DAF] disabled:bg-[#191B1F] disabled:text-[#6B6F78]'
} as const

export interface StudioButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode
  size?: keyof typeof sizes
  variant?: keyof typeof variants
  fullWidth?: boolean
  /**
   * for rounded corners
   * @default false
   */
  rounded?: boolean
}

const StudioButton = (
  { children, size = 'l', fullWidth, variant = 'primary', className, rounded, ...props }: StudioButtonProps,
  ref: React.ForwardedRef<HTMLButtonElement>
) => {
  return (
    <button
      ref={ref}
      role="button"
      className={twMerge(
        'flex items-center justify-center gap-1',
        'text-sm font-medium leading-4 text-[#F5F5F5]',
        'px-2 py-2.5',
        sizes[size],
        rounded ? 'rounded' : 'rounded-none',
        fullWidth ? 'w-full' : 'w-fit',
        'disabled:cursor-not-allowed',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export default React.forwardRef(StudioButton)
