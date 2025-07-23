import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { HyperFlux } from '@ir-engine/hyperflux'
import * as bitECS from 'bitecs'
import {
  LayerComponent,
  LayerID,
  Layers,
  _removeMarkedEntity,
  createEntity,
  entityExists,
  removeEntity
} from './ComponentFunctions'
import { createEngine, destroyEngine } from './Engine'
import { Entity, UndefinedEntity } from './Entity'

describe('createEntity', () => {
  beforeEach(() => {
    createEngine()
  })
  afterEach(() => {
    return destroyEngine()
  })

  it('should return a valid entity ID that returns true when given to `entityExists`', () => {
    const result = createEntity()
    expect(entityExists(result)).toBeTruthy()
  })

  it('should never return UndefinedEntity', () => {
    const result = createEntity()
    expect(result).not.toBe(UndefinedEntity)
  })

  it('should use Layers.Simulation as the default value for `@param layerID` when it is omitted', () => {
    const Expected = Layers.Simulation
    // Set the data as expected
    const testEntity = createEntity()
    // Run and Check the result
    const result = LayerComponent.get(testEntity)
    expect(result).toBe(Expected)
  })

  it('should create a new entity by calling bitECS.addEntity with HyperFlux.store as its world argument', () => {
    // Set the data as expected
    const testEntity = createEntity()
    // Run and Check the result
    const result = bitECS.entityExists(HyperFlux.store, testEntity)
    expect(result).toBeTruthy()
  })

  it('should set a LayerComponent on the newly created entity with `@param layerID` as its layer argument', () => {
    // Set the data as expected
    const expectedLayer = Layers.Authoring
    const testEntity = createEntity(expectedLayer)
    // Run and Check the result
    const result = LayerComponent.get(testEntity)
    expect(result).toBeTruthy()
    expect(result).toBe(expectedLayer)
  })

  it('should return the newly created entity', () => {
    const result = createEntity()
    expect(result).not.toBe(undefined)
    expect(result).toBeTruthy()
    expect(entityExists(result)).toBeTruthy()
  })

  it('should throw an error when `@param layerID` is not a valid LayerID', () => {
    expect(() => createEntity(42_000 as LayerID)).toThrowError()
  })
}) //:: createEntity

describe('removeEntity', () => {
  beforeEach(() => {
    createEngine()
  })

  afterEach(() => {
    destroyEngine()
  })

  it('should call bitECS.removeEntity with HyperFlux.store and `@param entity` as arguments', () => {
    // Set the data as expected
    const testEntity = bitECS.addEntity(HyperFlux.store) as Entity
    // Run and Check the result
    removeEntity(testEntity)
    const result = bitECS.entityExists(HyperFlux.store, testEntity)
    expect(result).equals(true)
    _removeMarkedEntity(testEntity)
    const result2 = bitECS.entityExists(HyperFlux.store, testEntity)
    expect(result2).equals(false)
  })

  /**
  // @note
  // Just for reference. These tests require circular logic that cannot be solved
  // Cannot check if the process of removing an entity is not happening on a falsy entity (aka already does not exist)
  // Cannot check if removing all components from an entity has been triggered on an entity that after the process does not exist
  it.todo('should not do anything if `@param entity` is falsy', () => {})
  it.todo('should not do anything if the result of `entityExists(entity)` is falsy', () => {})
  it.todo('should call removeAllComponents with `@param entity`', () => {})
  */
}) //:: removeEntity
