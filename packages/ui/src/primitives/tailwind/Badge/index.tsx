import React from 'react'
import { twMerge } from 'tailwind-merge'

export interface BadgeProps {
  label: string
  className?: string
  variant?: 'success' | 'successLight' | 'danger' | 'neutral' | 'warning'
}

const variantMap = {
  success: 'bg-ui-hover-success',
  successLight: 'bg-ui-hover-success opacity-80',
  danger: 'bg-ui-hover-error',
  neutral: 'bg-gray-700',
  warning: 'bg-ui-hover-warning'
} as const

const Badge = ({ label, className, variant }: BadgeProps) => {
  variant = variant || 'neutral'

  return (
    <div
      className={twMerge(
        'flex h-fit items-center justify-around gap-x-1.5	rounded-full px-2.5 py-0.5 text-white',
        variantMap[variant],
        className
      )}
    >
      <span className="font-semibold">{label}</span>
    </div>
  )
}

export default Badge
