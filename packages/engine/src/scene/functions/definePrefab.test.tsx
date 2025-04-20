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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Entity, createEngine, createEntity, destroyEngine, getComponent, setComponent } from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { NetworkTopics } from '@ir-engine/network'
import { createMockNetwork } from '@ir-engine/network/tests/createMockNetwork'
import { initializeSpatialEngine, initializeSpatialViewer } from '@ir-engine/spatial/src/initializeEngine'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { loadEmptyScene } from '../../../tests/util/loadEmptyScene'

import { definePrefab } from './definePrefab'

describe('definePrefab', () => {
  let sceneEntity: Entity

  beforeEach(async () => {
    createEngine()
    initializeSpatialEngine()
    initializeSpatialViewer()
    sceneEntity = loadEmptyScene()
    setComponent(sceneEntity, SceneComponent)

    // Create a mock network for testing
    createMockNetwork(NetworkTopics.world)
  })

  afterEach(() => {
    return destroyEngine()
  })

  /**
   * Specification 1: definePrefab MUST create a component with the specified name and schema
   */
  it('MUST create a component with the specified name and schema', () => {
    // Define a test prefab
    const TestPrefabComponent = definePrefab({
      name: 'TestPrefab',
      jsonID: 'test-prefab',
      schema: S.Object({
        health: S.Number(100),
        name: S.String('Default')
      }),
      reactor: () => null
    })

    // Verify the component has the correct name
    expect(TestPrefabComponent.name).toBe('TestPrefab')
    expect(TestPrefabComponent.jsonID).toBe('test-prefab')

    // Create an entity and add the component
    const entity = createEntity()
    setComponent(entity, TestPrefabComponent, { health: 200, name: 'Test Entity' })

    // Verify the component data is correctly set
    const componentData = getComponent(entity, TestPrefabComponent)
    expect(componentData.health).toBe(200)
    expect(componentData.name).toBe('Test Entity')
  })

  /**
   * Specification 2: definePrefab MUST create a component with the correct schema
   */
  it('MUST create a component with the correct schema', () => {
    // Define a test prefab
    const TestPrefabComponent = definePrefab({
      name: 'TestPrefabState',
      jsonID: 'test-prefab-state',
      schema: S.Object({
        health: S.Number(100),
        name: S.String('Default')
      }),
      reactor: () => null
    })

    // Verify the component has the correct schema
    expect(TestPrefabComponent.schema).toBeDefined()
    expect(TestPrefabComponent.schema.properties.health).toBeDefined()
    expect(TestPrefabComponent.schema.properties.name).toBeDefined()
  })

  /**
   * Specification 3: definePrefab.spawn MUST be defined on the component
   */
  it('MUST have a spawn method on the component', () => {
    // Define a test prefab
    const TestPrefabComponent = definePrefab({
      name: 'TestPrefabSpawn',
      jsonID: 'test-prefab-spawn',
      schema: S.Object({
        health: S.Number(100),
        name: S.String('Default')
      }),
      reactor: () => null
    })

    // Verify the spawn method exists
    expect(TestPrefabComponent.spawn).toBeDefined()
    expect(typeof TestPrefabComponent.spawn).toBe('function')
  })

  /**
   * Specification 4: definePrefab MUST create a component with a reactor
   */
  it('MUST create a component with a reactor', () => {
    // Define a test prefab with a mock reactor function
    const mockReactorFn = vi.fn(() => null)
    const TestPrefabComponent = definePrefab({
      name: 'TestPrefabReactor',
      jsonID: 'test-prefab-reactor',
      schema: S.Object({
        health: S.Number(100),
        name: S.String('Default')
      }),
      reactor: mockReactorFn
    })

    // Verify the component has a reactor
    expect(TestPrefabComponent.reactor).toBeDefined()
    expect(typeof TestPrefabComponent.reactor).toBe('function')
  })

  /**
   * Specification 5: definePrefab MUST create a component that can be added to an entity
   */
  it('MUST create a component that can be added to an entity', () => {
    // Define a test prefab
    const TestPrefabComponent = definePrefab({
      name: 'TestPrefabScene',
      jsonID: 'test-prefab-scene',
      schema: S.Object({
        health: S.Number(100),
        name: S.String('Default')
      }),
      reactor: () => null
    })

    // Create an entity and add the component
    const entity = createEntity()
    setComponent(entity, TestPrefabComponent, { health: 400, name: 'Scene Entity' })

    // Verify the component was added correctly
    const componentData = getComponent(entity, TestPrefabComponent)
    expect(componentData).toBeDefined()
    expect(componentData.health).toBe(400)
    expect(componentData.name).toBe('Scene Entity')
  })
})
