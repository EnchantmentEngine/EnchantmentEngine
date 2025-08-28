import { UUIDComponent } from '@ir-engine/ecs'
import { getComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { getState } from '@ir-engine/hyperflux'

import { SpawnPoseState } from '@ir-engine/spatial/src/transform/SpawnPoseState'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { teleportAvatar } from './moveAvatar'

export const respawnAvatar = (entity?: Entity) => {
  if (!entity) return
  const { spawnPosition } = getState(SpawnPoseState)[UUIDComponent.get(entity)]
  const controller = getComponent(entity, AvatarControllerComponent)
  controller.verticalVelocity = 0
  teleportAvatar(entity, spawnPosition)
}
