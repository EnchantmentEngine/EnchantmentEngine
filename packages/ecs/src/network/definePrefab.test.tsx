import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  createEngine,
  createEntity,
  defineComponent,
  destroyEngine,
  EngineState,
  Entity,
  EntityID,
  getComponent,
  getOptionalComponent,
  setComponent,
  SourceID,
  SystemDefinitions,
  UndefinedEntity,
  UUIDComponent,
  WorldNetworkAction
} from '@ir-engine/ecs'
import {
  applyIncomingActions,
  dispatchAction,
  getMutableState,
  getState,
  HyperFlux,
  ScenePeer,
  SceneUser,
  Schema,
  startReactor,
  UserID
} from '@ir-engine/hyperflux'

import { NetworkTopics } from '@ir-engine/hyperflux'
import { createMockNetwork } from '@ir-engine/hyperflux/tests/createMockNetwork'
import { definePrefab } from './definePrefab'

import { flushAll } from '@ir-engine/hyperflux/tests/utils/flushAll'
import { act, render } from '@testing-library/react'

const TestComponent = defineComponent({
  name: 'TestComponent',
  jsonID: 'TEST_component',
  schema: Schema.Object({
    num: Schema.Number({ default: 0 })
  })
})

const MyPrefab = definePrefab({
  components: [TestComponent]
})

describe('definePrefab', () => {
  let rootEntity: Entity

  beforeEach(async () => {
    createEngine()

    const hostUserId = 'host user' as UserID
    const hostPeerID = HyperFlux.store.peerID
    createMockNetwork(NetworkTopics.world, hostPeerID, hostUserId)
    getMutableState(EngineState).userID.set(hostUserId)

    rootEntity = createEntity()
    setComponent(rootEntity, UUIDComponent, {
      entityID: UUIDComponent.generate(),
      entitySourceID: 'root' as SourceID
    })
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('should spawn an entity with the defined components and default values', async () => {
    const parentUUID = UUIDComponent.get(rootEntity)

    MyPrefab.spawn({
      entityID: 'entity-id-1' as EntityID,
      entitySourceID: 'source-id-1' as SourceID,
      parentUUID,
      components: {
        [TestComponent.jsonID]: {
          num: 0.5
        }
      }
    })

    applyIncomingActions()

    await act(() => render(null))

    const entity = UUIDComponent.getEntityByUUID(
      UUIDComponent.join({ entityID: 'entity-id-1' as EntityID, entitySourceID: 'source-id-1' as SourceID })
    )

    // Check that the TestComponent was added to the entity with default value
    const testComponent = getComponent(entity, TestComponent)
    expect(testComponent.num).toBe(0.5)
  })

  it('should update component values when set is called', () => {
    const parentUUID = UUIDComponent.get(rootEntity)

    MyPrefab.spawn({
      entityID: 'entity-id-2' as EntityID,
      entitySourceID: 'source-id-2' as SourceID,
      parentUUID,
      components: {}
    })

    applyIncomingActions()

    const entity = UUIDComponent.getEntityByUUID(
      UUIDComponent.join({ entityID: 'entity-id-2' as EntityID, entitySourceID: 'source-id-2' as SourceID })
    )

    // Check that the TestComponent was added to the entity with default value
    let testComponent = getComponent(entity, TestComponent)
    expect(testComponent.num).toBe(0)

    // Update the TestComponent value using the set method
    MyPrefab.set(entity, {
      [TestComponent.jsonID]: {
        num: 42
      }
    })

    applyIncomingActions()

    // Check that the TestComponent value was updated
    testComponent = getComponent(entity, TestComponent)
    expect(testComponent.num).toBe(42)
  })

  it('should remove the entity and its components when remove is called', () => {
    const parentUUID = UUIDComponent.get(rootEntity)

    MyPrefab.spawn({
      entityID: 'entity-id-3' as EntityID,
      entitySourceID: 'source-id-3' as SourceID,
      parentUUID,
      components: {}
    })

    applyIncomingActions()

    const entity = UUIDComponent.getEntityByUUID(
      UUIDComponent.join({ entityID: 'entity-id-3' as EntityID, entitySourceID: 'source-id-3' as SourceID })
    )

    // Check that the TestComponent was added to the entity
    const testComponent = getComponent(entity, TestComponent)
    expect(testComponent).toBeDefined()

    // Remove the entity using the remove method
    MyPrefab.remove(entity)

    applyIncomingActions()

    // Check that the entity and its components were removed
    const removedEntity = UUIDComponent.getEntityByUUID(
      UUIDComponent.join({ entityID: 'entity-id-3' as EntityID, entitySourceID: 'source-id-3' as SourceID })
    )
    expect(removedEntity).toEqual(UndefinedEntity)
    expect(getOptionalComponent(entity, TestComponent)).toBeUndefined()
  })

  it('should enforce types of components', () => {
    const parentUUID = UUIDComponent.get(rootEntity)

    MyPrefab.spawn({
      entityID: 'entity-id-4' as EntityID,
      entitySourceID: 'source-id-4' as SourceID,
      parentUUID,
      components: {
        // @ts-expect-error - component does not exist
        NonExistentComponent: {
          someField: 123
        },
        [TestComponent.jsonID]: {
          // @ts-expect-error - wrong property type
          num: 'this should be a number'
        }
      }
    })

    applyIncomingActions()

    const entity = UUIDComponent.getEntityByUUID(
      UUIDComponent.join({ entityID: 'entity-id-4' as EntityID, entitySourceID: 'source-id-4' as SourceID })
    )

    // Check that the TestComponent was added to the entity with default value
    const testComponent = getComponent(entity, TestComponent)
    expect(testComponent.num).toBe(0) // should fall back to default value due to type error
  })

  it('should automatically populate state when spawned from a scene', async () => {
    const parentUUID = UUIDComponent.get(rootEntity)
    const entity = createEntity()
    setComponent(entity, UUIDComponent, {
      entityID: 'entity-id-5' as EntityID,
      entitySourceID: 'source-id-5' as SourceID
    })
    setComponent(entity, TestComponent, { num: 99 })

    dispatchAction(
      WorldNetworkAction.spawnEntity({
        ownerID: SceneUser,
        entityID: 'entity-id-5' as EntityID,
        entitySourceID: 'source-id-5' as SourceID,
        parentUUID,
        $network: undefined,
        $topic: undefined,
        $user: SceneUser,
        $peer: ScenePeer
      })
    )

    const entityUUID = UUIDComponent.get(entity)

    startReactor(SystemDefinitions.get(MyPrefab.$System)!.reactor!)

    await flushAll()
    applyIncomingActions()
    await flushAll()
    applyIncomingActions()

    const state = getState(MyPrefab.$State)[entityUUID]
    expect(state).toBeDefined()
    expect(state[TestComponent.jsonID]).toBeDefined()
    expect(state[TestComponent.jsonID]!.num).toBe(99)
  })
})
