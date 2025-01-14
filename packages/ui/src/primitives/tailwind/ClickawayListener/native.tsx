/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import React, {
  HTMLAttributes,
  MutableRefObject,
  ReactElement,
  RefCallback,
  cloneElement,
  useEffect,
  useRef
} from 'react'

interface Props extends HTMLAttributes<HTMLElement> {
  onClickAway: (event: Event) => void
  children: ReactElement<any>
}

const NativeClickawayListener = ({ children, onClickAway }: Props) => {
  const node = useRef<HTMLElement | null>(null)
  const bubbledEventTarget = useRef<EventTarget | null>(null)
  const mountedRef = useRef(false)

  useEffect(
    /**
     * Prevents the bubbled event from getting triggered immediately
     * https://github.com/facebook/react/issues/20074
     */
    () => {
      setTimeout(() => {
        mountedRef.current = true
      }, 0)
      return () => {
        mountedRef.current = false
      }
    },
    []
  )

  const handleBubbledEvents =
    (type: string) =>
    (event: Event): void => {
      bubbledEventTarget.current = event.target

      const handler = children?.props[type]

      if (handler) {
        handler(event)
      }
    }

  const handleChildRef = (childRef: HTMLElement) => {
    node.current = childRef

    let { ref } = children as typeof children & {
      ref: RefCallback<HTMLElement> | MutableRefObject<HTMLElement>
    }

    if (typeof ref === 'function') {
      ref(childRef)
    } else if (ref) {
      ref.current = childRef
    }
  }

  useEffect(() => {
    const nodeDocument = node.current?.ownerDocument ?? document

    const handleEvents = (event: Event): void => {
      if (!mountedRef.current) return

      if (
        (node.current && node.current.contains(event.target as Node)) ||
        bubbledEventTarget.current === event.target ||
        !nodeDocument.contains(event.target as Node)
      ) {
        return
      }

      onClickAway(event)
    }

    nodeDocument.addEventListener('mousedown', handleEvents)
    nodeDocument.addEventListener('touchend', handleEvents)
    nodeDocument.addEventListener('focusin', handleEvents)

    return () => {
      nodeDocument.removeEventListener('mousedown', handleEvents)
      nodeDocument.removeEventListener('touchend', handleEvents)
      nodeDocument.removeEventListener('focusin', handleEvents)
    }
  }, [onClickAway])

  return React.Children.only(
    cloneElement(children as ReactElement<any>, {
      ref: handleChildRef,
      ['onMouseDown']: handleBubbledEvents('onMouseDown'),
      ['onTouchEnd']: handleBubbledEvents('onTouchEnd'),
      ['onFocus']: handleBubbledEvents('onFocus')
    })
  )
}

NativeClickawayListener.displayName = 'NativeClickawayListener'

export default NativeClickawayListener
