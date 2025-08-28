import React, { PropsWithChildren } from 'react'
import { twMerge } from 'tailwind-merge'
import { useOnPressKey } from '../hooks'

export type ModalAction = {
  label: string
  onClick: () => void
}

export type ModalProps = {
  open?: boolean
  onClose: () => void
  title: string
  actions: ModalAction[]
}

export const Modal: React.FC<PropsWithChildren<ModalProps>> = ({ open = false, onClose, title, children, actions }) => {
  useOnPressKey('Escape', onClose)

  if (open === false) return null

  return (
    <>
      <div className="fixed inset-0 z-20 h-full w-full overflow-y-auto bg-transparent" onClick={onClose}></div>
      <div className="border-borderStyle relative top-[2px] z-20 mx-auto w-96 rounded-md border  text-sm text-gray-800 shadow-[0_2px_4px_var(--background2)]">
        <div className="border-b border-gray-600 p-3">
          <h2 className="text-center text-lg font-bold text-white">{title}</h2>
        </div>
        <div className="p-3 text-white">{children}</div>
        <div className="border-grey-600 flex gap-3 border-t p-3">
          {actions.map((action, ix) => (
            <button
              key={ix}
              className={twMerge(
                'w-full cursor-pointer p-2 text-white',
                ix === actions.length - 1 ? 'bg-zinc-700' : 'bg-gray-400'
              )}
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
