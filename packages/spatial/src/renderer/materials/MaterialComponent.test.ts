import {
  Entity,
  EntityID,
  SourceID,
  UUIDComponent,
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import assert from 'assert'
import { Material } from 'three'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { assertArray } from '../../../tests/util/assert'
import { MaterialInstanceComponent, MaterialStateComponent } from './MaterialComponent'

describe('MaterialStateComponent', () => {
  describe('IDs', () => {
    it('should initialize the MaterialStateComponent.name field with the expected value', () => {
      assert.equal(MaterialStateComponent.name, 'MaterialStateComponent')
    })
  }) //:: IDs

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'id' as EntityID
      })
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
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'id' as EntityID
      })
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
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, MaterialStateComponent)
    })

    afterEach(() => {
      if (testEntity !== UndefinedEntity) {
        removeEntity(testEntity)
      }
      destroyEngine()
    })

    it.todo(
      "should call setMeshMaterial for every entity in the  `@param entity`.MaterialStateComponent.instances list, using that instanceEntity's material entities",
      () => {}
    )

    it.todo('should not do anything if the entity does not have a MaterialStateComponent', () => {})
  }) //:: onRemove
}) //:: MaterialStateComponent

type MaterialInstanceComponentData = {
  entities: Entity[]
}

const MaterialInstanceComponentDefaults: MaterialInstanceComponentData = {
  entities: [] as Entity[]
}

function assertMaterialInstanceComponentEq(A: MaterialInstanceComponentData, B: MaterialInstanceComponentData) {
  assertArray.eq(A.entities, B.entities)
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
      createEngine()
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
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'id' as EntityID
      })
      setComponent(testEntity, MaterialInstanceComponent)
    })

    afterEach(() => {
      destroyEngine()
    })

    it('should change the values of an initialized MaterialInstanceComponent', () => {
      const entity1 = createEntity()
      const entity2 = createEntity()
      setComponent(entity1, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'id1' as EntityID
      })
      setComponent(entity2, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'id2' as EntityID
      })
      const Expected: MaterialInstanceComponentData = {
        entities: [entity1, entity2] as Entity[]
      }
      setComponent(testEntity, MaterialInstanceComponent, Expected)
      const result = getComponent(testEntity, MaterialInstanceComponent)
      assertMaterialInstanceComponentEq(result, Expected)
    })

    it('should not change values of an initialized MaterialInstanceComponent when the data passed had incorrect types', () => {
      const Incorrect = { entities: 'someUUID' }
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
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      if (testEntity !== UndefinedEntity) {
        removeEntity(testEntity)
      }
      destroyEngine()
    })

    describe("for every materialEntity in the testEntity's MaterialInstanceComponent.uuid list", () => {
      it.todo(
        "... should remove the testEntity from each materialEntity's MaterialStateComponent.instances list",
        () => {}
      )
    })
  }) //:: onRemove
}) //:: MaterialInstanceComponent
