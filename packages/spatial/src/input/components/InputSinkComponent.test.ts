import {
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
import { InputSinkComponent } from './InputSinkComponent'

const InputSinkComponentDefaults = []

describe('InputSinkComponent', () => {
  describe('IDs', () => {
    it('should initialize the InputSinkComponent.name field with the expected value', () => {
      assert.equal(InputSinkComponent.name, 'InputSinkComponent')
    })
  })

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, InputSinkComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected values', () => {
      const data = getComponent(testEntity, InputSinkComponent)
      assert.equal(typeof data, typeof InputSinkComponentDefaults)
    })
  }) // << onInit
})
