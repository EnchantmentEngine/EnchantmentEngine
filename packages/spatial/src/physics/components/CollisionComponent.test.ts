import {
  Entity,
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import assert from 'assert'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { ColliderHitEvent } from '../types/PhysicsTypes'
import { CollisionComponent } from './CollisionComponent'

const CollisionComponentDefaults = new Map<Entity, ColliderHitEvent>()

describe('CollisionComponent', () => {
  describe('IDs', () => {
    it('should initialize the CollisionComponent.name field with the expected value', () => {
      assert.equal(CollisionComponent.name, 'CollisionComponent')
    })
  })

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, CollisionComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, CollisionComponent)
      assert.deepEqual(data, CollisionComponentDefaults)
    })
  }) // << onInit
})
