import { isShareAvailable } from '@ir-engine/spatial/src/common/functions/DetectFeatures'
import { motion, Variant } from 'motion/react'
import React, { useEffect, useRef } from 'react'
import { useShareMenu } from '../../hooks/useShareMenu'
import { TextButton } from '../Glass/buttons/TextButton'

interface ShareDrawerProps {
  onClose?: () => void
}

export default function ShareDrawer({ onClose }: ShareDrawerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { shareOnApps, shareLink } = useShareMenu()

  const onClickAway = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      onClose?.()
    }
  }

  useEffect(() => {
    if (!ref || !ref.current) return
    const container = ref?.current.parentElement
    container?.addEventListener('click', onClickAway)
    return () => {
      container?.removeEventListener('click', onClickAway)
    }
  }, [ref])

  const variants: Record<string, Variant> = {
    down: {
      y: '100%',
      opacity: 0
    },
    up: {
      y: '0%',
      opacity: 1
    }
  }

  const handleShareByEmail = () => {
    if (isShareAvailable) {
      // Use native Web Share API if available
      shareOnApps()
    } else {
      // Fallback to mailto link
      const subject = encodeURIComponent('Join me in this space!')
      const body = encodeURIComponent(`Check out this space: ${shareLink}`)
      window.open(`mailto:?subject=${subject}&body=${body}`, '_blank')
    }
    onClose?.()
  }

  const handleShareByPhone = () => {
    if (isShareAvailable) {
      // Use native Web Share API if available
      shareOnApps()
    } else {
      // Fallback to SMS link (works on mobile devices)
      const message = encodeURIComponent(`Check out this space: ${shareLink}`)
      window.open(`sms:?body=${message}`, '_blank')
    }
    onClose?.()
  }

  const handleCancel = () => {
    onClose?.()
  }

  return (
    <motion.div
      initial="down"
      animate="up"
      exit="down"
      variants={variants}
      transition={{
        y: { type: 'tween', duration: 0.2 },
        opacity: { duration: 0.2 }
      }}
      className="absolute bottom-0 w-full rounded-t-2xl bg-gray-800"
      ref={ref}
    >
      <div className="flex flex-col gap-3 p-6">
        {/* Share by Email Button */}
        <TextButton onClick={handleShareByEmail} className="w-full" fade={'lighter'}>
          Share by Email
        </TextButton>

        {/* Share by Phone Button */}
        <TextButton onClick={handleShareByPhone} className="w-full" fade={'lighter'}>
          Share by Phone
        </TextButton>

        {/* Cancel Button */}
        <TextButton onClick={handleCancel} className="w-full" fade={'clear'}>
          Cancel
        </TextButton>
      </div>
    </motion.div>
  )
}
