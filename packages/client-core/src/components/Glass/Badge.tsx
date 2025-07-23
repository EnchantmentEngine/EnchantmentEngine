import { cva, VariantProps } from 'class-variance-authority'
import React from 'react'
import { twMerge } from 'tailwind-merge'

const containerStyles = cva(
  `
  absolute right-0 z-40
  
  flex items-center justify-center 

  h-4 w-4

  rounded-full
  text-xs
  text-white
  
  bg-blue-500
`,
  {
    variants: {
      show: {
        true: ``,
        false: `collapse`
      },
      position: {
        bottom: `bottom-0`,
        top: `top-0`
      }
    },
    defaultVariants: {
      show: false,
      position: 'bottom' as 'bottom' | 'top'
    }
  }
)

type Variants = VariantProps<typeof containerStyles>

export type BaseBadgeProps = {
  number?: number
}

export type BadgeProps = BaseBadgeProps & Variants

interface ComponentProps extends React.HTMLAttributes<HTMLDivElement>, BadgeProps {}

export const Badge = ({ number, position, show, className }: ComponentProps) => {
  return (
    <div className={twMerge(containerStyles({ show, position }), className)}>
      <span className={'relative'}>{number}</span>
    </div>
  )
}
