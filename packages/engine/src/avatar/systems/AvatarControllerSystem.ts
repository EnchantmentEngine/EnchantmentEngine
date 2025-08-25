import { Vector3 } from 'three'

import {
  defineQuery,
  defineSystem,
  Engine,
  EngineState,
  getComponent,
  getOptionalComponent,
  hasComponent,
  NetworkObjectAuthorityTag,
  NetworkObjectOwnedTag,
  removeComponent,
  setComponent,
  UUIDComponent,
  WorldNetworkAction
} from '@ir-engine/ecs'
import { dispatchAction, getState, NetworkState, useMutableState } from '@ir-engine/hyperflux'
import { FollowCameraComponent } from '@ir-engine/spatial/src/camera/components/FollowCameraComponent'
import { DistanceFromLocalClientComponent } from '@ir-engine/spatial/src/transform/components/DistanceComponents'
import { getDistanceSquaredFromTarget, TransformSystem } from '@ir-engine/spatial/src/transform/systems/TransformSystem'

import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { AvatarHeadDecapComponent } from '../components/AvatarIKComponents'
import { AvatarState } from '../state/AvatarNetworkState'
import { AvatarInputSystem } from './AvatarInputSystem'

const controllerQuery = defineQuery([AvatarControllerComponent, NetworkObjectOwnedTag])

const execute = () => {
  const controlledEntities = controllerQuery()

  /** @todo non-immersive camera should utilize isCameraAttachedToAvatar */
  for (const entity of controlledEntities) {
    const controller = getComponent(entity, AvatarControllerComponent)

    const followCamera = getOptionalComponent(controller.cameraEntity, FollowCameraComponent)
    if (followCamera) {
      // todo calculate head size and use that as the bound #7263
      if (followCamera.distance < 0.3) setComponent(entity, AvatarHeadDecapComponent, true)
      else removeComponent(entity, AvatarHeadDecapComponent)
    }

    if (!controller.movementCaptured.length) {
      if (
        !hasComponent(entity, NetworkObjectAuthorityTag) &&
        NetworkState.worldNetwork &&
        controller.gamepadLocalInput.lengthSq() > 0
      ) {
        dispatchAction(
          WorldNetworkAction.transferAuthorityOfObject({
            ownerID: getState(EngineState).userID,
            entityUUID: UUIDComponent.get(entity),
            newAuthority: Engine.instance.store.peerID
          })
        )
        setComponent(entity, NetworkObjectAuthorityTag)
      }
    }
  }
}

export const AvatarControllerSystem = defineSystem({
  uuid: 'ee.engine.AvatarControllerSystem',
  insert: { after: AvatarInputSystem },
  execute,
  reactor: () => {
    // we actually have no reference to AvatarState anywhere, so we need to call it to ensure it exists
    useMutableState(AvatarState)
    return null
  }
})

const distanceFromLocalClientQuery = defineQuery([TransformComponent, DistanceFromLocalClientComponent])

export const AvatarPostTransformSystem = defineSystem({
  uuid: 'ee.engine.AvatarPostTransformSystem',
  insert: { after: TransformSystem },
  execute: () => {
    const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
    if (!selfAvatarEntity) return
    const localClientPosition = TransformComponent.getWorldPosition(selfAvatarEntity, vec3)
    if (localClientPosition) {
      for (const entity of distanceFromLocalClientQuery())
        DistanceFromLocalClientComponent.squaredDistance[entity] = getDistanceSquaredFromTarget(
          entity,
          localClientPosition
        )
    }
  }
})

const vec3 = new Vector3()
