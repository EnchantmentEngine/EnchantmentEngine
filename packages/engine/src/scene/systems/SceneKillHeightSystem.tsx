import { Not } from '@ir-engine/ecs'
import { Vector3 } from 'three'

import { defineQuery, defineSystem, getComponent, NetworkObjectAuthorityTag } from '@ir-engine/ecs'
import {
  RigidBodyComponent,
  RigidBodyFixedTagComponent
} from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { XRState } from '@ir-engine/spatial/src/xr/XRState'

import { getAncestorWithComponents } from '@ir-engine/ecs'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
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
  const shouldViewerFollowController = XRState.shouldViewerFollowController

  for (const entity of killableEntities) {
    const sceneEntity = getAncestorWithComponents(entity, [SceneComponent])
    let sceneHeight = sceneKillHeights.find(([scene]) => scene === sceneEntity)?.[1]
    if (typeof sceneHeight !== 'number') sceneHeight = -100

    const rigidBodyPosition = getComponent(entity, RigidBodyComponent).position
    if (rigidBodyPosition.y < sceneHeight) {
      // reset entity to it's spawn position by setting the transform dirty
      TransformComponent.dirty[entity] = 1

      if (!shouldViewerFollowController) continue

      const position = getComponent(entity, TransformComponent).position

      //@TODO see if we can implicitly update the reference space when the avatar teleports
      updateReferenceSpaceFromAvatarMovement(entity, tempVector.subVectors(position, rigidBodyPosition))
    }
  }
}

export const SceneKillHeightSystem = defineSystem({
  uuid: 'ee.engine.SceneKillHeightSystem',
  insert: { before: TransformDirtyUpdateSystem },
  execute
})
