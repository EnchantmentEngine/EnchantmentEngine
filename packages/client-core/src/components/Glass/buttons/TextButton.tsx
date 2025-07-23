import { cva, VariantProps } from 'class-variance-authority'
import React from 'react'
import { twMerge } from 'tailwind-merge'
import { baseButtonStyles, blurVariant, distanceVariant, fadeVariant } from './Button.styles'

const styles = cva(
  [
    baseButtonStyles,
    `
    px-6 py-3
    text-lg
    min-w-32
    
  `
  ],
  {
    variants: {
      disabled: {
        true: `cursor-not-allowed opacity-50`,
        false: ``
      },
      fade: fadeVariant,
      distance: distanceVariant,
      blur: blurVariant
    },
    defaultVariants: {
      disabled: false,
      fade: 'light' as keyof typeof fadeVariant,
      distance: 'none' as keyof typeof distanceVariant,
      blur: 'none' as keyof typeof blurVariant
    }
  }
)
export type Variants = VariantProps<typeof styles>

interface TextButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'>, Variants {}

export const TextButton: React.FC<TextButtonProps> = ({ className, disabled, fade, distance, blur, ...args }) => (
  <button disabled={!!disabled} className={twMerge(styles({ fade, disabled, distance, blur }), className)} {...args} />
)
