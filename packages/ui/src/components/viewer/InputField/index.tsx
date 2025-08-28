import { XCloseMd } from '@ir-engine/ui/src/icons'
import React from 'react'

export interface InputFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string
  value: string
  isPassword?: boolean
  onChange: (value: string) => void
  onReset?: () => void
  isDirty?: boolean
  className?: string
}

/**
 * A reusable input field component with reset functionality
 */
const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, value, isPassword = false, onChange, isDirty = false, onReset, className = '', ...props }, ref) => (
    <div className={`flex max-w-[25ch] flex-1 items-center gap-2 ${className}`}>
      <input
        ref={ref}
        type={isPassword || props.type === 'password' ? 'password' : 'text'}
        className="w-full bg-transparent text-right placeholder:text-white/20 focus-visible:outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        {...props}
      />

      <button onClick={onReset} className={isDirty ? 'visible' : 'invisible'} aria-label={`Reset ${label}`}>
        <XCloseMd className="h-4 w-4 text-white/70" />
      </button>
    </div>
  )
)

InputField.displayName = 'InputField'

export default InputField
