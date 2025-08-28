import Select, { SelectProps } from '@ir-engine/ui/src/primitives/tailwind/Select'
import Tooltip, { TooltipProps, TooltipRef } from '@ir-engine/ui/src/primitives/tailwind/Tooltip'
import React, { ReactNode, useEffect, useRef, useState } from 'react'

interface TransformSpaceToolProps extends SelectProps {
  tooltipTitle?: string
  tooltipContent: ReactNode
  tooltipPosition?: TooltipProps['position']
  dropdownParentClassName?: string
}

function ToolbarDropdown({
  tooltipTitle,
  tooltipContent,
  tooltipPosition = 'bottom',
  dropdownParentClassName,
  ...props
}: TransformSpaceToolProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const ref = useRef<TooltipRef>(null)

  useEffect(() => {
    if (dropdownOpen) {
      ref.current?.hideTooltip()
    }
  }, [dropdownOpen])

  const onMouseEnter = () => {
    if (dropdownOpen) {
      return false
    }
    return true
  }

  const onMouseLeave = () => {
    return false
  }

  return (
    <Tooltip
      title={tooltipTitle}
      content={tooltipContent}
      isControlled={true}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      position={tooltipPosition}
      ref={ref}
    >
      <div className={dropdownParentClassName}>
        <Select {...props} onOpen={(isOpen) => setDropdownOpen(isOpen)} />
      </div>
    </Tooltip>
  )
}

export default ToolbarDropdown
