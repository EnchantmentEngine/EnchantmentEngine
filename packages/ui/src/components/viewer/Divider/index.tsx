import React from 'react'

export interface DividerProps {
  className?: string
  width?: string
}

/**
 * Divider component for separating items within sections
 * Uses a centered, rounded horizontal line with customizable width and opacity
 */
const Divider: React.FC<DividerProps> = ({ className = '' }) => (
  <div className={`mx-auto h-px w-[80%] rounded-full bg-white/10 ${className}`} />
)

export default Divider
