import { motion } from 'motion/react'
import React from 'react'

export interface ToggleProps {
  checked: boolean
  onChange?: () => void
  className?: string
  disabled?: boolean
}

/**
 * A reusable toggle component with motion animation and custom styling
 */
const Toggle: React.FC<ToggleProps> = ({ checked, onChange, className = '', disabled = false }) => {
  return (
    <div className={`relative h-7 w-12 ${className}`}>
      <button
        className={`absolute left-0 top-0 h-7 w-12 rounded-full shadow-md ${
          checked ? 'bg-primary-blue' : 'bg-inactive-input'
        } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        onClick={disabled ? undefined : onChange}
        aria-checked={checked}
        role="switch"
        disabled={disabled}
      />
      <motion.div
        className="shadow-0px_3px_8px_0px_rgba(0,0,0,0.15) pointer-events-none absolute top-[2px] size-6 rounded-full bg-white"
        animate={{
          left: checked ? '22px' : '4px'
        }}
        transition={{
          type: 'tween',
          ease: 'circOut',
          duration: 0.2
        }}
      />
    </div>
  )
}

export default Toggle
