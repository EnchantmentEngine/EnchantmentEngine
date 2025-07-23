import React from 'react'
import Input from '../Input'

export type AutoCompleteOptionsType = { label: string; value: any }

export interface AutoCompleteProps {
  value: string
  options: AutoCompleteOptionsType[]
  className?: string
  placeholder?: string
  fullWidth?: boolean
  onSelect: (value: any) => void
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const AutoComplete = ({ options, onSelect, placeholder, fullWidth, className, value, onChange }: AutoCompleteProps) => {
  return (
    <div className={`relative w-full ${className}`}>
      <Input value={value} placeholder={placeholder} onChange={onChange} fullWidth={fullWidth} />
      {options.length > 0 && (
        <div className="sticky left-0 z-[60] mt-2 w-full rounded border  ">
          <ul className="max-h-40 overflow-auto [&>li]:px-4 [&>li]:py-2">
            {options.map((option, index) => (
              <li key={index} className="cursor-pointer px-4 py-2 " onClick={() => onSelect(option.value)}>
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default AutoComplete
