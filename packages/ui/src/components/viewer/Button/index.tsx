import React from 'react'
import { twMerge } from 'tailwind-merge'

export const GlassButton = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { className } = props
  const style = `
  flex items-center justify-center mt-6 w-[80%] rounded-full border border-white/20 bg-white/15 px-6 py-4 text-lg font-bold text-white/90 shadow-lg drop-shadow-xl backdrop-blur-sm
  `
  return <button {...props} className={twMerge(className, style)} />
}
