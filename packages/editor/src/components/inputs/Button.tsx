import React from 'react'

import './Button.css'

/**
 * Button used to provide styles to button input.
 *
 * @type {Component}
 */
export const Button = ({
  type = 'button' as 'button' | 'submit' | 'reset',
  onClick,
  children,
  className = '',
  ...rest
}) => {
  const buttonClass = `button ${className}`
  return (
    <button type={type} className={buttonClass} onClick={onClick} {...rest}>
      {children}
    </button>
  )
}
/**
 * MediumButton used to create medium size button.
 *
 * @type {Component}
 */
export const MediumButton = ({
  type = 'button' as 'button' | 'submit' | 'reset',
  onClick,
  children,
  className = 'button',
  ...rest
}) => {
  const buttonClass = `medium-button ${className}`
  return (
    <button type={type} className={buttonClass} onClick={onClick} {...rest}>
      {children}
    </button>
  )
}
