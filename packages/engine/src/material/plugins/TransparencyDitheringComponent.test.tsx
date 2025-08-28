import {
  createEngine,
  createEntity,
  createInitialComponentValue,
  destroyEngine,
  Entity,
  EntityID,
  getComponent,
  hasComponent,
  removeEntity,
  setComponent,
  SourceID,
  UndefinedEntity,
  UUIDComponent
} from '@ir-engine/ecs'
import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { assertArray } from '@ir-engine/spatial/tests/util/assert'
import assert from 'assert'
import { Material, Vector3 } from 'three'
import { afterEach, beforeEach, describe, it, vi } from 'vitest'
import {
  DitherCalculationType,
  TransparencyDitheringPluginComponent,
  TransparencyDitheringRootComponent
} from './TransparencyDitheringComponent'

type TransparencyDitheringRootComponentData = {
  materials: Entity[]
}
const TransparencyDitheringRootComponentDefaults: TransparencyDitheringRootComponentData = {
  materials: [] as Entity[]
}

function assertTransparencyDitheringRootComponentEq(
  A: TransparencyDitheringRootComponentData,
  B: TransparencyDitheringRootComponentData
): void {
  assertArray.eq(A.materials, B.materials)
}

describe('TransparencyDitheringRootComponent', () => {
  describe('IDs', () => {
    it('should initialize the TransparencyDitheringRootComponent.name field with the expected value', () => {
      assert.equal(TransparencyDitheringRootComponent.name, 'TransparencyDitheringRootComponent')
    })
  }) //:: IDs

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, TransparencyDitheringRootComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, TransparencyDitheringRootComponent)
      assertTransparencyDitheringRootComponentEq(data, TransparencyDitheringRootComponentDefaults)
    })
  }) //:: onInit

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
  }) //:: onSet
})

type TransparencyDitheringPluginComponentData = {
  centers: Vector3[]
  exponents: number[]
  distances: number[]
  useWorldCalculation: DitherCalculationType[]
}

const TransparencyDitheringPluginComponentDefaults: TransparencyDitheringPluginComponentData =
  createInitialComponentValue(UndefinedEntity, TransparencyDitheringPluginComponent)

function assertTransparencyDitheringPluginComponentEq(
  A: TransparencyDitheringPluginComponentData,
  B: TransparencyDitheringPluginComponentData
): void {
  assert.deepEqual(A.centers, B.centers)
  assert.deepEqual(A.exponents, B.exponents)
  assert.deepEqual(A.distances, B.distances)
  assert.deepEqual(A.useWorldCalculation, B.useWorldCalculation)
}

describe('TransparencyDitheringPluginComponent', () => {
  describe('IDs', () => {
    it('should initialize the TransparencyDitheringPluginComponent.name field with the expected value', () => {
      assert.equal(TransparencyDitheringPluginComponent.name, 'TransparencyDitheringPluginComponent')
    })
  }) //:: IDs

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, TransparencyDitheringPluginComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, TransparencyDitheringPluginComponent)
      assertTransparencyDitheringPluginComponentEq(data, TransparencyDitheringPluginComponentDefaults)
    })
  }) //:: onInit

  describe('reactor', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'id' as EntityID
      })
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should set call `setPlugin` on the MaterialStateComponent.material of the entityContext', async () => {
      const material = new Material()
      // Set the data as expected
      setComponent(testEntity, MaterialStateComponent, { material: material })

      // Sanity check before running
      assert.equal(getComponent(testEntity, MaterialStateComponent).material.plugins, undefined)
      // Run and Check the result
      setComponent(testEntity, TransparencyDitheringPluginComponent)
      await vi.waitFor(() => {
        assert.notEqual(getComponent(testEntity, MaterialStateComponent).material.plugins, undefined)
      })
    })

    it('should not do anything if the entityContext does not have a MaterialStateComponent', async () => {
      // Sanity check before running
      assert.equal(hasComponent(testEntity, MaterialStateComponent), false)
      // Run and Check the result
      setComponent(testEntity, TransparencyDitheringPluginComponent)
      await vi.waitFor(() => {
        assert.equal(hasComponent(testEntity, MaterialStateComponent), false)
      })
    })
  }) //:: reactor
})
