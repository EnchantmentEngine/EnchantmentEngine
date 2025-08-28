import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { getState } from '@ir-engine/hyperflux'

import { XRDetectedMeshComponent } from './XRDetectedMeshComponent'
import { XRDetectedPlaneComponent } from './XRDetectedPlaneComponent'
import { XRState } from './XRState'
import { XRSystem } from './XRSystem'

/** https://github.com/immersive-web/webxr-samples/blob/main/proposals/plane-detection.html */

declare global {
  interface XRFrame {
    /** WebXR implements detectedPlanes on the XRFrame, but the current typescript implementation has it on worldInformation */
    detectedPlanes?: XRPlaneSet
    worldInformation?: {
      detectedPlanes?: XRPlaneSet
    }
  }

  interface XRPlane {
    semanticLabel?: string
  }
}

const emptyPlaneSet = Object.freeze(new Set()) as XRPlaneSet
const emptyMeshSet = Object.freeze(new Set()) as XRMeshSet

const execute = () => {
  const frame = getState(XRState).xrFrame
  const detectedPlanes = frame?.worldInformation?.detectedPlanes ?? frame?.detectedPlanes ?? emptyPlaneSet
  const detectedMeshes = frame?.detectedMeshes ?? emptyMeshSet
  XRDetectedPlaneComponent.updateDetectedPlanes(detectedPlanes)
  XRDetectedMeshComponent.updateDetectedMeshes(detectedMeshes)
}

export const XRDetectedMeshSystem = defineSystem({
  uuid: 'ee.engine.XRDetectedMeshSystem',
  insert: { with: XRSystem },
  execute
})
