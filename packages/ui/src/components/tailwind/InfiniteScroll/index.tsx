import React, { useEffect, useRef } from 'react'

interface IInfiniteScrollProps {
  onScrollBottom: () => void
  children: React.ReactNode
  disableEvent?: boolean
  threshold?: number
  className?: string
}

export default function InfiniteScroll({
  onScrollBottom,
  threshold = 0.1, // Lower default threshold
  disableEvent,
  children,
  className
}: IInfiniteScrollProps) {
  const observerRef = useRef<HTMLDivElement>(null)
  const hasTriggered = useRef(false)

  useEffect(() => {
    // Reset trigger state when dependencies change
    hasTriggered.current = false

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !disableEvent && !hasTriggered.current) {
          onScrollBottom()
          hasTriggered.current = true

          // Reset the trigger after a short delay to prevent multiple triggers
          setTimeout(() => {
            hasTriggered.current = false
          }, 500)
        }
      },
      { threshold, rootMargin: '100px' } // Add rootMargin to trigger earlier
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [disableEvent, onScrollBottom, threshold])

  return (
    <div className={className}>
      {children}
      <div ref={observerRef} style={{ height: '20px', width: '100%' }} data-testid="infinite-scroll-observer" />
    </div>
  )
}
