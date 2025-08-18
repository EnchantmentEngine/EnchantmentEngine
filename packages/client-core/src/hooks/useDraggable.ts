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
    initialAnchorDistanceX?: number
    initialAnchorDistanceY?: number
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

    // Store initial anchor distances for proper positioning
    const storeInitialAnchorDistances = () => {
      if (anchor) {
        const parentRect = container.getBoundingClientRect()
        const targetRect = target.getBoundingClientRect()

        switch (anchor) {
          case 'left':
          case 'top-left':
          case 'bottom-left':
            coords.current.initialAnchorDistanceX = initialX
            coords.current.anchorDistanceX = initialX
            break
          case 'right':
          case 'top-right':
          case 'bottom-right':
            coords.current.initialAnchorDistanceX = parentRect.width - targetRect.width - initialX
            coords.current.anchorDistanceX = parentRect.width - targetRect.width - initialX
            break
          case 'center':
            coords.current.initialAnchorDistanceX = (parentRect.width - targetRect.width) / 2 - initialX
            coords.current.anchorDistanceX = (parentRect.width - targetRect.width) / 2 - initialX
            break
        }

        switch (anchor) {
          case 'top':
          case 'top-left':
          case 'top-right':
            coords.current.initialAnchorDistanceY = initialY
            coords.current.anchorDistanceY = initialY
            break
          case 'bottom':
          case 'bottom-left':
          case 'bottom-right':
            coords.current.initialAnchorDistanceY = parentRect.height - targetRect.height - initialY
            coords.current.anchorDistanceY = parentRect.height - targetRect.height - initialY
            break
          case 'center':
            coords.current.initialAnchorDistanceY = (parentRect.height - targetRect.height) / 2 - initialY
            coords.current.anchorDistanceY = (parentRect.height - targetRect.height) / 2 - initialY
            break
        }
      }
    }

    // Store initial anchor distances
    storeInitialAnchorDistances()

    // Function to maintain anchor position
    const maintainAnchorPosition = () => {
      if (!anchor) return

      const parentRect = container.getBoundingClientRect()
      const targetRect = target.getBoundingClientRect()

      const maxX = parentRect.width - targetRect.width
      const maxY = parentRect.height - targetRect.height

      let newX = target.offsetLeft
      let newY = target.offsetTop

      // Use stored anchor distances to maintain relative position
      switch (anchor) {
        case 'left':
          newX = Math.max(0, Math.min(coords.current.anchorDistanceX || 0, maxX))
          break
        case 'right':
          newX = Math.max(
            0,
            Math.min(parentRect.width - targetRect.width - (coords.current.anchorDistanceX || 0), maxX)
          )
          break
        case 'top':
          newY = Math.max(0, Math.min(coords.current.anchorDistanceY || 0, maxY))
          break
        case 'bottom':
          newY = Math.max(
            0,
            Math.min(parentRect.height - targetRect.height - (coords.current.anchorDistanceY || 0), maxY)
          )
          break
        case 'top-left':
          newX = Math.max(0, Math.min(coords.current.anchorDistanceX || 0, maxX))
          newY = Math.max(0, Math.min(coords.current.anchorDistanceY || 0, maxY))
          break
        case 'top-right':
          newX = Math.max(
            0,
            Math.min(parentRect.width - targetRect.width - (coords.current.anchorDistanceX || 0), maxX)
          )
          newY = Math.max(0, Math.min(coords.current.anchorDistanceY || 0, maxY))
          break
        case 'bottom-left':
          newX = Math.max(0, Math.min(coords.current.anchorDistanceX || 0, maxX))
          newY = Math.max(
            0,
            Math.min(parentRect.height - targetRect.height - (coords.current.anchorDistanceY || 0), maxY)
          )
          break
        case 'bottom-right':
          newX = Math.max(
            0,
            Math.min(parentRect.width - targetRect.width - (coords.current.anchorDistanceX || 0), maxX)
          )
          newY = Math.max(
            0,
            Math.min(parentRect.height - targetRect.height - (coords.current.anchorDistanceY || 0), maxY)
          )
          break
        case 'center':
          newX = Math.max(0, Math.min((parentRect.width - targetRect.width) / 2, maxX))
          newY = Math.max(0, Math.min((parentRect.height - targetRect.height) / 2, maxY))
          break
      }

      // Update position if changed
      if (newX !== target.offsetLeft) {
        target.style.left = `${newX}px`
        coords.current.lastX = newX
      }
      if (newY !== target.offsetTop) {
        target.style.top = `${newY}px`
        coords.current.lastY = newY
      }
    }

    // Function to constrain element within parent boundaries
    const constrainToParent = () => {
      const parentRect = container.getBoundingClientRect()
      const targetRect = target.getBoundingClientRect()

      const maxX = parentRect.width - targetRect.width
      const maxY = parentRect.height - targetRect.height

      const currentX = target.offsetLeft
      const currentY = target.offsetTop

      // Handle anchoring to different positions
      if (anchor) {
        maintainAnchorPosition()
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

      // Update anchor distances after manual dragging to maintain new relative position
      if (anchor) {
        const parentRect = container.getBoundingClientRect()
        const targetRect = target.getBoundingClientRect()

        switch (anchor) {
          case 'left':
          case 'top-left':
          case 'bottom-left':
            coords.current.anchorDistanceX = target.offsetLeft
            break
          case 'right':
          case 'top-right':
          case 'bottom-right':
            coords.current.anchorDistanceX = parentRect.width - targetRect.width - target.offsetLeft
            break
          case 'center':
            coords.current.anchorDistanceX = (parentRect.width - targetRect.width) / 2 - target.offsetLeft
            break
        }

        switch (anchor) {
          case 'top':
          case 'top-left':
          case 'top-right':
            coords.current.anchorDistanceY = target.offsetTop
            break
          case 'bottom':
          case 'bottom-left':
          case 'bottom-right':
            coords.current.anchorDistanceY = parentRect.height - targetRect.height - target.offsetTop
            break
          case 'center':
            coords.current.anchorDistanceY = (parentRect.height - targetRect.height) / 2 - target.offsetTop
            break
        }
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
        maintainAnchorPosition()
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
  }, [targetId, placerId, anchor, targetStartX, targetStartY, topOffset])

  return {
    isDragging: isDragging.current,
    startX: coords.current.startX,
    startY: coords.current.startY
  }
}
