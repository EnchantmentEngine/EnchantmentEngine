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
import { afterEach, assert, beforeEach, describe, expect, it, vi } from 'vitest'
import { MockXRFrame } from '../../tests/util/MockXR'
import { assertVec } from '../../tests/util/assert'
import { destroyEmulatedXREngine, mockEmulatedXREngine } from '../../tests/util/mockEmulatedXREngine'
import { mockSpatialEngine } from '../../tests/util/mockSpatialEngine'
import { requestEmulatedXRSession } from '../../tests/webxr/emulator'

import {
  EntityTreeComponent,
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  hasComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import { BufferGeometry, Quaternion, ShadowMaterial, Vector3 } from 'three'
import { ReferenceSpaceState } from '../ReferenceSpaceState'
import { TransformComponent } from '../SpatialModule'
import { NameComponent } from '../common/NameComponent'
import { ObjectComponent } from '../renderer/components/ObjectComponent'
import { VisibleComponent } from '../renderer/components/VisibleComponent'
import { XRDetectedMeshComponent } from './XRDetectedMeshComponent'
import { ReferenceSpace, XRState } from './XRState'

describe('XRDetectedMeshComponent', () => {
  describe('Fields', () => {
    it('should initialize the *Component.name field with the expected value', () => {
      expect(XRDetectedMeshComponent.name).toBe('XRDetectedMeshComponent')
    })
  }) //:: Fields

  describe('createGeometryFromMesh', () => {
    it('should create a BufferGeometry object and return it', () => {
      // Run and Check the result
      const result = XRDetectedMeshComponent.createGeometryFromMesh({} as XRMesh)
      expect(result).not.toBe(undefined)
      expect(result).not.toBe(null)
      expect(result.isBufferGeometry).not.toBe(undefined)
      expect(result.isBufferGeometry).toBe(true)
    })

    it("should call setAttribute('position') with a new BufferAttribute made from the `@param mesh` vertices property", () => {
      const Expected = new Float32Array([40, 41, 42, 43, 44, 45, 46, 47, 48])
      // Set the data as expected
      const mesh = { vertices: Expected } as XRMesh
      // Run and Check the result
      const result = XRDetectedMeshComponent.createGeometryFromMesh(mesh)
      expect(result).not.toBe(undefined)
      expect(result).not.toBe(null)
      expect(result.hasAttribute('position'))
      expect(result.getAttribute('position').array).toEqual(Expected)
    })

    it('should call setIndex() with a new BufferAttribute made from the `@param mesh` indices property', () => {
      const Expected = new Uint32Array([40, 41, 42, 43, 44, 45, 46, 47, 48])
      const Vertices = new Float32Array([40, 41, 42, 43, 44, 45, 46, 47, 48])
      // Set the data as expected
      const mesh = { vertices: Vertices, indices: Expected } as XRMesh
      // Run and Check the result
      const result = XRDetectedMeshComponent.createGeometryFromMesh(mesh)
      expect(result).not.toBe(undefined)
      expect(result).not.toBe(null)
      expect(result.getIndex()).not.toBe(null)
      expect(result.getIndex()?.array).toEqual(Expected)
    })

    it('should call computeBoundingBox on the resulting object', () => {
      // Set the data as expected
      const mesh = {} as XRMesh
      // Run and Check the result
      const result = XRDetectedMeshComponent.createGeometryFromMesh(mesh)
      expect(result).not.toBe(undefined)
      expect(result).not.toBe(null)
      expect(result.boundingBox).not.toBe(null)
    })

    it('should call computeBoundingSphere on the resulting object', () => {
      // Set the data as expected
      const mesh = {} as XRMesh
      // Run and Check the result
      const result = XRDetectedMeshComponent.createGeometryFromMesh(mesh)
      expect(result).not.toBe(undefined)
      expect(result).not.toBe(null)
      expect(result.boundingSphere).not.toBe(null)
    })
  }) //:: createGeometryFromMesh

  describe('updateMeshGeometry', () => {
    beforeEach(async () => {
      createEngine()
      mockEmulatedXREngine()
    })

    afterEach(() => {
      destroyEmulatedXREngine()
      destroyEngine()
    })

    it('should set XRDetectedMeshComponent.meshesLastChangedTimes for the mesh to the value of `@param mesh`.lastChangedTime', () => {
      const Expected = 42
      // Set the data as expected
      const mesh = { lastChangedTime: Expected } as XRMesh
      const before = XRDetectedMeshComponent.detectedMeshesMap.get(mesh)
      expect(before).toBe(undefined)
      // Run and Check the result
      XRDetectedMeshComponent.updateMeshGeometry(createEntity(), mesh)
      const result = XRDetectedMeshComponent.meshesLastChangedTimes.get(mesh)
      expect(result).toBe(Expected)
    })
  }) //:: updateMeshGeometry

  describe('updateMeshPose', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      mockSpatialEngine()
      await requestEmulatedXRSession()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroyEmulatedXREngine()
      destroyEngine()
    })

    it('should update the TransformComponent.position of the `@param entity` with the value of PlanePose.transform.position', () => {
      const Expected = new Vector3()
      const Initial = new Vector3(1, 2, 3)
      // Set the data as expected
      // @ts-expect-error Allow coercing the MockXRFrame type into the xrFrame property
      const xrFrame = new MockXRFrame() as XRFrame
      // xrFrame.getPose = () => undefined
      getMutableState(XRState).xrFrame.set(xrFrame)
      setComponent(testEntity, TransformComponent, { position: Initial })
      const mesh = {} as XRMesh
      // Sanity check before running
      const before = getComponent(testEntity, TransformComponent).position.clone()
      assertVec.approxEq(before, Initial, 3)
      assertVec.anyApproxNotEq(before, Expected, 3)
      // Run and Check the result
      XRDetectedMeshComponent.updateMeshPose(testEntity, mesh)
      const result = getComponent(testEntity, TransformComponent).position.clone()
      assertVec.approxEq(result, Expected, 3)
    })

    it('should update the TransformComponent.rotation of the `@param entity` with the value of PlanePose.transform.rotation', () => {
      const Expected = new Quaternion(0, 0, 0, 0)
      const Initial = new Quaternion(1, 2, 3, 4).normalize()
      // Set the data as expected
      // @ts-expect-error Allow coercing the MockXRFrame type into the xrFrame property
      const xrFrame = new MockXRFrame() as XRFrame
      // xrFrame.getPose = () => undefined
      getMutableState(XRState).xrFrame.set(xrFrame)
      setComponent(testEntity, TransformComponent, { rotation: Initial })
      const mesh = {} as XRMesh
      // Sanity check before running
      const before = getComponent(testEntity, TransformComponent).rotation.clone()
      assertVec.approxEq(before, Initial, 4)
      assertVec.anyApproxNotEq(before, Expected, 4)
      // Run and Check the result
      XRDetectedMeshComponent.updateMeshPose(testEntity, mesh)
      const result = getComponent(testEntity, TransformComponent).rotation.clone()
      assertVec.approxEq(result, Expected, 4)
    })

    it('should not do anything when XRState.xrFrame.getPose(`@param mesh`.meshSpace, ReferenceSpace.localFloor) is falsy', () => {
      const Initial = new Vector3(1, 2, 3)
      const ChangedValue = new Vector3()
      // Set the data as expected
      // @ts-expect-error Allow coercing the MockXRFrame type into the xrFrame property
      const xrFrame = new MockXRFrame() as XRFrame
      xrFrame.getPose = () => undefined
      getMutableState(XRState).xrFrame.set(xrFrame)
      setComponent(testEntity, TransformComponent, { position: Initial })
      const mesh = {} as XRMesh
      getState(XRState).xrFrame!.getPose(mesh.meshSpace, ReferenceSpace.localFloor!)!
      // Sanity check before running
      const planePose = getState(XRState).xrFrame!.getPose(mesh.meshSpace, ReferenceSpace.localFloor!)!
      expect(planePose).toBeFalsy()
      const before = getComponent(testEntity, TransformComponent).position.clone()
      assertVec.approxEq(before, Initial, 3)
      assertVec.anyApproxNotEq(before, ChangedValue, 3)
      // Run and Check the result
      XRDetectedMeshComponent.updateMeshPose(testEntity, mesh)
      const result = getComponent(testEntity, TransformComponent).position.clone()
      assertVec.approxEq(result, Initial, 3)
      assertVec.anyApproxNotEq(result, ChangedValue, 3)
    })
  }) //:: updateMeshPose

  describe('foundMesh', () => {
    beforeEach(async () => {
      createEngine()
      mockEmulatedXREngine()
    })

    afterEach(() => {
      destroyEmulatedXREngine()
      destroyEngine()
    })

    it('should set the XRDetectedMeshComponent.detectedMeshesMap entry for the `@param mesh` to have the newly created entity', () => {
      // Set the data as expected
      const mesh = {} as XRMesh
      const before = XRDetectedMeshComponent.detectedMeshesMap.get(mesh)
      expect(before).toBe(undefined)
      // Run and Check the result
      XRDetectedMeshComponent.foundMesh(mesh)
      const result = XRDetectedMeshComponent.detectedMeshesMap.get(mesh)
      expect(result).not.toBe(undefined)
      expect(result).not.toBe(UndefinedEntity)
    })

    it('should add an EntityTreeComponent to the new entity and set its parentEntity to ReferenceSpaceState.localFloorEntity', () => {
      // Set the data as expected
      const mesh = {} as XRMesh
      const before = XRDetectedMeshComponent.detectedMeshesMap.get(mesh)
      expect(before).toBe(undefined)
      // Run and Check the result
      XRDetectedMeshComponent.foundMesh(mesh)
      const result = XRDetectedMeshComponent.detectedMeshesMap.get(mesh)
      assert(result)
      expect(result).not.toBe(undefined)
      expect(result).not.toBe(UndefinedEntity)
      expect(hasComponent(result, EntityTreeComponent)).toBe(true)
      expect(getComponent(result, EntityTreeComponent).parentEntity).toBe(
        getState(ReferenceSpaceState).localFloorEntity
      )
    })

    it('should add TransformComponent to the new entity', () => {
      // Set the data as expected
      const mesh = {} as XRMesh
      const before = XRDetectedMeshComponent.detectedMeshesMap.get(mesh)
      expect(before).toBe(undefined)
      // Run and Check the result
      XRDetectedMeshComponent.foundMesh(mesh)
      const result = XRDetectedMeshComponent.detectedMeshesMap.get(mesh)
      assert(result)
      expect(result).not.toBe(undefined)
      expect(result).not.toBe(UndefinedEntity)
      expect(hasComponent(result, TransformComponent)).toBe(true)
    })

    it('should add a VisibleComponent to the new entity', () => {
      // Set the data as expected
      const mesh = {} as XRMesh
      const before = XRDetectedMeshComponent.detectedMeshesMap.get(mesh)
      expect(before).toBe(undefined)
      // Run and Check the result
      XRDetectedMeshComponent.foundMesh(mesh)
      const result = XRDetectedMeshComponent.detectedMeshesMap.get(mesh)
      assert(result)
      expect(result).not.toBe(undefined)
      expect(result).not.toBe(UndefinedEntity)
      expect(hasComponent(result, VisibleComponent)).toBe(true)
    })

    it("should add a NameComponent to the new entity with a value of 'mesh-'+planeId", () => {
      // Set the data as expected
      const mesh = {} as XRMesh
      const before = XRDetectedMeshComponent.detectedMeshesMap.get(mesh)
      expect(before).toBe(undefined)
      // Run and Check the result
      XRDetectedMeshComponent.foundMesh(mesh)
      const result = XRDetectedMeshComponent.detectedMeshesMap.get(mesh)
      assert(result)
      expect(result).not.toBe(undefined)
      expect(result).not.toBe(UndefinedEntity)
      expect(hasComponent(result, NameComponent)).toBe(true)
      expect(getComponent(result, NameComponent).startsWith('mesh-')).toBe(true)
    })

    it('should add a XRDetectedMeshComponent to the new entity with `@param mesh` as its XRDetectedMeshComponent.mesh property', () => {
      // Set the data as expected
      const mesh = {} as XRMesh
      const before = XRDetectedMeshComponent.detectedMeshesMap.get(mesh)
      expect(before).toBe(undefined)
      // Run and Check the result
      XRDetectedMeshComponent.foundMesh(mesh)
      const result = XRDetectedMeshComponent.detectedMeshesMap.get(mesh)
      assert(result)
      expect(result).not.toBe(undefined)
      expect(result).not.toBe(UndefinedEntity)
      expect(hasComponent(result, XRDetectedMeshComponent)).toBe(true)
      expect(getComponent(result, XRDetectedMeshComponent).mesh).toBe(mesh)
    })

    it('should set XRDetectedMeshComponent.meshesLastChangedTimes for the mesh to the value of `@param mesh`.lastChangedTime', () => {
      const Expected = 42
      // Set the data as expected
      const mesh = { lastChangedTime: Expected } as XRMesh
      const before = XRDetectedMeshComponent.detectedMeshesMap.get(mesh)
      expect(before).toBe(undefined)
      // Run and Check the result
      XRDetectedMeshComponent.foundMesh(mesh)
      const entity = XRDetectedMeshComponent.detectedMeshesMap.get(mesh)
      assert(entity)
      expect(entity).not.toBe(undefined)
      expect(entity).not.toBe(UndefinedEntity)
      const result = XRDetectedMeshComponent.meshesLastChangedTimes.get(mesh)
      expect(result).toBe(Expected)
    })
  }) //:: foundMesh

  /** @todo */
  describe('reactor', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      mockEmulatedXREngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroyEmulatedXREngine()
      destroyEngine()
    })

    describe('XRDetectedMeshComponent.mesh', () => {
      it.todo('should not do anything if XRDetectedMeshComponent.mesh.value is falsy', () => {})

      /** @todo Why is the hook not triggered again after setting the component ?? */
      it.todo(
        'should call XRDetectedMeshComponent.createGeometryFromMesh with XRDetectedMeshComponent.mesh.value as its argument',
        async () => {
          const Expected = {} as XRMesh
          const Initial = { semanticLabel: 'testLabel' } as XRMesh
          // Set the data as expected
          const resultSpy = vi.spyOn(XRDetectedMeshComponent, 'createGeometryFromMesh')

          // Sanity check before running
          expect(resultSpy).toHaveBeenCalledTimes(0)
          setComponent(testEntity, XRDetectedMeshComponent, { mesh: Initial })

          // const { rerender, unmount } = render(<></>)
          // await act(async () => rerender(<></>))

          expect(resultSpy).toHaveBeenCalledTimes(1)
          expect(getComponent(testEntity, XRDetectedMeshComponent).mesh).toBeTruthy()

          // Run and Check the result
          setComponent(testEntity, XRDetectedMeshComponent, { mesh: Expected })
          // XRDetectedMeshComponent.reactorMap.get(testEntity)!.stop()
          // XRDetectedMeshComponent.reactorMap.get(testEntity)!.run()

          // await act(async () => rerender(<></>))

          // await vi.waitFor(() => {
          expect(resultSpy).toHaveBeenCalledTimes(2)
          expect(resultSpy).toHaveBeenCalledWith(Expected)
          // })

          // unmount()
        }
      )

      /** @todo Why is the hook not triggered again after setting the component ?? */
      it.todo('should set XRDetectedMeshComponent.geometry to the newly created geometry', async () => {
        const Initial = { id: 42 } as BufferGeometry
        // Set the data as expected
        setComponent(testEntity, XRDetectedMeshComponent, { geometry: Initial })
        // Sanity check before running
        const before = getComponent(testEntity, XRDetectedMeshComponent).geometry
        expect(before).toBe(Initial)
        // Run and Check the result
        setComponent(testEntity, XRDetectedMeshComponent, { mesh: { semanticLabel: 'testLabel' } as XRMesh })
        await vi.waitFor(() => {
          const result = getComponent(testEntity, XRDetectedMeshComponent).geometry
          expect(result).not.toBe(Initial) // A change in .mesh should trigger a change in .geometry
        })
      })

      it.todo(
        'should create a new Mesh object with XRDetectedMeshComponent.shadowMaterial and set an ObjectComponent to the entityContext with the new mesh',
        () => {
          const Expected = false
          // Set the data as expected
          const shadowMaterial = new ShadowMaterial({ opacity: 0.42, color: 0x424242 })
          // setComponent(testEntity, XRDetectedMeshComponent, { shadowMesh })
          // Sanity check before running
          expect(hasComponent(testEntity, ObjectComponent)).toBe(false)
          // Run and Check the result
          expect(hasComponent(testEntity, ObjectComponent)).toBe(true)
          const result = true
          expect(result).toBe(Expected)
        }
      )

      it.todo(
        'should create a new Mesh object with XRDetectedMeshComponent.occlusionMat and set an ObjectComponent to the entityContext with the new mesh',
        () => {}
      )
      it.todo(
        'should create a new Mesh object with XRDetectedMeshComponent.placementHelperMaterial and set an ObjectComponent to the entityContext with the new mesh',
        () => {}
      )
      it.todo('should set .renderOrder to -1 on the newly created occlusionMesh mesh object', () => {})
      it.todo('should set entityContext.shadowMesh to the newly created shadowMesh mesh object', () => {})
      it.todo('should set entityContext.occlusionMesh to the newly created occlusionMesh mesh object', () => {})
      it.todo('should set entityContext.placementHelper to the newly created placementHelper mesh object', () => {})

      describe('when it unmounts ..', () => {
        it.todo('.. should call removeObjectFromGroup with the entityContext and the shadowMesh mesh object', () => {})
        it.todo(
          '.. should call removeObjectFromGroup with the entityContext and the occlusionMesh mesh object',
          () => {}
        )
        it.todo(
          '.. should call removeObjectFromGroup with the entityContext and the placementHelper mesh object',
          () => {}
        )
      })
    }) //:: XRDetectedMeshComponent.mesh

    describe('XRDetectedMeshComponent.geometry', () => {
      it.todo(
        'should set entityContext.XRDetectedMeshComponent.shadowMesh to entityContext.XRDetectedMeshComponent.geometry if entityContext.XRDetectedMeshComponent.shadowMesh.geometry is truthy ',
        () => {}
      )
      it.todo(
        'should not set entityContext.XRDetectedMeshComponent.shadowMesh if entityContext.XRDetectedMeshComponent.shadowMesh.geometry is falsy',
        () => {}
      )
      it.todo(
        'should set entityContext.XRDetectedMeshComponent.occlusionMesh to entityContext.XRDetectedMeshComponent.geometry if entityContext.XRDetectedMeshComponent.occlusionMesh.geometry is truthy ',
        () => {}
      )
      it.todo(
        'should not set entityContext.XRDetectedMeshComponent.occlusionMesh if entityContext.XRDetectedMeshComponent.occlusionMesh.geometry is falsy',
        () => {}
      )
      describe('when it unmounts ..', () => {
        it.todo('.. should call entityContext.XRDetectedMeshComponent.geometry.dispose', () => {})
      })
    }) //:: XRDetectedMeshComponent.geometry

    describe('XRState.scenePlacementMode', () => {
      it.todo(
        "should set XRDetectedMeshComponent.placementHelper.visible to true if XRState.scenePlacementMode is 'placing'",
        () => {}
      )
      it.todo(
        "should set XRDetectedMeshComponent.placementHelper.visible to false if XRState.scenePlacementMode is not 'placing'",
        () => {}
      )
    }) //:: XRState.scenePlacementMode
  }) //:: reactor
}) //:: XRDetectedMeshComponent
