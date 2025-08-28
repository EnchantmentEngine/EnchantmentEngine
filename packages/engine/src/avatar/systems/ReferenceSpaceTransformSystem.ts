import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { XRCameraUpdateSystem } from '@ir-engine/spatial/src/xr/XRCameraSystem'

import { AvatarComponent } from '../components/AvatarComponent'
import { moveAvatar, updateLocalAvatarRotation } from '../functions/moveAvatar'

const execute = () => {
  const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
  if (!selfAvatarEntity) return

  /**
   * 1 - Update local client movement
   */
  moveAvatar(selfAvatarEntity)
  updateLocalAvatarRotation(selfAvatarEntity)
  TransformComponent.computeTransformMatrix(selfAvatarEntity)
}

/**
 * This system is responsible for updating the local client avatar position and rotation, and updating the XR camera position.
 */
export const ReferenceSpaceTransformSystem = defineSystem({
  uuid: 'ee.engine.ReferenceSpaceTransformSystem',
  insert: { before: XRCameraUpdateSystem },
  execute
})
