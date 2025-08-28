import { CheckMd, ChevronDownMd } from '@ir-engine/ui/src/icons'
import React, { useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

export interface DropdownOption {
  label: string
  value: string | number
}

export interface DropdownProps {
  options: DropdownOption[]
  value?: string | number
  onChange?: (value: string | number) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  backgroundColor?: 'black' | 'white'
  border?: boolean
}

/**
 * A reusable dropdown component with custom styling
 */
const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  className = '',
  disabled = false,
  backgroundColor,
  border = true
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const bgColor = backgroundColor === 'black' ? 'black' : 'white'

  const selectedOption = options.find((option) => option.value === value)

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }

  const handleSelect = (optionValue: string | number) => {
    onChange?.(optionValue)
    setIsOpen(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div ref={dropdownRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={twMerge(
          `
            flex w-full items-center justify-between rounded-lg border-white/20
            px-4 py-3 text-left text-white backdrop-blur-sm
          `,
          disabled ? 'cursor-not-allowed opacity-50' : `cursor-pointer`,
          isOpen ? 'ring-2 ring-white/30' : '',
          border && 'border',
          bgColor === 'black' ? `bg-black/10 hover:bg-black/15` : `bg-white/10 hover:bg-white/15`
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDownMd
          className={`h-5 w-5 text-white/70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-white/20 bg-white shadow-lg">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`
                flex w-full items-center justify-between px-4 py-3 text-left text-gray-900
                hover:bg-gray-50 focus:bg-gray-50 focus:outline-none
                ${option.value === value ? 'bg-gray-100' : ''}
              `}
              role="option"
              aria-selected={option.value === value}
            >
              <span className="truncate">{option.label}</span>
              {option.value === value && <CheckMd className="h-4 w-4 text-gray-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default Dropdown
