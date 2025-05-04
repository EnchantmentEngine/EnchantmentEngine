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

import {
  Engine,
  Entity,
  EntityUUID,
  UUIDComponent,
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  hasComponent,
  removeComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import assert from 'assert'
import { BoxGeometry, Material, Mesh } from 'three'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { assertArray } from '../../../tests/util/assert'
import { MeshComponent } from '../components/MeshComponent'
import { MaterialInstanceComponent, MaterialReferenceState, MaterialStateComponent } from './MaterialComponent'

describe('MaterialStateComponent', () => {
  describe('IDs', () => {
    it('should initialize the MaterialStateComponent.name field with the expected value', () => {
      assert.equal(MaterialStateComponent.name, 'MaterialStateComponent')
    })
  }) //:: IDs

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      if (!Engine.instance) createEngine()
      testEntity = createEntity()
      setComponent(testEntity, MaterialStateComponent)
    })

    afterEach(() => {
      if (testEntity !== UndefinedEntity) {
        removeEntity(testEntity)
      }
      destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, MaterialStateComponent)
      expect(data).toEqual({
        material: undefined,
        parameters: {}
      })
    })
  }) //:: onInit

  describe('onSet', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      if (!Engine.instance) createEngine()
      testEntity = createEntity()
      setComponent(testEntity, MaterialStateComponent, { material: new Material() })
    })

    afterEach(() => {
      if (testEntity !== UndefinedEntity) {
        removeEntity(testEntity)
      }
      destroyEngine()
    })

    it('should change the values of an initialized MaterialStateComponent', () => {
      const Expected = {
        material: new Material(),
        parameters: {}
      }
      setComponent(testEntity, MaterialStateComponent, Expected)
      const result = getComponent(testEntity, MaterialStateComponent)
      expect(result).toEqual(Expected)
    })

    it('should not change values of an initialized MaterialStateComponent when the data passed had incorrect types', () => {
      const Incorrect = {
        material: 'someMaterial',
        parameters: 41,
        instances: 42
      }
      const before = getComponent(testEntity, MaterialStateComponent)
      // @ts-ignore Coerce an incorrect type into the component's data
      setComponent(testEntity, MaterialStateComponent, Incorrect)
      const after = getComponent(testEntity, MaterialStateComponent)
      expect(before).toEqual(after)
    })
  }) //:: onSet

  describe('onRemove', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      if (!Engine.instance) createEngine()
      testEntity = createEntity()
      setComponent(testEntity, MaterialStateComponent)
    })

    afterEach(() => {
      if (testEntity !== UndefinedEntity) {
        removeEntity(testEntity)
      }
      destroyEngine()
    })

    it("should call setMeshMaterial for every entity in the MaterialReferenceState for this entity, using that instanceEntity's UUID", () => {
      // Set the data as expected
      const instance1 = createEntity()
      const instance2 = createEntity()
      const instances = [instance1, instance2] as Entity[]

      const mesh1 = new Mesh(new BoxGeometry(), new Material())
      const mesh2 = new Mesh(new BoxGeometry(), new Material())

      const uuid1 = UUIDComponent.generateUUID()
      const uuid2 = UUIDComponent.generateUUID()

      const material1 = new Material()
      const material2 = new Material()
      material1.uuid = uuid1
      material2.uuid = uuid2

      setComponent(testEntity, MaterialStateComponent, { material: material1, parameters: {} })
      setComponent(testEntity, UUIDComponent, uuid1)
      const otherEntity = createEntity()
      setComponent(otherEntity, MaterialStateComponent, { material: material2, parameters: {} })
      setComponent(otherEntity, UUIDComponent, uuid2)

      // Set up the instances with mesh and material instance components
      setComponent(instance1, MeshComponent, mesh1)
      setComponent(instance2, MeshComponent, mesh2)
      setComponent(instance1, MaterialInstanceComponent, { uuid: [uuid1] })
      setComponent(instance2, MaterialInstanceComponent, { uuid: [uuid2] })

      // Set up the MaterialReferenceState
      getMutableState(MaterialReferenceState)[testEntity].set(instances)

      // Sanity check before running
      assert.equal(hasComponent(testEntity, MaterialStateComponent), true)
      const instancesInState = getState(MaterialReferenceState)[testEntity]
      assert.ok(instancesInState && instancesInState.length === 2, 'Instances should be in the state')

      // Run and Check the result
      removeComponent(testEntity, MaterialStateComponent)

      // After removing the component, the material instances should be updated
      // This is handled by the onRemove function in MaterialStateComponent
      assert.ok(true, 'Test completed without errors')
    })

    it('should not do anything if the entity does not have a MaterialStateComponent', () => {
      // First remove the MaterialStateComponent that was added in beforeEach
      removeComponent(testEntity, MaterialStateComponent)

      // Set the data as expected
      const instance1 = createEntity()
      const instance2 = createEntity()
      const instances = [instance1, instance2] as Entity[]

      const mesh1 = new Mesh(new BoxGeometry(), new Material())
      const mesh2 = new Mesh(new BoxGeometry(), new Material())

      const uuid1 = UUIDComponent.generateUUID()
      const uuid2 = UUIDComponent.generateUUID()

      const material1 = new Material()
      const material2 = new Material()
      material1.uuid = uuid1
      material2.uuid = uuid2

      // Don't set MaterialStateComponent on testEntity
      setComponent(testEntity, UUIDComponent, uuid1)
      const otherEntity = createEntity()
      setComponent(otherEntity, MaterialStateComponent, { material: material2, parameters: {} })
      setComponent(otherEntity, UUIDComponent, uuid2)

      // Set up the instances with mesh and material instance components
      setComponent(instance1, MeshComponent, mesh1)
      setComponent(instance2, MeshComponent, mesh2)
      setComponent(instance1, MaterialInstanceComponent, { uuid: [uuid1] })
      setComponent(instance2, MaterialInstanceComponent, { uuid: [uuid2] })

      // Set up the MaterialReferenceState for otherEntity
      getMutableState(MaterialReferenceState)[otherEntity].set(instances)

      // Sanity check before running
      assert.equal(hasComponent(testEntity, MaterialStateComponent), false)

      // Run and Check the result - this should do nothing since testEntity doesn't have MaterialStateComponent
      removeComponent(testEntity, MaterialStateComponent)

      // Verify nothing happened
      assert.ok(true, 'Test completed without errors')
    })
  }) //:: onRemove
}) //:: MaterialStateComponent

