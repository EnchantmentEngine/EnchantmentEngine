import { getComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { createHookableFunction, getMutableState, getState } from '@ir-engine/hyperflux'

import { ReferenceSpaceState } from '../ReferenceSpaceState'
import { Vector3_One, Vector3_Zero } from '../common/constants/MathConstants'
import { isSafari } from '../common/functions/isMobile'
import { RendererComponent } from '../renderer/components/RendererComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { computeAndUpdateWorldOrigin } from '../transform/updateWorldOrigin'
import { ReferenceSpace, XRState } from './XRState'

export const onSessionEnd = () => {
  const xrState = getMutableState(XRState)
  xrState.session.value!.removeEventListener('end', onSessionEnd)
  xrState.sessionActive.set(false)
  xrState.sessionMode.set('none')
  xrState.session.set(null)
  xrState.sceneScale.set(1)

  xrState.xrFrame.set(null)

  const renderer = getComponent(getState(ReferenceSpaceState).viewerEntity, RendererComponent)
  renderer.renderer!.domElement.style.display = ''
  renderer.needsResize = true

  const originTransform = getComponent(getState(ReferenceSpaceState).originEntity, TransformComponent)
  originTransform.position.copy(Vector3_Zero)
  originTransform.rotation.identity()
  originTransform.scale.copy(Vector3_One)

  const localFloorTransform = getComponent(getState(ReferenceSpaceState).localFloorEntity, TransformComponent)
  localFloorTransform.position.copy(Vector3_Zero)
  localFloorTransform.rotation.identity()
  localFloorTransform.scale.copy(Vector3_One)

  const viewerTransform = getComponent(getState(ReferenceSpaceState).viewerEntity, TransformComponent)
  viewerTransform.scale.copy(Vector3_One)

  ReferenceSpace.origin = null
  ReferenceSpace.localFloor = null
  ReferenceSpace.viewer = null

  xrState.session.set(null)
}

export const setupXRSession = async (requestedMode?: 'inline' | 'immersive-ar' | 'immersive-vr') => {
  const xrState = getMutableState(XRState)
  const xrManager = getComponent(getState(ReferenceSpaceState).viewerEntity, RendererComponent).xrManager

  // @todo - hack to detect nreal
  const params = new URL(document.location.href).searchParams
  const isXREAL = params.has('xreal')

  const sessionInit = {
    optionalFeatures: [
      'local-floor',
      requestedMode === 'immersive-vr' && isSafari ? undefined : 'hand-tracking',
      'layers',
      isXREAL ? undefined : 'dom-overlay', // dom overlay crashes nreal
      'hit-test',
      'light-estimation',
      // 'depth-sensing', // TODO: crashes meta quest
      'anchors',
      'plane-detection',
      'mesh-detection',
      'camera-access'
    ].filter(Boolean),
    // depthSensing: {
    //   usagePreference: ['cpu-optimized', 'gpu-optimized'],
    //   dataFormatPreference: ['luminance-alpha', 'float32']
    // },
    domOverlay: isXREAL ? undefined : { root: document.body }
  } as XRSessionInit
  const mode =
    requestedMode ||
    (xrState.supportedSessionModes['immersive-ar'].value
      ? 'immersive-ar'
      : xrState.supportedSessionModes['immersive-vr'].value
      ? 'immersive-vr'
      : 'inline')

  xrState.requestingSession.set(true)

  const xrSession = await navigator.xr!.requestSession(mode, sessionInit)

  // OculusBrowser incorrectly reports that the interaction mode is 'screen-space' when it should be 'world-space'
  // This can be removed when the bug is fixed
  const isOculus = navigator.userAgent.includes('OculusBrowser')
  if (isOculus) {
    Object.defineProperty(xrSession, 'interactionMode', {
      value: 'world-space'
    })
  }

  const framebufferScaleFactor =
    xrSession.interactionMode === 'screen-space' && xrSession.domOverlayState?.type === 'screen' ? 0.5 : 1.2

  xrState.sessionActive.set(true)

  xrState.sessionMode.set(mode)

  await xrManager!.setSession(xrSession, framebufferScaleFactor)

  /** Hide the canvas - do not do this for the WebXR emulator */
  /** @todo currently, XRSession.visibilityState is undefined in the webxr emulator - we need a better check*/
  if (typeof xrSession.visibilityState === 'string') {
    getComponent(getState(ReferenceSpaceState).viewerEntity, RendererComponent).renderer!.domElement.style.display =
      'none'
  }

  xrState.session.set(xrSession)

  xrState.requestingSession.set(false)

  return xrSession
}

export const getReferenceSpaces = (xrSession: XRSession) => {
  const onLocalFloorReset = (_ev: XRReferenceSpaceEvent) => {
    /** @todo ev.transform is not yet implemented on the Quest browser */
    // if (ev.transform) {
    //   ReferenceSpace.localFloor = ev.referenceSpace.getOffsetReferenceSpace(ev.transform)
    //   if (ReferenceSpace.localFloor && 'addEventListener' in ReferenceSpace.localFloor)
    //     ReferenceSpace.localFloor.addEventListener('reset', onLocalFloorReset, { once: true, passive: true })
    // }
    XRState.setTrackingSpace()
  }

  /** the world origin is an offset to the local floor, so as soon as we have the local floor, define the origin reference space */
  xrSession.requestReferenceSpace('local-floor').then((space: XRReferenceSpace | XRBoundedReferenceSpace) => {
    // WebXR Emulator does not support XRReferenceSpace events
    if ('addEventListener' in space) space.addEventListener('reset', onLocalFloorReset, { once: true, passive: true })
    ReferenceSpace.localFloor = space
    computeAndUpdateWorldOrigin()
  })

  xrSession.requestReferenceSpace('viewer').then((space) => (ReferenceSpace.viewer = space))
}

/**
 * A hookable function that is fired when the XR Session is requested
 * @returns
 */
export const requestXRSession = createHookableFunction(
  async (action: { mode?: 'inline' | 'immersive-ar' | 'immersive-vr' } = {}): Promise<void> => {
    const xrState = getMutableState(XRState)
    if (xrState.requestingSession.value || xrState.sessionActive.value) return

    try {
      const xrSession = await setupXRSession(action.mode)

      getReferenceSpaces(xrSession)

      xrSession.addEventListener('end', onSessionEnd)
    } catch (e) {
      console.error('Failed to create XR Session', e)
    }
  }
)

/**
 * A hookable function that is fired when the XR Session has ended
 * @returns
 */
export const endXRSession = createHookableFunction(async () => {
  await getMutableState(XRState).session.value?.end()
})
