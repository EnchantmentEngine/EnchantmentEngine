import assert from 'assert'
import { afterEach, beforeEach, describe, it } from 'vitest'

import { createEntity } from '@ir-engine/ecs'
import { getComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { createEngine, destroyEngine } from '@ir-engine/ecs/src/Engine'
import { proxifyQuaternion, proxifyVector3 } from '@ir-engine/spatial/src/common/proxies/createThreejsProxy'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

describe('Structure of Array Synchronization', () => {
  beforeEach(() => {
    createEngine()
  })

  it('should synchronize values between transform objects and SoA data', () => {
    /* mock */

    const entity = createEntity()
    setComponent(entity, TransformComponent, {
      position: proxifyVector3(TransformComponent.position, entity).set(1, 2, 3),
      rotation: proxifyQuaternion(TransformComponent.rotation, entity).set(1, 2, 3, 4)
    })
    const transform = getComponent(entity, TransformComponent)

    /* assert */
    assert.strictEqual(transform.position.x, TransformComponent.position.x[entity])
    assert.strictEqual(transform.position.y, TransformComponent.position.y[entity])
    assert.strictEqual(transform.position.z, TransformComponent.position.z[entity])

    assert.strictEqual(transform.rotation.x, TransformComponent.rotation.x[entity])
    assert.strictEqual(transform.rotation.y, TransformComponent.rotation.y[entity])
    assert.strictEqual(transform.rotation.z, TransformComponent.rotation.z[entity])
    assert.strictEqual(transform.rotation.w, TransformComponent.rotation.w[entity])
  })

  afterEach(() => {
    return destroyEngine()
  })
})
