import { useEffect, useRef } from 'react'

type AnchorPosition =
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'center'

type Options = {
  targetId: string
  placerId?: string
  topOffset?: number
  targetStartX?: number
  targetStartY?: number
  anchor?: AnchorPosition
}

export const useDraggable = ({
  targetId,
  placerId = targetId,
  topOffset = 0,
  targetStartX,
  targetStartY,
  anchor
}: Options) => {
  const isDragging = useRef<boolean>(false)

  const coords = useRef<{
    startX: number
    startY: number
    lastX: number
    lastY: number
    anchorDistanceX?: number
    anchorDistanceY?: number
  }>({
    startX: targetStartX || 0,
    startY: targetStartY || 0,
    lastX: targetStartX || 0,
    lastY: (targetStartY && targetStartY + topOffset) || 0
  })

  useEffect(() => {
    const target = document.getElementById(targetId)
    let placer = document.getElementById(placerId)
    if (!target) {
      console.error("Element with given id doesn't exist")
      return
    }
    target.style.marginTop = `${topOffset}px`

    const container = target.parentElement
    if (!container) {
      console.error('Target element must have a parent')
      return
    }

    // Calculate initial position relative to anchor
    const calculateInitialPosition = () => {
      const parentRect = container.getBoundingClientRect()
      const targetRect = target.getBoundingClientRect()

      let initialX = targetStartX || 0
      let initialY = targetStartY || 0

      if (anchor) {
        switch (anchor) {
          case 'left':
            // targetStartX is distance from left edge
            initialX = targetStartX || 0
            break
          case 'right':
            // targetStartX is distance from right edge
            initialX = parentRect.width - targetRect.width - (targetStartX || 0)
            break
          case 'top':
            // targetStartY is distance from top edge
            initialY = targetStartY || 0
            break
          case 'bottom':
            // targetStartY is distance from bottom edge
            initialY = parentRect.height - targetRect.height - (targetStartY || 0)
            break
          case 'top-left':
            // targetStartX is distance from left, targetStartY is distance from top
            initialX = targetStartX || 0
            initialY = targetStartY || 0
            break
          case 'top-right':
            // targetStartX is distance from right, targetStartY is distance from top
            initialX = parentRect.width - targetRect.width - (targetStartX || 0)
            initialY = targetStartY || 0
            break
          case 'bottom-left':
            // targetStartX is distance from left, targetStartY is distance from bottom
            initialX = targetStartX || 0
            initialY = parentRect.height - targetRect.height - (targetStartY || 0)
            break
          case 'bottom-right':
            // targetStartX is distance from right, targetStartY is distance from bottom
            initialX = parentRect.width - targetRect.width - (targetStartX || 0)
            initialY = parentRect.height - targetRect.height - (targetStartY || 0)
            break
          case 'center':
            // Center the element, ignore targetStartX/Y
            initialX = (parentRect.width - targetRect.width) / 2
            initialY = (parentRect.height - targetRect.height) / 2
            break
        }
      }

      // Constrain to parent boundaries
      const maxX = parentRect.width - targetRect.width
      const maxY = parentRect.height - targetRect.height

      initialX = Math.max(0, Math.min(initialX, maxX))
      initialY = Math.max(0, Math.min(initialY, maxY))

      return { initialX, initialY }
    }

    const { initialX, initialY } = calculateInitialPosition()

    target.style.left = `${initialX}px`
    target.style.top = `${initialY}px`

    if (!placer) {
      placer = target
    }

    // Function to constrain element within parent boundaries
    const constrainToParent = () => {
      const parentRect = container.getBoundingClientRect()
      const targetRect = target.getBoundingClientRect()

      const maxX = parentRect.width - targetRect.width
      const maxY = parentRect.height - targetRect.height

      let currentX = target.offsetLeft
      let currentY = target.offsetTop

      // Handle anchoring to different positions
      if (anchor) {
        let newX = currentX
        let newY = currentY

        // Initialize anchor distances if not set
        if (coords.current.anchorDistanceX === undefined) {
          coords.current.anchorDistanceX = currentX
        }
        if (coords.current.anchorDistanceY === undefined) {
          coords.current.anchorDistanceY = currentY
        }

        switch (anchor) {
          case 'left':
            // Keep original distance from left edge
            newX = Math.max(0, Math.min(coords.current.anchorDistanceX, maxX))
            break
          case 'right':
            // Keep original distance from right edge
            const originalRightDistance = parentRect.width - targetRect.width - coords.current.anchorDistanceX
            newX = Math.max(0, Math.min(parentRect.width - targetRect.width - originalRightDistance, maxX))
            break
          case 'top':
            // Keep original distance from top edge
            newY = Math.max(0, Math.min(coords.current.anchorDistanceY, maxY))
            break
          case 'bottom':
            // Keep original distance from bottom edge
            const originalBottomDistance = parentRect.height - targetRect.height - coords.current.anchorDistanceY
            newY = Math.max(0, Math.min(parentRect.height - targetRect.height - originalBottomDistance, maxY))
            break
          case 'top-left':
            newX = Math.max(0, Math.min(coords.current.anchorDistanceX, maxX))
            newY = Math.max(0, Math.min(coords.current.anchorDistanceY, maxY))
            break
          case 'top-right':
            const originalRightDist = parentRect.width - targetRect.width - coords.current.anchorDistanceX
            newX = Math.max(0, Math.min(parentRect.width - targetRect.width - originalRightDist, maxX))
            newY = Math.max(0, Math.min(coords.current.anchorDistanceY, maxY))
            break
          case 'bottom-left':
            newX = Math.max(0, Math.min(coords.current.anchorDistanceX, maxX))
            const originalBottomDist = parentRect.height - targetRect.height - coords.current.anchorDistanceY
            newY = Math.max(0, Math.min(parentRect.height - targetRect.height - originalBottomDist, maxY))
            break
          case 'bottom-right':
            const originalRightDistBR = parentRect.width - targetRect.width - coords.current.anchorDistanceX
            const originalBottomDistBR = parentRect.height - targetRect.height - coords.current.anchorDistanceY
            newX = Math.max(0, Math.min(parentRect.width - targetRect.width - originalRightDistBR, maxX))
            newY = Math.max(0, Math.min(parentRect.height - targetRect.height - originalBottomDistBR, maxY))
            break
          case 'center':
            // Center the element
            newX = Math.max(0, Math.min((parentRect.width - targetRect.width) / 2, maxX))
            newY = Math.max(0, Math.min((parentRect.height - targetRect.height) / 2, maxY))
            break
        }

        // Update position if changed
        if (newX !== currentX) {
          target.style.left = `${newX}px`
          coords.current.lastX = newX
        }
        if (newY !== currentY) {
          target.style.top = `${newY}px`
          coords.current.lastY = newY
        }
      } else {
        // Constrain to parent boundaries (no anchoring)
        const constrainedX = Math.max(0, Math.min(currentX, maxX))
        const constrainedY = Math.max(0, Math.min(currentY, maxY))

        // Only update position if it actually changed
        if (constrainedX !== currentX) {
          target.style.left = `${constrainedX}px`
          coords.current.lastX = constrainedX
        }

        if (constrainedY !== currentY) {
          target.style.top = `${constrainedY}px`
          coords.current.lastY = constrainedY
        }
      }
    }

    const onMouseDown = (e: MouseEvent) => {
      isDragging.current = true
      coords.current.startX = e.clientX
      coords.current.startY = e.clientY + topOffset
      document.body.style.userSelect = 'none'
      placer!.style.cursor = 'grabbing'
    }

    const onMouseUp = () => {
      isDragging.current = false
      coords.current.lastX = target.offsetLeft
      coords.current.lastY = target.offsetTop

      // Update anchor distances after manual dragging
      if (anchor) {
        coords.current.anchorDistanceX = target.offsetLeft
        coords.current.anchorDistanceY = target.offsetTop
      }

      document.body.style.userSelect = 'auto'
      placer!.style.cursor = 'grab'
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return

      const parentRect = container.getBoundingClientRect()
      const targetRect = target.getBoundingClientRect()

      const maxX = parentRect.width - targetRect.width
      const maxY = parentRect.height - targetRect.height

      let nextX = e.clientX - coords.current.startX + coords.current.lastX
      let nextY = e.clientY - coords.current.startY + coords.current.lastY

      nextX = Math.max(0, Math.min(nextX, maxX))
      nextY = Math.max(0, Math.min(nextY, maxY))

      target.style.top = `${nextY}px`
      target.style.left = `${nextX}px`
    }

    // Resize observer to handle parent container resizing
    const resizeObserver = new ResizeObserver(() => {
      if (!isDragging.current) {
        constrainToParent()
      }
    })
    resizeObserver.observe(container)

    placer.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mouseup', onMouseUp)
    container.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseleave', onMouseUp)

    return () => {
      placer.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mouseup', onMouseUp)
      container.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseUp)
      resizeObserver.disconnect()
    }
  }, [targetId, placerId])

  return {
    isDragging: isDragging.current,
    startX: coords.current.startX,
    startY: coords.current.startY
  }
}
