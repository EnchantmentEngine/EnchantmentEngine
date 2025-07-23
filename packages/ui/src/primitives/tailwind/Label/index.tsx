import React from 'react'
import { twMerge } from 'tailwind-merge'

export interface LabelProps extends React.HtmlHTMLAttributes<HTMLLabelElement> {
  className?: string
  htmlFor?: string
}

const Label = ({ className, htmlFor, children, ...props }: LabelProps) => {
  return (
    <span
      className={twMerge(
        'inline-block text-xs font-semibold text-text-primary peer-disabled:cursor-not-allowed peer-disabled:text-text-inactive',
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export default Label
