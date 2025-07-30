import { MdError } from 'react-icons/md'

import React from 'react'

import PopUp from './PopUp'

/**
 * ErrorPopup is used to render error message.
 *
 * @param {Object} props
 * @returns {JSX.Element}
 */
export function ErrorPopup(props) {
  if (!props) return null
  return (
    <PopUp
      className="error-pop-up-container"
      iconClassName="error-pop-up-icon-box"
      icon={<MdError className="inline-block shrink-0 text-2xl" />}
      {...props}
    />
  )
}

export default ErrorPopup
