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

import { afterEach, assert, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { destroyEmulatedXREngine, mockEmulatedXREngine } from '../../tests/util/mockEmulatedXREngine'
import { CustomWebXRPolyfill } from '../../tests/webxr/emulator'

import { SystemDefinitions, SystemUUID, createEngine, destroyEngine } from '@ir-engine/ecs'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import { Quaternion, Vector3 } from 'three'
import { MockXRAnchor } from '../../tests/util/MockXR'
import { XRAnchorFunctions, XRPersistentAnchorSystem } from './XRPersistentAnchorSystem'
import { ReferenceSpace, XRState } from './XRState'
import { XRSystem } from './XRSystem'

/** @note Runs once on the `describe` implied by vitest for this file */
beforeAll(() => {
  new CustomWebXRPolyfill()
})

describe('XRAnchorFunctions', () => {
  describe('createAnchor', () => {
    beforeEach(async () => {
      createEngine()
      await mockEmulatedXREngine()
    })

    afterEach(() => {
      destroyEmulatedXREngine()
      destroyEngine()
    })

    it('should call `@param xrFrame`.createAnchor and return its result if both `@param xrFrame` and ReferenceSpace.origin are truthy', async () => {
      const Expected = new MockXRAnchor()
      // Set the data as expected
      Expected.delete = vi.fn()
      const xrFrame = getState(XRState).xrFrame
      const createAnchorSpy = vi.fn(
        (_pose: XRRigidTransform, _space: XRSpace) => new Promise<XRAnchor>((resolve) => resolve(Expected as XRAnchor))
      )
      getMutableState(XRState).xrFrame.merge({ createAnchor: createAnchorSpy })
      // Sanity check before running
      assert(xrFrame)
      expect(xrFrame).toBeTruthy()
      expect(ReferenceSpace.origin).toBeTruthy()
      expect(createAnchorSpy).toHaveBeenCalledTimes(0)
      expect(Expected.delete).toHaveBeenCalledTimes(0)
      createAnchorSpy({} as XRRigidTransform, {} as XRSpace)
      Expected.delete()
      expect(createAnchorSpy).toHaveBeenCalledTimes(1)
      expect(Expected.delete).toHaveBeenCalledTimes(1)
      // Run and Check the result
      const result = await XRAnchorFunctions.createAnchor(xrFrame, new Vector3(), new Quaternion())
      expect(result).toBeTruthy()
      expect(result?.delete).toBe(Expected.delete)
      result?.delete()
      expect(createAnchorSpy).toHaveBeenCalledTimes(2)
      expect(Expected.delete).toHaveBeenCalledTimes(2)
    })

    it('should throw an error if either of `@param xrFrame` and ReferenceSpace.origin is falsy', async () => {
      const Expected = new MockXRAnchor()
      // Set the data as expected
      Expected.delete = vi.fn()
      const xrFrame = getState(XRState).xrFrame
      const createAnchorSpy = vi.fn(
        (_pose: XRRigidTransform, _space: XRSpace) => new Promise<XRAnchor>((resolve) => resolve(Expected as XRAnchor))
      )
      getMutableState(XRState).xrFrame.merge({ createAnchor: createAnchorSpy })
      ReferenceSpace.origin = null
      // Sanity check before running
      assert(xrFrame)
      expect(xrFrame).toBeTruthy()
      expect(ReferenceSpace.origin).not.toBeTruthy()
      expect(createAnchorSpy).toHaveBeenCalledTimes(0)
      expect(Expected.delete).toHaveBeenCalledTimes(0)
      // Run and Check the result
      try {
        await XRAnchorFunctions.createAnchor(xrFrame, new Vector3(), new Quaternion())
      } catch (error) {
        expect(error.message).toMatch('XRFrame not available.')
      }
      expect(createAnchorSpy).toHaveBeenCalledTimes(0)
      expect(Expected.delete).toHaveBeenCalledTimes(0)
    })
  }) //:: createAnchor

  /** @todo */
  describe('createPersistentAnchor', () => {}) //:: createPersistentAnchor
  describe('restoreAnchor', () => {}) //:: restoreAnchor
  describe('deleteAnchor', () => {}) //:: deleteAnchor
  describe('anchors', () => {}) //:: anchors
  describe('anchorPoses', () => {}) //:: anchorPoses
}) //:: XRAnchorFunctions

describe('XRPersistentAnchorSystem', () => {
  const System = SystemDefinitions.get(XRPersistentAnchorSystem)!

  beforeEach(async () => {
    createEngine()
    await mockEmulatedXREngine()
  })

  afterEach(() => {
    destroyEmulatedXREngine()
    destroyEngine()
  })

  describe('Fields', () => {
    it('should initialize the *System.uuid field with the expected value', () => {
      expect(System.uuid).toBe('ee.engine.XRPersistentAnchorSystem')
    })

    it('should initialize the *System with the expected SystemUUID value', () => {
      expect(XRPersistentAnchorSystem).toBe('ee.engine.XRPersistentAnchorSystem' as SystemUUID)
    })

    it('should initialize the *System.insert field with the expected value', () => {
      expect(System.insert).not.toBe(undefined)
      expect(System.insert!.with).not.toBe(undefined)
      expect(System.insert!.with!).toBe(XRSystem)
    })
  }) //:: Fields

  describe('execute', () => {}) //:: execute
}) //:: XRPersistentAnchorSystem
