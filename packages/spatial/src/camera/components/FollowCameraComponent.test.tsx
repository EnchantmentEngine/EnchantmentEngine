import {
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  getOptionalComponent,
  removeEntity,
  setComponent,
  UndefinedEntity
} from '@ir-engine/ecs'
import assert from 'assert'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { mockSpatialEngine } from '../../../tests/util/mockSpatialEngine'
import { destroySpatialEngine } from '../../initializeEngine'
import { TransformComponent } from '../../SpatialModule'
import { FollowCameraComponent } from './FollowCameraComponent'

type FollowCameraComponentData = { minPhi: number; maxPhi: number; minTheta?: number; maxTheta?: number }
const FollowCameraComponentDefaults = {
  minTheta: 0,
  maxTheta: 0
} as FollowCameraComponentData

function assertFollowCameraComponentEqual(A: FollowCameraComponentData, B: FollowCameraComponentData): void {
  assert.equal(A.minTheta, B.minTheta)
  assert.equal(A.maxTheta, B.maxTheta)
}
function assertFollowCameraComponentNotEqual(A: FollowCameraComponentData, B: FollowCameraComponentData): void {
  assert.notEqual(A.minTheta, B.minTheta)
  assert.notEqual(A.maxTheta, B.maxTheta)
}

describe('FollowCameraComponent', () => {
  describe('IDs', () => {
    it('should initialize the FollowCameraComponent.name field with the expected value', () => {
      assert.equal(FollowCameraComponent.name, 'FollowCameraComponent')
    })
  })

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, TransformComponent)
      setComponent(testEntity, FollowCameraComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, FollowCameraComponent)
      assertFollowCameraComponentEqual(data, FollowCameraComponentDefaults)
    })
  })

  describe('onSet', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      mockSpatialEngine()
      testEntity = createEntity()
      setComponent(testEntity, TransformComponent)
      setComponent(testEntity, FollowCameraComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      destroySpatialEngine()
      return destroyEngine()
    })

    it('should change the values of an initialized FollowCameraComponent', () => {
      const before = getOptionalComponent(testEntity, FollowCameraComponent)
      assertFollowCameraComponentEqual(before!, FollowCameraComponentDefaults)
      setComponent(testEntity, FollowCameraComponent, { minTheta: 160, maxTheta: 170 })
      const after = getComponent(testEntity, FollowCameraComponent)
      assertFollowCameraComponentNotEqual(after, FollowCameraComponentDefaults)
    })
  })
})
