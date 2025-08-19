import { useEffect } from 'react'

import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { InputSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { getMutableState } from '@ir-engine/hyperflux'

import { XRState } from './XRState'

/**
 * System for XR session and input handling
 */

const updateSessionSupportForMode = (mode: XRSessionMode) => {
  console.debug(`Checking support for XR session mode: ${mode}`, navigator.xr, navigator.xr?.isSessionSupported)
  navigator.xr
    ?.isSessionSupported(mode)
    .then((supported) => getMutableState(XRState).supportedSessionModes[mode].set(supported))
}

const updateSessionSupport = () => {
  XRSystemFunctions.updateSessionSupportForMode('inline')
  XRSystemFunctions.updateSessionSupportForMode('immersive-ar')
  XRSystemFunctions.updateSessionSupportForMode('immersive-vr')
}

const reactor = () => {
  useEffect(() => {
    navigator.xr?.addEventListener('devicechange', XRSystemFunctions.updateSessionSupport)
    XRSystemFunctions.updateSessionSupport()

    return () => {
      navigator.xr?.removeEventListener('devicechange', XRSystemFunctions.updateSessionSupport)
    }
  }, [])
  return null
}

export const XRSystem = defineSystem({
  uuid: 'ee.engine.XRSystem',
  insert: { before: InputSystemGroup },
  reactor
})

/** @note Internal usage. Exported for unit tests. */
export const XRSystemFunctions = {
  updateSessionSupportForMode,
  updateSessionSupport
}
