import { useHookstate } from '@ir-engine/hyperflux'
import React, { useEffect, useRef } from 'react'
import { Popup as ReactjsPopup } from 'reactjs-popup'
import { PopupProps } from 'reactjs-popup/dist/types'

function adjustOffset(rect: DOMRect, offsetX: number, offsetY: number, thresholdX = 10, thresholdY = 15) {
  let x = offsetX,
    y = offsetY
  if (rect.top < 0) {
    y += rect.top - thresholdY
  }
  if (rect.left < 0) {
    x += rect.left - thresholdX
  }
  if (rect.bottom > window.innerHeight) {
    y -= rect.bottom - window.innerHeight + thresholdY
  }
  if (rect.right > window.innerWidth) {
    x -= rect.right - window.innerWidth + thresholdX
  }

  return { x, y }
}

const ShowContextMenu = ({
  anchorEvent,
  children,
  ...props
}: { onClose: () => void; anchorEvent: React.MouseEvent } & Omit<PopupProps, 'trigger' | 'onClose'>) => {
  const offset = useHookstate({ x: anchorEvent.clientX, y: anchorEvent.clientY })
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current) return

    offset.set(adjustOffset(ref.current.getBoundingClientRect(), offset.x.value, offset.y.value))
  }, [])

  return (
    <ReactjsPopup
      open
      closeOnDocumentClick
      closeOnEscape
      repositionOnResize
      arrow={false}
      on={'click'}
      offsetX={offset.x.value}
      offsetY={offset.y.value}
      {...props}
    >
      <div
        ref={ref}
        style={{ all: 'unset', position: 'fixed', left: offset.x.value + 'px', top: offset.y.value + 'px' }}
      >
        {children}
      </div>
    </ReactjsPopup>
  )
}

export const ContextMenu = ({
  anchorEvent,
  children,
  ...props
}: { onClose: () => void; anchorEvent?: React.MouseEvent } & Omit<PopupProps, 'trigger' | 'onClose'>) => {
  return anchorEvent ? <ShowContextMenu anchorEvent={anchorEvent} children={children} {...props} /> : null
}
