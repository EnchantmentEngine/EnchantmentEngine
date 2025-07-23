import { ButtonProps } from '@ir-engine/ui'
import React from 'react'
import { twMerge } from 'tailwind-merge'

type VariantType = 'default' | 'green' | 'red'

interface ActionButtonProps extends Omit<ButtonProps, 'variant' | 'className'> {
  icon: (({ className }: { className?: string }) => JSX.Element) | React.ElementType
  variant?: VariantType
}

const variantClasses: Record<VariantType, string> = {
  default: 'text-text-secondary hover:text-text-primary',
  green: 'text-ui-success hover:text-ui-hover-success',
  red: 'text-ui-error hover:text-ui-hover-error'
} as const

export default function ActionButton({ icon: Icon, disabled, variant = 'default', ...props }: ActionButtonProps) {
  return (
    <button
      className="rounded-full border-[0.5px] border-ui-outline bg-ui-background p-2 hover:bg-ui-hover-background"
      {...props}
    >
      <Icon
        className={twMerge('h-6 w-6', disabled ? 'cursor-not-allowed text-text-inactive' : variantClasses[variant])}
      />
    </button>
  )
}
