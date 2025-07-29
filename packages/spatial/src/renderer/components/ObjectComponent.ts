import '../../threejsPatches'

import { Object3D } from 'three'

import {
  EntityTreeComponent,
  UUIDComponent,
  defineComponent,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '@ir-engine/ecs'
import { Entity } from '@ir-engine/ecs/src/Entity'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { removeCallback, setCallback } from '../../common/CallbackComponent'
import { NameComponent } from '../../common/NameComponent'
import { proxifyQuaternionWithDirty, proxifyVector3WithDirty } from '../../common/proxies/createThreejsProxy'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { Layer, ObjectLayerMaskComponent } from './ObjectLayerComponent'
import { VisibleComponent } from './VisibleComponent'

export const ObjectComponent = defineComponent({
  name: 'ObjectComponent',

  schema: S.Type<Object3D>({ required: true }),

  onSet(entity, component, obj: Object3D) {
    if (!obj?.isObject3D) throw new Error('ObjectComponent requires an Object3D')

    setComponent(entity, TransformComponent)

    obj.entity = entity
    if (obj.rotation) obj.rotation._onChangeCallback = () => {}
    obj.quaternion._onChangeCallback = () => {}

    const transform = getComponent(entity, TransformComponent)
    obj.position.copy(transform.position)
    obj.quaternion.copy(transform.rotation)
    obj.scale.copy(transform.scale)
    obj.matrixAutoUpdate = false
    obj.matrixWorldAutoUpdate = false
    obj.matrix = transform.matrix
    obj.matrixWorld = transform.matrixWorld
    const currentMask = hasComponent(entity, ObjectLayerMaskComponent)
      ? ObjectLayerMaskComponent.mask[entity]
      : obj.layers.mask
    setComponent(entity, ObjectLayerMaskComponent, currentMask)
    obj.layers = new Layer(entity)

    obj.frustumCulled = false

    /** until all three hierarchies are replaced with ECS, we need to preserve this in a few cases  */
    if (!obj.preserveChildren) {
      Object.defineProperties(obj, {
        uuid: {
          get() {
            return getComponent(entity, UUIDComponent)
          }
        },
        rotation: {
          get() {},
          set(value) {}
        },
        parent: {
          get() {
            if (ObjectComponent.activeRender) return null // hack to check if renderer is rendering
            if (getOptionalComponent(entity, EntityTreeComponent)?.parentEntity) {
              const result = getOptionalComponent(
                getComponent(entity, EntityTreeComponent).parentEntity!,
                ObjectComponent
              )
              return result ?? null
            }
            return null
          },
          set(value) {
            if (value != undefined) throw new Error('Cannot set parent of proxified object')
            console.warn('Setting to nil value is not supported ObjectComponent.ts')
          }
        },
        children: {
          get() {
            if (ObjectComponent.activeRender) return [] // hack to check if renderer is rendering
            if (hasComponent(entity, EntityTreeComponent)) {
              const childEntities = getComponent(entity, EntityTreeComponent).children
              const result: Object3D[] = []
              for (const childEntity of childEntities) {
                if (hasComponent(childEntity, ObjectComponent)) {
                  result.push(getComponent(childEntity, ObjectComponent))
                }
              }
              return result
            } else {
              return []
            }
          },
          set(value) {
            if (value != undefined) throw new Error('Cannot set children of proxified object')
            console.warn('Setting to nil value is not supported ObjectComponent.ts')
          }
        },
        isProxified: {
          value: true
        }
      })
      Object.assign(obj, {
        get name() {
          return getOptionalComponent(entity, NameComponent)
        },
        set name(value) {
          if (value != undefined) throw new Error('Cannot set name of proxified object')
        },
        updateWorldMatrix: () => {}
      })
    }

    // sometimes it's convenient to update the entity transform via the Object3D,
    // so allow people to do that via proxies
    proxifyVector3WithDirty(TransformComponent.position, entity, TransformComponent.dirty, obj.position)
    proxifyQuaternionWithDirty(TransformComponent.rotation, entity, TransformComponent.dirty, obj.quaternion)
    proxifyVector3WithDirty(TransformComponent.scale, entity, TransformComponent.dirty, obj.scale)

    setCallback(entity, 'setVisible', () => {
      setComponent(entity, VisibleComponent, true)
    })

    setCallback(entity, 'setInvisible', () => {
      removeComponent(entity, VisibleComponent)
    })

    ObjectComponent.valueMap[entity] = obj
  },

  onRemove(entity: Entity, component) {
    removeCallback(entity, 'setVisible')
    removeCallback(entity, 'setInvisible')
  },

  /**
   * @deprecated will be removed once threejs objects are not proxified. Should only be used in ObjectComponent.tsx
   * see https://github.com/ir-engine/ir-engine/issues/9308
   */
  activeRender: false
})

/** @deprecated GroupComponent renamed to ObjectComponent */
export const GroupComponent = ObjectComponent

/** @deprecated use setComponent(entity, ObjectComponent, object) */
export function addObjectToGroup(entity: Entity, object: Object3D) {
  if (hasComponent(entity, ObjectComponent)) {
    if (getComponent(entity, ObjectComponent) === object)
      return console.warn('[addObjectToGroup] Entity already has the object')
    throw new Error('[addObjectToGroup] Entity already has an ObjectComponent')
  }
  setComponent(entity, ObjectComponent, object)
}

/** @deprecated use removeComponent(entity, ObjectComponent) */
export function removeObjectFromGroup(entity: Entity, object: Object3D) {
  removeComponent(entity, ObjectComponent)
}

export type GroupReactorProps = {
  entity: Entity
  obj: Object3D
}
