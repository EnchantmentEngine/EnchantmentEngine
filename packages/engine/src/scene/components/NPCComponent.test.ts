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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { createEngine, createEntity, destroyEngine, getComponent, hasComponent, setComponent } from '@ir-engine/ecs'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { NPCComponent } from './NPCComponent'
import { NPCMovementComponent } from './NPCMovementComponent'

describe('NPCComponent', () => {
  beforeEach(async () => {
    createEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('should create NPC component with default values', () => {
    const entity = createEntity()
    setComponent(entity, TransformComponent)
    setComponent(entity, NPCComponent)

    const npcComponent = getComponent(entity, NPCComponent)

    expect(npcComponent.name).toBe('NPC')
    expect(npcComponent.avatarURL).toBe('')
    expect(npcComponent.aiInitialized).toBe(false)
    expect(npcComponent.aiState).toBe('idle')
  })

  it('should set custom name and avatar URL', () => {
    const entity = createEntity()
    setComponent(entity, TransformComponent)
    setComponent(entity, NPCComponent, {
      name: 'TestNPC',
      avatarURL: '/test/avatar.vrm'
    })

    const npcComponent = getComponent(entity, NPCComponent)

    expect(npcComponent.name).toBe('TestNPC')
    expect(npcComponent.avatarURL).toBe('/test/avatar.vrm')
  })

  it('should manually add NPCMovementComponent', () => {
    const entity = createEntity()
    setComponent(entity, TransformComponent)
    setComponent(entity, NPCComponent)

    // Manually add the movement component (normally done by reactor)
    setComponent(entity, NPCMovementComponent)

    expect(hasComponent(entity, NPCMovementComponent)).toBe(true)
  })

  it('should manually set NameComponent', () => {
    const entity = createEntity()
    setComponent(entity, TransformComponent)
    setComponent(entity, NPCComponent, {
      name: 'TestNPC'
    })

    // Manually set the NameComponent (normally done by reactor)
    setComponent(entity, NameComponent, 'TestNPC')

    expect(hasComponent(entity, NameComponent)).toBe(true)
    const nameComponent = getComponent(entity, NameComponent)
    expect(nameComponent).toBe('TestNPC')
  })
})
