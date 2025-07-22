import { createEntity, defineComponent, destroyEngine, Entity, getComponent, S, setComponent } from '@ir-engine/ecs'
import { createResizableTypeArray } from '@ir-engine/ecs/src/bitecsLegacy'
import { createEngine } from '@ir-engine/ecs/src/Engine'
import assert from 'assert'
import { Vector3 } from 'three'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { T } from '../../schema/schemaFunctions'
import { proxifyVector3 } from './createThreejsProxy'

describe('createThreejsProxy', () => {
  beforeEach(async () => {
    createEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('proxifyVector3', () => {
    const assignVector3 = (entity: Entity): Vector3 => proxifyVector3(Vector3Component.position, entity)

    const Vector3Component = defineComponent({
      name: 'Vector3Component',
      schema: S.Object({
        position: T.Vec3()
      }),
      storage: {
        position: {
          x: createResizableTypeArray(Float64Array),
          y: createResizableTypeArray(Float64Array),
          z: createResizableTypeArray(Float64Array)
        }
      },
      onInit(entity, initial) {
        initial.position = assignVector3(entity)
        return initial
      }
    })

    const entity = createEntity()
    setComponent(entity, Vector3Component)
    const component = getComponent(entity, Vector3Component)
    const vec3 = component.position

    assert(vec3.isVector3)

    vec3.x = 12
    assert.equal(vec3.x, 12)
    assert.equal(component.position.x, 12)
    assert.equal(Vector3Component.position.x[entity], 12)

    component.position.x = 13
    assert.equal(vec3.x, 13)
    assert.equal(component.position.x, 13)
    assert.equal(Vector3Component.position.x[entity], 13)

    Vector3Component.position.x[entity] = 14
    assert.equal(vec3.x, 14)
    assert.equal(component.position.x, 14)
    assert.equal(Vector3Component.position.x[entity], 14)
  })
})
