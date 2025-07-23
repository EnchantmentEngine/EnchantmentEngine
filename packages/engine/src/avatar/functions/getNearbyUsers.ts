import { NetworkObjectComponent } from '@ir-engine/ecs'
import { getComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { UserID } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { AvatarComponent } from '../../avatar/components/AvatarComponent'

type NearbyUser = { id: UserID; distance: number }

const compareDistance = (a: NearbyUser, b: NearbyUser) => a.distance - b.distance

const remoteAvatars = defineQuery([NetworkObjectComponent, AvatarComponent, TransformComponent])

export function getNearbyUsers(userId: UserID, nonChannelUserIds: UserID[]): Array<UserID> {
  const userAvatarEntity = AvatarComponent.getUserAvatarEntity(userId)
  if (!userAvatarEntity) return []
  const userPosition = getComponent(userAvatarEntity, TransformComponent).position
  if (!userPosition) return []
  const userDistances = [] as Array<{ id: UserID; distance: number }>
  for (const avatarEntity of remoteAvatars()) {
    if (userAvatarEntity === avatarEntity) continue
    const position = getComponent(avatarEntity, TransformComponent).position
    const ownerId = getComponent(avatarEntity, NetworkObjectComponent).ownerId
    userDistances.push({
      id: ownerId,
      distance: position.distanceTo(userPosition)
    })
  }
  return userDistances
    .filter((u) => nonChannelUserIds.indexOf(u.id) > -1)
    .sort(compareDistance)
    .map((u) => u.id)
}
