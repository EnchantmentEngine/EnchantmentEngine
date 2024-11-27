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

import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { destroyEmulatedXREngine, mockEmulatedXREngine } from '../../tests/util/mockEmulatedXREngine'
import { CustomWebXRPolyfill } from '../../tests/webxr/emulator'

import { SystemDefinitions, SystemUUID, createEngine, destroyEngine } from '@ir-engine/ecs'
import { XRDetectedMeshSystem } from './XRDetectedMeshSystem'
import { XRSystem } from './XRSystem'

/** @note Runs once on the `describe` implied by vitest for this file */
beforeAll(() => {
  new CustomWebXRPolyfill()
})

describe('XRDetectedMeshSystem', () => {
  const System = SystemDefinitions.get(XRDetectedMeshSystem)!

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
      expect(System.uuid).toBe('ee.engine.XRDetectedMeshSystem')
    })

    it('should initialize the *System with the expected SystemUUID value', () => {
      expect(XRDetectedMeshSystem).toBe('ee.engine.XRDetectedMeshSystem' as SystemUUID)
    })

    it('should initialize the *System.insert field with the expected value', () => {
      expect(System.insert).not.toBe(undefined)
      expect(System.insert!.with).not.toBe(undefined)
      expect(System.insert!.with!).toBe(XRSystem)
    })
  }) //:: Fields

  /** @todo */
  describe('execute', () => {}) //:: execute
  describe('reactor', () => {}) //:: reactor
}) //:: XRDetectedMeshSystem

describe('XRDetectedMeshSystem Functions', () => {
  describe('handleDetectedPlanes', () => {
    /**
    // @todo
    it("should not do anything if frame.worldInformation?.detectedPlanes and frame.detectedPlanes are both falsy", () => {})
    describe("for every entry in the XRDetectedPlaneComponent.detectedPlanesMap list", () => {
      it(".. should not do anything if detectedPlanes contains the plane entry", () => {})
      it(".. should call removeEntity for the entity of the entry", () => {})
      it(".. should delete the entry's plane from the XRDetectedPlaneComponent.detectedPlanesMap list", () => {})
      it(".. should delete the entry's plane from the XRDetectedPlaneComponent.planesLastChangedTimes list", () => {})
    })
    describe("for every plane in the detectedPlanes list", () => {
      it(".. should call XRDetectedPlaneComponent.foundPlane with the plane if the XRDetectedPlaneComponent.detectedPlanesMap list doesn't contain the plane", () => {})
      it(`.. should call XRDetectedPlaneComponent.updatePlaneGeometry
          with the plane and the entity that is tied to it
          if plane.lastChangedTime is bigger than the time found on the XRDetectedPlaneComponent.planesLastChangedTimes for that plane`, () => {})
      it(".. should call XRDetectedPlaneComponent.updatePlanePose with the plane and the entity that is tied to it", () => {})
    })
    */
  }) //:: handleDetectedPlanes

  describe('handleDetectedMeshes', () => {
    /**
    // @todo
    it("should not do anything if `@param frame`.detectedMeshes is falsy", () => {})
    describe("for every entry in the XRDetectedMeshComponent.detectedMeshesMap list", () => {
      it(".. should not do anything if frame.detectedMeshes contains the mesh", () => {})
      it("should call removeEntity for the entity of the entry", () => {})
      it(".. should delete the entry's mesh from the XRDetectedPlaneComponent.detectedMeshesMap list", () => {})
      it(".. should delete the entry's mesh from the XRDetectedPlaneComponent.meshesLastChangedTimes list", () => {})
    })
    describe("for every entry in the XRDetectedMeshComponent.detectedMeshes list", () => {
      it("should call XRDetectedMeshComponent.foundMesh with the entry's mesh if XRDetectedMeshComponent.detectedMeshesMap list doesn't contain the mesh", () => {})
      it(`.. should call XRDetectedPlaneComponent.updateMeshGeometry
          with the mesh and the entity that is tied to it
          if mesh.lastChangedTime is bigger than the time found on the XRDetectedMeshComponent.meshesLastChangedTimes for that mesh`, () => {})
      it(".. should call XRDetectedMeshComponent.updateMeshPose with the mesh and the entity that is tied to it", () => {})
    })
    */
  }) //:: handleDetectedMeshes
}) //:: XRDetectedMeshSystem Functions
