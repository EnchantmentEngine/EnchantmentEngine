import assert from 'assert'
import { afterEach, beforeEach, describe, it } from 'vitest'

import { HyperFlux, Schema } from '@ir-engine/hyperflux'

import { getAllEntities } from 'bitecs'
import {
  createEntity,
  defineComponent,
  entityExists,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  removeEntity,
  setComponent
} from '../src/ComponentFunctions'
import { createEngine, destroyEngine } from '../src/Engine'
import { defineQuery } from '../src/QueryFunctions'

const mockDeltaMillis = 1000 / 60

const MockComponent = defineComponent({
  name: 'MockComponent',
  schema: Schema.Object({
    mockValue: Schema.Number({ default: 0 })
  })
})

describe('ECS', () => {
  beforeEach(() => {
    createEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('should create ECS world', () => {
    const entities = getAllEntities(HyperFlux.store)
    assert(Array.isArray(entities))
    assert.equal(entities.length, 1)
  })

  it('should add entity', async () => {
    const entityLengthBeforeCreate = getAllEntities(HyperFlux.store).length
    const entity = createEntity()
    const entitiesAfterCreate = getAllEntities(HyperFlux.store)
    assert(entitiesAfterCreate.includes(entity))
    assert.strictEqual(entitiesAfterCreate.length, entityLengthBeforeCreate + 1)
  })

  it('should support enter and exit queries', () => {
    const entity = createEntity()
    const query = defineQuery([MockComponent])

    assert.equal(query().length, 0)
    assert.equal(query.enter().length, 0)
    assert.equal(query.exit().length, 0)

    setComponent(entity, MockComponent, { mockValue: 42 })
    assert.ok(query().includes(entity))
    assert.equal(query.enter()[0], entity)
    assert.equal(query.exit().length, 0)

    removeComponent(entity, MockComponent)
    assert.ok(!query().includes(entity))
    assert.equal(query.enter().length, 0)
    assert.equal(query.exit()[0], entity)

    setComponent(entity, MockComponent, { mockValue: 43 })
    assert.ok(query().includes(entity))
    assert.equal(query.enter()[0], entity)
    assert.equal(query.exit().length, 0)

    removeComponent(entity, MockComponent)
    setComponent(entity, MockComponent, { mockValue: 44 })
    assert.ok(query().includes(entity))
    let enter = query.enter()
    let exit = query.exit()
    assert.equal(enter.length, 1)
    assert.equal(enter[0], entity)

    /** @todo - revisit this with new bitecs release, enterQUery vs enterQueue */
    // assert.equal(exit.length, 0)
    // assert.equal(exit.length, 1)
    // assert.equal(exit[0], entity)

    // removeComponent(entity, MockComponent)
    // setComponent(entity, MockComponent, { mockValueWrong: 44 } as any)

    // removeComponent(entity, MockComponent)
    // setComponent(entity, MockComponent, {})

    // removeComponent(entity, MockComponent)
    // setComponent(entity, MockComponent, { mockValue: 'hi' } as any)
  })

  it('should add component', async () => {
    const entity = createEntity()
    const mockValue = Math.random()
    setComponent(entity, MockComponent, { mockValue })
    const component = getComponent(entity, MockComponent)
    assert(component)
    assert.strictEqual(component.mockValue, mockValue)
  })

  it('should remove and clean up component', async () => {
    const entity = createEntity()
    const mockValue = Math.random()

    setComponent(entity, MockComponent, { mockValue })
    removeComponent(entity, MockComponent)

    const query = defineQuery([MockComponent])
    assert.deepStrictEqual([...query()], [])
    assert.deepStrictEqual(query.enter(), [])
    assert.deepStrictEqual(query.exit(), [])
  })

  it('should re-add component', async () => {
    const entity = createEntity()

    const mockValue = Math.random()
    setComponent(entity, MockComponent, { mockValue })

    removeComponent(entity, MockComponent)

    const newMockValue = 1 + Math.random()
    assert.equal(hasComponent(entity, MockComponent), false)
    setComponent(entity, MockComponent, { mockValue: newMockValue })
    assert.equal(hasComponent(entity, MockComponent), true)
    const component = getComponent(entity, MockComponent)
    assert(component)
    assert.strictEqual(component.mockValue, newMockValue)
  })

  it('should remove and clean up entity', async () => {
    const entity = createEntity()
    const mockValue = Math.random()
    setComponent(entity, MockComponent, { mockValue })
    const entities = getAllEntities(HyperFlux.store)
    assert(entities.includes(entity))
    removeEntity(entity)
    assert.ok(!getOptionalComponent(entity, MockComponent))
    assert(!entityExists(entity))
    // assert.ok(!getAllEntities(HyperFlux.store).includes(entity))
  })

  it('should remove entity', async () => {
    const entity = createEntity()
    assert.ok(entityExists(entity))
    removeEntity(entity)
    assert.ok(!entityExists(entity))
  })

  it('should noop with entity that is already removed', async () => {
    const entity = createEntity()
    assert.ok(entityExists(entity))
    removeEntity(entity)
    removeEntity(entity)
    assert.ok(!entityExists(entity))
  })
})
