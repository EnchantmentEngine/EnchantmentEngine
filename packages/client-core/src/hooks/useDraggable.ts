import { useEffect, useRef } from 'react'

type Options = {
  targetId: string
  placerId?: string
  topOffset?: number
  targetStartX?: number
  targetStartY?: number
}

export const useDraggable = ({ targetId, placerId = targetId, topOffset = 0, targetStartX, targetStartY }: Options) => {
  const isDragging = useRef<boolean>(false)

  const coords = useRef<{
    startX: number
    startY: number
    lastX: number
    lastY: number
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
    target.style.left = `${targetStartX || 0}px`
    target.style.top = `${targetStartY || 0}px`
    if (!placer) {
      placer = target
    }

    const container = target.parentElement
    if (!container) {
      console.error('Target element must have a parent')
      return
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

    placer.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mouseup', onMouseUp)
    container.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseleave', onMouseUp)

    return () => {
      placer.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mouseup', onMouseUp)
      container.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseUp)
    }
  }, [targetId, placerId])

  return {
    isDragging: isDragging.current,
    startX: coords.current.startX,
    startY: coords.current.startY
  }
}
