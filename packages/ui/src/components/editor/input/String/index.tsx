import React, { useEffect, useState } from 'react'
import { XCircleLg } from '../../../../icons'
import Input, { InputProps } from '../../../../primitives/tailwind/Input'

export interface StringInputProps extends Omit<InputProps, 'onChange'> {
  value: string
  onChange?: (value: string) => void
  onRelease?: (value: string) => void
  inputRef?: React.Ref<any>
}

const StringInput = ({ value, onChange, onRelease, inputRef, ...rest }: StringInputProps) => {
  return (
    <Input
      value={value}
      onChange={(e) => {
        onChange?.(e.target.value)
      }}
      onBlur={(e) => {
        onRelease?.(e.target.value)
      }}
      onFocus={(e) => {
        onRelease?.(e.target.value)
      }}
      ref={inputRef}
      endComponent={
        <button
          className="h-4 w-4"
          onClick={() => {
            onChange?.('')
            onRelease?.('')
          }}
        >
          <XCircleLg className="h-full w-full" />
        </button>
      }
      {...rest}
    />
  )
}

StringInput.displayName = 'StringInput'
StringInput.defaultProps = {
  value: '',
  onChange: () => {},
  type: 'text',
  required: false,
  placeholder: ''
}

export default StringInput

// do we really need a controlled string input? we could easily integrate this with string input itself
export const ControlledStringInput = React.forwardRef<any, StringInputProps>((values, ref) => {
  const { onChange, onRelease, value, placeholder, disabled, type, ...rest } = values
  const [tempValue, setTempValue] = useState(value)

  useEffect(() => {
    setTempValue(value)
  }, [value])

  const onBlur = () => {
    onRelease?.(tempValue)
  }

  const onChangeValue = (value: string) => {
    setTempValue(value)
    onChange?.(value)
  }

  return (
    <Input
      ref={ref}
      value={tempValue ?? ''}
      onChange={(e) => {
        onChangeValue(e.target.value)
      }}
      onBlur={onBlur}
      disabled={disabled}
      placeholder={placeholder}
      type="text"
      fullWidth
      endComponent={
        <button
          className="h-4 w-4"
          onClick={() => {
            onChangeValue('')
          }}
        >
          <XCircleLg className="h-full w-full" />
        </button>
      }
      {...rest}
    />
  )
})

ControlledStringInput.displayName = 'ControlledStringInput'

ControlledStringInput.defaultProps = {
  value: '',
  onChange: () => {},
  type: 'text'
}
