import { Not } from '@ir-engine/ecs'
import { Vector3 } from 'three'

import {
  defineQuery,
  defineSystem,
  getComponent,
  NetworkObjectAuthorityTag,
  setComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import { getState } from '@ir-engine/hyperflux'
import {
  RigidBodyComponent,
  RigidBodyFixedTagComponent
} from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { XRState } from '@ir-engine/spatial/src/xr/XRState'

import { getAncestorWithComponents } from '@ir-engine/ecs'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { SpawnPoseState } from '@ir-engine/spatial/src/transform/SpawnPoseState'
import { TransformDirtyUpdateSystem } from '@ir-engine/spatial/src/transform/systems/TransformSystem'
import { updateReferenceSpaceFromAvatarMovement } from '../../avatar/functions/moveAvatar'
import { SceneSettingsComponent } from '../components/SceneSettingsComponent'

const heightKillApplicableQuery = defineQuery([
  RigidBodyComponent,
  NetworkObjectAuthorityTag,
  Not(RigidBodyFixedTagComponent)
])

const settingsQuery = defineQuery([SceneSettingsComponent])
const tempVector = new Vector3()

const execute = () => {
  const settingsEntities = settingsQuery()
  const sceneKillHeights = settingsEntities.map((entity) => {
    return [
      getAncestorWithComponents(entity, [SceneComponent]),
      getComponent(entity, SceneSettingsComponent).sceneKillHeight
    ]
  })
  const killableEntities = heightKillApplicableQuery()
  const isCameraAttachedToAvatar = XRState.isCameraAttachedToAvatar

  for (const entity of killableEntities) {
    const sceneEntity = getAncestorWithComponents(entity, [SceneComponent])
    let sceneHeight = sceneKillHeights.find(([scene]) => scene === sceneEntity)?.[1]
    if (typeof sceneHeight !== 'number') sceneHeight = -100

    const rigidBodyPosition = getComponent(entity, RigidBodyComponent).position
    if (rigidBodyPosition.y < sceneHeight) {
      const uuid = UUIDComponent.get(entity)
      const spawnState = getState(SpawnPoseState)[uuid]

      // reset entity to it's spawn position
      setComponent(entity, TransformComponent, {
        position: spawnState?.spawnPosition,
        rotation: spawnState?.spawnRotation
      })
      TransformComponent.dirty[entity] = 1

      if (!isCameraAttachedToAvatar) continue

      //@TODO see if we can implicitly update the reference space when the avatar teleports
      updateReferenceSpaceFromAvatarMovement(
        entity,
        tempVector.subVectors(spawnState?.spawnPosition, rigidBodyPosition)
      )
    }
  }
}

export const SceneKillHeightSystem = defineSystem({
  uuid: 'ee.engine.SceneKillHeightSystem',
  insert: { before: TransformDirtyUpdateSystem },
  execute
})
