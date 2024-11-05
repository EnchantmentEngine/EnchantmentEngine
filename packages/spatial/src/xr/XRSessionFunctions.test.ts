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

import { createEngine, destroyEngine } from '@ir-engine/ecs'
import { getState } from '@ir-engine/hyperflux'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { mockSpatialEngine } from '../../tests/util/mockSpatialEngine'
import { CustomWebXRPolyfill, getLastXRSessionData, requestEmulatedXRSession } from '../../tests/webxr/emulator'
import { destroySpatialEngine, destroySpatialViewer } from '../initializeEngine'
import { endXRSession, xrSessionChanged } from './XRSessionFunctions'
import { XRState } from './XRState'

describe('onSessionEnd', () => {}) //:: onSessionEnd
describe('setupXRSession', () => {}) //:: setupXRSession
describe('getReferenceSpaces', () => {}) //:: getReferenceSpaces
describe('requestXRSession', () => {}) //:: requestXRSession

describe('endXRSession', () => {
  beforeAll(() => {
    new CustomWebXRPolyfill()
  })

  beforeEach(async () => {
    createEngine()
    mockSpatialEngine()
    await requestEmulatedXRSession()
  })

  afterEach(() => {
    destroySpatialViewer()
    destroySpatialEngine()
    destroyEngine()
  })

  it('should end the XRState.session, marking it as null', async () => {
    // Sanity check before running
    const before = getState(XRState).session
    expect(before).not.toBe(undefined)
    expect(before).not.toBe(null)
    // Run and Check the result
    await endXRSession()
    const result = getState(XRState).session
    expect(result).not.toBe(null)
    expect(getLastXRSessionData(result).ended).toBe(true)
  })
}) //:: endXRSession

describe('xrSessionChanged', () => {
  it('does nothing, but does not fail to run either', () => {
    // @ts-ignore Allow coercing undefined into the function parameter
    const result = xrSessionChanged(undefined)
    expect(result).toBe(undefined)
  })
}) //:: xrSessionChanged
