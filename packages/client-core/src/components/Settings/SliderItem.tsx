import Slider from '@ir-engine/ui/src/components/viewer/Slider'
import React from 'react'

interface SliderItemProps {
  label: string
  value?: number | undefined
  defaultValue?: number
  min?: number
  max?: number
  step?: number
  onChange?: (value: number) => void
}

const SliderItem: React.FC<SliderItemProps> = ({ label, value = 0, onChange, min = 0, max = 100, step = 1 }) => {
  return (
    <div className="flex items-center justify-between bg-black/10 px-4 py-3.5 text-white/90">
      <span className="flex-1 text-base font-medium">{label}</span>
      <div className="flex flex-1 items-center space-x-3">
        <Slider value={value} min={min} max={max} step={step} onChange={onChange} />
      </div>
    </div>
  )
}

export default SliderItem
