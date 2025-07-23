import React from 'react'

import styleString from './index.scss?inline'

type TextButtonVariant = 'filled' | 'outlined' | 'gradient'

const XRTextButton = (props) => {
  const {
    variant = 'filled',
    className,
    children,
    ...buttonProps
  }: { variant: TextButtonVariant; className: any; content: any; children: React.ReactNode; buttonProps: any } = props

  return (
    <>
      <style>{styleString}</style>
      <button {...buttonProps} className={`buttonContainer ${className} ${variant}`}>
        {children}
      </button>
    </>
  )
}

export default XRTextButton
