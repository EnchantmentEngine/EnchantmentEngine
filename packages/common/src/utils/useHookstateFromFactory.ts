import { useEffect, useState } from 'react'

import { State, useHookstate } from '@ir-engine/hyperflux'

export const useHookstateFromFactory = <T>(cb: (...any) => T): State<T> => {
  const state = useHookstate({} as T)
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    if (mounted) return
    state.set(cb())
    setMounted(true)
    return () => {
      setMounted(false)
    }
  }, [])
  return state
}
