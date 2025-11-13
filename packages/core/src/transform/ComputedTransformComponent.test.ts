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
import { CreateSchemaValue, Schema } from '@ir-engine/hyperflux'
import assert from 'assert'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { ComputedTransformComponent } from './ComputedTransformComponent'

type ComputedTransformComponentData = {
  referenceEntities: Entity[]
  computeFunction: (() => void) | undefined
}

const defaultSchemaFunction = CreateSchemaValue(Schema.Func([], Schema.Void()))

const ComputedTransformComponentDefaults: ComputedTransformComponentData = {
  referenceEntities: [] as Entity[],
  computeFunction: defaultSchemaFunction
}

function assertComputedTransformComponentEq(
  A: ComputedTransformComponentData,
  B: ComputedTransformComponentData
): void {
  for (const enty of A.referenceEntities) assert.ok(B.referenceEntities.includes(enty))
  assert.deepEqual(A.referenceEntities, B.referenceEntities)
  assert.equal(A.computeFunction?.toString(), B.computeFunction?.toString())
}

describe('ComputedTransformComponent', () => {
  describe('IDs', () => {
    it('should initialize the ComputedTransformComponent.name field with the expected value', () => {
      assert.equal(ComputedTransformComponent.name, 'ComputedTransformComponent')
    })
  }) //:: IDs

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, ComputedTransformComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, ComputedTransformComponent)
      assertComputedTransformComponentEq(data, ComputedTransformComponentDefaults)
    })
  }) //:: onInit

  describe('onSet', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, ComputedTransformComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should change the values of an initialized ComputedTransformComponent', () => {
      const before = getComponent(testEntity, ComputedTransformComponent)
      assertComputedTransformComponentEq(before, ComputedTransformComponentDefaults)
      const Expected = {
        referenceEntities: [1, 2, 3] as Entity[],
        computeFunction: () => {
          let thing = 0
          ++thing
        }
      }
      setComponent(testEntity, ComputedTransformComponent, Expected)
      const after = getComponent(testEntity, ComputedTransformComponent)
      assertComputedTransformComponentEq(after, Expected)
    })
  }) //:: onSet
}) //:: ComputedTransformComponent
