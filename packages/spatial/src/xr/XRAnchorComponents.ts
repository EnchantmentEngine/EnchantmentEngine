import { useEffect } from 'react'
import { BufferGeometry, Mesh, MeshStandardMaterial, Object3D, ShadowMaterial } from 'three'

import {
  createEntity,
  defineComponent,
  EntityTreeComponent,
  EntityUUID,
  getComponent,
  removeEntity,
  setComponent,
  useComponent,
  useEntityContext,
  useOptionalComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import { defineAction, getState, Schema, useHookstate, useMutableState } from '@ir-engine/hyperflux'

import { ReferenceSpaceState } from '../ReferenceSpaceState'
import { NameComponent } from '../common/NameComponent'
import { MeshComponent } from '../renderer/components/MeshComponent'
import { ObjectComponent } from '../renderer/components/ObjectComponent'
import { T } from '../schema/schemaFunctions'
import { TransformComponent } from '../transform/components/TransformComponent'
import { XRState } from './XRState'

/**
 * A PersistentAnchorComponent specifies that an entity represents an
 *   AR location that can be resolved by a Visual Positioning System
 */
export const PersistentAnchorComponent = defineComponent({
  name: 'PersistentAnchorComponent',
  jsonID: 'EE_persistent_anchor',

  schema: Schema.Object({
    /** an identifiable name for this anchor */
    name: Schema.String({ default: '' }),
    /** whether to show this object as a wireframe upon tracking - useful for debugging */
    wireframe: Schema.Bool({ default: false }),
    /** internal - whether this anchor is currently being tracked */
    active: Schema.Bool({ default: false })
  }),

  reactor: PersistentAnchorReactor
})

/**
 * PersistentAnchorComponent entity state reactor - reacts to the conditions upon which a mesh should be
 * @param
 * @returns
 */
function PersistentAnchorReactor() {
  const entity = useEntityContext()

  const originalParentEntityUUID = useHookstate('' as EntityUUID)

  const anchor = useComponent(entity, PersistentAnchorComponent)
  const objectComponent = useOptionalComponent(entity, ObjectComponent)
  const xrState = useMutableState(XRState)

  const obj = objectComponent as (Object3D & Mesh<BufferGeometry, MeshStandardMaterial>) | undefined

  useEffect(() => {
    if (!obj) return
    const active = anchor.active && xrState.sessionMode.value === 'immersive-ar'
    if (!active) return

    /** remove from scene and add to world origins */
    const originalParent = UUIDComponent.get(getComponent(entity, EntityTreeComponent).parentEntity)
    originalParentEntityUUID.set(originalParent)
    setComponent(entity, EntityTreeComponent, { parentEntity: getState(ReferenceSpaceState).localFloorEntity })
    TransformComponent.dirty[entity] = 1

    const wireframe = anchor.wireframe

    const shadowMesh = new Mesh().copy(obj, true)
    shadowMesh.material = new ShadowMaterial({ opacity: 0.5, color: 0x0a0a0a, colorWrite: false })
    const parentEntity = getComponent(obj.entity!, EntityTreeComponent).parentEntity!
    const shadowEntity = createEntity()
    setComponent(shadowEntity, NameComponent, obj.name + '_shadow')
    setComponent(shadowEntity, TransformComponent, {
      position: obj.position.clone(),
      rotation: obj.quaternion.clone(),
      scale: obj.scale.clone()
    })
    setComponent(shadowEntity, EntityTreeComponent, { parentEntity })
    setComponent(shadowEntity, MeshComponent, shadowMesh)
    setComponent(shadowEntity, ObjectComponent, shadowMesh)

    if (wireframe) {
      obj.material.wireframe = true
    } else {
      obj.visible = false
    }

    return () => {
      /** add back to the scene */
      const originalParent = UUIDComponent.getEntityByUUID(originalParentEntityUUID.value)
      setComponent(entity, EntityTreeComponent, { parentEntity: originalParent })
      TransformComponent.dirty[entity] = 1

      if (typeof wireframe === 'boolean') {
        obj.material.wireframe = wireframe
      } else {
        obj.visible = true
      }
      removeEntity(shadowEntity)
    }
  }, [anchor.active, !!objectComponent, xrState.sessionActive])

  return null
}

export class PersistentAnchorActions {
  static anchorFound = defineAction(
    Schema.Object(
      {
        name: Schema.String(),
        position: T.Vec3(),
        rotation: T.Quaternion()
      },
      {
        $id: 'xre.anchor.anchorFound' as const
      }
    )
  )

  static anchorUpdated = defineAction(
    Schema.Object(
      {
        name: Schema.String(),
        position: T.Vec3(),
        rotation: T.Quaternion()
      },
      {
        $id: 'xre.anchor.anchorUpdated' as const
      }
    )
  )

  static anchorLost = defineAction(
    Schema.Object(
      {
        name: Schema.String()
      },
      {
        $id: 'xre.anchor.anchorLost' as const
      }
    )
  )
}
