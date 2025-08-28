import React from 'react'
import { twMerge } from 'tailwind-merge'
import { Moon01Lg, SunLg } from '../../../icons'

import Label from '../Label'

const sizeMap = {
  sm: 'w-9 h-5 after:w-4 after:h-4',
  md: 'w-11 h-6 after:w-5 after:h-5'
} as const

export interface ThemeToggleProps {
  value: boolean
  size?: keyof typeof sizeMap
  label?: string
  className?: string
  onChange: (value: boolean) => void
  disabled?: boolean
}

const ThemeToggle = ({ size, label, value, onChange, disabled }: ThemeToggleProps) => {
  return (
    <div
      className={twMerge(
        'flex w-full items-center justify-between gap-4',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer'
      )}
      data-testid="toggle-input-container"
    >
      {label && (
        <Label data-testid="toggle-input-label" className="text-base font-normal">
          {label}
        </Label>
      )}
      <input
        data-testid="toggle-input"
        disabled={disabled}
        type="checkbox"
        className="peer sr-only"
        checked={!value}
        onChange={() => onChange(!value)}
      />
      <div
        className={twMerge(
          "peer relative rounded-full border border-ui-outline after:absolute after:left-[0.0625rem] after:top-1/2 after:-translate-y-1/2  after:rounded-full after:transition-all after:content-['']",
          'peer-checked:border-ui-inactive-primary peer-checked:after:translate-x-full peer-checked:after:border-ui-outline',
          'peer-disabled:ui-inactive-background peer-disabled:pointer-events-none',
          sizeMap[size ?? 'md'],
          disabled
            ? 'bg-ui-inactive-background after:bg-text-inactive peer-checked:bg-ui-inactive-primary'
            : 'bg-ui-background after:bg-white peer-checked:bg-ui-primary'
        )}
        onClick={() => onChange(!value)}
      >
        {value ? (
          <Moon01Lg
            className={twMerge(
              'absolute top-1/2 z-50 h-4 w-4 -translate-y-1/2 text-white',
              value ? 'right-[0.1875rem]' : 'left-[0.1875rem]'
            )}
          />
        ) : (
          <SunLg
            className={twMerge(
              'absolute top-1/2 z-50 h-4 w-4 -translate-y-1/2 text-white',
              value ? 'right-[0.1875rem]' : 'left-[0.1875rem]'
            )}
          />
        )}
      </div>
    </div>
  )
}

export default ThemeToggle
