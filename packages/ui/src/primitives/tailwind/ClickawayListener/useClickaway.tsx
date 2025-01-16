import { useEffect, useLayoutEffect, useRef } from 'react'

export default function useClickAway(cb: (e: Event) => void) {
  const ref = useRef(null)
  const refCb = useRef(cb)

  useLayoutEffect(() => {
    refCb.current = cb
  })

  useEffect(() => {
    const handler = (e: Event) => {
      const element = ref.current
      if (element && !(element as any).contains(e.target)) {
        refCb.current(e)
      }
    }

    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)

    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [])

  return ref
}
