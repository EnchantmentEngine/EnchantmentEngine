import { cva, VariantProps } from 'class-variance-authority'
import React from 'react'
import { twMerge } from 'tailwind-merge'

import { baseButtonStyles, distanceVariant, fadeVariant } from './Button.styles'

const styles = cva(
  [
    baseButtonStyles,
    `
      text-3xl
    `
  ],
  {
    variants: {
      size: {
        small: `
          w-10
          h-10
        `,
        large: `
          w-14
          h-14
          backdrop-blur-lg
        `
      },
      distance: distanceVariant,
      fade: fadeVariant
    },
    defaultVariants: {
      size: `large` as 'small' | 'large',
      distance: 'low' as keyof typeof distanceVariant,
      fade: 'light' as keyof typeof fadeVariant
    }
  }
)
export type Variants = VariantProps<typeof styles>
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, Variants {}

export const IconButton: React.FC<ButtonProps> = ({ className, size, fade, distance, ...props }) => (
  <button className={twMerge(styles({ size, fade, distance }), className)} {...props} />
)
