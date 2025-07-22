import { ChevronRightSm } from '@ir-engine/ui/src/icons'
import React from 'react'

interface MenuItemProps {
  label: string
  onClick: () => void
  hasChevron?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  className?: string
}

export const MenuItem: React.FC<MenuItemProps> = ({
  label,
  onClick,
  hasChevron = false,
  leftIcon,
  rightIcon,
  className
}) => (
  <div
    className={`flex cursor-pointer items-center justify-between bg-black/10 px-4 py-3.5 text-white/90 transition-colors hover:bg-black/5 ${className}`}
    onClick={onClick}
  >
    <span className="flex items-center gap-3">
      {leftIcon && <span className="text-white/70">{leftIcon}</span>}
      <span className="text-base font-medium">{label}</span>
    </span>
    <span className="flex items-center gap-3">
      {rightIcon && <span className="text-white/70">{rightIcon}</span>}
      {hasChevron && <ChevronRightSm className="text-white/70" />}
    </span>
  </div>
)
