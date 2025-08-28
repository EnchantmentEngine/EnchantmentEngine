import { requestEmulatedXRSession } from '../webxr/emulator'
import { MockXRFrame } from './MockXR'
import { mockSpatialEngine } from './mockSpatialEngine'

import { getMutableState, getState } from '@ir-engine/hyperflux'
import { act, render } from '@testing-library/react'
import { destroySpatialEngine, destroySpatialViewer } from '../../src/initializeEngine'
import { endXRSession } from '../../src/xr/XRSessionFunctions'
import { XRState } from '../../src/xr/XRState'

export async function mockEmulatedXREngine() {
  mockSpatialEngine()
  await requestEmulatedXRSession()
  // @ts-expect-error Allow coercing the MockXRFrame type into the xrFrame property
  getMutableState(XRState).xrFrame.set(new MockXRFrame())
  getMutableState(XRState).xrFrame.merge({ session: getState(XRState).session! })
  await act(() => render(null)) // ensure reactors run
}

export async function destroyEmulatedXREngine() {
  destroySpatialViewer()
  destroySpatialEngine()
  await endXRSession()
}
