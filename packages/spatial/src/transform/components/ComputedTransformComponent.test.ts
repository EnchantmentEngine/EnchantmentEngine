import {
  CreateSchemaValue,
  Entity,
  S,
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
import { assertArray } from '../../../tests/util/assert'
import { ComputedTransformComponent } from './ComputedTransformComponent'

type ComputedTransformComponentData = {
  referenceEntities: Entity[]
  computeFunction: (() => void) | undefined
}

const defaultSchemaFunction = CreateSchemaValue(S.Call())

const ComputedTransformComponentDefaults: ComputedTransformComponentData = {
  referenceEntities: [] as Entity[],
  computeFunction: defaultSchemaFunction
}

function assertComputedTransformComponentEq(
  A: ComputedTransformComponentData,
  B: ComputedTransformComponentData
): void {
  assertArray.eq(A.referenceEntities, B.referenceEntities)
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
