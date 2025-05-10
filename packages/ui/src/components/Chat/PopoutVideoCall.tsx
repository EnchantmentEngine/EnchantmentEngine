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

import { getMutableState, useHookstate } from '@ir-engine/hyperflux'
import { MediaSessionState } from '@ir-engine/ui/src/pages/Chat/MediaSessionState'
import { Resizable } from 're-resizable'
import React, { memo, useEffect, useRef, useState } from 'react'
import { MdClose } from 'react-icons/md'
import { MediaCall } from './VideoCall'

// Memoized MediaCall component to prevent unnecessary re-renders during resize
const MemoizedMediaCall = memo(MediaCall)

export const PopoutVideoCall: React.FC = () => {
  const mediaSessionState = useHookstate(getMutableState(MediaSessionState))
  const popoutRef = useRef<HTMLDivElement>(null)
  const dragHandleRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  // Get position and size from state
  const position = mediaSessionState.popoutPosition.value
  const size = mediaSessionState.popoutSize.value

  // Store the current size in a ref to avoid re-renders during resize
  const sizeRef = useRef(size)

  // Handle close popout
  const handleClosePopout = () => {
    mediaSessionState.isPopout.set(false)
  }

  // Handle dragging
  useEffect(() => {
    const popoutElement = popoutRef.current
    const dragHandle = dragHandleRef.current

    if (!popoutElement || !dragHandle) return

    let startX = 0
    let startY = 0
    let startLeft = 0
    let startTop = 0

    const handleMouseDown = (e: MouseEvent) => {
      // Only start dragging if clicking on the drag handle
      if (e.target instanceof Node && dragHandle.contains(e.target)) {
        e.preventDefault()
        setIsDragging(true)

        startX = e.clientX
        startY = e.clientY
        startLeft = popoutElement.offsetLeft
        startTop = popoutElement.offsetTop

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      const dx = e.clientX - startX
      const dy = e.clientY - startY

      const newLeft = startLeft + dx
      const newTop = startTop + dy

      // Update position in state
      mediaSessionState.popoutPosition.set({
        x: newLeft,
        y: newTop
      })

      // Update position of element directly for smooth dragging
      popoutElement.style.left = `${newLeft}px`
      popoutElement.style.top = `${newTop}px`
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    dragHandle.addEventListener('mousedown', handleMouseDown)

    return () => {
      dragHandle.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  // Set initial position
  useEffect(() => {
    if (popoutRef.current) {
      popoutRef.current.style.left = `${position.x}px`
      popoutRef.current.style.top = `${position.y}px`
    }
  }, [])

  // Update sizeRef when size changes outside of resizing
  useEffect(() => {
    if (!isResizing) {
      sizeRef.current = size
    }
  }, [size, isResizing])

  return (
    <div
      ref={popoutRef}
      className="pointer-events-auto fixed z-50 select-none rounded-lg bg-white shadow-lg"
      style={{
        width: `${size.width}px`,
        height: `${size.height}px`,
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    >
      {/* Drag handle / Header */}
      <div
        ref={dragHandleRef}
        className="pointer-events-auto flex h-10 cursor-move select-none items-center justify-between rounded-t-lg bg-gray-100 px-4"
      >
        <div className="text-sm font-medium text-gray-700">Video Call</div>
        <div className="flex space-x-2">
          <button
            className="pointer-events-auto flex h-6 w-6 items-center justify-center rounded-full hover:bg-gray-200"
            onClick={handleClosePopout}
            title="Close popout"
          >
            <MdClose className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Resizable content */}
      <Resizable
        size={{ width: size.width, height: size.height - 40 }} // Subtract header height
        onResizeStart={() => {
          // Set resizing state to true when resize starts
          setIsResizing(true)
          // Store current size in ref
          sizeRef.current = size
        }}
        onResize={(_e, _direction, _ref, d) => {
          // If resizing from left or bottom-left, update position in real-time
          if (_direction === 'left' || _direction === 'bottomLeft') {
            const newX = position.x + d.width
            if (popoutRef.current) {
              popoutRef.current.style.left = `${newX}px`
            }
          }

          // Update the container size directly during resize without re-rendering
          if (contentRef.current) {
            const newWidth = sizeRef.current.width + d.width
            const newHeight = sizeRef.current.height - 40 + d.height
            contentRef.current.style.width = `${newWidth}px`
            contentRef.current.style.height = `${newHeight}px`
          }
        }}
        onResizeStop={(_e, _direction, _ref, d) => {
          // Set resizing state to false when resize ends
          setIsResizing(false)

          // Calculate new dimensions
          const newWidth = sizeRef.current.width + d.width
          const newHeight = sizeRef.current.height + d.height

          // Update size in state
          mediaSessionState.popoutSize.set({
            width: newWidth,
            height: newHeight
          })

          // If resizing from left or bottom-left, we need to update position too
          if (_direction === 'left' || _direction === 'bottomLeft') {
            const newX = position.x + d.width
            mediaSessionState.popoutPosition.set({
              x: newX,
              y: position.y
            })

            // Update position directly for immediate visual feedback
            if (popoutRef.current) {
              popoutRef.current.style.left = `${newX}px`
            }
          }
        }}
        minWidth={300}
        minHeight={200}
        maxWidth={1200}
        maxHeight={900}
        enable={{
          top: false,
          right: true,
          bottom: true,
          left: true,
          topRight: false,
          bottomRight: true,
          bottomLeft: true,
          topLeft: false
        }}
        className="pointer-events-auto select-none overflow-hidden"
      >
        <div
          ref={contentRef}
          className="pointer-events-auto h-full w-full select-none"
          style={{
            width: `${size.width}px`,
            height: `${size.height - 40}px`
          }}
        >
          <MemoizedMediaCall />
        </div>
      </Resizable>
    </div>
  )
}

export default PopoutVideoCall
