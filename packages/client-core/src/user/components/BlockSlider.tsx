import { Slider, SliderProps } from '@ir-engine/ui/editor'
import Tooltip from '@ir-engine/ui/src/primitives/tailwind/Tooltip'
import React from 'react'
import { LuInfo } from 'react-icons/lu'

export default function BlockSlider({
  label,
  info,
  value,
  onChange
}: {
  label: string
  info?: string
  value: SliderProps['value']
  onChange: SliderProps['onChange']
}) {
  console.log(info)
  return (
    <>
      <div className="flex items-center gap-x-4 lg:hidden">
        <span className="w-52 text-right text-sm text-text-tertiary" data-testid="slider-label">
          {label}
          {info && (
            <Tooltip content={info}>
              <div>
                <LuInfo className={'h-5 w-5 text-text-inactive hover:text-text-primary'} />
              </div>
            </Tooltip>
          )}
        </span>
        <div className="w-80">
          <Slider max={1} min={0} step={0.01} value={value} onChange={onChange} onRelease={() => {}} label={''} />
        </div>
      </div>
      <div className="hidden lg:block">
        <Slider
          max={1}
          min={0}
          step={0.01}
          value={value}
          info={info}
          onChange={onChange}
          onRelease={() => {}}
          label={label}
        />
      </div>
    </>
  )
}
