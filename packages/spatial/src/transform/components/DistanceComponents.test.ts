import assert from 'assert'
import { afterEach, beforeEach, describe, it } from 'vitest'

import {
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  removeComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import {
  DistanceFromCameraComponent,
  DistanceFromLocalClientComponent,
  FrustumCullCameraComponent
} from './DistanceComponents'

describe('DistanceFromLocalClientComponent', () => {
  describe('Fields', () => {
    it('should initialize the *Component.name field with the expected value', () => {
      assert.equal(DistanceFromLocalClientComponent.name, 'DistanceFromLocalClientComponent')
    })

    it('should intitialize the *Component.squaredDistance field with the expected value', () => {
      assert(DistanceFromLocalClientComponent.squaredDistance instanceof Float32Array)
    })
  }) //:: Fields
}) //:: DistanceFromLocalClientComponent

describe('DistanceFromCameraComponent', () => {
  describe('Fields', () => {
    it('should initialize the *Component.name field with the expected value', () => {
      assert.equal(DistanceFromCameraComponent.name, 'DistanceFromCameraComponent')
    })

    it('should intitialize the *Component.squaredDistance field with the expected value', () => {
      assert(DistanceFromCameraComponent.squaredDistance instanceof Float32Array)
    })
  }) //:: Fields
}) //:: DistanceFromCameraComponent

describe('FrustumCullCameraComponent', () => {
  describe('Fields', () => {
    it('should initialize the *Component.name field with the expected value', () => {
      assert.equal(FrustumCullCameraComponent.name, 'FrustumCullCameraComponent')
    })

    it('should intitialize the *Component.isCulled field with the expected value', () => {
      assert(FrustumCullCameraComponent.isCulled instanceof Uint8Array)
    })
  }) //:: Fields

  describe('reactor', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, FrustumCullCameraComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should set FrustumCullCameraComponent.isCulled[entity] to 0 when the component is unmounted', () => {
      const Expected = 0
      // Set the data as expected
      const Initial = 42
      FrustumCullCameraComponent.isCulled[testEntity] = Initial
      // Sanity check before running
      const before = FrustumCullCameraComponent.isCulled[testEntity]
      assert.equal(before, Initial)
      assert.notEqual(before, Expected)
      // Run and Check the result
      removeComponent(testEntity, FrustumCullCameraComponent)
      const result = FrustumCullCameraComponent.isCulled[testEntity]
      assert.equal(result, Expected)
    })
  }) //:: reactor
}) //:: FrustumCullCameraComponent
