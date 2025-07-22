import { useHookstate } from '@hookstate/core'
import { DependencyList, EffectCallback, useEffect, useLayoutEffect } from 'react'
import { NO_PROXY_STEALTH } from '../functions/StateFunctions'

function depsDiff(deps1, deps2) {
  return !(
    Array.isArray(deps1) &&
    Array.isArray(deps2) &&
    deps1.length === deps2.length &&
    deps1.every((dep, idx) => Object.is(dep, deps2[idx]))
  )
}

function noop() {}

/**
 * Run an effect immediately on mount and whenever deps change.
 *
 * NOTE: this effect only runs after the component is first mounted
 *
 * @param effect
 * @param deps
 */
export function useImmediateEffect(effect: EffectCallback, deps?: DependencyList) {
  const cleanupRef = useHookstate<any>(null)
  const depsRef = useHookstate<any>(null)

  // noop unless component is mounted to ensure we can clean up correctly
  const isMounted = useHookstate(false)
  useLayoutEffect(() => {
    isMounted.set(true)
  }, [])

  // make sure deps are hooked
  useEffect(() => {}, deps)

  // only run effect when mounted and whenever deps change
  if (isMounted.value && depsDiff(depsRef.get(NO_PROXY_STEALTH), deps)) {
    depsRef.set(deps)

    // cleanup previous effect
    const cleanup = cleanupRef.get(NO_PROXY_STEALTH)
    if (cleanup) {
      cleanup()
    }

    // run effect
    cleanupRef.set(() => effect())
  }

  // make sure final cleanup is called on unmount
  useLayoutEffect(() => {
    return () => {
      const cleanup = cleanupRef.get(NO_PROXY_STEALTH)
      cleanup?.()
    }
  }, [])
}
