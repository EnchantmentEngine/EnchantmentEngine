import {
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  hasComponent,
  removeEntity,
  serializeComponent,
  setComponent,
  UndefinedEntity
} from '@ir-engine/ecs'
import assert from 'assert'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { setVisibleComponent, VisibleComponent } from './VisibleComponent'

const VisibleComponentDefault = true

describe('VisibleComponent', () => {
  describe('IDs', () => {
    it('should initialize the VisibleComponent.name field with the expected value', () => {
      assert.equal(VisibleComponent.name, 'VisibleComponent')
    })

    it('should initialize the VisibleComponent.jsonID field with the expected value', () => {
      assert.equal(VisibleComponent.jsonID, 'EE_visible')
    })
  }) //:: IDs

  describe('onSet', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should set the value of the VisibleComponent correctly', () => {
      assert.notEqual(hasComponent(testEntity, VisibleComponent), VisibleComponentDefault)
      setComponent(testEntity, VisibleComponent)
      assert.equal(getComponent(testEntity, VisibleComponent), VisibleComponentDefault)
    })
  }) //:: onSet

  describe('toJSON', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should serialize the component data as expected', () => {
      setComponent(testEntity, VisibleComponent)
      const result = serializeComponent(testEntity, VisibleComponent)
      assert.equal(typeof result, 'object')
      assert.equal(Object.keys(result).length, 0)
    })
  }) //:: toJSON
}) //:: VisibleComponent

describe('setVisibleComponent', () => {
  let testEntity = UndefinedEntity

  beforeEach(async () => {
    createEngine()
    testEntity = createEntity()
  })

  afterEach(() => {
    removeEntity(testEntity)
    return destroyEngine()
  })

  it("should add a VisibleComponent to the entity when it doesn't have one and `@param visible` is set to true", () => {
    assert.equal(hasComponent(testEntity, VisibleComponent), false)
    setVisibleComponent(testEntity, true)
    assert.equal(hasComponent(testEntity, VisibleComponent), true)
  })

  it('should remove the VisibleComponent from the entity when it has one and `@param visible` is set to false', () => {
    assert.equal(hasComponent(testEntity, VisibleComponent), false)
    setVisibleComponent(testEntity, true)
    assert.equal(hasComponent(testEntity, VisibleComponent), true)
    setVisibleComponent(testEntity, false)
    assert.equal(hasComponent(testEntity, VisibleComponent), false)
  })
}) //:: setVisibleComponent
