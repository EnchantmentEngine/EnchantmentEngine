import { useEffect, useRef } from 'react'

import { StateMethods } from '../functions/StateFunctions'

export const usePrevious = <T>(value: StateMethods<T, object>) => {
  const ref = useRef(null as T | null)
  useEffect(() => {
    ref.current = value.value as T
  }, [value])
  return ref.current
}
