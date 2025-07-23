import React, { forwardRef, TextareaHTMLAttributes } from 'react'
import { HiXCircle } from 'react-icons/hi'
import { twMerge } from 'tailwind-merge'

import Label from '../Label'

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string
  label?: string
  containerClassName?: string
  description?: string
  onChange?: TextareaHTMLAttributes<HTMLTextAreaElement>['onChange']
  error?: string
  disabled?: boolean
  startComponent?: JSX.Element
  endComponent?: JSX.Element
  variant?: 'outlined' | 'underlined' | 'onboarding'
  labelClassname?: string
  errorBorder?: boolean
  maxLength?: number
  required?: TextareaHTMLAttributes<HTMLTextAreaElement>['required']
}

const variants = {
  outlined: ' ',
  underlined: 'bg-transparent border-0 border-b rounded-none placeholder:text-neutral-200 placeholder:text-[17px]'
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      className,
      containerClassName,
      label,
      error,
      description,
      value,
      onChange,
      disabled,
      startComponent,
      endComponent,
      variant = 'outlined',
      labelClassname,
      errorBorder,
      required,
      ...props
    },
    ref
  ) => {
    const onboardingVariantStyle = errorBorder
      ? 'bg-transparent border border-rose-600 rounded-none placeholder:text-neutral-200 placeholder:text-[17px]'
      : 'bg-transparent border border-neutral-500 rounded-none placeholder:text-neutral-200 placeholder:text-[17px]'

    const twClassname = twMerge(
      'text-base font-normal tracking-tight',
      'textshadow-sm flex w-full rounded-lg border   px-3.5 py-2 transition-colors',
      'focus-visible:ring-ring placeholder:text-gray-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
      variant !== 'outlined' ? '' : 'focus-visible:ring-1',
      startComponent ? 'ps-10' : undefined,
      endComponent ? 'pe-10' : undefined,
      variant === 'onboarding' ? onboardingVariantStyle : variants[variant],
      className
    )

    const containerVariants = {
      outlined: 'gap-2',
      underlined: '',
      onboarding: ''
    }

    const twcontainerClassName = twMerge(
      'flex w-full flex-col items-center',
      containerVariants[variant],
      containerClassName
    )

    const containerClass = variant === 'outlined' ? ' relative h-full w-full' : ' relative h-full w-full'
    const labelClass = variant === 'outlined' ? '' : 'text-neutral-500 text-xs'

    return (
      <div className={twcontainerClassName}>
        {label && (
          <Label className={twMerge(`self-stretch ${labelClass}`, labelClassname)}>
            {required && <span className="text-xs text-ui-error">*</span>}
            {label}
          </Label>
        )}
        <div className={containerClass}>
          {startComponent && (
            <div className="pointer-events-auto absolute inset-y-0 start-0 flex items-center ps-3.5">
              {startComponent}
            </div>
          )}
          <textarea
            ref={ref}
            disabled={disabled}
            className={twClassname}
            value={value}
            onChange={onChange}
            {...props}
          />

          {endComponent && (
            <div className="pointer-events-auto absolute inset-y-0 end-0 flex items-center">{endComponent}</div>
          )}
        </div>
        {description && <p className="self-stretch text-xs ">{description}</p>}
        {error && (
          <p className="inline-flex items-center gap-2.5 self-start text-xs">
            <HiXCircle /> {error}
          </p>
        )}
      </div>
    )
  }
)

export default TextArea
