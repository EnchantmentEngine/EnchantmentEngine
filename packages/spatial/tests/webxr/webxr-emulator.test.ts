/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { ECSState, Timer, createEngine, destroyEngine, setComponent } from '@ir-engine/ecs'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { EngineState } from '../../src/EngineState'
import {
  destroySpatialEngine,
  destroySpatialViewer,
  initializeSpatialEngine,
  initializeSpatialViewer
} from '../../src/initializeEngine'
import { RendererComponent } from '../../src/renderer/WebGLRendererSystem'
import { requestXRSession } from '../../src/xr/XRSessionFunctions'
import { XRState } from '../../src/xr/XRState'
import { mockEngineRenderer } from '../../tests/util/MockEngineRenderer'
import { WebXREventDispatcher } from '../../tests/webxr/emulator/WebXREventDispatcher'
import { POLYFILL_ACTIONS } from '../../tests/webxr/emulator/actions'

const deviceDefinition = {
  id: 'Oculus Quest',
  name: 'Oculus Quest',
  modes: ['inline', 'immersive-vr'],
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

describe('WebXR-emulator', () => {
  beforeAll(async () => {
    const { CustomWebXRPolyfill } = await import('../../tests/webxr/emulator/CustomWebXRPolyfill')
    new CustomWebXRPolyfill()
  })

  beforeEach(async () => {
    createEngine()
    initializeSpatialEngine()
    initializeSpatialViewer()

    const timer = Timer((_time, xrFrame) => {
      getMutableState(XRState).xrFrame.set(xrFrame)
      // executeSystems(time)
      getMutableState(XRState).xrFrame.set(null)
    })
    getMutableState(ECSState).timer.set(timer)

    const { originEntity, localFloorEntity, viewerEntity } = getState(EngineState)
    mockEngineRenderer(viewerEntity)
    setComponent(viewerEntity, RendererComponent, { scenes: [originEntity, localFloorEntity, viewerEntity] })
  })

  afterEach(async () => {
    destroySpatialViewer()
    destroySpatialEngine()
    return destroyEngine()
  })

  /** @todo Why is this getting a null XRState.session, when the session is defined inside requestXRSession? */
  it('should be able to define and initialize a device', async () => {
    WebXREventDispatcher.instance.dispatchEvent({
      type: POLYFILL_ACTIONS.DEVICE_INIT,
      detail: { stereoEffect: false, deviceDefinition }
    })

    await requestXRSession()

    expect(getState(XRState).session).not.toBeNull()
    expect(getState(XRState).session).not.toBeUndefined()
  })
}) //:: WebXR-emulator
