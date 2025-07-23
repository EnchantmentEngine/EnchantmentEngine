import React, { ReactNode } from 'react'
import { FaCheckCircle } from 'react-icons/fa'
import { IoIosWarning } from 'react-icons/io'
import { MdDangerous } from 'react-icons/md'
import { PiInfoFill } from 'react-icons/pi'
import { twMerge } from 'tailwind-merge'

export interface CalloutTextProps extends React.HTMLAttributes<HTMLElement> {
  variant: 'info' | 'error' | 'success' | 'warning'
  children?: ReactNode
  className?: string
}

const variantMap = {
  info: {
    icon: PiInfoFill,
    lightColor: 'bg-sky-100',
    darkColor: 'bg-sky-300'
  },
  error: {
    icon: MdDangerous,
    lightColor: 'bg-rose-100',
    darkColor: 'bg-rose-300'
  },
  success: {
    icon: FaCheckCircle,
    lightColor: 'bg-emerald-100',
    darkColor: 'bg-emerald-300'
  },
  warning: {
    icon: IoIosWarning,
    lightColor: 'bg-orange-100',
    darkColor: 'bg-orange-300'
  }
}

const CalloutText = ({ variant, children, className, ...props }: CalloutTextProps): JSX.Element => {
  const classes = twMerge(
    'flex items-center justify-start',
    'rounded-lg p-4',
    variantMap[variant].lightColor,
    `dark:${variantMap[variant].darkColor}`,
    'text-primary',
    className
  )
  const Icon = variantMap[variant].icon
  return (
    <div className={classes} {...props}>
      <Icon
        size="1.5rem"
        className={`mr-2 min-h-6	min-w-6 ${variantMap[variant].lightColor.replace('bg', 'text')} dark:${variantMap[
          variant
        ].darkColor.replace('bg', 'text')}]`}
      />
      {children}
    </div>
  )
}

export default CalloutText
