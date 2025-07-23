import { InputField, InputFieldProps } from '@ir-engine/ui/viewer'
import React, { useRef } from 'react'

interface FieldItemProps extends InputFieldProps {
  label: string
  className?: string
}

const FieldItem: React.FC<FieldItemProps> = ({
  label,
  className = '',
  value,
  onChange,
  isDirty,
  onReset,
  ...inputProps
}) => {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div
      onClick={(e) => {
        ref.current?.focus()
        if (e.currentTarget === e.target) {
          ref.current?.setSelectionRange(value.length, value.length)
        }
      }}
      className={`flex w-full items-center justify-between bg-black/10 px-4 py-3.5 text-white/90 transition-colors hover:bg-black/5 ${className}`}
    >
      <span className="text-sm font-medium">{label}</span>
      <InputField
        ref={ref}
        label="Display Name"
        value={value}
        onChange={onChange}
        isDirty={isDirty}
        onReset={onReset}
        {...inputProps}
      />
    </div>
  )
}

export default FieldItem
