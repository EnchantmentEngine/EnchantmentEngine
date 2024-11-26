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

import {
  SystemDefinitions,
  SystemUUID,
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  getOptionalComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import { getMutableState } from '@ir-engine/hyperflux'
import { Quaternion, Vector3 } from 'three'
import { MockXRAnchor } from '../../tests/util/MockXR'
import { TransformComponent, XRAnchorComponent } from '../SpatialModule'
import { XRAnchorSystemState, updateAnchor } from './XRAnchorSystem'
import { XRAnchorSystem, XRCameraUpdateSystem } from './XRModule'
import { ReferenceSpace, XRState } from './XRState'

/** @note Runs once on the `describe` implied by vitest for this file */
beforeAll(() => {
  new CustomWebXRPolyfill()
})

describe('updateAnchor', () => {
  let testEntity = UndefinedEntity

  beforeEach(async () => {
    createEngine()
    await mockEmulatedXREngine()
    testEntity = createEntity()
  })

  afterEach(() => {
    removeEntity(testEntity)
    destroyEmulatedXREngine()
    destroyEngine()
  })

  it('should copy the XRPose position into the `@param entity`.TransformComponent.position', () => {
    const Expected = new Vector3(40, 41, 42)
    const Initial = new Vector3(20, 21, 22)
    // Set the data as expected
    const position = Expected as unknown as DOMPointReadOnly
    const rotation = new Quaternion(1, 2, 3, 4).normalize() as unknown as DOMPointReadOnly
    function getPoseMock(_: XRSpace, __: XRSpace): XRPose | undefined {
      return {
        transform: {
          position: position,
          orientation: rotation
        }
      } as XRPose
    }
    getMutableState(XRState).xrFrame.merge({ getPose: getPoseMock })
    setComponent(testEntity, XRAnchorComponent, { anchor: new MockXRAnchor() })
    setComponent(testEntity, TransformComponent, { position: Initial })
    // Sanity check before running
    expect(ReferenceSpace.localFloor).toBeTruthy()
    expect(getOptionalComponent(testEntity, XRAnchorComponent)).toBeTruthy()
    expect(getOptionalComponent(testEntity, XRAnchorComponent)?.anchor).toBeTruthy()
    const before = getComponent(testEntity, TransformComponent).position
    expect(before).not.toEqual(Expected)
    expect(before).toEqual(Initial)
    // Run and Check the result
    updateAnchor(testEntity)
    const result = getComponent(testEntity, TransformComponent).position
    expect(result).not.toEqual(Initial)
    expect(result).toEqual(Expected)
  })

  it('should copy the XRPose rotation into the `@param entity`.TransformComponent.rotation', () => {
    const Expected = new Quaternion(41, 42, 43, 44).normalize()
    const Initial = new Quaternion(5, 6, 7, 8).normalize()
    // Set the data as expected
    const position = new Vector3(20, 21, 22) as unknown as DOMPointReadOnly
    const rotation = Expected as unknown as DOMPointReadOnly
    function getPoseMock(_: XRSpace, __: XRSpace): XRPose | undefined {
      return {
        transform: {
          position: position,
          orientation: rotation
        }
      } as XRPose
    }
    getMutableState(XRState).xrFrame.merge({ getPose: getPoseMock })
    setComponent(testEntity, XRAnchorComponent, { anchor: new MockXRAnchor() })
    setComponent(testEntity, TransformComponent, { rotation: Initial })
    // Sanity check before running
    expect(ReferenceSpace.localFloor).toBeTruthy()
    expect(getOptionalComponent(testEntity, XRAnchorComponent)).toBeTruthy()
    expect(getOptionalComponent(testEntity, XRAnchorComponent)?.anchor).toBeTruthy()
    const before = getComponent(testEntity, TransformComponent).rotation
    expect(before).not.toEqual(Expected)
    expect(before).toEqual(Initial)
    // Run and Check the result
    updateAnchor(testEntity)
    const result = getComponent(testEntity, TransformComponent).rotation
    expect(result).not.toEqual(Initial)
    expect(result).toEqual(Expected)
  })

  it('should not do anything if the `@param entity` does not have an XRAnchorComponent', () => {
    const Incorrect = new Quaternion(41, 42, 43, 44).normalize()
    const Initial = new Quaternion(5, 6, 7, 8).normalize()
    // Set the data as expected
    const position = new Vector3(20, 21, 22) as unknown as DOMPointReadOnly
    const rotation = Incorrect as unknown as DOMPointReadOnly
    function getPoseMock(_: XRSpace, __: XRSpace): XRPose | undefined {
      return {
        transform: {
          position: position,
          orientation: rotation
        }
      } as XRPose
    }
    getMutableState(XRState).xrFrame.merge({ getPose: getPoseMock })
    // setComponent(testEntity, XRAnchorComponent, { anchor: new MockXRAnchor() })
    setComponent(testEntity, TransformComponent, { rotation: Initial })
    // Sanity check before running
    expect(ReferenceSpace.localFloor).toBeTruthy()
    expect(getOptionalComponent(testEntity, XRAnchorComponent)).toBeFalsy()
    expect(getOptionalComponent(testEntity, XRAnchorComponent)?.anchor).toBeFalsy()
    const before = getComponent(testEntity, TransformComponent).rotation
    expect(before).toEqual(Initial)
    expect(before).not.toEqual(Incorrect)
    // Run and Check the result
    updateAnchor(testEntity)
    const result = getComponent(testEntity, TransformComponent).rotation
    expect(result).toEqual(Initial)
    expect(result).not.toEqual(Incorrect)
  })

  it('should not do anything if ReferenceSpace.localFloor is falsy', () => {
    const Incorrect = new Quaternion(41, 42, 43, 44).normalize()
    const Initial = new Quaternion(5, 6, 7, 8).normalize()
    // Set the data as expected
    const position = new Vector3(20, 21, 22) as unknown as DOMPointReadOnly
    const rotation = Incorrect as unknown as DOMPointReadOnly
    function getPoseMock(_: XRSpace, __: XRSpace): XRPose | undefined {
      return {
        transform: {
          position: position,
          orientation: rotation
        }
      } as XRPose
    }
    getMutableState(XRState).xrFrame.merge({ getPose: getPoseMock })
    setComponent(testEntity, XRAnchorComponent, { anchor: new MockXRAnchor() })
    setComponent(testEntity, TransformComponent, { rotation: Initial })
    ReferenceSpace.localFloor = null
    // Sanity check before running
    expect(ReferenceSpace.localFloor).toBeFalsy()
    expect(getOptionalComponent(testEntity, XRAnchorComponent)).toBeTruthy()
    expect(getOptionalComponent(testEntity, XRAnchorComponent)?.anchor).toBeTruthy()
    const before = getComponent(testEntity, TransformComponent).rotation
    expect(before).toEqual(Initial)
    expect(before).not.toEqual(Incorrect)
    // Run and Check the result
    updateAnchor(testEntity)
    const result = getComponent(testEntity, TransformComponent).rotation
    expect(result).toEqual(Initial)
    expect(result).not.toEqual(Incorrect)
  })

  it('should not do anything if ReferenceSpace.localFloor is truthy but `XRFrame.getPose` returns a falsy value', () => {
    const Incorrect = new Quaternion(41, 42, 43, 44).normalize()
    const Initial = new Quaternion(5, 6, 7, 8).normalize()
    // Set the data as expected
    function getPoseMock(_: XRSpace, __: XRSpace): XRPose | undefined {
      return undefined
    }
    getMutableState(XRState).xrFrame.merge({ getPose: getPoseMock })
    setComponent(testEntity, XRAnchorComponent, { anchor: new MockXRAnchor() })
    setComponent(testEntity, TransformComponent, { rotation: Initial })
    // Sanity check before running
    expect(ReferenceSpace.localFloor).toBeTruthy()
    expect(getPoseMock({} as XRSpace, {} as XRSpace)).toBeFalsy()
    expect(getOptionalComponent(testEntity, XRAnchorComponent)).toBeTruthy()
    expect(getOptionalComponent(testEntity, XRAnchorComponent)?.anchor).toBeTruthy()
    const before = getComponent(testEntity, TransformComponent).rotation
    expect(before).toEqual(Initial)
    expect(before).not.toEqual(Incorrect)
    // Run and Check the result
    updateAnchor(testEntity)
    const result = getComponent(testEntity, TransformComponent).rotation
    expect(result).toEqual(Initial)
    expect(result).not.toEqual(Incorrect)
  })
}) //:: updateAnchor

describe('updateScenePlacement', () => {
  /*
  // @todo
  it("should set XRState.sceneScaleTarget to getTargetWorldSize(`@param scenePlacementEntity`.TransformComponent) when XRState.sceneScaleAutoMode is true", () => {})
  it("should set XRState.sceneScale to ??? when XRState.sceneScale is not equal to XRState.sceneScaleTarget", () => {})
  it("should copy `@param scenePlacementEntity`.TransformComponent.position into XRState.scenePosition", () => {})
  it("should set XRState.sceneRotation to the multiplication of `@param scenePlacementEntity`.TransformComponent.position and setFromAxisAngle(Vector3_Up, XRState.sceneRotationOffset)", () => {})
  */
}) //:: updateScenePlacement

describe('updateHitTest', () => {
  /*
  // @todo
  it("should not do anything if `@param entity`.XRHitTestComponent.source.value is falsy", () => {})
  it("should set `@param entity`.XRHitTestComponent.results to the output of XRFrame.getHitTestResults", () => {})
  it("should return early if XRFrame.getHitTestResults returned an array with length 0", () => {})
  it("should return early if hitTestResults[0].getPose(ReferenceSpace.localFloor) is falsy", () => {})
  it("should set `@param entity`.EntityTreeComponent.parentEntity to EngineState.localFloorEntity", () => {})
  it("should set `@param entity`.TransformComponent.position to the value of hitTestResults[0].getPose(ReferenceSpace.localFloor).transform.position", () => {})
  it("should set `@param entity`.TransformComponent.rotation to the value of hitTestResults[0].getPose(ReferenceSpace.localFloor).transform.orientation", () => {})
  */
}) //:: updateHitTest

describe('XRAnchorSystemState', () => {
  it('should initialize the *State.name field with the expected value', () => {
    expect(XRAnchorSystemState.name).toBe('XRAnchorSystemState')
  })

  it('should initialize the *State.initial field with the expected value', () => {
    expect(XRAnchorSystemState.initial).toEqual({
      scenePlacementEntity: UndefinedEntity,
      originAnchorEntity: UndefinedEntity
    })
  })
}) //:: XRAnchorSystemState

describe('XRAnchorSystem', () => {
  const System = SystemDefinitions.get(XRAnchorSystem)!

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
      expect(System.uuid).toBe('ee.engine.XRAnchorSystem')
    })

    it('should initialize the *System with the expected SystemUUID value', () => {
      expect(XRAnchorSystem).toBe('ee.engine.XRAnchorSystem' as SystemUUID)
    })

    it('should initialize the *System.insert field with the expected value', () => {
      expect(System.insert).not.toBe(undefined)
      expect(System.insert!.after).not.toBe(undefined)
      expect(System.insert!.after!).toBe(XRCameraUpdateSystem)
    })
  }) //:: Fields

  /** @todo */
  describe('execute', () => {}) //:: execute
  describe('reactor', () => {}) //:: reactor
}) //:: XRAnchorSystem
