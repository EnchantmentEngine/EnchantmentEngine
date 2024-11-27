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

import { createEngine, destroyEngine, getComponent } from '@ir-engine/ecs'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import { WebGLRenderer } from 'three'
import { afterEach, assert, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { destroyEmulatedXREngine, mockEmulatedXREngine } from '../../tests/util/mockEmulatedXREngine'
import { CustomWebXRPolyfill } from '../../tests/webxr/emulator'
import { EngineState } from '../EngineState'
import { CameraComponent } from '../camera/components/CameraComponent'
import { RendererComponent } from '../renderer/WebGLRendererSystem'
import { XRRendererState, createWebXRManager } from './WebXRManager'
import { XRState } from './XRState'

const FunctionTypeName = 'function'
const VoidFunctionString = 'function() {\n  }'
const EventFunctionString = 'function(event) {\n  }'
const TypeListenerFunctionString = 'function(type, listener) {\n  }'

/** @note Runs once on the `describe` implied by vitest for this file */
beforeAll(() => {
  new CustomWebXRPolyfill()
})

describe('XRRendererState', () => {
  describe('Fields', () => {
    it('should initialize the *State.name field with the expected value', () => {
      expect(XRRendererState.name).toBe('XRRendererState')
    })

    it('should initialize the *State.initial field with the expected value', () => {
      expect(XRRendererState.initial).deep.equal({
        glBinding: null,
        glProjLayer: null,
        glBaseLayer: null,
        xrFrame: null,
        initialRenderTarget: null,
        newRenderTarget: null
      })
    })
  }) //:: Fields
}) //:: XRRendererState

describe('createWebXRManager', () => {
  let renderer: WebGLRenderer | null = null
  beforeEach(async () => {
    createEngine()
    await mockEmulatedXREngine()
    renderer = getComponent(getState(EngineState).viewerEntity, RendererComponent).renderer
  })

  afterEach(() => {
    destroyEmulatedXREngine()
    destroyEngine()
  })

  it('should set result.cameraAutoUpdate to false', () => {
    const Expected = false
    // Sanity check before running
    assert(renderer)
    // Run and Check the result
    const result = createWebXRManager(renderer).cameraAutoUpdate
    expect(result).toBe(Expected)
  })

  it('should set result.enabled to false', () => {
    const Expected = false
    // Sanity check before running
    assert(renderer)
    // Run and Check the result
    const result = createWebXRManager(renderer).enabled
    expect(result).toBe(Expected)
  })

  it('should set result.useMultiview to true', () => {
    const Expected = true
    // Sanity check before running
    assert(renderer)
    // Run and Check the result
    const result = createWebXRManager(renderer).useMultiview
    expect(result).toBe(Expected)
  })

  it('should set result.isPresenting to false', () => {
    const Expected = false
    // Sanity check before running
    assert(renderer)
    // Run and Check the result
    const result = createWebXRManager(renderer).isPresenting
    expect(result).toBe(Expected)
  })

  it('should set result.isMultiview to false', () => {
    const Expected = false
    // Sanity check before running
    assert(renderer)
    // Run and Check the result
    const result = createWebXRManager(renderer).isMultiview
    expect(result).toBe(Expected)
  })

  it('should set result.getSession to a function that returns XRState.session when called', () => {
    const Expected = getState(XRState).session
    // Sanity check before running
    assert(renderer)
    // Run and Check the result
    const resultFn = createWebXRManager(renderer).getSession
    const result = resultFn()
    expect(result).toBe(Expected) // Check that the object returned is the exact same
    expect(result).toEqual(Expected) // Check that the object returned contains the same values in its fields (deepEqual)
  })

  describe('result.getEnvironmentBlendMode', () => {
    it('should be set to a valid function', () => {
      // Sanity check before running
      assert(renderer)
      // Run and Check the result
      const result = createWebXRManager(renderer).getEnvironmentBlendMode
      expect(() => result()).does.not.throw()
      expect(typeof result).toBe(FunctionTypeName)
    })

    it('should return XRState.session.environmentBlendMode when XRState.session is not null', () => {
      const Expected = getState(XRState).session?.environmentBlendMode
      // Sanity check before running
      assert(renderer)
      expect(getState(XRState).session).not.toBe(null)
      // Run and Check the result
      const resultFn = createWebXRManager(renderer).getEnvironmentBlendMode
      const result = resultFn()
      expect(result).toBe(Expected)
      expect(result).toEqual(Expected)
    })

    it('should return undefined when XRState.session is null', () => {
      const Expected = undefined
      // Set the data as expected
      if (getState(XRState).session !== null) getMutableState(XRState).session.set(null)
      // Sanity check before running
      assert(renderer)
      expect(getState(XRState).session).toBe(null)
      // Run and Check the result
      const resultFn = createWebXRManager(renderer).getEnvironmentBlendMode
      const result = resultFn()
      expect(result).toBe(Expected)
      expect(result).toEqual(Expected)
    })
  }) //:: createWebXRManager.result.getEnvironmentBlendMode

  describe('result.setSession', () => {
    it('should be set to a valid function', () => {
      // Sanity check before running
      assert(renderer)
      // Run and Check the result
      const result = createWebXRManager(renderer).setSession
      expect(() => result(getState(XRState).session!)).does.not.throw()
      expect(typeof result).toBe(FunctionTypeName)
    })

    /**
    // @todo
    it("should not do anything if `@param session` is null", () => {})
    it("should set xrRendererState.initialRenderTarget to the value of `@param renderer`.getRenderTarget", () => {})
    it("should add an `'end'` event listener with the onSessionEnd function", () => {})
    it("should call session.updateTargetFrameRate with a value of 72 if session.updateTargetFrameRate is a function", () => {})
    it("should not call session.updateTargetFrameRate with a value of 72 if session.updateTargetFrameRate is not a function", () => {})
    it("should call WebGLRenderingContext makeXRCompatible when WebGLRenderingContext.getContextAttributes.xrCompatible is not true", () => {})

    // !!! @todo Find all of the ifCase/elseCase test cases  (two big separate functions)
    describe("should run ifCase() if `@param session`.renderState.layers is undefined or renderer.capabilities.isWebGL2 is false", () => {})
    describe("should run elseCase() if `@param session`.renderState.layers is not undefined", () => {})
    // !!!

    it("should run elseCase() if `@param session`.renderState.layers is renderer.capabilities.isWebGL2 is true", () => {})
    it("should set newRenderTarget.isXRRenderTarget to true", () => {})
    it("should set xrRendererState.newRenderTarget to the newRenderTarget generated by the ifCase/elseCase process", () => {})
    it("should call result.setFoveation with a value of 0", () => {})
    it("should call ECSState.timer.animation.setContext with the `@param session`", () => {})
    it("should call ECSState.timer.animation.stop", () => {})
    it("should call ECSState.timer.animation.start", () => {})
    it("should set result.isPresenting to true", () => {})
    */
  }) //:: createWebXRManager.result.setSession

  it('should set result.updateCamera to an empty function', () => {
    const Expected = {
      typeName: FunctionTypeName,
      codeString: VoidFunctionString
    }
    // Sanity check before running
    assert(renderer)
    // Run and Check the result
    const result = createWebXRManager(renderer).updateCamera
    expect(() => result()).does.not.throw()
    expect(typeof result).toBe(Expected.typeName)
    expect(result.toString()).toBe(Expected.codeString)
  })

  it('should set result.getCamera to a function that returns the EngineState.viewerEntity.CameraComponent', () => {
    const Expected = {
      typeName: FunctionTypeName,
      output: getComponent(getState(EngineState).viewerEntity, CameraComponent)
    }
    // Sanity check before running
    assert(renderer)
    // Run and Check the result
    const result = createWebXRManager(renderer).getCamera
    expect(() => result()).does.not.throw()
    expect(typeof result).toBe(Expected.typeName)
    const resultOutput = result()
    expect(resultOutput).toBe(Expected.output)
  })

  describe('result.getFoveation', () => {
    it('should be set to a valid function', () => {
      // Sanity check before running
      assert(renderer)
      // Run and Check the result
      const result = createWebXRManager(renderer).getFoveation
      expect(() => result()).does.not.throw()
      expect(typeof result).toBe(FunctionTypeName)
    })

    it('should return XRRendererState.glBaseLayer.fixedFoveation from XRRendererState.glBaseLayer when XRRendererState.glProjLayer is null and XRRendererState.glBaseLayer is not null', () => {
      const Expected = 42
      // Set the data as expected
      if (getState(XRRendererState).glProjLayer !== null) getMutableState(XRRendererState).glProjLayer.set(null)
      // if (getState(XRRendererState).glBaseLayer !== null) getMutableState(XRRendererState).glBaseLayer.set(null)
      getMutableState(XRRendererState).glBaseLayer.merge({ fixedFoveation: Expected })
      // Sanity check before running
      assert(renderer)
      expect(getState(XRRendererState).glProjLayer).toBe(null)
      expect(getState(XRRendererState).glBaseLayer).not.toBe(null)
      // Run and Check the result
      const getFoveation = createWebXRManager(renderer).getFoveation
      const result = getFoveation()
      expect(result).not.toBe(undefined)
      expect(result).toBe(Expected)
    })

    it('should return XRRendererState.glProjLayer.fixedFoveation from XRRendererState.glProjLayer when XRRendererState.glProjLayer is not null', () => {
      const Expected = 42
      // Set the data as expected
      // if (getState(XRRendererState).glProjLayer !== null) getMutableState(XRRendererState).glProjLayer.set(null)
      // if (getState(XRRendererState).glBaseLayer !== null) getMutableState(XRRendererState).glBaseLayer.set(null)
      getMutableState(XRRendererState).glProjLayer.merge({ fixedFoveation: Expected })
      // Sanity check before running
      assert(renderer)
      expect(getState(XRRendererState).glProjLayer).not.toBe(null)
      // expect(getState(XRRendererState).glBaseLayer).toBe(null)
      // Run and Check the result
      const getFoveation = createWebXRManager(renderer).getFoveation
      const result = getFoveation()
      expect(result).not.toBe(undefined)
      expect(result).toBe(Expected)
    })

    it('should return undefined when XRRendererState.glBaseLayer and XRRendererState.glProjLayer are both null', () => {
      const Expected = undefined
      // Set the data as expected
      if (getState(XRRendererState).glProjLayer !== null) getMutableState(XRRendererState).glProjLayer.set(null)
      if (getState(XRRendererState).glBaseLayer !== null) getMutableState(XRRendererState).glBaseLayer.set(null)
      // Sanity check before running
      assert(renderer)
      expect(getState(XRRendererState).glProjLayer).toBe(null)
      expect(getState(XRRendererState).glBaseLayer).toBe(null)
      // Run and Check the result
      const getFoveation = createWebXRManager(renderer).getFoveation
      const result = getFoveation()
      expect(result).toBe(Expected)
    })
  }) //:: createWebXRManager.result.getFoveation

  describe('result.setFoveation', () => {
    it('should be set to a valid function', () => {
      // Sanity check before running
      assert(renderer)
      // Run and Check the result
      const result = createWebXRManager(renderer).setFoveation
      expect(() => result(1234)).does.not.throw()
      expect(typeof result).toBe(FunctionTypeName)
    })

    it('should set XRRendererState.glProjLayer.fixedFoveation to `@param foveation` when XRRendererState.glProjLayer is not null', () => {
      const Expected = 42
      const Initial = 21
      // Set the data as expected
      // if (getState(XRRendererState).glProjLayer !== null) getMutableState(XRRendererState).glProjLayer.set(null)
      if (getState(XRRendererState).glBaseLayer !== null) getMutableState(XRRendererState).glBaseLayer.set(null)
      getMutableState(XRRendererState).glProjLayer.merge({ fixedFoveation: Initial })
      // Sanity check before running
      assert(renderer)
      expect(getState(XRRendererState).glProjLayer).not.toBe(null)
      expect(getState(XRRendererState).glBaseLayer).toBe(null)
      // Run and Check the result
      const setFoveation = createWebXRManager(renderer).setFoveation
      setFoveation(Expected)
      const result = getState(XRRendererState).glProjLayer?.fixedFoveation
      expect(result).toBe(Expected)
    })

    it('should set XRRendererState.glBaseLayer.fixedFoveation to `@param foveation` when XRRendererState.glBaseLayer is not null and XRRendererState.glBaseLayer.fixedFoveation it not undefined', () => {
      const Expected = 42
      const Initial = 21
      // Set the data as expected
      if (getState(XRRendererState).glProjLayer !== null) getMutableState(XRRendererState).glProjLayer.set(null)
      // if (getState(XRRendererState).glBaseLayer !== null) getMutableState(XRRendererState).glBaseLayer.set(null)
      getMutableState(XRRendererState).glBaseLayer.merge({ fixedFoveation: Initial })
      // Sanity check before running
      assert(renderer)
      expect(getState(XRRendererState).glProjLayer).toBe(null)
      expect(getState(XRRendererState).glBaseLayer).not.toBe(null)
      // Run and Check the result
      const setFoveation = createWebXRManager(renderer).setFoveation
      setFoveation(Expected)
      const result = getState(XRRendererState).glBaseLayer?.fixedFoveation
      expect(result).toBe(Expected)
    })
  }) //:: createWebXRManager.result.setFoveation

  it('should set result.setAnimationLoop to an empty function', () => {
    const Expected = {
      typeName: FunctionTypeName,
      codeString: VoidFunctionString
    }
    // Sanity check before running
    assert(renderer)
    // Run and Check the result
    const result = createWebXRManager(renderer).setAnimationLoop
    expect(() => result()).does.not.throw()
    expect(typeof result).toBe(Expected.typeName)
    expect(result.toString()).toBe(Expected.codeString)
  })

  it('should set result.dispose to an empty function', () => {
    const Expected = {
      typeName: FunctionTypeName,
      codeString: VoidFunctionString
    }
    // Sanity check before running
    assert(renderer)
    // Run and Check the result
    const result = createWebXRManager(renderer).dispose
    expect(() => result()).does.not.throw()
    expect(typeof result).toBe(Expected.typeName)
    expect(result.toString()).toBe(Expected.codeString)
  })

  it('should set result.addEventListener to an empty function', () => {
    const Expected = {
      typeName: FunctionTypeName,
      codeString: TypeListenerFunctionString
    }
    // Sanity check before running
    assert(renderer)
    // Run and Check the result
    const result = createWebXRManager(renderer).addEventListener
    expect(typeof result).toBe(Expected.typeName)
    expect(result.toString()).toBe(Expected.codeString)
  })

  it('should set result.hasEventListener to an empty function', () => {
    const Expected = {
      typeName: FunctionTypeName,
      codeString: TypeListenerFunctionString
    }
    // Sanity check before running
    assert(renderer)
    // Run and Check the result
    const result = createWebXRManager(renderer).hasEventListener
    expect(typeof result).toBe(Expected.typeName)
    expect(result.toString()).toBe(Expected.codeString)
  })

  it('should set result.removeEventListener to an empty function', () => {
    const Expected = {
      typeName: FunctionTypeName,
      codeString: TypeListenerFunctionString
    }
    // Sanity check before running
    assert(renderer)
    // Run and Check the result
    const result = createWebXRManager(renderer).removeEventListener
    expect(typeof result).toBe(Expected.typeName)
    expect(result.toString()).toBe(Expected.codeString)
  })

  it('should set result.dispatchEvent to an empty function', () => {
    const Expected = {
      typeName: FunctionTypeName,
      codeString: EventFunctionString
    }
    // Sanity check before running
    assert(renderer)
    // Run and Check the result
    const result = createWebXRManager(renderer).dispatchEvent
    expect(() => result({} as Event)).does.not.throw()
    expect(typeof result).toBe(Expected.typeName)
    expect(result.toString()).toBe(Expected.codeString)
  })
}) //:: createWebXRManager
