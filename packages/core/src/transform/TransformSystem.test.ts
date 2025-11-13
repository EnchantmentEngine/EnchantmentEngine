import {
  AnimationSystemGroup,
  Entity,
  EntityTreeComponent,
  NetworkSchemaState,
  SystemDefinitions,
  SystemUUID,
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  hasComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import { getState, startReactor } from '@ir-engine/hyperflux'
import { act, render } from '@testing-library/react'
import assert from 'assert'
import sinon from 'sinon'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { ComputedTransformComponent } from './ComputedTransformComponent'
import { TransformComponent } from './TransformComponent'
import { TransformSerialization } from './TransformSerialization'
import { TransformDirtyCleanupSystem, TransformDirtyUpdateSystem, TransformSystem } from './TransformSystem'

describe('TransformSystem', () => {
  const System = SystemDefinitions.get(TransformSystem)!
  const CleanupSystem = SystemDefinitions.get(TransformDirtyCleanupSystem)!
  const UpdateSystem = SystemDefinitions.get(TransformDirtyUpdateSystem)!

  describe('Fields', () => {
    it('should initialize the *System.uuid field with the expected value', () => {
      assert.equal(System.uuid, 'ee.engine.TransformSystem')
    })

    it('should initialize the *System with the expected SystemUUID value', () => {
      assert.equal(TransformSystem, 'ee.engine.TransformSystem' as SystemUUID)
    })

    it('should initialize the *System.insert field with the expected value', () => {
      assert.notEqual(System.insert, undefined)
      assert.notEqual(System.insert!.after, undefined)
      assert.equal(System.insert!.after!, AnimationSystemGroup)
    })
  }) //:: Fields

  describe('execute', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should call computeTransformMatrix for all sorted entities that are true in the TransformComponent.dirty list', () => {
      const spy = sinon.spy()
      // Set the data as expected
      const entities: Entity[] = [createEntity(), createEntity(), createEntity(), createEntity()]
      for (const entity of entities) {
        setComponent(entity, TransformComponent)
        setComponent(entity, ComputedTransformComponent, { computeFunction: spy })
      }
      UpdateSystem.execute()
      // Sanity check before running
      assert.notEqual(spy.callCount, entities.length)
      // Run and Check the result
      System.execute()
      assert.equal(spy.callCount, entities.length)
    })
  }) //:: execute

  describe('reactor', () => {
    describe('mount/unmount', () => {
      let testEntity = UndefinedEntity

      beforeEach(async () => {
        createEngine()
        testEntity = createEntity()
      })

      afterEach(() => {
        removeEntity(testEntity)
        return destroyEngine()
      })

      const systemReactor = System.reactor!

      it('should set NetworkSchemaState[TransformSerialization.ID] when it mounts', async () => {
        const before = getState(NetworkSchemaState)[TransformSerialization.ID]
        assert.equal(before, undefined)
        // Run and Check the result
        const root = startReactor(systemReactor)
        await act(() => render(null))
        const after = getState(NetworkSchemaState)[TransformSerialization.ID]
        assert.notEqual(after, undefined)
      })

      it('should set NetworkSchemaState[TransformSerialization.ID] to none when it unmounts', async () => {
        const before = getState(NetworkSchemaState)[TransformSerialization.ID]
        assert.equal(before, undefined)
        // Run and Check the result
        const root = startReactor(systemReactor)
        await act(() => render(null))
        const after = getState(NetworkSchemaState)[TransformSerialization.ID]
        assert.notEqual(after, undefined)
        root.stop()
        await act(() => render(null))
        const result = getState(NetworkSchemaState)[TransformSerialization.ID]
        assert.equal(result, undefined)
      })
    }) //:: mount/unmount
  }) //:: reactor
}) //:: TransformSystem

