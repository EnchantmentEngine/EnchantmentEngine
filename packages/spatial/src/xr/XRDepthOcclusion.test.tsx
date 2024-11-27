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
import { XRDepthOcclusion, XRDepthOcclusionSystem } from './XRDepthOcclusion'
import { XRSystem } from './XRSystem'

/** @note Runs once on the `describe` implied by vitest for this file */
beforeAll(() => {
  new CustomWebXRPolyfill()
})

describe('XRDepthOcclusion', () => {
  describe('XRDepthOcclusionMaterials,', () => {
    it('should start as an empty array of XRDepthOcclusionMaterialType', () => {
      expect(Array.isArray(XRDepthOcclusion.XRDepthOcclusionMaterials)).toBe(true)
      expect(XRDepthOcclusion.XRDepthOcclusionMaterials.length).toBe(0)
    })
  }) //:: XRDepthOcclusionMaterials

  describe('addDepthOBCPlugin,', () => {
    /**
    // @todo
    it("should not do anything if `@param material` is falsy", () => {})
    it("should set `@param material`.userData to an empty object if its falsy", () => {})
    it("should exit early if `@param material`.userData.DepthOcclusionPlugin", () => {})
    describe("`@param material`.userData.DepthOcclusionPlugin", () => {
      it("should set .id to the expected default value", () => {})
      it("should set .uniforms to the expected default value", () => {})
      describe("compile", () => {
        it("should not do anything if mat.userData.DepthOcclusionPlugin is falsy", () => {})
        describe("for all uniforms of DepthOcclusionPlugin", () => {
          it(".. should add all `@param material`.userData.DepthOcclusionPlugin.uniforms to `@param shader`.uniforms", () => {})
        })
        it("should set `@param material`.shader to `@param shader`", () => {})
        it("should set `@param shader`.fragmentShader to the expected value", () => {})
        it("should set `@param shader`.vertexShader to the expected value", () => {})
      }) //:: DepthOcclusionPlugin.compile
    }) //:: DepthOcclusionPlugin
    it("should call addOBCPlugin with `@param material` and `@param material`.userData.DepthOcclusionPlugin", () => {})
    it("should set `@param material`.needsUpdate to true", () => {})
    it("should add the `@param material` to the XRDepthOcclusionMaterials list", () => {})
    */
  }) //:: addDepthOBCPlugin

  describe('removeDepthOBCPlugin,', () => {
    /**
    // @todo
    it("should not do anything if `@param material`.userData.DepthOcclusionPlugin is falsy", () => {})
    it("should call removeOBCPlugin with `@param material` and `@param material`.userData.DepthOcclusionPlugin", () => {})
    it("should remove the DepthOcclusionPlugin field from `@param material`.userData", () => {})
    it("should remove the `@param material` from the XRDepthOcclusionMaterials list", () => {})
    it("should set `@param material`.needsUpdate to true", () => {})
    */
  }) //:: removeDepthOBCPlugin

  describe('updateDepthMaterials,', () => {
    /**
    // @todo
    it("should not do anything if either `@param frame` or `@param referenceSpace` are falsy", () => {})
    it("should not do anything if `@param frame`.getViewerPose(`@param referenceSpace`) is falsy", () => {})
    describe("for every viewerPose in `@param frame`.getViewerPose(`@param referenceSpace`)", () => {
      it(".. should not do anything for the view if frame.getDepthInformation(view) is falsy", () => {})
      it(".. should set XRState.depthDataTexture to a new DepthDataTexture created with (depthInfo.width, depthInfo.height) if its value is falsy", () => {})
      it(".. should call XRState.depthDataTexture.updateDepth with the value of frame.getDepthInformation(view)", () => {})
      it(".. should call XRDepthOcclusion.updateUniforms with XRDepthOcclusionMaterials and the value of frame.getDepthInformation(view)", () => {})
      it(".. should call `@param depthTexture`.updateDepth with the value of frame.getDepthInformation(view)", () => {})
    })
    */
  }) //:: updateDepthMaterials

  describe('updateUniforms', () => {
    /**
    // @todo
    it("should not do anything for a material if mat.userData.DepthOcclusionPlugin is falsy", () => {})
    it("should not do anything for a material if material.shader is falsy", () => {})
    it("should set the uResolution uniform of the mat.shader to the expected (width, height) for the window.devicePixelRatio", () => {})
    it("should set the uUvTransform uniform of the mat.shader to the inverse of `@param depthInfo`.normTextureFromNormViewMatrix.matrix", () => {})
    it("should set the uRawValueToMeters uniform of the mat.shader to `@param depthInfo`.rawValueToMeters", () => {})
    */
  }) //:: updateUniforms
}) //:: XRDepthOcclusion

describe('XRDepthOcclusionSystem', () => {
  const System = SystemDefinitions.get(XRDepthOcclusionSystem)!

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
      expect(System.uuid).toBe('ee.engine.XRDepthOcclusionSystem')
    })

    it('should initialize the *System with the expected SystemUUID value', () => {
      expect(XRDepthOcclusionSystem).toBe('ee.engine.XRDepthOcclusionSystem' as SystemUUID)
    })

    it('should initialize the *System.insert field with the expected value', () => {
      expect(System.insert).not.toBe(undefined)
      expect(System.insert!.after).not.toBe(undefined)
      expect(System.insert!.after!).toBe(XRSystem)
    })
  }) //:: Fields

  /** @todo */
  describe('execute,', () => {}) //:: execute
  describe('reactor,', () => {}) //:: reactor
}) //:: XRDepthOcclusionSystem
