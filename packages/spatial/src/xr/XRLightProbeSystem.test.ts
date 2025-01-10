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

import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { destroyEmulatedXREngine, mockEmulatedXREngine } from '../../tests/util/mockEmulatedXREngine'
import { CustomWebXRPolyfill } from '../../tests/webxr/emulator'

import {
  SystemDefinitions,
  SystemUUID,
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  setComponent
} from '@ir-engine/ecs'
import { getMutableState, getState, none } from '@ir-engine/hyperflux'
import { Color, ColorRepresentation, CubeTexture, LightProbe, Quaternion, SphericalHarmonics3 } from 'three'
import { assertVec } from '../../tests/util/assert'
import { DirectionalLightComponent, TransformComponent } from '../SpatialModule'
import { XRLightProbeState, XRLightProbeSystem } from './XRLightProbeSystem'
import { XRState } from './XRState'
import { XRSystem } from './XRSystem'

/** @note Runs once on the `describe` implied by vitest for this file */
beforeAll(() => {
  new CustomWebXRPolyfill()
})

describe('XRLightProbeSystem', () => {
  const System = SystemDefinitions.get(XRLightProbeSystem)!

  beforeEach(async () => {
    createEngine()
    await mockEmulatedXREngine()
    getMutableState(XRLightProbeState).probe.set({} as XRLightProbe)
  })

  afterEach(() => {
    destroyEmulatedXREngine()
    destroyEngine()
  })

  describe('Fields', () => {
    it('should initialize the *System.uuid field with the expected value', () => {
      expect(System.uuid).toBe('ee.engine.XRLightProbeSystem')
    })

    it('should initialize the *System with the expected SystemUUID value', () => {
      expect(XRLightProbeSystem).toBe('ee.engine.XRLightProbeSystem' as SystemUUID)
    })

    it('should initialize the *System.insert field with the expected value', () => {
      expect(System.insert).not.toBe(undefined)
      expect(System.insert!.with).not.toBe(undefined)
      expect(System.insert!.with!).toBe(XRSystem)
    })
  }) //:: Fields

  /** @todo */
  describe('reactor', () => {}) //:: reactor

  describe('execute,', () => {
    it('should call XRState.xrFrame.getLightEstimate with XRLightProbeState.probe', () => {
      // Set the data as expected
      const resultSpy = vi.fn()
      getMutableState(XRState).xrFrame.merge({ getLightEstimate: resultSpy })
      // Sanity check before running
      expect(getState(XRState).xrFrame).toBeTruthy()
      expect(getState(XRLightProbeState).probe).toBeTruthy()
      expect('getLightEstimate' in getState(XRState).xrFrame!).toBeTruthy()
      expect(resultSpy).not.toHaveBeenCalled()
      // Run and Check the result
      System.execute()
      expect(resultSpy).toHaveBeenCalled()
    })

    it('should not do anything if XRState.xrFrame is falsy', () => {
      // Set the data as expected
      const resultSpy = vi.fn()
      getMutableState(XRState).xrFrame.set(none)
      // getMutableState(XRState).xrFrame.merge({getLightEstimate: resultSpy})
      // Sanity check before running
      expect(getState(XRState).xrFrame).toBeFalsy()
      expect(getState(XRLightProbeState).probe).toBeTruthy()
      // expect('getLightEstimate' in getState(XRState).xrFrame!).toBeTruthy()
      expect(resultSpy).not.toHaveBeenCalled()
      // Run and Check the result
      System.execute()
      expect(resultSpy).not.toHaveBeenCalled()
    })

    it('should not do anything if XRLightProbeState.probe is falsy', () => {
      // Set the data as expected
      const resultSpy = vi.fn()
      getMutableState(XRState).xrFrame.merge({ getLightEstimate: resultSpy })
      getMutableState(XRLightProbeState).probe.set(none)
      // Sanity check before running
      expect(getState(XRState).xrFrame).toBeTruthy()
      expect(getState(XRLightProbeState).probe).toBeFalsy()
      expect('getLightEstimate' in getState(XRState).xrFrame!).toBeTruthy()
      expect(resultSpy).not.toHaveBeenCalled()
      // Run and Check the result
      System.execute()
      expect(resultSpy).not.toHaveBeenCalled()
    })

    it("should not do anything if XRState.xrFrame does not have a property named 'getLightEstimate'", () => {
      // Set the data as expected
      const resultSpy = vi.fn()
      // getMutableState(XRState).xrFrame.merge({getLightEstimate: resultSpy})
      // Sanity check before running
      expect(getState(XRState).xrFrame).toBeTruthy()
      expect(getState(XRLightProbeState).probe).toBeTruthy()
      expect('getLightEstimate' in getState(XRState).xrFrame!).toBeFalsy()
      expect(resultSpy).not.toHaveBeenCalled()
      // Run and Check the result
      System.execute()
      expect(resultSpy).not.toHaveBeenCalled()
    })

    it('should set XRLightProbeState.isEstimatingLight to true if its falsy', () => {
      const Expected = true
      // Set the data as expected
      getMutableState(XRState).xrFrame.merge({
        getLightEstimate: (_: XRLightProbe) => {
          return {} as XRLightEstimate
        }
      })
      // Sanity check before running
      expect(getState(XRState).xrFrame).toBeTruthy()
      expect(getState(XRLightProbeState).probe).toBeTruthy()
      expect('getLightEstimate' in getState(XRState).xrFrame!).toBeTruthy()
      expect(getState(XRState).xrFrame?.getLightEstimate?.(getState(XRLightProbeState).probe!)).toBeTruthy()
      expect(getState(XRLightProbeState).isEstimatingLight).toBeFalsy()
      // Run and Check the result
      System.execute()
      const result = getState(XRLightProbeState).isEstimatingLight
      expect(result).toBe(Expected)
    })

    it('should not do anything else (return) if the return value of XRState.xrFrame.getLightEstimate(XRLightProbeState.probe) is falsy', () => {
      const Initial = undefined
      // Set the data as expected
      getMutableState(XRState).xrFrame.merge({
        getLightEstimate: (_: XRLightProbe) => {
          return null as any as XRLightEstimate
        }
      })
      getMutableState(XRLightProbeState).isEstimatingLight.set(Initial as any)
      // Sanity check before running
      expect(getState(XRState).xrFrame).toBeTruthy()
      expect(getState(XRLightProbeState).probe).toBeTruthy()
      expect('getLightEstimate' in getState(XRState).xrFrame!).toBeTruthy()
      expect(getState(XRState).xrFrame?.getLightEstimate?.(getState(XRLightProbeState).probe!)).toBeFalsy()
      const before = getState(XRLightProbeState).isEstimatingLight
      expect(before).toBe(Initial)
      // Run and Check the result
      System.execute()
      const result = getState(XRLightProbeState).isEstimatingLight
      expect(result).toBe(Initial)
    })

    it('should set XRLightProbeState.lightProbe.sh to XRState.xrFrame.getLightEstimate(XRLightProbeState.probe).sphericalHarmonicsCoefficients', () => {
      const Expected = new SphericalHarmonics3().fromArray([
        40, 40, 40, 41, 41, 41, 42, 42, 42, 43, 43, 43, 44, 44, 44, 45, 45, 45, 46, 46, 46, 47, 47, 47, 48, 48, 48
      ])
      const Initial = new SphericalHarmonics3().fromArray([20, 21, 22])
      // Set the data as expected
      const lightEstimate = {
        sphericalHarmonicsCoefficients: new Float32Array(Expected.toArray()),
        primaryLightIntensity: { x: 10, y: 11, z: 12 } as DOMPointReadOnly,
        primaryLightDirection: { x: 1, y: 2, z: 3 } as DOMPointReadOnly
      } as XRLightEstimate
      getMutableState(XRState).xrFrame.merge({
        getLightEstimate: (_: XRLightProbe) => {
          return lightEstimate
        }
      })
      getMutableState(XRLightProbeState).lightProbe.sh.set(Initial)
      const directionalLightEntity = createEntity()
      setComponent(directionalLightEntity, DirectionalLightComponent)
      setComponent(directionalLightEntity, TransformComponent)
      getMutableState(XRLightProbeState).directionalLightEntity.set(directionalLightEntity)
      // Sanity check before running
      expect(getState(XRState).xrFrame).toBeTruthy()
      expect(getState(XRLightProbeState).probe).toBeTruthy()
      expect('getLightEstimate' in getState(XRState).xrFrame!).toBeTruthy()
      expect(getState(XRState).xrFrame?.getLightEstimate?.(getState(XRLightProbeState).probe!)).toBeTruthy()
      expect(getState(XRLightProbeState).directionalLightEntity).toBeTruthy()
      const before = getState(XRLightProbeState).lightProbe.sh
      expect(before).not.toBe(Expected)
      expect(before).not.toEqual(Expected)
      // Run and Check the result
      System.execute()
      const result = getState(XRLightProbeState).lightProbe.sh
      expect(result).toEqual(Expected)
    })

    it('should not do anything else (return) if XRLightProbeState.directionalLightEntity is falsy', () => {
      const Expected = new SphericalHarmonics3().fromArray([
        40, 40, 40, 41, 41, 41, 42, 42, 42, 43, 43, 43, 44, 44, 44, 45, 45, 45, 46, 46, 46, 47, 47, 47, 48, 48, 48
      ])
      const Initial = new SphericalHarmonics3().fromArray([20, 21, 22])
      // Set the data as expected
      const lightEstimate = {
        sphericalHarmonicsCoefficients: new Float32Array(Expected.toArray()),
        primaryLightIntensity: { x: 10, y: 11, z: 12 } as DOMPointReadOnly,
        primaryLightDirection: { x: 1, y: 2, z: 3 } as DOMPointReadOnly
      } as XRLightEstimate
      getMutableState(XRState).xrFrame.merge({
        getLightEstimate: (_: XRLightProbe) => {
          return lightEstimate
        }
      })
      getMutableState(XRLightProbeState).lightProbe.sh.set(Initial)
      const directionalLightEntity = UndefinedEntity
      getMutableState(XRLightProbeState).directionalLightEntity.set(directionalLightEntity)
      // Sanity check before running
      expect(getState(XRState).xrFrame).toBeTruthy()
      expect(getState(XRLightProbeState).probe).toBeTruthy()
      expect('getLightEstimate' in getState(XRState).xrFrame!).toBeTruthy()
      expect(getState(XRState).xrFrame?.getLightEstimate?.(getState(XRLightProbeState).probe!)).toBeTruthy()
      expect(getState(XRLightProbeState).directionalLightEntity).toBeFalsy()
      const before = getState(XRLightProbeState).lightProbe.sh
      expect(before).not.toBe(Expected)
      expect(before).not.toEqual(Expected)
      // Run and Check the result
      System.execute()
      const result = getState(XRLightProbeState).lightProbe.sh
      expect(result).not.toEqual(Expected)
    })

    it('should set XRLightProbeState.lightProbe.intensity to 1.0', () => {
      const Expected = 1.0
      const Initial = 0.42
      // Set the data as expected
      const lightEstimate = {
        sphericalHarmonicsCoefficients: new Float32Array(),
        primaryLightIntensity: { x: 10, y: 11, z: 12 } as DOMPointReadOnly,
        primaryLightDirection: { x: 1, y: 2, z: 3 } as DOMPointReadOnly
      } as XRLightEstimate
      getMutableState(XRState).xrFrame.merge({
        getLightEstimate: (_: XRLightProbe) => {
          return lightEstimate
        }
      })
      const directionalLightEntity = createEntity()
      setComponent(directionalLightEntity, DirectionalLightComponent)
      setComponent(directionalLightEntity, TransformComponent)
      getMutableState(XRLightProbeState).directionalLightEntity.set(directionalLightEntity)
      getMutableState(XRLightProbeState).lightProbe.intensity.set(Initial)
      // Sanity check before running
      expect(getState(XRState).xrFrame).toBeTruthy()
      expect(getState(XRLightProbeState).probe).toBeTruthy()
      expect('getLightEstimate' in getState(XRState).xrFrame!).toBeTruthy()
      expect(getState(XRState).xrFrame?.getLightEstimate?.(getState(XRLightProbeState).probe!)).toBeTruthy()
      expect(getState(XRLightProbeState).directionalLightEntity).toBeTruthy()
      const before = getState(XRLightProbeState).lightProbe.intensity
      expect(before).toBe(Initial)
      expect(before).not.toBe(Expected)
      // Run and Check the result
      System.execute()
      const result = getState(XRLightProbeState).lightProbe.intensity
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
    })

    it('should set XRLightProbeState.directionalLightEntity.DirectionalLightComponent.color to the expected color', () => {
      const Expected = 15463935 as ColorRepresentation
      const Initial = 16777215 as ColorRepresentation
      // Set the data as expected
      const lightEstimate = {
        sphericalHarmonicsCoefficients: new Float32Array(),
        primaryLightIntensity: { x: 10, y: 11, z: 12 } as DOMPointReadOnly,
        primaryLightDirection: { x: 1, y: 2, z: 3 } as DOMPointReadOnly
      } as XRLightEstimate
      getMutableState(XRState).xrFrame.merge({
        getLightEstimate: (_: XRLightProbe) => {
          return lightEstimate
        }
      })
      const directionalLightEntity = createEntity()
      setComponent(directionalLightEntity, DirectionalLightComponent, { color: Initial })
      setComponent(directionalLightEntity, TransformComponent)
      getMutableState(XRLightProbeState).directionalLightEntity.set(directionalLightEntity)
      // Sanity check before running
      expect(getState(XRState).xrFrame).toBeTruthy()
      expect(getState(XRLightProbeState).probe).toBeTruthy()
      expect('getLightEstimate' in getState(XRState).xrFrame!).toBeTruthy()
      expect(getState(XRState).xrFrame?.getLightEstimate?.(getState(XRLightProbeState).probe!)).toBeTruthy()
      expect(getState(XRLightProbeState).directionalLightEntity).toBeTruthy()
      const before = getComponent(getState(XRLightProbeState).directionalLightEntity, DirectionalLightComponent)
        .color as Color
      expect(before.getHex()).toEqual(Initial)
      expect(before.getHex()).not.toEqual(Expected)
      // Run and Check the result
      System.execute()
      const result = getComponent(getState(XRLightProbeState).directionalLightEntity, DirectionalLightComponent)
        .color as Color
      expect(result.getHex()).not.toBe(Initial)
      expect(result.getHex()).toBe(Expected)
    })

    it('should set XRLightProbeState.directionalLightEntity.DirectionalLightComponent.intensity to the value of the intensityScalar internal variable', () => {
      const Expected = 12
      const Initial = 0.42
      // Set the data as expected
      const lightEstimate = {
        sphericalHarmonicsCoefficients: new Float32Array(),
        primaryLightIntensity: { x: 10, y: 11, z: 12 } as DOMPointReadOnly,
        primaryLightDirection: { x: 1, y: 2, z: 3 } as DOMPointReadOnly
      } as XRLightEstimate
      getMutableState(XRState).xrFrame.merge({
        getLightEstimate: (_: XRLightProbe) => {
          return lightEstimate
        }
      })
      const directionalLightEntity = createEntity()
      setComponent(directionalLightEntity, DirectionalLightComponent, { intensity: Initial })
      setComponent(directionalLightEntity, TransformComponent)
      getMutableState(XRLightProbeState).directionalLightEntity.set(directionalLightEntity)
      // Sanity check before running
      expect(getState(XRState).xrFrame).toBeTruthy()
      expect(getState(XRLightProbeState).probe).toBeTruthy()
      expect('getLightEstimate' in getState(XRState).xrFrame!).toBeTruthy()
      expect(getState(XRState).xrFrame?.getLightEstimate?.(getState(XRLightProbeState).probe!)).toBeTruthy()
      expect(getState(XRLightProbeState).directionalLightEntity).toBeTruthy()
      const before = getComponent(
        getState(XRLightProbeState).directionalLightEntity,
        DirectionalLightComponent
      ).intensity
      expect(before).toEqual(Initial)
      expect(before).not.toEqual(Expected)
      // Run and Check the result
      System.execute()
      const result = getComponent(
        getState(XRLightProbeState).directionalLightEntity,
        DirectionalLightComponent
      ).intensity
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
    })

    it('should set XRLightProbeState.directionalLightEntity.TransformComponent.rotation from the vectors (Vector3_Zero, lightEstimate.primaryLightDirection)', () => {
      const Expected = new Quaternion(0, 0, 0, 1).normalize()
      const Initial = new Quaternion(1, 2, 3, 4).normalize()
      // Set the data as expected
      const lightEstimate = {
        sphericalHarmonicsCoefficients: new Float32Array(),
        primaryLightIntensity: { x: 10, y: 11, z: 12 } as DOMPointReadOnly,
        primaryLightDirection: { x: 1, y: 2, z: 3 } as DOMPointReadOnly
      } as XRLightEstimate
      getMutableState(XRState).xrFrame.merge({
        getLightEstimate: (_: XRLightProbe) => {
          return lightEstimate
        }
      })
      const directionalLightEntity = createEntity()
      setComponent(directionalLightEntity, DirectionalLightComponent)
      setComponent(directionalLightEntity, TransformComponent, { rotation: Initial })
      getMutableState(XRLightProbeState).directionalLightEntity.set(directionalLightEntity)
      // Sanity check before running
      expect(getState(XRState).xrFrame).toBeTruthy()
      expect(getState(XRLightProbeState).probe).toBeTruthy()
      expect('getLightEstimate' in getState(XRState).xrFrame!).toBeTruthy()
      expect(getState(XRState).xrFrame?.getLightEstimate?.(getState(XRLightProbeState).probe!)).toBeTruthy()
      expect(getState(XRLightProbeState).directionalLightEntity).toBeTruthy()
      const before = getComponent(getState(XRLightProbeState).directionalLightEntity, TransformComponent).rotation
      assertVec.approxEq(before, Initial, 4)
      assertVec.anyApproxNotEq(before, Expected, 4)
      // Run and Check the result
      System.execute()
      const result = getComponent(getState(XRLightProbeState).directionalLightEntity, TransformComponent).rotation
      assertVec.anyApproxNotEq(result, Initial, 4)
      assertVec.approxEq(result, Expected, 4)
    })
  }) //:: execute
}) //:: XRLightProbeSystem

describe('XRLightProbeState', () => {
  describe('Fields', () => {
    it('should initialize the *State.name field with the expected value', () => {
      expect(XRLightProbeState.name).toBe('ee.xr.LightProbe')
    })

    it('should initialize the *State with the expected initial values', () => {
      const Expected = {
        isEstimatingLight: false,
        lightProbe: new LightProbe(),
        probe: null as XRLightProbe | null,
        directionalLightEntity: UndefinedEntity,
        environment: null as CubeTexture | null,
        xrWebGLBinding: null as XRWebGLBinding | null
      }
      const result = XRLightProbeState.initial()
      expect(result['isEstimatingLight']).toEqual(Expected['isEstimatingLight'])
      expect(result['lightProbe']['metadata']).toEqual(Expected['lightProbe']['metadata'])
      expect(result['lightProbe']['object']).toEqual(Expected['lightProbe']['object'])
      expect(result['probe']).toEqual(Expected['probe'])
      expect(result['directionalLightEntity']).toEqual(Expected['directionalLightEntity'])
      expect(result['environment']).toEqual(Expected['environment'])
      expect(result['xrWebGLBinding']).toEqual(Expected['xrWebGLBinding'])
    })
  }) //:: Fields
}) //:: XRLightProbeState
