import React from 'react'

import styleString from './index.scss?inline'

type IconButtonVariant = 'filled' | 'iconOnly'
type IconButtonSize = 'small' | 'medium' | 'large'

const XRIconButton = (props) => {
  const {
    content,
    className,
    backgroundColor,
    size = 'small',
    variant = 'filled',
    ...buttonProps
  }: {
    content: any
    className: any
    backgroundColor: string
    size: IconButtonSize
    variant: IconButtonVariant
    buttonProps: any
  } = props

  return (
    <>
      <style>{styleString}</style>
      <button
        className={`iconButtonContainer ${className} ${variant} ${size}`}
        {...buttonProps}
        style={backgroundColor ? { backgroundColor: backgroundColor, margin: 0 } : { margin: 0 }}
      >
        {content}
      </button>
    </>
  )
}

export default XRIconButton
