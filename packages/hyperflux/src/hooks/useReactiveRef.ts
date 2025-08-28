//https://stackoverflow.com/a/60476525

import { useHookstate } from '@hookstate/core'
import { useCallback } from 'react'

export const useReactiveRef = <T extends HTMLElement>() => {
  const ref = useHookstate({ current: null })
  const handleRef = useCallback((node) => {
    ref.current.set(node)
  }, [])
  return [ref.value as { current: T | null }, handleRef] as const
}
