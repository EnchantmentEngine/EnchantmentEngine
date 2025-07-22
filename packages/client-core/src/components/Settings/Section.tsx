import React from 'react'

export interface SectionProps {
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

export const Section: React.FC<SectionProps> = ({ children, className = '', disabled }) => (
  <div
    className={`
      overflow-hidden rounded-xl border border-white/10 
      bg-gradient-to-bl from-white/10 to-transparent font-dm-sans  
      text-xs
      tracking-wide shadow-sm md:text-base
      ${disabled ? 'pointer-events-none opacity-50' : ''} 
      ${className} 
    `}
  >
    {children}
  </div>
)
