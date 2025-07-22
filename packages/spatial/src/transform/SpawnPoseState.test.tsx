import {
  Entity,
  EntityID,
  EntityUUIDPair,
  SourceID,
  UUIDComponent,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  setComponent
} from '@ir-engine/ecs'
import { getMutableState } from '@ir-engine/hyperflux'
import { act, render } from '@testing-library/react'
import assert from 'assert'
import { Quaternion, Vector3 } from 'three'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { assertVec } from '../../tests/util/assert'
import { Vector3_One } from '../common/constants/MathConstants'
import { SpawnPoseState } from './SpawnPoseState'
import { TransformComponent } from './components/TransformComponent'

describe('SpawnPoseState', () => {
  describe('Fields', () => {
    it('should initialize the *State.name field with the expected value', () => {
      assert.equal(SpawnPoseState.name, 'ee.SpawnPoseState')
    })

    it('should initialize the *State.initial field with the expected value', () => {
      assert.deepEqual(SpawnPoseState.initial, {})
    })

    it('should initialize the *State.receptors field with the expected value', () => {
      assert.notEqual(SpawnPoseState.receptors, undefined)
      assert.notEqual(SpawnPoseState.receptors.onSpawnObject, undefined)
    })
  }) //:: Fields

  describe('reactor', () => {
    describe('whenever [UUIDComponent.useEntityByUUID(props.uuid), SpawnPoseState.spawnPosition, SpawnPoseState.spawnRotation] change: for every entity UUID in SpawnPoseState.keys ...', () => {
      beforeEach(async () => {
        createEngine()
      })

      afterEach(() => {
        return destroyEngine()
      })

      it('... should update the entity with that UUID: TransformComponent.position should become SpawnPoseState.spawnPosition', async () => {
        const Expected = new Vector3().setScalar(42)
        const Initial = new Vector3().setScalar(21)
        // Set the data as expected
        const keys: EntityUUIDPair[] = [
          { entitySourceID: 'source' as SourceID, entityID: 'test1' as EntityID },
          { entitySourceID: 'source' as SourceID, entityID: 'test2' as EntityID },
          { entitySourceID: 'source' as SourceID, entityID: 'test3' as EntityID }
        ]
        const entities: Entity[] = keys.map((uuid: EntityUUIDPair) => {
          const entity = createEntity()
          setComponent(entity, UUIDComponent, uuid)
          setComponent(entity, TransformComponent, { position: Initial })
          return entity
        })
        getMutableState(SpawnPoseState).set(
          keys.reduce((list, uuid) => {
            list[UUIDComponent.join(uuid)] = {
              spawnPosition: Expected,
              spawnRotation: new Quaternion(1, 2, 3, 4).normalize()
            }
            return list
          }, {})
        )
        // Sanity check before running
        for (const entity of entities) assertVec.approxEq(getComponent(entity, TransformComponent).position, Initial, 3)
        // Run and Check the result

        await act(() => render(null))
        for (const entity of entities)
          assertVec.approxEq(getComponent(entity, TransformComponent).position, Expected, 3)
      })

      it('... should update the entity with that UUID: TransformComponent.rotation should become SpawnPoseState.spawnRotation', async () => {
        const Expected = new Quaternion(1, 2, 3, 4).normalize()
        const Initial = new Quaternion(5, 6, 7, 8).normalize()
        // Set the data as expected
        const keys: EntityUUIDPair[] = [
          { entitySourceID: 'source' as SourceID, entityID: 'test1' as EntityID },
          { entitySourceID: 'source' as SourceID, entityID: 'test2' as EntityID },
          { entitySourceID: 'source' as SourceID, entityID: 'test3' as EntityID }
        ]
        const entities: Entity[] = keys.map((uuid: EntityUUIDPair) => {
          const entity = createEntity()
          setComponent(entity, UUIDComponent, uuid)
          setComponent(entity, TransformComponent, { rotation: Initial })
          return entity
        })
        getMutableState(SpawnPoseState).set(
          keys.reduce((list, uuid) => {
            list[UUIDComponent.join(uuid)] = {
              spawnPosition: Vector3_One.clone(),
              spawnRotation: Expected
            }
            return list
          }, {})
        )
        // Sanity check before running
        for (const entity of entities) assertVec.approxEq(getComponent(entity, TransformComponent).rotation, Initial, 4)
        // Run and Check the result

        await act(() => render(null))
        for (const entity of entities)
          assertVec.approxEq(getComponent(entity, TransformComponent).rotation, Expected, 4)
      })

      it('... should not do anything if entity is falsy', async () => {
        const Initial = new Vector3().setScalar(21)
        // Set the data as expected
        const keys: EntityID[] = [
          UUIDComponent.generateUUID(),
          UUIDComponent.generateUUID(),
          UUIDComponent.generateUUID()
        ]
        const entities: Entity[] = keys.map((_uuid: EntityID) => {
          const entity = createEntity()
          // setComponent(entity, UUIDComponent, uuid)   // Do not set the UUID so the entity is falsy inside the reactor
          setComponent(entity, TransformComponent, { position: Initial })
          return entity
        })
        getMutableState(SpawnPoseState).set(
          keys.reduce((list, uuid) => {
            list[uuid] = {
              spawnPosition: Vector3_One.clone(),
              spawnRotation: new Quaternion(1, 2, 3, 4).normalize()
            }
            return list
          }, {})
        )
        // Sanity check before running
        for (const entity of entities) assertVec.approxEq(getComponent(entity, TransformComponent).position, Initial, 3)
        // Run and Check the result

        await act(() => render(null))
        for (const entity of entities) assertVec.approxEq(getComponent(entity, TransformComponent).position, Initial, 3)
      })
    })
  }) //:: reactor
}) //:: SpawnPoseState