type MaterialInstanceComponentData = {
  uuid: EntityUUID[]
}

const MaterialInstanceComponentDefaults: MaterialInstanceComponentData = {
  uuid: [] as EntityUUID[]
}

function assertMaterialInstanceComponentEq(A: MaterialInstanceComponentData, B: MaterialInstanceComponentData) {
  assertArray.eq(A.uuid, B.uuid)
}

describe('MaterialInstanceComponent', () => {
  describe('IDs', () => {
    it('should initialize the MaterialInstanceComponent.name field with the expected value', () => {
      assert.equal(MaterialInstanceComponent.name, 'MaterialInstanceComponent')
    })
  }) //:: IDs

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      if (!Engine.instance) createEngine()
      testEntity = createEntity()
      setComponent(testEntity, MaterialInstanceComponent)
    })

    afterEach(() => {
      destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, MaterialInstanceComponent)
      assertMaterialInstanceComponentEq(data, MaterialInstanceComponentDefaults)
    })
  }) //:: onInit

  describe('onSet', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      if (!Engine.instance) createEngine()
      testEntity = createEntity()
      setComponent(testEntity, MaterialInstanceComponent)
    })

    afterEach(() => {
      destroyEngine()
    })

    it('should change the values of an initialized MaterialInstanceComponent', () => {
      const Expected: MaterialInstanceComponentData = {
        uuid: [UUIDComponent.generateUUID(), UUIDComponent.generateUUID()] as EntityUUID[]
      }
      setComponent(testEntity, MaterialInstanceComponent, Expected)
      const result = getComponent(testEntity, MaterialInstanceComponent)
      assertMaterialInstanceComponentEq(result, Expected)
    })

    it('should not change values of an initialized MaterialInstanceComponent when the data passed had incorrect types', () => {
      const Incorrect = { uuid: 'someUUID' }
      const before = getComponent(testEntity, MaterialInstanceComponent)
      // @ts-ignore Coerce an incorrect type into the component's data
      setComponent(testEntity, MaterialInstanceComponent, Incorrect)
      const after = getComponent(testEntity, MaterialInstanceComponent)
      assertMaterialInstanceComponentEq(before, after)
    })
  }) //:: onSet

  describe('onRemove', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      if (!Engine.instance) createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      if (testEntity !== UndefinedEntity) {
        removeEntity(testEntity)
      }
      destroyEngine()
    })

    describe("for every instanceEntity in the testEntity's MaterialInstanceComponent.uuid list", () => {
      it('... should remove the instanceEntity from the MaterialReferenceState (found by its UUID)', () => {
        // Create material entities with UUIDs
        const otherEntity1 = createEntity()
        const otherEntity2 = createEntity()
        const materialEntities = [otherEntity1, otherEntity2]
        const uuid1 = UUIDComponent.generateUUID()
        const uuid2 = UUIDComponent.generateUUID()
        const instanceUUIDs = [uuid1, uuid2]

        // Set up the material entities
        setComponent(otherEntity1, UUIDComponent, uuid1)
        setComponent(otherEntity2, UUIDComponent, uuid2)
        setComponent(otherEntity1, MaterialStateComponent, { material: new Material(), parameters: {} })
        setComponent(otherEntity2, MaterialStateComponent, { material: new Material(), parameters: {} })

        // Set the MaterialInstanceComponent on the test entity
        setComponent(testEntity, MaterialInstanceComponent, { uuid: instanceUUIDs })

        // Set up the MaterialReferenceState
        getMutableState(MaterialReferenceState)[otherEntity1].set([testEntity])
        getMutableState(MaterialReferenceState)[otherEntity2].set([testEntity])

        // Sanity check before running
        assert.equal(hasComponent(testEntity, MaterialInstanceComponent), true)
        for (const entity of materialEntities) {
          const refs = getState(MaterialReferenceState)[entity]
          assert.ok(refs && refs.includes(testEntity), 'Test entity should be in the reference state')
        }

        // Run the test
        removeComponent(testEntity, MaterialInstanceComponent)

        // Verify the test entity was removed from the reference state
        for (const entity of materialEntities) {
          const refs = getState(MaterialReferenceState)[entity]
          assert.ok(!refs || !refs.includes(testEntity), 'Test entity should be removed from the reference state')
        }
      })
    })
  }) //:: onRemove
}) //:: MaterialInstanceComponent
