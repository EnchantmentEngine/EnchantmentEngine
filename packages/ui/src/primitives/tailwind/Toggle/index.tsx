import React from 'react'
import { twMerge } from 'tailwind-merge'

import Label from '../Label'

const sizeMap = {
  sm: 'w-9 h-5 after:w-4 after:h-4',
  md: 'w-11 h-6 after:w-5 after:h-5'
} as const

export interface ToggleProps {
  value: boolean
  size?: keyof typeof sizeMap
  label?: string
  className?: string
  onChange: (value: boolean) => void
  disabled?: boolean
}

const Toggle = ({ size, label, value, onChange, disabled }: ToggleProps) => {
  return (
    <div
      className={twMerge('flex items-center gap-4', disabled ? 'cursor-not-allowed' : 'cursor-pointer')}
      data-testid="toggle-input-container"
    >
      <input
        data-testid="toggle-input"
        disabled={disabled}
        type="checkbox"
        className="peer sr-only"
        checked={value}
        onChange={() => onChange(!value)}
      />
      <div
        className={twMerge(
          "peer relative rounded-full border border-ui-outline after:absolute after:left-[0.0625rem] after:top-1/2 after:-translate-y-1/2  after:rounded-full after:transition-all after:content-['']",
          'peer-checked:border-ui-inactive-primary peer-checked:after:translate-x-full peer-checked:after:border-ui-outline',
          'peer-disabled:ui-inactive-background after:bg-white peer-disabled:pointer-events-none',
          sizeMap[size ?? 'md'],
          disabled
            ? 'bg-ui-inactive-background peer-checked:bg-ui-inactive-primary'
            : 'bg-ui-background peer-checked:bg-ui-primary'
        )}
        onClick={() => onChange(!value)}
      />
      {label && <Label data-testid="toggle-input-label">{label}</Label>}
    </div>
  )
}

export default Toggle
