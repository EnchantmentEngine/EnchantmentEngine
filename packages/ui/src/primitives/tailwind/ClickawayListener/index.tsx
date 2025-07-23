import React from 'react'

import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'

import { getState } from '@ir-engine/hyperflux'
import { useEffect, useRef } from 'react'
import { twMerge } from 'tailwind-merge'

const ClickawayListener = (props: { children: React.ReactNode; onClickOutside: VoidFunction | null }) => {
  const backdropMode = getState(ModalState).backdrop
  const callbackRef = useRef<VoidFunction | null>(null)
  const backdropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!backdropRef.current) return

    const handler = (e: Event) => {
      const element = backdropRef.current
      if (!element) {
        return
      }

      let isClickedInside = false

      for (const child of element.children) {
        if (child.contains(e.target as Node)) {
          isClickedInside = true
          break
        }
      }

      if (!isClickedInside && callbackRef.current) {
        callbackRef.current()
      }
    }

    backdropRef.current.addEventListener('pointerup', handler)

    return () => {
      backdropRef.current?.removeEventListener('pointerup', handler)
    }
  }, [backdropRef.current])

  useEffect(() => {
    callbackRef.current = props.onClickOutside || null
  }, [props.onClickOutside])

  return (
    <div
      ref={backdropRef}
      className={twMerge(
        'fixed inset-0 z-[1000] flex h-full w-full items-center justify-center',
        backdropMode === 'blur' ? 'backdrop-blur-[50px]' : 'bg-transparent/50'
      )}
    >
      {props.children}
    </div>
  )
}

ClickawayListener.displayName = 'ClickawayListener'

ClickawayListener.defaultProps = {
  children: null
}

export default ClickawayListener
