import { motion } from 'motion/react'
import React from 'react'
import { TextButton } from '../Glass/buttons/TextButton'

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
      className={`flex w-full max-w-xs flex-col items-center gap-6 ${className}`}
    >
      {options.map((option, index) => (
        <motion.div key={index} variants={itemVariants} className="w-full">
          <TextButton
            fade={`dark`}
            onClick={option.onClick}
            className="w-full text-sm text-white transition-all hover:scale-105"
          >
            {option.label}
          </TextButton>
        </motion.div>
      ))}
    </motion.div>
  )
}

export default ButtonGroup
