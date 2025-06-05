import { GlassButton } from '@ir-engine/ui/src/components/viewer/Button'
import { motion } from 'motion/react'
import React from 'react'

interface ButtonOption {
  label: string
  onClick: () => void
  isPrimary?: boolean
}

interface ButtonGroupProps {
  options: ButtonOption[]
  className?: string
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({ options, className = '' }) => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        delay: 0.1,
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={`flex w-full max-w-xs flex-col items-center space-y-3 ${className}`}
    >
      {options.map((option, index) => (
        <motion.div key={index} variants={itemVariants} className="w-full">
          <GlassButton
            onClick={option.onClick}
            className="w-full rounded-xl py-3.5 font-medium text-white transition-all hover:scale-105"
          >
            {option.label}
          </GlassButton>
        </motion.div>
      ))}
    </motion.div>
  )
}

export default ButtonGroup
