import React, { useEffect, useState } from 'react'
import { MdInfo } from 'react-icons/md'

import './PopUp.css'

// Import the external CSS file

const PopUp = ({
  tag,
  message,
  visibleDuration = 3000,
  icon = <MdInfo className="inline-block shrink-0 text-2xl" />,
  className
}) => {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
    }, visibleDuration)

    return () => clearTimeout(timer)
  }, [visibleDuration])

  return (
    <div className={`popup-container ${className}`} style={{ opacity: visible ? 1 : 0 }}>
      <div className={`popup-icon-box ${className}`}>{icon}</div>
      <div className={`popup-content ${className}`}>{message}</div>
    </div>
  )
}

export default PopUp
