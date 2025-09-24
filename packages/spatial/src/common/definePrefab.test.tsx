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
  UndefinedEntity,
  UUIDComponent
} from '@ir-engine/ecs'
import { applyIncomingActions, getMutableState, HyperFlux, Schema, UserID } from '@ir-engine/hyperflux'

import { NetworkTopics } from '@ir-engine/hyperflux'
import { createMockNetwork } from '@ir-engine/hyperflux/tests/createMockNetwork'
import { definePrefab } from './definePrefab'

import { act, render } from '@testing-library/react'

const TestComponent = defineComponent({
  name: 'TestComponent',
  jsonID: 'TEST_component',
  schema: Schema.Object({
    num: Schema.Number({ default: 0 })
  })
})

const MyPrefab = definePrefab({
  name: 'MyPrefab',
  components: [TestComponent]
})

/**
 * Specification:
 * 1. should spawn an entity with the defined components and default values
 * 2. should update component values when set is called
 * 3. should remove the entity and its components when remove is called
 */

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

  /**
   * Specification 1: definePrefab should create a component with the specified name, jsonID, and schema
   */
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

  /**
   * Specification 2: definePrefab should update component values when set is called
   */
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

  /**
   * Specification 3: definePrefab should remove the entity and its components when remove is called
   */
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
})
