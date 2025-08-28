import { ColorResult } from '@uiw/color-convert'
import SketchPicker from '@uiw/react-color-sketch'
import React, { useEffect, useRef, useState } from 'react'
import { Color, ColorRepresentation } from 'three'

import { twMerge } from 'tailwind-merge'
import Text from '../Text'

interface ColorInputProp {
  value: ColorRepresentation
  onChange: (color: Color) => void
  onRelease?: (color: Color) => void
  disabled?: boolean
  isValueAsInteger?: boolean
  className?: string
  textClassName?: string
  sketchPickerClassName?: string
}

export function ColorInput({
  value,
  onChange,
  onRelease,
  disabled,
  className,
  textClassName,
  sketchPickerClassName
}: ColorInputProp) {
  let color = new Color(value)
  const hexColor = '#' + color.getHexString()
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLDivElement>(null)
  const [openUp, setOpenUp] = useState<boolean>(false)

  const handleTogglePicker = () => {
    if (!isPickerOpen) {
      setIsPickerOpen(true)
    }
    handleRelease()
  }

  const handleRelease = () => {
    onRelease && onRelease(color)
  }

  const handleChange = (result: ColorResult) => {
    color = new Color(result.hex)
    onChange(color)
  }

  // Close the picker if clicking outside the input or picker - this method didn't require a new signature
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target) &&
        pickerRef.current &&
        !pickerRef.current.contains(event.target)
      ) {
        setIsPickerOpen(false)
        handleRelease()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [hexColor, onRelease])

  // Color picker to pop up depending on placement of the window's inner
  useEffect(() => {
    if (!pickerRef.current) return

    const rect = pickerRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top

    setOpenUp(spaceBelow < 300 && spaceAbove > 300)
  }, [pickerRef.current])

  return (
    <div
      tabIndex={0} // Make the div focusable
      ref={inputRef} // Ref to track focus on the input
      className={twMerge(
        'relative flex h-9 items-center gap-1 rounded-lg border-none bg-[#1A1A1A] px-2 text-xs text-[#8B8B8D]',
        disabled && 'cursor-not-allowed',
        className
      )}
      onClick={handleTogglePicker} //opens the color picker
    >
      <div
        className={`focus: group h-5 w-5 cursor-pointer rounded border border-black`}
        style={{ backgroundColor: hexColor }}
      >
        {isPickerOpen && ( //state to track open/close of color picker
          <div ref={pickerRef}>
            <SketchPicker
              className={twMerge('absolute right-4 z-10 mt-5 ', openUp ? 'bottom-full' : 'mt-5', sketchPickerClassName)}
              color={hexColor}
              onChange={handleChange}
              disableAlpha={true}
              onPointerLeave={() => {
                handleRelease()
              }}
            />
          </div>
        )}
      </div>
      <Text fontSize="xs" className={textClassName}>
        {hexColor.toUpperCase()}
      </Text>
    </div>
  )
}

ColorInput.defaultProps = {
  value: new Color(),
  onChange: () => {}
}

export default ColorInput
