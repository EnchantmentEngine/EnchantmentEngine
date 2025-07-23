import { Quaternion, Vector3 } from 'three'

import { EntityUUID, UUIDComponent } from '@ir-engine/ecs'
import { getComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { UserID } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { SpawnPointComponent } from '../../scene/components/SpawnPointComponent'

export function getSpawnPoint(spawnPointNodeId: string, userId: UserID): { position: Vector3; rotation: Quaternion } {
  const entity = UUIDComponent.getEntityByUUID(spawnPointNodeId as EntityUUID)
  if (entity) {
    const spawnTransform = getComponent(entity, TransformComponent)
    const spawnComponent = getComponent(entity, SpawnPointComponent)
    if (!spawnComponent.permissionedUsers.length || spawnComponent.permissionedUsers.includes(userId)) {
      return {
        position: randomPositionCentered(spawnTransform.position, spawnTransform.scale),
        rotation: spawnTransform.rotation.clone()
      }
    }
  }
  return getRandomSpawnPoint(userId)
}
/**
 * Takes an origin point and scale to return a random point, within a retanglar area the size of the scale, with the origin in the center
 * @param origin
 * @param scale
 * @returns
 */
const randomPositionCentered = (origin: Vector3, scale: Vector3) => {
  const x = (Math.random() - 0.5) * scale.x + origin.x
  const z = (Math.random() - 0.5) * scale.z + origin.z
  return new Vector3(x, origin.y, z)
}

const spawnPointQuery = defineQuery([SpawnPointComponent, TransformComponent])

export function getRandomSpawnPoint(userId: UserID): { position: Vector3; rotation: Quaternion } {
  const spawnPoints = spawnPointQuery()
  const spawnPointForUser = spawnPoints.find((entity) =>
    getComponent(entity, SpawnPointComponent).permissionedUsers.includes(userId)
  )
  const entity = spawnPointForUser ?? spawnPoints[Math.round(Math.random() * (spawnPoints.length - 1))]
  if (entity) {
    const spawnTransform = getComponent(entity, TransformComponent)
    const worldPosition = TransformComponent.getWorldPosition(entity, new Vector3())
    return {
      position: randomPositionCentered(worldPosition, spawnTransform.scale),
      rotation: spawnTransform.rotation.clone()
    }
  }

  console.warn("Couldn't spawn entity at spawn point, no spawn points available")

  return {
    position: randomPositionCentered(new Vector3(2, 0, 2), new Vector3(1, 1, 1)),
    rotation: new Quaternion()
  }
}
