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

import { createEngine, createEntity, destroyEngine, getComponent, setComponent } from '@ir-engine/ecs'
import { Vector3 } from 'three'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { NPCMovementComponent } from './NPCMovementComponent'

describe('NPCMovementComponent', () => {
  beforeEach(async () => {
    createEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('should create movement component with default values', () => {
    const entity = createEntity()
    setComponent(entity, NPCMovementComponent)

    const movementComponent = getComponent(entity, NPCMovementComponent)

    expect(movementComponent.movementSpeed).toBe(1.0)
    expect(movementComponent.isMoving).toBe(false)
    expect(movementComponent.behaviorState).toBe('idle')
    expect(movementComponent.nextDecisionTime).toBe(0)
    expect(movementComponent.decisionInterval).toBe(3.0)
    expect(movementComponent.lookAtTarget).toBe(true)
    expect(movementComponent.wanderRadius).toBe(10.0)
  })

  it('should set custom movement parameters', () => {
    const entity = createEntity()
    const targetPos = new Vector3(5, 0, 5)

    setComponent(entity, NPCMovementComponent, {
      targetPosition: targetPos,
      movementSpeed: 2.5,
      isMoving: true,
      behaviorState: 'wandering',
      wanderRadius: 15.0
    })

    const movementComponent = getComponent(entity, NPCMovementComponent)

    expect(movementComponent.targetPosition.x).toBe(5)
    expect(movementComponent.targetPosition.y).toBe(0)
    expect(movementComponent.targetPosition.z).toBe(5)
    expect(movementComponent.movementSpeed).toBe(2.5)
    expect(movementComponent.isMoving).toBe(true)
    expect(movementComponent.behaviorState).toBe('wandering')
    expect(movementComponent.wanderRadius).toBe(15.0)
  })

  it('should handle movement direction vectors', () => {
    const entity = createEntity()
    const direction = new Vector3(1, 0, 0).normalize()

    setComponent(entity, NPCMovementComponent, {
      movementDirection: direction
    })

    const movementComponent = getComponent(entity, NPCMovementComponent)

    expect(movementComponent.movementDirection.x).toBeCloseTo(1)
    expect(movementComponent.movementDirection.y).toBeCloseTo(0)
    expect(movementComponent.movementDirection.z).toBeCloseTo(0)
  })
})
