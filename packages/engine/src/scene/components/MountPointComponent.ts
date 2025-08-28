import { useEffect } from 'react'
import { Vector3 } from 'three'

import { UndefinedEntity, useEntityContext, UUIDComponent } from '@ir-engine/ecs'
import {
  defineComponent,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { dispatchAction, getState, useMutableState } from '@ir-engine/hyperflux'
import { setCallback } from '@ir-engine/spatial/src/common/CallbackComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { Schema } from '@ir-engine/hyperflux'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { emoteAnimations, preloadedAnimations } from '../../avatar/animation/Util'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { teleportAvatar } from '../../avatar/functions/moveAvatar'
import { AvatarNetworkAction } from '../../avatar/state/AvatarNetworkActions'
import { InteractableComponent, XRUIVisibilityOverride } from '../../interaction/components/InteractableComponent'
import { MountPointActions, MountPointState } from '../../interaction/functions/MountPointActions'
import { SittingComponent } from './SittingComponent'

export const MountPoint = {
  seat: 'seat' as const
}

export type MountPointTypes = (typeof MountPoint)[keyof typeof MountPoint]

const MountPointTypesSchema = Schema.LiteralUnion(Object.values(MountPoint), { default: 'seat' })

/** Mapping of mount point types to interact messages using translation keys from i18n. */
const mountPointInteractMessages = {
  [MountPoint.seat]: 'editor:properties.mountPoint.interact-message-seat'
}

const mountCallbackName = 'mountEntity'

const mountEntity = (avatarEntity: Entity, mountEntity: Entity) => {
  if (avatarEntity === UndefinedEntity || mountEntity === UndefinedEntity) return //No avatar found, likely in edit mode for now
  const mountedEntities = getState(MountPointState)
  if (UUIDComponent.get(mountEntity) in mountedEntities.mountsToMountedEntities) return //already sitting, exiting

  const avatarUUID = UUIDComponent.get(avatarEntity)
  const mountPoint = getOptionalComponent(mountEntity, MountPointComponent)
  if (!mountPoint || mountPoint.type !== MountPoint.seat) return
  const mountPointUUID = UUIDComponent.get(mountEntity)

  //check if we're already sitting or if the seat is occupied
  if (
    mountPointUUID in getState(MountPointState).mountsToMountedEntities ||
    hasComponent(avatarEntity, SittingComponent)
  )
    return

  setComponent(avatarEntity, SittingComponent, {
    mountPointEntity: mountEntity!
  })

  AvatarControllerComponent.captureMovement(avatarEntity, mountEntity)
  dispatchAction(
    AvatarNetworkAction.setAnimationState({
      animationAsset: preloadedAnimations.emotes,
      clipName: emoteAnimations.seated,
      loop: true,
      layer: 1,
      entityUUID: avatarUUID
    })
  )
  dispatchAction(
    MountPointActions.mountInteraction({
      mounted: true,
      mountedEntity: UUIDComponent.get(avatarEntity),
      targetMount: UUIDComponent.get(mountEntity)
    })
  )
}

const unmountEntity = (entity: Entity) => {
  if (!hasComponent(entity, SittingComponent)) return

  dispatchAction(
    AvatarNetworkAction.setAnimationState({
      animationAsset: preloadedAnimations.emotes,
      clipName: emoteAnimations.seated,
      needsSkip: true,
      entityUUID: UUIDComponent.get(entity)
    })
  )

  const sittingComponent = getComponent(entity, SittingComponent)

  AvatarControllerComponent.releaseMovement(entity, sittingComponent.mountPointEntity)
  dispatchAction(
    MountPointActions.mountInteraction({
      mounted: false,
      mountedEntity: UUIDComponent.get(entity),
      targetMount: UUIDComponent.get(sittingComponent.mountPointEntity)
    })
  )
  const mountTransform = getComponent(sittingComponent.mountPointEntity, TransformComponent)
  const mountComponent = getComponent(sittingComponent.mountPointEntity, MountPointComponent)
  //We use teleport avatar only when rigidbody is not enabled, otherwise translation is called on rigidbody
  const dismountPoint = new Vector3().copy(mountComponent.dismountOffset).applyMatrix4(mountTransform.matrixWorld)
  teleportAvatar(entity, dismountPoint, mountComponent.forceDismountPosition)
  removeComponent(entity, SittingComponent)
}

export const MountPointComponent = defineComponent({
  name: 'MountPointComponent',
  jsonID: 'EE_mount_point',

  schema: Schema.Object({
    type: MountPointTypesSchema,
    dismountOffset: T.Vec3(new Vector3(0, 0, 0.75)),
    forceDismountPosition: Schema.Bool()
  }),

  mountEntity,
  unmountEntity,
  mountCallbackName,
  mountPointInteractMessages,

  reactor: function () {
    const entity = useEntityContext()
    const mountedEntities = useMutableState(MountPointState)

    useEffect(() => {
      setCallback(entity, mountCallbackName, () => mountEntity(AvatarComponent.getSelfAvatarEntity(), entity))
    }, [])

    useEffect(() => {
      // manually hide interactable's XRUI when mounted through visibleComponent - (as interactable uses opacity to toggle visibility)
      const interactableComponent = getOptionalComponent(entity, InteractableComponent)
      if (interactableComponent) {
        interactableComponent.uiVisibilityOverride =
          UUIDComponent.get(entity) in mountedEntities.mountsToMountedEntities.value
            ? XRUIVisibilityOverride.off
            : XRUIVisibilityOverride.none
      }
    }, [mountedEntities.mountsToMountedEntities])

    return null
  }
})
