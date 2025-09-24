import { getComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'

import { TransformComponent } from '@ir-engine/spatial'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { teleportAvatar } from './moveAvatar'

export const respawnAvatar = (entity?: Entity) => {
  if (!entity) return
  const position = getComponent(entity, TransformComponent).position
  const controller = getComponent(entity, AvatarControllerComponent)
  controller.verticalVelocity = 0
  teleportAvatar(entity, position)
}
