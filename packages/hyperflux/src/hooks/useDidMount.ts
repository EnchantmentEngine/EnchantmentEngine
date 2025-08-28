import { useEffect, useRef } from 'react'

export const useDidMount = (func: () => (() => void) | void, deps: any[] = []) => {
  const didMount = useRef(false)

  useEffect(() => {
    let ret: (() => void) | void = undefined
    if (didMount.current) ret = func()
    else didMount.current = true

    return ret
  }, deps)
}
