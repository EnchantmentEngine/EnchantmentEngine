import React from 'react'

export interface SliderProps {
  value: number
  min?: number
  max?: number
  step?: number
  onChange?: (value: number) => void
  className?: string
}

/**
 * A reusable slider component with custom styling
 */
const Slider: React.FC<SliderProps> = ({ value, min = 0, max = 100, step = 1, onChange, className = '' }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value)
    onChange?.(newValue)
  }

  const mappedValue = Math.round(((value - min) / (max - min)) * 100)

  return (
    <div className={`relative w-full ${className}`}>
      <div className="inset-shadow relative h-4 w-full rounded-full bg-inactive-input">
        <div
          className={`absolute left-0 top-0 h-4 rounded-full bg-primary-blue`}
          style={{ width: `${mappedValue}%` }}
        />
        <div
          className={`absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-lg`}
          style={{ left: `${mappedValue}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </div>
  )
}

export default Slider
