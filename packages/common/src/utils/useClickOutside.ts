import { useEffect } from 'react'

export const useClickOutside = (
  ref: React.RefObject<HTMLElement>,
  onClickOutsideCallback: (event: MouseEvent) => void
) => {
  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickOutsideCallback(event)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [ref.current])
}

export const useTouchOutside = (
  ref: React.RefObject<HTMLElement>,
  onClickOutsideCallback: (event: TouchEvent) => void
) => {
  useEffect(() => {
    const onClickOutside = (event: TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickOutsideCallback(event)
      }
    }
    document.addEventListener('touchend', onClickOutside)
    return () => document.removeEventListener('touchend', onClickOutside)
  }, [ref.current])
}
