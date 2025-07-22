import React, { useRef } from 'react'
import Popup from 'reactjs-popup'
import { PopupActions, PopupPosition } from 'reactjs-popup/dist/types'
import { twMerge } from 'tailwind-merge'
import { Button } from '../../..'
import { DotsHorizontalLg, DotsVerticalLg } from '../../../icons'

interface MoreOptionsMenuProps {
  disabled?: boolean
  direction?: 'horizontal' | 'vertical'
  actionProps: {
    icon?: React.ReactNode
    label: string
    onClick: () => void
    disabled?: boolean
  }[]
  position?: PopupPosition | PopupPosition[] | undefined
}

export default function MoreOptionsMenu({
  disabled,
  actionProps,
  position,
  direction = 'vertical'
}: MoreOptionsMenuProps) {
  const popupRef = useRef<PopupActions>(null)

  const closePopup = () => {
    if (popupRef.current) {
      popupRef.current.close()
    }
  }

  return (
    <Popup
      trigger={
        <Button
          variant="tertiary"
          size="sm"
          className="border-0 px-2 py-1.5"
          data-testid="more-options-button"
          disabled={disabled}
        >
          {direction === 'vertical' && <DotsVerticalLg className="text-xl text-text-primary" />}
          {direction === 'horizontal' && <DotsHorizontalLg className="text-xl text-text-primary" />}
        </Button>
      }
      ref={popupRef}
      position={position ? position : 'left bottom'}
      on="click"
      closeOnDocumentClick
      arrow={false}
      repositionOnResize={true}
      contentStyle={{ padding: '0px', border: 'none' }}
    >
      <ul
        className={twMerge(
          'min-w-[180px] max-w-[300px] divide-y divide-gray-300 overflow-hidden rounded-lg border border-ui-tertiary',
          'bg-white dark:divide-none dark:border-none dark:bg-surface-4'
        )}
        data-testid="more-options-list"
      >
        {actionProps.map((actionProp, index) => (
          <li className="h-8 overflow-hidden rounded-none first:rounded-t-lg last:rounded-b-lg" key={index}>
            <Button
              variant="tertiary"
              className="h-full w-full justify-start gap-2 whitespace-nowrap rounded-none border-0 p-2 text-text-primary hover:bg-ui-hover-quadrary"
              data-testid={`${actionProp.label.toLowerCase().replace(' ', '-')}-button`}
              disabled={actionProp.disabled}
              onClick={() => {
                closePopup()
                actionProp.onClick()
              }}
            >
              {actionProp.icon}
              {actionProp.label}
            </Button>
          </li>
        ))}
      </ul>
    </Popup>
  )
}