describe('TransformDirtyUpdateSystem', () => {
  const System = SystemDefinitions.get(TransformDirtyUpdateSystem)!

  describe('Fields', () => {
    it('should initialize the ClientInputSystem.uuid field with the expected value', () => {
      assert.equal(System.uuid, 'ee.engine.TransformDirtyUpdateSystem')
    })

    it('should initialize the *System with the expected SystemUUID value', () => {
      assert.equal(TransformDirtyUpdateSystem, 'ee.engine.TransformDirtyUpdateSystem' as SystemUUID)
    })

    it('should initialize the ClientInputSystem.insert field with the expected value', () => {
      assert.notEqual(System.insert, undefined)
      assert.notEqual(System.insert!.before, undefined)
      assert.equal(System.insert!.before!, TransformSystem)
    })
  }) //:: Fields

  describe('execute', () => {
    beforeEach(() => {
      createEngine()
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('should set TransformComponent.transformsNeedSorting to false', () => {
      const Expected = false
      // Set the data as expected
      TransformComponent.transformsNeedSorting = !Expected
      // Sanity check before running
      const before = TransformComponent.transformsNeedSorting
      assert.notEqual(before, Expected)
      // Run and Check the result
      System.execute()
      const result = TransformComponent.transformsNeedSorting
      assert.equal(result, Expected)
    })

    it('should not change the TransformComponent.dirty value for each entity if its already true', () => {
      const Expected = 1
      // Set the data as expected
      const entities: Entity[] = [
        createEntity(),
        createEntity(),
        createEntity(),
        createEntity(),
        createEntity(),
        createEntity()
      ]
      for (const entity of entities) setComponent(entity, TransformComponent)
      // Sanity check before running
      for (const entity of entities) assert.equal(hasComponent(entity, TransformComponent), true)
      for (const entity of entities) assert.equal(hasComponent(entity, ComputedTransformComponent), false)
      for (const entity of entities) assert.equal(hasComponent(entity, EntityTreeComponent), false)
      for (const entity of entities) assert.equal(TransformComponent.dirty[entity], Expected)
      // Run and Check the result
      System.execute()
      for (const entity of entities) assert.equal(TransformComponent.dirty[entity], Expected)
    })

    it('should set the TransformComponent.dirty value for each entity to true if the entity has a ComputedTransformComponent', () => {
      const Expected = 1
      const Initial = 0
      // Set the data as expected
      const entities: Entity[] = [
        createEntity(),
        createEntity(),
        createEntity(),
        createEntity(),
        createEntity(),
        createEntity()
      ]
      for (const entity of entities) setComponent(entity, TransformComponent)
      for (const entity of entities) setComponent(entity, ComputedTransformComponent)
      for (const entity of entities) TransformComponent.dirty[entity] = Initial
      // Sanity check before running
      for (const entity of entities) assert.equal(hasComponent(entity, TransformComponent), true)
      for (const entity of entities) assert.equal(hasComponent(entity, ComputedTransformComponent), true)
      for (const entity of entities) assert.equal(hasComponent(entity, EntityTreeComponent), false)
      for (const entity of entities) assert.equal(TransformComponent.dirty[entity], Initial)
      for (const entity of entities) assert.notEqual(TransformComponent.dirty[entity], Expected)
      // Run and Check the result
      System.execute()
      for (const entity of entities) assert.equal(TransformComponent.dirty[entity], Expected)
    })

    it('should set the TransformComponent.dirty value for each entity to true if the TransformComponent.dirty for its EntityTreeComponent.parentEntity is true', () => {
      const Expected = 1
      const Initial = 0
      const entities: Entity[] = [
        createEntity(),
        createEntity(),
        createEntity(),
        createEntity(),
        createEntity(),
        createEntity()
      ]
      const parents: Entity[] = []
      // Set the data as expected
      for (const id in entities) parents[id] = createEntity()
      for (const id in entities) setComponent(entities[id], EntityTreeComponent, { parentEntity: parents[id] })
      for (const entity of parents) setComponent(entity, TransformComponent)
      for (const entity of parents) TransformComponent.dirty[entity] = Expected
      for (const entity of entities) setComponent(entity, TransformComponent)
      for (const entity of entities) setComponent(entity, ComputedTransformComponent)
      for (const entity of entities) TransformComponent.dirty[entity] = Initial
      // Sanity check before running
      for (const entity of entities) assert.equal(hasComponent(entity, TransformComponent), true)
      for (const entity of entities) assert.equal(hasComponent(entity, ComputedTransformComponent), true)
      for (const entity of entities) assert.equal(hasComponent(entity, EntityTreeComponent), true)
      for (const entity of entities) assert.equal(TransformComponent.dirty[entity], Initial)
      for (const entity of entities) assert.notEqual(TransformComponent.dirty[entity], Expected)
      // Run and Check the result
      System.execute()
      for (const entity of entities) assert.equal(TransformComponent.dirty[entity], Expected)
    })

    it('should set the TransformComponent.dirty value to false when none of the other conditions are true and the parent does not exist in the TransformComponent.dirty list', () => {
      const Expected = false
      const Initial = 0
      const entities: Entity[] = [
        createEntity(),
        createEntity(),
        createEntity(),
        createEntity(),
        createEntity(),
        createEntity()
      ]
      const parents: Entity[] = []
      // Set the data as expected
      for (const id in entities) parents[id] = createEntity()
      for (const id in entities) setComponent(entities[id], EntityTreeComponent, { parentEntity: parents[id] })
      for (const entity of parents) setComponent(entity, TransformComponent)
      for (const entity of entities) setComponent(entity, TransformComponent)
      for (const entity of parents) TransformComponent.dirty[entity] = 0
      for (const entity of entities) TransformComponent.dirty[entity] = 0
      // Sanity check before running
      for (const entity of entities) assert.equal(hasComponent(entity, TransformComponent), true)
      for (const entity of entities) assert.equal(hasComponent(entity, ComputedTransformComponent), false)
      for (const entity of entities) assert.equal(hasComponent(entity, EntityTreeComponent), true)
      for (const entity of entities) assert.equal(TransformComponent.dirty[entity], Initial)
      for (const entity of parents) assert.equal(TransformComponent.dirty[entity], Initial)
      // Run and Check the result
      System.execute()
      for (const entity of entities) assert.equal(TransformComponent.dirty[entity], Expected)
    })
  }) //:: execute
}) //:: TransformDirtyUpdateSystem

describe('TransformDirtyCleanupSystem', () => {
  const System = SystemDefinitions.get(TransformDirtyCleanupSystem)!

  describe('Fields', () => {
    it('should initialize the *System.uuid field with the expected value', () => {
      assert.equal(System.uuid, 'ee.engine.TransformDirtyCleanupSystem')
    })

    it('should initialize the *System with the expected SystemUUID value', () => {
      assert.equal(TransformDirtyCleanupSystem, 'ee.engine.TransformDirtyCleanupSystem' as SystemUUID)
    })

    it('should initialize the ClientInputSystem.insert field with the expected value', () => {
      assert.notEqual(System.insert, undefined)
      assert.notEqual(System.insert!.after, undefined)
      assert.equal(System.insert!.after!, TransformSystem)
    })
  }) //:: Fields

  describe('execute', () => {
    beforeEach(() => {
      createEngine()
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('should remove every entity from the TransformComponent.dirty list', () => {
      const count = 2
      const entities = [] as Entity[]
      // Set the data as expected
      for (let id = 0; id < count; ++id) {
        const entity = createEntity()
        entities.push(entity)
        setComponent(entity, TransformComponent)
        TransformComponent.dirty[entity] = 1
      }
      // Run and Check the result
      System.execute()
      for (const entity of entities) {
        assert.equal(TransformComponent.dirty[entity], 0)
      }
    })
  }) //:: execute
}) //:: TransformDirtyCleanupSystem
