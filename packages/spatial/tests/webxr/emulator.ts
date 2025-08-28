/**
 * @fileoverview
 * Exports the tools most used in unit tests from the webxr-emulator.
 * @why Ergonomics. Allows all imports to come from a single file.
 * */

import { PRIVATE as XRSESSION_SYMBOL } from 'webxr-polyfill/src/api/XRSession'
import { PRIVATE as XRWEBGLLAYER_SYMBOL } from 'webxr-polyfill/src/api/XRWebGLLayer'
import { PRIVATE as EVENTTARGET_SYMBOL } from 'webxr-polyfill/src/lib/EventTarget'
import { requestXRSession } from '../../src/xr/XRSessionFunctions'
import { WebXREventDispatcher } from '../../tests/webxr/emulator/WebXREventDispatcher'
import { POLYFILL_ACTIONS } from '../../tests/webxr/emulator/actions'

/* @section Forward Exports from the emulator module. */
export { CustomWebXRPolyfill } from '../../tests/webxr/emulator/CustomWebXRPolyfill'
export { WebXREventDispatcher } from '../../tests/webxr/emulator/WebXREventDispatcher'
export { POLYFILL_ACTIONS } from '../../tests/webxr/emulator/actions'

/**
 * @description Returns the data of the `@param session` XRSession passed in by accessing it with its Symbol() name
 * @why Shorthand for getting the data of the session in an ergonomic way.
 * */
function getXRSessionData(session: XRSession | null) {
  if (session === null) return null
  return session[XRSESSION_SYMBOL]
}

/**
 * @description Returns the data of the last session found at the `@param session` passed.
 * @why Shorthand for getting the last session data in an ergonomic way.
 * */
function getLastXRSessionData(session: XRSession | null) {
  // @ts-expect-error TEMP: Allow access to unknown. @todo Typecast into the correct type
  return Array.from(getXRSessionData(session).device.sessions).at(-1).at(-1)
}

/**
 * @description Returns the private data of the `@param layer` XRWebGLLayer passed in by accessing it with its Symbol() name
 * @why Shorthand for getting the private data of the layer in an ergonomic way.
 * */
function getXRWebGLLayerData(layer: XRWebGLLayer | null) {
  if (layer === null) return null
  return layer[XRWEBGLLAYER_SYMBOL]
}

/**
 * @warning
 * Cannot work until this symbol from webxr-polyfill is exported
 * ```ts
 * const PRIVATE = Symbol('@@webxr-polyfill/EventTarget');
 * ```
 * Link: [webxr-polyfill/EventTarget.js#L16](https://github.com/immersive-web/webxr-polyfill/blob/main/src/lib/EventTarget.js#L16)
 *
 * @description Returns the EventTarget data of the `@param session` XRSession passed in by accessing it with its Symbol() name
 * @why Shorthand for getting the EventTarget data of the session in an ergonomic way.
 * */
function __getXRSessionEventTargetData(session: XRSession | null) {
  if (session === null) return null
  return session[EVENTTARGET_SYMBOL]
}

/**
 * @description Requests an emulated XRSession.
 * @why Shorthand for initializing an emulated XRSession from unit tests
 * */
export async function requestEmulatedXRSession(deviceDefinition = DeviceDefinitions.Default) {
  WebXREventDispatcher.instance.dispatchEvent({
    type: POLYFILL_ACTIONS.DEVICE_INIT,
    detail: { stereoEffect: false, deviceDefinition: deviceDefinition }
  })
  return requestXRSession()
}

export const OculusQuest = {
  id: 'Oculus Quest',
  name: 'Oculus Quest',
  modes: ['inline', 'immersive-vr', 'immersive-ar'],
  headset: {
    hasPosition: true,
    hasRotation: true
  },
  controllers: [
    {
      id: 'Oculus Touch (Right)',
      buttonNum: 7,
      primaryButtonIndex: 0,
      primarySqueezeButtonIndex: 1,
      hasPosition: true,
      hasRotation: true,
      hasSqueezeButton: true,
      isComplex: true
    },
    {
      id: 'Oculus Touch (Left)',
      buttonNum: 7,
      primaryButtonIndex: 0,
      primarySqueezeButtonIndex: 1,
      hasPosition: true,
      hasRotation: true,
      hasSqueezeButton: true,
      isComplex: true
    }
  ]
}

export const DeviceDefinitions = {
  Default: OculusQuest,
  OculusQuest
}

export const XREmulatorHelper = {
  getXRSessionData,
  getLastXRSessionData,
  getXRWebGLLayerData,
  __getXRSessionEventTargetData
}
