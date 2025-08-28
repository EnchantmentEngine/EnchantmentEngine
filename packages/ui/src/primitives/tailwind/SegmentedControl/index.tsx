import React, { useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

export interface OptionType {
  value: string | number
  label: string
  selected?: boolean
}

export interface SegmentedControlProps<T = string | number> {
  options: OptionType[]
  onChange: (value: T) => void
  value: T
  layout?: 'single-row' | 'two-row' | 'vertical'
}

const SegmentedControl = ({ options, onChange, value, layout }: SegmentedControlProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLLabelElement>(null)
  const [localValue, setLocalValue] = useState(value)

  return (
    <div className={'flex w-full flex-col gap-y-2'}>
      <div className={'flex w-full'}>
        <div ref={ref} className="relative w-full">
          <div
            tabIndex={0}
            className={twMerge(
              'relative my-0 grid w-full items-center gap-1 rounded-md bg-surface-1 !px-0.5 !py-0.5 focus:outline-none',
              (layout === undefined || layout === 'single-row') && ' grid-flow-col grid-rows-1',
              layout === 'two-row' && ' grid-flow-col grid-rows-2',
              layout === 'vertical' && ' grid-cols-1 '
            )}
            style={
              layout === undefined || layout === 'single-row'
                ? { gridTemplateColumns: `repeat(${options.length}, 1fr)` }
                : undefined
            }
          >
            {options.length > 0 ? (
              options.map(({ value: currentValue, ...optionProps }, index) => (
                <button
                  key={index}
                  className={twMerge(
                    '!mx-0 !my-0 h-full flex-auto rounded-md py-1 text-center text-sm ',
                    currentValue === localValue ? 'bg-surface-4 text-text-primary' : 'bg-surface-2 text-text-inactive'
                  )}
                  onClick={() => {
                    setLocalValue(currentValue)
                    onChange(currentValue)
                  }}
                >
                  {optionProps.label}
                </button>
              ))
            ) : (
              <div className="w-full bg-surface-2 text-center text-text-inactive ">No options available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SegmentedControl
