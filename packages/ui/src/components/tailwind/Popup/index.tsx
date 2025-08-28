import React from 'react'
import { Popup as ReactjsPopup } from 'reactjs-popup'
import { PopupProps } from 'reactjs-popup/dist/types'

export const Popup = ({
  trigger,
  keepInside,
  ...props
}: { trigger: React.ReactNode; keepInside?: boolean } & Omit<PopupProps, 'trigger'>) => {
  return (
    <ReactjsPopup
      closeOnDocumentClick
      closeOnEscape
      repositionOnResize
      on={'click'}
      keepTooltipInside={keepInside}
      arrow={false}
      trigger={<div style={{ all: 'unset' }}>{trigger}</div>}
      contentStyle={{ overflow: 'visible' }}
      {...props}
    />
  )
}
