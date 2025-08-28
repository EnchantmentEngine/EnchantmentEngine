import React, { useId, useLayoutEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { HelpIconSm } from '../../../icons'
import Tooltip from '../Tooltip'

export const heights = {
  xs: 'h-6 py-0.5 px-2',
  l: 'h-8 py-1.5 px-2',
  xl: 'h-10 py-2.5 px-2'
} as const

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  height?: keyof typeof heights

  /**
   * Optional React node to display at the start (left) of the s field.
   * Typically used for icons or other UI elements that provide additional context.
   */
  startComponent?: React.ReactNode

  /**
   * Optional React node to display at the end (right) of the input field.
   * Typically used for icons, buttons, or other UI elements that provide actions or additional information.
   */
  endComponent?: React.ReactNode

  /**
   * Specifies the validation state of the input field, affecting its outline color and the color of helper text.
   * - `success` indicates a successful input.
   * - `error` indicates an error in the input.
   */
  state?: 'success' | 'error'

  /**
   * Optional helper text that provides additional information about the input field.
   * When set, this will only be displayed when a valid `state` (`success` or `error`) is set.
   * The color of the helper text is determined by the current state.
   */
  helperText?: string

  fullWidth?: boolean

  labelProps?: {
    text: string
    position: 'top' | 'left'
    infoText?: string
  }
}

const Input = (
  {
    height = 'l',
    startComponent,
    endComponent,
    state,
    helperText,
    labelProps,
    required,
    id,
    fullWidth,
    disabled,
    readOnly,
    autoComplete = 'off',
    ...props
  }: InputProps,
  ref: React.ForwardedRef<HTMLInputElement>
) => {
  const tempId = useId()
  const inputId = id || tempId

  const labelRef = useRef<HTMLLabelElement>(null)

  const [helperOffset, setHelperOffset] = useState('')
  useLayoutEffect(() => {
    const updateHelperTextPosition = () => {
      if (labelProps?.position === 'left' && labelRef.current) {
        setHelperOffset(`${labelRef.current.offsetWidth + 8}px`)
      } else {
        setHelperOffset('')
      }
    }

    updateHelperTextPosition()

    window.addEventListener('resize', updateHelperTextPosition)
    return () => {
      window.removeEventListener('resize', updateHelperTextPosition)
    }
  }, [labelProps])

  return (
    <div className={`flex flex-col gap-y-2 ${fullWidth ? 'w-full' : 'w-fit'}`}>
      <div
        className={`flex ${labelProps?.position === 'top' && 'flex-col gap-y-2'} ${
          labelProps?.position === 'left' && 'flex-row items-center gap-x-2'
        }`}
      >
        {labelProps?.text && (
          <label htmlFor={inputId} className="block text-xs font-medium" ref={labelRef}>
            <div className="flex flex-row items-center gap-x-1.5">
              <div className="flex flex-row items-center gap-x-0.5">
                {required && <span className="text-sm text-ui-error">*</span>}
                <span className="whitespace-nowrap text-xs text-text-secondary">{labelProps.text}</span>
              </div>

              {labelProps?.infoText && (
                <Tooltip content={labelProps.infoText}>
                  <HelpIconSm className="text-text-tertiary" />
                </Tooltip>
              )}
            </div>
          </label>
        )}

        <div
          className={twMerge(
            'flex w-full items-center gap-x-2 rounded-md border-[0.5px] border-ui-outline',
            'text-xs placeholder-text-tertiary transition-colors duration-300 dark:bg-ui-background',
            heights[height],
            disabled
              ? 'border-ui-inactive-outline bg-ui-inactive-background text-text-inactive'
              : 'border-ui-outline bg-ui-background text-text-tertiary hover:border-ui-hover-outline hover:bg-ui-hover-background has-[:focus]:border-ui-primary has-[:focus]:bg-ui-select-background has-[:focus]:text-text-primary',
            state === 'success' ? 'border-ui-success' : '',
            state === 'error' ? 'border-ui-error' : ''
          )}
        >
          <input
            spellCheck={false}
            className={twMerge(
              'placeholder-text-[#616161] dark:placeholder-text-text-tertiary',
              'text-[#616161] dark:text-text-tertiary',
              'peer order-2 h-full w-full bg-inherit pt-0.5 outline-none autofill:bg-inherit'
            )}
            ref={ref}
            id={inputId}
            disabled={disabled}
            readOnly={readOnly}
            autoComplete={autoComplete}
            {...props}
          />
          {startComponent && (
            <div className="order-1 flex items-center justify-center text-text-tertiary">{startComponent}</div>
          )}
          {endComponent && (
            <div className="order-3 flex items-center justify-center text-text-tertiary">{endComponent}</div>
          )}
        </div>
      </div>

      {helperText && (
        <span
          className={`text-xs ${state === 'success' && 'text-ui-success'} ${state === 'error' && 'text-text-error'}`}
          style={{
            translate: helperOffset
          }}
        >
          {helperText}
        </span>
      )}
    </div>
  )
}

export default React.forwardRef(Input)
