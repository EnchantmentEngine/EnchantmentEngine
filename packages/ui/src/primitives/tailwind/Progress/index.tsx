import React from 'react'
import { twMerge } from 'tailwind-merge'

const sizes = {
  small: 'h-1.5',
  default: 'h-2.5',
  large: 'h-4',
  extralarge: 'h-6'
}

export interface ProgressProps extends React.HTMLAttributes<HTMLProgressElement> {
  className?: string
  value: number
  size?: keyof typeof sizes
  barClassName?: string
}

const Progress = ({ className, barClassName, value, size = 'default' }: ProgressProps) => {
  const twClassName = twMerge(sizes[size], 'w-full rounded-full bg-gray-200 dark:bg-gray-700', className)
  const twBarClassName = twMerge(
    sizes[size],
    'rounded-full bg-ui-primary transition-all duration-500 ease-out',
    barClassName
  )

  return (
    <div className={twClassName}>
      <div className={twBarClassName} style={{ width: `${value}%` }} />
    </div>
  )
}

export default Progress
