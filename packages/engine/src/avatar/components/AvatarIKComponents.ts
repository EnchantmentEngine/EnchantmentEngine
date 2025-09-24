import { AxesHelper, Quaternion, Vector3 } from 'three'

import {
  NetworkObjectComponent,
  NetworkObjectSendPeriodicUpdatesTag,
  useEntityContext,
  UUIDComponent
} from '@ir-engine/ecs'
import {
  defineComponent,
  getComponent,
  getOptionalComponent,
  setComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity, EntityID, SourceID } from '@ir-engine/ecs/src/Entity'
import { getMutableState, Schema, useHookstate } from '@ir-engine/hyperflux'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { ObjectLayerMasks } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { createResizableTypeArray } from '@ir-engine/ecs/src/bitecsLegacy'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { useHelperEntity } from '@ir-engine/spatial/src/helper/functions/useHelperEntity'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { useEffect } from 'react'
import { definePrefab } from '../../scene/functions/definePrefab'
import { ikTargets } from '../animation/Util'
import { AvatarRigComponent } from './AvatarAnimationComponent'

export const AvatarHeadDecapComponent = defineComponent({
  name: 'AvatarHeadDecapComponent'
})

export const AvatarIKTargetComponent = defineComponent({
  name: 'AvatarIKTargetComponent',
  storage: { blendWeight: createResizableTypeArray(Float64Array) },

  reactor: function () {
    const entity = useEntityContext()
    const debugEnabled = useHookstate(getMutableState(RendererState).avatarDebug)

    useHelperEntity(entity, () => new AxesHelper(0.5), debugEnabled.value, ObjectLayerMasks.AvatarHelper)

    return null
  },

  getTargetEntity: (ownerID: SourceID, targetName: (typeof ikTargets)[keyof typeof ikTargets]) => {
    return UUIDComponent.getEntityByUUID(
      UUIDComponent.join({ entitySourceID: ownerID, entityID: targetName as EntityID })
    )
  }
})

/**
 * Gets the hand position in world space
 * @param entity the player entity
 * @param hand which hand to get
 * @returns {Vector3}
 */

const vec3 = new Vector3()
const quat = new Quaternion()

type HandTargetReturn = { position: Vector3; rotation: Quaternion } | null
export const getHandTarget = (entity: Entity, hand: XRHandedness): HandTargetReturn => {
  const networkComponent = getComponent(entity, NetworkObjectComponent)

  const targetEntity = UUIDComponent.getEntityByUUID(
    UUIDComponent.join({ entitySourceID: networkComponent.ownerId as string as SourceID, entityID: hand as EntityID })
  )
  if (targetEntity && AvatarIKTargetComponent.blendWeight[targetEntity] > 0)
    return getComponent(targetEntity, TransformComponent)

  const rig = getOptionalComponent(entity, AvatarRigComponent)?.bonesToEntities
  if (!rig?.rightHand || !rig?.leftHand || !rig?.head) return getComponent(entity, TransformComponent)

  switch (hand) {
    case 'left': {
      return {
        position: TransformComponent.getScenePosition(rig.leftHand, vec3),
        rotation: TransformComponent.getSceneRotation(rig.leftHand, quat)
      }
    }
    case 'right':
      return {
        position: TransformComponent.getScenePosition(rig.rightHand, vec3),
        rotation: TransformComponent.getSceneRotation(rig.rightHand, quat)
      }
    default:
    case 'none':
      return {
        position: TransformComponent.getScenePosition(rig.head, vec3),
        rotation: TransformComponent.getSceneRotation(rig.head, quat)
      }
  }
}

export const IKMatrixComponent = defineComponent({
  name: 'IKMatricesComponent',
  schema: Schema.Object({
    /** contains ik solve data */
    local: T.Mat4(),
    world: T.Mat4()
  })
})

export const AvatarIKComponent = defineComponent({
  name: 'AvatarIKComponent'
})

export const AvatarIKPrefab = definePrefab({
  name: 'AvatarIKPrefab',
  components: [AvatarIKTargetComponent, NameComponent],
  reactor: ({ entity }) => {
    useEffect(() => {
      setComponent(entity, VisibleComponent)
      setComponent(entity, NetworkObjectSendPeriodicUpdatesTag)
    }, [])
    return null
  }
})
