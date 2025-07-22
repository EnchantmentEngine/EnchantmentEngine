import { CheckLg } from '@ir-engine/ui/src/icons'
import { motion } from 'motion/react'
import React from 'react'

interface CheckboxItemProps extends React.PropsWithChildren {
  label?: string
  checked?: boolean
  onClick?: () => void
  disabled?: boolean
}

const CheckboxItem: React.FC<CheckboxItemProps> = ({ label, checked = false, onClick, disabled = false, children }) => {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 text-white/90">
      {children || <span className="font-medium">{label}</span>}
      <div className="relative">
        <button
          className={`relative h-6 w-6 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}
          onClick={disabled ? undefined : onClick}
          aria-checked={checked}
          role="checkbox"
          disabled={disabled}
        >
          {/* Box border that fades out and shrinks when checked */}
          <motion.div
            className="absolute inset-0 rounded-md border-2 border-white"
            initial={false}
            animate={{
              scale: checked ? 0.8 : 1,
              opacity: checked ? 0 : 1
            }}
            transition={{
              type: 'tween',
              ease: 'circOut',
              duration: 0.1
            }}
          />

          {/* Checkmark that appears when checked */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={false}
            animate={{
              scale: checked ? 1 : 0,
              opacity: checked ? 1 : 0
            }}
            transition={{
              type: 'tween',
              ease: 'circOut',
              duration: checked ? 0.15 : 0.1,
              delay: checked ? 0.05 : 0
            }}
          >
            <CheckLg className="h-7 w-7 text-white" strokeWidth={2.5} />
          </motion.div>
        </button>
      </div>
    </div>
  )
}

export default CheckboxItem
