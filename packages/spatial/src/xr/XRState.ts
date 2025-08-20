import { Quaternion, Vector3 } from 'three'
import matches from 'ts-matches'

import { defineAction, defineState, getMutableState, getState, useMutableState } from '@ir-engine/hyperflux'

import { UndefinedEntity } from '@ir-engine/ecs'
import { DepthDataTexture } from './DepthDataTexture'

export class XRAction {
  // todo, support more haptic formats other than just vibrating controllers
  static vibrateController = defineAction({
    type: 'xre.xr.vibrateController',
    handedness: matches.literals('left', 'right'),
    value: matches.number,
    duration: matches.number
  })
}

// TODO: divide this up into the systems that manage these states
export const XRState = defineState({
  name: 'XRState',
  initial: () => {
    return {
      sessionActive: false, // TODO: remove this; it's redundant, just need to check if session exists
      requestingSession: false,
      scenePosition: new Vector3(),
      sceneRotation: new Quaternion(),
      sceneScale: 1,
      sceneScaleAutoMode: true,
      sceneScaleTarget: 1,
      sceneRotationOffset: 0,
      scenePlacementMode: 'unplaced' as 'unplaced' | 'placing' | 'placed',
      supportedSessionModes: {
        inline: false,
        'immersive-ar': false,
        'immersive-vr': false
      },
      cameraAttachedEntity: UndefinedEntity,
      avatarCameraMode: 'auto' as 'auto' | 'attached' | 'detached',
      unassingedInputSources: [] as XRInputSource[],
      session: null as XRSession | null,
      sessionMode: 'none' as 'inline' | 'immersive-ar' | 'immersive-vr' | 'none',
      /** Stores the depth map data - will exist if depth map is supported */
      depthDataTexture: null as DepthDataTexture | null,
      is8thWallActive: false,
      viewerPose: null as XRViewerPose | null | undefined,
      /** @todo replace with proper proportions API */
      userEyeHeight: 1.75,
      userHeightRatio: 1,
      xrFrame: null as XRFrame | null
    }
  },

  /**
   * Gets the world scale according to avatar scaling factor and scene scale
   * - divide any world-space distances by this to get the real-world distance
   * @todo - can we think of a better name for this?
   * @returns {number} the world scale
   */
  get worldScale(): number {
    const { sceneScale, userHeightRatio } = getState(XRState)
    return sceneScale * userHeightRatio
  },

  /**
   * Specifies that the user has movement controls if:
   * - in an immersive session
   * - or in an immersive session with a world-space interaction mode
   * - or in an immersive-ar and dollhouse mode
   */
  get isMovementControlsEnabled(): boolean {
    const { sessionActive, sessionMode, sceneScale } = getState(XRState)
    if (!sessionActive) return true
    const isMiniatureScale = sceneScale !== 1
    return sessionMode === 'immersive-ar' ? isMiniatureScale : true
  },

  useMovementControlsEnabled: () => {
    const { sessionActive, sessionMode, sceneScale } = useMutableState(XRState).value
    if (!sessionActive) return true
    const isMiniatureScale = sceneScale !== 1
    return sessionMode === 'immersive-ar' ? isMiniatureScale : true
  },

  /**
   * Specifies that the camera should be attached to the controller if:
   * - in an immersion session and not in placement mode or miniature mode
   * @todo rename this to 'shouldViewerFollowController' for clarity
   */
  get isCameraAttachedToAvatar(): boolean {
    const { session, sceneScale, scenePlacementMode, avatarCameraMode } = getState(XRState)
    if (!session || scenePlacementMode === 'placing') return false
    if (avatarCameraMode === 'auto') {
      return sceneScale === 1
    }
    return avatarCameraMode === 'attached'
  },

  useCameraAttachedToAvatar: () => {
    const { session, sceneScale, scenePlacementMode, avatarCameraMode } = useMutableState(XRState).value
    if (!session || scenePlacementMode === 'placing') return false
    if (avatarCameraMode === 'auto') {
      return sceneScale === 1
    }
    return avatarCameraMode === 'attached'
  },

  setTrackingSpace: () => {
    const { xrFrame, userEyeHeight } = getState(XRState)

    if (!xrFrame) {
      getMutableState(XRState).userHeightRatio.set(1)
      return
    }

    const viewerPose = xrFrame.getViewerPose(ReferenceSpace.localFloor!)

    if (!viewerPose) {
      getMutableState(XRState).userHeightRatio.set(1)
      return
    }

    getMutableState(XRState).userHeightRatio.set(viewerPose.transform.position.y / userEyeHeight)
  }
})

export const ReferenceSpace = {
  /**
   * The scene origin reference space describes where the origin of the tracking space is
   * TODO: this will be deprecated in a future reference space refactor
   */
  origin: null as XRReferenceSpace | null,
  /**
   * @see https://www.w3.org/TR/webxr/#dom-xrreferencespacetype-local-floor
   */
  localFloor: null as XRReferenceSpace | null,
  /**
   * @see https://www.w3.org/TR/webxr/#dom-xrreferencespacetype-viewer
   */
  viewer: null as XRReferenceSpace | null
}
globalThis.ReferenceSpace = ReferenceSpace

const userAgent = 'navigator' in globalThis ? navigator.userAgent : ''

/**
 * Whether or not this is a mobile XR headset
 **/
export const isMobileXRHeadset =
  userAgent.includes('Oculus') || userAgent.includes('Reality') || userAgent.includes('Wolvic')
