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

import { act, render } from '@testing-library/react'
import React from 'react'
import { Quaternion, Vector3 } from 'three'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { createEngine, destroyEngine, getComponent, hasComponent } from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { dispatchAction, getState } from '@ir-engine/hyperflux'
import { WorldNetworkAction } from '@ir-engine/network'

import { assertVec } from '../../tests/util/assert'
import { TransformComponent } from '../transform/components/TransformComponent'
import { SpawnPoseState } from '../transform/SpawnPoseState'
import { defineNetworkedComponent } from './defineNetworkedComponent'

describe('defineNetworkedComponent', () => {
  beforeEach(() => {
    createEngine()
  })

  afterEach(() => {
    destroyEngine()
  })

  it('should define a component, state, and actions', () => {
    const { component, state, actions } = defineNetworkedComponent({
      component: {
        name: 'TestNetworkedComponent',
        schema: S.Object({
          value: S.Number(0)
        })
      }
    })

    expect(component.name).toBe('TestNetworkedComponent')
    expect(state.name).toBe('ee.networked.TestNetworkedComponent.State')
    expect(actions.spawn).toBeDefined()
  })

  it('should spawn an entity with the component', () => {
    const { component, spawnEntity } = defineNetworkedComponent({
      component: {
        name: 'TestNetworkedComponent',
        schema: S.Object({
          value: S.Number(0)
        })
      }
    })

    const position = new Vector3(1, 2, 3)
    const rotation = new Quaternion(0, 0, 0, 1)
    const { entity } = spawnEntity({ position, rotation, value: 42 })

    expect(hasComponent(entity, component)).toBe(true)
    expect(hasComponent(entity, TransformComponent)).toBe(true)

    const transform = getComponent(entity, TransformComponent)
    assertVec.approxEq(transform.position, position)
  })

  it('should update the state when an entity is spawned', () => {
    const { state, spawnEntity } = defineNetworkedComponent({
      component: {
        name: 'TestNetworkedComponent',
        schema: S.Object({
          value: S.Number(0)
        })
      },
      stateProperties: {
        customValue: 0
      },
      spawnActionProperties: {
        customValue: S.Number(0)
      }
    })

    const { entityUUID } = spawnEntity({ customValue: 42 })

    const stateValue = getState(state)[entityUUID]
    expect(stateValue).toBeDefined()
    expect(stateValue.customValue).toBe(42)
  })

  it('should remove the state when an entity is destroyed', () => {
    const { state, spawnEntity } = defineNetworkedComponent({
      component: {
        name: 'TestNetworkedComponent',
        schema: S.Object({
          value: S.Number(0)
        })
      }
    })

    const { entityUUID } = spawnEntity({})

    expect(getState(state)[entityUUID]).toBeDefined()

    dispatchAction(WorldNetworkAction.destroyEntity({ entityUUID }))

    expect(getState(state)[entityUUID]).toBeUndefined()
  })

  it('should apply transform from SpawnPoseState', async () => {
    const { component, spawnEntity } = defineNetworkedComponent({
      component: {
        name: 'TestNetworkedComponent',
        schema: S.Object({
          value: S.Number(0)
        })
      }
    })

    const position = new Vector3(1, 2, 3)
    const rotation = new Quaternion(0, 0, 0, 1)
    const { entity, entityUUID } = spawnEntity({ position, rotation })

    // Verify SpawnPoseState has the correct values
    const spawnPose = getState(SpawnPoseState)[entityUUID]
    expect(spawnPose).toBeDefined()
    assertVec.approxEq(spawnPose.spawnPosition, position)

    // Render to trigger the reactor
    await act(() => render(<></>))

    // Verify the transform component has the correct values
    const transform = getComponent(entity, TransformComponent)
    assertVec.approxEq(transform.position, position)
  })

  it('should support custom state reactor', async () => {
    let reactorCalled = false

    const { spawnEntity } = defineNetworkedComponent({
      component: {
        name: 'TestNetworkedComponent',
        schema: S.Object({
          value: S.Number(0)
        })
      },
      customStateReactor: () => {
        reactorCalled = true
        return null
      }
    })

    spawnEntity({})

    // Render to trigger the reactor
    await act(() => render(<></>))

    expect(reactorCalled).toBe(true)
  })
})
