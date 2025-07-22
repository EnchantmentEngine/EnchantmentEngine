import { initializeSpatialEngine, initializeSpatialViewer } from '../../src/initializeEngine'
import { mockEngineRenderer } from './MockEngineRenderer'

import { ECSState, Timer, setComponent } from '@ir-engine/ecs'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import { Matrix4 } from 'three'
import { ReferenceSpaceState } from '../../src/ReferenceSpaceState'
import { RendererComponent } from '../../src/renderer/components/RendererComponent'
import { ReferenceSpace, XRState } from '../../src/xr/XRState'
import { MockXRFrame, MockXRReferenceSpace, MockXRSpace } from './MockXR'

export const mockSpatialEngine = () => {
  initializeSpatialEngine()
  initializeSpatialViewer()

  const timer = Timer((time, xrFrame) => {
    getMutableState(XRState).xrFrame.set(xrFrame)
    // executeSystems(time)
    getMutableState(XRState).xrFrame.set(null)
  })
  getMutableState(ECSState).timer.set(timer)

  const { originEntity, localFloorEntity, viewerEntity } = getState(ReferenceSpaceState)
  mockEngineRenderer(viewerEntity)
  setComponent(viewerEntity, RendererComponent, { scenes: [originEntity, localFloorEntity, viewerEntity] })

  const xrFrame = new MockXRFrame()
  // @ts-expect-error Allow coercing the MockXRFrame type into the xrFrame property of XRState
  getMutableState(XRState).xrFrame.set(xrFrame)

  ReferenceSpace.origin = new MockXRReferenceSpace(new Matrix4()) as any as XRReferenceSpace
  ReferenceSpace.localFloor = new MockXRReferenceSpace(new Matrix4()) as any as XRReferenceSpace
  ReferenceSpace.viewer = new MockXRSpace(new Matrix4()) as any as XRReferenceSpace
}
